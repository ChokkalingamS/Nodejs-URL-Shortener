import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const signupauth=(request,response,next)=>{
    try 
    {
    const token =request.header('x-auth-token')
    const verify=jwt.verify(token,process.env.key)
    console.log('Token Verification',verify);
    next()
    } catch (error) 
    {
        response.send({msg:error.message})   
    }
    
}



export {signupauth}