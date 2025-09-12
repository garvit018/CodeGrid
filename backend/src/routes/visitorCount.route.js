import express from "express";
const router = express.Router();
import { Visitor } from "../model/Visitor.model.js";

router.route("/").get(async (req, res) => {
  const user = await Visitor.find({});
  if (user) {
    user.visitorCount += 1;
    await user.save();
    return res.status(200).json({ visitorCount: user.visitorCount });
  } else {
    const newVisitor = new Visitor({ visitorCount: 1 });
    await newVisitor.save();
    return res.status(200).json({ visitorCount: 1 });
  }
});

export default router;
