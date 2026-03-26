import express from "express"
import mongoose from "mongoose";
//import Student from "../models/student.js";

import userRouter from "./routers/userRouter.js"

import authenticateUser from "./middlewares/authentication.js";
import productRouter from "./routers/productRouter.js";


const app= express();


const mongodbURI = "mongodb+srv://admin:12345@cluster0.7n1tufq.mongodb.net/first?appName=Cluster0"

 

mongoose.connect(mongodbURI).then(
    ()=>{
        console.log("connected to mongodb");
    }
)

app.use(express.json())//req ek allagen clean krl yavanav

app.use(authenticateUser)


app.use("/users",userRouter);
app.use("/products",productRouter)




app.listen (3000, (req, res)=>{ 
    console.log("server is running on port 3000");
}) 