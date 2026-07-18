import express from "express";
import { changePassword, createUser, getUserData, googleLogin, loginUser, sendOTP, updateUserData, verifyOTPAndResetPassword } from "../controllers/userController.js";
import { getAllUsers, toggleAdmin,toggleBlock,deleteUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/",createUser)//users kiyala avoth meka run venava
userRouter.post("/login", loginUser)//login kiyala post ekata avoth meka run venava (localhost:3000/users/login)
userRouter.get("/me", getUserData)
userRouter.put("/",updateUserData)
userRouter.put("/password",changePassword)
userRouter.post("/google-login", googleLogin)
userRouter.post("/send-otp", sendOTP)
userRouter.post("/verify-otp", verifyOTPAndResetPassword)
userRouter.get("/", getAllUsers)
userRouter.put("/:email/toggle-admin", toggleAdmin)
userRouter.put("/:email/toggle-block", toggleBlock)
userRouter.delete("/:email", deleteUser)

export default userRouter;