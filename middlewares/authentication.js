import jwt from "jsonwebtoken"

export default function authenticateUser(req, res, next){
    
        //console.log("request received")//req ekaka avama ava kiyala print venna
        const header = req.header("Authorization")
       // console.log(header)
        if(header !=null){//header eka nti unata avulk na regisetr venn ena knk venn pluvn
              const token = header.replace("Bearer ","")//token eke issr bearer space ekak ekk print venv ek ain krgnn
             // console.log(token)
    
              jwt.verify(token, "webdevelopment2005",(error, decoded)=>{
                //console.log(decoded)//decoded kiyala enne iser ge details tika kamathi namak dagnn pluvn
                if(error){// if token in incorrect
                    res.json({
                        messsage : "invalid token  please login again"
                    })
                }else{
                    req.user = decoded
                    next()
                }
              })
    
        }else{
            next()
        }
        next()//dn req ek print vela igava kenata yavanava
    }

