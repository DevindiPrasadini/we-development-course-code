import User from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import axios from "axios";
import { response } from "express";
import OTP from "../models/otp.js";
import nodemailer from "nodemailer"
dotenv.config()

const transporter = nodemailer.createTransport({
    service : "gmail",
    host : "smtp.gmail.com",
    port : 587,
    secure : false,
    auth : {
        user :process.env.GMAIL,
        pass : process.env.GMAIL_APP_PASSWORD
    }
})

export async function createUser(req , res){  

    try{

         const passwordHash = bcrypt.hashSync(req.body.password, 10)

        const newUser = new User({
            email : req.body.email,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            password : passwordHash
        })

        await newUser.save()

        res.json({
            message : "User Created Successfully"
        })
    }catch(error){
        res.json(
            {
                message : "Error creating user"
            }
        )
    }
}

export async function loginUser(req,res){
//email,password user hoyagann oni
   try{
    //const passwordHash = bcrypt.hashSync(req.body.password, 10)//10 kiyanne hash vena time gana(10 times hash venva)
    // console.log(passwordHash)//hash una password eka pennanna

    const user = await User.findOne({
        email:req.body.email//req apu email eke user va hoyagen print karanna


    })
    console.log(user)

    if (user==null){//email ekata user kenek nantm
        res.status(404).json({//404-user not found
            message : "user not found"
        })
    }else{//user found
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password)
        if(isPasswordCorrect){
            //methanata enava kiyanne eya legit user knk
            const payload={//payload kiyanne visthara tika/content
                    email:user.email,
                    firstName:user.firstName,
                    lastName:user.lastName,
                    isAdmin: user.isAdmin,
                    isBlocked:user.isBlocked,
                    isEmailVerified:user.isEmailVerified,
                    image:user.image
            } //ita passe detaiols encryption krnv

            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn : "48h"//48h vlin token password invalid venv
            })
           res.json({
            token:token,
            isAdmin: user.isAdmin
           })//log visthara encrypt vela hash ekak vge pennanv

           /* res.json({
                message : "login successfull"
            })*/
        }else{
            res.status(401).json({
                message:"invalid password"
            })
        }
 
    }

   }catch(error){
    res.status(500).json({
        message : "error happened password"
    })

   }

}

export async function getUserData(req, res){
    if(req.user == null){
        res.status(401).json({
            message : "Unathorized"
        })
    }else{
        res.json(req.user)
    }
}

//req ekak athulata arn blnv ek evala tiyenne admin knkd ndd kiyl
export default function isAdmin(req){
    if(req.user==null){
        return false
    }
    if(req.user.isAdmin){
        return true
    }else{
        return false
    }
}
//users existing token have old information so when user data updating tokrn also updating into new one
export async function updateUserData(req,res){
    if(req.user == null){
        res.status(401).json({
            message : "Unathorized"
        })
    }else{
        try{
            await User.findOneAndUpdate(
                {email : req.user.email},
                {firstName : req.body.firstName, lastName: req.body.lastName , image: req.body.image}
            )
            const updateUser = await User.findOne({ email: req.user.email})
            const token = jwt.sign(
                {
                    email : updateUser.email,
                    firstName : updateUser.firstName,
                    lastName : updateUser.lastName,
                    isAdmin : updateUser.isAdmin,
                    isBlocked : updateUser.isBlocked,
                    isEmailVerified : updateUser.isEmailVerified,
                    image : updateUser.image
                },
                process.env.JWT_SECRET,
                {expiresIn : "48h"}
            )
            res.json({
                message: "User data updated successfully",
                token : token
            })
        
        }catch(error){
            res.status(500).json({
                message : "Error updating user data"
            })
        }
    }
}
export async function changePassword(req,res) {
    if(req.user == null){
        res.status(401).json({
            message : "Unathorized"
        })
    }
    try{
        const hashedPassword = bcrypt.hashSync(req.body.newPassword, 10)
        await User.findOneAndUpdate(
            { email : req.user.email},
            { password : hashedPassword}
        )
        res.json({
            message : "Password changed successfully"
        })
    }catch(error){
        res.status(500).json({
            message : "Error updating password"
        })
    }
    
}

