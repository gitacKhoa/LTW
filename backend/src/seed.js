require("dotenv").config();
const bcrypt = require("bcryptjs");
const { Student, User, Subject, Grade, Notification } = require("./models");
const sequelize = require("./config/sequelize");

const subjects = [
  { id: "MH01", name: "Toán cao cấp", credits: 3, isActive: true },
  { id: "MH02", name: "Lập trình hướng đối tượng", credits: 4, isActive: true },
  { id: "MH03", name: "Cơ sở dữ liệu", credits: 3, isActive: true },
  { id: "MH04", name: "Tiếng Anh", credits: 2, isActive: true },
  { id: "MH05", name: "Kỹ năng mềm", credits: 2, isActive: true },
  { id: "MH06", name: "Mạng máy tính", credits: 3, isActive: true },
  { id: "MH07", name: "Cấu trúc dữ liệu & giải thuật", credits: 4, isActive: true },
];

const students = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    fullName: "Trần Minh Quân",
    studentCode: "SV1001",
    className: "CNTT-K15",
    email: "SV1001@ptit.edu.vn",
    gpa: 8.6,
    academicRank: "Giỏi",
    status: "pass",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    fullName: "Nguyễn Văn An",
    studentCode: "SV1002",
    className: "Kinh tế-K15",
    email: "SV1002@ptit.edu.vn",
    gpa: 7.8,
    academicRank: "Khá",
    status: "pass",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    fullName: "Lê Thị Mai",
    studentCode: "SV1003",
    className: "QTKD-K15",
    email: "SV1003@ptit.edu.vn",
    gpa: 6.9,
    academicRank: "Khá",
    status: "pass",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    fullName: "Phạm Hoàng Nam",
    studentCode: "SV1004",
    className: "CNTT-K15",
    email: "SV1004@ptit.edu.vn",
    gpa: 5.7,
    academicRank: "Trung bình",
    status: "pass",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    fullName: "Nguyễn Thị Lan",
    studentCode: "SV1005",
    className: "QTHT-K15",
    email: "SV1005@ptit.edu.vn",
    gpa: 4.5,
    academicRank: "Yếu",
    status: "fail",
  },
];

const users = [
  {
    fullName: "Quản trị hệ thống",
    username: "admin",
    password: "admin123",
    userCode: "ADM001",
    role: "admin",
    status: "active",
    studentCode: null,
  },
  {
    fullName: "Giảng viên Toán",
    username: "teacher",
    password: "teacher123",
    userCode: "TEA001",
    role: "teacher",
    status: "active",
    studentCode: null,
  },
  {
    fullName: "Trần Minh Quân",
    username: "student",
    password: "student123",
    userCode: "STD001",
    role: "student",
    status: "active",
    studentCode: "SV1001",
  },
];

const grades = [
  { id: "SV1001-MH01", studentCode: "SV1001", subjectId: "MH01", processScore: 8.5, examScore: 9.0, totalScore: 8.8, evaluation: "Tốt" },
  { id: "SV1001-MH02", studentCode: "SV1001", subjectId: "MH02", processScore: 8.0, examScore: 9.2, totalScore: 8.7, evaluation: "Tốt" },
  { id: "SV1001-MH03", studentCode: "SV1001", subjectId: "MH03", processScore: 7.8, examScore: 8.9, totalScore: 8.5, evaluation: "Tốt" },
  { id: "SV1002-MH01", studentCode: "SV1002", subjectId: "MH01", processScore: 7.5, examScore: 8.6, totalScore: 8.1, evaluation: "Khá" },
  { id: "SV1002-MH02", studentCode: "SV1002", subjectId: "MH02", processScore: 7.8, examScore: 8.1, totalScore: 8.0, evaluation: "Khá" },
  { id: "SV1003-MH03", studentCode: "SV1003", subjectId: "MH03", processScore: 6.0, examScore: 7.5, totalScore: 6.9, evaluation: "Khá" },
  { id: "SV1004-MH02", studentCode: "SV1004", subjectId: "MH02", processScore: 5.0, examScore: 6.2, totalScore: 5.7, evaluation: "Trung bình" },
  { id: "SV1005-MH04", studentCode: "SV1005", subjectId: "MH04", processScore: 4.0, examScore: 5.0, totalScore: 4.5, evaluation: "Yếu" },
];

const notifications = [
  { title: "Bảng điểm học kỳ 1 đã được duyệt", description: "Khoa CNTT vừa xác nhận bảng điểm cho sinh viên.", isRead: false },
  { title: "File Excel nhập điểm có 2 dòng lỗi", description: "Lớp QTKD-K15 — vui lòng kiểm tra lại mã sinh viên.", isRead: false },
  { title: "3 sinh viên vừa nộp đơn phúc khảo", description: "Môn Cơ sở dữ liệu — hạn xử lý 20/09.", isRead: true },
  { title: "Thông báo lịch họp khoa", description: "Họp đánh giá tiến độ giảng dạy vào lúc 9:00 sáng thứ Sáu.", isRead: false },
];

const runSeed = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK");

    await sequelize.sync({ alter: true });
    console.log("Database synchronized");

    await Subject.bulkCreate(subjects, {
      updateOnDuplicate: ["name", "credits", "isActive", "updatedAt"],
    });
    console.log(`Seeded ${subjects.length} subjects`);

    await Student.bulkCreate(students, {
      updateOnDuplicate: ["fullName", "studentCode", "className", "email", "gpa", "academicRank", "status", "updatedAt"],
    });
    console.log(`Seeded ${students.length} students`);

    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      const existing = await User.findOne({ where: { username: user.username } });

      if (existing) {
        await existing.update({
          fullName: user.fullName,
          username: user.username,
          password: passwordHash,
          userCode: user.userCode,
          role: user.role,
          status: user.status,
        });
      } else {
        const student = user.studentCode ? await Student.findOne({ where: { studentCode: user.studentCode } }) : null;
        await User.create({
          fullName: user.fullName,
          username: user.username,
          password: passwordHash,
          userCode: user.userCode,
          role: user.role,
          status: user.status,
          studentId: student ? student.id : null,
        });
      }
    }
    console.log(`Seeded ${users.length} users`);

    const studentMap = new Map((await Student.findAll()).map((s) => [s.studentCode, s.id]));
    for (const item of grades) {
      const studentId = studentMap.get(item.studentCode);
      if (!studentId) continue;

      const [grade] = await Grade.findOrCreate({
        where: { id: item.id },
        defaults: {
          id: item.id,
          studentId,
          subjectId: item.subjectId,
          processScore: item.processScore,
          examScore: item.examScore,
          totalScore: item.totalScore,
          evaluation: item.evaluation,
        },
      });

      if (grade) {
        await grade.update({
          studentId,
          subjectId: item.subjectId,
          processScore: item.processScore,
          examScore: item.examScore,
          totalScore: item.totalScore,
          evaluation: item.evaluation,
        });
      }
    }
    console.log(`Seeded ${grades.length} grades`);

    for (const item of notifications) {
      await Notification.findOrCreate({
        where: { title: item.title },
        defaults: item,
      });
    }
    console.log(`Seeded ${notifications.length} notifications`);

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

runSeed();
