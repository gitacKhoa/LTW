const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const User = require("../models/User");

const createToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
      userCode: user.userCode,
    },
    process.env.JWT_SECRET || "secret_key",
    { expiresIn: "24h" }
  );

const sanitizeUser = (user) => {
  if (!user) return null;
  const plain = user.toJSON ? user.toJSON() : { ...user };
  delete plain.password;
  return plain;
};

exports.register = async (req, res) => {
  try {
    const { fullName, username, password, userCode, role } = req.body;

    if (!fullName || !username || !password || !userCode) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const existed = await User.findOne({
      where: {
        [Op.or]: [{ username }, { userCode }],
      },
    });

    if (existed) {
      return res.status(409).json({ message: "Username hoặc userCode đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      username,
      password: hashedPassword,
      userCode,
      role: role || "student",
    });

    const token = createToken(user);

    return res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Đăng ký thất bại", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu username hoặc password" });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Đăng nhập thất bại", error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Lấy thông tin người dùng thất bại", error: error.message });
  }
};
