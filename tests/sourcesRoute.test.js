/* eslint-disable import/no-unresolved */
require('dotenv').config();
const {mongoose} = require('../src/config');
const {http,test,got,listen,app,User} = require('../src/RouteImport');
const {jwtSign} = require('../src/utilities/authentication/helpers');
const Source = require('../src/models/source');
const sinon = require('sinon');


test.before(async (t) => {
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl});
  user = await User.create({
    username: 'user',
    password: 'password',
   email: 'email',
  });
  });

test.after.always((t) => {
  t.context.server.close();
  
  User.findByIdAndDelete(user._id);

  Source.deleteMany({}, 
    function(err){
      if(err) console.log(err);
      console.log("Successful delete");
    });
});


test('GET /sources returns correct response and status code for authenticated user ', async (t) => {
  mongoose();
  const token = jwtSign({id: user._id});

  Newsource = await Source({name:'sourceOne',type: '',url:'',login:'',passcode:'',vhost: '',owner: user._id,createdAt:'',
  }).save();


  const {body, statusCode} = await t.context.got(`sources/sources?token=${token}`);

  t.is(statusCode,200);
  t.assert(body.success);
});


test('GET /sources returns correct response and status code for wrong user authentication ', async (t) => {
  mongoose();
  const token = jwtSign({id: user._id});

  Newsource = await Source({name:'sourceOne',type: '',url:'',login:'',passcode:'',vhost: '',owner: user._id,createdAt:'',
  }).save();

  const wrong_token ='63ac2df45d196j8o0c93c338'; 

  const {body} = await t.context.got(`sources/sources?token=${wrong_token}`);
  
  t.is(body.status,403);
  t.is(body.message,'Authorization Error: Failed to verify token.');
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