import express, { NextFunction, Response, Request } from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/users';
import cardRouter from './routes/cards';

const { PORT = 3000 } = process.env;
const app = express();

app.use(express.json());

// подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/mestodb');

app.use((req: Request, res: Response, next: NextFunction) => {
  req.user = {
    _id: '691f4340348f7d76866ee791',
  };

  next();
});

app.use('/users', userRouter);
app.use('/cards', cardRouter);

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
