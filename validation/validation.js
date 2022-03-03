const validator = require('validator');

const urlValidate = (value, next) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  }
  return next(new Error('Not valid link'));
};

module.exports = {
  urlValidate,
};
