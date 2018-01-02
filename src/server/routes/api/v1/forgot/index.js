const router = require('express-promise-router')();
const Ajv = require('ajv');
const jwt = require('jsonwebtoken');

let ajv = new Ajv();

// Request new password email
router.put('/', async (req, res) => {

  if (!ajv.validate({ type: 'string', format: 'email', maxLength: 254 }, req.body.email)) {
    throw new HttpError(400, 'INVALID_EMAIL', 'Missing or invalid email address');
  }

  let email = req.body.email.toLowerCase();

  let user = await req.app.locals.models.User.findOne({ email: email });

  if (!user) {
    throw new HttpError(404, 'EMAIL_NOT_FOUND', 'There is no user with this email address');
  }

  if (user.role === 'demo') {
    throw new HttpError(403, 'DEMO_NO_CHANGE');
  }

  await req.app.locals.mailer.sendNewPasswordEmail(user);
  res.sendStatus(200);

});

// Set new password
router.post('/', async (req, res) => {

  var token = req.body.token;
  var password = req.body.password;

  if (!token) {
    throw new HttpError(400, 'NO_TOKEN', 'Missing token');
  }

  let decoded = jwt.verify(token, req.app.locals.config.tokenSecret);

  if (decoded.type !== 'password') {
    throw new HttpError(401, 'INVALID_TOKEN', 'Invalid token type');
  }

  if (!password) {
    throw new HttpError(400, 'NO_PASSWORD', 'Password is required');
  }

  let user = await req.app.locals.models.User.findById(decoded.id);

  if (!user) {
    throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
  }

  if (user.role === 'demo') {
    throw new HttpError(403, 'DEMO_NO_CHANGE');
  }

  if (decoded.email !== user.email) {
    throw new HttpError(401, 'EMAIL_NO_MATCH', 'Email address mismatch');
  }

  await user.setPassword(password);
  await user.save();
  res.sendStatus(204);

});

module.exports = router;
