import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { User, Score } from './models.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn("⚠️ MONGO_URI is not set. The server requires MongoDB credentials to start.");
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
}

// ------------------------------------------------------------------
// AUTH ENDPOINTS
// ------------------------------------------------------------------

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phoneNumber, username } = req.body;
    
    // TODO: Add Username abusive word and college club filter logic here

    const existingUser = await User.findOne({ $or: [{ email }, { username }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email, username, or phone number already in use' });
    }

    const user = new User({ name, email, phoneNumber, username });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    // Simple login: return userId (In production, use JWT)
    res.json({ message: 'Login successful', userId: user._id, username: user.username });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------------------------------------------------------
// SCORE ENDPOINTS
// ------------------------------------------------------------------

const POINTS_MAP = {
  easy: 20,
  medium: 30,
  hard: 50
};

app.post('/api/scores/submit', async (req, res) => {
  try {
    const { userId, gameId, difficulty } = req.body;

    if (!userId || !gameId || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['dreamwall', 'architect', 'polarity'].includes(gameId)) {
      return res.status(400).json({ error: 'Invalid gameId' });
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty' });
    }

    const points = POINTS_MAP[difficulty as keyof typeof POINTS_MAP];

    const score = new Score({
      userId,
      gameId,
      difficulty,
      points
    });

    await score.save();
    res.status(201).json({ message: 'Score submitted successfully', pointsAwarded: points });
  } catch (error) {
    console.error('Score Submit Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Score.aggregate([
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$points' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          username: '$user.username',
          score: '$totalScore'
        }
      },
      { $sort: { score: -1 } },
      { $limit: 10 }
    ]);

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard Fetch Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
