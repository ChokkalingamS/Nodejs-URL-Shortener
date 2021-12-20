import { customAlphabet } from 'nanoid';
import { client } from './index.js';
import { ObjectId } from "mongodb";

function createData(urlData) {
    return client.db('movielist').collection('Url-Shortener').insertOne(urlData);
}
function findUrl(url) {
    return client.db('movielist').collection('Url-Shortener').findOne(url);
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
export{findUrl, urlGenereator, createData,updateLog,deleteUrl}