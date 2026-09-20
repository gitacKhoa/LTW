const express = require("express");
const { Notification } = require("../models");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      order: [["createdAt", "DESC"]],
      attributes: ["id", "title", "description", "isRead", "createdAt"],
    });

    return res.status(200).json(
      notifications.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        isRead: item.isRead,
        read: item.isRead,
        createdAt: item.createdAt,
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: "Lấy thông báo thất bại", error: error.message });
  }
});

router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }

    await notification.update({ isRead: true });
    return res.status(200).json({ message: "Đánh dấu đã đọc thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Cập nhật thông báo thất bại", error: error.message });
  }
});

module.exports = router;
