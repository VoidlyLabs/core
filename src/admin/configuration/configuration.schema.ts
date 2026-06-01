import { Schema } from 'mongoose';

export type Configuration = {
  name: string;
  description: string;
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
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
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
