import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const verifyToken = async (req, res, next) => {
  try {
    // Ưu tiên token từ cookie
    let token = req.cookies?.token;

    // Nếu không có, kiểm tra trong header
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token',
        code: 'TOKEN_MISSING',
      });
    }

    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra token hết hạn
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn',
        code: 'TOKEN_EXPIRED',
      });
    }

    // Lấy user từ DB
    const userId = decoded.sub || decoded.id || decoded._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Người dùng không tồn tại',
        code: 'USER_NOT_FOUND',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Token không hợp lệ',
      code: 'TOKEN_INVALID',
    });
  }
};

export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực người dùng',
        code: 'UNAUTHORIZED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập vào tài nguyên này.',
        code: 'FORBIDDEN',
      });
    }
    next();
  };
};
