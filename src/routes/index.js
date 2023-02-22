// This code defines an Express router that handles HTTP 
// requests for several different routes. It imports other 
// routers for handling routes related to users, sources, 
// dashboards, general information, and a root path.

// The router.use() method is used to mount the imported routers
//  at their respective paths. For example, any HTTP requests that 
//  start with the path /users will be routed to the users router.

// Finally, the router is exported for use in other parts of the application.
const express = require('express');
const users = require('./users');
const sources = require('./sources');
const dashboards = require('./dashboards');
const general = require('./general');
const root = require('./root');

const router = express.Router();

router.use('/users', users);
router.use('/sources', sources);
router.use('/dashboards', dashboards);
router.use('/general', general);
router.use('/', root);

module.exports = router;
