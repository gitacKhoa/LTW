const xlsx = require("xlsx");
const { Op } = require("sequelize");
const { Grade, Student, Subject } = require("../models");

const evaluationLabel = (score) => {
  if (score === null || score === undefined) return "Chưa có KQ";
  if (score >= 9) return "Xuất sắc";
  if (score >= 8) return "Giỏi";
  if (score >= 6.5) return "Khá";
  if (score >= 5) return "Trung bình";
  return "Yếu";
};

const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numericValue = Number(String(value).replace(/,/g, ".").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : null;
};

const getByAlias = (row, aliases) => {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null && String(row[alias]).trim() !== "") {
      return row[alias];
    }
  }
  const keys = Object.keys(row);
  for (const key of keys) {
    if (aliases.includes(normalizeText(key))) {
      return row[key];
    }
  }
  return undefined;
};

exports.getStudentTranscript = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    }

    const grades = await Grade.findAll({
      where: { studentId },
      include: [{ model: Subject, as: "subject" }],
      order: [["createdAt", "ASC"]],
    });

    const courses = grades.map((g) => ({
      id: g.id,
      subjectId: g.subjectId,
      subjectName: g.subject?.name || "",
      credits: g.subject?.credits || 0,
      processScore: Number(g.processScore || 0),
      examScore: Number(g.examScore || 0),
      totalScore: Number(g.totalScore || 0),
      evaluation: g.evaluation || evaluationLabel(Number(g.totalScore || 0)),
    }));

    const totalCredits = courses.reduce((sum, item) => sum + Number(item.credits || 0), 0);
    const weighted = courses.reduce((sum, item) => sum + (Number(item.totalScore || 0) * Number(item.credits || 0)), 0);
    const gpa = totalCredits ? Number((weighted / totalCredits).toFixed(2)) : null;

    return res.status(200).json({
      student,
      gpa,
      academicRank: student.academicRank || (gpa !== null ? (gpa >= 9 ? "Xuất sắc" : gpa >= 8 ? "Giỏi" : gpa >= 6.5 ? "Khá" : gpa >= 5 ? "Trung bình" : "Yếu") : "Chưa xếp loại"),
      courses,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lấy bảng điểm thất bại", error: error.message });
  }
};

exports.createGrade = async (req, res) => {
  try {
    const { studentId, subjectId, processScore, examScore, totalScore } = req.body;

    if (!studentId || !subjectId) {
      return res.status(400).json({ message: "studentId và subjectId là bắt buộc" });
    }

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    }

    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Không tìm thấy môn học" });
    }

    const finalTotal = totalScore ?? ((Number(processScore || 0) * 0.4) + (Number(examScore || 0) * 0.6));

    const grade = await Grade.create({
      id: `${studentId}-${subjectId}`,
      studentId,
      subjectId,
      processScore,
      examScore,
      totalScore: Number(finalTotal.toFixed(2)),
      evaluation: evaluationLabel(Number(finalTotal.toFixed(2))),
    });

    return res.status(201).json(grade);
  } catch (error) {
    return res.status(500).json({ message: "Tạo điểm thất bại", error: error.message });
  }
};

