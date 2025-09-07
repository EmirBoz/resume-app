import mongoose, { Schema, Document, Types } from 'mongoose';
import { User } from '../types';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  toObject(): any;
}

const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
});

export const UserModel = mongoose.model<UserDocument>('User', userSchema);