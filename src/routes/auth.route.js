import express from 'express';
import { body, validationResult } from 'express-validator';
import { login, logout } from '../controllers/auth.controller.js';
import { register , refreshToken } from '../controllers/auth.controller.js';

const router = express.Router();
router.post(
  '/login',
  [
    body('email')
      .notEmpty().withMessage('Email không được để trống')
      .isEmail().withMessage('Email không hợp lệ'),
    body('password')
      .notEmpty().withMessage('Password không được để trống')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
  login
);
// POST /api/auth/logout
router.post('/logout', logout);
router.post('/register', register);
router.post('/refresh-token', refreshToken);

export default router;
