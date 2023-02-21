// This is a middleware function that checks the presence and validity of a token in a request.

// It first checks for the token in the query 
// parameter, the x-access-token header, or the 
// authorization header of the request. If the token is found 
// and starts with 'Bearer ', it removes the 'Bearer ' prefix from the token.

// If the token is null or undefined, it invokes the error handler 
// function passed in as next with an error message and HTTP status code 403 (Forbidden).

// If the token is not null or undefined, it verifies the token with 
// a secret key (loaded from an environment variable) using the jwt.verify() 
// method. If there is an error during token verification, it invokes the 
// error handler function with a relevant error message and HTTP status 
// code (401 if the error is a TokenExpiredError, or 403 otherwise). If the 
// token is successfully verified, it attaches the decoded token data to the 
// request object as req.decoded and invokes the next function to proceed to 
// the next middleware in the chain.
const jwt = require('jsonwebtoken');
const {path, ifElse, isNil, startsWith, slice, identity, pipe} = require('ramda');

const secret = process.env.SERVER_SECRET;

module.exports = (req, res, next) => {
  /**
     * @name authorization
     * @description Middleware that checks a token's presence and validity in a request
    */
  pipe(
    (r) =>
      path(['query', 'token'], r)
          || path(['headers', 'x-access-token'], r)
          || path(['headers', 'authorization'], r),
    ifElse(
      (t) => !isNil(t) && startsWith('Bearer ', t),
      (t) => slice(7, t.length, t).trimLeft(),
      identity
    ),
    ifElse(
      isNil,
      () =>
        next({
          message: 'Authorization Error: token missing.',
          status: 403
        }),
      (token) =>
        jwt.verify(token, secret, (e, d) =>
          ifElse(
            (err) => !isNil(err),
            (er) => {
              if (er.name === 'TokenExpiredError') {
                next({
                  message: 'TokenExpiredError',
                  status: 401,
                });
              }
              next({
                message: 'Authorization Error: Failed to verify token.',
                status: 403
              });
            },
            (_, decoded) => {
              req.decoded = decoded;
              return next();
            }
          )(e, d))
    )
  )(req);
};
