const express = require("express");
const { body, param, validationResult } = require("express-validator");
const studentController = require("../controllers/student.controller");
const { verifyToken, isAdmin, isTeacher } = require("../middlewares/auth.middleware");

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: errors.array() });
  }
  return next();
};

router.get("/", verifyToken, isTeacher, studentController.getAllStudents);
router.get("/:id", verifyToken, isTeacher, [param("id").isUUID().withMessage("ID không hợp lệ")], handleValidation, studentController.getStudentById);
router.post(
  "/",
  verifyToken,
  isAdmin,
  [
    body("fullName").trim().isLength({ min: 2 }).withMessage("Họ tên tối thiểu 2 ký tự"),
    body("studentCode").trim().notEmpty().withMessage("studentCode là bắt buộc"),
  ],
  handleValidation,
  studentController.createStudent
);
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  [
    param("id").isUUID().withMessage("ID không hợp lệ"),
    body("fullName").optional().trim().isLength({ min: 2 }).withMessage("Họ tên tối thiểu 2 ký tự"),
  ],
  handleValidation,
  studentController.updateStudent
);
router.delete("/:id", verifyToken, isAdmin, [param("id").isUUID().withMessage("ID không hợp lệ")], handleValidation, studentController.deleteStudent);

module.exports = router;
