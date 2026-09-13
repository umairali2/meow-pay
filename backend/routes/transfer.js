const express = require('express');
const router = express.Router();
const { performTransfer, catOperations, transactionOperations } = require('../db-utils');
const { validateTransferRequest, validateTransferValidation } = require('../middleware/validation');

// POST /api/transfer - Transfer treats from one cat to another
router.post('/', validateTransferRequest, async (req, res) => {
  const transactionStartTime = Date.now();
  
  try {
    const { senderId, receiverId, amount } = req.body;
    
    // Validate that both cats exist
    const sender = await catOperations.getCatById(senderId);
    if (!sender) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Sender cat with ID ${senderId} not found`,
        timestamp: new Date().toISOString()
      });
    }

    const receiver = await catOperations.getCatById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Receiver cat with ID ${receiverId} not found`,
        timestamp: new Date().toISOString()
      });
    }

    // Check if sender has sufficient balance
    if (sender.balance < amount) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Insufficient balance. Sender has ${sender.balance} treats, but tried to transfer ${amount}`,
        details: {
          currentBalance: sender.balance,
          requestedAmount: amount,
          deficit: amount - sender.balance
        },
        timestamp: new Date().toISOString()
      });
    }

    // Check for transfer limits (optional business rule)
    const MAX_SINGLE_TRANSFER = 10000; // Maximum treats per transfer
    if (amount > MAX_SINGLE_TRANSFER) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Transfer amount exceeds maximum limit of ${MAX_SINGLE_TRANSFER} treats`,
        details: {
          requestedAmount: amount,
          maximumAllowed: MAX_SINGLE_TRANSFER
        },
        timestamp: new Date().toISOString()
      });
    }

    // Check for potential duplicate transfers (same sender, receiver, amount within last minute)
    const recentTransactions = await transactionOperations.getAllTransactions(10);
    const duplicateCheck = recentTransactions.find(t => 
      t.sender_id === senderId && 
      t.receiver_id === receiverId && 
      t.amount === amount &&
      (Date.now() - new Date(t.created_at).getTime()) < 60000 // Within last minute
    );

    if (duplicateCheck) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Duplicate transfer detected. A similar transfer was processed recently.',
        details: {
          duplicateTransactionId: duplicateCheck.id,
          duplicateTimestamp: duplicateCheck.created_at,
          timeSinceDuplicate: Math.round((Date.now() - new Date(duplicateCheck.created_at).getTime()) / 1000) + ' seconds ago'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Log transfer attempt
    console.log(`Transfer attempt: ${sender.name} (${senderId}) -> ${receiver.name} (${receiverId}), amount: ${amount}`);

    // Perform the atomic transfer
    const result = await performTransfer(senderId, receiverId, amount);
    
    const processingTime = Date.now() - transactionStartTime;
    
    // Generate transfer receipt
    const receipt = {
      transactionId: result.transactionId,
      timestamp: new Date().toISOString(),
      processingTimeMs: processingTime,
      from: {
        id: sender.id,
        name: sender.name,
        previousBalance: sender.balance,
        newBalance: result.newSenderBalance
      },
      to: {
        id: receiver.id,
        name: receiver.name,
        previousBalance: receiver.balance,
        newBalance: result.newReceiverBalance
      },
      amount: result.amount,
      status: 'completed',
      confirmationCode: generateConfirmationCode(result.transactionId)
    };

    res.status(200).json({
      success: true,
      data: receipt,
      message: `Successfully transferred ${amount} treats from ${sender.name} to ${receiver.name}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const processingTime = Date.now() - transactionStartTime;
    console.error(`Transfer failed after ${processingTime}ms:`, error.message);
    
    // Handle specific error messages
    if (error.message === 'Sender not found') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Sender cat not found',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.message === 'Receiver not found') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Receiver cat not found',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Insufficient balance for transfer',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process transfer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to generate confirmation code
function generateConfirmationCode(transactionId) {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${transactionId}-${timestamp}-${randomPart}`;
}

// POST /api/transfer/validate - Validate transfer without executing
router.post('/validate', validateTransferValidation, async (req, res) => {
  try {
    const { senderId, receiverId, amount } = req.body;
    
    // Validate that both cats exist
    const sender = await catOperations.getCatById(senderId);
    if (!sender) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Sender cat with ID ${senderId} not found`,
        timestamp: new Date().toISOString()
      });
    }

    const receiver = await catOperations.getCatById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Receiver cat with ID ${receiverId} not found`,
        timestamp: new Date().toISOString()
      });
    }

    // Check if sender has sufficient balance
    const isValid = sender.balance >= amount;
    
    res.status(200).json({
      success: true,
      valid: isValid,
      data: {
        sender: {
          id: sender.id,
          name: sender.name,
          currentBalance: sender.balance,
          sufficient: isValid
        },
        receiver: {
          id: receiver.id,
          name: receiver.name,
          currentBalance: receiver.balance
        },
        transfer: {
          amount: amount,
          feasible: isValid,
          newSenderBalance: sender.balance - amount,
          newReceiverBalance: receiver.balance + amount
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error validating transfer:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate transfer',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
