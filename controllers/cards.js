const Card = require('../models/card');
const BadRequestError = require('../errors/bad-req-err'); // 400
const NotFoundError = require('../errors/not-found-err'); // 404
const ForbiddenError = require('../errors/forbidden-err'); // 403

const getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.status(200).send({ cards }))
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const userId = req.user._id;

  Card.create({ name, link, owner: userId })
    .then((card) => res.status(200).send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Incorrect data during creating the card'));
      }
      return next(err);
    });
};

const deleteCard = (req, res, next) => {
  const userId = req.user._id;
  const { cardId } = req.params;

  Card.findById(cardId)
    .orFail(() => { throw new NotFoundError('The card with _id was not found'); })
    .then((card) => {
      const { owner } = card;
      if (String(owner) !== String(userId)) {
        return next(new ForbiddenError('No rights to delete the card'));
      }
      return Card.findByIdAndRemove(cardId)
        .orFail(() => { throw new NotFoundError('The card with _id was not found'); })
        .then((deletedCard) => res.status(200).send({ deletedCard }))
        .catch((err) => {
          if (err.name === 'CastError') {
            return next(new BadRequestError('An invalid card _id'));
          }
          return next(err);
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('An invalid card _id'));
      }
      return next(err);
    });
};

const putLike = (req, res, next) => {
  const userId = req.user._id;

  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: userId } },
    { new: true },
  )
    .orFail(() => { throw new NotFoundError('The card with _id was not found'); })
    .then((card) => res.status(200).send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Incorrect data during like the card'));
      }
      if (err.name === 'CastError') {
        return next(new BadRequestError('An invalid card _id'));
      }
      return next(err);
    });
};

const deleteLike = (req, res, next) => {
  const userId = req.user._id;

  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: userId } },
    { new: true },
  )
    .orFail(() => { throw new NotFoundError('The card with _id was not found'); })
    .then((card) => res.status(200).send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Incorrect data during delete like'));
      }
      if (err.name === 'CastError') {
        return next(new BadRequestError('An invalid card _id'));
      }
      return next(err);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  putLike,
  deleteLike,
};
