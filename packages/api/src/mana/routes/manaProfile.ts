import { Router, Request, Response } from 'express';
// import { requireJwtAuth } from '../../middleware'; // TODO: add requireJwtAuth middleware
import mongoose from 'mongoose';
// import { StudentProfile } from '../models/StudentProfile';

const router = Router();

// GET /api/mana/profile/:userId
router.get('/profile/:userId', /* requireJwtAuth, */ async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const profile = await mongoose.model('StudentProfile').findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    return res.json(profile);
  } catch (error) {
    console.error('Error fetching player profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mana/leaderboard
router.get('/leaderboard', /* requireJwtAuth, */ async (req: Request, res: Response) => {
  try {
    const leaderboard = await mongoose.model('StudentProfile')
      .find()
      .sort({ currentXp: -1 })
      .limit(20);
      
    return res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
