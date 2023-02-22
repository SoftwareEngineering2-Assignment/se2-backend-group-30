// This is a Node.js Express router that defines three API endpoints: /statistics, /test-url, and /test-url-request.
// 
// The /statistics endpoint returns statistics about the number of 
// users, dashboards, views, and sources in the system. It uses the 
// countDocuments() method to count the number of users and sources, 
// and the aggregate() method to sum up the views of all dashboards. 
// It then returns a JSON response with the success flag set to true and 
// the statistics as the payload.
// 
// The /test-url endpoint takes a URL as a query parameter and returns the 
// HTTP status code of the response, as well as a boolean indicating whether 
// the URL is active (i.e., returns a 200 status code).
// 
// The /test-url-request endpoint takes a URL, HTTP method (GET, POST, or PUT), 
// headers, request body, and query parameters as query parameters. 
// It uses the got library to make an HTTP request to the specified
//  URL with the specified method, headers, body, and query parameters. 
//  It then returns a JSON response with the HTTP status code of the 
//  response and the body of the response.
// 
// All three endpoints use async/await syntax to handle asynchronous 
// operations and return Promises. If an error occurs, the endpoints return 
// a JSON response with a status code of 500 and an error message.
/* eslint-disable max-len */
const express = require('express');
const got = require('got');

const router = express.Router();

const User = require('../models/user');
const Dashboard = require('../models/dashboard');
const Source = require('../models/source');

router.get('/statistics',
  async (req, res, next) => {
    try {
      const users = await User.countDocuments();
      const dashboards = await Dashboard.countDocuments();
      const views = await Dashboard.aggregate([
        {
          $group: {
            _id: null, 
            views: {$sum: '$views'}
          }
        }
      ]);
      const sources = await Source.countDocuments();

      let totalViews = 0;
      if (views[0] && views[0].views) {
        totalViews = views[0].views;
      }

      return res.json({
        success: true,
        users,
        dashboards,
        views: totalViews,
        sources
      });
    } catch (err) {
      return next(err.body);
    }
  });

router.get('/test-url',
  async (req, res) => {
    try {
      const {url} = req.query;
      const {statusCode} = await got(url);
      return res.json({
        status: statusCode,
        active: (statusCode === 200),
      });
    } catch (err) {
      return res.json({
        status: 500,
        active: false,
      });
    }
  });

router.get('/test-url-request',
  async (req, res) => {
    try {
      const {url, type, headers, body: requestBody, params} = req.query;

      let statusCode;
      let body;
      switch (type) {
        case 'GET':
          ({statusCode, body} = await got(url, {
            headers: headers ? JSON.parse(headers) : {},
            searchParams: params ? JSON.parse(params) : {}
          }));
          break;
        case 'POST':
          ({statusCode, body} = await got.post(url, {
            headers: headers ? JSON.parse(headers) : {},
            json: requestBody ? JSON.parse(requestBody) : {}
          }));
          break;
        case 'PUT':
          ({statusCode, body} = await got.put(url, {
            headers: headers ? JSON.parse(headers) : {},
            json: requestBody ? JSON.parse(requestBody) : {}
          }));
          break;
        default:
          statusCode = 500;
          body = 'Something went wrong';
      }
      
      return res.json({
        status: statusCode,
        response: body,
      });
    } catch (err) {
      return res.json({
        status: 500,
        response: err.toString(),
      });
    }
  });

module.exports = router;
