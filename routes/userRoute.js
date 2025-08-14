import express from "express";
import { createUser, getProfile, getUser, loginUser, loginWithGoogle, resetPassword, sendOTP , } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/",createUser)
userRouter.post("/login", loginUser)
userRouter.post("/login/google",loginWithGoogle)
userRouter.post("/send-otp", sendOTP)
userRouter.post("/reset-password", resetPassword)
userRouter.get("/", getUser)
userRouter.get("/profile",getProfile)

export default userRouter;