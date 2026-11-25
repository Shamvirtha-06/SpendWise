/**
 * ==========================================================================
 * SpendWise – Route Input Validation Helpers (SEC-06)
 * ==========================================================================
 * 
 * Provides robust validation rules to ensure all API request inputs are strictly
 * verified before database queries or operations are executed.
 */

/**
 * Validates that an input is a genuine plain JSON object (not null, array, or primitive)
 */
const isPlainObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val);

/**
 * Validates that an input is a finite number strictly greater than zero (> 0)
 */
const isPositiveNumber = (val) => {
  if (typeof val === 'boolean' || val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return !isNaN(num) && Number.isFinite(num) && num > 0;
};

/**
 * Validates that an input is a finite non-negative number (>= 0)
 */
const isNonNegativeNumber = (val) => {
  if (typeof val === 'boolean' || val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return !isNaN(num) && Number.isFinite(num) && num >= 0;
};

/**
 * Validates that an input is a non-empty string within the specified length limit
 */
const isNonEmptyString = (val, max = 255) => {
  return typeof val === 'string' && val.trim().length > 0 && val.trim().length <= max;
};

/**
 * Validates that an input is a valid calendar date string (YYYY-MM-DD or standard parseable date)
 */
const isValidDateString = (val) => {
  if (typeof val !== 'string' || !val.trim()) return false;
  const trimmed = val.trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return false;
  const ts = Date.parse(trimmed);
  return !isNaN(ts);
};

/**
 * Protected server-managed fields that clients are strictly forbidden from supplying
 */
const PROTECTED_FIELDS = ['user', '_id', 'id', 'createdAt', 'updatedAt', '__v'];

/**
 * Checks if a request body contains any protected fields.
 * If found, responds immediately with HTTP 400 and returns false.
 */
const checkProtectedFields = (body, res) => {
  if (!isPlainObject(body)) return true;
  for (const field of PROTECTED_FIELDS) {
    if (body[field] !== undefined) {
      res.status(400).json({
        success: false,
        message: `Modifying protected field '${field}' is not allowed.`
      });
      return false;
    }
  }
  return true;
};

module.exports = {
  isPlainObject,
  isPositiveNumber,
  isNonNegativeNumber,
  isNonEmptyString,
  isValidDateString,
  checkProtectedFields,
  PROTECTED_FIELDS
};

