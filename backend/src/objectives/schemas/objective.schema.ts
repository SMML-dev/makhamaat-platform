import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ObjectiveDocument = Objective & Document;

export enum ObjectiveType {
  SALES = 'sales',
  EXPORT = 'export',
  STOCK = 'stock',
  PRODUCTION = 'production',
}

export enum ObjectiveStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Objective {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  targetQuantity: number;

  @Prop({ default: 'kg' })
  unit: string;

  @Prop({ min: 0 })
  targetPrice: number;

  @Prop({ min: 0 })
  targetRevenue: number;

  @Prop({ required: true })
  deadline: Date;

  @Prop({ type: String, enum: ObjectiveType, required: true })
  type: ObjectiveType;

  @Prop()
  notes: string;

  @Prop({ type: String, enum: ObjectiveStatus, default: ObjectiveStatus.PENDING })
  status: ObjectiveStatus;
}

export const ObjectiveSchema = SchemaFactory.createForClass(Objective);
