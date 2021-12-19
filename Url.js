import validUrl from 'valid-url';
import { findUrl, urlGenereator, createData,updateLog } from './UrlDB.js';
import { Base_URL} from './index.js';
import express from 'express'


const router=express.Router()

// Creating URL
router.route('/url')
.post( async (request, response) => {

    const { url,Mailid,customUrl } = request.body;
    const date=new Date()
    const createdAt=(`${date.toLocaleDateString()},${date.toLocaleTimeString()}`)
    const lastVisited=createdAt;

    if (!validUrl.isUri(url)) {
        return response.status(400).send({Msg:'Not a Valid URL'});
    }

    const shortCheck=await findUrl({shortUrl:url})
    if(shortCheck)
    {
        const{shortUrl}=await shortCheck;
        return response.send({ shortUrl,Msg:'Already URL Shortened'});
    }

    const check = await findUrl({ longUrl: url });
    if (!check) {
      
        if(customUrl)
        {
            const check = await findUrl({shortString:customUrl}); 
            if(check)
            {
                return response.status(400).send({Msg:'Try Another Custom URL'})
            }
        }
        const randomString=(customUrl)?customUrl:urlGenereator();

        const create = await createData({
          Mailid,
          longUrl: url,
          shortString: randomString,
          shortUrl: Base_URL + randomString,
          createdAt,
          lastVisited,
          usedCount:0,
        });

        const getUrl = await findUrl({ longUrl: url });
        const { shortUrl } = await getUrl;
        return response.send({ shortUrl,Msg:'URL Created'});
    }


    else {
        const getUrl = await findUrl({ longUrl: url });
        const { shortUrl } = await getUrl;
        return response.send({ shortUrl,Msg:'Already URL Exists'});
    }

});



// Redirect
router.route('/:url')
.get(async (request, response) => {
    const { url } = request.params;
    const getUrl = await findUrl({ shortString: url });
    const { longUrl,lastVisited,usedCount } = await getUrl;
    const date=new Date()
    const loginTime=(`${date.toLocaleDateString()},${date.toLocaleTimeString()}`)
    const update= await updateLog({longUrl,lastVisited:loginTime,usedCount:usedCount+1 })
    if (!getUrl) {
        return response.status(404).send('Not Found');
    }

    return response.redirect(longUrl);
});




export const urlRouter=router;