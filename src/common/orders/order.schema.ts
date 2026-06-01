import { Schema } from 'mongoose';

export type OrderStatus = 'pending' | 'paid' | 'cancelled';

export type OrderProductSnapshot = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
};

export type Order = {
  clientId: string;
  productId: string;
  product: OrderProductSnapshot;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const OrderSchema = new Schema<Order>(
  {
    clientId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    productId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    product: {
      id: {
        type: String,
        required: true,
        trim: true,
      },
      categoryId: {
        type: String,
        required: true,
        trim: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
        trim: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      imageUrl: {
        type: String,
        default: '',
        trim: true,
      },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  },
);
