import { authenticateUser } from '../services/auth.service.js';
import { registerUser } from '../services/auth.service.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authenticateUser({ email, password });

    // Gửi cả access và refresh token dưới dạng HttpOnly cookie
    res.cookie('token', accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 phút
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.json({
      message: 'Đăng nhập thành công',
      user,
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
    next(err);
  }
};
export const logout = (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ message: 'Đã đăng xuất' });
};


export const register = async (req, res, next) => {
  try {
    const { email, password, role, employeeId } = req.body;

    const newUser = await registerUser({ email, password, role, employeeId });

    const { password: _, ...userData } = newUser.toObject();

    res.status(201).json({
      message: 'Tạo người dùng thành công',
      user: userData
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || 'Đã xảy ra lỗi trong quá trình tạo người dùng'
    });
    next(err);
  }
};

export const refreshToken = async (req, res) => {
  try {
    // Lấy refresh token từ cookie hoặc authorization header
    let refreshToken = req.cookies?.refreshToken;

    // Nếu không có trong cookie, kiểm tra trong authorization header
    if (!refreshToken && req.headers['authorization']) {
      const authHeader = req.headers['authorization'];
      if (authHeader.startsWith('Bearer ')) {
        refreshToken = authHeader.split(' ')[1];
      }
    }

    // Kiểm tra refresh token có tồn tại không
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false,
        message: 'Refresh token không được cung cấp',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    // Xác minh refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({
          success: false,
          message: 'Refresh token đã hết hạn, vui lòng đăng nhập lại',
          code: 'REFRESH_TOKEN_EXPIRED'
        });
      }
      return res.status(403).json({
        success: false,
        message: 'Refresh token không hợp lệ',
        code: 'REFRESH_TOKEN_INVALID'
      });
    }

    // Kiểm tra user tồn tại
    const user = await User.findById(decoded.sub).populate('employeeId');
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Người dùng không tồn tại',
        code: 'USER_NOT_FOUND'
      });
    }

    // Tạo access token mới
    const payload = { sub: user._id, role: user.role };
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });

    // Gửi access token mới qua cookie và response
    res.cookie('token', newAccessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 phút
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.json({
      success: true,
      message: 'Làm mới access token thành công',
      accessToken: newAccessToken
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi refresh token',
      code: 'SERVER_ERROR'
    });
  }
};