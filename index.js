// server.js
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

import productRouter from "./routes/productRoute.js";
import userRouter from "./routes/userRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import commentRouter from "./routes/commentRoute.js";

dotenv.config();

const app = express();

// CORS (lock to your frontend if you want)
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// JSON body parsing (replaces body-parser)
app.use(express.json());

// ---- Auth middleware (optional on public routes)
app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  if (!tokenString) return next();

  const token = tokenString.replace("Bearer ", "");
  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err || !decoded) {
      console.log("invalid token");
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
});

// ---- MongoDB
const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
if (!mongoUrl) console.error("⚠️  Missing MONGODB_URL/MONGODB_URI");
mongoose
  .connect(mongoUrl)
  .then(() => console.log("Connected to the database"))
  .catch((e) => console.error("Database connection failed:", e?.message || e));

// ---- Routes
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRoute);
app.use("/api/comments", commentRouter);

// ---- Health / root
app.get("/", (_req, res) => res.send("Backend API is running ✅"));
app.get("/health", (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    ok: true,
    port: process.env.PORT,
    mongoState: states[mongoose.connection.readyState] ?? mongoose.connection.readyState,
    hasMongoUrl: Boolean(mongoUrl),
  });
});

// ---- Start (Railway provides PORT)
const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
