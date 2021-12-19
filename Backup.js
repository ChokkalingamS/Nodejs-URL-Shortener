// import express from 'express'
// import nodemailer from "nodemailer";
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import {client} from "./index.js";
// import {signupauth} from "./Token.js";

// dotenv.config()

// // Signup
// const router=express.Router()
// router.route('/signup')
//     .post(async (request,response)=>{
//     const {Firstname,Lastname,Username,Mailid,Password}=request.body;
//     const check = await getUser(Username, Mailid);


//     if(check)
//     {
//         return response.send('Username or Mailid Already exists')
//     }
//     if(Password.length<8)
//     {
//         return response.send('Password Must Be Longer')
//     }

//     const date=new Date()
//     const createdAt=(`${date.toLocaleDateString()},${date.toLocaleTimeString()}`)
//     const lastVisited=createdAt;
//     const hashedPassword= await passwordGenerator(Password)
//     const createAccount = await client
//       .db("movielist")
//       .collection("users")
//       .insertOne({
//         Firstname,
//         Lastname,
//         Username,
//         Mailid,
//         Password: hashedPassword,
//         createdAt,
//         lastVisited,
//         Status: "Inactive",
//         token:""
//       });
   
//     const getdata= await client.db('movielist').collection('users').findOne({Username,Mailid})
//     const {_id}=await getdata;
//     const token=jwt.sign({id:_id},process.env.key)
//     const storeToken=await client.db('movielist').collection('users').updateOne({_id:_id},{$set:{token:token}})
//     console.log(storeToken);
//     const link=`http://localhost:1000/users/twostepverification/${token}`
//     const mail=Mail(link,Mailid)
//     response.send('Mail Sent For verification')
// })


// router.route('/twostepverification/:id')
// .get(async(request,response)=>{
//     const {id}=request.params
//     try {
//         const result=jwt.verify(id,process.env.key)
//         if(result)
//         {
//             const getdata= await client.db('movielist').collection('users').findOne({token:id})
//             const {_id,Status,token}=await getdata
//             console.log(token===id);
//             const statusChange=await client.db('movielist').collection('users').updateOne({_id:_id},{$set:{Status:'Active'},$unset:{token}})
//             console.log(statusChange);
//             response.send('Account Activated')
//         }
        
//     } catch (error) {
//         response.send({msg:error.message})  
//     }
    
// })



// // Login
// router.route('/login')
// .post(async(request,response)=>{
//     const {Mailid,Password}=request.body;
//     const check=await client.db('movielist').collection('users').findOne({Mailid})
//     if(!check)
//     {
//         return response.send('Invalid Login Credentials-Mailid')
//     }
//     const {_id,Password:dbPassword,lastVisited,Status}=await check;
//     if(Status==="Inactive")
//     {
//         return response.send("Your Account is Inactive")
//     }
//     const passwordCheck=await bcrypt.compare(Password,dbPassword)
//     if(!passwordCheck)
//     {
//         return response.send('Invalid Login Credentials-Password')
//     }
//     const date=new Date()
//     const loginTime=(`${date.toLocaleDateString()},${date.toLocaleTimeString()}`)
//     const loginTimeupdate=await client.db('movielist').collection('users').updateOne({Mailid},{$set:{lastVisited:loginTime}})
//     const token=jwt.sign({id:_id},process.env.key)
//     // response.redirect(`http://localhost:1000/users/Dashboard/${token}`)
//     return response.send({'Msg':'Login Successful','token':token})
// })


// // Forgot Password
// router.route('/forgotpassword')
// .post(async(request,response)=>{
//     const {Mailid}=request.body
//     const check=await client.db('movielist').collection('users').findOne({Mailid})
//     if(!check)
//     {
//         return response.send('Mailid does not Match')
//     }
//     const {_id,Password}=await check
//     const token=jwt.sign({id:_id},process.env.key)
//     const updateUser=await client.db('movielist').collection('users').updateOne({_id},{$set:{Password:token}})
//     const link=`http://localhost:1000/users/forgotpassword/verify/${token}`
//     Mail(link,Mailid)
//     response.send(updateUser)
// })

// // Forgot Password token verify
// router.route('/forgotpassword/verify/:id')
// .get(async(request,response)=>{
//     const {id:token}=request.params
//     const check=await client.db('movielist').collection('users').findOne({Password:token})
//     if(!check)
//     {
//         return response.send('Invalid')
//     }
// // return response.redirect(`http://localhost:1000/users/changepassword/${token}`)
// return response.send('Token Matched')

// })


// // Change Password
// router.route('/changepassword')
// .post(async(request,response)=>{
//     const {Password,token}=request.body

//     if(Password.length<8)
//     {
//         return response.send('Password Must Be Longer')
//     }
//     const check=await client.db('movielist').collection('users').findOne({Password:token})
//     if(!check)
//     {
//         return response.send('Invalid Token')
//     }
//     const {Mailid}=await check
//     const hashedPassword= await passwordGenerator(Password)
//     const passwordChange=await client.db('movielist').collection('users').updateOne({Mailid},{$set:{Password:hashedPassword}})
//     response.send('Password Changed Sucessfully')
// })









// function getUser(Username, Mailid) {
//     return client
//         .db("movielist")
//         .collection("users")
//         .findOne({
//             $or: [{ Username: { $eq: Username } }, { Mailid: { $eq: Mailid } }],
//         });
// }

// async function passwordGenerator(Password)
// {
//     const rounds=10;
//     const salt=await bcrypt.genSalt(rounds)   // random string
//     const hashedPassword=await bcrypt.hash(Password,salt)
//     return hashedPassword;
// }


// function Mail(link,Mailid)
// {

//     const info=nodemailer.createTransport({
//         service:'gmail',
//         auth:{
//             user:process.env.email,
//             pass:process.env.password,
//         },
//     });

//     const mailOptions={
//         from:process.env.email,
//         to:Mailid,
//         subject:'Mail From Url Shortener',
//         html:`<a href=${link}>Click the link to complete two step verification</a>`,
//     }
//     info.sendMail(mailOptions,(err,info)=>{
//         if (err) {
//             console.log('Mail',err);
//           } else {
//             console.log("Mailstatus  ", info.response);
//           }
//     });
// }







// export const userRouter=router;