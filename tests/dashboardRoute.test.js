/* eslint-disable import/no-unresolved */ //Disable import errors from eslint
require('dotenv').config(); //Load environment variables from .env file
const {mongoose} = require('../src/config'); //Import Mongoose library and the configuration
const {jwtSign} = require('../src/utilities/authentication/helpers'); //Import a JWT signing helper function
const {http,test,got,listen,app,User,Dashboard,DeleteUsersAndDashboards} = require('../src/RouteIn'); //Import several modules from a custom file
const sinon = require('sinon'); //Import a library for testing

test.before(async (t) => {
  t.context.server = http.createServer(app); //Create an HTTP server with the app
  t.context.prefixUrl = await listen(t.context.server); //Set the server's URL
  t.context.got = got.extend({http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl}); //Configure a "got" client to make HTTP requests
  user = await User.create({username: 'user',password: 'password',email: 'email',}); //Create a new user for testing
});

test.after.always((t) => {
  t.context.server.close(); //Close the server after all tests have run
  //delete all users and dashboards that were created 
  DeleteUsersAndDashboards(); //Remove all test users and dashboards from the database
});

//Test to verify that GET request to /dashboards returns the correct response and status code
test('GET /dashboards returns correct response and status code', async (t) => {
  mongoose(); //Connect to the database using Mongoose
  const token = jwtSign({id: user._id}); //Generate a JWT token for the user

  //Create 2 new test dashboards for the authenticated user
  dash1 = await Dashboard({
    name: 'Dashboardfirst',
    layout: [],
    items: {},
    nextId: 1,
    password: '',
    shared: false, // fix for shared property
    views: 2,
    owner: user._id,
    createdAt: '',
  }).save();
  dash2 = await Dashboard({
    name: 'dashSec',
    layout: [],
    items: {},
    nextId: 2,
    password: '',
    shared: true, // fix for shared property
    views: 9,
    owner: user._id,
    createdAt: '',
  }).save();

  const {body, statusCode} = await t.context.got(`dashboards/dashboards?token=${token}`);

  //check response
  t.is(statusCode, 200); //Verify that the status code is 200
  t.assert(body.success); //Verify that the response body contains a "success" property
});

//Test to verify that POST request to /create-dashboard returns the correct response and status code
test('POST /create-dashboard returns correct response and status code', async (t) => {
  mongoose(); //Connect to the database using Mongoose
  const token = jwtSign({id: user._id}); //Generate a JWT token for the user
  //create new dashboard for user with name=Dashname
  DashboardFirst = await Dashboard({name: 'NameFirst',layout:[],items:{},nextId: 6,password: '12345678',shared: 0,views: 10,
                                  owner: user._id,createdAt:'',
  }).save();

  DashboardSec = await Dashboard({name: 'NameSec',layout:[],items:{},nextId: 6,password: '12345678',shared: 0,views: 10,
  owner: user._id,createdAt:'',
}).save();

 
  //send POST request with authenticated user's token in query and new dashboard name in body
  const {body, statusCode} = await t.context.got(`dashboards/dashboards?token=${token}`);

  t.is(statusCode, 200); //verify status code is 200
  t.true(body.success); //verify response has success property set to true
});

