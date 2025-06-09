import {getAllTimeSheets , getTimeSheetByEmployeeId , createTimeSheet , udateTimeSheet , deletaTimeSheet, getSalaryAllEmployee, getSalaryByEmployeeId} from '../services/timesheet.service.js';

export const getAllTimeSheetsController = async (req, res) => {
    try {
        const timeSheet = await getAllTimeSheets();
        res.status(200).json({
            message: 'Lấy danh sách bảng chấm công thành công!',
            data: timeSheet,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getTimeSheetByEmployeeIdController = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { month, year } = req.query;

        // Validate month and year
        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp tháng và năm để lấy bảng chấm công'
            });
        }

        const timeSheet = await getTimeSheetByEmployeeId(employeeId, parseInt(month), parseInt(year));
        res.status(200).json({
            success: true,
            message: 'Lấy bảng chấm công theo ID nhân viên thành công!',
            data: timeSheet,
        });
    } catch (error) {
        res.status(error.status || 500).json({ 
            success: false,
            message: error.message 
        });
    }
}

export const createTimeSheetController = async (req, res) => {
    try {
        const timeSheetData = req.body;
        const newTimeSheet = await createTimeSheet(timeSheetData);
        res.status(201).json({
            success : true,
            message: 'Tạo bảng chấm công thành công!',
            data: newTimeSheet,
        });
    } catch (error) {
        res.status(500).json({ 
            success : false,
            message: error.message 
        });
    }
}

export const updateTimeSheetController = async (req, res) => {
    try {
        const { id } = req.params;
        const timeSheetData = req.body;
        const updatedTimeSheet = await udateTimeSheet(id, timeSheetData);
        res.status(200).json({
            success : true,
            message: 'Cập nhật bảng chấm công thành công!',
            data: updatedTimeSheet,
        });
    } catch (error) {

        res.status(500).json({ 
            success : false,
            message: error.message });
    }
}

export const deleteTimeSheetController = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTimeSheet = await deletaTimeSheet(id);
        res.status(200).json({
            message: 'Xóa bảng chấm công thành công!',
            data: deletedTimeSheet,
        });    
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getSalaryAllEmployeeController = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        // Validate month and year
        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp tháng và năm để tính lương'
            });
        }

        const salaryData = await getSalaryAllEmployee(parseInt(month), parseInt(year));
        res.status(200).json({
            success: true,
            message: 'Lấy thông tin lương thành công!',
            data: salaryData
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const getSalaryByEmployeeIdController = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { month, year } = req.query;
        
        // Validate month and year
        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp tháng và năm để tính lương'
            });
        }

        const salaryData = await getSalaryByEmployeeId(employeeId, parseInt(month), parseInt(year));
        res.status(200).json({
            success: true,
            message: 'Lấy thông tin lương thành công!',
            data: salaryData
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};