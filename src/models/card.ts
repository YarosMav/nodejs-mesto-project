// src/models/card.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import urlRegex from '../utils/regex';

interface ICard extends Document {
  name: string;
  link: string;
  owner: Types.ObjectId;
  likes: Types.ObjectId[];
  createdAt: Date;
}

const cardSchema = new Schema<ICard>({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => urlRegex.test(v),
      message: 'Некорректная ссылка на карточку',
    },
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
    default: [],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

export default mongoose.model<ICard>('card', cardSchema);
