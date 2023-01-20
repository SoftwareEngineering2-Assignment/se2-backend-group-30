/* eslint-disable import/no-unresolved */
require('dotenv').config();
const test = require('ava').default;
const User = require('../src/models/user');
const {mongoose} = require('../src/config');
const { UnsupportedProtocolError } = require('got/dist/source');


test('Test => create user without username or password or email',async t => {
    mongoose();
    const test1 =  await t.throwsAsync(User.create({}));
    t.is(test1.message,'users validation failed: password: User password is required, username: Username is required, email: User email is required');
});


test('Test => try to create user with small password ',async t => {
    mongoose();
    const test2 =  await t.throwsAsync(User.create({username:'dimi',password:'123',email:'jima@gmail.com'}));
    t.is(test2.message,'users validation failed: password: Path `password` (`123`) is shorter than the minimum allowed length (5).');
    User.deleteOne({username:'dimi'});
});


test('Test => just create user',async t => {
    mongoose();
    const test3 = await User.create({username:'dimi',password:'123456',email:'jima@gmail.com'}); 
    t.is(test3.username,'dimi');
    User.deleteOne({username:'dimi'});
});


test('Compare password to see if it matches',async t => {
    mongoose();
    const result4 = await User.create({username:'dimi',password:'123456',email:'jima@gmail.com'}); 
    const cmpare1 = result4.comparePassword('123');
    const cmpare2 = result4.comparePassword('123456');
    t.is((cmpare1,cmpare2),(false,true));
    User.deleteOne({username:'dimi'});
});