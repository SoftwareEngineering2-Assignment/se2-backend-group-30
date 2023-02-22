// This code exports an object that contains two properties:

// constants: an object that exports the min and expires constants.
// schemas: an object that exports five schemas that can be used for 
// validation of user input in a web application. The five schemas are named authenticate, 
// register, request, change, and update. These schemas use the Yup library to define the shape and constraints of the input objects.
const constants = require('./constants');
const schemas = require('./schemas');

module.exports = {
  constants,
  schemas
};
