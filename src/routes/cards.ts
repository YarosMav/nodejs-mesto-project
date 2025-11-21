// src/routes/cards.ts
import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} from '../controllers/cards';
import urlRegex from '../utils/regex';

const router = Router();

// GET /cards — без валидации
router.get('/', getCards);

// POST /cards — создать карточку
router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      link: Joi.string().required().pattern(urlRegex),
    }),
  }),
  createCard,
);

// DELETE /cards/:cardId — удалить карточку
router.delete(
  '/:cardId',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteCard,
);

// PUT /cards/:cardId/likes — лайк
router.put(
  '/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24).required(),
    }),
  }),
  likeCard,
);

// DELETE /cards/:cardId/likes — убрать лайк
router.delete(
  '/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24).required(),
    }),
  }),
  dislikeCard,
);

export default router;
