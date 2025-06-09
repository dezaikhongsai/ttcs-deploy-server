import TimeSheet from '../models/timeSheet.model.js';
import Shift from '../models/shift.model.js';
import Employee from '../models/employee.model.js'
import dayjs from 'dayjs';

export const getAllTimeSheets = async () => {
    const timeSheet = await TimeSheet.find();
    if (!timeSheet) {
        const err = new Error('Không tìm thấy bảng chấm công');
        err.status = 404;
        throw err;
    }
    return timeSheet;   
}

export const createTimeSheet = async (timeSheetData) => {
    const { employeeId, day, workScheduleId, checkIn, checkOut, status, bonus, fine } = timeSheetData;

    // Kiểm tra shift hợp lệ
    const shift = await Shift.findOne({
        day: new Date(day),
        'shifts.workSchedule': workScheduleId,
        'shifts.employees.employee': employeeId
    });

    if (!shift) {
        const err = new Error('Không tìm thấy ca làm phù hợp cho nhân viên, ngày và lịch làm việc này.');
        err.status = 400;
        throw err;
    }
    // Nếu hợp lệ, tạo timesheet
    const timeSheet = new TimeSheet({
        employeeId,
        day,
        workScheduleId,
        checkIn,
        checkOut,
        status,
        bonus: bonus || 0,
        fine: fine || 0
    });

    await timeSheet.save();
    return timeSheet;
};
export const udateTimeSheet = async (id , timeSheetData) => {
    try {
        const timeSheet = await TimeSheet.findByIdAndUpdate(id, timeSheetData);
        if(!timeSheet) {
            const err = new Error('Không tìm thấy bảng chấm công');
            err.status = 404;
            throw err;
        }
        return timeSheet;
    } catch (error) {
        const err = new Error('Không tìm thấy bảng chấm công');
        err.status = 404;
        throw err;  
        
    }
};

export const deletaTimeSheet = async (id) => {
    const timeSheet = await TimeSheet.findByIdAndDelete(id);
    if (!timeSheet) {
        const err = new Error('Không tìm thấy bảng chấm công');
        err.status = 404;
        throw err;
    }
    return timeSheet;
}

export const getTimeSheetByEmployeeId = async (employeeId, month, year) => {
    try {
        // Tính toán ngày đầu và cuối của tháng
        const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate();
        const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate();

        // Tạo query với status = "Đã hoàn thành" và thêm điều kiện ngày
        const query = { 
            employeeId,
            // status: "Đã hoàn thành",
            day: {
                $gte: startDate,
                $lte: endDate
            }
        };

        // Thực hiện truy vấn với populate để lấy thông tin workSchedule
        const timeSheets = await TimeSheet.find(query)
            .populate('workScheduleId', 'workSchedule timeStart timeEnd')
            .sort({ day: -1 }); // Sắp xếp theo ngày mới nhất

        if (!timeSheets || timeSheets.length === 0) {
            const err = new Error(`Không tìm thấy bảng chấm công cho nhân viên này trong tháng ${month}/${year}`);
            err.status = 404;
            throw err;
        }

        return timeSheets;
    } catch (error) {
        // Nếu là lỗi từ việc không tìm thấy dữ liệu, throw trực tiếp
        if (error.status === 404) {
            throw error;
        }
        // Nếu là lỗi khác, wrap lại với message phù hợp
        const err = new Error('Lỗi khi lấy bảng chấm công: ' + error.message);
        err.status = 500;
        throw err;
    }
};

