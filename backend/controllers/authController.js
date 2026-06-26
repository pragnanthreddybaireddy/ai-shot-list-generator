const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Generation, Feedback } = require('../models');
const { sendPasswordResetEmail } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

async function register(req, res) {
  try {
    const { email, password } = req.body;
    
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password_hash: hash });

    // Assignment logic: if this is the FIRST user, assign all orphaned generations to them
    const userCount = await User.count();
    if (userCount === 1) {
      await Generation.update({ user_id: user.id }, { where: { user_id: null } });
      await Feedback.update({ user_id: user.id }, { where: { user_id: null } });
    }

    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ success: true, token, user: { id: user.id, email } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ success: true, token, user: { id: user.id, email: user.email } });
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
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ success: true });
    }

    const secret = JWT_SECRET + user.password_hash;
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '15m' });
    
    let baseUrl = process.env.FRONTEND_URL || 'https://pragnanthreddybaireddy.github.io/ai-shot-list-generator';
    
    // Adjust base URL if running locally, because Create React App uses the "homepage" 
    // field from package.json and serves the app under /ai-shot-list-generator
    if (baseUrl.includes('localhost') && !baseUrl.includes('ai-shot-list-generator')) {
      baseUrl = baseUrl.replace(/\/$/, '') + '/ai-shot-list-generator';
    } 
    // Force the correct path for GitHub pages if it's missing
    else if (baseUrl.includes('github.io') && !baseUrl.includes('ai-shot-list-generator')) {
      baseUrl = baseUrl.replace(/\/$/, '') + '/ai-shot-list-generator';
    }

    // Ensure baseUrl doesn't end with a slash before adding /#/
    baseUrl = baseUrl.replace(/\/$/, '');
    
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
    
    const user = await User.findOne({ where: { email } });
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
