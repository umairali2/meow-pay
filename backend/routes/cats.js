const express = require('express');
const router = express.Router();
const { catOperations } = require('../db-utils');
const { validateCatCreation, validateCatId } = require('../middleware/validation');

// GET /api/cats - Get all cats
router.get('/', async (req, res) => {
  try {
    const cats = await catOperations.getAllCats();
    res.json({
      success: true,
      data: cats,
      count: cats.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching cats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch cats',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/cats/:id - Get specific cat by ID
router.get('/:id', validateCatId, async (req, res) => {
  try {
    const cat = await catOperations.getCatById(req.params.id);
    
    if (!cat) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Cat with ID ${req.params.id} not found`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: cat,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching cat:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch cat',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/cats - Create new cat
router.post('/', validateCatCreation, async (req, res) => {
  try {
    const { name, balance = 0 } = req.body;
    
    // Check if cat with this name already exists
    const existingCat = await catOperations.getCatByName(name);
    if (existingCat) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Cat with name '${name}' already exists`,
        timestamp: new Date().toISOString()
      });
    }

    const newCat = await catOperations.createCat(name, balance);
    
    res.status(201).json({
      success: true,
      data: newCat,
      message: 'Cat created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating cat:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create cat',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
