const { sequelize, Generation, Feedback } = require('../models');

async function getAnalytics(req, res) {
  try {
    const userId = req.user.id;

    // 1. Basic Counts
    const totalGenerations = await Generation.count({ where: { user_id: userId } });
    const totalFeedback = await Feedback.count({ where: { user_id: userId } });
    
    // Average Rating
    const avgRatingRaw = await Feedback.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
      where: { user_id: userId },
      raw: true
    });
    const avgRating = avgRatingRaw?.avgRating ? Number(avgRatingRaw.avgRating).toFixed(1) : "0.0";

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const isPostgres = sequelize.options.dialect === 'postgres';
    const dateQuery = isPostgres 
      ? sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM-DD')
      : sequelize.fn('DATE', sequelize.col('created_at'));
    const groupQuery = isPostgres 
      ? sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM-DD')
      : sequelize.fn('DATE', sequelize.col('created_at'));

    // 2. Daily Generations (Last 30 days)
    const dailyGenerationsRaw = await Generation.findAll({
      attributes: [
        [dateQuery, 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        user_id: userId,
        created_at: { [require('sequelize').Op.gte]: thirtyDaysAgo }
      },
      group: [groupQuery],
      order: [[sequelize.literal('date'), 'ASC']],
      raw: true
    });
    const dailyGenerations = dailyGenerationsRaw.map(r => ({ date: r.date, count: Number(r.count) }));

    // 3. Quality Trend (Average rating per day, Last 30 days)
    const qualityTrendRaw = await Feedback.findAll({
      attributes: [
        [dateQuery, 'date'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']
      ],
      where: {
        user_id: userId,
        created_at: { [require('sequelize').Op.gte]: thirtyDaysAgo }
      },
      group: [groupQuery],
      order: [[sequelize.literal('date'), 'ASC']],
      raw: true
    });
    const qualityTrend = qualityTrendRaw.map(r => ({ date: r.date, avg_rating: Number(Number(r.avg_rating).toFixed(1)) }));

    // 4. Rating Distribution
    const ratingDistributionRaw = await Feedback.findAll({
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { user_id: userId },
      group: ['rating'],
      order: [['rating', 'DESC']],
      raw: true
    });
    const ratingDistribution = ratingDistributionRaw.map(r => ({ rating: r.rating, count: Number(r.count) }));

    // 5. Recent Feedback
    const recentFeedbackRaw = await Feedback.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10,
      include: [{ model: Generation, attributes: ['inputs'] }]
    });

    const recentFeedback = recentFeedbackRaw.map(f => ({
      rating: f.rating,
      comment: f.comment,
      created_at: f.created_at,
      scene_description: f.Generation?.inputs?.scene_description || 'Untitled Generation'
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
