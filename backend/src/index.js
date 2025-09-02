import express from 'express';
import http from "http";
const app = express();
const server = http.createServer(app);
import "./config/db.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import path from "path";
