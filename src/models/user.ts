// src/models/user.ts
import mongoose, { Schema, Document } from 'mongoose';
import urlRegex from '../utils/regex';

interface IUser extends Document {
  name: string;
  about: string;
  avatar: string;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (v: string) => urlRegex.test(v),
      message: 'Некорректная ссылка на аватар',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // чтобы хэш пароля не возвращался по умолчанию
  },
}, { versionKey: false });

export default mongoose.model<IUser>('user', userSchema);
