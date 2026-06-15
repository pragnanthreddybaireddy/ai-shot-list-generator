const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { createGeneration, getHistory, getGenerationById } = require('../controllers/generationController');
const { createFeedback } = require('../controllers/feedbackController');
const { getTemplates } = require('../controllers/templateController');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Auth routes
router.post('/auth/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validate,
  register
);

router.post('/auth/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  validate,
  login
);

router.post('/auth/forgot-password',
  [
    body('email').isEmail().withMessage('Valid email required')
  ],
  validate,
  forgotPassword
);

router.post('/auth/reset-password',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validate,
  resetPassword
);


router.get('/auth/me', requireAuth, getMe);

// Generation routes
router.post('/generate',
  [
    body('scene_description').trim().notEmpty().withMessage('Scene description is required').isLength({ min: 10, max: 5000 }),
    body('production_requirements').optional().trim().isLength({ max: 2000 }),
    body('camera_angles').optional().trim().isLength({ max: 1000 }),
    body('lens_suggestions').optional().trim().isLength({ max: 1000 }),
    body('coverage_notes').optional().trim().isLength({ max: 2000 }),
    body('director_style').optional().trim().isLength({ max: 500 }),
    body('cinematic_tone').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  requireAuth,
  createGeneration
);

router.get('/history', requireAuth, getHistory);
router.get('/history/:id', requireAuth, validate, getGenerationById);

// Feedback routes
router.post('/feedback',
  [
    body('generation_id').isString().withMessage('Valid generation ID required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').optional().trim().isLength({ max: 1000 }),
  ],
  validate,
  requireAuth,
  createFeedback
);

const { getAnalytics } = require('../controllers/analyticsController');

router.get('/analytics', requireAuth, getAnalytics);

// Templates
router.get('/templates', getTemplates);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
