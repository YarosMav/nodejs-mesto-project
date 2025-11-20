// src/controllers/cards.ts
import { Request, Response } from 'express';
import Card from '../models/card';

const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

// GET /cards — вернуть все карточки
export const getCards = (req: Request, res: Response) => Card.find({})
  .then((cards) => res.send({ data: cards }))
  .catch((err) => {
    if (err.name === 'ValidationError') {
      return res
        .status(BAD_REQUEST)
        .send({ message: 'Переданы некорректные данные при создании карточки' });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'На сервере произошла ошибка' });
  });

// POST /cards — создать карточку
export const createCard = (req: Request, res: Response) => {
  const { name, link } = req.body;

  return Card.create({
    name,
    link,
    owner: req.user._id, // вот здесь используем временного пользователя
  })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res
          .status(BAD_REQUEST)
          .send({ message: 'Переданы некорректные данные при создании карточки' });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: 'На сервере произошла ошибка' });
    });
};

// DELETE /cards/:cardId — удалить карточку по id
export const deleteCard = (req: Request, res: Response) => {
  const { cardId } = req.params;

  return Card.findByIdAndDelete(cardId)
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
      }
      return res.send({ message: 'Карточка удалена успешно' });
    })
    .catch(() => res.status(INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' }));
};

export const likeCard = (req: Request, res: Response) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
  { new: true },
)
  .then((card) => {
    if (!card) {
      return res.status(NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
    }
    return res.send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'ValidationError') {
      return res
        .status(BAD_REQUEST)
        .send({ message: ' Переданы некорректные данные для постановки/снятии лайка' });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'На сервере произошла ошибка' });
  });

export const dislikeCard = (req: Request, res: Response) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } }, // убрать _id из массива
  { new: true },
)
  .then((card) => {
    if (!card) {
      return res.status(NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
    }
    return res.send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'ValidationError') {
      return res
        .status(BAD_REQUEST)
        .send({ message: ' Переданы некорректные данные для постановки/снятии лайка' });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'На сервере произошла ошибка' });
  });
