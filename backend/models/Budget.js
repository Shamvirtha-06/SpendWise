/**
 * ==========================================================================
 * SpendWise – Budget Model
 * Technology: Mongoose
 * ==========================================================================
 * 
 * Stores the user's monthly overall budget and category-wise spending limits.
 * Each user has a unique budget record identified by their user ID.
 */

const mongoose = require('mongoose');

const categoryBudgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Please provide an expense category'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a category budget amount'],
      min: [0.01, 'Category budget must be greater than zero']
    }
  },
  {
    timestamps: false
  }
);

// Virtual for id on category budget subdocument
categoryBudgetSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
categoryBudgetSchema.set('toJSON', { virtuals: true });
categoryBudgetSchema.set('toObject', { virtuals: true });

const budgetSchema = new mongoose.Schema(
  {
    // One budget profile per user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    // Overall monthly budget limit
    overallMonthly: {
      type: Number,
      default: 0,
      min: [0, 'Overall budget cannot be negative']
    },
    // Category-specific budget limits
    categoryBudgets: [categoryBudgetSchema]
  },
  {
    timestamps: true
  }
);

// Virtual for id on budget document
budgetSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

budgetSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);