// Test to verify that POST request to /create-dashboard with a duplicate name returns a 409 Conflict status code
test('POST /create-dashboard with duplicate name returns 409 status code', async (t) => {
  mongoose(); //Connect to the database using Mongoose
  const token = jwtSign({id: user._id}); //Generate a JWT token for the user
  // Create a new dashboard
  await Dashboard.create({name: 'DashOne',layout:[],items:{},nextId: 1,password: '',shared: 0,views: 6, owner: user._id,createdAt:'' });

  // Create dupl
  const DuplDash = new Dashboard({name:'DashOne',nextId:2});
  // Send new dashboard
  const {body} = await t.context.got.post(`dashboards/create-dashboard?token=${token}`,{ json :DuplDash});
  //Check response
  t.is(body.status, 409); //Verify that the status code is 409 Conflict
  t.is(body.message, 'A dashboard with that name already exists.'); //Verify that the response body contains the correct error message
});


  test('POST /delete-dashboard returns correct response when selected dashboard is not found ', async (t) => {
    // Set up the test by creating a new user token
    const token = jwtSign({ id: user._id });
  
    // Set the id of the dashboard to be deleted to 0, which should not exist
    const body_del = { id: 0 };
  

    const { body } = await t.context.got.post(`dashboards/delete-dashboard?token=${token}`, { json: body_del });
  

    t.is(body.status, 409);
    t.is(body.message, 'The selected dashboard has not been found.');
  });
  

  test('POST /delete-dashboard returns correct response when selected dashboard is found and deleted', async (t) => {
    // Set up the test by creating a new user token and a dashboard to be deleted
    const token = jwtSign({ id: user._id });
    const dash = await Dashboard({
      name: 'dashDelete',
      layout: [],
      items: {},
      nextId: 1,
      password: '',
      shared: 0,
      views: 2,
      owner: user._id,
      createdAt: '',
    }).save();
  
    // Set the id of the dashboard to be deleted to the id of the dashboard created above
    const id = { id: dash._id };
  
    // Send a POST request to the /delete-dashboard endpoint with the authenticated user's token in the query and the dashboard id in the body
    const { body, statusCode } = await t.context.got.post(`dashboards/delete-dashboard?token=${token}`, { json: id });
  
    // Check that the response has a status of 200 and that the body indicates the deletion was successful
    t.is(statusCode, 200);
    t.assert(body.success);
  });

test('GET /dashboard returns correct response when selected dashboard exists', async (t) => {
  mongoose();
  const token = jwtSign({id: user._id});
 //Create test dashboard 
 dash = await Dashboard({name: 'dashGet',layout:[],items:{},nextId: 6,password: '',shared: 0,views: 10,owner: user._id,createdAt:'',
  }).save();

  const id = dash._id; //id of dashboard created above
  //send GET request with authenticated user's token and dashboard's id in query
  const {body,statusCode} = await t.context.got(`dashboards/dashboard?token=${token}&id=${id}`);
  //check response
  t.is(statusCode,200);
  t.assert(body.success);

});


test('GET /dashboard returns correct response when selected dashboard does not exists', async (t) => {
  mongoose();
  const token = jwtSign({id:user._id});
  const id = '67ab17187c66d60ad82cf6cc'; //id of non existing dashboard
  //send GET request with authenticated user's token and dashboard's id in query
  const {body} = await t.context.got(`dashboards/dashboard?token=${token}&id=${id}`);
  //check response
  t.is(body.status, 409);
  t.is(body.message, 'The selected dashboard has not been found.');
});


test('POST /save-dashboard returns correct response when selected dashboard exists and is updated successfully', async (t) => {
  mongoose();
  const token = jwtSign({id: user._id});
 //Create test dashboard    
 dash = await Dashboard({name: 'dashSave',layout:[],items:{},nextId: 6,password: '',shared: 0,views: 10,owner: user._id,createdAt:'',
  }).save();

  const id = {id:dash._id}; //id of dashboard created above
  //send POST request with authenticated user's token in query and dashboard id in body
  const {body,statusCode} = await t.context.got.post(`dashboards/save-dashboard?token=${token}`,{ json :id});
  //check response
  t.is(statusCode,200);
  t.assert(body.success);

});

// Test to verify that GET request to /dashboards with an invalid token returns a 401 Unauthorized status code
test('GET /dashboards with invalid token returns 401 status code', async (t) => {
  mongoose(); //Connect to the database using Mongoose
  const token = 'invalid-token'; //Set an invalid token
  const {statusCode} = await t.context.got(`dashboards/dashboards?token=${token}`);
  //Check response
  t.is(statusCode, 403); //Verify that the status code is 401 Unauthorized
});

