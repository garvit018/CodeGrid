import express from "express";
import {
  handleLogin,
  handleOAuthLogin,
  handleAccountVerify,
  handleForgotPassword,
  handleAccountRecoveryTokenVerify,
  handleAccountRecovery,
} from "../controllers/authController.js";
const router = express.Router();

router.post("/", handleLogin);
router.post("/o-auth", handleOAuthLogin);
router.get("/success", handleAccountVerify);
router.post("/forgot-password", handleForgotPassword);
router.get("/recover", handleAccountRecoveryTokenVerify);
router.post("/recover", handleAccountRecovery);

export default router;
