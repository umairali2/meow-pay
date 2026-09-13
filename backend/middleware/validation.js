// Validation middleware for API requests

const validateTransferRequest = (req, res, next) => {
  const { senderId, receiverId, amount } = req.body;

  // Check if all required fields are present
  if (!senderId || !receiverId || !amount) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Missing required fields: senderId, receiverId, and amount are required',
      timestamp: new Date().toISOString()
    });
  }

  // Validate senderId and receiverId are positive integers
  if (!Number.isInteger(Number(senderId)) || senderId <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'senderId must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!Number.isInteger(Number(receiverId)) || receiverId <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'receiverId must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  // Validate amount is a positive number
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'amount must be a positive number',
      timestamp: new Date().toISOString()
    });
  }

  // Validate sender and receiver are different
  if (Number(senderId) === Number(receiverId)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'senderId and receiverId must be different',
      timestamp: new Date().toISOString()
    });
  }

  // Validate amount is reasonable (max 1 million treats - this is a soft limit, the actual limit is enforced in the route)
  if (amount > 1000000) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'amount cannot exceed 1,000,000 treats',
      timestamp: new Date().toISOString()
    });
  }

  // Validate amount is a finite number
  if (!Number.isFinite(amount)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'amount must be a finite number',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

const validateCatCreation = (req, res, next) => {
  const { name, balance } = req.body;

  // Check if name is present and valid
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'name is required and must be a non-empty string',
      timestamp: new Date().toISOString()
    });
  }

  // Validate name length
  if (name.length > 50) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'name cannot exceed 50 characters',
      timestamp: new Date().toISOString()
    });
  }

  // Validate balance if provided
  if (balance !== undefined) {
    if (isNaN(balance) || balance < 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'balance must be a non-negative number',
        timestamp: new Date().toISOString()
      });
    }
  }

  next();
};

const validateCatId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !Number.isInteger(Number(id)) || id <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid cat ID. Must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

const validateQueryLimit = (req, res, next) => {
  const { limit } = req.query;

  if (limit !== undefined) {
    const limitNum = Number(limit);
    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'limit must be a positive integer between 1 and 100',
        timestamp: new Date().toISOString()
      });
    }
  }

  next();
};

// Validation for transfer validation endpoint (less strict than actual transfer)
const validateTransferValidation = (req, res, next) => {
  const { senderId, receiverId, amount } = req.body;

  // Check if all required fields are present
  if (!senderId || !receiverId || !amount) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Missing required fields: senderId, receiverId, and amount are required',
      timestamp: new Date().toISOString()
    });
  }

  // Validate senderId and receiverId are positive integers
  if (!Number.isInteger(Number(senderId)) || senderId <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'senderId must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!Number.isInteger(Number(receiverId)) || receiverId <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'receiverId must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  // Validate amount is a positive number
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'amount must be a positive number',
      timestamp: new Date().toISOString()
    });
  }

  // Validate sender and receiver are different
  if (Number(senderId) === Number(receiverId)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'senderId and receiverId must be different',
      timestamp: new Date().toISOString()
    });
  }

  // Allow larger amounts for validation (for preview purposes)
  if (amount > 10000000) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'amount cannot exceed 10,000,000 treats for validation',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

module.exports = {
  validateTransferRequest,
  validateTransferValidation,
  validateCatCreation,
  validateCatId,
  validateQueryLimit
};
