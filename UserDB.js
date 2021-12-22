import nodemailer from "nodemailer";
import bcrypt from 'bcrypt';
import { client } from "./index.js";


 function createUser(Firstname, Lastname, Username, Mailid, hashedPassword, createdAt, lastVisited) 
 {
    return client
        .db("movielist")
        .collection("users")
        .insertOne({
            Firstname,
            Lastname,
            Username,
            Mailid,
            Password: hashedPassword,
            createdAt,
            lastVisited,
            Status: "Inactive",
            token: ""
        });
}

 function updateUser(userData) {
    return client.db('movielist').collection('users').updateOne(userData[0], userData[1]);
}
 function getUser(userData) {
    return client.db("movielist").collection("users").findOne(userData);
}

// Password Generator
 async function passwordGenerator(Password) {
    const rounds = 10;
    const salt = await bcrypt.genSalt(rounds); // random string
    const hashedPassword = await bcrypt.hash(Password, salt);
    return hashedPassword;
}

// Mail
  function Mail(Mailid,response,message)
  {
   
    const info = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.email,
            pass: process.env.password,
        },
    });
    const mailOptions = {
        from: process.env.email,
        to: Mailid,
        subject: 'Mail From URL Shortener',
        html:message 
    };
    info.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log('Mail', err);
            response.status(404).send('error')
        } else {
            console.log("Mailstatus :", info.response);
            response.send('Mail Sent For verification')  
        }
    });
}

export { getUser, passwordGenerator, updateUser, Mail, createUser };



