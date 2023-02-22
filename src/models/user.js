// This is a schema definition for a Mongoose model for a user in a 
// Node.js application. It defines the structure of user documents to be stored in a MongoDB database.

// The schema has four fields:

// email: a unique, required, lowercase string field that represents the user's email.
// username: a unique, required string field that represents the user's username.
// password: a required string field that stores the user's 
// password. It is not selected by default when querying the 
// database, to avoid exposing it in API responses.
// registrationDate: a field that stores the registration date of the user.
// The schema defines a pre-save hook that hashes the user's 
// password using the passwordDigest function imported from a 
// separate module. It also sets the registrationDate field to 
// the current date if the email or username fields have been modified.

// The comparePassword method is defined on the schema's methods 
// object. It is used to compare a plain text password with the 
// hashed password stored in the password field.

// Finally, the schema is exported as a Mongoose model with the name users.
/* eslint-disable func-names */
const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const {passwordDigest, comparePassword} = require('../utilities/authentication/helpers');
const {constants: {min}} = require('../utilities/validation');

mongoose.pluralize(null);

const UserSchema = new mongoose.Schema(
  {
    email: {
      index: true,
      type: String,
      unique: 'A user already exists with that email!',
      required: [true, 'User email is required'],
      lowercase: true
    },
    username: {
      index: true,
      type: String,
      unique: 'A user already exists with that username!',
      required: [true, 'Username is required'],
    },
    password: {
      type: String,
      required: [true, 'User password is required'],
      select: false,
      minlength: min
    },
    registrationDate: {type: Number}
  }
);

// Plugin for Mongoose that turns duplicate errors into regular Mongoose validation errors.

UserSchema.plugin(beautifyUnique);

// Pre save hook that hashes passwords

UserSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = passwordDigest(this.password);
  }
  if (this.isModified('email') || this.isModified('username')) {
    this.registrationDate = Date.now();
  }
  return next();
});

// Model method that compares hashed passwords

UserSchema.methods.comparePassword = function (password) {
  return comparePassword(password, this.password);
};

module.exports = mongoose.model('users', UserSchema);
