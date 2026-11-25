/**
 * ==========================================================================
 * SpendWise – User Model
 * Technology: Mongoose & bcryptjs
 * ==========================================================================
 * 
 * Represents a registered user in SpendWise.
 * 
 * Security Features:
 * 1. Password hashing with bcrypt before saving to the database.
 * 2. Plain-text passwords are NEVER stored in MongoDB.
 * 3. The password field is excluded (select: false) by default in queries.
 * 4. Includes a secure matchPassword helper method for login verification.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Excluded by default for data privacy and security
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // Automatically creates createdAt and updatedAt fields
  }
);

/**
 * Pre-Save Mongoose Hook:
 * Automatically hashes the password using bcrypt before persisting to MongoDB.
 * Only runs if the password field was modified or newly created.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});
/**
 * Helper Method: matchPassword
 * Securely compares an entered plain-text password with the stored bcrypt hash.
 * @param {string} enteredPassword - Password entered by user during login
 * @returns {Promise<boolean>} True if match, false otherwise
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

