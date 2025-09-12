import express from "express";
import {
  handleLogin,
  handleOAuthLogin,
  handleAccountVerify,
  handleForgotPassword,
  handleAccountRecoveryTokenVerify,
  handleAccountRecovery,
} from "../controllers/authController.js";
const Router = express.Router();

Router.post("/", handleLogin);
Router.post("/o-auth", handleOAuthLogin);
Router.get("/success", handleAccountVerify);
Router.post("/forgot-password", handleForgotPassword);
Router.get("/recover", handleAccountRecoveryTokenVerify);
Router.post("/recover", handleAccountRecovery);

export default Router;