exports.importGradesFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Thiếu file Excel để import" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, { defval: "", raw: false });

    if (!rows.length) {
      return res.status(400).json({ message: "File Excel không có dữ liệu" });
    }

    let successCount = 0;
    const errorRows = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const rowNumber = index + 2;

      const studentCode = getByAlias(row, ["studentcode", "student_code", "mssv", "ma sinh vien", "mã sinh viên", "student", "studentid"]);
      const subjectField = getByAlias(row, ["subjectid", "subject_id", "subjectcode", "subjectcode", "mã môn", "mamon", "subject", "monhoc", "subjectname", "môn học"]);
      const processScore = getByAlias(row, ["processscore", "process_score", "diemqt", "điểm quá trình", "process", "diem_qua_trinh"]);
      const examScore = getByAlias(row, ["examscore", "exam_score", "diemthi", "điểm thi", "exam", "diem_thi"]);
      const totalScore = getByAlias(row, ["totalscore", "total_score", "diemtb", "điểm tổng", "total", "diem_tong"]);

      if (!studentCode || !subjectField) {
        errorRows.push(rowNumber);
        continue;
      }

      const student = await Student.findOne({ where: { studentCode: String(studentCode).trim() } });
      let subject = await Subject.findByPk(String(subjectField).trim());

      if (!subject && subjectField) {
        subject = await Subject.findOne({ where: { name: String(subjectField).trim() } });
      }

      const parsedProcess = toNumber(processScore);
      const parsedExam = toNumber(examScore);
      const parsedTotal = toNumber(totalScore);

      if (!student || !subject || parsedProcess === null || parsedExam === null) {
        errorRows.push(rowNumber);
        continue;
      }

      const finalTotal = parsedTotal ?? (parsedProcess * 0.4 + parsedExam * 0.6);
      const safeTotal = Number(Math.max(0, Math.min(finalTotal, 10)).toFixed(2));

      await Grade.upsert({
        id: `${student.id}-${subject.id}`,
        studentId: student.id,
        subjectId: subject.id,
        processScore: Number(parsedProcess.toFixed(2)),
        examScore: Number(parsedExam.toFixed(2)),
        totalScore: safeTotal,
        evaluation: evaluationLabel(safeTotal),
      });

      successCount += 1;
    }

    return res.status(200).json({
      fileName: req.file.originalname,
      successCount,
      errorRows,
      totalRows: rows.length,
      message: "Import điểm Excel hoàn tất",
    });
  } catch (error) {
    return res.status(500).json({ message: "Import Excel thất bại", error: error.message });
  }
};

exports.searchGrades = async (req, res) => {
  try {
    const { query = "", type = "all", page = 1, limit = 8 } = req.query;
    const keyword = String(query).trim();
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 8);
    const offset = (pageNumber - 1) * pageSize;

    const where = {};
    if (keyword) {
      const likePattern = `%${keyword}%`;
      if (type === "mssv") {
        where.studentCode = { [Op.like]: likePattern };
      } else if (type === "class") {
        where.className = { [Op.like]: likePattern };
      } else if (type === "name") {
        where.fullName = { [Op.like]: likePattern };
      } else {
        where[Op.or] = [
          { fullName: { [Op.like]: likePattern } },
          { studentCode: { [Op.like]: likePattern } },
          { className: { [Op.like]: likePattern } },
        ];
      }
    }

    const { rows, count } = await Student.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "fullName", "studentCode", "className", "gpa", "academicRank", "status", "createdAt"],
    });

    const results = rows.map((student) => {
      const gpa = student.gpa !== null && student.gpa !== undefined ? Number(student.gpa) : null;
      const rank = student.academicRank || (gpa !== null ? (gpa >= 9 ? "Xuất sắc" : gpa >= 8 ? "Giỏi" : gpa >= 6.5 ? "Khá" : gpa >= 5 ? "Trung bình" : "Yếu") : "Chưa xếp loại");
      return {
        id: student.id,
        name: student.fullName,
        studentCode: student.studentCode,
        class: student.className,
        gpa,
        rank,
        status: student.status || "none",
      };
    });

    return res.status(200).json({
      rows: results,
      total: count,
      page: pageNumber,
      limit: pageSize,
    });
  } catch (error) {
    return res.status(500).json({ message: "Tìm kiếm sinh viên thất bại", error: error.message });
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: "Không tìm thấy điểm" });
    }

    const { processScore, examScore, totalScore } = req.body;
    const baseProcess = processScore ?? grade.processScore ?? 0;
    const baseExam = examScore ?? grade.examScore ?? 0;
    const finalTotal = totalScore ?? ((Number(baseProcess) * 0.4) + (Number(baseExam) * 0.6));

    const updated = await grade.update({
      ...req.body,
      totalScore: Number(finalTotal.toFixed(2)),
      evaluation: evaluationLabel(Number(finalTotal.toFixed(2))),
    });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Cập nhật điểm thất bại", error: error.message });
  }
};

exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: "Không tìm thấy điểm" });
    }

    await grade.destroy();
    return res.status(200).json({ message: "Xóa điểm thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Xóa điểm thất bại", error: error.message });
  }
};
