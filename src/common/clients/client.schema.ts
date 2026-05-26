import { Schema } from 'mongoose';

export type Client = {
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

export const ClientSchema = new Schema<Client>(
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
