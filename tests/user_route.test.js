/* eslint-disable import/no-unresolved */
require('dotenv').config();
const {mongoose} = require('../src/config');
const {http, test, got, listen, app, User} = require('../src/RouteIn');
const {jwtSign} = require('../src/utilities/authentication/helpers');
const sinon = require('sinon');
let user;

test.before(async (t) => {
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl});
 user = await User.create({
      username: 'testUser',
      password: 'testPassword',
     email: 'testEmail',
    });
  });

test.after.always((t) => { 
   User.deleteMany({}, 
    function(err){
        if(err) console.log(err);
        console.log("Users deleted after testing");
    });
  t.context.server.close();
});

//  POST /user/create should return statusCode=409 and Registration Error message if user already exists (same email) 
test('POST /create should return correct response and status code when creating a user that already exists', async (t) => {
    mongoose();
    //Create a test user
    user = await User({email: 'testuser@gmail.com',username: 'testuser',password: '123456',
    }).save();
    const TestEmail =   'testuser@gmail.com' // test user email
    const TestUsername = 'testuser1' ; //   test user username
    const TestPassword = '012345'; //   test user password
    const TestBody={email:TestEmail , username:TestUsername , password:TestPassword} ;
    //  try creating the same user again
    const {body} = await t.context.got.post(`users/create?`,{json:TestBody});
    //  check
    t.is(body.status,409);
    t.is(body.message,'Registration Error: A user with that e-mail or username already exists.');
  });


//  POST /user/create should return statusCode=409 and Registration Error message if user already exists (same username)
test('POST /user/create should return statusCode=409 and Registration Error message if user already exists (same email)', async (t) => {
    mongoose();
    //Create a test user
    user = await User({email: 'testuser@gmail.com',username: 'testuser',password: '123456',
    }).save();
    const TestEmail =   'testuser2@gmail.com' // test user email
    const TestUsername = 'testuser' ; //   test user username
    const TestPassword = '012345'; //   test user password
    const TestBody={email:TestEmail , username:TestUsername , password:TestPassword} ;
    //  try creating the same user again
    const {body} = await t.context.got.post(`users/create?`,{json:TestBody});
    //  check
    t.is(body.status,409);
    t.is(body.message,'Registration Error: A user with that e-mail or username already exists.');
  });
/*
  //test that POST /user/create returns correct respone and statusCode=200 and when a new user is created 
test('POST /create returns correct response and status code when valid email and username are given ', async (t) => {
    mongoose();
    const TestEmail =   'testuser2@gmail.com' // test user email
    const TestUsername = 'testuser' ; //   test user username
    const TestPassword = '012345'; //   test user password
    const TestBody={email:TestEmail , username:TestUsername , password:TestPassword} ;
    //send POST request with New user email ,username and password in body
    const {body,statusCode} = await t.context.got.post(`users/create?`,{json:TestBody});
    //check response
    t.is(statusCode,200);
    t.assert(body.success);
  });
*/
//test that POST /user/create returns statuscode=400 and Validation Error message when given e-mail is not valid
test('POST /create returns correct response and status code when email-address is not valid ', async (t) => {
    mongoose();
    const TestEmail =   'testuser2gmailcom' // test user email
    const TestUsername = 'testuser' ; //   test user username
    const TestPassword = '012345'; //   test user password
    const TestBody={email:TestEmail , username:TestUsername , password:TestPassword} ;
    //send POST request with New user email ,username and password in body
    const {body} = await t.context.got.post(`users/create?`,{json:TestBody});
    //check response
    t.is(body.status,400);
    t.is(body.message,'Validation Error: email must be a valid email');
  });
