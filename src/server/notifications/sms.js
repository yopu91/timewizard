const https = require('https');
const querystring = require('querystring');
const url = require('url');
const config = require('../config');

const apiUrl = url.parse(config.fortysixelks.url);
const credentials = Buffer.from(config.fortysixelks.username + ':' + config.fortysixelks.password).toString('base64');

module.exports.send = async (from, to, message) => {

  await new Promise(function (resolve, reject) {

    let postData = querystring.stringify({
      'from': from,
      'to': to,
      'message': message
    });

    let req = https.request({
      method: 'POST',
      hostname: apiUrl.hostname,
      port: apiUrl.port,
      path: apiUrl.path,
      headers: {
        'Authorization': 'Basic ' + credentials,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    }, (response) => {
      resolve(response);
    });

    req.on('error', function (err) {
      reject(err);
    });

    req.write(postData);
    req.end();

  });

};
