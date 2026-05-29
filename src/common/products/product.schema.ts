import { Schema, Types } from 'mongoose';

export type Product = {
  name: string;
  categoryId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ProductSchema = new Schema<Product>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
      index: true,
    },
  },
  {
    timestamps: true,
  },
);
