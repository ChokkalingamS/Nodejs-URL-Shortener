import express from 'express'
import dotenv from 'dotenv'
import {MongoClient} from 'mongodb'
import {userRouter} from './user.js'
import {urlRouter} from './Url.js'
import cors from 'cors'


export const app=express()
dotenv.config()
export const Base_URL=process.env.URL
const Mongo_URL=process.env.MONGO_URL
const port=process.env.PORT;

// Middleware
app.use(cors())
app.use(express.json())
app.use('/users',userRouter)
app.use('/',urlRouter)

// MongoDB Connection
async function createConnection()
{
    const client=new MongoClient(Mongo_URL)
    await client.connect()
    console.log('MongoDB Connected');
    return client
}
export const client=await createConnection()


app.listen(port,()=>{
    console.log('Server Started at',port);
})


















































































