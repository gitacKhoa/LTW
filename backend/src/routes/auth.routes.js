const express = require("express");
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: errors.array() });
  }
  return next();
};

router.post(
  "/register",
  [
    body("fullName").trim().isLength({ min: 2 }).withMessage("Họ tên tối thiểu 2 ký tự"),
    body("username").trim().isLength({ min: 3 }).withMessage("Username tối thiểu 3 ký tự"),
    body("password").isLength({ min: 6 }).withMessage("Mật khẩu tối thiểu 6 ký tự"),
    body("userCode").trim().notEmpty().withMessage("userCode là bắt buộc"),
  ],
  handleValidation,
  authController.register
);

router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username không được để trống"),
    body("password").notEmpty().withMessage("Password không được để trống"),
  ],
  handleValidation,
  authController.login
);

router.get("/me", verifyToken, authController.getMe);

module.exports = router;
