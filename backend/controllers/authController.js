const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Generation = require('../models/Generation');
const Feedback = require('../models/Feedback');
const { sendPasswordResetEmail } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

async function register(req, res) {
  try {
    const { email, password } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password_hash: hash });

    // Assignment logic: if this is the FIRST user, assign all orphaned generations to them
    const userCount = await User.countDocuments();
    if (userCount === 1) {
      await Generation.updateMany({ user_id: { $exists: false } }, { user_id: user._id });
      await Feedback.updateMany({ user_id: { $exists: false } }, { user_id: user._id });
    }

    const token = jwt.sign({ id: user._id.toString(), email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ success: true, token, user: { id: user._id.toString(), email } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ success: true, token, user: { id: user._id.toString(), email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getMe(req, res) {
  res.json({ success: true, user: req.user });
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true });
    }

    const secret = JWT_SECRET + user.password_hash;
    const token = jwt.sign({ id: user._id.toString(), email: user.email }, secret, { expiresIn: '15m' });
    
    const baseUrl = process.env.FRONTEND_URL || 'https://pragnanthreddybaireddy.github.io/ai-shot-list-generator';
    const resetLink = `${baseUrl}/#/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    
    await sendPasswordResetEmail(email, resetLink);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, token, newPassword } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid reset link' });
    }

    const secret = JWT_SECRET + user.password_hash;
    
    try {
      jwt.verify(token, secret);
    } catch (err) {
      return res.status(400).json({ success: false, error: 'Reset link is invalid or has expired' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password_hash = hash;
    await user.save();
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { register, login, getMe, forgotPassword, resetPassword, JWT_SECRET };
