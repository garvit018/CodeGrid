import express from "express";
import http from "http";
const app = express();
import createSocketServer from "./config/socketServer.js";

const server = http.createServer(app);
const io = createSocketServer(server);
import "./config/db.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import path from "path";
import corsOrigin from "./config/corsOrigin.js";
import cookieParser from "cookie-parser";
import { logger } from "./middleware/loggingEvents.js";
import errorHandler from "./middleware/errorHandler.js";
import verifyRoles from "./middleware/verifyRoles.js";
import verifyJWT from "./middleware/verifyJWT.js";
import credentials from "./middleware/credential.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV === "development") {
  app.use(logger);
}
app.use(credentials);
app.use(cors(corsOrigin));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "/public")));

import router from "./routes/root.route.js";
app.use("/", router);

import visitorCountRoutes from "./routes/visitorCount.route.js";
import registerRoutes from "./routes/register.route.js";
import authRoutes from "./routes/auth.route.js";
import userDataRoutes from "./routes/getUserData.route.js";
import refreshRoutes from "./routes/refresh.route.js";
import logoutRoutes from "./routes/logout.route.js";

app.use("/visitor-count", visitorCountRoutes);
app.use("/register", registerRoutes);
app.use("/auth", authRoutes);
app.use("/user", userDataRoutes);
app.use("/refresh", refreshRoutes);
app.use("/logout", logoutRoutes);

//public routes
import feedbackRoutes from "./routes/api/feedback.route.js";
import runRoutes from "./routes/api/run.route.js";
import contestWatcherRoutes from "./routes/api/upcomingContest.route.js";
import snippetRoutes from "./routes/api/snippet.route.js";
import roomRoutes from "./routes/api/roomHandler.route.js";
import userRoutes from "./routes/api/user.route.js";
import problemRoutes from "./routes/api/problems.route.js";

app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/run", runRoutes);
app.use("/api/v1/contest-watcher", contestWatcherRoutes);
app.use("/api/v1/snippet", snippetRoutes);
app.use("/api/v1/room", roomRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/problem", problemRoutes);

import settingsRoutes from "./routes/api/settings.route.js";
import adminRoutes from "./routes/api/admin/index.admin.js";

app.use(verifyJWT);
app.use("/api/v1/settings", settingsRoutes);
app.use(verifyRoles(5150));
app.use("/api/v1/admin", adminRoutes);
