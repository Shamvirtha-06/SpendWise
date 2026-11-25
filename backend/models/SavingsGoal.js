/**
 * ==========================================================================
 * SpendWise – Savings Goal Model
 * Technology: Mongoose
 * ==========================================================================
 * 
 * Stores financial milestones and savings targets.
 * Strictly linked to a specific user via the 'user' field.
 */

const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a savings goal name'],
      trim: true,
      maxlength: [80, 'Goal name cannot exceed 80 characters']
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please provide a target amount'],
      min: [0.01, 'Target amount must be greater than zero']
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Saved amount cannot be negative']
    },
    targetDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'Please provide a target milestone date']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [250, 'Description cannot exceed 250 characters']
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Virtual for 'id' to map _id to id for seamless frontend usage
savingsGoalSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

savingsGoalSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

savingsGoalSchema.set('toObject', {
  virtuals: true
});

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);

