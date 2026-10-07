import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const scoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameId: { type: String, enum: ['dreamwall', 'architect', 'polarity'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  points: { type: Number, required: true },
  playedAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
export const Score = mongoose.model('Score', scoreSchema);
