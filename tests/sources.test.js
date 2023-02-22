// Import required modules
require('dotenv').config(); // Load environment variables
const test = require('ava').default; // Test runner library
const Source = require('../src/models/source'); // Source model
const {mongoose} = require('../src/config'); // Database configuration

// Ensure that the test environment is set up before running any test
test.before(async () => {
  await mongoose();
});

// Test that source can't be created without name
test('Source cannot be created without name', async (t) => {
    // Connect to database
    mongoose();
    // Attempt to create a source without a name
    const source = await t.throwsAsync(Source.create({}));
    // Check that the expected error message is thrown
    t.is(source.message, 'sources validation failed: name: Source name is required');
    // Delete the created source (if any)
    Source.deleteOne({});
  });

// Test that source can be created with a name
test('Source can be created with a name', async (t) => {
    // Connect to database
    mongoose();
  
    // Create a source with a name
    const source = await new Source({name: 'SourceName'});
  
    // Check that the source name is correctly set
    t.is(source.name, 'SourceName');
  
    // Delete the created source (if any)
    Source.deleteOne({});
  });

// Ensure that any created sources are deleted after each test
test.after.always(async () => {
  await Source.deleteMany({});
});
