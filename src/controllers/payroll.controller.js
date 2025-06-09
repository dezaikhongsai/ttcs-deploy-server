import { getAllPayrollInTerm, deletePayroll, createPayroll as createPayrollService } from '../services/payroll.service.js';

export const getPayrollsByTerm = async (req, res) => {
    try {
        const { term } = req.query;

        // Check if term is provided
        if (!term) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp kỳ lương (term) theo định dạng MM/YYYY'
            });
        }

        // Validate term format (month/year)
        const termRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
        if (!termRegex.test(term)) {
            return res.status(400).json({
                success: false,
                message: 'Định dạng kỳ lương không hợp lệ. Vui lòng sử dụng định dạng MM/YYYY (ví dụ: 03/2024)'
            });
        }

        const payrolls = await getAllPayrollInTerm(term);
        return res.status(200).json({
            success: true,
            data: payrolls
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deletePayrollById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPayroll = await deletePayroll(id);
        
        if (!deletedPayroll) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bảng lương'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Xóa bảng lương thành công',
            data: deletedPayroll
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const createPayroll = async (req, res) => {
    try {
        const { employeeId, name, term, baseSalary, totalSalary } = req.body;

        // Validate required fields
        if (!employeeId || !name || !term || !baseSalary || !totalSalary) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bảng lương'
            });
        }

        // Validate term format (MM/YYYY)
        const termRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
        if (!termRegex.test(term)) {
            return res.status(400).json({
                success: false,
                message: 'Định dạng kỳ lương không hợp lệ. Vui lòng sử dụng định dạng MM/YYYY (ví dụ: 03/2024)'
            });
        }

        const payroll = await createPayrollService({
            employeeId,
            name,
            term,
            baseSalary,
            totalSalary
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo bảng lương thành công',
            data: payroll
        });

    } catch (error) {
        // Handle specific error for duplicate payroll
        if (error.message.includes('Đã tồn tại bảng lương')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
