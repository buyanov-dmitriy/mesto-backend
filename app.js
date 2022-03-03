require('dotenv').config();

const { PORT = 3000 } = process.env;

const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');
const cors = require('cors');

const auth = require('./middlewares/auth');
const errorHandling = require('./middlewares/error-handling');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const NotFoundError = require('./errors/not-found-err');

const { urlValidate } = require('./validation/validation');

const {
  login,
  createUser,
} = require('./controllers/users');

const app = express();

app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: [
    'http://buyanov-dmitriy.students.nomoredomains.work',
    'https://buyanov-dmitriy.students.nomoredomains.work',
    'http://api.buyanov.students.nomoredomains.work',
    'https://api.buyanov.students.nomoredomains.work',
    'http://localhost:3000',
  ],
  credentials: true,
}));

app.use(requestLogger);

app.post('/signin', login, celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}));
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom(urlValidate),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);

app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.post('/logout', (req, res) => {
  res
    .cookie('jwt', '', {
      httpOnly: true,
      sameSite: 'None',
      maxAge: -1,
      secure: true,
    })
    .end();
});

app.use('/', (req, res, next) => {
  next(new NotFoundError('Not found page'));
});

app.use(errorLogger);

app.use(errors());
app.use(errorHandling);

app.listen(PORT);
