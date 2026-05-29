import { Schema } from 'mongoose';

export type Category = {
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export const CategorySchema = new Schema<Category>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);
