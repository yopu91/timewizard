const router = require('express-promise-router')();

router.post('/', async (req, res) => {

  if (!req.body.email) {
    throw new HttpError(400, 'NO_EMAIL', 'Email is required');
  }

  if (!req.body.password) {
    throw new HttpError(400, 'NO_PASSWORD', 'Password is required');
  }

  let user = await req.app.locals.models.User.create(req.body);

  res.status(201).json(user.toJSON());

  // Send activation email
  req.app.locals.email.sendActivationEmail(user);

});

module.exports = router;
