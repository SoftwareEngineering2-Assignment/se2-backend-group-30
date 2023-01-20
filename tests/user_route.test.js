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

//test that POST /user/create returns statuscode=400 and Validation Error message when given password is shorter than 5 characters
test('POST /create returns correct response and status code when password is too short ', async (t) => {
    mongoose();
    const TestEmail =   'testuser@gmail.com' // test user email
    const TestUsername = 'testuser' ; //   test user username
    const TestPassword = '123'; //   test user password
    const TestBody={email:TestEmail , username:TestUsername , password:TestPassword} ;
    //send POST request with New user email ,username and password in body
    const {body} = await t.context.got.post(`users/create?`,{json:TestBody});
    //check response
    t.is(body.status,400);
    t.is(body.message,'Validation Error: password must be at least 5 characters');
  });

  //test that POST /user/authenticate returns statusCode=401 and Authentication Error message when user gives wrong username
test('POST /authenticate returns correct response when username is wrong', async (t) => {
    mongoose();
    //Create  test user
    user = await User({email: 'testuser@gmail.com',username: 'testuser',password: '123456',}).save();
    const TestUsername = 'testuser123' ; //wrong username
    const TestBody={username:TestUsername , Testpassword:'123456'} ;
    //send POST request with username and password in body
    const {body} = await t.context.got.post(`users/authenticate?`,{json:TestBody});
    //check response
    t.is(body.status,401);
    t.is(body.message,'Authentication Error: User not found.');
  });

//test that POST /user/authenticate returns statusCode=401 and Authentication Error message when password doenst match username
test('POST /authenticate returns correct response when user enters wrong password', async (t) => {
    mongoose();
    //Create existing test user
    user = await User({email: 'testuser@gmail.com',username: 'testuser',password: '123456',}).save();
    const TestUsername = 'testuser' ; //wrong username
    const TestBody={username:TestUsername , Testpassword:'1234567'} ;
    //send POST request with username and password in body
    const {body} = await t.context.got.post(`users/authenticate?`,{json:TestBody});
    //check response
    t.is(body.status,401);
    t.is(body.message,'Authentication Error: Password does not match!');
  });

//test that POST /user/authenticate returns correct response and statusCode=200 when user is authenticated correctly
test('POST /authenticate returns correct response username when password match', async (t) => {
    mongoose();
    //Create existing test user
    user = await User({email: 'testuser@gmail.com',username: 'testuser',password: '123456',}).save();
    const TestUsername = 'testuser' ; //wrong username
    const TestBody={username:TestUsername , Testpassword:'123456'} ;
    //send POST request with username and password in body
    const {body} = await t.context.got.post(`users/authenticate?`,{json:TestBody});
    //check response
    t.is(statusCode,200);
    t.is(body.user.username,user.username);
    t.is(body.user.email,user.email);
  });

 //test that POST /user/resetpassword returns statusCode=404 and Resource Error message when a user with the given username was not found
