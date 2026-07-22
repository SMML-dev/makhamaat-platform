import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContentDocument = HydratedDocument<Content>;

@Schema({ timestamps: true })
export class Content {
  @Prop({ required: true, unique: true, index: true })
  key: string;

  @Prop({ required: true, type: Object })
  value: { en?: string; fr?: string };

  @Prop()
  updatedBy?: string;
}

export const ContentSchema = SchemaFactory.createForClass(Content);
