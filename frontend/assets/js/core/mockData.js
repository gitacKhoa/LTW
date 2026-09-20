/**
 * mockData.js
 * ---------------------------------------------------------
 * Temporary "database" that lives in the browser (localStorage).
 * This file exists ONLY so the frontend is fully clickable before
 * the Node.js backend exists. Every shape here mirrors the data
 * models described in the Integration & API Brief, so swapping
 * EduResultAPI's internals for real `fetch()` calls later should
 * not require touching any page code.
 * ---------------------------------------------------------
 */
(function (global) {
  const DB_KEY = 'eduresult_db_v1';

  // ---- deterministic "random" so the demo looks the same every run ----
  function seededRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }
  const rand = seededRandom(42);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const round1 = (n) => Math.round(n * 10) / 10;

  const FIRST_NAMES = ['Văn An', 'Thị Bình', 'Minh Quân', 'Thị Mai', 'Hoàng Anh', 'Đức Huy', 'Thị Lan', 'Quốc Bảo', 'Thị Thảo', 'Minh Đức', 'Văn Long', 'Thị Hà', 'Đình Khoa', 'Ngọc Linh', 'Gia Bảo', 'Thị Ngân', 'Tuấn Kiệt', 'Thị Thu', 'Anh Tuấn', 'Thị Huyền'];
  const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Ngô'];
  const CLASSES = ['CNTT-K15', 'Kinh tế-K15', 'QTKD-K15', 'Kỹ thuật-K15', 'ATTT-K16'];
  const SUBJECTS = [
    { id: 'MH01', name: 'Toán cao cấp', credit: 3 },
    { id: 'MH02', name: 'Lập trình hướng đối tượng', credit: 4 },
    { id: 'MH03', name: 'Cơ sở dữ liệu', credit: 3 },
    { id: 'MH04', name: 'Tiếng Anh', credit: 2 },
    { id: 'MH05', name: 'Kỹ năng mềm', credit: 2 },
    { id: 'MH06', name: 'Mạng máy tính', credit: 3 },
    { id: 'MH07', name: 'Cấu trúc dữ liệu & giải thuật', credit: 4 },
  ];

  function classification(score) {
    if (score === null || score === undefined) return { label: 'Chưa có KQ', tone: 'muted' };
    if (score >= 9) return { label: 'Xuất sắc', tone: 'success' };
    if (score >= 8) return { label: 'Tốt', tone: 'info' };
    if (score >= 6.5) return { label: 'Khá', tone: 'warn' };
    if (score >= 5) return { label: 'Trung bình', tone: 'muted' };
    return { label: 'Yếu', tone: 'fail' };
  }

  function academicRank(gpa) {
    if (gpa === null) return 'Chưa xếp loại';
    if (gpa >= 9) return 'Xuất sắc';
    if (gpa >= 8) return 'Giỏi';
    if (gpa >= 6.5) return 'Khá';
    if (gpa >= 5) return 'Trung bình';
    return 'Yếu';
  }

  function buildDatabase() {
    const students = [];
    const grades = [];
    const totalStudents = 48;

    for (let i = 1; i <= totalStudents; i++) {
      const mssv = 'SV' + String(1000 + i);
      const name = `${pick(LAST_NAMES)} ${pick(FIRST_NAMES)}`;
      const klass = pick(CLASSES);
      // 6% of students have no grades entered yet
      const hasGrades = rand() > 0.06;

      let gpa = null;
      const studentGrades = [];
      if (hasGrades) {
        // pick 4-6 subjects for this student
        const subjectCount = 4 + Math.floor(rand() * 3);
        const shuffled = [...SUBJECTS].sort(() => rand() - 0.5).slice(0, subjectCount);
        let weighted = 0, creditSum = 0;
        shuffled.forEach((subj) => {
          const base = 4.5 + rand() * 5.5; // skew across the full range
          const processScore = round1(Math.min(10, base + rand() * 1.2));
          const examScore = round1(Math.min(10, base - 0.4 + rand() * 1.4));
          const total = round1(processScore * 0.4 + examScore * 0.6);
          weighted += total * subj.credit;
          creditSum += subj.credit;
          studentGrades.push({
            id: `${mssv}-${subj.id}`,
            studentId: mssv,
            subjectId: subj.id,
            subjectName: subj.name,
            processScore,
            examScore,
            totalScore: total,
            evaluation: classification(total),
          });
        });
        gpa = round1(weighted / creditSum);
      }

      students.push({
        id: mssv,
        name,
        class: klass,
        email: `${mssv.toLowerCase()}@ptit.edu.vn`,
        gpa,
        rank: academicRank(gpa),
        status: gpa === null ? 'none' : gpa >= 5 ? 'pass' : 'fail',
      });
      grades.push(...studentGrades);
    }

    const users = [
      { id: 'U-ADMIN', role: 'admin', name: 'Nguyễn Văn An', email: 'admin@ptit.edu.vn', password: 'admin123', title: 'Quản trị viên' },
      { id: 'U-TEACHER', role: 'teacher', name: 'Trần Thị Bình', email: 'teacher@ptit.edu.vn', password: 'teacher123', title: 'Giáo viên - Khoa CNTT' },
      { id: 'U-STUDENT', role: 'student', name: 'Trần Minh Quân', email: 'student@ptit.edu.vn', password: 'student123', title: 'Sinh viên', studentId: 'SV1001' },
    ];
    // make sure the demo student account maps to a real seeded student with grades
    const demoStudent = students.find((s) => s.id === 'SV1001');
    if (demoStudent) {
      demoStudent.name = 'Trần Minh Quân';
      demoStudent.linkedUser = 'U-STUDENT';
    }

    const notifications = [
      { id: 1, title: 'Bảng điểm học kỳ 1 đã được duyệt', desc: 'Khoa CNTT vừa xác nhận bảng điểm.', read: false },
      { id: 2, title: 'File Excel nhập điểm có 2 dòng lỗi', desc: 'Lớp QTKD-K15 — vui lòng kiểm tra lại mã sinh viên.', read: false },
      { id: 3, title: '3 sinh viên vừa nộp đơn phúc khảo', desc: 'Môn Cơ sở dữ liệu — hạn xử lý 20/09.', read: true },
    ];

    return { users, students, grades, subjects: SUBJECTS, notifications, meta: { seededAt: Date.now() } };
  }

  function loadDatabase() {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* fallthrough to rebuild */ }
    }
    const fresh = buildDatabase();
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }

  function saveDatabase(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function resetDatabase() {
    localStorage.removeItem(DB_KEY);
    return loadDatabase();
  }

  global.EduResultMockDB = { loadDatabase, saveDatabase, resetDatabase, classification, academicRank, round1 };
})(window);
