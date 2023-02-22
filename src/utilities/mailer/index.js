// This code exports an object with two properties: mail and send.
// The mail property references the password module, 
// which contains a function for generating an email message to reset a user's password.
// The send property references the send module, which contains a function for sending an email.
// Together, these two modules are used to generate and send an email to reset a user's password.

const password = require('./password');
const send = require('./send');

module.exports = {
  mail: password,
  send
};
