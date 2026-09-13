const express = require('express');
const router = express.Router();
const { transactionOperations } = require('../db-utils');
const { validateQueryLimit } = require('../middleware/validation');

// GET /api/transactions/statistics - Get transaction statistics
router.get('/statistics', async (req, res) => {
  try {
    const allTransactions = await transactionOperations.getAllTransactions(1000);
    
    // Calculate statistics
    const totalTransactions = allTransactions.length;
    const totalTreatsTransferred = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageTransferAmount = totalTransactions > 0 
      ? Math.round(totalTreatsTransferred / totalTransactions) 
      : 0;
    
    // Most active cats (by number of transactions)
    const catActivity = {};
    allTransactions.forEach(t => {
      catActivity[t.sender_id] = (catActivity[t.sender_id] || 0) + 1;
      catActivity[t.receiver_id] = (catActivity[t.receiver_id] || 0) + 1;
    });
    
    const mostActiveCats = Object.entries(catActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([catId, count]) => ({ catId: parseInt(catId), transactionCount: count }));
    
    // Largest transactions
    const largestTransactions = [...allTransactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: {
        totalTransactions,
        totalTreatsTransferred,
        averageTransferAmount,
        mostActiveCats,
        largestTransactions,
        recentTransactions: allTransactions.slice(0, 10)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching transaction statistics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch transaction statistics',
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
    
    // Calculate cat-specific statistics
    const sentTransactions = transactions.filter(t => t.sender_id === catId);
    const receivedTransactions = transactions.filter(t => t.receiver_id === catId);
    const totalSent = sentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalReceived = receivedTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    res.json({
      success: true,
      data: transactions,
      count: transactions.length,
      catId,
      statistics: {
        sentCount: sentTransactions.length,
        receivedCount: receivedTransactions.length,
        totalSent,
        totalReceived,
        netBalance: totalReceived - totalSent
      },
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

// GET /api/transactions - Get all transactions with optional filtering
router.get('/', validateQueryLimit, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const { senderId, receiverId, status } = req.query;
    
    let transactions = await transactionOperations.getAllTransactions(limit);
    
    // Apply filters if provided
    if (senderId) {
      transactions = transactions.filter(t => t.sender_id === parseInt(senderId));
    }
    if (receiverId) {
      transactions = transactions.filter(t => t.receiver_id === parseInt(receiverId));
    }
    if (status) {
      transactions = transactions.filter(t => t.status === status);
    }
    
    res.json({
      success: true,
      data: transactions,
      count: transactions.length,
      filters: {
        senderId: senderId || null,
        receiverId: receiverId || null,
        status: status || null
      },
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
