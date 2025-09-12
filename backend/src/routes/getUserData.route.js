import express from "express";
const router = express.Router();
import getUserDataa from "../controllers/user.controller.js";

router.get("/", getUserDataa);
export default router;
