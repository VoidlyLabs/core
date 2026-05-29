import { Schema } from 'mongoose';

export type Configuration = {
  name: string;
  description: string;
  logoUrl: string;
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
  },
  {
    timestamps: true,
  },
);
