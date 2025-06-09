import express from 'express';
import {
    getAllTimeSheetsController,
    getTimeSheetByEmployeeIdController,
    createTimeSheetController,
    updateTimeSheetController,
    deleteTimeSheetController,
    getSalaryAllEmployeeController,
    getSalaryByEmployeeIdController
} from '../controllers/timesheet.controller.js';

import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(verifyToken);

router.get('/', getAllTimeSheetsController);
router.get('/employee/:employeeId', getTimeSheetByEmployeeIdController);
router.get('/salary', getSalaryAllEmployeeController);
router.get('/salary/:employeeId', getSalaryByEmployeeIdController);
router.post('/', createTimeSheetController);
router.put('/:id', updateTimeSheetController);
router.delete('/:id', deleteTimeSheetController);

export default router;