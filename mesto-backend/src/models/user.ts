// models/user.ts

import mongoose from 'mongoose';

interface IUser {
  name: string,
  about: string,
  avatar: string
}
// Опишем схему:
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  about: {
    required: true,
    minlength: 2,
    maxlength: 200,
    type: String,
  },
  avatar: {
    type: String,
    required: true,
  },

});

// создаём модель и экспортируем её
export default mongoose.model<IUser>('user', userSchema);