test('POST /resetpassword returns correct response and status code when trying to reset password with wrong username', async (t) => {
  mongoose();
  const TestUsename = 'tesruser'
  const TestBody={username : TestUsename} ;
  //send POST request with username  in body
  const {body} = await t.context.got.post(`users/resetpassword?`,{json:TestBody});
  //check response
  t.is(body.status,404);
  t.is(body.message,'Resource Error: User not found.');
});

 //test that POST /user/reset password returns correct response and statuscode=200 when email to change password is sent seccessfully
 test('POST /resetpassword returns correct response and status code given a valid username', async (t) => {
  mongoose();
  const TestBody={username : user.username} ;
  //send POST request with username  in body
  const {body,statusCode} = await t.context.got.post(`users/resetpassword?`,{json:TestBody});
  //check response
  console.log(body)
  t.assert(body.ok);
  t.is(statusCode,200);
  t.is(body.message,'Forgot password e-mail sent.');
});

 //test that POST /user/changepassword returns statusCode=200 when password changes successfully
 test('POST /changepassword returns correct response and status code when password changes successfully', async (t) => {
  mongoose();
  const token = jwtSign({username : user.username});
  const TestBody={password: '1234567'} ;
  //send POST request with new password in body
  const {body,statusCode} = await t.context.got.post(`users/changepassword?token=${token}`,{json:TestBody});
  //check response
  t.assert(body.ok);
  t.is(statusCode,200);
  t.is(body.message,'Password was changed.');
});

  //test that POST /user/changepassword returns statusCode=404 and Resource Error message when username is wrong
  test('POST /changepassword returns correct response and status code when user is not found', async (t) => {
    mongoose();
    const token = jwtSign({username : 'testuse1'});
    const TestBody={password: '1234567'} ;
    //send POST request with new password in body
    const {body} = await t.context.got.post(`users/changepassword?token=${token}`,{json:TestBody});
    //check response
    t.is(body.status,404);
    t.is(body.message,'Resource Error: User not found.');
  });

  //test that POST /user/changepassword returns statusCode=410 and Resource Error message when token has expired
  test('POST /changepassword returns correct response and status code when username token has expired', async (t) => {
    mongoose();
    const token = jwtSign({username: user.username}); //authenticate user
  
    // Stub the clock with sinon:
    const clock = sinon.useFakeTimers();
    // Move clock forward by 1 hour 
    await clock.tickAsync(3600000);
  
    const UserBody={password : 'NewPass1234'} ; //post body with new password
    //send POST request with authentication token in query and new password in body
    const {body} = await t.context.got.post(`users/changepassword?token=${token}`,{json:UserBody});
    //check response
    t.is(body.status , 410);
    t.is(body.message,' Resource Error: Reset token has expired.');
     // Restore current clock for other tests:
     clock.restore();
  });

    //test that POST /user/create returns status code 500 when error is thrown
test('POST /create handles error correctly', async (t) => {
  mongoose();
  //Create existing test user
  user = await User({email: 'User1@gmail.com',username: 'User1',password: '13434UserExists',
  }).save();
  const NewUserEmail =   'User1@gmail.com' //new user email
  const NewUserName = 'User2' ; //new user username
  const NewUserPassword = 'Pass1234'; //new user password
  const UserBody={email:NewUserEmail , username:NewUserName , password:NewUserPassword} ;
  //Throw error
  sinon.stub(User, 'findOne').rejects(new Error('Something went wrong'))
  //send POST request with New user email ,username and password in body
  const {body} = await t.context.got.post(`users/create?`,{json:UserBody});
  //check response
  t.is(body.status,500);
  t.is(body.message,'Something went wrong');

  User.findOne.restore();
});

//test that POST /user/authenticate returns status code 500 when error is thrown
test('POST /authenticate handles error correctly', async (t) => {
  mongoose();
  //Create existing test user
  user = await User({email: 'User4@gmail.com',username: 'User4',password: 'CorrectPassword',}).save();
  //Throw error
  sinon.stub(User, 'findOne').throws(new Error('Something went wrong'))
  const UserBody={username : user.username, password:'CorrectPassword'} ;
  //send POST request with username and password in body
  const {body} = await t.context.got.post(`users/authenticate?`,{json:UserBody});
  //check response
  t.is(body.status,500);
  t.is(body.message,'Something went wrong');

  //Restore sub
  User.findOne.restore();
});

 //test that POST /user/resetpassword returns status code 500 when error is thrown
 test('POST /resetpassword handles error correctly', async (t) => {
  mongoose();
  const UserBody={username : user.username} ;
  //Throw error
  sinon.stub(User, 'findOne').rejects(new Error('Something went wrong'))
  //send POST request with username  in body
  const {body} = await t.context.got.post(`users/resetpassword?`,{json:UserBody});
  //check response
  t.is(body.status,500);
  t.is(body.message,'Something went wrong');
  
  //Restore sub
  User.findOne.restore();
});

 //test that POST /user/changepassword returns status code 500 when error is thrown
 test('POST /changepassword handles error correctly', async (t) => {
  mongoose();
  const token = jwtSign({username : user.username});
  const UserBody={password: 'NewPass12'} ;
  //Throw error
  sinon.stub(User, 'findOne').throws(new Error('Something went wrong'))
  //send POST request with new password in body
  const {body} = await t.context.got.post(`users/changepassword?token=${token}`,{json:UserBody});
  //check response
  t.is(body.status,500);
  t.is(body.message,'Something went wrong');
  
  //Restore sub
  User.findOne.restore();
});