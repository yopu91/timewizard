var Schema = require('mongoose').Schema;

module.exports = function (db) {

  const Notice = new Schema({
    title: String,
    content: String,
    link: String,
    type: {
      type: String,
      enum: ['default', 'primary', 'success', 'info', 'warning', 'danger'],
      default: 'user',
      required: true
    },
    enabled: {
      type: Boolean,
      default: true,
      required: true
    },
    created: {
      type: Date,
      default: Date.now,
      required: true
    }
  });

  Notice.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret._id;
    }
  });

  return db.model('Notice', Notice);

};
