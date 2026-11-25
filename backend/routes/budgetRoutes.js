/**
 * ==========================================================================
 * SpendWise – Budget Routes (Protected)
 * Technology: Express.js & Mongoose
 * ==========================================================================
 * Endpoints:
 *   GET    /api/budgets                – Fetch user's overall & category budgets
 *   POST   /api/budgets                – Create or upsert user's budget settings
 *   PUT    /api/budgets/overall        – Update overall monthly budget limit
 *   POST   /api/budgets/category       – Create a new category budget
 *   PUT    /api/budgets/category/:id   – Update an existing category budget
 *   PATCH  /api/budgets/category/:id   – Partial update for category budget
 *   DELETE /api/budgets/category/:id   – Delete a category budget
 *   DELETE /api/budgets/overall        – Reset overall monthly budget
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');
const {
  isPlainObject,
  isPositiveNumber,
  isNonNegativeNumber,
  isNonEmptyString,
  checkProtectedFields
} = require('../middleware/validator');

// Environment check: only disclose raw error message in development mode
const isDev = process.env.NODE_ENV !== 'production';

// All budget routes require user authentication
router.use(protect);

/**
 * @route   GET /api/budgets
 * @desc    Get user's monthly overall and category budgets
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    let budget = await Budget.findOne({ user: req.user.id });

    if (!budget) {
      budget = {
        overallMonthly: 0,
        categoryBudgets: []
      };
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Fetch Budgets Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve budgets.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   PUT /api/budgets/overall
 * @route   POST /api/budgets/overall
 * @desc    Create or update user's overall monthly budget limit
 * @access  Private
 */
const updateOverallBudgetHandler = async (req, res) => {
  try {
    if (!isPlainObject(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected a JSON object.'
      });
    }

    if (!checkProtectedFields(req.body, res)) return;

    const rawLimit = req.body.overallMonthly !== undefined ? req.body.overallMonthly : req.body.amount;

    if (!isPositiveNumber(rawLimit)) {
      return res.status(400).json({
        success: false,
        message: 'Overall monthly budget limit must be a finite number greater than zero.'
      });
    }

    const overallMonthly = Math.round(Number(rawLimit) * 100) / 100;

    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id },
      { $set: { overallMonthly } },
      { returnDocument: 'after', new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Overall monthly budget updated successfully!',
      data: budget
    });
  } catch (error) {
    console.error('Update Overall Budget Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update overall budget.',
      ...(isDev && { error: error.message })
    });
  }
};

router.put('/overall', updateOverallBudgetHandler);
router.post('/overall', updateOverallBudgetHandler);

/**
 * @route   DELETE /api/budgets/overall
 * @desc    Reset overall monthly budget limit to 0
 * @access  Private
 */
