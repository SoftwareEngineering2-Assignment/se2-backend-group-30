// Import required modules and initialize variables
require('dotenv').config();
const {http, test, got, listen, app, User, Dashboard} = require('../src/RouteIn');
const Source = require('../src/models/source');
const sinon = require('sinon');

// Set up test environment before tests
test.before(async (t) => {
  // Create an HTTP server and get its prefix URL
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  // Create a Got client that uses the prefix URL and other settings
  t.context.got = got.extend({http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl});

  // Create a test user, dashboard, and source for testing purposes
  user = await User.create({username: 'user', password: 'password', email: 'email'});
  dash = await Dashboard({name: 'dashCopy', layout: [], items: {}, nextId: 10, password: '', shared: 0, views: 17, owner: user._id, createdAt: ''}).save();
  source = await Source({name:'sourceFirst', type: '', url: '', login: '', passcode: '', vhost: '', owner: user._id, createdAt: ''}).save();
});

// Close the server after running all tests
test.after.always((t) => {
  t.context.server.close();
});

// Test that GET /general/test-url returns the correct response and status code when the correct URL is given
test('GET /test-url returns correct response for correct URL', async (t) => {
    const trueUrl = "https://se2-frontend-30.netlify.app/";
    const { body, statusCode } = await t.context.got(`general/test-url?url=${trueUrl}`);
    t.assert(body.active); // check that the response contains 'active' property and it is true
    t.is(statusCode, 200); // check that the response status code is 200 (OK)  
});

// Test that GET /general/test-url returns the correct response and status code when the incorrect URL is given
test('GET /test-url returns correct response for incorrect URL', async (t) => {
    const falseUrl = "https://30.netlify.app/";
    const { body } = await t.context.got(`general/test-url?url=${falseUrl}`);
    t.assert(!body.active); // check that the response contains 'active' property and it is false
    t.is(body.status, 500); // check that the response status code is 500 (Internal Server Error)
});
