const router = require('express-promise-router')();
const Ajv = require('ajv');

let ajv = new Ajv();

router.post('/', async (req, res) => {

  // Same error for wrong email and/or password.
  let incorrect = new HttpError(401, 'UNAUTHORIZED', 'Incorrect credentials');

  if (!ajv.validate({ type: 'string', format: 'email', maxLength: 254 }, req.body.email)) {
    throw incorrect;
  }

  if (!ajv.validate({ type: 'string', minLength: req.app.locals.config.minPasswordLength, maxLength: req.app.locals.config.maxPasswordLength }, req.body.password)) {
    throw incorrect;
  }

  let email = req.body.email.toLowerCase();
  let user = await req.app.locals.models.User.findOne({ email: email });

  if (!user) {
    throw incorrect;
  }

  let verified = await user.verifyPassword(req.body.password);

  if (!verified) {
    throw incorrect;
  }

  // User is authenticated
  res.json({ token: user.generateAuthToken() });

  // Update last login.
  user.lastLogin = new Date();
  user.save();

});

module.exports = router;
