// This is a Node.js module that exports a function to 
// connect to a MongoDB database using the Mongoose library.

// First, the mongoose library is imported, along 
// with an object called mongooseOptions that contains 
// various options for the Mongoose connection. These options 
// include options for parsing the MongoDB connection string, 
// creating an index for MongoDB collections, modifying existing documents 
// in MongoDB, using the latest server discovery and monitoring engine, 
// specifying a maximum number of connections in the connection pool, and keeping connections alive.

// The mongodbUri variable is set to the value of the MONGODB_URI 
// environment variable. This variable should contain the MongoDB 
// connection string, which specifies the database to connect to and other 
// options such as authentication credentials.

// Finally, a function is exported that connects to the MongoDB 
// database using the mongoose.connect() method and the options 
// defined earlier. Any errors that occur during the connection 
// process are caught and logged to the console using console.error().
const mongoose = require('mongoose');

const mongooseOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  poolSize: 100,
  keepAlive: true,
  keepAliveInitialDelay: 300000
};
const mongodbUri = process.env.MONGODB_URI;
  
module.exports = () => {
  // eslint-disable-next-line no-console
  mongoose.connect(mongodbUri, mongooseOptions).catch(console.error);
};
