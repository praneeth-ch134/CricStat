import express from 'express';
import Match from '../models/Match.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/matches
// @desc    Get all matches (admin view)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const matches = await Match.find().sort({ date: -1 });
    res.status(200).json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/matches/:id
// @desc    Get match by ID (admin view)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.status(200).json(match);
  } catch (error) {
    console.error('Get match error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/matches
// @desc    Create a new match
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const newMatch = new Match(req.body);
    const savedMatch = await newMatch.save();
    res.status(201).json(savedMatch);
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/matches/:id
// @desc    Update a match
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Update the match with new data
    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.status(200).json(updatedMatch);
  } catch (error) {
    console.error('Update match error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/matches/:id
// @desc    Delete a match
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    await match.remove();
    
    res.status(200).json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Delete match error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;