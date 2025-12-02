const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

// Routers & controllers
const coreAuthRouter = require('./routes/coreRoutes/coreAuth');
const coreApiRouter = require('./routes/coreRoutes/coreApi');
const coreDownloadRouter = require('./routes/coreRoutes/coreDownloadRouter');
const corePublicRouter = require('./routes/coreRoutes/corePublicRouter');
const adminAuth = require('./controllers/coreControllers/adminAuth');
const erpApiRouter = require('./routes/appRoutes/appApi');

// Error handlers
const errorHandlers = require('./handlers/errorHandlers');

// Create Express app
const app = express();

// ✅ Enable CORS
app.use(cors({
  origin: '*', // For production, replace '*' with your frontend URL
  credentials: true
}));

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(fileUpload()); // enable file uploads

// API routes
app.use('/api', coreAuthRouter);
app.use('/api', adminAuth.isValidAuthToken, coreApiRouter);
app.use('/api', adminAuth.isValidAuthToken, erpApiRouter);
app.use('/download', coreDownloadRouter);
app.use('/public', corePublicRouter);

// 404 handler
app.use(errorHandlers.notFound);

// Production error handler
app.use(errorHandlers.productionErrors);

module.exports = app;
