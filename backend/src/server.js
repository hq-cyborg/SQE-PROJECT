require('module-alias/register');
const mongoose = require('mongoose');
const { globSync } = require('glob');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// Node version check
const [major] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your Node.js version to 20 or greater. 👌\n');
  process.exit();
}

// Connect to MongoDB
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('error', (error) => {
  console.error('🔥 MongoDB connection error:', error.message);
});

// Load models
const modelsFiles = globSync('./src/models/**/*.js');
for (const filePath of modelsFiles) {
  require(path.resolve(filePath));
}

// Start app
const app = require('./app');

// ✅ Listen on dynamic Railway port
const port = process.env.PORT || 8888;
app.set('port', port);
const server = app.listen(port, () => {
  console.log(`Express running → On PORT : ${server.address().port}`);
});
