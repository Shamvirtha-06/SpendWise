/**
 * ==============================================================================
 * SpendWise – Frontend Runtime Configuration (SEC-FIND-01)
 * ==============================================================================
 * 
 * Provides client-side runtime configuration for the SpendWise application.
 * 
 * LOCAL DEVELOPMENT:
 * - Default setting points to the local Express backend API: "http://localhost:5000/api".
 * 
 * PRODUCTION DEPLOYMENT:
 * - Before deploying to production (e.g. Netlify, Vercel, GitHub Pages, AWS S3/CloudFront):
 *   Change API_URL to your deployed HTTPS backend API URL:
 *   Example: API_URL: "https://spendwise-api.onrender.com/api"
 * 
 * SECURITY RULES:
 * - In production, API_URL MUST use HTTPS (plain HTTP is only permitted for localhost/127.0.0.1).
 * - Ensure API_URL ends with "/api".
 * - NEVER place passwords, tokens, JWT secrets, or database credentials in this file.
 * ==============================================================================
 */

window.SPENDWISE_CONFIG = {
  API_URL: "http://localhost:5000/api"
};

