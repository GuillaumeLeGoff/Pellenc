const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");
require('dotenv').config();

exports.signing = async (req, res) => {
  console.log("signing", req.body);
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: error.message });
  }
};

exports.signup = async (req, res) => {
  console.log("signup", req.body);
  try {
    const { username, password } = req.body;

    const user = await User.create({ username, password });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.changePassword = async (req, res) => {
    console.log("changePassword", req.body);
    try {
      const { oldPassword, newPassword } = req.body;
  
      const user = await User.findOne({ username: 'User' }).select("+password");
      if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
        return res.status(403).json({ message: "Ancient mot de passe et mauvais" });
      } else {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });
        res.status(200).json({ message: "Password changed successfully" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
