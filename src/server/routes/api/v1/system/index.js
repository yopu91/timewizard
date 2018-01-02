const router = require('express-promise-router')();
const authenticate = require('../authenticate');
const authorize = require('../authorize');
const os = require('os');

async function getSystemInfo () {

  return {
    os: os.type() + ' ' + os.release(),
    freemem: os.freemem(),
    totalmem: os.totalmem(),
    cores: os.cpus().length,
    loadavg: os.loadavg(),
    uptime: Math.round(os.uptime())
  };

}

router.get('/', authenticate, authorize, async (req, res) => {

  if (!req.user.role.match(/master|admin/)) {
    throw new HttpError(403, 'NOT_ALLOWED', "User with role '" + req.user.role + "' cannot perform this action");
  }

  let info = await getSystemInfo();
  res.json(info);

});

module.exports = router;
