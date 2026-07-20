import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType, ActivityStatus } from '../activities/schemas/activity.schema';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject(forwardRef(() => ActivitiesService))
    private activitiesService: ActivitiesService,
  ) {}

  async onModuleInit() {}

  async create(createProductDto: any, actorId?: string): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    const savedProduct = await createdProduct.save();

    if (actorId) {
      await this.activitiesService.create({
        type: ActivityType.PRODUCT_CREATED,
        status: ActivityStatus.COMPLETED,
        productId: savedProduct._id,
        actorId: new Types.ObjectId(actorId),
        quantity: 0,
        notes: `Création du produit : ${savedProduct.name}`,
      });
    }

    return savedProduct;
  }

  localize(product: any, lang: string): any {
    if (!product) return product;
    const normalizedLang = lang ? lang.split('-')[0] : undefined;
    const translations = product.translations || {};
    const localized = (normalizedLang && translations[normalizedLang]) || translations['en'] || {};
    return {
      ...product.toObject ? product.toObject() : product,
      localizedName: localized.name || product.name,
      localizedDescription: localized.description || product.description,
    };
  }

  async findAll(lang?: string): Promise<any[]> {
    const products = await this.productModel.find().exec();
    return products.map(p => this.localize(p, lang));
  }

  async findOne(id: string, lang?: string): Promise<any> {
    const product = await this.productModel.findById(id).exec();
    return product ? this.localize(product, lang) : null;
  }

  async update(id: string, updateProductDto: any, actorId?: string): Promise<Product> {
    const updatedProduct = await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();

    if (actorId && updatedProduct) {
      await this.activitiesService.create({
        type: ActivityType.PRODUCT_UPDATED,
        status: ActivityStatus.COMPLETED,
        productId: updatedProduct._id,
        actorId: new Types.ObjectId(actorId),
        quantity: 0,
        notes: `Mise à jour du produit : ${updatedProduct.name}`,
      });
    }

    return updatedProduct;
  }

  async remove(id: string, actorId?: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) return null;

    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();

    if (actorId && deletedProduct) {
      await this.activitiesService.create({
        type: ActivityType.PRODUCT_DELETED,
        status: ActivityStatus.COMPLETED,
        productId: deletedProduct._id,
        actorId: new Types.ObjectId(actorId),
        quantity: 0,
        notes: `Suppression du produit : ${deletedProduct.name}`,
      });
    }

    return deletedProduct;
  }

  async getHistory(id: string): Promise<any[]> {
    const activities = await this.activitiesService.findByProductId(id);
    const product = await this.findOne(id);
    
    // Sort activities by date ascending to reconstruct history
    const sortedActivities = activities
      .filter(a => a.status === ActivityStatus.COMPLETED)
      .sort((a, b) => new Date((a as any).createdAt).getTime() - new Date((b as any).createdAt).getTime());

    let currentStock = product.stockQuantity;
    const history = [];

    // Reconstruct backwards to get the trend
    // But for sparklines, we often just want the last 15 values
    // To be precise, we'll start from current and go back
    history.push({ date: new Date(), value: currentStock });

    for (let i = sortedActivities.length - 1; i >= 0 && history.length < 15; i--) {
      const act = sortedActivities[i] as any;
      if ([ActivityType.PURCHASE, ActivityType.PRODUCTION, ActivityType.TRANSFORMATION].includes(act.type)) {
        currentStock -= act.quantity;
      } else if ([ActivityType.SALE, ActivityType.EXPORT].includes(act.type)) {
        currentStock += act.quantity;
      } else if (act.type === ActivityType.ADJUSTMENT) {
        currentStock -= act.quantity;
      }
      history.unshift({ date: act.createdAt, value: Math.max(0, currentStock) });
    }

    return history;
  }

  async getMarketComparison(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async updateMarketPrice(id: string, marketPriceData: any, actorId?: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) return null;

    const { marketName, price } = marketPriceData;

    // Initialize markets array if it doesn't exist
    if (!product.markets) {
      product.markets = [];
    }

    // Find existing market entry or create new one
    const existingMarketIndex = product.markets.findIndex((m: any) => m.marketName === marketName);
    if (existingMarketIndex >= 0) {
      product.markets[existingMarketIndex] = {
        marketName,
        price,
        isAvailable: true,
        lastUpdated: new Date(),
      };
    } else {
      product.markets.push({
        marketName,
        price,
        isAvailable: true,
        lastUpdated: new Date(),
      });
    }

    // Calculate best market
    const availableMarkets = product.markets.filter((m: any) => m.isAvailable);
    if (availableMarkets.length > 0) {
      const best = availableMarkets.reduce((prev: any, current: any) =>
        prev.price < current.price ? prev : current
      );
      product.bestMarket = {
        marketName: best.marketName,
        price: best.price,
      };
    }

    // Set base price if not set
    if (!product.basePrice) {
      product.basePrice = product.price;
    }

    const updatedProduct = await product.save();

    if (actorId) {
      await this.activitiesService.create({
        type: ActivityType.PRODUCT_UPDATED,
        status: ActivityStatus.COMPLETED,
        productId: updatedProduct._id,
        actorId: new Types.ObjectId(actorId),
        quantity: 0,
        notes: `Mise à jour du prix de marché pour ${marketName}: ${price} FCFA`,
      });
    }

    return updatedProduct;
  }

}
