import express from "express";
import User from "../../model/User.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.route("/account").put((req, res, next) => {
  const token = req?.cookies?.jwt_access;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Not allowed to perform this action" });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }
    const username = decoded.UserInfo.username;
    const user = await User.findOne({
      username,
    });
    if (!user) {
      return res.status(403).json({
        message: "User does not exists",
      });
    }
    user.username = req.body.username;
    user.fullName = req.body.fullName;
    await user.save();
    res.status(200).json({
      message: "Account Updated Successfully",
    });
  });
});

router.route("/security").put(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (currentPassword === newPassword) {
    return res.status(403).json({
      message: "New and current password cannot be same",
    });
  }

  const token = req?.cookies?.jwt_access;
  if (!token)
    return res.status(401).json({
      message: "You're not allowed to perform this action",
    });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err)
      return res.status(403).json({
        message: "Invalid Token",
      });
    const username = decoded.UserInfo.username;
    const user = await User.findOne({
      username,
    });
    if (!user) {
      return res.status(403).json({
        message: "User does not exists",
      });
    }
    const resp = await user.comparePassword(currentPassword);
    if (!resp) {
      return res.status(401).json({
        message: "Incorrect current Password",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      message: "Password Updated Successfully",
    });
  });
});

export default router;
