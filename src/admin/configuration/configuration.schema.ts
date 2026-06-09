import { Schema } from 'mongoose';
import { LocalizedString } from '../../libs/localization';

export type Configuration = {
  name: LocalizedString;
  description: LocalizedString;
  logoUrl: string;
  accentColor: string;
  backgroundColor: string;
  secondaryColor: string;
  phoneNumber: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export const ConfigurationSchema = new Schema<Configuration>(
  {
    name: {
      uk: { type: String, default: '', trim: true },
      en: { type: String, default: '', trim: true },
    },
    description: {
      uk: { type: String, default: '', trim: true },
      en: { type: String, default: '', trim: true },
    },
    logoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    accentColor: {
      type: String,
      default: '',
      trim: true,
    },
    backgroundColor: {
      type: String,
      default: '',
      trim: true,
    },
    secondaryColor: {
      type: String,
      default: '',
      trim: true,
    },
    phoneNumber: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);
