const express = require('express');
const router = express.Router();
const { transactionOperations } = require('../db-utils');
const { validateQueryLimit } = require('../middleware/validation');

// GET /api/transactions - Get all transactions
router.get('/', validateQueryLimit, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const transactions = await transactionOperations.getAllTransactions(limit);
    
    res.json({
      success: true,
      data: transactions,
      count: transactions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch transactions',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/transactions/cat/:catId - Get transactions for a specific cat
router.get('/cat/:catId', validateQueryLimit, async (req, res) => {
  try {
    const catId = parseInt(req.params.catId);
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    
    if (!Number.isInteger(catId) || catId <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid cat ID. Must be a positive integer',
        timestamp: new Date().toISOString()
      });
    }

    const transactions = await transactionOperations.getTransactionsByCatId(catId, limit);
    
    res.json({
      success: true,
      data: transactions,
      count: transactions.length,
      catId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching cat transactions:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch cat transactions',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/transactions/:id - Get specific transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await transactionOperations.getTransactionById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Transaction with ID ${req.params.id} not found`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: transaction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch transaction',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