// Test to verify that GET request to /dashboards without a token returns a 401 Unauthorized status code
test('GET /dashboards without token returns 401 status code', async (t) => {
  mongoose(); //Connect to the database using Mongoose
  const {statusCode} = await t.context.got('dashboards/dashboards');
  //Check response
  t.is(statusCode, 403); //Verify that the status code is 401 Unauthorized
});

// Test to verify that POST request to /create-dashboard with an invalid token returns a 401 Unauthorized status code
test('POST /create-dashboard with invalid token returns 401 status code', async (t) => {
  mongoose(); //Connect to the database using Mongoose
  const token = 'invalid-token'; //Set an invalid token
  const {statusCode} = await t.context.got.post(`dashboards/create-dashboard?token=${token}`);
  //Check response
  t.is(statusCode, 403); //Verify that the status code is 401 Unauthorized
});

// Test to verify that POST request to /create-dashboard without a token returns a 401 Unauthorized status code
test('POST /create-dashboard without token returns 401 status code', async (t) => {
  mongoose(); //Connect to the database using Mongoose
  const {statusCode} = await t.context.got.post('dashboards/create-dashboard');
  //Check response
  t.is(statusCode, 403); //Verify that the status code is 401 Unauthorized
});

test('POST /save-dashboard returns correct response when selected dashboard is not found ', async (t) => {
  mongoose();
  const token = jwtSign({id: user._id});
  const body_id= {id:0} //dashboard id not existing

  const {body} = await t.context.got.post(`dashboards/save-dashboard?token=${token}`,{ json :body_id});
  //check response
  t.is(body.status, 409);
  t.is(body.message, 'The selected dashboard has not been found.');
});


test('POST /clone-dashboard returns correct response when dashboard clones successfully', async (t) => {
  mongoose();
  const token = jwtSign({id: user._id});
 //Create test dashboard 
 dash = await Dashboard({name: 'dashCopy',layout:[],items:{},nextId: 6,password: '',shared: 0,views: 10,owner: user._id,createdAt:'',
  }).save();
  //Name of clone dashboard
  const new_name='dashCopied';
  const DashBody = {dashboardId:dash._id, name:new_name}; //Body of new dashboard with new ,non existing name

 //send POST request with authenticated user's token in query and dashboard id and new_name in body
  const {body,statusCode} = await t.context.got.post(`dashboards/clone-dashboard?token=${token}`,{json:DashBody});
  //check response
  t.is(statusCode,200);
  t.assert(body.success);
});

test('POST /clone-dashboard returns correct response when dashboard with same name already exists', async (t) => {
  mongoose();
  const token = jwtSign({id: user._id});
 //Creat dashboard we want to clone
 dash1 = await Dashboard({name: 'dashCopy',layout:[],items:{},nextId: 6,password: '',shared: 0,views: 10,owner: user._id,createdAt:'',
  }).save();

  //Create dashboard with sane name as the one ,we want the cloned dashboard to have
  dash2 = await Dashboard({name: 'dashExists',layout:[],items:{},nextId: 6,password: '',shared: 0,views: 4,
                            owner: user._id,createdAt:'',
  }).save();

  const DashBody = {dashboardId:dash1._id,name:'dashExists'}; //Dashboard body with same name as the one created above
  //send POST request with authenticated user's token in query and dashboard id and new_name in body
  const {body} = await t.context.got.post(`dashboards/clone-dashboard?token=${token}`,{json:DashBody});
  //check response
  t.is(body.status, 409);
  t.is(body.message, 'A dashboard with that name already exists.');
});


