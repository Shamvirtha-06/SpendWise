/**
 * ==========================================================================
 * SpendWise – Backend Server
 * Technology: Node.js & Express.js with MongoDB Atlas (Mongoose)
 * ==========================================================================
 * 
 * Main entry point for the SpendWise Backend API.
 * Configures Express, loads environment variables, connects to MongoDB,
 * registers middlewares, and mounts modular API routes.
 */
// 1. Load environment variables from .env file before anything else
require('dotenv').config();

// 2. Configure DNS (SEC-FIND-04: Cloud-Safe Conditional DNS Configuration)
// In production, strictly retain operating system / cloud VPC DNS resolvers.
// In development, allow an explicit opt-in override for local Windows/router SRV lookup issues.
const isProduction = process.env.NODE_ENV === 'production';

if (process.env.USE_CUSTOM_DNS !== undefined && process.env.USE_CUSTOM_DNS !== null && process.env.USE_CUSTOM_DNS.trim() !== '') {
  const rawCustomDNS = process.env.USE_CUSTOM_DNS.trim();
  const lowerCustomDNS = rawCustomDNS.toLowerCase();

  // Validate allowed values: 'true', 'false', '1', '0'
  if (lowerCustomDNS !== 'true' && lowerCustomDNS !== 'false' && lowerCustomDNS !== '1' && lowerCustomDNS !== '0') {
    console.error(`\n❌ [FATAL CONFIGURATION ERROR]: Invalid USE_CUSTOM_DNS value: "${rawCustomDNS}".`);
    console.error('👉 Supported values: "true", "false", "1", "0" (or leave unset to use system DNS).\n');
    process.exit(1);
  }

  const isCustomDNSEnabled = lowerCustomDNS === 'true' || lowerCustomDNS === '1';

  if (isProduction) {
    if (isCustomDNSEnabled) {
      console.warn('⚠️  [DNS Warning]: USE_CUSTOM_DNS is ignored in production mode to protect cloud VPC resolvers.');
    }
  } else {
    if (isCustomDNSEnabled) {
      const dns = require('dns');
      dns.setServers(['8.8.8.8', '8.8.4.4']);
      console.log('ℹ️  [DNS Notice]: Custom DNS servers enabled for local development (8.8.8.8, 8.8.4.4)');
    }
  }
}

// 3. Validate essential security configuration
if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
  console.error('\n❌ [FATAL SECURITY ERROR]: JWT_SECRET is missing or empty in environment variables.');
  console.error('👉 The SpendWise backend server cannot start without a secure JWT_SECRET.');
  console.error('👉 Please define JWT_SECRET in your backend/.env file and restart the server.\n');
  process.exit(1);
}

// 4. Import core libraries & local modules
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB, getDBStatus } = require('./config/db');

// Import modular API route handlers
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');

// ==========================================================================
// CONFIGURATION & INPUT VALIDATION HELPERS
// ==========================================================================

/**
 * Helper function: Validate if an origin string is a well-formed HTTP/HTTPS origin
 * Must have protocol 'http:' or 'https:', no path other than empty or '/', and no search/hash.
 * @param {string} originStr - The origin URL string to validate
 * @returns {boolean} True if valid origin, false otherwise
 */
