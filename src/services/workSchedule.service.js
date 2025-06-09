import WorkSchedule from '../models/workShcedule.js';

// Thêm WorkSchedule
export const createWorkSchedule = async (data) => {
  const newWorkSchedule = new WorkSchedule(data);
  return await newWorkSchedule.save();
};

// Lấy tất cả WorkSchedules
export const getAllWorkSchedules = async () => {
  return await WorkSchedule.find();
};

// Lấy WorkSchedule theo ID
export const getWorkScheduleById = async (id) => {
  const workSchedule = await WorkSchedule.findById(id);
  if (!workSchedule) {
    throw new Error('WorkSchedule không tồn tại.');
  }
  return workSchedule;
};

// Sửa WorkSchedule
export const updateWorkSchedule = async (id, data) => {
  const updatedWorkSchedule = await WorkSchedule.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!updatedWorkSchedule) {
    throw new Error('WorkSchedule không tồn tại.');
  }
  return updatedWorkSchedule;
};

// Xóa WorkSchedule
export const deleteWorkSchedule = async (id) => {
  const deletedWorkSchedule = await WorkSchedule.findByIdAndDelete(id);
  if (!deletedWorkSchedule) {
    throw new Error('WorkSchedule không tồn tại.');
  }
  return deletedWorkSchedule;
};