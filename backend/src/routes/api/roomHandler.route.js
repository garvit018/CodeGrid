import express from "express";
import { get_User_in_room } from "../../utils/sockets.util.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { roomId } = req.body;
  res.send(get_User_in_room(global.io, roomId) || []);
});

export default router;
