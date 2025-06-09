import Payroll from '../models/payroll.model.js';
import Employee from '../models/employee.model.js';
import TimeSheet from '../models/timeSheet.model.js';
import dayjs from 'dayjs';

export const createPayroll = async (payrollData) => {
    try {
        const { employeeId, term } = payrollData;
        
        // Kiểm tra xem đã tồn tại bảng lương cho nhân viên trong kỳ lương này chưa
        const existingPayroll = await Payroll.findOne({ employeeId, term });
        if (existingPayroll) {
            throw new Error('Đã tồn tại bảng lương cho nhân viên này trong kỳ lương đã chọn');
        }

        // Kiểm tra sự tồn tại của nhân viên
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw new Error('Không tìm thấy thông tin nhân viên');
        }

        // Tạo bảng lương mới chỉ với thông tin cốt lõi
        const payroll = await Payroll.create({
            employeeId,
            term,
            status: "Đã thanh toán"
        });
        
        // Trả về thông tin bảng lương kèm theo các giá trị được tính toán
        return await getPayrollWithCalculatedValues(payroll);
    } catch (error) {
        throw error;
    }
}

export const getAllPayrollInTerm = async (term) => {
    try {
        const payrolls = await Payroll.find({ term });
        // Map qua từng bảng lương để thêm các giá trị được tính toán
        const payrollsWithCalculatedValues = await Promise.all(
            payrolls.map(payroll => getPayrollWithCalculatedValues(payroll))
        );
        return payrollsWithCalculatedValues;
    } catch (error) {
        throw error;
    }
}

export const deletePayroll = async (payrollId) => {
    try {
        const payroll = await Payroll.findByIdAndDelete(payrollId);
        if (!payroll) {
            throw new Error('Không tìm thấy bảng lương');
        }
        return payroll;
    } catch (error) {
        throw error;
    }
}

// Hàm helper để tính toán các giá trị dẫn xuất cho một bảng lương
async function getPayrollWithCalculatedValues(payroll) {
    try {
        // Lấy thông tin nhân viên
        const employee = await Employee.findById(payroll.employeeId);
        if (!employee) {
            throw new Error('Không tìm thấy thông tin nhân viên');
        }

        // Tách tháng và năm từ term
        const [month, year] = payroll.term.split('/');

        // Tính toán ngày đầu và cuối của tháng
        const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate();
        const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate();

        // Lấy tất cả timesheet đã hoàn thành của nhân viên trong tháng
        const timesheets = await TimeSheet.find({
            employeeId: employee._id,
            status: "Hoàn thành",
            day: {
                $gte: startDate,
                $lte: endDate
            }
        });

        // Tính tổng số giờ làm việc và tổng thưởng/phạt
        let totalHours = 0;
        let totalBonus = 0;
        let totalFine = 0;

        timesheets.forEach(timesheet => {
            const timeSheetDate = dayjs(timesheet.day);
            const checkIn = timeSheetDate.hour(parseInt(timesheet.checkIn.split(':')[0]))
                                       .minute(parseInt(timesheet.checkIn.split(':')[1]));
            const checkOut = timeSheetDate.hour(parseInt(timesheet.checkOut.split(':')[0]))
                                        .minute(parseInt(timesheet.checkOut.split(':')[1]));

            let hoursWorked = checkOut.diff(checkIn, 'hour', true);
            
            if (hoursWorked > 0) {
                hoursWorked = parseFloat(hoursWorked.toFixed(2));
                totalHours += hoursWorked;
            }

            if (timesheet.bonus) totalBonus += timesheet.bonus;
            if (timesheet.fine) totalFine += timesheet.fine;
        });

        // Tính lương cơ bản và tổng lương
        const baseSalary = totalHours * employee.salaryPerHour;
        const totalSalary = baseSalary + totalBonus - totalFine;

        // Trả về object với đầy đủ thông tin
        return {
            _id: payroll._id,
            employeeId: payroll.employeeId,
            name: employee.name,
            term: payroll.term,
            status: payroll.status,
            calculatedValues: {
                totalHours: parseFloat(totalHours.toFixed(2)),
                baseSalary: parseFloat(baseSalary.toFixed(2)),
                bonus: parseFloat(totalBonus.toFixed(2)),
                fine: parseFloat(totalFine.toFixed(2)),
                totalSalary: parseFloat(totalSalary.toFixed(2))
            }
        };
    } catch (error) {
        throw error;
    }
}