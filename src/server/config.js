module.exports = {

  appName: 'Timewizard',
  
  companyName: 'Timewizard CO',

  frontendUrl: process.env.FRONTEND || 'http://localhost:3000/',

  db: 'mongodb://mongo:27017/timewizard',

  fortysixelks: {
    url: 'https://api.46elks.com/a1/SMS',
    username: '',
    password: '',
    number: ''
  },

  tokenSecret: 'E|6HPf&BtIl5Y9f',
  authTokenDuration: '7d',
  activationTokenDuration: '1d',
  passwordTokenDuration: '1d',

  minPasswordLength: 8,
  maxPasswordLength: 160,
  saltRounds: 10,

  mailerFrom: 'Timewizard <noreply@domain.com>',
  mailerTransport: {
    service: 'gmail',
    auth: {
      user: 'noreply@domain.com',
      pass: ''
    }
  },

  fcm: {
    key: ''
  },

  limitResults: 200
};
