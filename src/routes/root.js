// This is a piece of Node.js code that uses the Express.js 
// framework to define a router that serves a static HTML file. Let's break down each part of the code:
// First, we import the Express.js and path modules.
// We create an instance of the Express router using 
// express.Router() and assign it to the router constant.
// We use the path.join() method to construct the file path 
// to the index.html file. The __dirname variable represents 
// the current directory, so we go up two levels (../../) to find the file.
// We use the express.static() middleware to serve the static 
// files in the specified directory (file).
// We define a route using the router.get() method that responds
//  to requests to the root URL ('/'). The callback function for this route sends the index.html file using the res.sendFile() method.
// Finally, we export the router so that it can be used in other parts of the application.
// Overall, this code sets up a basic web server using 
// Express.js that serves a single static HTML file when a user accesses the root URL.
const express = require('express');
const path = require('path');

const router = express.Router();

const file = path.join(__dirname, '../../index.html');
router.use(express.static(file));

router.get('/', (req, res) => res.sendFile(file));

module.exports = router;
