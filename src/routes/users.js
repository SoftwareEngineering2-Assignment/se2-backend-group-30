// This is a Node.js module that defines a router 
// object for handling user authentication and password reset functionality for a web application.
// 
// The module exports an Express router object, which has four routes defined:
// 
// POST /create - accepts a request to create a new user account. 
// Validates the request body against a JSON schema using the 
// validation middleware, checks if a user with the same username 
// or email already exists, and creates a new user record in the database.
// 
// POST /authenticate - accepts a request to authenticate a user. 
// Validates the request body against a JSON schema using the 
// validation middleware, looks up the user by username, checks if 
// the password provided matches the password in the user record, 
// and generates a JWT token with user information (username, ID, and email) 
// using the jwtSign utility function.
// 
// POST /resetpassword - accepts a request to initiate a password 
// reset for a user. Validates the request body against a 
// JSON schema using the validation middleware, looks up the user 
// by username, generates a JWT token with the username, saves the 
// token to the database, sends an email to the user with a link to a 
// password reset page that includes the token.
// 
// POST /changepassword - accepts a request to change the password for a user. 
// Validates the request body against a JSON schema using the validation 
// middleware, requires a JWT token for authorization using the authorization 
// middleware, looks up the user by the username in the decoded JWT token, 
// checks if a password reset token exists in the database for the user, 
// updates the user's password in the database, and removes the password reset token from the database.
// 
// The router requires several middleware functions and utility functions, 
// which are imported from other modules. The middleware functions include:
// 
// validation - validates request body against a JSON schema using ajv library
// authorization - checks for a valid JWT token and decodes it using jsonwebtoken library
// The utility functions include:
// 
// jwtSign - generates a JWT token with the specified payload using jsonwebtoken library
// mailer - generates a HTML email with a link to a password reset page using nodemailer library
// The router also imports two Mongoose models:
// 
// User - represents a user account in the database
// Reset - represents a password reset token in the database
// Overall, this module provides a set of routes that allow users 
// to create an account, authenticate, and reset their password. The 
// implementation uses best practices for security by requiring strong 
// passwords, using JWT tokens for authentication, and generating secure 
// password reset tokens.
const express = require('express');
const {validation, authorization} = require('../middlewares');
const {helpers: {jwtSign}} = require('../utilities/authentication');

const {mailer: {mail, send}} = require('../utilities');

const router = express.Router();

const User = require('../models/user');
const Reset = require('../models/reset');

router.post('/create',
  (req, res, next) => validation(req, res, next, 'register'),
  async (req, res, next) => {
    const {username, password, email} = req.body;
    try {
      const user = await User.findOne({$or: [{username}, {email}]});
      if (user) {
        return res.json({
          status: 409,
          message: 'Registration Error: A user with that e-mail or username already exists.'
        });
      }
      const newUser = await new User({
        username,
        password,
        email
      }).save();
      return res.json({success: true, id: newUser._id});
    } catch (error) {
      return next(error);
    }
  });

router.post('/authenticate',
  (req, res, next) => validation(req, res, next, 'authenticate'),
  async (req, res, next) => {
    const {username, password} = req.body;
    try {
      const user = await User.findOne({username}).select('+password');
      if (!user) {
        return res.json({
          status: 401,
          message: 'Authentication Error: User not found.'
        });
      }
      if (!user.comparePassword(password, user.password)) {
        return res.json({
          status: 401,
          message: 'Authentication Error: Password does not match!'
        });
      }
      return res.json({
        user: {
          username, 
          id: user._id, 
          email: user.email
        },
        token: jwtSign({username, id: user._id, email: user.email})
      });
    } catch (error) {
      return next(error);
    }
  });

router.post('/resetpassword',
  (req, res, next) => validation(req, res, next, 'request'),
  async (req, res, next) => {
    const {username} = req.body;
    try {
      const user = await User.findOne({username});
      if (!user) {
        return res.json({
          status: 404,
          message: 'Resource Error: User not found.'
        });
      }
      const token = jwtSign({username});
      await Reset.findOneAndRemove({username});
      await new Reset({
        username,
        token,
      }).save();

      const email = mail(token);
      send(user.email, 'Forgot Password', email);
      return res.json({
        ok: true,
        message: 'Forgot password e-mail sent.'
      });
    } catch (error) {
      return next(error);
    }
  });

router.post('/changepassword',
  (req, res, next) => validation(req, res, next, 'change'),
  authorization,
  async (req, res, next) => {
    const {password} = req.body;
    const {username} = req.decoded;
    try {
      const user = await User.findOne({username});
      if (!user) {
        return res.json({
          status: 404,
          message: 'Resource Error: User not found.'
        });
      }
      const reset = await Reset.findOneAndRemove({username});
      if (!reset) {
        return res.json({
          status: 410,
          message: ' Resource Error: Reset token has expired.'
        });
      }
      user.password = password;
      await user.save();
      return res.json({
        ok: true,
        message: 'Password was changed.'
      });
    } catch (error) {
      return next(error);
    }
  });

module.exports = router;
