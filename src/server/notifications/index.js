const i18n = require('i18n');
const config = require('../config');
const emailService = require('./email');
//const smsService = require('./sms');
//const pushService = require('./push');

module.exports.send = async (user, title, msg, params) => {

  let i18nTitle = i18n.__({ phrase: title, locale: user.language }, params);
  let i18nMsg = i18n.__({ phrase: msg, locale: user.language }, params);

  if (user.notifications.email) {
    await emailService.sendNotificationEmail(user, i18nTitle, i18nMsg);
  }

  // if (user.notifications.push) {
  //   await pushService.send(user, i18nTitle, i18nMsg, params.data);
  // }

  // if (user.notifications.sms) {
  //   await smsService.send(config.companyName, user.phone, i18nMsg);
  // }

};

// module.exports.sendPush = async (user, title, msg, params) => {

//   let i18nTitle = i18n.__({ phrase: title, locale: user.language }, params);
//   let i18nMsg = i18n.__({ phrase: msg, locale: user.language }, params);

//   await pushService.send(user, i18nTitle, i18nMsg, params.data);

// };

module.exports.sendEmail = async (user, title, msg, params) => {

  let i18nTitle = i18n.__({ phrase: title, locale: user.language }, params);
  let i18nMsg = i18n.__({ phrase: msg, locale: user.language }, params);

  await emailService.sendNotificationEmail(user, i18nTitle, i18nMsg);

};
