import express from 'express'
import dotenv from 'dotenv'
import {MongoClient} from 'mongodb'
import {userRouter} from './user.js'
import {urlRouter} from './Url.js'
import {signupauth} from "./Token.js";
import cors from 'cors'
import { getUser, passwordGenerator, updateUser, Mail,createUser } from './UserDB.js';

export const app=express()
dotenv.config()
export const Base_URL=process.env.URL
const Mongo_URL=process.env.MONGO_URL
const port=process.env.PORT;

// Middleware
app.use(cors())
app.use(express.json())
app.use('/users',userRouter)
app.use('/urlmaker',urlRouter)




// MongoDB Connection
async function createConnection()
{
    const client=new MongoClient(Mongo_URL)
    await client.connect()
    console.log('MongoDB Connected');
    return client
}
export const client=await createConnection()

// Server
app.get('/',(request,response)=>{
    response.send('Url Shortener')
    
})

app.listen(port,()=>{
    console.log('Server Started at',port);
})





// const userdata=client.db('movielist').collection('users').insertOne({Name:"Selva",password:"chokkz1707"})
// const userurl=client.db('movielist').collection('url').insertOne({Name:"Selva",url:"localhost"})

async function datas()
{
const data=await client.db('movielist').collection('users').aggregate([{$lookup:{from:'url',
localField:"name",foreignField:"name",as:"urls"}}]).toArray((err,data)=>{
    console.log(JSON.stringify(data));
})


console.log(data);
}
// datas()



// app.get('/userdata',signupauth,async(request,response)=>{
    
//     const token =request.header('x-auth-token')
//     const getdata= await getUser({getToken:token})
//     const {Mailid}=await getdata
//     // console.log(Mailid);
//     const get = await client
//       .db("movielist")
//       .collection("users")
//       .aggregate([
//         {
//           $lookup: {
//             from: "Url-Shortener",
//             localField: "Mailid",
//             foreignField: "Mailid",
//             as: "urls",
//           },
//         },
//         { $match: { "Mailid": Mailid } },
//         // { $limit: 1 },
//       ])
//       .toArray();

//     const result=await get[0].urls
// //   console.log(get[0].urls);
//       console.log(get);
//       if(!result)
//       {
//           response.status(404).send('Not Found')
//       }
//     response.send(result)

// })



































































// // Creating URL
// app.post('/url',async (request,response)=>{

//     const {url}=request.body;
    
//     // checks whether the given url is valid or not
//     if(!validUrl.isUri(url))
//     {
//         // If the URL is not valid
//      return  response.send('Not a Valid URL')
//     }
    
//     // If the url is valid,it checks for the url whether it is already present in the DB or not
//     const check=await findUrl({ longUrl: url })
//     if(!check)
//     {   
//         // If the url is not present in the DB
//         // Create  a random string for short url
//         const randomString=urlGenereator() 
    
//         // Both Long Url & Random string is stored in the DB
//         const create=await createData(url, randomString)
        
//         const getUrl=await findUrl({ longUrl: url })
//         const {shortUrl}=await getUrl
    
//         // After getting shortUrl string then it is added with the Baseurl
//        return response.send({shortUrl:Base_URL+shortUrl})
//     }
    
//     else
//     {
//         // If the url already present in the DB
//         const getUrl= await findUrl({ longUrl: url })
//         const {shortUrl}=await getUrl
//         return response.send({shortUrl:Base_URL+shortUrl})
//     }
    
//     })
    
    
//     // Redirect
//     app.get('/:url',async (request,response)=>{
//         // After using shorter url,this function takes the random string from the shortUrl 
    
//         const {url}=request.params;
    
//         // checks the random string present in the DB or not
//         const getUrl=await client.db('movielist').collection('Url-Shortener').findOne({shortUrl:url})
//         const {longUrl}=await getUrl
    
//         if(!getUrl)
//         {
//             // if not present
//             return response.status(404).send('Not Found')
//         }
    
//         return response.redirect(longUrl)
//     })
    


// > db.url.aggregate([{$lookup:{from:"user",localField:"name",foreignField:"name",pipeline:[{$match:{name:"chokkalingam"}}],as:"urls"}},{$limit:1}]).toArray()




// db.user.aggregate([{$lookup:{from:"url",localField:"name",foreignField:"name",as:"urls"}}])























