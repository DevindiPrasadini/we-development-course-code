import express from "express"
import mongoose from "mongoose";


import userRouter from "./routers/userRouter.js"

import authenticateUser from "./middlewares/authentication.js";
import productRouter from "./routers/productRouter.js";

import cors from "cors";
import dotenv from "dotenv"

dotenv.config()


const app= express();


const mongodbURI = process.env.MONGO_URI

 

mongoose.connect(mongodbURI).then(
    ()=>{
        console.log("connected to mongodb");
    }
)
app.use(cors());
app.use(express.json())//req ek allagen clean krl yavanav

app.use(authenticateUser)


app.use("/api/users",userRouter);
app.use("/api/products",productRouter)




app.listen (3000, (req, res)=>{ 
    console.log("server is running on port 3000");
}) 