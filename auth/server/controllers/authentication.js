// ***Authentication Controller - 
// PURPOSE: Handling the post request of user signup -> either user already exists or save user to DB**

/* STEPS for creating signup route:
1. grab request body info (json format - email and password are sent in the request by the client side)
2. make sure body has both requisite properties (email and pw)
3. check to see if email/user already exists in the db
  // -> if exists already -> send response back saying so
  // -> if doesn't exist -> step 4...
4. create a new user, based on imported mongoose model (schema requires email and pw)
5. save that user and [send response back to client saying successful save]
  ***IMPORTANT: want to send back a response with a JSON WEB TOKEN (AUTH TOKEN)
6. create a JWT (token) (to send back as response upon successful save)
  // to create a token, create a function that takes user id and encodes it w/ secret string (tokenForUser)
7. send that JWT as response upon successful post signup request (successful being that the unique user saved to DB)
*/



// router defines the route user can visit -> upon hitting signup route and posting -> execute Authentication function, which sends back a json response (res.send)
// logic to process a request

const User = require('../models/user');
// mongoose user model
// import config secret string and jwt library
const jwt = require('jwt-simple');
const config = require('../config');

// func to CREATE A JWT token (takes in user model as an arg)
function tokenForUser(user) {
  // timestamp used for iat
  const timestamp = new Date().getTime();
  // use user id mixed w/ secret in order to encode and produce jwt (don't use email, which could change) 
  // JWT's have a 'sub' property -> 'subject' is the specific user
  // 'iat' -> issued at time
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
  // ^ CREATING THE PAYLOAD using an encoded secret
}


// new route handler for signin
// PURPOSE: provide token
exports.signin = function(req, res, next) {
  // user has already had their email and pw auth'd (they've successfully passed thru the middleware)
  // just need to give them a token
  // need to get access to current user model so can give them a token 
  // done callback provvided by localStrategy (in passport.js) assigns user to req.user in this file (req.user is our user obj)
  res.send({ token: tokenForUser(req.user) });
}


// ***GOAL: enter in a user into db if one is passed via signup post request, check to see if user w/ that email already exists, then save the record and respond w/ a success response
// THIS IS THE SIGNUP ROUTE
exports.signup = function(req, res, next) {
  // 0. pull out info from request object (which should have email and pw data) of a post request
    // ***to pull out data -> use REQ.BODY (anything contained w/in the body of the post request)*** IMPORTANT
    // so need to send email and pw in the body of the post request
  const email = req.body.email;
  const password = req.body.password;
  
  // ^ ***NOTE: NEVER want to save password as Plain Text -> want to store an encrypted password***
  // ***IMPORTANT***
  // use bcrypt to encrypt password!!!

  console.log('rb - ', req.body);
  // ^ router provides us w/ post-submitted user (w/ email + pw) -> 

  // want to also ensure that user submits both an email and password (backend validation)
  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide an email AND password' });
  }


  // 1. See if user w/ given email exists (using 'findOne' method)
    // need to check thru db records and see if that email exists (if so -> throw error)
    // need ability to check our db records
    // use mongoose user model ('User' is 'User class') w/ method findOne, which checks for email property then calls callback
    User.findOne( { email: email }, function(err, existingUser) {
      // existingUser will be null if user doesn't exist
      // connection to db failed
      if (err) { return next(err); }

      // 2. if user already exists -> return an error (ERROR HANDLING)
      if (existingUser) {
        // set http code on response to 422
        return res.status(422).send({ error: 'Email is in use' });
      }

      // 3. if user w/ email does NOT exist -> create AND save user record (to create new user -> call 'new' keyword on 'User' class)
      // create new user (in memory) (This is  the CREATing part)
      // create a user by using the imported USER MODEL (which is based on a mongoose schema)
      const user = new User({
        email: email,
        password: password
      });
      
      // SAVE the user record to MONGODB (this is the SAVE part)
      user.save(function(err) {
        if (err) { return next(err); }
        
        // respond to successful user save w/ JWT
      res.json({ token: tokenForUser(user) });
      });

    });
    // can now test this in postman ^, if successfully save a record in db, automatically get an id assigned




  
}