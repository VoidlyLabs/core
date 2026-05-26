import { Schema } from 'mongoose';

export type User = {
  username: string;
  password: string;
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
  },
  {
    timestamps: true,
  },
);
