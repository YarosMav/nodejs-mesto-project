// src/controllers/cards.ts
import { Request, Response, NextFunction } from 'express';
import Card from '../models/card';
import BadRequestError from '../errors/BadRequestError';
import NotFoundError from '../errors/NotFoundError';
import ForbiddenError from '../errors/ForbiddenError';
// InternalError в принципе не обязателен, если 500 выставляет централизованный хендлер

// GET /cards — вернуть все карточки
export const getCards = (req: Request, res: Response, next: NextFunction) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next); // если что-то упало — отдаём в централизованный обработчик
};

// POST /cards — создать карточку
export const createCard = (req: Request, res: Response, next: NextFunction) => {
  const { name, link } = req.body;

  Card.create({
    name,
    link,
    owner: req.user._id,
  })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new BadRequestError('Переданы некорректные данные при создании карточки'),
        );
      }
      return next(err); // все остальные ошибки — дальше, в централизованный обработчик
    });
};

// DELETE /cards/:cardId — удалить карточку по id
export const deleteCard = (req: Request, res: Response, next: NextFunction) => {
  const { cardId } = req.params;

  const userId = req.user?._id;

  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена');
      }

      if (card.owner.toString() !== userId) {
        throw new ForbiddenError('Нельзя удалить чужую карточку');
      }

      return Card.findByIdAndDelete(cardId)
        .then(() => res.send({ message: 'Карточка удалена успешно' }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        // некорректный формат id (не ObjectId)
        return next(
          new BadRequestError('Передан некорректный _id карточки'),
        );
      }
      return next(err);
    });
};

// PUT /cards/:cardId/likes — поставить лайк
export const likeCard = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;

  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: userId } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Передан несуществующий _id карточки');
      }
      return res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        // тут именно CastError, а не ValidationError
        return next(
          new BadRequestError('Передан некорректный _id карточки'),
        );
      }
      return next(err);
    });
};

// DELETE /cards/:cardId/likes — убрать лайк
export const dislikeCard = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;

  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: userId } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Передан несуществующий _id карточки');
      }
      return res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(
          new BadRequestError('Передан некорректный _id карточки'),
        );
      }
      return next(err);
    });
};
