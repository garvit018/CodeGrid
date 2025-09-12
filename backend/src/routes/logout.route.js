import express from "express";
const Router = express.Router();
import { handleLogout } from "../controllers/auth.controller";

Router.get("/", handleLogout);

export default Router;