export const getSalaryAllEmployee = async (month, year) => {
    try {
        // Lấy tất cả nhân viên
        const employees = await Employee.find();
        
        // Tạo mảng để lưu kết quả tính lương
        const salaryResults = [];

        // Tính toán ngày đầu và cuối của tháng
        const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate();
        const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate();

        // Tính lương cho từng nhân viên
        for (const employee of employees) {
            // Lấy tất cả timesheet đã hoàn thành của nhân viên trong tháng
            const timesheets = await TimeSheet.find({
                employeeId: employee._id,
                status: "Hoàn thành",
                day: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).populate('workScheduleId', 'workSchedule timeStart timeEnd');

            // Tính tổng số giờ làm việc
            let totalHours = 0;
            let totalBonus = 0;
            let totalFine = 0;

            timesheets.forEach(timesheet => {
                // Chuyển đổi thời gian check-in và check-out thành đối tượng dayjs
                const timeSheetDate = dayjs(timesheet.day);
                const checkIn = timeSheetDate.hour(parseInt(timesheet.checkIn.split(':')[0]))
                                           .minute(parseInt(timesheet.checkIn.split(':')[1]));
                const checkOut = timeSheetDate.hour(parseInt(timesheet.checkOut.split(':')[0]))
                                            .minute(parseInt(timesheet.checkOut.split(':')[1]));

                // Tính số giờ làm việc
                let hoursWorked = checkOut.diff(checkIn, 'hour', true);
                
                // Kiểm tra nếu số giờ làm việc hợp lệ (lớn hơn 0)
                if (hoursWorked > 0) {
                    // Làm tròn đến 2 chữ số thập phân
                    hoursWorked = parseFloat(hoursWorked.toFixed(2));
                    totalHours += hoursWorked;
                }

                // Cộng dồn bonus và fine từ timesheet
                if (timesheet.bonus) totalBonus += timesheet.bonus;
                if (timesheet.fine) totalFine += timesheet.fine;
            });

            // Tính lương cơ bản
            const baseSalary = totalHours * employee.salaryPerHour;

            // Tạo object salary
            const salary = {
                term: `${month}/${year}`,
                employeeId: employee._id,
                employeeName: employee.name,
                salaryPerHour: employee.salaryPerHour,
                totalTimeSheet: parseFloat(totalHours.toFixed(2)),
                baseSalary: parseFloat(baseSalary.toFixed(2)),
                bonus: parseFloat(totalBonus.toFixed(2)),
                fine: parseFloat(totalFine.toFixed(2)),
                totalSalary: parseFloat((baseSalary + totalBonus - totalFine).toFixed(2))
            };

            salaryResults.push(salary);
        }

        return salaryResults;
    } catch (error) {
        const err = new Error('Lỗi khi tính lương: ' + error.message);
        err.status = 500;
        throw err;
    }
};

export const getSalaryByEmployeeId = async (employeeId, month, year) => {
    try {
        // Tìm nhân viên theo ID
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            const err = new Error('Không tìm thấy nhân viên');
            err.status = 404;
            throw err;
        }

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
        }).populate('workScheduleId', 'workSchedule timeStart timeEnd');

        // Tính tổng số giờ làm việc
        let totalHours = 0;
        let totalBonus = 0;
        let totalFine = 0;

        timesheets.forEach(timesheet => {
            // Chuyển đổi thời gian check-in và check-out thành đối tượng dayjs
            const timeSheetDate = dayjs(timesheet.day);
            const checkIn = timeSheetDate.hour(parseInt(timesheet.checkIn.split(':')[0]))
                                       .minute(parseInt(timesheet.checkIn.split(':')[1]));
            const checkOut = timeSheetDate.hour(parseInt(timesheet.checkOut.split(':')[0]))
                                        .minute(parseInt(timesheet.checkOut.split(':')[1]));

            // Tính số giờ làm việc
            let hoursWorked = checkOut.diff(checkIn, 'hour', true);
            
            // Kiểm tra nếu số giờ làm việc hợp lệ (lớn hơn 0)
            if (hoursWorked > 0) {
                // Làm tròn đến 2 chữ số thập phân
                hoursWorked = parseFloat(hoursWorked.toFixed(2));
                totalHours += hoursWorked;
            }

            // Cộng dồn bonus và fine từ timesheet
            if (timesheet.bonus) totalBonus += timesheet.bonus;
            if (timesheet.fine) totalFine += timesheet.fine;
        });

        // Tính lương cơ bản
        const baseSalary = totalHours * employee.salaryPerHour;

        // Tạo object salary
        const salary = {
            term: `${month}/${year}`,
            employeeId: employee._id,
            employeeName: employee.name,
            salaryPerHour: employee.salaryPerHour,
            totalTimeSheet: parseFloat(totalHours.toFixed(2)),
            baseSalary: parseFloat(baseSalary.toFixed(2)),
            bonus: parseFloat(totalBonus.toFixed(2)),
            fine: parseFloat(totalFine.toFixed(2)),
            totalSalary: parseFloat((baseSalary + totalBonus - totalFine).toFixed(2))
        };
        return salary;
    } catch (error) {
        if (error.status) throw error;
        const err = new Error('Lỗi khi tính lương: ' + error.message);
        err.status = 500;
        throw err;
    }
};