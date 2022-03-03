module.exports = (err, req, res, next) => {
  let { statusCode = 500, message } = err;
  if (err.message === 'Validation failed') {
    statusCode = 400;
    message = 'Incorrect data';
  }
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'Server Error'
        : message,
    });
  next();
};
