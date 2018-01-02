const FCM = require('fcm-node');
const config = require('../config');

let fcm = new FCM(config.fcm.key);

async function sendToFCM (message) {

  return new Promise((resolve, reject) => {
    fcm.send(message, (err) => {
      try {
        if (err) {
          let parsed = JSON.parse(err);
          // Drop any registration ids that gives errors.
          for (let i = parsed.results.length - 1; i >= 0; i--) {
            if (parsed.results[i].error && parsed.results[i].error.match('MissingRegistration|InvalidRegistration|NotRegistered|InvalidPackageName')) {
              message.registration_ids.splice(i, 1);
            }
          }
          return resolve(message.registration_ids);
        }
        else {
          resolve(message.registration_ids);
        }
      }
      catch (ex) {
        return reject(ex);
      }

    });
  });

}

module.exports.send = async (user, title, body, data) => {

  let iosIDs = user.fcmRegistrationIds.filter(id => id.os === 'ios');
  let androidIDs = user.fcmRegistrationIds.filter(id => id.os === 'android');
  let successfulIDs = [];

  // Send to iOS
  if (iosIDs.length > 0) {
    let message = {
      registration_ids: iosIDs.map(rid => rid.token),
      notification: { title, body },
      priority: 'high',
      data
    };
    successfulIDs = successfulIDs.concat(await sendToFCM(message));
  }

  // Send to Android
  if (androidIDs.length > 0) {
    data.title = title;
    data.body = body;
    let message = {
      registration_ids: androidIDs.map(rid => rid.token),
      priority: 'high',
      data
    };
    successfulIDs = successfulIDs.concat(await sendToFCM(message));
  }

  // Remove invalid registration IDs.
  user.fcmRegistrationIds = user.fcmRegistrationIds.filter(id => successfulIDs.includes(id.token));
  await user.save();

};
