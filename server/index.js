import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
let helmet;
try { helmet = (await import('helmet')).default; } catch {}
let rateLimit;
try { rateLimit = (await import('express-rate-limit')).default; } catch {}
import { User, Score } from './models.js';

dotenv.config();

const app = express();

// Security Middleware (Helmet sets secure HTTP headers)
if (helmet) app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting (Prevents bots/malware from bombarding the server)
if (rateLimit) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: "Too many requests from this IP, please try again after 15 minutes." }
  });
  app.use('/api/', limiter);
}

// Health check endpoints for Render
app.get('/', (req, res) => res.send('Backend is running!'));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS  // Your Gmail App Password
  }
});

let dbPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    if (!MONGO_URI) {
      console.warn("⚠️ MONGO_URI is not set. Starting in-memory MongoDB for local development...");
      try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        const mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        console.log('✅ Connected to In-Memory MongoDB');
      } catch (err) {
        dbPromise = null;
        console.error('❌ Failed to start In-Memory MongoDB:', err);
        throw new Error('Database connection failed: MONGO_URI missing and In-Memory MongoDB could not start.');
      }
    } else {
      try {
        await mongoose.connect(MONGO_URI, { 
          serverSelectionTimeoutMS: 5000,
          maxPoolSize: 10 // Prevent connection limits on Vercel
        });
        console.log('✅ Connected to MongoDB');
      } catch (err) {
        dbPromise = null;
        console.error('❌ MongoDB connection error:', err);
        throw new Error('Database connection failed: ' + err.message);
      }
    }
  })();

  return dbPromise;
};

// Initiate database connection on server boot
connectDB().catch(() => {});

// ------------------------------------------------------------------
// AUTH ENDPOINTS
// ------------------------------------------------------------------

app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
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
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
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
    await connectDB();
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'This email is not registered yet! Please click "Register" below to create an account.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    console.log(`\n\n======================================================`);
    console.log(`🔐 PASSWORD RESET OTP FOR ${email}: ${otp}`);
    console.log(`======================================================\n\n`);

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"MindSweepers" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset OTP - MindSweepers',
        text: `Your password reset OTP is: ${otp}\nIt is valid for 15 minutes.`
      });
      res.json({ message: 'OTP sent to your email successfully.' });
    } else {
      console.warn("⚠️ EMAIL_USER or EMAIL_PASS not set. Falling back to console only.");
      res.json({ message: 'OTP generated (check server console, email not configured)' });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Failed to send email: ' + (error.message || 'Unknown error') });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    await connectDB();
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
    await connectDB();
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

// Only count scores submitted after this time (9:00 AM IST, Oct 9 2026)
const SCORE_CUTOFF = new Date('2026-10-09T03:30:00.000Z'); // 9:00 AM IST = 3:30 AM UTC

app.get('/api/scores/:userId', async (req, res) => {
  try {
    await connectDB();
    const { userId } = req.params;
    const { gameId } = req.query;
    
    // In mongoose 7+, you can usually just pass the string to match, or use new mongoose.Types.ObjectId(userId)
    // We'll just pass the string if it works, or require ObjectId.
    const match = { userId: new mongoose.Types.ObjectId(userId), playedAt: { $gte: SCORE_CUTOFF } };
    if (gameId && gameId !== 'overall') {
      match.gameId = gameId;
    }

    const result = await Score.aggregate([
      { $match: match },
      { $group: { _id: null, totalScore: { $sum: '$points' } } }
    ]);

    const score = result.length > 0 ? result[0].totalScore : 0;
    res.json({ score });
  } catch (error) {
    console.error('Get Score Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    await connectDB();
    const leaderboard = await Score.aggregate([
      { $match: { playedAt: { $gte: SCORE_CUTOFF } } },
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

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
