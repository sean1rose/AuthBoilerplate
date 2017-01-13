// ACTION CREATORS (USING REDUX THUNK)
  // REDUX THUNK IS A MIDDLEWARE Module - allows us to return a function (rather than an action/object) from our action creator; that func giving us access to dispatch method
    // ***dispatch method accepts an action and forwards it to reducers 
    // Dispatch is the main pipeline of redux
    // redux-thunk allows us to dispatch MULTIPLE diff actions from w/in a single action creator (not limited to 1)
      // see signinUser func below - there's multiple responsibilities...
    // middleware must add it when creating store (in index.js)
import axios from 'axios';
import { browserHistory } from 'react-router';
// browser history communicates info about the url to react-router, can alaso use it to make changes to the url
import {
  AUTH_USER,
  UNAUTH_USER,
  AUTH_ERROR,
  FETCH_MESSAGE
} from './types';

// url of API server... (this is the API we are pinging and making post requests to, here on the client side)
const ROOT_URL = 'http://localhost:3090';


/*        !!!!***CORS***!!!!
POST REQUEST from origin localhost:8080 made to API at localhost:3090 (if u check network request, headers tab -> check "Host" and "Origin")
If the domain, subdomain and port of browser and server don't match, then the request will be denied UNLESS the SERVER allows it
Our example currently -> our domain is localhost, clientside port is 8080, but request was made to a different port (3090)
Server is going to look at host or origin header, but they're easy to fake!!!


!!!*** HOW TO RESOLVE CORS***!!!
Main goal: Need to change server side code -> tell it to allow connections from any domain, subdomain, port
SOLUTION: ENABLE CORS ON API SERVER
Go inside of top level index.js -> import 'cors' module/middleware
  -> app.use(cors());

*/



// ACTION CREATOR handling multiple responsibilities
  // had been using redux-promise before. But this time, using REDUX THUNK!!!
    // REDUX THUNK is a middleware func that gives direct access to DISPATCH (dispatch makes sure the action gets sent to all reducers)
export function signinUser1( { email, password }) {
  //****instead of returning an object, redux-thunk allows our action creator to return a FUNCTION (which gives us access to dispatch method)
  return function(dispatch) {
    // can make async request here and at any pt in future can call dispatch.method and pass in action
    // redux thunk gives us access to dispatch func allowing us to dispatch our own actions at any time

    // ***submit email/pw to the server (not webpack server, but our API server handling our auth logic) *** make sure to start api server up!!!!****
      // making ajax request to api server, which is hosted on port 3090
      // 1st arg: posting to route we created on sever side api (check server/router.js -> we made a post route handler for signin)
      // 2nd arg: data we're posting to the end point (email + pw) ==> {email: email, password: password}
    axios.post(`${ROOT_URL}/signin`, { email, password })
      .then(res => {
        // if request is valid...
          // 1. update state to indicate user is authenticated by dispatch state
          dispatch({ type: AUTH_USER });
          // 2. save jwt token (so user can make auth requests in the future)
          localStorage.setItem('token', response.data.token);

          // 3. redirect to route '/feature' using react router (not a total reload of the page) / just swap out the views...
          browserHistory.push('/feature');

      })
      .catch(() => {
        // if request is bad -> show error to user
        dispatch(authError('Bad login info'));
      })
  }
}


export function signinUser({ email, password }) {
  return function(dispatch) {
    // Submit email/password to the server
    axios.post(`${ROOT_URL}/signin`, { email, password })
      .then(response => {
        // If request is good...
        // - Update state to indicate user is authenticated
        dispatch({ type: AUTH_USER });
        // - Save the JWT token
        localStorage.setItem('token', response.data.token);
        // - redirect to the route '/feature'
        browserHistory.push('/feature');
      })
      .catch(() => {
        // If request is bad...
        // - Show an error to the user
        dispatch(authError('Bad Login Info'));
      });
  }
}

export function signupUser({ email, password }) {
  return function(dispatch) {
    axios.post(`${ROOT_URL}/signup`, { email, password })
      .then(response => {
        dispatch({ type: AUTH_USER });
        localStorage.setItem('token', response.data.token);
        browserHistory.push('/feature');
      })
      .catch(response => dispatch(authError(response.data.error)));
  }
}

export function authError(error) {
  return {
    type: AUTH_ERROR,
    payload: error
  };
}

export function signoutUser() {
  localStorage.removeItem('token');

  return { type: UNAUTH_USER };
}

export function fetchMessage() {
  return function(dispatch) {
    axios.get(ROOT_URL, {
      headers: { authorization: localStorage.getItem('token') }
    })
      .then(response => {
        dispatch({
          type: FETCH_MESSAGE,
          payload: response.data.message
        });
      });
  }
}
