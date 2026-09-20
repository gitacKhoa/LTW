const { Op } = require("sequelize");
const { Student, User } = require("../models");

exports.getAllStudents = async (req, res) => {
  try {
    const { search = "", klass = "", page = 1, limit = 10 } = req.query;
    const where = {};
    const searchTerm = String(search).trim();
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 10);
    const offset = (pageNumber - 1) * pageSize;

    if (searchTerm) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${searchTerm}%` } },
        { studentCode: { [Op.like]: `%${searchTerm}%` } },
        { className: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    if (klass) {
      where.className = { [Op.like]: `%${klass}%` };
    }

    const { rows, count } = await Student.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "user", attributes: ["id", "username", "role"] }],
      limit: pageSize,
      offset,
    });

    return res.status(200).json({
      rows,
      total: count,
      page: pageNumber,
      limit: pageSize,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lấy danh sách sinh viên thất bại", error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [{ model: User, as: "user", attributes: ["id", "username", "role"] }],
    });

    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    }

    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({ message: "Lấy thông tin sinh viên thất bại", error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { fullName, studentCode, className, email, gpa, academicRank, status } = req.body;

    if (!fullName || !studentCode) {
      return res.status(400).json({ message: "fullName và studentCode là bắt buộc" });
    }

    const exists = await Student.findOne({ where: { studentCode } });
    if (exists) {
      return res.status(409).json({ message: "Mã sinh viên đã tồn tại" });
    }

    const student = await Student.create({
      fullName,
      studentCode,
      className,
      email,
      gpa,
      academicRank,
      status: status || "none",
    });

    return res.status(201).json(student);
  } catch (error) {
    return res.status(500).json({ message: "Tạo sinh viên thất bại", error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    }

    const updated = await student.update(req.body);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Cập nhật sinh viên thất bại", error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    }

    await student.destroy();
    return res.status(200).json({ message: "Xóa sinh viên thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Xóa sinh viên thất bại", error: error.message });
  }
};
