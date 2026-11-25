/**
 * ==============================================================================
 * SpendWise – Frontend Runtime Configuration (SEC-FIND-01)
 * ==============================================================================
 * 
 * Provides client-side runtime configuration for the SpendWise application.
 * 
 * PRODUCTION DEPLOYMENT (Render):
 * - Deployed Render Backend API URL: "https://spendwise-jq6f.onrender.com/api"
 * 
 * LOCAL DEVELOPMENT:
 * - Local Development Backend API URL: "http://localhost:5000/api"
 * 
 * RUNTIME BEHAVIOR:
 * - Production: Automatically targets the Render backend when deployed (e.g. Vercel).
 * - Development: Preserves local development backend when running on localhost / 127.0.0.1.
 * 
 * SECURITY RULES:
 * - In production, API_URL MUST use HTTPS (plain HTTP is only permitted for localhost/127.0.0.1).
 * - Ensure API_URL ends with "/api".
 * - NEVER place passwords, tokens, JWT secrets, or database credentials in this file.
 * ==============================================================================
 */

// Detect whether the client is running in a local development environment
const isLocalEnv = typeof window !== 'undefined' && Boolean(
  window.location && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:'
  )
);

window.SPENDWISE_CONFIG = {
  // Production Render API URL (active when deployed on Vercel or cloud hosts)
  // Local development URL (preserved when running on localhost / 127.0.0.1)
  // API_URL: "http://localhost:5000/api"
  API_URL: isLocalEnv
    ? "http://localhost:5000/api"
    : "https://spendwise-jq6f.onrender.com/api",

  // Explicit endpoints preserved for reference and testing
  PRODUCTION_API_URL: "https://spendwise-jq6f.onrender.com/api",
  DEVELOPMENT_API_URL: "http://localhost:5000/api"
};
