# tough-cookie-mem-store
a memory store that can set init cookie for tough-cookie  


## useage
`
import nodefetch from 'node-fetch'
import nodefetchWrap from 'fetch-cookie/node-fetch.js' // use this to get cookie when redirct occus.
import cookiefetch from 'fetch-cookie'
import toughCookieLib from 'tough-cookie'
import JsonObjectCookieStore  from 'tough-cookie-mem-store'

const CookieJar = toughCookieLib.CookieJar;
let fetch = cookiefetch(nodefetchWrap(nodefetch))
let _jsonCookieObject = null;
 
async setCookieStoreJsonObject(jsonObject){
  _jsonCookieObject = new JsonObjectCookieStore(jsonObject);
  const cookieJar = new CookieJar(this._jsonCookieObject);
  fetch = cookiefetch(nodefetchWrap(nodefetch), cookieJar)
}

async getCookieStoreJsonObject(){
  return _jsonCookieObject.getJsonCookieObject();
}

// init cookie object
 let jsonObject = {};
 await this.setCookieStoreJsonObject(jsonObject)
 
 //do fetch here
 
 // fetch(url....)
 
 // after do fetch 
 let jsonCookieNew = await getCookieStoreJsonObject();
 
`
