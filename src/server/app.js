const express = require('express');
const logger = require('morgan');
const path = require('path');

global.HttpError = require('./models/HttpError');

// Configure app.
const app = express();
module.exports = app;

app.use(logger('dev'));

app.locals.config = require('./config');
app.locals.models = require('./models');
app.locals.email = require('./notifications/email');

// Start data listnener.
const dataListener = require('./data-listener');
dataListener.start();

// API Routes.
require('./routes/api/v1')(app);

// Static Resources.
app.use('/', express.static(path.join(__dirname, '../../dist/client/')));

// React App
app.all('*', function (req, res) {
  
  // If looking for a file return 404.
  if (req.path.includes('.')) {
    res.sendStatus(404);
    return;
  }

  res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(new app.HttpError(404, 'NOT_FOUND'));
});

process.on('unhandledRejection', (reason) => {
  console.error('Error:', reason.stack);
});
