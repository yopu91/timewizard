const router = require('express-promise-router')();
const authenticate = require('../authenticate');
const authorize = require('../authorize');

/* GET public notices. */
router.get('/public', async (req, res) => {
  let notices = await req.app.models.Notice.find({ enabled: true });
  res.json(notices.map((notice) => notice.toJSON()));
});

/* GET all notices. */
router.get('/', authenticate, authorize, async (req, res) => {

  if (!req.user.role.match(/master|admin/)) {
    throw new HttpError(403, 'NOT_ALLOWED', `User with role "${req.user.role}" cannot perform this action`);
  }

  let notices = await req.app.models.Notice.find();
  res.json(notices.map((notice) => notice.toJSON()));

});

/* GET single notice. */
router.get('/:id', authenticate, authorize, async (req, res) => {

  if (!req.user.role.match(/master|admin/)) {
    throw new HttpError(403, 'NOT_ALLOWED', `User with role "${req.user.role}" cannot perform this action`);
  }

  if (!req.app.locals.models.validObjectId(req.params.id)) {
    throw new HttpError(400, 'INVALID_PARAMS', 'Must supply a valid notice id');
  }

  let notice = await req.app.models.Notice.findById(req.params.id);

  if (!notice) {
    throw new HttpError(404, 'NOT_FOUND', 'Notice not found');
  }

  res.json(notice.toJSON());

});

/* POST new notice. */
router.post('/', authenticate, authorize, async (req, res) => {

  if (!req.user.role.match(/master|admin/)) {
    throw new HttpError(403, 'NOT_ALLOWED', `User with role "${req.user.role}" cannot perform this action`);
  }

  let notice = new req.app.models.Notice({
    title: req.body.title,
    content: req.body.content,
    link: req.body.link,
    type: req.body.type,
    enabled: req.body.enabled
  });

  await notice.save();
  res.status(201).send(notice.toJSON());

});

/* PUT update notice. */
router.put('/:id', authenticate, authorize, async (req, res) => {

  if (!req.user.role.match(/master|admin/)) {
    throw new HttpError(403, 'NOT_ALLOWED', `User with role "${req.user.role}" cannot perform this action`);
  }

  if (!req.app.locals.models.validObjectId(req.params.id)) {
    throw new HttpError(400, 'INVALID_PARAMS', 'Must supply a valid notice id');
  }

  let notice = await req.app.models.Notice.findById(req.params.id);

  if (!notice) {
    throw new HttpError(404, 'NOT_FOUND', 'Notice not found');
  }

  // Update fields
  if (typeof req.body.title === 'string') notice.title = req.body.title;
  if (typeof req.body.content === 'string') notice.content = req.body.content;
  if (typeof req.body.link === 'string') notice.link = req.body.link;
  if (typeof req.body.type === 'string') notice.type = req.body.type;
  if (typeof req.body.enabled === 'boolean') notice.enabled = req.body.enabled;

  await notice.save();
  res.sendStatus(204);

});

/* DELETE notice. */
router.delete('/:id', authenticate, authorize, async (req, res) => {

  if (!req.user.role.match(/master|admin/)) {
    throw new HttpError(403, 'NOT_ALLOWED', `User with role "${req.user.role}" cannot perform this action`);
  }

  if (!req.app.locals.models.validObjectId(req.params.id)) {
    throw new HttpError(400, 'INVALID_PARAMS', 'Must supply a valid notice id');
  }

  let notice = await req.app.models.Notice.findById(req.params.id);

  if (!notice) {
    throw new HttpError(404, 'NOT_FOUND', 'Notice not found');
  }

  await notice.remove();
  res.sendStatus(204);

});

module.exports = router;
