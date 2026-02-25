const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
    ],
    register
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    login
);

router.get('/me', protect, getMe);
router.post('/google', [body('idToken').notEmpty().withMessage('Google ID Token is required')], googleLogin);

module.exports = router;
