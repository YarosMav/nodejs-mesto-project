import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';

import BadRequestError from '../errors/BadRequestError';
import NotFoundError from '../errors/NotFoundError';
import ConflictError from '../errors/ConflictError';
import UnauthorizedError from '../errors/UnauthorizedError';

// GET /users — получить всех пользователей
export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

// GET /users/:userId — получить пользователя по id
export const getUserById = (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Передан некорректный _id пользователя'));
      }
      return next(err);
    });
};

// POST /signup — регистрация
export const createUser = (req: Request, res: Response, next: NextFunction) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Email и пароль обязательны'));
  }

  return bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({ data: user }))
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      }
      return next(err);
    });
};

// PATCH /users/me — обновить имя и about
export const updateUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, about } = req.body;
  const userId = req.user?._id;

  User.findByIdAndUpdate(
    userId,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден');
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      }
      return next(err);
    });
};

// PATCH /users/me/avatar — обновить аватар
export const updateAvatar = (req: Request, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  const userId = (req as any).user?._id;

  User.findByIdAndUpdate(
    userId,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден');
      }

      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении аватара'));
      }
      return next(err);
    });
};

// GET /users/me — вернуть текущего пользователя
export const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }

      return res.send({ data: user });
    })
    .catch(next);
};

// POST /signin — логин
export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Email и пароль обязательны'));
  }

  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильные почта или пароль');
          }

          const token = jwt.sign(
            { _id: user._id.toString() },
            'super-strong-secret',
            { expiresIn: '7d' },
          );

          return res
            .cookie('jwt', token, {
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
              httpOnly: true,
            })
            .send({ message: 'Успешная авторизация' });
        });
    })
    .catch(next);
};
