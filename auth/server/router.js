// route handler. Passport is wired up here
// will export a function from this file, imported by index.js file, then pass app into that function

// import authentication controller
const Authentication = require('./controllers/authentication');

// import passport config & passport
const passportService = require('./services/passport');
const passport = require('passport');

// create an MIDDLEWARE OBJECT that is in the middle (interceptor b/w the incoming request and the route handler; so incoming request -> Passport obj -> route handler) [see passport strategy diagram]
  // used to authorize requests when necessary...
  // using 'jwt' strategy, and when user is authenticated, don't create a cookie based session for them (since we're using a token based sesison)
const requireAuth = passport.authenticate('jwt', { session: false });
// ^ use this in route handler before running callback function (see example below)


// 2nd helper to determine if user provided correct username + pw (another form of middleware to authenticate);
// this is the local strategy creaeted in passport.js
// this is used on signin route
const requireSignin = passport.authenticate('local', { session: false});


// to export code in node.js enviornment use module.exports
// define routes that user can visit
module.exports = function(app) {

  // route handler for root route -> when user goes to '/', handler sends user to requireAuth Middleware first -> if get thru that then run callback func
    // so if tried to reach w/o token, wouldn't work (need to authorize and receice JWT first)...
  app.get('/', requireAuth, function(req, res) {
    res.send({ hi: 'there' });
  })
  
  // b4 user can go to signin route handler, must pass thru middleware and be authenticated 1st (verify that they supplied correct username and pw using localstrategy that we created)...
  app.post('/signin', requireSignin, Authentication.signin)

  // route handler for our signup route (POST REQUEST of username and pw to signup)
  app.post('/signup', Authentication.signup);
    // ^ sending to authentication controller (which should provide a json request)
    // Auth.signup function checks to see if user already exists in db, and if not saves user to db (also creating JWT to pass back to user in response)

}





/*     ***EXAMPLE TEST ROUTE***
  
  app.get('/', function(req, res, next) {
    // just responding w/ json
      // want to respond w/ an array of strings...
    res.send(['water', 'bottle', 'phone', 'paper']);
  });

  // standard syntax for route handlers...
    // expecting an http get request for index of our app, then run this function
      // 3 args: 
        // request -> has a bunch of data about the request (where it's coming from, what route looking for, etc);
        // response -> reprsents the response, so can respond to our users in some function
        // next -> mostly for error handling
*/