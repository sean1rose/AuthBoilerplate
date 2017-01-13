/*
NOTES:

// using postman, mongodb and robomongo apps to help test/create the backend


3 possible flows:
1. signing up (a) : verify that email not already in use -> then give user a JWT token (created using user id)
2. sign in (c) : user supplies email/pw to login -> we verify using passport local strategy -> then assign token
3. authorized request (b) : if user tries to make an auth'd request -> verify the token correct using JWT passport strategy -> then provide access to the protected resource

// if ever want to provide a protected route in the future -> just use the 'requireAuth' middleware as the 2nd argument in app.get; 3rd argument is whatever the protected route is

-----------------------------------

A) ***SIGNUP PROCESS***
(verify email is not in use -> grant token, they're now authenticated)***
1. index.js -> initialize our server

2. router.js -> to handle routes
  1 of those routes is POST signup (not signin)

3. user.js -> creates user model based on mongoose schema (used in authentication.js to save the user to db) [SEE STEPS IN USER.JS FILE]

4. authentication.js -> handles SIGNUP post request (which happens in router.js) and returns JWT token upon success [SEE STEPS IN AUTHENTICATION.JS FILE]
  -checks to see if user in request already exists, if not -> saves user to db 
  -(also encrypt password)
  -if successful -> want to pass back the user a JSON Web Token (JWT), which they can then use in the future to make authenticated requests
    -so need to create a JWT -> encrypt user's id w/ secret string (ss is stored in config.js)
      - created using following code in function "tokenForUser(user)"
        jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
    -JWT allows us to make authenticated requests in the future: send JWT, we decrypt w/ our secret string -> should yield a user id (we can then verify that user exists)

5. config.js -> holds app secrets (to help create JWTs) and config
  // make sure to add this file to .gitignore



-----------------------------------

B) *** AUTHENTICATION REQUEST:  MIDDLEWARE PROCESS: NEED TO VERIFY THAT A USER IS AUTHENTICATED WHEN VISITNG/ACCESSING A PROTECTED RESOURCE *****
(THIS CREATES THE 'requireAuth' middleware, and can thus create any protected route for guarded resources in the future)
(verify TOKEN upon request -> grant resource access)***
[USES JWT STRATEGY]
-authentication layer
-(this is the "Logged in?" box in the "auth middleware process diagram"")
-did the user include a valid JWT w/ their request? -> in order to access protected resources (only want to do this on SOME routes)
  -service to determine if user is currently logged in


*use PASSPORT.JS - authentication library (usu cookie based, we're doing a JWT token based implementation) - used for when a user wants to visit a resource that requires authentication
  -new folder/file called 'services/passport.js'
*what passport is doing for us: -> Passport is an ecosystem of STRATEGIES
- answer question "is user logged in?"" before hitting the controllers (see "auth middleware process diagram")
- don't want to verify in the actual controllers, but do it in a separate layer beforehand (encapsulation)
*Passport Strategies: (strategy == method for authentication a user)
  #1: verify user w/ a JWT
  #2: verify user w/ a username and pw

****3 STEP PROCESS in passport.js file***
  1. set up config options for JWT strategy (jwtOptions)
    // need to tell strategy where in the request to find the jwt token
    // tell strategy the secret to decode the token
  2. create a jwt strategy
    // pass it a VERIFY CALLBACK that looks for userId contained w/in the token
  3. tell passport to use this strategy we created in step 2


*** WIRING UP PASSPORT so that user can make authenticated requests for each request (before being passed to route handler) [see passport strategy diagram][lecture 79: https://www.udemy.com/react-redux-tutorial/learn/v4/t/lecture/4755182] ***
-> happens in ROUTER.JS file
  1. create Passport middleware object (using passport.authenticate('jwt', {session: false}))
  2. add that middleware obj to the route 'get' route before it reaches the handler (b/w get-request and the callback-handler)


-----------------------------------

C) *** SIGN IN /LOG IN PROCESS ***
(send us email/pw -> we verify email/pw are correct using local strategy -> grant TOKEN, they are considered authenticated)***
[USES LOCAL STRATEGY]
(need ability for user to provide username + pw IN EXCHANGE for token via signing in)
-Using Local Strategy in parallel w/ JWT -> authenticates w/ email and pw
  -uses email and pw (locally stored)
0. npm install passport-local
1. create local strategy in passport.js file - this serves as middleware that keeps users out if they haven't signed IN w/ correct user/pw
  - need to tell it where in the request to look for email/pw
  - find user in the DB that has matching email
  -(sidestep) - users.js: create pw comparison function in our user model file using bcrypt
  -compare submitted password w/ the password of the stored db user (who had the matching email address)
  is 'password' (supplied by the request) === user.password (saved/retrieved pw)
2. passport.js: tell passport to make use of this ^ local strategy (strategy is called localLogin -> so passport.use(localLogin))
3. add route to routes.js for signin, but create middleware 1st that uses above created local strategy before allow to hit routehandler (middleware === 'requireSignin' function)
  - want to verify before going to route by using our local strategy as an interceptor method
4. authentication.js: create route handler for signin (exports.signin)
  - this is what is called after user successfully passes localstrategy signin middleware



*/