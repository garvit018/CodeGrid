import express from "express";
import Feedback from "../model/Feedback.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: "Email and message are required." });
  }
  const feedback = new Feedback({ email, message });
  await feedback.save();
  return res.status(201).json({ message: "Feedback submitted successfully." });
});

export default router;
