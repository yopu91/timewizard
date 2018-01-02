// Setup authorization
module.exports = async (req, res, next) => {

  try {

    if (!req.token) {
      throw new HttpError(500, 'NO_TOKEN');
    }

    if (req.token.type !== 'authorization') {
      throw new HttpError(401, 'INVALID_TOKEN', 'Wrong token type');
    }

    if (!req.token.id) {
      throw new HttpError(401, 'INVALID_TOKEN', 'No id');
    }

    let user = await req.app.locals.models.User.findById(req.token.id);

    if (!user || !user.role) {
      throw new HttpError(401, 'UNAUTHORIZED');
    }

    if (!user.activated) {
      throw new HttpError(412, 'NOT_ACTIVATED', 'Activation required');
    }

    req.user = user;

  }
  catch (err) {
    next(err);
    return;
  }

  next();

};
