import { Schema } from 'mongoose';
import { LocalizedString } from '../../libs/localization';

export type Category = {
  name: LocalizedString;
  createdAt: Date;
  updatedAt: Date;
};

export const CategorySchema = new Schema<Category>(
  {
    name: {
      uk: { type: String, required: true, trim: true },
      en: { type: String, default: '', trim: true },
    },
  },
  {
    timestamps: true,
  },
);

CategorySchema.index({ 'name.uk': 1 }, { unique: true });
CategorySchema.index(
  { 'name.en': 1 },
  {
    unique: true,
    partialFilterExpression: { 'name.en': { $gt: '' } },
  },
);
