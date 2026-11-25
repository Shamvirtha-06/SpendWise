/**
 * ==========================================================================
 * SpendWise – Database Connection Module
 * Technology: Mongoose (MongoDB ODM)
 * ==========================================================================
 * 
 * This module manages the connection between the Express backend server
 * and MongoDB Atlas (or local MongoDB).
 * 
 * Key Features:
 * 1. Reads connection URI securely from environment variables (.env).
 * 2. Never exposes credentials to frontend code.
 * 3. Provides live connection status checks (readyState).
 * 4. Gracefully handles missing credentials or connection errors without crashing.
 * 5. Sanitizes error logging to eliminate credential disclosure (SEC-FIND-08).
 */

const mongoose = require('mongoose');

/**
 * Returns current database connection status (SEC-10: sanitized, no infrastructure leakage)
 * 0 = Disconnected, 1 = Connected, 2 = Connecting, 3 = Disconnecting
 */
const getDBStatus = () => {
  const state = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    status: statusMap[state] || 'unknown',
    readyState: state,
    isConnected: state === 1
  };
};

/**
 * Maps database errors to safe, predefined diagnostic categories.
 * Prevents raw driver messages from leaking sensitive URIs, passwords, or schema details (SEC-FIND-08).
 * 
 * @param {Error|any} error - The error object to categorize
 * @returns {string} Safe diagnostic category description
 */
const getDiagnosticCategory = (error) => {
  if (!error || typeof error !== 'object') {
    return 'Unknown Error';
  }

  const name = error.name || '';
  const code = error.code;
  const codeName = error.codeName || '';

  // 1. Specific network & socket codes (more specific than generic MongoNetworkError)
  if (code === 'ENOTFOUND' || code === 'EDNS') {
    return 'DNS Host Resolution Failure';
  }
  if (code === 'ECONNREFUSED') {
    return 'Connection Refused (Server unreachable)';
  }
  if (code === 'ECONNRESET') {
    return 'Connection Reset by Peer';
  }

  // 2. Specific authentication & authorization codes
  if (code === 18 || codeName === 'AuthenticationFailed') {
    return 'Database Authentication Failure';
  }
  if (code === 13 || codeName === 'Unauthorized') {
    return 'Database Authorization / Permission Denied';
  }

  // 3. Topology & Server Selection timeout
  if (name === 'MongooseServerSelectionError') {
    return 'Server Selection / Topology Discovery Timeout';
  }

  // 4. Socket timeout & Network error classes
  if (code === 'ETIMEDOUT' || name === 'MongoNetworkTimeoutError') {
    return 'Network / Socket Connection Timeout';
  }
  if (name === 'MongoNetworkError') {
    return 'Network Communication Failure';
  }

  // 5. Configuration & parsing
  if (name === 'MongoParseError') {
    return 'Connection String / URI Parsing Error';
  }
  if (name === 'MongoSecurityError' || name === 'MongoCryptError') {
    return 'Database Security / Encryption Error';
  }

  // 6. Mongoose schema, validation, and query errors
  if (name === 'CastError') {
    return 'Database Query Cast Error';
  }
  if (name === 'ValidationError') {
    return 'Data Validation Error';
  }
  if (code === 11000 || codeName === 'DuplicateKey') {
    return 'Duplicate Key Constraint Violation';
  }

  if (name === 'MongoServerError') {
    return 'Database Server Engine Error';
  }

  return 'Database Operation Failure';
};

// Register error listener on the connection to prevent unhandled EventEmitter error crashes (SEC-FIND-08)
mongoose.connection.on('error', (err) => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    console.error('Database connection event error.');
  } else {
    const category = getDiagnosticCategory(err);
    const errClass = err?.name || 'Error';
    const errCode = err?.code || 'N/A';
    const dbState = getDBStatus().status;
    console.error(`⚠️ Mongoose connection event error [${errClass}]: ${category} (Code: ${errCode}, State: ${dbState})`);
  }
});

/**
 * Establishes connection to MongoDB Atlas using Mongoose
 */
const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoURI = process.env.MONGO_URI;

  // 1. Guard check: Check if MONGO_URI is defined
  if (!mongoURI) {
    if (isProduction) {
      console.warn('Database configuration warning: MONGO_URI is not configured.');
    } else {
      console.warn('\n⚠️  [MongoDB Warning]: MONGO_URI is not set in backend/.env.');
      console.warn('👉 Please create or update backend/.env with your MongoDB Atlas connection string.');
      console.warn('ℹ️  The backend server will run in standalone mode until MongoDB is connected.\n');
    }
    return false;
  }

  // 2. Check for placeholder username/password in URI
  if (mongoURI.includes('<username>') || mongoURI.includes('<password>')) {
    if (isProduction) {
      console.warn('Database configuration warning: MONGO_URI contains placeholder credentials.');
    } else {
      console.warn('\n⚠️  [MongoDB Warning]: MONGO_URI contains placeholder credentials (<username> or <password>).');
      console.warn('👉 Open backend/.env and replace <username> and <password> with your actual MongoDB Atlas credentials.');
      console.warn('ℹ️  The backend server is running and waiting for valid database credentials.\n');
    }
    return false;
  }

  try {
    if (!isProduction) {
      console.log('🔄 Connecting to MongoDB Atlas...');
    }
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout for friendly error reporting
    });

    if (isProduction) {
      // Production: Minimal generic confirmation without infrastructure or schema disclosure (SEC-FIND-08)
      console.log('Database connected successfully.');
    } else {
      // Development: Useful connection confirmation and diagnostics for local troubleshooting
      console.log('==================================================');
      console.log('✅ MongoDB Connected Successfully!');
      console.log(`🌐 Database Host: ${conn.connection.host}`);
      console.log(`📁 Database Name: ${conn.connection.name}`);
      console.log('==================================================');
    }
    return true;
  } catch (error) {
    if (isProduction) {
      // Production: Generic connection failure message (SEC-FIND-08)
      console.error('Database connection failed.');
    } else {
      // Development: Retain useful sanitized diagnostics without raw messages or credentials (SEC-FIND-08)
      const errClass = error?.name || 'Error';
      const errCode = error?.code || 'N/A';
      const category = getDiagnosticCategory(error);
      const dbState = getDBStatus().status;

      console.error('❌ MongoDB Connection Error');
      console.error('Error Class:', errClass);
      console.error('Error Code:', errCode);
      console.error('Connection State:', dbState);
      console.error('Diagnostic Category:', category);

      if (error.reason?.servers) {
        console.log('Replica Set Diagnostics:');
        for (const [address, server] of error.reason.servers) {
          const sanitizedAddress = typeof address === 'string' ? address.replace(/^.*@/, '') : 'unknown';
          const sErr = server.error;
          const sCategory = sErr ? getDiagnosticCategory(sErr) : 'No error reported';
          const sCode = sErr?.code || 'N/A';
          const sClass = sErr?.name || (sErr ? 'Error' : 'OK');
          console.log(`  - Server: ${sanitizedAddress} | Class: ${sClass} | Code: ${sCode} | Category: ${sCategory}`);
        }
      }
    }

    return false;
  }
};

module.exports = { connectDB, getDBStatus, getDiagnosticCategory };
