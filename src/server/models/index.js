const mongoose = require('mongoose');
const config = require('../config');

const ObjectIdRegex = /^[0-9a-fA-F]{24}$/;

// Use native Promise in mongoose
mongoose.Promise = global.Promise;

// Connect to database.
var db = mongoose.createConnection(config.db);

// module.exports.Jobs = new require('agenda')({
//   db: { address: config.db },
//   processEvery: '1 minute'
// }, () => {

// });

// module.exports.Jobs.on('ready', () => {
//   module.exports.Jobs.start();

//   // get status report once per hour
//   module.exports.Jobs.define('CleanUnactivatedAccounts', async (job, done) => {

//     console.log('CleanUnactivatedAccounts');

//     let aWeekAgo = require('moment')().subtract(7, 'd').toDate();

//     let users = await module.exports.User.find({ activated: false, created: { $lt: aWeekAgo } });

//     for (let user of users) {
//       await user.remove();
//     }

//   });
//   module.exports.Jobs.every('1 day', 'CleanUnactivatedAccounts');

// });

module.exports.User = require('./User')(db);
module.exports.Notice = require('./Notice')(db);

module.exports.ObjectId = mongoose.mongo.ObjectId;
module.exports.validObjectId = (str) => {
  return ObjectIdRegex.test(str);
};
