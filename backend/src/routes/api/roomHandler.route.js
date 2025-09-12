import express from "express";
import {
  join_User,
  get_Current_User,
  user_Disconnect,
  get_User_in_room,
} from "../../utils/sockets.util.js";
const router = express.Router();

router.post("/", (req, res) => {
  const { roomId } = req.body;
  res.send(get_User_in_room(roomId) || []);
});

export default router;