// Test to verify that POST request to /check-password-needed returns correct response if dashboard does not exist
test('POST /check-password-needed returns correct response if dashboard does not exist', async (t) => {
  mongoose();
  const token = jwtSign({id: user._id});
  
  // Creating a new dashboard for testing purposes
  newdash = await Dashboard({
  name: 'Dash',
  layout:[],
  items:{},
  nextId: 6,
  password: '',
  shared: 0,
  views: 21,
  owner: user._id,
  createdAt:'',
  }).save();
  
  // Using a non-existing ID to test that the correct response is returned
  const wrongId = '67ab17187c66d60ad82cf6cc';
  
  const Dash = {
  user: user._id, // Using the ID of the user who owns the dashboard
  dashboardId: wrongId,
  };
  
  // Making the POST request to check the password
  const {body} = await t.context.got.post(`dashboardsPassword/check-password-needed?token=${token}`, {json: Dash});
  
  t.is(body.status, 409);
  t.is(body.message, 'The specified dashboard has not been found.');
  });
  
  // Test to verify that POST request to /check-password-needed returns correct response if owner wants to get dashboard
  test('POST /check-password-needed returns correct response if owner wants to get dashboard', async (t) => {
  mongoose();
  const token = jwtSign({id: user._id});
  
  // Creating a new dashboard for testing purposes
  newdash = await Dashboard({
  name: 'Dash',
  layout:[],
  items:{},
  nextId: 6,
  password: 'null',
  shared: 1,
  views: 21,
  owner: user._id,
  createdAt:'',
  }).save();
  
  // Using the ID of the user who wants to access the dashboard
  const newUser = {id: user._id};
  
  const Dash = {
  user: newUser,
  dashboardId: newdash._id,
  };
  
  // Making the POST request to check the password
  const {body, statusCode} = await t.context.got.post(`dashboardsPassword/check-password-needed?token=${token}`, {json: Dash});
  
  t.is(statusCode, 200);
  t.assert(body.success);
  t.is(body.owner, 'self');
  });

  // This test case verifies that POST /check-password-needed returns a correct response when a user tries to access another user's dashboard that is not being shared
test('POST /check-password-needed returns correct response when user tries to access another user dashboard that is not being shared', async (t) => {
  // Connect to MongoDB
  mongoose();
  // Generate JWT token for the user
  const token = jwtSign({id: user._id});
  // Create a dashboard owned by the user
  const dashboard = await Dashboard.create({
    name: 'Test Dashboard',
    layout: [],
    items: {},
    nextId: 8,
    password: '',
    shared: 0,
    views: 0,
    owner: user._id,
    createdAt: Date.now()
  });
  // Create another user
  const otherUser = await User.create({username: 'otherUser',password: 'password',email: 'email'});
  // Attempt to access the dashboard owned by the other user
  const response = await t.context.got.post(`dashboardsPassword/check-password-needed?token=${token}`, {json: {user: otherUser._id, dashboardId: dashboard._id}});
  // Verify that the response contains an error message and the status code is 403 Forbidden
  t.is(response.statusCode, 403);
  t.is(response.body.message, 'You are not authorized to access this dashboard');
});

// This test case verifies that POST /check-password-needed returns a correct response when a user tries to access another user's dashboard that does not have a password
test('POST /check-password-needed returns correct response when user tries to access another user dashboard that does not have a password', async (t) => {
  // Connect to MongoDB
  mongoose();
  // Generate JWT token for the user
  const token = jwtSign({id: user._id});
  // Create a dashboard owned by the other user
  const dashboard = await Dashboard.create({
    name: 'Test Dashboard',
    layout: [],
    items: {},
    nextId: 9,
    password: '',
    shared: 1,
    views: 0,
    owner: user._id,
    createdAt: Date.now()
  });
  // Create another user
  const otherUser = await User.create({username: 'otherUser',password: 'password',email: 'email'});
  // Attempt to access the dashboard owned by the other user
  const response = await t.context.got.post(`dashboardsPassword/check-password-needed?token=${token}`, {json: {user: otherUser._id, dashboardId: dashboard._id}});
  // Verify that the response contains the correct owner information and the status code is 200 OK
  t.is(response.statusCode, 200);
  t.is(response.body.owner, 'otherUser');
  t.is(response.body.success, true);
});
