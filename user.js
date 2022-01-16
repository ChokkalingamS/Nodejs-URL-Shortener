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
        return response.status(400).send({Msg:'Input Field should not be empty'})
    }

    if(Password.length<8)
    {
        return response.status(400).send({Msg:'Password Must Be Longer'})
    }
   

    const userData={
        $or: [{ Username: { $eq: Username } }, { Mailid: { $eq: Mailid } }],
    }

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

    const accountDetails={Firstname, Lastname, Username,createdAt,lastVisited}
    Account(accountDetails)

    const getdata= await getUser({Username,Mailid})

    const {_id}=await getdata;
    const token=jwt.sign({id:_id},process.env.key)
    const storeToken=await updateUser([{_id:_id},{$set:{token:token}}])
    // const link=`http://localhost:1000/users/twostepverification/${token}`
    const link=`https://url-shor-t-ner.herokuapp.com/users/twostepverification/${token}`

    const message=(`<h3>Greetings ${Firstname} !!!</h3>
    <p>Welcome to the world of URL Shortener</p>
    <p>Using our services you can Simplify your links, customize &amp; manage them at free of cost</p>
    <a href=${link}>Click the link to complete two step verification</a>
    <p>Two step verification is mandatory to login</p>
    <p>Regards,</p>
    <p>URL Shortener Team</p>`)
   
    const mail=Mail(Mailid,response,message) 
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
            // response.redirect('http://localhost:3000/vermessage')
            response.redirect('https://url-short-ener.netlify.app/vermessage')
        }
        
    } catch (error) {
        response.status(400).send('Link Expired')  
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
    const {_id,Password:dbPassword,lastVisited,Status,Firstname, Lastname, Username,createdAt}=await check;
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
    const loginDetails={Firstname, Lastname, Username,Mailid,loginTime,createdAt}
    Login(loginDetails)
    return response.send({Msg:'Login Successful',token})
})

// Forgot Password
router.route('/forgotpassword')
.post(async(request,response)=>{
    const {Mailid}=request.body
    const check=await getUser({Mailid})
    if(!check)
    {
        return response.status(400).send('Email does not exist')
    }
    const {_id,Password,Firstname,Status}=await check
    if(Status==="Inactive")
    {
        return response.status(400).send("Your Account is Inactive")
    }
    const token=jwt.sign({id:_id},process.env.key)
    const update=await updateUser([{_id},{$set:{Password:token}}])
    // const link=`http://localhost:1000/users/forgotpassword/verify/${token}`
    const link=`https://url-shor-t-ner.herokuapp.com/users/forgotpassword/verify/${token}`
    
    const message=(`<h3>Greetings ${Firstname} !!!</h3>
    <p>Use the Below link to reset your password.  </p>
    <a href=${link}>Click the link to reset your password.</a>
    <p>Regards,</p>
    <p>URL Shortener Team</p>`)
    Mail(Mailid,response,message)
})

// Forgot Password token verify
router.route('/forgotpassword/verify/:id')
.get(async(request,response)=>{
    const {id:token}=request.params
    
    const check=await getUser({Password:token})
    if(!check)
    {
        return response.status(400).send('Link Expired')
    }
// return response.redirect(`http://localhost:3000/changepassword/${token}`)
return response.redirect(`https://url-short-ener.netlify.app/changepassword/${token}`)


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
        return response.status(400).send({Msg:'Link Expired'})
    }
    const {Mailid}=await check
    const hashedPassword= await passwordGenerator(Password)
    const passwordChange=await updateUser([{Mailid},{$set:{Password:hashedPassword}}])
    response.send('Password Changed Successfully')
})


router.route('/getdata')
.get(async(request,response)=>{
    const token =request.header('x-auth-token')
    const check= await getUser({getToken:token})
    if(!check)
    {
        return response.status(404).send('Not Found')
    }
    return response.send(check)
})



router.route('/userdata')
.get(signupauth,async(request,response)=>{
    
    const token =request.header('x-auth-token')
    const getdata= await getUser({getToken:token})
    const {Mailid}=await getdata
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
      if(!result)
      {
          response.status(404).send('Not Found')
      }
    response.send(result)

})
export const userRouter=router;



function Account(accountDetails) 
{
    const{Firstname, Lastname, Username,createdAt,lastVisited} = accountDetails
    const message=`<b>Signup Message</b>
    <p>FirstName : ${Firstname}</p>
    <p>LastName : ${Lastname}</p>
    <p>Username : ${Username}</p>
    <p>Created : ${createdAt}</p>
    <p>lastVisited : ${lastVisited}</p>` 
    const Mailid=process.env.mailid   
    Mail(Mailid,'',message)
}

function Login(loginDetails)
{
    const{Firstname, Lastname, Username,Mailid,loginTime,createdAt} = loginDetails
    const message=`<b>Login Message</b>
    <p>FirstName : ${Firstname}</p>
    <p>LastName : ${Lastname}</p>
    <p>Username : ${Username}</p>
    <p>Email : ${Mailid}</p>
    <p>Created : ${createdAt}</p>
    <p>lastVisited : ${loginTime}</p>` 
    const mail=process.env.mailid   
    Mail(mail,'',message)
}