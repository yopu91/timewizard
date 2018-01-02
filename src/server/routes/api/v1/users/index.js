const router = require('express-promise-router')();
const authenticate = require('../authenticate');
const authorize = require('../authorize');
const pager = require('../pager');
const ajv = new require('ajv')({ removeAdditional: 'all' });

/* GET all users. */
router.get('/', authenticate, authorize, async (req, res) => {

  if (!req.user.role.match(/master|admin/)) {
    throw new HttpError(403, 'NOT_ALLOWED', `User with role "${req.user.role}" cannot perform this action`);
  }

  let filter;
  if (req.query.filter) {
    var regex = new RegExp(req.query.filter, 'i');
    filter = {
      $or: [
        { firstname: regex },
        { lastname: regex },
        { email: regex }
      ]
    };
  }

  let sort = { created: 'ascending' };

  await pager(res, req.app.locals.models.User, req.query, filter, sort);

});

/* GET own user data. */
router.get('/me', authenticate, authorize, async (req, res) => {
   
  let user = await req.app.locals.models.User.findById(req.user.id);

  if (!user) {
    throw new HttpError(404, 'NOT_FOUND', 'User not found');
  }

  res.json(user.toJSON());

});

/* GET single user. */
router.get('/:id', authenticate, authorize, async (req, res) => {

  if (!req.app.locals.models.validObjectId(req.params.id)) {
    throw new HttpError(400, 'INVALID_PARAMS', 'Must supply a valid user id');
  }

  // Only admin, master or user himself can get user info.
  if (req.params.id !== req.user.id && !req.user.role.match(/master|admin/)) {
    throw new HttpError(403, 'NOT_ALLOWED', 'User cannot perform this action');
  }

  let user = await req.app.locals.models.User.findById(req.params.id);

  if (!user) {
    throw new HttpError(404, 'NOT_FOUND', 'User not found');
  }

  res.json(user.toJSON());

});

/* Impersonate */
router.post('/:id/impersonate', authenticate, authorize, async (req, res) => {

  if (!req.app.locals.models.validObjectId(req.params.id)) {
    throw new HttpError(400, 'INVALID_PARAMS', 'Must supply a valid user id');
  }

  // Only admin or master can impersonate.
  if (!req.user.role.match(/master|admin/)) {
    throw new HttpError(403, 'NOT_ALLOWED', 'User cannot perform this action');
  }

  let user = await req.app.locals.models.User.findById(req.params.id);

  if (!user) {
    throw new HttpError(404, 'NOT_FOUND', 'User not found');
  }

  if (user.role === 'master') {
    throw new HttpError(403, 'NOT_ALLOWED', 'Cannot impersonate master');
  }

  res.json({ token: user.generateAuthToken(req.user.id) });

});

/* Stop Impersonation */
router.post('/stop_impersonating', authenticate, authorize, async (req, res) => {

  if (!req.token.impersonator) {
    throw new HttpError(400, 'NOT_IMPERONATING', 'User is not being impersonated');
  }

  let user = await req.app.locals.models.User.findById(req.token.impersonator);

  if (!user) {
    throw new HttpError(404, 'NOT_FOUND', 'Impersonater not found');
  }

  res.json({ token: user.generateAuthToken() });

});

