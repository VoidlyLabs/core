import { Schema } from 'mongoose';

export type BootstrapMarker = {
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export const BootstrapMarkerSchema = new Schema<BootstrapMarker>(
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
