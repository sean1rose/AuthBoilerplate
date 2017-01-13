// local definition of a user data model - email, password
// instructions for mongoose to handle this data model
// using bcrypt library here...
/*
1. Define our model schema
2. encrypt password
3. Create model class using mongoose
4. export model
*/

const mongoose = require('mongoose');
// schema helps define the particular fields that our model will have
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs'); 

// 1. DEFINE OUR MODEL SCHEMA
  // create a schema
    // inside of obj constructor of our schema, pass in properties (and their types) that this model will have (email and pw)
    // want to ensure each property entered into our db is unique -> use object for email key value w/ unique property set to true (also convert to lowercase 1st cuz mongo doesn't differentiate)
const userSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String
});


// before saving a model -> run this function (pre-save) (a hook that runs before user is saved)
// generate a salt and combines it w/ our pw
  // salt == randomly generated string of characters 
  // salt + pw => salt + hashed pw
userSchema.pre('save', function(next) {
  // context is user model -> get access to user model
  const user = this;

  // generate a salt + callback after salt is created
  bcrypt.genSalt(10, function(err, salt) {
    // salt is used to hash/encrypt
    if (err) { return next(err); }

    // hash our pw using the salt ("hash" means to encrypt) -> result is a hash (hashed pw)
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) { return next(err); }

      // overwrite plain pw w/ encrypted pw
      user.password = hash;
      // go ahead and save the model (since this is a pre-save hook)
      next();
    })
  });
});

// candiate pw is pw submitted in request
userSchema.methods.comparePassword = function(candidatePassword, callback) {
  // this.password -> our hashed and salted pw stored and retrieved from db
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    // bcrypt does the comparison for us behind the scenes. If so -> isMatch will be true
    if (err) { return callback(err); }

    callback(null, isMatch);
  })
}


// 2. CREATE THE MODEL CLASS USING MONGOOSE
  // used to create new users
// loads the schema into mongoose, corresponds w/ collection 'user'
const ModelClass = mongoose.model('user', userSchema);
// ^ represents all users, a class of users

// 3. Export model so other files w/in our app can use it
module.exports = ModelClass;