/* Update user. */
router.put('/:id', authenticate, authorize, async (req, res) => {

  if (req.user.role === 'demo') {
    throw new HttpError(403, 'DEMO_NO_CHANGE');
  }

  if (!req.app.locals.models.validObjectId(req.params.id)) {
    throw new HttpError(400, 'INVALID_PARAMS', 'Must supply a valid user id');
  }

  // Only admin, master or user himself can update user info.
  if (req.params.id !== req.user.id && !req.user.role.match(/master|admin/)) {
    throw new HttpError(403, 'NOT_ALLOWED', 'User cannot perform this action');
  }

  let user = await req.app.locals.models.User.findById(req.params.id);

  if (!user) {
    throw new HttpError(404, 'NOT_FOUND', 'User not found');
  }

  // Update email
  if (req.body.email) {
    await user.setEmail(req.body.email);
  }

  // Update mobile
  if (req.body.phone) {
    await user.setPhoneNumber(req.body.phone);
  }
  
  // Update password
  if (typeof req.body.password === 'string') {

    // Changing own password requires current password.
    if (user.id === req.user.id) {

      if (typeof req.body.currentPassword !== 'string') {
        throw new HttpError(400, 'MISSING_FIELD', 'Current password is required to change password');
      }

      let verified = await user.verifyPassword(req.body.currentPassword);

      if (!verified) {
        throw new HttpError(403, 'WRONG_PASSWORD', 'Current password is incorrect');
      }

    }

    await user.setPassword(req.body.password);
  }

  // Update notifications
  await user.setNotifications(req.body.notifications);

  // Update optional fields
  if ('firstname' in req.body) user.firstname = req.body.firstname;
  if ('lastname' in req.body) user.lastname = req.body.lastname;
  if ('address' in req.body) user.address = req.body.address;
  if ('address2' in req.body) user.address2 = req.body.address2;
  if ('postalcode' in req.body) user.postalcode = req.body.postalcode;
  if ('city' in req.body) user.city = req.body.city;
  if ('country' in req.body) user.country = req.body.country;
  if ('language' in req.body) user.language = req.body.language;

  // Change role
  if (req.body.role && req.body.role !== user.role) {

    if (req.user.role.match(/master/) && req.user.id !== user.id) {
      if (['admin', 'user', 'factory', 'demo'].includes(req.body.role)) {
        user.role = req.body.role;
      }
    }
    else {
      throw new HttpError(403, 'NOT_ALLOWED', 'User can not change role');
    }

  }

  await user.save();
  res.json(user.toJSON());

});

const validateFcmToken = ajv.compile({
  id: 'fcmTokenSchema',
  type: 'object',
  properties: {
    token: {
      type: 'string',
      minLength: 16,
      maxLength: 4096
    },
    os: {
      type: 'string',
      enum: ['android', 'ios']
    },
    version: {
      type: 'string',
      pattern: '^[\\d.]{1,20}$'
    }
  },
  required: ['token', 'os', 'version']
});

/* Add a registrationId. */
router.post('/:id/fcm', authenticate, authorize, async (req, res) => {

  if (req.user.role === 'demo') {
    throw new HttpError(403, 'DEMO_NO_CHANGE');
  }

  if (!req.app.locals.models.validObjectId(req.params.id)) {
    throw new HttpError(400, 'INVALID_PARAMS', 'Must supply a valid user id');
  }

  // Only user himself can update token.
  if (req.params.id !== req.user.id || req.token.impersonator) {
    throw new HttpError(403, 'NOT_ALLOWED', 'User cannot perform this action');
  }

  let user = await req.app.locals.models.User.findById(req.params.id);

  if (!user) {
    throw new HttpError(404, 'NOT_FOUND', 'User not found');
  }

  let data = Object.assign({}, req.body);
  
  if (!validateFcmToken(data)) {
    throw new HttpError(400, 'INVALID_PARAMS', validateFcmToken.errors[0].message);
  }

  let existing = user.fcmRegistrationIds.find(id => id.token === data.token);
  
  // If token exists, replace meta
  if (existing) {
    existing.os = data.os;
    existing.version = data.version;
  }

  // Limit to 5 active registrations
  else if (user.fcmRegistrationIds.length >= 5) {
    user.fcmRegistrationIds.shift();
    user.fcmRegistrationIds.push(data);
  }

  // Add registration Id.
  else {
    user.fcmRegistrationIds.push(data);
  }

  await user.save();
  res.sendStatus(204);

});

/* DELETE user. */
router.delete('/:id', authenticate, authorize, async (req, res) => {

  if (req.user.role === 'demo') {
    throw new HttpError(403, 'DEMO_NO_CHANGE');
  }

  if (!req.app.locals.models.validObjectId(req.params.id)) {
    throw new HttpError(400, 'INVALID_PARAMS', 'Must supply a valid user id');
  }

  let user = await req.app.locals.models.User.findById(req.params.id);

  if (!user) {
    throw new HttpError(404, 'NOT_FOUND', 'User not found');
  }

  if (user.role.match(/master/)) {
    throw new HttpError(400, 'MASTER_NO_REMOVE', "Master can't be removed");
  }

  if (req.params.id !== req.user.id && !req.user.role.match(/master/) &&
    !(req.user.role.match(/admin/) && user.role === 'user')) {
    throw new HttpError(403, 'NOT_ALLOWED', 'User cannot perform this action');
  }

  await user.remove();
  res.sendStatus(204);

});

module.exports = router;
