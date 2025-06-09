import Shift from '../models/shift.model.js';
import mongoose from 'mongoose';

export const getShifts = async () => {
  const shifts = await Shift.find()
    .populate({
      path: 'shifts.workSchedule',
      select: 'key workSchedule timeStart timeEnd'
    })
    .populate({
      path: 'shifts.employees.employee',
      model: 'Employee',
      select: 'name'
    });
  return shifts;
};
export const createShift = async (shiftData) => {
  const { day, workScheduleId, employees } = shiftData;

  if (!mongoose.Types.ObjectId.isValid(workScheduleId)) {
    throw new Error('ID của ca làm việc không hợp lệ');
  }

  if (!Array.isArray(employees) || employees.length === 0) {
    throw new Error('Danh sách nhân viên không hợp lệ');
  }

  // Validate từng phần tử trong employees
  const validEmployees = employees.filter(emp =>
    emp &&
    mongoose.Types.ObjectId.isValid(emp.employeeId) &&
    typeof emp.roleInShift === 'string' &&
    emp.roleInShift.trim() !== ''
  );

  if (validEmployees.length !== employees.length) {
    throw new Error('Một hoặc nhiều nhân viên có thông tin không hợp lệ');
  }

  let shift = await Shift.findOne({ day });

  if (!shift) {
    // Nếu chưa có shift, tạo mới
    shift = new Shift({
      day,
      shifts: [{
        workSchedule: workScheduleId,
        employees: validEmployees.map(emp => ({
          employee: emp.employeeId,
          roleInShift: emp.roleInShift
        }))
      }]
    });
  } else {
    const existingWorkSchedule = shift.shifts.find(
      s => s.workSchedule.toString() === workScheduleId
    );

    if (existingWorkSchedule) {
      // Check trùng nhân viên
      const duplicateEmployees = validEmployees.filter(emp =>
        existingWorkSchedule.employees.some(e =>
          e?.employee?.toString() === emp.employeeId.toString()
        )
      );
      if (duplicateEmployees.length > 0) {
        throw new Error('Một hoặc nhiều nhân viên đã được phân công vào ca làm này');
      }

      // Thêm nhân viên mới
      existingWorkSchedule.employees.push(...validEmployees.map(emp => ({
        employee: emp.employeeId,
        roleInShift: emp.roleInShift
      })));
    } else {
      // Thêm ca làm mới
      shift.shifts.push({
        workSchedule: workScheduleId,
        employees: validEmployees.map(emp => ({
          employee: emp.employeeId,
          roleInShift: emp.roleInShift
        }))
      });
    }
  }

  await shift.save();

  return await Shift.findById(shift._id)
    .populate({
      path: 'shifts.workSchedule',
      select: 'key workSchedule timeStart timeEnd'
    })
    .populate({
      path: 'shifts.employees.employee',
      select: 'name position'
    });
};


export const getShiftsByMonthYear = async (month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const shifts = await Shift.find({
    day: { $gte: startDate, $lte: endDate }
  })
  .populate({
    path: 'shifts.workSchedule',
    select: 'key workSchedule timeStart timeEnd'
  })
  .populate({
    path: 'shifts.employees',
    select: 'name position'
  });

  return shifts;
};

export const deleteShift = async (shiftId) => {
  const shift = await Shift.findById(shiftId);
  if (!shift) {
    throw new Error('Không tìm thấy ca làm');
  }
  await shift.deleteOne();
};

export const updateEmployeesInShift = async (day, workScheduleId, employees) => {
  // Validate workScheduleId
  if (!mongoose.Types.ObjectId.isValid(workScheduleId)) {
    throw new Error('ID của ca làm việc không hợp lệ');
  }

  // Validate employees array
  if (!Array.isArray(employees) || employees.length === 0) {
    throw new Error('Danh sách nhân viên không hợp lệ');
  }

  // Validate từng phần tử trong employees
  const validEmployees = employees.filter(emp =>
    emp &&
    mongoose.Types.ObjectId.isValid(emp.employeeId) &&
    typeof emp.roleInShift === 'string' &&
    emp.roleInShift.trim() !== ''
  );

  if (validEmployees.length !== employees.length) {
    throw new Error('Một hoặc nhiều nhân viên có thông tin không hợp lệ');
  }

  // Tìm ca làm theo ngày
  const shift = await Shift.findOne({ day });
  if (!shift) {
    throw new Error('Không tìm thấy ca làm cho ngày này');
  }

  // Tìm ca làm cụ thể theo workScheduleId
  const workShift = shift.shifts.find(
    s => s.workSchedule.toString() === workScheduleId
  );
  if (!workShift) {
    throw new Error('Không tìm thấy ca làm việc này trong ngày');
  }

  // Cập nhật danh sách nhân viên
  workShift.employees = validEmployees.map(emp => ({
    employee: emp.employeeId,
    roleInShift: emp.roleInShift
  }));

  await shift.save();

  // Trả về dữ liệu đã cập nhật
  return await Shift.findById(shift._id)
    .populate({
      path: 'shifts.workSchedule',
      select: 'key workSchedule timeStart timeEnd'
    })
    .populate({
      path: 'shifts.employees.employee',
      select: 'name position'
    });
};

export const deleteWorkScheduleInShift = async (day, workScheduleId) => {
  // Validate workScheduleId
  if (!mongoose.Types.ObjectId.isValid(workScheduleId)) {
    throw new Error('ID của ca làm việc không hợp lệ');
  }

  // Tìm ca làm theo ngày
  const shift = await Shift.findOne({ day });
  if (!shift) {
    throw new Error('Không tìm thấy ca làm cho ngày này');
  }

  // Tìm index của workSchedule cần xóa
  const workScheduleIndex = shift.shifts.findIndex(
    s => s.workSchedule.toString() === workScheduleId
  );

  if (workScheduleIndex === -1) {
    throw new Error('Không tìm thấy ca làm việc này trong ngày');
  }

  // Xóa workSchedule khỏi mảng shifts
  shift.shifts.splice(workScheduleIndex, 1);

  // Nếu không còn ca làm nào, xóa luôn document shift
  if (shift.shifts.length === 0) {
    await shift.deleteOne();
    return null;
  }

  // Lưu thay đổi
  await shift.save();

  // Trả về dữ liệu đã cập nhật
  return await Shift.findById(shift._id)
    .populate({
      path: 'shifts.workSchedule',
      select: 'key workSchedule timeStart timeEnd'
    })
    .populate({
      path: 'shifts.employees.employee',
      select: 'name position'
    });
};