export async function googleLogin(req,res){

    const accessToken = req.body.token
    //send to google and get valodated
    try{
        const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{
            headers : {
                Authorization : "Bearer " + accessToken
            }
        })
        console.log(googleResponse.data)

        const user = await User.findOne( 
            {email : googleResponse.data.email}
        )
        if (user == null){
            //create new account if user is new comer
            const newUser = new User({
                email : googleResponse.data.email,
                firstName : googleResponse.data.given_name,
                lastName : googleResponse.data.family_name,
                password : "google-login",
                isEmailVerified : true,
                image : googleResponse.data.picture
            })
            await newUser.save()

             const token = jwt.sign(
                {
                    email : googleResponse.data.email,
                    firstName : googleResponse.data.given_name,
                    lastName : googleResponse.data.family_name,
                    isAdmin :false,
                    isBlocked :false,
                    isEmailVerified : true,
                    image : googleResponse.data.picture
                },
                process.env.JWT_SECRET,
                {expiresIn : "48h"}
            )
            res.json({
                token : token,
                isAdmin : false
            })
                
            
        }else{
            //generate toke
             const token = jwt.sign(
                {
                    email : user.email,
                    firstName : user.firstName,
                    lastName : user.lastName,
                    isAdmin : user.isAdmin,
                    isBlocked : user.isBlocked,
                    isEmailVerified : user.isEmailVerified,
                    image : user.image
                },
                process.env.JWT_SECRET,
                {expiresIn : "48h"}
            )
            res.json({
                token:token,
                isAdmin : user.isAdmin
            })
        }

    }catch(error){
        console.log(error)
        res.status(401).json({
            message : "Google authentication failed"
        })
    }
}

export async function sendOTP(req,res) {
    const email = req.body.email

    try{
        const user = await User.findOne({ email : email})

        if(user == null){
            res.status(404).json({
                message : "User not found"
            })
            return
        }
        // if user already have saved otp it should be delete
        await OTP.deleteOne({ email: email})

        // generate otp ans save on database
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

        const newOTP = new OTP({
            email : email,
            otp : otpCode
        })
        await newOTP.save()

        //send otp to the email of user

        const message = {
            from : process.env.GMAIL,
            to : email,
            subject : "Password reset OTP - I COMPUTERS",
            text : "your OTP for password reset " + otpCode + ". It is valid for 10 minutes."
        }//text or html (html can generate from AI)

        transporter.sendMail(message, (error , info) =>{
            if(error){
                console.log(error)
                res.status(500).json({
                    message : " error sending OTP email"
                })
            }else{
                console.log("Email sent : "+ info.response)
                res.json({
                    message : "OTP sent successfully"
                })
            }
        })

    }catch(error){
        res.status(500).json({
            message : "Error sending OTP"
        })
    }
}

export async function verifyOTPAndResetPassword(req,res) {

    const email = req.body.email
    const otp = req.body.otp
    const newPassword = req.body.newPassword

    try{

        const otpRecord = await OTP.findOne({ email : email})
        if(otpRecord == null){
            res.status(400).json({
                message : "Invalid OTP"
            })
            return
        }
        if(otpRecord.otp != otp){
            res.status(400).json({
                message : "Invalid OTP"
            })
            return
        }
        const otpAge = (Date.now() =otpRecord.createdTime.getTime()) / (1000 * 60) //checking otp time 
        if(otpAge > 10){
            await OTP.deleteOne({ email : email})
            res.status(400).json({
                message : "OTP expired"
            })
            return
        }
        const hashedPassword = bcrypt.hashSync(newPassword, 10)

        await User.findOneAndUpdate(
            {email : email },
            {password : hashedPassword}
        )
        await OTP.deleteOne({ email : email})

        res.json({
            message : "Password reset successfully"
        })

    }catch(error){
        res.status(500).json({
            message : "Invalid OTP"
        })
        return
    }


    
}