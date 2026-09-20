const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { verifyToken, isTeacher } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/stats", verifyToken, isTeacher, dashboardController.getDashboardStats);
router.get("/leaderboard", verifyToken, isTeacher, dashboardController.getLeaderboard);
router.get("/export/excel", verifyToken, isTeacher, dashboardController.exportReportExcel);
router.get("/export/pdf", verifyToken, isTeacher, dashboardController.exportReportPdf);

module.exports = router;
