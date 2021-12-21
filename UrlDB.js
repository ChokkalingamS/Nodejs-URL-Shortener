import { customAlphabet } from 'nanoid';
import { client } from './index.js';
import { ObjectId } from "mongodb";

function createData(urlData) {
    return client.db('movielist').collection('Url-Shortener').insertOne(urlData);
}
function findUrl(url) {
    return client.db('movielist').collection('Url-Shortener').findOne(url);
}

function findManyUrl(userData)
{
    return client.db('movielist').collection('Url-Shortener').find(userData).toArray();
}





function updateLog(urlData)
{
    const {longUrl,lastVisited,usedCount}=urlData
    return client.db('movielist').collection('Url-Shortener').updateOne({longUrl},{$set:{lastVisited,usedCount}});
}
function urlGenereator() {
    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
    return nanoid();
}

function deleteUrl(id)
{
    return client.db('movielist').collection('Url-Shortener').deleteOne({_id:ObjectId(id)});
}

function updateUrl(userData)
{
    const {_id,shortUrl,shortString,lastUpdated}=userData
    return client.db('movielist').collection('Url-Shortener').updateOne({_id},{$set:{shortUrl,shortString,lastUpdated}})
}
export{findUrl,findManyUrl,urlGenereator, createData,updateLog,deleteUrl,updateUrl}