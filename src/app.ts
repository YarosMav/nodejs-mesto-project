import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { celebrate, Joi, errors } from 'celebrate';
import urlRegex from './utils/regex';
import userRouter from './routes/users';
import cardRouter from './routes/cards';
import { createUser, login } from './controllers/users';
import auth from './middlewares/auth';
import { requestLogger, errorLogger } from './middlewares/logger';

const { PORT = 3000 } = process.env;
const app = express();

app.use(express.json());
app.use(cookieParser());

// подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/mestodb');

// логгер запросов — ДО роутов
app.use(requestLogger);

// публичные роуты (без авторизации)
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().pattern(urlRegex),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

// мидлвар авторизации
app.use(auth);

// защищённые роуты
app.use('/users', userRouter);
app.use('/cards', cardRouter);

// логгер ошибок — ПОСЛЕ роутов
app.use(errorLogger);

// обработчик ошибок celebrate (валидация)
app.use(errors());

// eslint-disable-next-line no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
