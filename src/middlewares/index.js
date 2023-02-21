// This code exports an object containing references to three middleware functions: authorization, error, and validation.

// authorization is a middleware function that checks the 
// presence and validity of a JWT token in a request. 
// It expects the token to be included in the query string, 
// the x-access-token header, or the Authorization header using 
// the Bearer token scheme. If the token is valid, the decoded token 
// data is added to the req object as req.decoded, and the next 
// middleware is called. If the token is invalid, an error response is sent.

// error is a middleware function that handles errors in requests. 
// It expects an error object to be passed to it, and it sends an 
// error response with the given error message and status code.

// validation is a middleware function that validates the request 
// body using a schema defined using the Joi library. If the validation 
// fails, an error response is sent with the validation error message. If 
// the validation succeeds, the next middleware is called.
const authorization = require('./authorization');
const error = require('./error');
const validation = require('./validation');

module.exports = {
  authorization,
  error,
  validation,
};
