import express from "express";
import { changePassword, createUser, getUserData, loginUser, updateUserData } from "../controllers/userController.js";


const userRouter = express.Router();

userRouter.post("/",createUser)//users kiyala avoth meka run venava
userRouter.post("/login", loginUser)//login kiyala post ekata avoth meka run venava (localhost:3000/users/login)
userRouter.get("/me", getUserData)
userRouter.put("/",updateUserData)
userRouter.put("/password",changePassword)

export default userRouter;