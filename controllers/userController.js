import User from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import axios from "axios";
import OTP from "../models/otp.js";
import transporter from "../utils/mailer.js";
dotenv.config()

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
   try{

    const user = await User.findOne({
        email:req.body.email
    })
    console.log(user)

    if (user==null){
        res.status(404).json({
            message : "user not found"
        })
    }else{
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password)
        if(isPasswordCorrect){
            const payload={
                    email:user.email,
                    firstName:user.firstName,
                    lastName:user.lastName,
                    isAdmin: user.isAdmin,
                    isBlocked:user.isBlocked,
                    isEmailVerified:user.isEmailVerified,
                    image:user.image
            }

            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn : "48h"
            })
           res.json({
            token:token,
            isAdmin: user.isAdmin
           })

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

// export async function sendOTP(req,res) {
//     const email = req.body.email

//     try{
//         const user = await User.findOne({ email : email})

//         if(user == null){
//             res.status(404).json({
//                 message : "User not found"
//             })
//             return
//         }
//         await OTP.deleteOne({ email: email})

//         const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

//         const newOTP = new OTP({
//             email : email,
//             otp : otpCode
//         })
//         await newOTP.save()

//         const message = {
//             from : process.env.GMAIL,
//             to : email,
//             subject : "Password reset OTP - I COMPUTERS",
//             text : "your OTP for password reset " + otpCode + ". It is valid for 10 minutes."
//         }

//         transporter.sendMail(message, (error , info) =>{
//             if(error){
//                 console.log(error)
//                 res.status(500).json({
//                     message : " error sending OTP email"
//                 })
//             }else{
//                 console.log("Email sent : "+ info.response)
//                 res.json({
//                     message : "OTP sent successfully"
//                 })
//             }
//         })

//     }catch(error){
//         res.status(500).json({
//             message : "Error sending OTP"
//         })
//     }
// }
export async function sendOTP(req, res) {
    const email = req.body.email;
     console.log("sending otp to:", email)

    try {
       
        const user = await User.findOne({ email: email });
        if (user == null) {
            res.status(400).json({
                message: "No account found with this email"
            });
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.findOneAndUpdate(
            { email: email },
            { email: email, otp: otp, createdTime: new Date() },
            { upsert: true, returnDocument: "after" }
        );

        await transporter.sendMail({
            from: process.env.GMAIL,
            to: email,
            subject: "Password reset OTP - I COMPUTERS",
            text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`
        });

        res.json({
            message: "OTP sent successfully"
            
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to send OTP"
        });
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
        const otpAge = (Date.now() - otpRecord.createdTime.getTime()) / (1000 * 60)
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

export async function getAllUsers(req, res) {
    if (req.user == null || !req.user.isAdmin) {
        res.status(403).json({ message: "Forbidden" })
        return
    }
    try {
        const users = await User.find().select("-password")
        res.json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error fetching users" })
    }
}

export async function toggleAdmin(req, res) {
    if (req.user == null || !req.user.isAdmin) {
        res.status(403).json({ message: "Forbidden" })
        return
    }
    try {
        const user = await User.findOne({ email: req.params.email })
        if (!user) {
            res.status(404).json({ message: "User not found" })
            return
        }
        if (user.email === req.user.email) {
            res.status(400).json({ message: "You cannot change your own admin status" })
            return
        }
        user.isAdmin = !user.isAdmin
        await user.save()
        res.json({ message: "Admin status updated successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error updating admin status" })
    }
}

export async function toggleBlock(req, res) {
    if (req.user == null || !req.user.isAdmin) {
        res.status(403).json({ message: "Forbidden" })
        return
    }
    try {
        const user = await User.findOne({ email: req.params.email })
        if (!user) {
            res.status(404).json({ message: "User not found" })
            return
        }
        if (user.email === req.user.email) {
            res.status(400).json({ message: "You cannot block yourself" })
            return
        }
        user.isBlocked = !user.isBlocked
        await user.save()
        res.json({ message: "User block status updated successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error updating block status" })
    }
}

export async function deleteUser(req, res) {
    if (req.user == null || !req.user.isAdmin) {
        res.status(403).json({ message: "Forbidden" })
        return
    }
    try {
        if (req.params.email === req.user.email) {
            res.status(400).json({ message: "You cannot delete your own account" })
            return
        }
        await User.findOneAndDelete({ email: req.params.email })
        res.json({ message: "User deleted successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error deleting user" })
    }
}