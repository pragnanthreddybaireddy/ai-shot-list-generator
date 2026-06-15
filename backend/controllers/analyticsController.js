const mongoose = require('mongoose');
const Generation = require('../models/Generation');
const Feedback = require('../models/Feedback');

async function getAnalytics(req, res) {
  try {
    const userId = req.user.id;
    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    // 1. Basic Counts
    const totalGenerations = await Generation.countDocuments({ user_id: userId });
    const totalFeedback = await Feedback.countDocuments({ user_id: userId });
    
    const avgRatingAgg = await Feedback.aggregate([
      { $match: { user_id: objectIdUserId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    const avgRating = avgRatingAgg.length > 0 ? avgRatingAgg[0].avgRating.toFixed(1) : "0.0";

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 2. Daily Generations (Last 30 days)
    const dailyGenerations = await Generation.aggregate([
      { $match: { user_id: objectIdUserId, created_at: { $gte: thirtyDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]).then(res => res.map(r => ({ date: r._id, count: r.count })));

    // 3. Quality Trend (Average rating per day, Last 30 days)
    const qualityTrend = await Feedback.aggregate([
      { $match: { user_id: objectIdUserId, created_at: { $gte: thirtyDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } }, 
          avg_rating: { $avg: "$rating" } 
        } 
      },
      { $sort: { _id: 1 } }
    ]).then(res => res.map(r => ({ date: r._id, avg_rating: Number(r.avg_rating.toFixed(1)) })));

    // 4. Rating Distribution
    const ratingDistribution = await Feedback.aggregate([
      { $match: { user_id: objectIdUserId } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]).then(res => res.map(r => ({ rating: r._id, count: r.count })));

    // 5. Recent Feedback
    const recentFeedbackRaw = await Feedback.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(10)
      .populate('generation_id');

    const recentFeedback = recentFeedbackRaw.map(f => ({
      rating: f.rating,
      comment: f.comment,
      created_at: f.created_at,
      scene_description: f.generation_id?.inputs?.scene_description || 'Untitled Generation'
    }));

    res.json({
      success: true,
      data: {
        totalGenerations,
        totalFeedback,
        avgRating,
        dailyGenerations,
        qualityTrend,
        ratingDistribution,
        recentFeedback
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getAnalytics };
