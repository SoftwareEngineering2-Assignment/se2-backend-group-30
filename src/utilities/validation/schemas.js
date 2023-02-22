// This code exports a module with a few yup validation schemas for validating data input in 
// a user authentication system. Here is a summary of the exported schemas:

// authenticate: validates the user's credentials when logging in, requires a username and password.
// register: validates user input when creating an account, requires an email, password, and username.
// request: validates input when requesting a password reset, requires a username.
// change: validates input when changing the password, requires a password.
// update: validates input when updating user information, allows updating username and password.
// All the schemas use the yup library to define the validation rules. For example, the 
// password schema requires that the password be at least min characters long, where min is a constant defined in a separate module.
const {isNil} = require('ramda');

const yup = require('yup');
const {min} = require('./constants');

const email = yup
  .string()
  .lowercase()
  .trim()
  .email();

const username = yup
  .string()
  .trim();

const password = yup
  .string()
  .trim()
  .min(min);

const request = yup.object().shape({username: username.required()});

const authenticate = yup.object().shape({
  username: username.required(),
  password: password.required()
});

const register = yup.object().shape({
  email: email.required(),
  password: password.required(),
  username: username.required()
});

const update = yup.object().shape({
  username,
  password
}).test({
  message: 'Missing parameters',
  test: ({username: u, password: p}) => !(isNil(u) && isNil(p))
});

const change = yup.object().shape({password: password.required()});

module.exports = {
  authenticate, register, request, change, update
};
