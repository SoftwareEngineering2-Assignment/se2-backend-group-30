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

//test that GET /dashboards returns correct statusCode=200 and body got an authenticate user
test('GET /dashboards returns correct response and status code', async (t) => {
    mongoose(); //Connect to the database using Mongoose
    const token = jwtSign({id: user._id}); //Generate a JWT token for the user
    //Create 2 new test dashboards for the authenticated user
    dash1 = await Dashboard({name: 'Dashboardfirst',layout:[],items:{},nextId: 1,password: '',shared: 0,views: 2,owner: user._id,createdAt:'',
    }).save();

    dash2 = await Dashboard({name: 'dashSec',layout:[],items:{},nextId: 2,password: '',shared: 1,views: 7,owner: user._id,createdAt:'',
    }).save();

    //send GET request with authenticated user's token in query
    const {body, statusCode} = await t.context.got(`dashboards/dashboards?token=${token}`);
    //check response
    t.is(statusCode, 200); //Verify that the status code is 200
    t.assert(body.success); //Verify that the response body contains a "success" property
  });

//test that POST /create-dashboard successfully creates new dashboard when user is authenticated and dashboard name doesn't already exist
 test('POST /create-dashboard returns correct response and status code', async (t) => {
    mongoose(); //Connect to the database using Mongoose
    const token = jwtSign({id: user._id}); //Generate a JWT token for the user
    //create new dashboard for user with name=Dashname
    Dashboardsec = await Dashboard({name: 'NameFirst',layout:[],items:{},nextId: 6,password: '12345678',shared: 0,views: 10,
                                    owner: user._id,createdAt:'',
    }).save();

    const new_name = 'NameSec' ;  //dashboard name different from the existing one
    const dashBody = {name:new_name};
    //send POST request with authenticated user's token in query and new dashboard name in body
    const {body,statusCode} = await t.context.got.post(`dashboards/create-dashboard?token=${token}`,{json:dashBody});;
    //check response
    t.is(statusCode,200);
    t.assert(body.success);
})
// Test that POST /create-dashboard successfully doesn't create new dashboard, when another dashboard with the same name already exists
test('POST /create-dashboard returns correct response and status code for dupl dashboard', async (t) => {
    // Set up the test by creating a dashboard with the name "Dash" using the Dashboard model
    await Dashboard.create({
      name: 'Dash', layout: [], items: {}, nextId: 1, password: '', shared: 0, views: 2, owner: user._id, createdAt: ''});
  
    // Create a new dashboard with the same name as the existing one
    const NewDash = new Dashboard({ name: 'Dash', nextId: 2 });
    const token = jwtSign({id: user._id}); //Generate a JWT token for the user
    // Send a POST request to the /create-dashboard endpoint with the authenticated user's token in the query and the new dashboard's name in the body
    const { body } = await t.context.got.post(`dashboards/create-dashboard?token=${token}`, { json: NewDash });
  
    // Check that the response has a status of 409 and a message indicating that a dashboard with the same name already exists
    t.is(body.status, 409);
    t.is(body.message, 'A dashboard with that name already exists.');
  });
  
  // Test that POST /delete-dashboard returns correct response when the given id doesn't belong to an existing dashboard
  test('POST /delete-dashboard returns correct response when selected dashboard is not found ', async (t) => {
    // Set up the test by creating a new user token
    const token = jwtSign({ id: user._id });
  
    // Set the id of the dashboard to be deleted to 0, which should not exist
    const body_del = { id: 0 };
  
    // Send a POST request to the /delete-dashboard endpoint with the authenticated user's token in the query and the dashboard id in the body
    const { body } = await t.context.got.post(`dashboards/delete-dashboard?token=${token}`, { json: body_del });
  
    // Check that the response has a status of 409 and a message indicating that the selected dashboard has not been found
    t.is(body.status, 409);
    t.is(body.message, 'The selected dashboard has not been found.');
  });
  
  // Test that POST /delete-dashboard successfully deletes a dashboard when given a correct dashboard id
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
  

//test that GET /dashboard returns correct response when an existing dashboard's id is given
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

//test that GET /dashboard returns correct response when the id given doesn't belong to an existing dashboard
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

//test that POST /save-dashboard updates dashboard successfully when an existing dashboard's id is given
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

//test that POST /save-dashboard returns correct response when given id doesn't belong to an existing dashboard
test('POST /save-dashboard returns correct response when selected dashboard is not found ', async (t) => {
  mongoose();
  const token = jwtSign({id: user._id});
  const body_id= {id:0} //dashboard id not existing
//send POST request with authenticated user's token in query and dashboard id in body
  const {body} = await t.context.got.post(`dashboards/save-dashboard?token=${token}`,{ json :body_id});
  //check response
  t.is(body.status, 409);
  t.is(body.message, 'The selected dashboard has not been found.');
});

//test POST/clone-dashboard clones the dashboard successfully when correct dashboard id and name are given
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

//test POST/clone-dashboard returns correct response when correct in is given but new Dashboard name already exists 
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