router.delete('/overall', async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id },
      { $set: { overallMonthly: 0 } },
      { returnDocument: 'after', new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Overall monthly budget reset successfully!',
      data: budget
    });
  } catch (error) {
    console.error('Reset Overall Budget Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset overall budget.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   POST /api/budgets/category
 * @desc    Add or update a category budget
 * @access  Private
 */
router.post('/category', async (req, res) => {
  try {
    if (!isPlainObject(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected a JSON object.'
      });
    }

    if (!checkProtectedFields(req.body, res)) return;

    const { category, amount } = req.body;

    if (!isNonEmptyString(category, 50)) {
      return res.status(400).json({
        success: false,
        message: 'Category name must be a non-empty string up to 50 characters.'
      });
    }

    if (!isPositiveNumber(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Category budget amount must be a finite number greater than zero.'
      });
    }

    const parsedAmount = Math.round(Number(amount) * 100) / 100;
    const trimmedCategory = category.trim();

    let budget = await Budget.findOne({ user: req.user.id });
    if (!budget) {
      budget = new Budget({
        user: req.user.id,
        overallMonthly: 0,
        categoryBudgets: []
      });
    }

    // Check if category already exists in user's categoryBudgets
    const existingIndex = budget.categoryBudgets.findIndex(
      (b) => b.category.toLowerCase() === trimmedCategory.toLowerCase()
    );

    if (existingIndex !== -1) {
      budget.categoryBudgets[existingIndex].amount = parsedAmount;
      budget.categoryBudgets[existingIndex].category = trimmedCategory;
    } else {
      budget.categoryBudgets.push({
        category: trimmedCategory,
        amount: parsedAmount
      });
    }

    await budget.save();

    res.status(201).json({
      success: true,
      message: 'Category budget saved successfully!',
      data: budget
    });
  } catch (error) {
    console.error('Create Category Budget Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save category budget.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   GET /api/budgets/category/:id
 * @desc    Get a single category budget by ID (ownership verified)
 * @access  Private
 */
router.get('/category/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category budget ID format.'
      });
    }

    const budget = await Budget.findOne({ user: req.user.id });
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Category budget not found.'
      });
    }

    const subDoc =
      budget.categoryBudgets.id(id) ||
      budget.categoryBudgets.find((b) => b._id.toString() === id || b.id === id);

    if (!subDoc) {
      return res.status(404).json({
        success: false,
        message: 'Category budget not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: subDoc
    });
  } catch (error) {
    console.error('Fetch Category Budget Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve category budget.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   PUT /api/budgets/category/:id
 * @route   PATCH /api/budgets/category/:id
 * @desc    Update an existing category budget by ID
 * @access  Private
 */
const updateCategoryBudgetHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category budget ID format.'
      });
    }

    if (!isPlainObject(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected a JSON object.'
      });
    }

    if (!checkProtectedFields(req.body, res)) return;

    const { category, amount } = req.body;

    if (category === undefined && amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category name or amount to update.'
      });
    }

    if (category !== undefined && !isNonEmptyString(category, 50)) {
      return res.status(400).json({
        success: false,
        message: 'Category name must be a non-empty string up to 50 characters.'
      });
    }

    if (amount !== undefined && !isPositiveNumber(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Category budget amount must be a finite number greater than zero.'
      });
    }

    const budget = await Budget.findOne({ user: req.user.id });
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Category budget not found.'
      });
    }

    // Find the category budget subdocument
    const subDoc =
      budget.categoryBudgets.id(id) ||
      budget.categoryBudgets.find((b) => b._id.toString() === id || b.id === id);

    if (!subDoc) {
      return res.status(404).json({
        success: false,
        message: 'Category budget not found.'
      });
    }

    if (category !== undefined) {
      subDoc.category = category.trim();
    }

    if (amount !== undefined) {
      subDoc.amount = Math.round(Number(amount) * 100) / 100;
    }

    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Category budget updated successfully!',
      data: budget
    });
  } catch (error) {
    console.error('Update Category Budget Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category budget.',
      ...(isDev && { error: error.message })
    });
  }
};

router.put('/category/:id', updateCategoryBudgetHandler);
router.patch('/category/:id', updateCategoryBudgetHandler);

/**
 * @route   DELETE /api/budgets/category/:id
 * @desc    Delete a category budget by ID
 * @access  Private
 */
