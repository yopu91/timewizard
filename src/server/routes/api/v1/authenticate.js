const config = require('../../../config');
module.exports = require('express-jwt')({ secret: config.tokenSecret, requestProperty: 'token' });
