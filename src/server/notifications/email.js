const nodemailer = require('nodemailer');
const htmlToText = require('nodemailer-html-to-text').htmlToText;
const url = require('url');
const path = require('path');
const i18n = require('i18n');
const mustacheExpress = require('mustache-express');
const {promisify} = require('util');

const app = require('../app');
const config = require('../config');

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'email-templates'));

i18n.configure({
  locales: ['en', 'sv'],
  directory: path.join(__dirname, 'email-locales')
});

function getTranslator (locale) {
  return function () {
    return function (text, render) {
      return render(i18n.__({ phrase: text, locale: locale }));
    };
  };
}

const baseAttachments = [
  {
    filename: 'logo.png',
    contentDisposition: 'inline',
    path: path.join(__dirname, 'email-templates/images/sensefarm-logo-200.png'),
    cid: 'logo@sensefarm.com'
  }
];

const baseLocals = {
  appName: config.appName,
  companyName: config.companyName,
  frontendUrl: config.frontendUrl
};

const asyncRender = promisify(app.render.bind(app));
const transporter = nodemailer.createTransport(config.mailerTransport);

// Automatic HTMl to text conversion.
transporter.use('compile', htmlToText({ ignoreImage: true }));

function send (receiver, title, html) {

  return transporter.sendMail({
    from: config.mailerFrom,
    to: receiver.email,
    subject: title,
    html: html,
    attachments: baseAttachments
  });

}

module.exports.sendNotificationEmail = async (user, title, msg) => {

  let html = await asyncRender('notification',
    Object.assign({}, baseLocals, {
      title: title,
      msg: msg,
      user: user,
      T: getTranslator(user.language),
      partials: {
        style: 'style'
      }
    })
  );

  return send(user,
    baseLocals.appName + ' - ' + title,
    html
  );

};

module.exports.sendActivationEmail = async (user) => {

  let token = user.generateActivationToken();

  let html = await asyncRender('activation',
    Object.assign({}, baseLocals, {
      linkUrl: url.resolve(baseLocals.frontendUrl, 'activate?token=' + encodeURIComponent(token)),
      T: getTranslator(user.language),
      partials: {
        style: 'style'
      }
    })
  );

  return send(user,
    baseLocals.appName + ' - ' + i18n.__({ phrase: 'ACTIVATION', locale: user.language }),
    html
  );

};

module.exports.sendNewPasswordEmail = async (user) => {

  let token = user.generatePasswordToken();

  let html = await asyncRender('newpass',
    Object.assign({}, baseLocals, {
      linkUrl: url.resolve(baseLocals.frontendUrl, 'newpassword?token=' + encodeURIComponent(token)),
      T: getTranslator(user.language),
      partials: {
        style: 'style'
      }
    })
  );

  return send(user,
    baseLocals.appName + ' - ' + i18n.__({ phrase: 'NEW_PASSWORD', locale: user.language }),
    html
  );

};
