# EduResult

Hệ thống quản lý và tra cứu kết quả học tập cho sinh viên, giáo viên và quản trị viên.

## Mục tiêu

- Quản lý sinh viên, môn học, điểm số
- Tra cứu kết quả học tập theo sinh viên hoặc theo lớp
- Dashboard thống kê về tỷ lệ đậu/rớt và điểm trung bình
- Nhập điểm thủ công hoặc từ file Excel
- Login theo vai trò: admin, teacher, student

## Công nghệ sử dụng

- Frontend: HTML, CSS, JavaScript thuần
- Backend: Node.js, Express.js
- Database: MySQL
- ORM: Sequelize
- Authentication: JWT + bcryptjs
- File upload: multer
- Excel import: xlsx

## Cấu trúc dự án

```text
Project/
├── backend/
│   ├── src/
│   ├── database/
│   ├── package.json
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── pages/
│   └── assets/
├── README.md
└── .gitignore
```

## Yêu cầu hệ thống

- Node.js >= 18
- MySQL >= 8.0
- npm
- Trình duyệt Chrome/Edge/Firefox

## Cài đặt

### 1. Clone dự án

```bash
git clone <repository-url>
cd Project
```

### 2. Cài đặt dependencies backend

```bash
cd backend
npm install
```

### 3. Tạo database MySQL

Tạo database tên `eduresult` trong MySQL:

```sql
CREATE DATABASE IF NOT EXISTS eduresult CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Nếu project có file SQL mẫu, bạn có thể import:

```bash
mysql -u root -p eduresult < database/eduresult_mysql.sql
```

### 4. Cấu hình môi trường

Tạo file `.env` trong thư mục `backend` nếu cần, ví dụ:

```env
DB_NAME=eduresult
DB_USER=root
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=secret_key
PORT=5000
```

## Chạy dự án

### Backend

```bash
cd backend
node server.js
```

Backend sẽ chạy tại:

```text
http://localhost:5000
```

### Frontend

Từ thư mục gốc, chạy static server:

```bash
cd frontend
python -m http.server 8080
```

Frontend sẽ chạy tại:

```text
http://localhost:8080/pages/login.html
```

Hoặc nếu bạn đang mở trực tiếp từ file HTML, hãy đảm bảo các file JS/CSS được load đúng đường dẫn.

## Tài khoản demo

Sau khi chạy backend và seed dữ liệu, bạn có thể đăng nhập với:

```text
Admin:
- username: admin
- password: admin123

Teacher:
- username: teacher
- password: teacher123

Student:
- username: student
- password: student123
```

## Các API chính

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/students`
- `GET /api/subjects`
- `GET /api/grades`
- `POST /api/grades`
- `POST /api/grades/upload`
- `GET /api/dashboard/stats`
- `GET /api/dashboard/leaderboard`
- `GET /api/notifications`

## Ghi chú phát triển

- Frontend hiện đang là static page nên cần chạy cùng backend để lấy dữ liệu thật.
- Đối với môi trường local, backend và frontend chạy trên hai cổng khác nhau: `5000` và `8080`.
- Nếu gặp lỗi database, hãy kiểm tra:
  - database `eduresult` đã tồn tại
  - username/password MySQL đúng
  - file SQL đã được import

## Kiểm tra nhanh

Mở browser và truy cập:

```text
http://localhost:8080/pages/login.html
```

Sau đó đăng nhập với tài khoản demo để kiểm tra các chức năng.

## License

Dự án dùng cho mục đích học tập và demo.
