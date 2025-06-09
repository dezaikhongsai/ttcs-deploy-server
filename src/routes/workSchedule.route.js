import express from 'express';
import {
  createWorkScheduleController,
  getAllWorkSchedulesController,
  getWorkScheduleByIdController,
  updateWorkScheduleController,
  deleteWorkScheduleController,
} from '../controllers/workSchedule.controller.js';

const router = express.Router();
router.post('/', createWorkScheduleController);
router.get('/', getAllWorkSchedulesController);
router.get('/:id', getWorkScheduleByIdController);
router.put('/:id', updateWorkScheduleController);
router.delete('/:id', deleteWorkScheduleController);

export default router;