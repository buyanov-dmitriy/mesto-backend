require('dotenv').config();

const { JWT_SECRET, NODE_ENV } = process.env;
const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauth-err'); // 401

module.exports = (req, res, next) => {
  const jwtFromCookies = req.cookies.jwt;

  if (!jwtFromCookies) {
    return next(new UnauthorizedError('Authorization required'));
  }
  let payload;
  try {
    payload = jwt.verify(jwtFromCookies, NODE_ENV === 'production' ? JWT_SECRET : 'SecretNotProduction');
  } catch (err) {
    return next(new UnauthorizedError('Authorization required'));
  }
  req.user = payload;
  return next();
};
