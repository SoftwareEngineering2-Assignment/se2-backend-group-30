// This is a Mongoose schema for a reset token that is used to reset a 
// user's password. It defines the structure of the 
// document that will be stored in the "reset-tokens" collection in the MongoDB database.

// The schema has three fields:

// username: the username of the user who requested the 
// password reset token. This field is required, and must be unique.
// token: the reset token that is generated and sent to the user via email. This field is also required.
// expireAt: the expiration date and time of the token. This 
// field is not required, as it has a default value of the 
// current date and time. The index is set to expire the document 
// after a certain amount of time has passed, as specified by the 
// expires constant in the validation utility.
/* eslint-disable func-names */
const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const {constants: {expires}} = require('../utilities/validation');

const ResetSchema = new mongoose.Schema({
  username: {
    index: true,
    type: String,
    required: true,
    unique: 'A token already exists for that username!',
    lowercase: true
  },
  token: {
    type: String,
    required: true
  },
  expireAt: {
    type: Date,
    default: Date.now,
    index: {expires},
  },
});

// Plugin for Mongoose that turns duplicate errors into regular Mongoose validation errors.

ResetSchema.plugin(beautifyUnique);

mongoose.pluralize(null);
module.exports = mongoose.model('reset-tokens', ResetSchema);
