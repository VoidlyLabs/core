import { Schema } from 'mongoose';

export type Client = {
  username: string;
  password: string;
  balance: number;
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
