/* eslint-disable import/no-unresolved */
require('dotenv').config();

const test = require('ava').default;
const Dashboard = require('../src/models/dashboard');
const {mongoose} = require('../src/config');

//test that a dashboard cant be created without a name
test('Create dashboard without name',async t => {
    mongoose();
    const dashboard =  await t.throwsAsync(Dashboard.create({}));
    t.is(dashboard.message,'dashboards validation failed: name: Dashboard name is required')
    Dashboard.deleteOne({});
});

//test that a dashboard with name and password can be created
test('Create dashboard with name and password',async t => {
    mongoose();
    const dashboard =  await new Dashboard({name:'jima',password:'123456789'}).save();
    t.is(dashboard.name,'jima');
    t.is(dashboard.npassword),('123456789')
    Dashboard.deleteOne({});
});

//test comparePassword method
test('Compare dashboard passwords',async t => {
    mongoose();
    const dashboard = await new Dashboard({name:'jima',password:'123456789'}).save(); 
    const cmp1 = dashboard.comparePassword('123456789');
    const cmp2 = dashboard.comparePassword('012345678');
    t.is((cmp1,cmp2),(true,false));
    Dashboard.deleteOne({});
});

// test that a dashboard can be retrieved by its name
test('Retrieve dashboard by name', async t => {
    mongoose();
    const dashboard = await new Dashboard({name: 'jima', password: '123456789'}).save();
    const retrievedDashboard = await Dashboard.findOne({name: 'jima'});
    t.is(retrievedDashboard.name, dashboard.name);
    t.is(retrievedDashboard.password, dashboard.password);
    Dashboard.deleteOne({});
    });
    
    // test that a dashboard can be updated
    test('Update dashboard', async t => {
    mongoose();
    const dashboard = await new Dashboard({name: 'jima', password: '123456789'}).save();
    const updatedDashboard = await Dashboard.findOneAndUpdate({name: 'jima'}, {password: '987654321'}, {new: true});
    t.is(updatedDashboard.password, '987654321');
    Dashboard.deleteOne({});
    });
    
    // test that a dashboard can be deleted
    test('Delete dashboard', async t => {
    mongoose();
    const dashboard = await new Dashboard({name: 'jima', password: '123456789'}).save();
    await Dashboard.deleteOne({name: 'jima'});
    const deletedDashboard = await Dashboard.findOne({name: 'jima'});
    t.is(deletedDashboard, null);
    });