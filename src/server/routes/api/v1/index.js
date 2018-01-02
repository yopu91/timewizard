const bodyParser = require('body-parser');

module.exports = function (app) {

  // Parse body as JSON.
  app.use('/api/v1', bodyParser.json());

  app.use('/api/v1/system', require('./system'));
  app.use('/api/v1/register', require('./register'));
  app.use('/api/v1/activate', require('./activate'));
  app.use('/api/v1/forgot', require('./forgot'));
  app.use('/api/v1/login', require('./login'));
  app.use('/api/v1/users', require('./users'));
  app.use('/api/v1/notices', require('./notices'));

  // 404
  app.use('/api/v1', function (req, res, next) {
    next(new HttpError(404, 'NOT_FOUND', 'Invalid API endpoint'));
  });

  // Error handler
  app.use('/api/v1', function (err, req, res, _next) {

    if (err.name === 'UnauthorizedError' || err.name === 'TokenExpiredError') {
      res.status(401);
      res.json({
        code: 401,
        message: 'UNAUTHORIZED',
        details: err.message
      });
    }
    else if (err.name === 'SyntaxError') {
      res.status(400);
      res.json({
        code: 400,
        message: 'SYNTAX_ERROR',
        details: err.message
      });
    }
    else if (err.name === 'ValidationError') {
      var message = '';
      for (var k in err.errors) {
        message = err.errors[k].message;
        break;
      }
      res.status(400);
      res.json({
        code: 400,
        message: 'VALIDATION_ERROR',
        details: message
      });
    }
    else if (err.name === 'HttpError') {
      res.status(err.code);
      res.json({
        code: err.code,
        message: err.message,
        details: err.details
      });
    }
    else {
      console.error(err);
      res.status(500);
      res.json({
        code: 500,
        message: 'SERVER_ERROR',
        details: 'Internal server error'
      });
    }

  });

};
