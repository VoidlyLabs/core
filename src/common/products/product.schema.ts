import { Schema } from 'mongoose';
import { LocalizedString } from '../../libs/localization';

export type Product = {
  categoryId: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number;
  isAvailable: boolean;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export const ProductSchema = new Schema<Product>(
  {
    categoryId: { type: String, required: true, index: true, trim: true },
    name: {
      uk: { type: String, required: true, trim: true },
      en: { type: String, default: '', trim: true },
    },
    description: {
      uk: { type: String, required: true, trim: true },
      en: { type: String, default: '', trim: true },
    },
    price: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
    imageUrl: { type: String, default: '', trim: true },
  },
  {
    timestamps: true,
  },
);
