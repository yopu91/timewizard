const jwt = require('jsonwebtoken');
const config = require('./config');
const models = require('./models');

module.exports.init = (server) => {

  module.exports.io = require('socket.io')(server);

  module.exports.io.on('connection', function (socket) {

    socket.on('join', async (data) => {

      if (data.token) {
        let token = jwt.verify(data.token, config.tokenSecret);

        if (token.type === 'authorization' && models.validObjectId(token.id) && models.validObjectId(data.id)) {
          // TODO: Something
        }

      }

    });

    // socket.on('leave', (data) => {

    // });

  });

};
