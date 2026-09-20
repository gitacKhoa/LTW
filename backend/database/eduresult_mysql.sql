CREATE DATABASE IF NOT EXISTS eduresult
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE eduresult;

CREATE TABLE students (
  id CHAR(36) NOT NULL,
  fullName VARCHAR(150) NOT NULL,
  studentCode VARCHAR(50) NOT NULL UNIQUE,
  className VARCHAR(80) NULL,
  email VARCHAR(150) NULL,
  gpa DECIMAL(4,2) NULL,
  academicRank VARCHAR(50) NULL,
  status ENUM('none', 'pass', 'fail') NOT NULL DEFAULT 'none',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id CHAR(36) NOT NULL,
  fullName VARCHAR(150) NOT NULL,
  username VARCHAR(80) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  userCode VARCHAR(50) NOT NULL UNIQUE,
  role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
  status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  studentId CHAR(36) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_users_username (username),
  KEY idx_users_usercode (userCode),
  KEY idx_users_role (role),
  KEY idx_users_studentid (studentId),
  CONSTRAINT fk_users_student
    FOREIGN KEY (studentId) REFERENCES students(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subjects (
  id VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  credits INT NOT NULL,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE grades (
  id VARCHAR(50) NOT NULL,
  studentId CHAR(36) NOT NULL,
  subjectId VARCHAR(20) NOT NULL,
  processScore DECIMAL(4,2) NULL,
  examScore DECIMAL(4,2) NULL,
  totalScore DECIMAL(4,2) NULL,
  evaluation VARCHAR(30) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_grades_student (studentId),
  KEY idx_grades_subject (subjectId),
  CONSTRAINT fk_grades_student
    FOREIGN KEY (studentId) REFERENCES students(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_grades_subject
    FOREIGN KEY (subjectId) REFERENCES subjects(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  isRead TINYINT(1) NOT NULL DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO students (id, fullName, studentCode, className, email, gpa, academicRank, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Trần Minh Quân', 'SV1001', 'CNTT-K15', 'SV1001@ptit.edu.vn', 8.60, 'Giỏi', 'pass'),
  ('22222222-2222-2222-2222-222222222222', 'Nguyễn Văn An', 'SV1002', 'Kinh tế-K15', 'SV1002@ptit.edu.vn', 7.80, 'Khá', 'pass'),
  ('33333333-3333-3333-3333-333333333333', 'Lê Thị Mai', 'SV1003', 'QTKD-K15', 'SV1003@ptit.edu.vn', 6.90, 'Khá', 'pass');

INSERT INTO subjects (id, name, credits, isActive) VALUES
  ('MH01', 'Toán cao cấp', 3, 1),
  ('MH02', 'Lập trình hướng đối tượng', 4, 1),
  ('MH03', 'Cơ sở dữ liệu', 3, 1),
  ('MH04', 'Tiếng Anh', 2, 1),
  ('MH05', 'Kỹ năng mềm', 2, 1),
  ('MH06', 'Mạng máy tính', 3, 1),
  ('MH07', 'Cấu trúc dữ liệu & giải thuật', 4, 1);

INSERT INTO users (id, fullName, username, password, userCode, role, status, studentId) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Nguyễn Văn An', 'admin', '$2a$10$G9Q8MZ8u2LfxSt3s1rUOje0vL3vV0W2bVb8lF6Gv6Eu0P9cR8E0m2', 'ADM001', 'admin', 'active', NULL),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Trần Thị Bình', 'teacher', '$2a$10$FvP7cQ9tTt.7kG9PSmNs7eE9U0CyI1vL0ePdxrQv9hNlfKENwHt6O', 'TEA001', 'teacher', 'active', NULL),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Trần Minh Quân', 'student', '$2a$10$ci9HPTXJ9hP.uOQxv4sL8u0gOJ3J3gVvM2xVZ8x2NQ0aw1vK3v7G2', 'STD001', 'student', 'active', '11111111-1111-1111-1111-111111111111');

INSERT INTO grades (id, studentId, subjectId, processScore, examScore, totalScore, evaluation) VALUES
  ('SV1001-MH01', '11111111-1111-1111-1111-111111111111', 'MH01', 8.5, 9.0, 8.8, 'Tốt'),
  ('SV1001-MH02', '11111111-1111-1111-1111-111111111111', 'MH02', 8.0, 9.2, 8.7, 'Tốt'),
  ('SV1001-MH03', '11111111-1111-1111-1111-111111111111', 'MH03', 7.8, 8.9, 8.5, 'Tốt');

INSERT INTO notifications (title, description, isRead) VALUES
  ('Bảng điểm học kỳ 1 đã được duyệt', 'Khoa CNTT vừa xác nhận bảng điểm.', 0),
  ('File Excel nhập điểm có 2 dòng lỗi', 'Lớp QTKD-K15 — vui lòng kiểm tra lại mã sinh viên.', 0),
  ('3 sinh viên vừa nộp đơn phúc khảo', 'Môn Cơ sở dữ liệu — hạn xử lý 20/09.', 1);

CREATE INDEX idx_grades_student_subject ON grades(studentId, subjectId);