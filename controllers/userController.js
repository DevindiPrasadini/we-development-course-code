import User from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
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

            const token = jwt.sign(payload, JWT_SECRET,{
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