const Schema = require('mongoose').Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const crypto = require('crypto');
const ajv = new require('ajv')({ removeAdditional: 'all' });

module.exports = function (db) {

  const User = new Schema({
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true,
      unique: true
    },
    firstname: String,
    lastname: String,
    address: String,
    address2: String,
    postalcode: String,
    city: String,
    country: String,
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['master', 'admin', 'user', 'demo'],
      default: 'user',
      required: true
    },
    notifications: {
      email: { type: Boolean, default: true, required: true },
      push: { type: Boolean, default: true, required: true },
      sms: { type: Boolean, default: false, required: true }
    },
    language: {
      type: String,
      enum: ['en', 'sv'],
      default: 'en',
      required: true
    },
    activated: {
      type: Boolean,
      default: false,
      required: true
    },
    lastLogin: Date,
    created: {
      type: Date,
      default: Date.now,
      required: true
    },
    fcmRegistrationIds: [{
      token: String,
      os: String,
      version: String
    }]
  });

  User.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.password;
      delete ret.activated;
      delete ret.fcmRegistrationIds;
    }
  });

  const validateUserInfo = ajv.compile({
    id: 'userInfoSchema',
    type: 'object',
    properties: {
      firstname: {
        type: 'string',
        pattern: '^[^{}()[\\]<>\\\\/]*$',
        minLength: 1,
        maxLength: 64
      },
      lastname: {
        type: 'string',
        pattern: '^[^{}()[\\]<>\\\\/]*$',
        minLength: 1,
        maxLength: 64
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 254
      },
      phone: {
        type: 'string',
        pattern: '^\\+[1-9]{1}[0-9]{3,14}$'
      },
      language: {
        enum: ['en', 'sv']
      },
      address: {
        type: 'string',
        maxLength: 128
      },
      address2: {
        type: 'string',
        maxLength: 128
      },
      postalcode: {
        type: 'string',
        pattern: '^[A-Z0-9\\s-]{2,10}$',
      },
      city: {
        type: 'string',
        maxLength: 128
      },
      country: {
        type: 'string',
        pattern: '^[A-Z]{2}$'
      }
    },
    required: ['firstname', 'lastname', 'email']
  });

  User.virtual('avatar').get(function () {
    return '//www.gravatar.com/avatar/' + crypto.createHash('md5').update(this.email).digest("hex") + '.jpg?s=256&d=identicon';
  });

  User.pre('remove', async function (next) {

    // Do cleanup.
    
    next();
  
  });


  User.statics.create = async function (data) {

    // Copy properties
    let userInfo = Object.assign({}, data);

    // Validate
    if (!validateUserInfo(userInfo)) {
      throw new HttpError(400, 'INVALID_DATA', validateUserInfo.errors[0].message);
    }

    // Set fields
    let user = new this(userInfo);

    user.email = undefined;
    user.phone = undefined;

    // Set email
    await user.setEmail(data.email);

    // Set phone
    await user.setPhoneNumber(data.phone);

    // Set password
    await user.setPassword(data.password);

    // If this is the first registered account make it master.
    let count = await this.model('User').count();
    if (count === 0) {
      user.role = 'master';
    }

    // Save user
    return await user.save();
  };

  User.methods.setEmail = async function (email) {

    // Check email.
    if (!ajv.validate({ $ref: 'userInfoSchema#/properties/email' }, email)) {
      throw new HttpError(400, 'INVALID_DATA', 'Invalid email address');
    }

    email = email.toLowerCase();

    if (email === this.email) {
      return;
    }

    let existing = await this.model('User').findOne({ email: email });

    // Email already exists
    if (existing) {
      throw new HttpError(409, 'EMAIL_TAKEN', 'A user with this email already exists');
    }

    this.email = email;
  };

  User.methods.setPhoneNumber = async function (phone) {
    
    // Validate format
    if (!ajv.validate({ $ref: 'userInfoSchema#/properties/phone' }, phone)) {
      throw new HttpError(400, 'INVALID_DATA', 'Invalid phone number');
    }

    // Check if unchanged
    if (phone === this.phone) {
      return;
    }

    // Check if phone number is taken.
    let existing = await this.model('User').findOne({ activated: true, phone: phone });
    if (existing) {
      throw new HttpError(409, 'PHONE_TAKEN', 'A user with this phone number already exists');
    }

    this.phone = phone;

  };

  User.methods.setNotifications = async function (notifications) {
    if (typeof notifications === 'object') {
      this.notifications.email = Boolean(notifications.email);
      this.notifications.push = Boolean(notifications.push);
      this.notifications.sms = Boolean(notifications.sms);
    }
  };

  User.methods.setPassword = async function (password) {

    // Check password length
    if (!ajv.validate({ type: 'string', minLength: config.minPasswordLength, maxLength: config.maxPasswordLength }, password)) {
      throw new HttpError(400, 'PASSWORD_FORMAT',
        'Password has to be between ' + config.minPasswordLength +
        ' and ' + config.maxPasswordLength + ' characters in length'
      );
    }

    this.password = await bcrypt.hash(password, config.saltRounds);

  };

  User.methods.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  User.methods.generateAuthToken = function (impersonator) {

    var payload = {
      id: this._id,
      type: 'authorization',
      impersonator: impersonator
    };

    // Generate JWT Token.
    return jwt.sign(payload, config.tokenSecret, { expiresIn: config.authTokenDuration });

  };

  User.methods.generateActivationToken = function () {

    var payload = {
      id: this._id,
      email: this.email,
      type: 'activation'
    };

    // Generate JWT Token.
    return jwt.sign(payload, config.tokenSecret, { expiresIn: config.activationTokenDuration });

  };

  User.methods.generatePasswordToken = function () {

    var payload = {
      id: this._id,
      email: this.email,
      type: 'password'
    };

    // Generate JWT Token.
    return jwt.sign(payload, config.tokenSecret, { expiresIn: config.passwordTokenDuration });

  };

  return db.model('User', User);

};
