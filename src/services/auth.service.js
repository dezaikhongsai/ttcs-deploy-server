import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Employee from '../models/employee.model.js';  // Import Employee Model

export const generateTokens = (user) => {
  const payload = {
    sub: user._id,
    role: user.role
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });

  return { accessToken, refreshToken };
};

export const authenticateUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).populate('employeeId');
  if (!user) throw Object.assign(new Error('Email không tồn tại'), { status: 401 });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw Object.assign(new Error('Sai mật khẩu'), { status: 401 });

  const { accessToken, refreshToken } = generateTokens(user);
  const { password: _, ...userData } = user.toObject();

  return { user: userData, accessToken, refreshToken };
};

export const registerUser = async ({ email, password, role, employeeId }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error('Email đã tồn tại');
    err.status = 400;
    throw err;
  }
  // Kiểm tra employeeId có hợp lệ không
  const employee = await Employee.findById(employeeId);
    if (!employee) {
      const err = new Error('Employee không tồn tại');
      err.status = 400;
      throw err;
    }

    const newUser = new User({
      email,
      password,
      role,
      employeeId
    });

    await newUser.save();
    return newUser;
  };