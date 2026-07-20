import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActorDocument = Actor & Document;

export enum ActorType {
  SUPPLIER = 'SUPPLIER',
  CLIENT_B2B = 'CLIENT_B2B',
  CLIENT_EXPORT = 'CLIENT_EXPORT',
}

@Schema({ timestamps: true })
export class Actor {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: ActorType, required: true })
  type: ActorType;

  @Prop({ required: true })
  location: string;

  @Prop({ default: 'Actif' })
  status: string;

  @Prop()
  contactEmail: string;
}

export const ActorSchema = SchemaFactory.createForClass(Actor);
