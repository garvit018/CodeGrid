import express from "express";
import User from "../../model/User.model.js";
const router = express.Router();

router.route("/:username").get(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({
    username,
  });
  if (!user) {
    return res.status(403).json({
      message: "User does not exists",
    });
  }
  return res.send({
    username: user.username,
    fullName: user.fullName,
    picture: user.picture,
    problemsSolved: user.problemSolved || [],
  });
});

export default router;
