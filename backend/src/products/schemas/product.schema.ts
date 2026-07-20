import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ProductCategory {
  AGRICULTURAL = 'AGRICULTURAL',
  HORTICULTURAL = 'HORTICULTURAL',
  MARKET_GARDENING = 'MARKET_GARDENING',
  CEREAL = 'CEREAL',
  FRUIT = 'FRUIT',
  AGRO_FOOD = 'AGRO_FOOD',
}

export interface ProductTranslation {
  name: string;
  description: string;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object })
  translations: Record<string, ProductTranslation>;

  @Prop({ type: String, enum: ProductCategory, required: true })
  category: ProductCategory;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  stockQuantity: number;

  @Prop()
  imageUrl: string;

  @Prop({ default: 500 })
  lowStockThreshold: number;

  @Prop({ type: [{ marketName: String, price: Number, isAvailable: Boolean, lastUpdated: Date }] })
  markets: Array<{
    marketName: string;
    price: number;
    isAvailable: boolean;
    lastUpdated: Date;
  }>;

  @Prop({ type: Object })
  bestMarket: {
    marketName: string;
    price: number;
  };

  @Prop()
  basePrice: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
