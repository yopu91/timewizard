const router = require('express-promise-router')();
const authenticate = require('../authenticate');
const jwt = require('jsonwebtoken');

router.get('/resend', authenticate, async (req, res) => {

  let user = await req.app.locals.models.User.findById(req.token.id);

  if (!user) {
    throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
  }

  if (!user.activated) {
    await req.app.locals.email.sendActivationEmail(user);
  }

  res.sendStatus(204);

});

router.post('/', async (req, res) => {

  let token = req.body.token;

  let decoded = jwt.verify(token, req.app.locals.config.tokenSecret);

  if (decoded.type !== 'activation') {
    throw new HttpError(401, 'INVALID_TOKEN', 'Invalid token type');
  }

  let user = await req.app.locals.models.User.findById(decoded.id);

  if (!user) {
    throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
  }

  // Check if already activated
  if (user.activated) {
    res.sendStatus(204);
    return;
  }

  if (decoded.email !== user.email) {
    throw new HttpError(401, 'EMAIL_NO_MATCH', 'Email address mismatch');
  }

  // Check if mobile number is taken.
  let existing = await req.app.locals.models.User.findOne({ activated: true, phone: user.phone });
  if (existing) {
    throw new HttpError(409, 'MOBILE_TAKEN', 'A user with this phone number already exists');
  }

  user.activated = true;
  await user.save();

  res.sendStatus(204);

});

module.exports = router;
