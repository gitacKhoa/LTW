const express = require("express");
const multer = require("multer");
const { body, param, validationResult } = require("express-validator");
const gradeController = require("../controllers/grade.controller");
const { verifyToken, isTeacher, isAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".xlsx", ".xls", ".csv"];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf("."));
    if (allowed.includes(ext) || file.mimetype.includes("spreadsheet") || file.mimetype.includes("excel") || file.mimetype.includes("csv")) {
      return cb(null, true);
    }
    return cb(new Error("Chỉ chấp nhận file Excel (.xlsx, .xls, .csv)"));
  },
});

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: errors.array() });
  }
  return next();
};

router.get("/search", verifyToken, isTeacher, gradeController.searchGrades);
router.get("/student/:studentId", verifyToken, isTeacher, [param("studentId").notEmpty().withMessage("studentId không được để trống")], handleValidation, gradeController.getStudentTranscript);
router.post(
  "/",
  verifyToken,
  isAdmin,
  [
    body("studentId").notEmpty().withMessage("studentId là bắt buộc"),
    body("subjectId").notEmpty().withMessage("subjectId là bắt buộc"),
    body("processScore").optional().isFloat({ min: 0, max: 10 }).withMessage("processScore phải từ 0 đến 10"),
    body("examScore").optional().isFloat({ min: 0, max: 10 }).withMessage("examScore phải từ 0 đến 10"),
  ],
  handleValidation,
  gradeController.createGrade
);
router.post("/upload", verifyToken, isAdmin, upload.single("file"), gradeController.importGradesFromExcel);
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  [
    param("id").notEmpty().withMessage("id không được để trống"),
    body("processScore").optional().isFloat({ min: 0, max: 10 }).withMessage("processScore phải từ 0 đến 10"),
    body("examScore").optional().isFloat({ min: 0, max: 10 }).withMessage("examScore phải từ 0 đến 10"),
  ],
  handleValidation,
  gradeController.updateGrade
);
router.delete("/:id", verifyToken, isAdmin, [param("id").notEmpty().withMessage("id không được để trống")], handleValidation, gradeController.deleteGrade);

module.exports = router;
