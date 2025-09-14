import express from "express";
import { User } from "../../model/User.model.js";

const router = express.Router();

// Account update
router.route("/account").put(async (req, res) => {
  try {
    const username = req.user.username;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    user.username = req.body.username || user.username;
    user.fullName = req.body.fullName || user.fullName;
    await user.save();

    res.status(200).json({ message: "Account Updated Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Security (password update)
router.route("/security").put(async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword === currentPassword) {
      return res
        .status(400)
        .json({ message: "New and current password cannot be same" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const username = req.user.username;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const validPassword = await user.comparePassword(currentPassword);
    if (!validPassword) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password Updated Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
