import express from 'express';
import {
  createAssignmentController,
  getAllAssignmentsController,
  updateAssignmentStatusController,
  getAssignmentsByEmployeeIdController,
  deleteAssignmentController,
} from '../controllers/assignment.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(verifyToken);

router.get('/', getAllAssignmentsController);
router.get('/:employeeId', getAssignmentsByEmployeeIdController); 
router.post('/', createAssignmentController);
router.delete('/:id', deleteAssignmentController);
router.put('/status/:id', authorizeRoles(['Admin', 'Manager']), updateAssignmentStatusController);

export default router;
