const Feedback = require('../models/Feedback');

async function createFeedback(req, res) {
  try {
    const { generation_id, rating, comment } = req.body;
    
    await Feedback.create({
      user_id: req.user.id,
      generation_id,
      rating,
      comment: comment || null
    });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { createFeedback };
