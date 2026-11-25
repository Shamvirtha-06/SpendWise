/**
 * ==========================================================================
 * SpendWise – Transaction Routes (Protected)
 * Endpoints:
 *   GET    /api/transactions      – Get all transactions for the logged-in user
 *   POST   /api/transactions      – Create a new transaction
 *   PUT    /api/transactions/:id  – Update an existing transaction (ownership verified)
 *   DELETE /api/transactions/:id  – Delete an existing transaction (ownership verified)
 *   POST   /api/transactions/sync – Bulk sync transactions from localStorage
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const {
  isPlainObject,
  isPositiveNumber,
  isNonEmptyString,
  isValidDateString,
  checkProtectedFields
} = require('../middleware/validator');

// Environment check: only disclose raw error message in development mode
const isDev = process.env.NODE_ENV !== 'production';

// All transaction routes require authentication
router.use(protect);

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions belonging to authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Fetch Transactions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get a single transaction by ID (ownership verified)
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format.'
      });
    }

    // Direct ownership-filtered query (SEC-05) prevents ID enumeration
    const transaction = await Transaction.findOne({ _id: id, user: req.user.id });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Fetch Transaction By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
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

    const { description, amount, type, category, date } = req.body;

    if (!isNonEmptyString(description, 100)) {
      return res.status(400).json({
        success: false,
        message: 'Description must be a non-empty string up to 100 characters.'
      });
    }

    if (!isPositiveNumber(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a finite number greater than zero.'
      });
    }

    if (typeof type !== 'string' || !['income', 'expense'].includes(type.toLowerCase().trim())) {
      return res.status(400).json({
        success: false,
        message: "Transaction type must be either 'income' or 'expense'."
      });
    }

    if (!isNonEmptyString(category, 50)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be a non-empty string up to 50 characters.'
      });
    }

    if (!isValidDateString(date)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid transaction date in YYYY-MM-DD format.'
      });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      description: description.trim(),
      amount: Math.round(Number(amount) * 100) / 100,
      type: type.toLowerCase().trim(),
      category: category.trim(),
      date: date.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Transaction saved successfully!',
      data: transaction
    });
  } catch (error) {
    console.error('Create Transaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   PUT /api/transactions/:id
 * @route   PATCH /api/transactions/:id
 * @desc    Update a transaction (only if owned by current user)
 * @access  Private
 */
const updateTransactionHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format.'
      });
    }

    if (!isPlainObject(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected a JSON object.'
      });
    }

    if (!checkProtectedFields(req.body, res)) return;

    const { description, amount, type, category, date } = req.body;

    if (
      description === undefined &&
      amount === undefined &&
      type === undefined &&
      category === undefined &&
      date === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one valid field to update.'
      });
    }

    if (description !== undefined && !isNonEmptyString(description, 100)) {
      return res.status(400).json({
        success: false,
        message: 'Description must be a non-empty string up to 100 characters.'
      });
    }

    if (amount !== undefined && !isPositiveNumber(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a finite number greater than zero.'
      });
    }

    if (type !== undefined && (typeof type !== 'string' || !['income', 'expense'].includes(type.toLowerCase().trim()))) {
      return res.status(400).json({
        success: false,
        message: "Transaction type must be either 'income' or 'expense'."
      });
    }

    if (category !== undefined && !isNonEmptyString(category, 50)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be a non-empty string up to 50 characters.'
      });
    }

    if (date !== undefined && !isValidDateString(date)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid transaction date in YYYY-MM-DD format.'
      });
    }

    // Direct ownership-filtered query (SEC-05) prevents ID enumeration / resource probing
    const transaction = await Transaction.findOne({ _id: id, user: req.user.id });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    if (description !== undefined) transaction.description = description.trim();
    if (amount !== undefined) transaction.amount = Math.round(Number(amount) * 100) / 100;
    if (type !== undefined) transaction.type = type.toLowerCase().trim();
    if (category !== undefined) transaction.category = category.trim();
    if (date !== undefined) transaction.date = date.trim();

    const updated = await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully!',
      data: updated
    });
  } catch (error) {
    console.error('Update Transaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction.',
      ...(isDev && { error: error.message })
    });
  }
};

router.put('/:id', updateTransactionHandler);
router.patch('/:id', updateTransactionHandler);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a transaction (only if owned by current user)
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format.'
      });
    }

    // Direct ownership-filtered query (SEC-05) prevents ID enumeration / resource probing
    const transaction = await Transaction.findOne({ _id: id, user: req.user.id });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully!'
    });
  } catch (error) {
    console.error('Delete Transaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   POST /api/transactions/sync
 * @desc    Batch sync transactions from frontend localStorage
 * @access  Private
 */
router.post('/sync', async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No transactions to sync.',
        count: 0
      });
    }

    const toInsert = [];
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      if (!isPlainObject(tx)) {
        return res.status(400).json({
          success: false,
          message: `Invalid transaction item at index ${i}. Expected an object.`
        });
      }

      if (!isNonEmptyString(tx.description, 100)) {
        return res.status(400).json({
          success: false,
          message: `Invalid description for transaction at index ${i}. Must be a non-empty string up to 100 characters.`
        });
      }

      if (!isPositiveNumber(tx.amount)) {
        return res.status(400).json({
          success: false,
          message: `Invalid amount for transaction at index ${i}. Must be a finite number greater than zero.`
        });
      }

      const txType = typeof tx.type === 'string' ? tx.type.toLowerCase().trim() : '';
      if (!['income', 'expense'].includes(txType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid type for transaction at index ${i}. Must be either 'income' or 'expense'.`
        });
      }

      if (!isNonEmptyString(tx.category, 50)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category for transaction at index ${i}. Must be a non-empty string.`
        });
      }

      if (!isValidDateString(tx.date)) {
        return res.status(400).json({
          success: false,
          message: `Invalid date for transaction at index ${i}. Must be valid YYYY-MM-DD.`
        });
      }

      toInsert.push({
        user: req.user.id,
        description: tx.description.trim(),
        amount: Math.round(Number(tx.amount) * 100) / 100,
        type: txType,
        category: tx.category.trim(),
        date: tx.date.trim()
      });
    }

    const result = await Transaction.insertMany(toInsert, { ordered: false });

    res.status(201).json({
      success: true,
      message: `Successfully synced ${result.length} transactions to your cloud database!`,
      count: result.length
    });
  } catch (error) {
    console.error('Sync Transactions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync transactions. Please try again later.',
      ...(isDev && { error: error.message })
    });
  }
});

module.exports = router;

