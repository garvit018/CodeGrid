import express from "express";
const router = express.Router();
import { handleRefreshToken } from "../controllers/auth.controller.js";

router.get("/", handleRefreshToken);
export default router;