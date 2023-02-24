/* eslint-disable import/no-unresolved */
require('dotenv').config();
const {mongoose} = require('../src/config');
const {http,test,got,listen,app,User} = require('../src/RouteIn');
const {jwtSign} = require('../src/utilities/authentication/helpers');
const Source = require('../src/models/source');
const sinon = require('sinon');


// Runs before each test
test.before(async (t) => {
  // Create server and prefixUrl
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  
  // Set up HTTP client with prefixUrl
  t.context.got = got.extend({http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl});
  
  // Create a new user for testing
  user = await User.create({
    username: 'user',
    password: 'password',
    email: 'email',
  });
});


// Runs after each test
test.after.always((t) => {
  // Close the server
  t.context.server.close();
  
  // Delete the test user
  User.findByIdAndDelete(user._id);

  // Delete any test sources created during testing
  Source.deleteMany({}, 
    function(err){
      if(err) console.log(err);
      console.log("Successful delete");
    });
});

// Test to verify that GET request to /sources with valid authentication returns a list of sources and a 200 status code
test('GET /sources returns correct response and status code for authenticated user', async (t) => {
    mongoose();
    
    // Generate a JWT token for the user
    const token = jwtSign({id: user._id});
  
    // Create a new source for the user
    const newSource = await Source({name:'sourceOne',type: '',url:'',login:'',passcode:'',vhost: '',owner: user._id,createdAt:''}).save();
  
    // Send GET request to /sources with authentication token
    const {body, statusCode} = await t.context.got(`sources/sources?token=${token}`);
  
    // Verify that the status code is 200
    t.is(statusCode,200);
  
    // Verify that the response body contains a "success" key
    t.assert(body.success);
  
    // Verify that the response body contains the name of the new source
    t.is(body.sources[0].name, newSource.name);
  });
  
  
  // Test to verify that GET request to /sources with invalid authentication returns a 403 status code
  test('GET /sources returns 403 status code for invalid authentication', async (t) => {
    mongoose();
  
    // Generate a JWT token for the user
    const token = jwtSign({id: user._id});
  
    // Create a new source for the user
    const newSource = await Source({name:'sourceOne',type: '',url:'',login:'',passcode:'',vhost: '',owner: user._id,createdAt:''}).save();
  
    // Generate an invalid authentication token
    const wrongToken ='63ac2df45d196j8o0c93c338'; 
  
    // Send GET request to /sources with invalid authentication token
    const {body} = await t.context.got(`sources/sources?token=${wrongToken}`);
    
    // Verify that the status code is 403
    t.is(body.status,403);
  
    // Verify that the response body contains an error message
    t.is(body.message,'Authorization Error: Failed to verify token.');
  });
  
// Test to verify that POST request to /create-source with invalid data returns a 404 Bad Request status code
test('POST /create-source with invalid data returns 404 status code', async (t) => {
    mongoose();
    const token = jwtSign({id: user._id});
    const invalidSourceData = {name: '', type: 'invalid', url: 'invalid', login: '', passcode: '', vhost: '', owner: user._id, createdAt:''};
    const {statusCode, body} = await t.context.got.post(`sources/create-source?token=${token}`, {json: invalidSourceData});
  
    t.is(statusCode, 404);
  });
  
  // Test to verify that GET request to /sources returns correct response and status code for unauthenticated user
  test('GET /sources returns correct response and status code for unauthenticated user', async (t) => {
    mongoose();
    const {body} = await t.context.got('sources/sources');
  
    t.is(body.status, 403);
    t.is(body.message, 'Authorization Error: token missing.');
  });
  
  // Test to verify that GET request to /sources/:id returns correct response and status code for authenticated user
  test('GET /sources/:id returns correct response and status code for authenticated user', async (t) => {
    mongoose();
    const token = jwtSign({id: user._id});
  
    const newSource = await Source({name: 'sourceOne', type: '', url: '', login: '', passcode: '', vhost: '', owner: user._id, createdAt: ''}).save();
  
    const {body, statusCode} = await t.context.got(`sources/sources?token=${token}`);
  
    t.is(statusCode, 200);
    t.assert(body.success);
  });
  
  // Test to verify that GET request to /sources/:id returns 404 Not Found status code for non-existent source id
  test('GET /sources/:id returns 404 Not Found status code for non-existent source id', async (t) => {
    mongoose();
    const token = jwtSign({id: user._id});
  
    const nonExistentId = '5f5b6b0a8f82c304a85d6dd7';
    
    const {body, statusCode} = await t.context.got(`sources/${nonExistentId}?token=${token}`);
  
    t.is(statusCode, 404);
    t.is(body.message, `Source with id ${nonExistentId} does not exist`);
  });

  
test('POST /create-source returns correct response and status code when trying to create a new Newsource with a name that already exists ', async (t) => {
  mongoose();
  const token = jwtSign({id: user._id});
  
  Newsource = await Source({name:'sourceNew',type: '',url:'',login:'',passcode:'',vhost: '',owner: user._id,createdAt:'',
  }).save();

  const duplName = 'sourceNew' ; 
  const sourceDupl={name:duplName} ;
 
  const {body} = await t.context.got.post(`sources/create-source?token=${token}`,{json:sourceDupl});
 
  t.is(body.status,409);
  t.is(body.message,'A source with that name already exists.');
});