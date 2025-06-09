import express from 'express';
import { createPayroll, getPayrollsByTerm, deletePayrollById } from '../controllers/payroll.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(verifyToken); 
router.use(authorizeRoles(['Admin', 'Manager'])); 

// POST /api/payroll - Tạo mới bảng lương
router.post("/", createPayroll);

// GET /api/payroll?term=MM/YYYY - Lấy danh sách bảng lương theo kỳ lương
router.get('/', getPayrollsByTerm);

// DELETE /api/payroll/:id - Xóa bảng lương theo ID
router.delete('/:id', deletePayrollById);

export default router;
