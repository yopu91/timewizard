function HttpError (code, message, details) {

  this.name = 'HttpError';
  this.code = (code || 500);
  this.message = (message || '');
  this.details = (details || '');

}
HttpError.prototype = Error.prototype;

module.exports = HttpError;
