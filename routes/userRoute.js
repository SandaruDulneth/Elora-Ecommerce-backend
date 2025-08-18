import express from "express";
import { createUser, getAllUsers, getProfile, getUser, loginUser, loginWithGoogle, resetPassword, sendOTP, updateEmail, } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/",createUser)
userRouter.post("/login", loginUser)
userRouter.post("/login/google",loginWithGoogle)
userRouter.post("/send-otp", sendOTP)
userRouter.post("/reset-password", resetPassword)
userRouter.get("/", getUser)
userRouter.get("/all", getAllUsers)
userRouter.get("/profile",getProfile)
userRouter.put("/update-email",updateEmail)


export default userRouter;