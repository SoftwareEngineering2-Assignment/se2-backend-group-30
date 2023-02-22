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
test.beforeEach(async () => {
    await Dashboard.deleteMany({});
  });
  
  test.after.always(async () => {
    await mongoose.connection.close();
  });
  
  test.serial('Get dashboard by ID', async (t) => {
    const dashboard = await new Dashboard({ name: 'Test Dashboard', password: 'testpassword' }).save();
    const foundDashboard = await Dashboard.findById(dashboard._id);
    t.is(foundDashboard.name, dashboard.name);
    t.is(foundDashboard.password, dashboard.password);
  });
  
  test.serial('Update dashboard', async (t) => {
    const dashboard = await new Dashboard({ name: 'Test Dashboard', password: 'testpassword' }).save();
    dashboard.name = 'Updated Dashboard';
    dashboard.password = 'newpassword';
    await dashboard.save();
    const updatedDashboard = await Dashboard.findById(dashboard._id);
    t.is(updatedDashboard.name, dashboard.name);
    t.is(updatedDashboard.password, dashboard.password);
  });
  
  test.serial('Delete dashboard', async (t) => {
    const dashboard = await new Dashboard({ name: 'Test Dashboard', password: 'testpassword' }).save();
    await Dashboard.findByIdAndDelete(dashboard._id);
    const deletedDashboard = await Dashboard.findById(dashboard._id);
    t.is(deletedDashboard, null);
  });