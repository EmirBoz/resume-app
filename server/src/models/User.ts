import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../types';

export interface UserDocument extends Document {
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
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