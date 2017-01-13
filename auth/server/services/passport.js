const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
// JWT strategy is for auth'd requests
const JwtStrategy = require('passport-jwt').Strategy;
// going to set up this strategy ^ w/ a config obj
const ExtractJwt = require('passport-jwt').ExtractJwt;

const LocalStrategy = require('passport-local');
// 4th EXTRA step -> SIGNIN PROCESS (LOCAL STRATEGY)

// 4. create local strategy (THIS BECOMES THE 'requireAuth' middleware in the router.js)
const localOptions = { usernameField: 'email'};
  // telling strategy to look for email in place of username ^^^ 

// created localStrategy above ^, then save below as localLogin...

  // need to tell local strategy where in the request to look for email/username
const localLogin = new LocalStrategy(localOptions, function(email, password, done) { // this 'password' is pw from the request
  
  
  // find existing user in db -> compare password supplied by request w/ user's saved pw, if same -> call passport callback w/ user model
    // NOTE: convert email to lower case string for mongoose to check if an email exists. (CASE SENSITIVE)
  User.findOne({ email: email.toLowerCase() }, function(err, user) { // user is retrieved user from db w/ matching email
    // if error in the search process...
    if (err) { return done(err); } 
    // if user was not found (user thinks he has an account, but really don't)...
    if (!user) { return done(null, false); }
    
    // *compare passwords - is 'password' of the request === 'user.password' that was retrieved by findOne method (but remember we have a hashed pw)[remember bcrypt diagram][lecture: https://www.udemy.com/react-redux-tutorial/learn/v4/t/lecture/4755188]
    user.comparePassword(password, function(err, isMatch) {
    // 'user' found in db (w/ corresponding email) vs 'password' is the pw from request
      if (err) { return done(err); }
      // if no match -> did not find user
      if (!isMatch) {return done(null, false);}

      // match!
      return done(null, user);
    });
    

  });
  // verify this username and pw,
  // if it is correct username and pw -> call done w/ the user
  // otherwise call done w/ false
});



// SIGN IN LOCAL STRATEGY is ABOVE ^^^

// -----------------------------

// JWT STRATEGY for AUTH'D REQUESTS is BELOW...


// ***3 Step Process***
// 1. Set Up options for JWT Strategy (2 parts)
  // A) need to tell strategy where to look on the request to find the jwt token...
    // whenever a request comes in and we want passport to handle it, look at, specifically, the 'authorization' request header
  // B) tell the strategy the secret it needs to decode the token
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('auth'),
  secretOrKey: config.secret
};


// 2. Create JWT strategy
// 1st arg of JwtStrategy is the options config obj created in step 1, 2nd arg is the VERIFY CALLBACK func called whenever we need to auth a user w/ a jwt token
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  // payload -> decoded JWT token created in authentication.js' "tokenForUser" function (payload should have 'sub' property [user.id] and 'iat' property)
  // done -> callback called depending on whether or not user is successfully authenticated
  
  // STEPS:
  // ***want to see if user ID in the payload exists in our db... (remember that we ecnoded user id as sub property on token)
    // *if so -> pass valid user to done callback -> user is authenticated and now has access
    // *if not -> call done w/o a user obj -> no auth

    console.log('payload.sub - ', payload.sub);


  // have user model, look thru all users for particular id (findById is a mongoose method), id is on our payload.sub property

  User.findById(payload.sub, function(err, user) {
    // serach failed to occur, so 1st arg is err (use null if search works)
    if (err) { return done(err, false); }
    if (user) {
      // if found user -> call done w/o error + that user
      done(null, user);
    } else {
      // couldnt find user -> call done w/ null + false
      done(null, false);
    }
  });
});

// 3. Tell passport to use this strategy we just created (wire everything together)
// jwtLogin is for auth'd request (jwt strategy)
passport.use(jwtLogin);

// localLogin is for local strategy (signin in)
passport.use(localLogin);