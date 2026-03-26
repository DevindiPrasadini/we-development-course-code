import express from "express";
import { createUser, loginUser } from "../controllers/userController.js";


const userRouter = express.Router();

userRouter.post("/",createUser)//users kiyala avoth meka run venava
userRouter.post("/login", loginUser)//login kiyala post ekata avoth meka run venava (localhost:3000/users/login)

export default userRouter;