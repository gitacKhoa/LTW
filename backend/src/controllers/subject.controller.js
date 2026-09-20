const { Subject } = require("../models");

exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({ order: [["name", "ASC"]] });
    return res.status(200).json(subjects);
  } catch (error) {
    return res.status(500).json({ message: "Lấy danh sách môn học thất bại", error: error.message });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Không tìm thấy môn học" });
    }
    return res.status(200).json(subject);
  } catch (error) {
    return res.status(500).json({ message: "Lấy chi tiết môn học thất bại", error: error.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { id, name, credits, isActive } = req.body;

    if (!id || !name || !credits) {
      return res.status(400).json({ message: "id, name, credits là bắt buộc" });
    }

    const exists = await Subject.findByPk(id);
    if (exists) {
      return res.status(409).json({ message: "Mã môn học đã tồn tại" });
    }

    const subject = await Subject.create({
      id,
      name,
      credits,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json(subject);
  } catch (error) {
    return res.status(500).json({ message: "Tạo môn học thất bại", error: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Không tìm thấy môn học" });
    }

    const updated = await subject.update(req.body);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Cập nhật môn học thất bại", error: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Không tìm thấy môn học" });
    }

    await subject.destroy();
    return res.status(200).json({ message: "Xóa môn học thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Xóa môn học thất bại", error: error.message });
  }
};
