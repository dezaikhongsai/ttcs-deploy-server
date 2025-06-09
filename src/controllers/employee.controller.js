import * as employeeService from '../services/employee.service.js';

export const createEmployee = async (req, res) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const { page, limit, name, position, gender , sortBy= "name" , sortOrder = "asc"} = req.query;
    const result = await employeeService.getAllEmployees({
      page,
      limit,
      name,
      position,
      gender,
      sortBy,
      sortOrder, 
    });

    res.json({
      message: 'Lấy danh sách nhân viên thành công',
      data: result.employees,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalRecords: result.totalRecords,
        limit: result.limit,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const updated = await employeeService.updateEmployee(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Employee not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const deleted = await employeeService.deleteEmployee(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEmployeeStatistics = async (req, res) => {
  try {
    const statistics = await employeeService.getEmployeeStatistics();
    res.json({
      message: 'Lấy thống kê nhân viên thành công',
      data: statistics
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEmployeeWithPossition = async (req, res) => {
  try {
    const employees = await employeeService.getEmployeeWithPossition();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};