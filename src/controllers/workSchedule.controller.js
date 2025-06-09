import * as workScheduleService from '../services/workSchedule.service.js';

// Thêm WorkSchedule
export const createWorkScheduleController = async (req, res) => {
  try {
    const workSchedule = await workScheduleService.createWorkSchedule(req.body);
    res.status(201).json({
      message: 'Tạo WorkSchedule thành công!',
      data: workSchedule,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy tất cả WorkSchedules
export const getAllWorkSchedulesController = async (req, res) => {
  try {
    const workSchedules = await workScheduleService.getAllWorkSchedules();
    res.status(200).json({
      message: 'Lấy danh sách WorkSchedule thành công!',
      data: workSchedules,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy WorkSchedule theo ID
export const getWorkScheduleByIdController = async (req, res) => {
  try {
    const workSchedule = await workScheduleService.getWorkScheduleById(req.params.id);
    res.status(200).json({
      message: 'Lấy WorkSchedule thành công!',
      data: workSchedule,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Sửa WorkSchedule
export const updateWorkScheduleController = async (req, res) => {
  try {
    const updatedWorkSchedule = await workScheduleService.updateWorkSchedule(req.params.id, req.body);
    res.status(200).json({
      message: 'Cập nhật WorkSchedule thành công!',
      data: updatedWorkSchedule,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa WorkSchedule
export const deleteWorkScheduleController = async (req, res) => {
  try {
    const deletedWorkSchedule = await workScheduleService.deleteWorkSchedule(req.params.id);
    res.status(200).json({
      message: 'Xóa WorkSchedule thành công!',
      data: deletedWorkSchedule,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};