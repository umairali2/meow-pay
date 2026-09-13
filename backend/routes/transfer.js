const express = require('express');
const router = express.Router();
const { performTransfer, catOperations } = require('../db-utils');
const { validateTransferRequest } = require('../middleware/validation');

// POST /api/transfer - Transfer treats from one cat to another
router.post('/', validateTransferRequest, async (req, res) => {
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
        timestamp: new Date().toISOString()
      });
    }

    // Perform the atomic transfer
    const result = await performTransfer(senderId, receiverId, amount);
    
    res.status(200).json({
      success: true,
      data: {
        transactionId: result.transactionId,
        senderId: result.senderId,
        senderName: sender.name,
        receiverId: result.receiverId,
        receiverName: receiver.name,
        amount: result.amount,
        newSenderBalance: result.newSenderBalance,
        newReceiverBalance: result.newReceiverBalance
      },
      message: `Successfully transferred ${amount} treats from ${sender.name} to ${receiver.name}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing transfer:', error);
    
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
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
