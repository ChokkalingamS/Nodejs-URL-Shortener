import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import {signupauth} from "./Token.js";
import { client } from "./index.js";
import { getUser, passwordGenerator, updateUser, Mail,createUser } from './UserDB.js';

dotenv.config()

// Signup
const router=express.Router()
router.route('/signup')
    .post(async (request,response)=>{
    const {Firstname,Lastname,Username,Mailid,Password}=request.body;
    
    if(Firstname.length===0||Lastname.length===0||Username.length===0||Mailid.length===0||Password.length===0)
    {
        return response.status(400).send('Input Field should not be empty')
    }

    if(Password.length<8)
    {
        return response.status(400).send('Password Must Be Longer')
    }
   

    const userData={
        $or: [{ Username: { $eq: Username } }, { Mailid: { $eq: Mailid } }],
    }

    console.log(request.body);
    const check = await getUser(userData);
    console.log(check);
    if(check)
    {
        return response.status(400).send('Username or Mailid Already exists')
    }
  

    const date=new Date()
    const createdAt=(`${date.toLocaleDateString()},${date.toLocaleTimeString()}`)
    const lastVisited=createdAt;
    const hashedPassword= await passwordGenerator(Password)
    const createAccount = await createUser(Firstname, Lastname, Username, Mailid, hashedPassword, createdAt, lastVisited);
   
    const getdata= await getUser({Username,Mailid})

    const {_id}=await getdata;
    const token=jwt.sign({id:_id},process.env.key)
    const storeToken=await updateUser([{_id:_id},{$set:{token:token}}])
    // console.log(storeToken);
    const link=`http://localhost:1000/users/twostepverification/${token}`
    const mail=Mail(link,Mailid,response)
    // console.log(mail);
    // if(!mail)
    // {
    //    return  response.status(400).send('Unknown error Occurred')
    // }
    // return response.send('Mail Sent For verification')
})


router.route('/twostepverification/:id')
.get(async(request,response)=>{
    const {id}=request.params
    try {
        const result=jwt.verify(id,process.env.key)
        if(result)
        {
            const getdata= await getUser({token:id})
            const {_id,Status,token}=await getdata
            const statusChange=await updateUser([{_id:_id},{$set:{Status:'Active'},$unset:{token}}])
            // console.log(statusChange);
            // response.send('Account Activated')
            response.redirect('http://localhost:3000/vermessage')
        }
        
    } catch (error) {
        response.status(400).send('')  
    }
    
})



// Login
router.route('/login')
.post(async(request,response)=>{
    const {Mailid,Password}=request.body;
    const check=await getUser({Mailid})
    if(!check)
    {
        return response.status(400).send('Invalid Login Credentials-Mailid')
    }
    const {_id,Password:dbPassword,lastVisited,Status}=await check;
    if(Status==="Inactive")
    {
        return response.status(400).send("Your Account is Inactive")
    }
    const passwordCheck=await bcrypt.compare(Password,dbPassword)
    if(!passwordCheck)
    {
        return response.status(400).send('Invalid Login Credentials-Password')
    }
    const token=jwt.sign({id:_id},process.env.key)
    const date=new Date()
    const loginTime=(`${date.toLocaleDateString()},${date.toLocaleTimeString()}`)
    const loginTimeupdate=await updateUser([{Mailid},{$set:{lastVisited:loginTime,getToken:token}}])
    
    //  response.redirect(`http://localhost:3000/users/Dashboard/1`)
    // response.redirect(`http://localhost:1000/users/Dashboard/${token}`)
    // response.redirect('https://react-password-reset-flow.herokuapp.com/')
    return response.send({Msg:'Login Successful',token})
})


// router.route('/Dashboard/:id')
// .get(async(request,response)=>{
//     const {id:token}=request.params
//     console.log(token);
//      response.redirect(`http://localhost:3000/users/Dashboard/${token}`)
// })



// Forgot Password
router.route('/forgotpassword')
.post(async(request,response)=>{
    const {Mailid}=request.body
    const check=await getUser({Mailid})
    if(!check)
    {
        return response.status(400).send('Email does not exist')
    }
    const {_id,Password}=await check
    // console.log(_id,Password);
    const token=jwt.sign({id:_id},process.env.key)
    const update=await updateUser([{_id},{$set:{Password:token}}])
    // console.log(update);
    const link=`http://localhost:1000/users/forgotpassword/verify/${token}`
    Mail(link,Mailid)
    response.send(' Mail Sent ')
})

// Forgot Password token verify
router.route('/forgotpassword/verify/:id')
.get(async(request,response)=>{
    const {id:token}=request.params
    
    const check=await getUser({Password:token})
    if(!check)
    {
        return response.status(400).send('Invalid')
    }
// return response.send('Token Matched')
return response.redirect(`http://localhost:3000/changepassword/${token}`)

})


// Change Password
router.route('/changepassword')
.post(async(request,response)=>{
    const {Password,token}=request.body

    if(Password.length<8)
    {
        return response.status(400).send('Password Must Be Longer')
    }
    
    const check=await getUser({Password:token})
    if(!check)
    {
        return response.status(400).send('Invalid Token')
    }
    const {Mailid}=await check
    const hashedPassword= await passwordGenerator(Password)
    const passwordChange=await updateUser([{Mailid},{$set:{Password:hashedPassword}}])
    response.send('Password Changed Sucessfully')
})


router.route('/getdata')
.get(async(request,response)=>{
    const token =request.header('x-auth-token')
    const check= await getUser({getToken:token})
    console.log(check);
    response.send(check)
})



router.route('/userdata')
.get(signupauth,async(request,response)=>{
    
    const token =request.header('x-auth-token')
    const getdata= await getUser({getToken:token})
    const {Mailid}=await getdata
    // console.log(Mailid);
    const get = await client
      .db("movielist")
      .collection("users")
      .aggregate([
        {
          $lookup: {
            from: "Url-Shortener",
            localField: "Mailid",
            foreignField: "Mailid",
            as: "urls",
          },
        },
        { $match: { "Mailid": Mailid } },
        // { $limit: 1 },
      ])
      .toArray();

    const result=await get[0].urls
  console.log(get[0].urls);
    //   console.log(get);
      if(!result)
      {
          response.status(404).send('Not Found')
      }
    response.send(result)

})














export const userRouter=router;

