import Assignment from '../models/assignment.model.js';
import Employee from '../models/employee.model.js';
import WorkSchedule from '../models/workShcedule.js';

const ALLOWED_POSITIONS = {
  'Pha chế': ['Pha chế', 'Phục vụ', 'Thu ngân'],
  'Quản lý': ['Pha chế', 'Phục vụ', 'Thu ngân'],
  'Admin': ['Pha chế', 'Phục vụ', 'Thu ngân'],
  'Phục vụ': ['Phục vụ'],
  'Thu ngân': ['Thu ngân']
};

export const createAssignment = async (assignmentData) => {
  const { employee, workSchedule, status, day, position } = assignmentData;
  
  // Kiểm tra nhân viên và ca làm
  const employeeData = await Employee.findById(employee._id, 'name position');
  const workScheduleData = await WorkSchedule.findById(workSchedule._id);
  
  if (!employeeData || !workScheduleData) {
    throw new Error('Nhân viên hoặc ca làm không tồn tại!');
  }

  // Kiểm tra vị trí có phù hợp với chức vụ không
  const allowedPositions = ALLOWED_POSITIONS[employeeData.position];
  if (!allowedPositions || !allowedPositions.includes(position)) {
    throw new Error(`Nhân viên với chức vụ ${employeeData.position} không thể đăng ký vị trí ${position}`);
  }

  // Kiểm tra trùng ca làm trong cùng ngày
  const existingAssignment = await Assignment.findOne({
    'employee._id': employee._id,
    day: day,
    'workSchedule._id': workSchedule._id
  });

  if (existingAssignment) {
    throw new Error('Nhân viên đã đăng ký ca làm này trong ngày!');
  }

  // Kiểm tra xem nhân viên đã đăng ký bao nhiêu ca trong ngày
  const assignmentsInDay = await Assignment.countDocuments({
    'employee._id': employee._id,
    day: day
  });


  const newAssignment = new Assignment({
    day,
    employee: {
      _id: employee._id,
      name: employeeData.name,
      position: employeeData.position,
    },
    workSchedule: {
      _id: workScheduleData._id,
      key: workScheduleData.key,
      workSchedule: workScheduleData.workSchedule,
      timeStart: workScheduleData.timeStart,
      timeEnd: workScheduleData.timeEnd
    },
    status,
    position,
  });

  await newAssignment.save();
  return newAssignment;
};

export const getAllAssignments = async () => {
  return await Assignment.find();
};

export const updateAssignmentStatus = async (id, status) => {
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    throw new Error('Đăng ký ca làm không tồn tại.');
  }
  assignment.status = status;
  await assignment.save();
  return assignment;
};

export const getAssignmentsByEmployeeId = async (employeeId) => {
  const assignments = await Assignment.find({ 'employee._id': employeeId });
  return assignments;
}

export const deleteAssignment = async (id) => {
  const assignment = await Assignment.findByIdAndDelete(id);
  if (!assignment) {
    throw new Error('Đăng ký ca làm không tồn tại.');
  }
  return assignment;
}