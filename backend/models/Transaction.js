/**
 * ==========================================================================
 * SpendWise – Transaction Model
 * Technology: Mongoose
 * ==========================================================================
 * 
 * Represents an Income or Expense transaction.
 * Strictly linked to a specific user via the 'user' field (ObjectId reference).
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // User association ensures data isolation between accounts
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a transaction description'],
      trim: true,
      maxlength: [100, 'Description cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a transaction amount'],
      min: [0.01, 'Amount must be greater than zero']
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Transaction type must be either income or expense'
      },
      required: [true, 'Please select a transaction type']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true
    },
    date: {
      type: String, // Stored as ISO YYYY-MM-DD for fast filtering & sorting
      required: [true, 'Please select a date']
    }
  },
  {
    timestamps: true
  }
);

// Virtual for 'id' to map _id to id for seamless frontend usage
transactionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

transactionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

transactionSchema.set('toObject', {
  virtuals: true
});

module.exports = mongoose.model('Transaction', transactionSchema);