const isValidOrigin = (originStr) => {
  if (typeof originStr !== 'string' || !originStr.trim()) return false;
  try {
    const parsed = new URL(originStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    if (parsed.pathname !== '/' && parsed.pathname !== '') {
      return false;
    }
    if (parsed.search || parsed.hash) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

// 3. Initialize the Express application
const app = express();

// --- PROXY CONFIGURATION (SEC-FIND-03: Secure TRUST_PROXY Configuration) ---
// Only trust reverse proxies when explicitly configured in environment variables.
// Avoids blindly trusting forwarded headers which could allow IP spoofing & rate limit bypasses.
if (process.env.TRUST_PROXY && process.env.TRUST_PROXY.trim()) {
  const rawProxy = process.env.TRUST_PROXY.trim();
  const lowerProxy = rawProxy.toLowerCase();

  if (lowerProxy === 'true' || lowerProxy === '1') {
    // Exactly 1 upstream proxy hop (Render, Railway, Heroku, standard AWS ALB)
    app.set('trust proxy', 1);
  } else if (lowerProxy === 'false' || lowerProxy === '0') {
    // Explicitly disabled
    app.set('trust proxy', false);
  } else if (/^\d+$/.test(rawProxy)) {
    // Explicit integer hop count (e.g. 2 for Cloudflare CDN + Load Balancer)
    const hops = parseInt(rawProxy, 10);
    if (hops >= 0) {
      app.set('trust proxy', hops);
    } else {
      console.error(`\n❌ [FATAL CONFIGURATION ERROR]: Invalid TRUST_PROXY value: "${rawProxy}" (hop count must be non-negative).`);
      process.exit(1);
    }
  } else {
    // Validate Express-supported named presets, IP addresses, or CIDRs
    const namedPresets = ['loopback', 'linklocal', 'uniquelocal'];
    const parts = rawProxy.split(',').map((p) => p.trim()).filter(Boolean);

    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
    const ipv6Regex = /^([a-fA-F0-9:]+)(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/;

    const isValidPart = (part) => {
      const pLower = part.toLowerCase();
      if (namedPresets.includes(pLower)) return true;
      if (ipv4Regex.test(part)) {
        const ipOnly = part.split('/')[0];
        const octets = ipOnly.split('.').map(Number);
        return octets.every((o) => o >= 0 && o <= 255);
      }
      if (ipv6Regex.test(part) && part.includes(':')) return true;
      return false;
    };

    if (parts.length > 0 && parts.every(isValidPart)) {
      app.set('trust proxy', rawProxy);
    } else {
      console.error(`\n❌ [FATAL CONFIGURATION ERROR]: Invalid TRUST_PROXY value: "${rawProxy}".`);
      console.error('👉 Supported values: "true", "false", positive integer hop count (e.g. "1", "2"),');
      console.error('👉 or Express-supported presets: "loopback", "linklocal", "uniquelocal", IP, or CIDR (e.g. "10.0.0.0/8").\n');
      process.exit(1);
    }
  }
}

// 4. Define the server port (from .env or default 5000)
const PORT = process.env.PORT || 5000;

// ==========================================================================
// CONNECT TO MONGODB ATLAS
// ==========================================================================
connectDB();

// ==========================================================================
// MIDDLEWARES
// ==========================================================================

// --- SECURITY HEADERS (SEC-09: Helmet Configuration) ---
// Configures defensive HTTP headers for all API responses
app.use(
  helmet({
    // Content-Security-Policy is enforced at the frontend HTML document layer via <meta> tag.
    // Disable Helmet's default HTML-centric CSP on this pure JSON API backend to avoid conflicts with JSON responses.
    contentSecurityPolicy: false,

    // Prevent MIME-type sniffing (X-Content-Type-Options: nosniff)
    xContentTypeOptions: true,

    // Prevent clickjacking / framing on API endpoints (X-Frame-Options: DENY)
    xFrameOptions: { action: 'deny' },

    // Control Referer header privacy (Referrer-Policy: strict-origin-when-cross-origin)
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // Allow cross-origin requests from decoupled frontend origins to consume API resources
    crossOriginResourcePolicy: { policy: 'cross-origin' },

    // HTTP Strict Transport Security: enforce HTTPS strictly in production environments only
    hsts: process.env.NODE_ENV === 'production'
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false
  })
);

// --- CORS CONFIGURATION (SEC-04 & SEC-FIND-05: Environment-Specific Origin Allowlist) ---
const allowedOrigins = [];

if (isProduction) {
  // Production Mode: Strictly require and validate FRONTEND_URL. No localhost or 'null' origins permitted.
  if (!process.env.FRONTEND_URL || !process.env.FRONTEND_URL.trim()) {
    console.error('\n❌ [FATAL CONFIGURATION ERROR]: FRONTEND_URL is required in production mode (NODE_ENV=production).');
    console.error('👉 The SpendWise backend server cannot start in production without a trusted frontend origin.');
    console.error('👉 Please define FRONTEND_URL (e.g. "https://spendwise.example.com") in your environment variables.\n');
    process.exit(1);
  }

  const rawOrigins = process.env.FRONTEND_URL.split(',').map((o) => o.trim()).filter(Boolean);
  if (rawOrigins.length === 0) {
    console.error('\n❌ [FATAL CONFIGURATION ERROR]: FRONTEND_URL contains no valid origins.');
    process.exit(1);
  }

  for (const rawOrigin of rawOrigins) {
    const normalized = rawOrigin.replace(/\/+$/, '');
    if (!isValidOrigin(normalized)) {
      console.error(`\n❌ [FATAL CONFIGURATION ERROR]: Invalid origin specified in FRONTEND_URL: "${rawOrigin}"`);
      console.error('👉 Origins must be valid HTTP/HTTPS URLs without paths or queries (e.g. "https://spendwise.example.com").\n');
      process.exit(1);
    }
    allowedOrigins.push(normalized);
  }
} else {
  // Development Mode: Allow standard local development origins and null (for direct local file:// browser access)
  const devLocalOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'null'
  ];
  allowedOrigins.push(...devLocalOrigins);

  // If FRONTEND_URL is provided in development, validate and append it
  if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim()) {
    const customOrigins = process.env.FRONTEND_URL.split(',')
      .map((origin) => origin.trim().replace(/\/+$/, ''))
      .filter(Boolean);
    for (const customOrigin of customOrigins) {
      if (isValidOrigin(customOrigin)) {
        allowedOrigins.push(customOrigin);
      }
    }
  }
}

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow requests without an Origin header (curl, Postman, mobile apps, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.trim().replace(/\/+$/, '');

    // 2. Allow if origin matches trusted allowlist
    if (allowedOrigins.includes(origin) || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // 3. Reject untrusted browser origins
    const corsError = new Error(`CORS policy rejection: Origin ${origin} is not allowed.`);
    corsError.status = 403;
    return callback(corsError);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

// Mount CORS middleware with explicit origin allowlist
app.use(cors(corsOptions));

// Enable JSON parsing middleware
// Allows the server to accept and parse JSON request bodies (req.body)
app.use(express.json());

// ==========================================================================
// PUBLIC & HEALTH CHECK ROUTES
// ==========================================================================

/**
 * Root Route: GET /
 * Simple landing check when visiting the server in a browser
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SpendWise API is running'
  });
});

/**
 * Health Check Endpoint: GET /api/health (SEC-10)
 * Returns minimal operational status without leaking internal infrastructure details
 */
app.get('/api/health', (req, res) => {
  try {
    const db = getDBStatus();
    if (!db.isConnected) {
      console.warn(`⚠️ [Health Check Warning]: Database is disconnected (readyState: ${db.readyState})`);
      return res.status(503).json({
        success: false,
        status: 'error'
      });
    }

    res.status(200).json({
      success: true,
      status: 'ok'
    });
  } catch (error) {
    console.error('⚠️ [Health Check Error]:', error.message);
    res.status(500).json({
      success: false,
      status: 'error'
    });
  }
});

// ==========================================================================
// MOUNT MODULAR API ROUTES
// ==========================================================================

// Authentication (Register, Login, Me)
app.use('/api/auth', authRoutes);

// Private User Data (Transactions, Budgets, Savings Goals)
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);

// ==========================================================================
// 404 NOT FOUND HANDLER
// ==========================================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`
  });
});

// ==========================================================================
// CENTRALIZED ERROR HANDLING MIDDLEWARE (Including CORS Rejections)
// ==========================================================================
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS policy rejection')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied by CORS policy. Untrusted origin.'
    });
  }

  console.error('Unhandled Application Error:', err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    success: false,
    message: isDev ? err.message : 'Internal server error. Please try again later.',
    ...(isDev && { error: err.message })
  });
});

// ==========================================================================
// PROCESS ERROR GUARDS
// ==========================================================================
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});

// ==========================================================================
// START THE SERVER
// ==========================================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('==================================================');
  console.log(`🚀 SpendWise Backend Server is running!`);
  console.log(`📡 Local URL: http://localhost:${PORT}`);
  console.log(`🩺 Health & DB Status: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth/register & /login`);
  console.log('==================================================');
});
