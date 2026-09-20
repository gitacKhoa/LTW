const express = require("express");
const subjectController = require("../controllers/subject.controller");
const { verifyToken, isTeacher, isAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", verifyToken, isTeacher, subjectController.getAllSubjects);
router.get("/:id", verifyToken, isTeacher, subjectController.getSubjectById);
router.post("/", verifyToken, isAdmin, subjectController.createSubject);
router.put("/:id", verifyToken, isAdmin, subjectController.updateSubject);
router.delete("/:id", verifyToken, isAdmin, subjectController.deleteSubject);

module.exports = router;
