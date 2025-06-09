import express from 'express';
import { createShiftController, getShiftsByMonthYearController, getShiftsController, deleteShiftController, updateShiftByWorkScheduleController, deleteWorkScheduleInShiftController } from '../controllers/shift.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(verifyToken); 

// Lấy tất cả ca làm
router.get('/shifts', getShiftsController);

// Lấy ca làm theo tháng và năm
router.get('/shifts/by-month-year', getShiftsByMonthYearController);

// Tạo ca làm mới
router.post('/shifts', createShiftController);

// Cập nhật nhân viên trong ca làm
router.put('/shifts/update-employees', authorizeRoles(['Admin', 'Manager']), updateShiftByWorkScheduleController);

// Xóa workSchedule trong ca làm
router.delete('/shifts/work-schedule', authorizeRoles(['Admin', 'Manager']), deleteWorkScheduleInShiftController);

// Xóa ca làm (đặt ở cuối cùng vì có tham số động)
router.delete('/shifts/:shiftId', authorizeRoles(['Admin', 'Manager']), deleteShiftController);

export default router;