router.delete('/category/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category budget ID format.'
      });
    }

    const budget = await Budget.findOne({ user: req.user.id });
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Category budget not found.'
      });
    }

    const subDoc =
      budget.categoryBudgets.id(id) ||
      budget.categoryBudgets.find((b) => b._id.toString() === id || b.id === id);

    if (!subDoc) {
      return res.status(404).json({
        success: false,
        message: 'Category budget not found.'
      });
    }

    budget.categoryBudgets.pull(subDoc._id);
    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Category budget deleted successfully!',
      data: budget
    });
  } catch (error) {
    console.error('Delete Category Budget Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category budget.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   POST /api/budgets
 * @desc    General budget creation / bulk save
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

    const { overallMonthly, categoryBudgets, category, amount } = req.body;

    // 1. If single category budget sent to /api/budgets
    if (category !== undefined || amount !== undefined) {
      if (!isNonEmptyString(category, 50)) {
        return res.status(400).json({
          success: false,
          message: 'Category name must be a non-empty string up to 50 characters.'
        });
      }

      if (!isPositiveNumber(amount)) {
        return res.status(400).json({
          success: false,
          message: 'Category budget amount must be a finite number greater than zero.'
        });
      }

      let budget = await Budget.findOne({ user: req.user.id });
      if (!budget) {
        budget = new Budget({ user: req.user.id, overallMonthly: 0, categoryBudgets: [] });
      }

      const parsedAmount = Math.round(Number(amount) * 100) / 100;
      const trimmedCategory = category.trim();

      const existingIndex = budget.categoryBudgets.findIndex(
        (b) => b.category.toLowerCase() === trimmedCategory.toLowerCase()
      );

      if (existingIndex !== -1) {
        budget.categoryBudgets[existingIndex].amount = parsedAmount;
        budget.categoryBudgets[existingIndex].category = trimmedCategory;
      } else {
        budget.categoryBudgets.push({ category: trimmedCategory, amount: parsedAmount });
      }

      await budget.save();
      return res.status(201).json({
        success: true,
        message: 'Category budget saved successfully!',
        data: budget
      });
    }

    // 2. Full or partial budget update
    const updateData = {};
    if (overallMonthly !== undefined) {
      if (!isNonNegativeNumber(overallMonthly)) {
        return res.status(400).json({
          success: false,
          message: 'Overall monthly budget must be a non-negative finite number.'
        });
      }
      updateData.overallMonthly = Math.round(Number(overallMonthly) * 100) / 100;
    }

    if (categoryBudgets !== undefined) {
      if (!Array.isArray(categoryBudgets)) {
        return res.status(400).json({
          success: false,
          message: 'Category budgets must be an array.'
        });
      }
      for (let i = 0; i < categoryBudgets.length; i++) {
        const cb = categoryBudgets[i];
        if (!isPlainObject(cb) || !isNonEmptyString(cb.category, 50) || !isPositiveNumber(cb.amount)) {
          return res.status(400).json({
            success: false,
            message: `Invalid category budget at index ${i}. Each item must have a valid category and a positive amount.`
          });
        }
      }
      updateData.categoryBudgets = categoryBudgets.map((cb) => ({
        category: cb.category.trim(),
        amount: Math.round(Number(cb.amount) * 100) / 100
      }));
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { returnDocument: 'after', new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Budgets saved successfully!',
      data: budget
    });
  } catch (error) {
    console.error('Save Budgets Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save budgets.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   PUT /api/budgets
 * @desc    Update whole budget or overall monthly
 * @access  Private
 */
router.put('/', async (req, res) => {
  try {
    if (!isPlainObject(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected a JSON object.'
      });
    }

    if (!checkProtectedFields(req.body, res)) return;

    const { overallMonthly, categoryBudgets } = req.body;

    if (overallMonthly === undefined && categoryBudgets === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide overallMonthly or categoryBudgets to update.'
      });
    }

    const updateData = {};
    if (overallMonthly !== undefined) {
      if (!isNonNegativeNumber(overallMonthly)) {
        return res.status(400).json({
          success: false,
          message: 'Overall monthly budget must be a non-negative finite number.'
        });
      }
      updateData.overallMonthly = Math.round(Number(overallMonthly) * 100) / 100;
    }

    if (categoryBudgets !== undefined) {
      if (!Array.isArray(categoryBudgets)) {
        return res.status(400).json({
          success: false,
          message: 'Category budgets must be an array.'
        });
      }
      for (let i = 0; i < categoryBudgets.length; i++) {
        const cb = categoryBudgets[i];
        if (!isPlainObject(cb) || !isNonEmptyString(cb.category, 50) || !isPositiveNumber(cb.amount)) {
          return res.status(400).json({
            success: false,
            message: `Invalid category budget at index ${i}. Each item must have a valid category and a positive amount.`
          });
        }
      }
      updateData.categoryBudgets = categoryBudgets.map((cb) => ({
        category: cb.category.trim(),
        amount: Math.round(Number(cb.amount) * 100) / 100
      }));
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { returnDocument: 'after', new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Budgets updated successfully!',
      data: budget
    });
  } catch (error) {
    console.error('Update Budgets Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budgets.',
      ...(isDev && { error: error.message })
    });
  }
});

module.exports = router;
