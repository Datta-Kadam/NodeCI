//buffer lib to generate the sessionString 
const buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
//Get the cookie key from dev or prod file using keys file in config folder
const keys = require('../../config/keys');
//Create a new instance of keygrip using cookieKey got from keys file
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = user => {     
     //session object which uses mongo db id for that user to generate session object
     const sessionObject ={
         passport: {
             user: user._id.toString()
         }
     }
     //generate a sesion string with base64
     const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');     
     //Sign the sessionstring using newly created keygrip instance.
     const sig = keygrip.sign('session='+session);
     return { session, sig}
}