import Employee from '../models/employee.model.js';

export const createEmployee = async (data) => {
  const newEmp = new Employee(data);
  return await newEmp.save();
};

export const getAllEmployees = async ({ page = 1, limit = 10, name = "", position = "", gender = "", sortBy = "name", sortOrder = "asc" }) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  if (name) { 
    query.name = { $regex: name, $options: "i" };
  }
  if (position) {
    query.position = position;
  }
  if (gender) {
    query.gender = gender;
  }
  // Tùy chỉnh sắp xếp theo tên (tên cuối cùng, họ, tên đệm)
  const sort = {};
  if (sortBy === "name") {
    sort["name"] = sortOrder === "asc" ? 1 : -1;
  }

  const employees = await Employee.aggregate([
    { $match: query },
    {
      $addFields: {
        lastName: { $arrayElemAt: [{ $split: ["$name", " "] }, -1] }, // Tên cuối cùng
        firstName: { $arrayElemAt: [{ $split: ["$name", " "] }, 0] }, // Họ
        middleName: {
          $cond: {
            if: { $gt: [{ $size: { $split: ["$name", " "] } }, 2] },
            then: { $arrayElemAt: [{ $split: ["$name", " "] }, 1] }, // Tên đệm
            else: "",
          },
        },
      },
    },
    {
      $sort: {
        lastName: sortOrder === "asc" ? 1 : -1,
        firstName: sortOrder === "asc" ? 1 : -1,
        middleName: sortOrder === "asc" ? 1 : -1,
      },
    },
    { $skip: skip },
    { $limit: limitNum },
  ]);

  const totalRecords = await Employee.countDocuments(query);

  return {
    employees,
    totalRecords,
    totalPages: Math.ceil(totalRecords / limitNum),
    currentPage: pageNum,
    limit: limitNum,
  };
};
export const getEmployeeById = async (id) => {
  return await Employee.findById(id);
};

export const updateEmployee = async (id, data) => {
  return await Employee.findByIdAndUpdate(id, data, { new: true });
};

export const deleteEmployee = async (id) => {
  return await Employee.findByIdAndDelete(id);
};

export const getEmployeeStatistics = async () => {
  const totalEmployees = await Employee.countDocuments();
  
  // Thống kê theo giới tính
  const genderStats = await Employee.aggregate([
    {
      $group: {
        _id: "$gender",
        count: { $sum: 1 }
      }
    }
  ]);

  // Tính tỉ lệ nam nữ
  const maleCount = genderStats.find(stat => stat._id === "Nam")?.count || 0;
  const femaleCount = genderStats.find(stat => stat._id === "Nữ")?.count || 0;
  
  const maleRatio = totalEmployees > 0 ? (maleCount / totalEmployees * 100).toFixed(2) : 0;
  const femaleRatio = totalEmployees > 0 ? (femaleCount / totalEmployees * 100).toFixed(2) : 0;

  // Thống kê theo vị trí
  const positionStats = await Employee.aggregate([
    {
      $group: {
        _id: "$position",
        count: { $sum: 1 },
        avgSalary: { $avg: "$salaryPerHour" }
      }
    }
  ]);

  // Thống kê theo độ tuổi
  const ageStats = await Employee.aggregate([
    {
      $addFields: {
        age: {
          $floor: {
            $divide: [
              { $subtract: [new Date(), "$dob"] },
              365 * 24 * 60 * 60 * 1000
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ["$age", 25] }, then: "Dưới 25" },
              { case: { $lt: ["$age", 35] }, then: "25-34" },
              { case: { $lt: ["$age", 45] }, then: "35-44" },
              { case: { $lt: ["$age", 55] }, then: "45-54" }
            ],
            default: "Trên 55"
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  // Thống kê lương trung bình theo giới tính
  const salaryByGender = await Employee.aggregate([
    {
      $group: {
        _id: "$gender",
        avgSalary: { $avg: "$salaryPerHour" },
        minSalary: { $min: "$salaryPerHour" },
        maxSalary: { $max: "$salaryPerHour" }
      }
    }
  ]);

  return {
    totalEmployees,
    genderStatistics: {
      male: {
        count: maleCount,
        ratio: `${maleRatio}%`
      },
      female: {
        count: femaleCount,
        ratio: `${femaleRatio}%`
      }
    },
    positionStatistics: positionStats.map(stat => ({
      position: stat._id,
      count: stat.count,
      averageSalary: stat.avgSalary.toFixed(2)
    })),
    ageStatistics: ageStats.map(stat => ({
      ageGroup: stat._id,
      count: stat.count,
      ratio: `${((stat.count / totalEmployees) * 100).toFixed(2)}%`
    })),
    salaryStatistics: {
      byGender: salaryByGender.map(stat => ({
        gender: stat._id,
        averageSalary: stat.avgSalary.toFixed(2),
        minSalary: stat.minSalary,
        maxSalary: stat.maxSalary
      }))
    }
  };
};
export const getEmployeeWithPossition = async () => {
  try {
    const employees = await Employee.find({}).select('name position _id');
    return employees;
  } catch (error) {
    throw new Error('Lỗi khi lấy danh sách nhân viên và vị trí');
  }
}