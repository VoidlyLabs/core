import { Schema } from 'mongoose';

export type User = {
  username: string;
  password: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};

export const UserSchema = new Schema<User>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);
