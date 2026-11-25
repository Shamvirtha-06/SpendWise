/**
 * ==========================================================================
 * SpendWise – Savings Goal Routes (Protected)
 * Technology: Express.js & Mongoose
 * ==========================================================================
 * Endpoints:
 *   GET    /api/goals                  – Get all savings goals for the logged-in user
 *   POST   /api/goals                  – Create a new savings goal
 *   PUT    /api/goals/:id              – Update an existing savings goal (ownership verified)
 *   PATCH  /api/goals/:id              – Partial update for savings goal (ownership verified)
 *   PATCH  /api/goals/:id/add-savings  – Add savings deposit to a goal (ownership verified)
 *   PATCH  /api/goals/:id/deposit      – Add savings deposit (alias for backwards compatibility)
 *   DELETE /api/goals/:id              – Delete a savings goal (ownership verified)
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SavingsGoal = require('../models/SavingsGoal');
const { protect } = require('../middleware/auth');
const {
  isPlainObject,
  isPositiveNumber,
  isNonNegativeNumber,
  isNonEmptyString,
  isValidDateString,
  checkProtectedFields
} = require('../middleware/validator');

// Environment check: only disclose raw error message in development mode
const isDev = process.env.NODE_ENV !== 'production';

// All savings goal routes require user authentication
router.use(protect);

/**
 * @route   GET /api/goals
 * @desc    Get all savings goals belonging to the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    console.error('Fetch Goals Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve savings goals.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   GET /api/goals/:id
 * @desc    Get a single savings goal by ID (ownership verified)
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid savings goal ID format.'
      });
    }

    // Direct ownership-filtered query (SEC-05) prevents ID enumeration / resource probing
    const goal = await SavingsGoal.findOne({ _id: id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Fetch Goal By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve savings goal.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   POST /api/goals
 * @desc    Create a new savings goal
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    if (!isPlainObject(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected a JSON object.'
      });
    }

    if (!checkProtectedFields(req.body, res)) return;

    const { name, targetAmount, savedAmount, targetDate, description } = req.body;

    if (!isNonEmptyString(name, 80)) {
      return res.status(400).json({
        success: false,
        message: 'Goal name must be a non-empty string up to 80 characters.'
      });
    }

    if (!isPositiveNumber(targetAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be a finite number greater than zero.'
      });
    }

    const cleanTarget = Math.round(Number(targetAmount) * 100) / 100;
    let cleanSaved = 0;

    if (savedAmount !== undefined && savedAmount !== null && savedAmount !== '') {
      if (!isNonNegativeNumber(savedAmount)) {
        return res.status(400).json({
          success: false,
          message: 'Saved amount must be a finite non-negative number.'
        });
      }
      cleanSaved = Math.round(Number(savedAmount) * 100) / 100;
      if (cleanSaved > cleanTarget) {
        return res.status(400).json({
          success: false,
          message: 'Saved amount cannot exceed target amount.'
        });
      }
    }

    if (!isValidDateString(targetDate)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid target milestone date in YYYY-MM-DD format.'
      });
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Description must be a string.'
      });
    }

    if (typeof description === 'string' && description.length > 250) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 250 characters.'
      });
    }

    const isCompleted = cleanSaved >= cleanTarget;

    const goal = await SavingsGoal.create({
      user: req.user.id,
      name: name.trim(),
      targetAmount: cleanTarget,
      savedAmount: cleanSaved,
      targetDate: targetDate.trim(),
      description: (description || '').trim(),
      isCompleted,
      completedAt: isCompleted ? new Date() : null
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully!',
      data: goal
    });
  } catch (error) {
    console.error('Create Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create savings goal.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   PUT /api/goals/:id
 * @route   PATCH /api/goals/:id
 * @desc    Update an existing savings goal (ownership verified)
 * @access  Private
 */
const updateGoalHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid savings goal ID format.'
      });
    }

    if (!isPlainObject(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected a JSON object.'
      });
    }

    if (!checkProtectedFields(req.body, res)) return;

    const { name, targetAmount, savedAmount, targetDate, description } = req.body;

    if (
      name === undefined &&
      targetAmount === undefined &&
      savedAmount === undefined &&
      targetDate === undefined &&
      description === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one valid field to update.'
      });
    }

    if (name !== undefined && !isNonEmptyString(name, 80)) {
      return res.status(400).json({
        success: false,
        message: 'Goal name must be a non-empty string up to 80 characters.'
      });
    }

    if (targetAmount !== undefined && !isPositiveNumber(targetAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be a finite number greater than zero.'
      });
    }

    if (savedAmount !== undefined && !isNonNegativeNumber(savedAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Saved amount must be a finite non-negative number.'
      });
    }

    if (targetDate !== undefined && !isValidDateString(targetDate)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid target milestone date in YYYY-MM-DD format.'
      });
    }

    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Description must be a string.'
      });
    }

    if (typeof description === 'string' && description.length > 250) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 250 characters.'
      });
    }

    // Direct ownership-filtered query (SEC-05) prevents ID enumeration / resource probing
    const goal = await SavingsGoal.findOne({ _id: id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.'
      });
    }

    const newTarget = targetAmount !== undefined ? Math.round(Number(targetAmount) * 100) / 100 : goal.targetAmount;
    const newSaved = savedAmount !== undefined ? Math.round(Number(savedAmount) * 100) / 100 : goal.savedAmount;

    if (newSaved > newTarget) {
      return res.status(400).json({
        success: false,
        message: 'Saved amount cannot exceed target amount.'
      });
    }

    if (name !== undefined) goal.name = name.trim();
    if (targetAmount !== undefined) goal.targetAmount = newTarget;
    if (savedAmount !== undefined) goal.savedAmount = newSaved;
    if (targetDate !== undefined) goal.targetDate = targetDate.trim();
    if (description !== undefined) goal.description = description.trim();

    goal.isCompleted = goal.savedAmount >= goal.targetAmount;
    if (goal.isCompleted && !goal.completedAt) {
      goal.completedAt = new Date();
    } else if (!goal.isCompleted) {
      goal.completedAt = null;
    }

    const updated = await goal.save();

    res.status(200).json({
      success: true,
      message: 'Savings goal updated successfully!',
      data: updated
    });
  } catch (error) {
    console.error('Update Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update savings goal.',
      ...(isDev && { error: error.message })
    });
  }
};

router.put('/:id', updateGoalHandler);
router.patch('/:id', updateGoalHandler);

/**
 * @route   PATCH /api/goals/:id/add-savings
 * @route   PATCH /api/goals/:id/deposit
 * @desc    Add savings deposit to a goal (ownership verified)
 * @access  Private
 */
const addSavingsHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid savings goal ID format.'
      });
    }

    if (!isPlainObject(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected a JSON object.'
      });
    }

    if (!checkProtectedFields(req.body, res)) return;

    const rawAmount =
      req.body.amount !== undefined
        ? req.body.amount
        : req.body.depositAmount !== undefined
        ? req.body.depositAmount
        : req.body.addAmount;

    if (!isPositiveNumber(rawAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Deposit amount must be a finite number greater than zero.'
      });
    }

    const depositAmount = Math.round(Number(rawAmount) * 100) / 100;

    // Direct ownership-filtered query (SEC-05) prevents ID enumeration / resource probing
    const goal = await SavingsGoal.findOne({ _id: id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.'
      });
    }

    const remainingNeeded = Math.round((goal.targetAmount - goal.savedAmount) * 100) / 100;
    if (depositAmount > remainingNeeded) {
      return res.status(400).json({
        success: false,
        message: `Deposit amount exceeds remaining balance needed (₹${remainingNeeded}).`
      });
    }

    goal.savedAmount = Math.round((goal.savedAmount + depositAmount) * 100) / 100;

    if (goal.savedAmount >= goal.targetAmount) {
      goal.savedAmount = goal.targetAmount;
      goal.isCompleted = true;
      goal.completedAt = new Date();
    }

    const updated = await goal.save();

    res.status(200).json({
      success: true,
      message: goal.isCompleted
        ? `🎉 Congratulations! You achieved your savings goal "${goal.name}"!`
        : `Added deposit successfully to "${goal.name}".`,
      data: updated
    });
  } catch (error) {
    console.error('Deposit Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deposit savings.',
      ...(isDev && { error: error.message })
    });
  }
};

router.patch('/:id/add-savings', addSavingsHandler);
router.patch('/:id/deposit', addSavingsHandler);

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete a savings goal (ownership verified)
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid savings goal ID format.'
      });
    }

    // Direct ownership-filtered query (SEC-05) prevents ID enumeration / resource probing
    const goal = await SavingsGoal.findOne({ _id: id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.'
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Savings goal deleted successfully!'
    });
  } catch (error) {
    console.error('Delete Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete savings goal.',
      ...(isDev && { error: error.message })
    });
  }
});

module.exports = router;
