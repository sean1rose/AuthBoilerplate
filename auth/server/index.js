// main starting point of the application
// mainly just initialization of our server. handle routes in different file

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
// create instance of express App
const app = express();

// import exported router
const router = require('./router');
// going to call router, passing in app as an argument (look below)

const mongoose = require('mongoose');
// DB Setup - tell mongoose to hook up to instance of mongodb
mongoose.connect('mongodb://localhost:auth/auth');
// creates a new db inside of mongodb called auth


// APP SETUP -> getting express working + middleware
// boilerplate musthaves know rhyme or reason:
// tell app to use morgan -> morgan is a logging framework (logs incoming requests, used for debugging)
app.use(morgan('combined'));
// morgan and bodyparser -> express middleware
  // any incoming request will be passed into both 1st
// bodyparser is used to parse incoming requests into json (no matter the request type)
app.use(bodyParser.json({ type: '*/*' }));
// router is imported from separate file (route handler)
router(app);
  


// INITIAL SERVER SETUP -> getting express app talking to outside world
// 1. define PORT server we'll run on on our local machine
  // if there's an env variable of port already defined use that otherwise use 3090
const port = process.env.PORT || 3090
// http native node library -> create a server that knows how to receive requests, and anything that comes in forward it to our express application
  // app is what we'll add functionality to over time
const server = http.createServer(app)
// tell server to listen to our port
server.listen(port);
console.log('server listening on -> ', port);


// adding route handlers (that respond w/ data) outside of index.js