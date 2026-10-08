import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from "mongodb-memory-server";

import cors from 'cors';
import dotenv from 'dotenv';
import { User, Score } from './models.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Render health check
app.get('/', (req, res) => res.send('Backend is running!'));

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn("⚠️ MONGO_URI is not set. Starting in-memory MongoDB for development...");
  MongoMemoryServer.create().then((mongoServer) => {
    mongoose.connect(mongoServer.getUri())
      .then(() => console.log('✅ Connected to In-Memory MongoDB'))
      .catch(err => console.error('❌ In-Memory MongoDB connection error:', err));
  });
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
    const { name, email, phoneNumber, username, password } = req.body;
    
    if (!password) return res.status(400).json({ error: 'Password is required' });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already in use' });
    }

    const user = new User({ name, email, phoneNumber, username, password });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully', userId: user._id, username: user.username });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Simple login: return userId
    res.json({ message: 'Login successful', userId: user._id, username: user.username });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    console.log(`\n\n======================================================`);
    console.log(`🔐 PASSWORD RESET OTP FOR ${email}: ${otp}`);
    console.log(`======================================================\n\n`);

    res.json({ message: 'OTP sent to email (check server console)' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.resetOtp !== otp || user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------------------------------------------------------
// SCORE ENDPOINTS
// ------------------------------------------------------------------

app.post('/api/scores/submit', async (req, res) => {
  try {
    const { userId, gameId, difficulty, score: rawScore } = req.body;

    if (!userId || !gameId || rawScore === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['dreamwall', 'architect', 'polarity'].includes(gameId)) {
      return res.status(400).json({ error: 'Invalid gameId' });
    }

    const points = Number(rawScore);

    const score = new Score({
      userId,
      gameId,
      difficulty: difficulty || 'hard',
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
