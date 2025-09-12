import express from "express";
const router = express.Router();
import { handleLogout } from "../controllers/auth.controller.js";

router.get("/", handleLogout);

export default router;