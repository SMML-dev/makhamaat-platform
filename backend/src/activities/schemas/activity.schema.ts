import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityDocument = Activity & Document;

export enum ActivityType {
  PRODUCTION = 'PRODUCTION',
  TRANSFORMATION = 'TRANSFORMATION',
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  EXPORT = 'EXPORT',
  ADJUSTMENT = 'ADJUSTMENT',
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
}

export enum ActivityStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MOBILE_MONEY = 'MOBILE_MONEY',
}

@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: String, enum: ActivityType, required: true })
  type: ActivityType;

  @Prop({ type: String, enum: ActivityStatus, default: ActivityStatus.PENDING })
  status: ActivityStatus;

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Actor' })
  actorId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  orderNumber?: string;

  @Prop()
  deliveryDate?: Date;

  @Prop()
  notes: string;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop({ type: String, enum: PaymentMethod, default: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  @Prop()
  paymentId?: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
