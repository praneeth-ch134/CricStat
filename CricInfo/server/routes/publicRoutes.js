import express from 'express';
import Match from '../models/Match.js';

const router = express.Router();

// @route   GET /api/matches
// @desc    Get all matches (public view)
// @access  Public
router.get('/matches', async (req, res) => {
  try {
    const matches = await Match.find().sort({ date: -1 });
    res.status(200).json(matches);
  } catch (error) {
    console.error('Get public matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/matches/:id
// @desc    Get match by ID (public view)
// @access  Public
router.get('/matches/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.status(200).json(match);
  } catch (error) {
    console.error('Get public match error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;