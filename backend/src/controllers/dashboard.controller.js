const xlsx = require("xlsx");
const PDFDocument = require("pdfkit");
const { Student, Grade, Subject, User } = require("../models");
const { Op } = require("sequelize");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.count();

    const students = await Student.findAll({
      attributes: ["id", "gpa", "status"],
      where: { status: { [Op.ne]: "none" } },
    });

    const passCount = students.filter((s) => Number(s.gpa || 0) >= 5).length;
    const failCount = students.length - passCount;

    const highestStudent = await Student.findOne({
      where: { gpa: { [Op.not]: null } },
      order: [["gpa", "DESC"]],
    });

    const totalCourses = await Subject.count({ where: { isActive: true } });
    const averageGpa = students.length
      ? Number((students.reduce((sum, s) => sum + Number(s.gpa || 0), 0) / students.length).toFixed(2))
      : 0;

    const topStudents = await Student.findAll({
      where: { gpa: { [Op.not]: null } },
      order: [["gpa", "DESC"]],
      limit: 5,
      attributes: ["id", "fullName", "gpa", "academicRank"],
    });

    return res.status(200).json({
      totalStudents,
      passCount,
      failCount,
      passRate: students.length ? Number(((passCount / students.length) * 100).toFixed(2)) : 0,
      failRate: students.length ? Number(((failCount / students.length) * 100).toFixed(2)) : 0,
      highestStudent,
      averageGpa,
      totalCourses,
      topStudents,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lấy thống kê dashboard thất bại", error: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const students = await Student.findAll({
      where: { gpa: { [Op.not]: null } },
      order: [["gpa", "DESC"]],
      limit: 10,
      attributes: ["id", "fullName", "studentCode", "className", "gpa", "academicRank"],
    });

    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({ message: "Lấy bảng xếp hạng thất bại", error: error.message });
  }
};

exports.exportReportExcel = async (req, res) => {
  try {
    const students = await Student.findAll({
      order: [["className", "ASC"], ["fullName", "ASC"]],
      attributes: ["id", "fullName", "studentCode", "className", "gpa", "academicRank", "status"],
    });

    const headers = ["Mã sinh viên", "Họ tên", "Lớp", "GPA", "Xếp loại", "Trạng thái"];
    const rows = students.map((student) => [
      student.studentCode,
      student.fullName,
      student.className || "",
      student.gpa !== null && student.gpa !== undefined ? Number(student.gpa) : "",
      student.academicRank || "",
      student.status || "none",
    ]);

    const worksheet = xlsx.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "BaoCao");
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", 'attachment; filename="bao-cao-sinh-vien.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: "Xuất báo cáo Excel thất bại", error: error.message });
  }
};

exports.exportReportPdf = async (req, res) => {
  try {
    const students = await Student.findAll({
      order: [["className", "ASC"], ["fullName", "ASC"]],
      attributes: ["id", "fullName", "studentCode", "className", "gpa", "academicRank", "status"],
    });

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Disposition", 'attachment; filename="bao-cao-sinh-vien.pdf"');
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);
    doc.fontSize(18).text("Báo cáo tổng hợp sinh viên", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`Tổng số sinh viên: ${students.length}`);
    doc.moveDown();

    const tableTop = 120;
    const colX = [40, 130, 240, 330, 420, 500];
    const headers = ["MSSV", "Họ tên", "Lớp", "GPA", "Xếp loại", "Trạng thái"];

    doc.fontSize(9);
    headers.forEach((header, index) => {
      doc.text(header, colX[index], tableTop, { width: 80, align: "left" });
    });

    let y = tableTop + 20;
    students.forEach((student) => {
      const row = [
        student.studentCode || "",
        student.fullName || "",
        student.className || "",
        student.gpa !== null && student.gpa !== undefined ? String(Number(student.gpa)) : "",
        student.academicRank || "",
        student.status || "none",
      ];

      row.forEach((cell, index) => {
        doc.text(String(cell), colX[index], y, { width: 80, align: "left" });
      });
      y += 18;

      if (y > 700) {
        doc.addPage();
        y = 40;
      }
    });

    doc.end();
  } catch (error) {
    return res.status(500).json({ message: "Xuất báo cáo PDF thất bại", error: error.message });
  }
};
