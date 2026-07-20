import { Injectable, OnModuleInit, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument, ActivityStatus, ActivityType } from './schemas/activity.schema';
import { ActorsService } from '../actors/actors.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ActivitiesService implements OnModuleInit {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    private actorsService: ActorsService,
    @Inject(forwardRef(() => ProductsService))
    private productsService: ProductsService,
  ) {}

  async onModuleInit() {}

  async create(createActivityDto: any): Promise<Activity> {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    const datePrefix = `${dd}${mm}${yy}`;

    const lastActivity = await this.activityModel
      .findOne({ orderNumber: new RegExp(`^${datePrefix}-A`) })
      .sort({ createdAt: -1 })
      .exec();

    let nextSequence = 1;
    if (lastActivity && lastActivity.orderNumber) {
      const parts = lastActivity.orderNumber.split('-A');
      if (parts.length === 2 && !isNaN(Number(parts[1]))) {
        nextSequence = parseInt(parts[1], 10) + 1;
      }
    }

    createActivityDto.orderNumber = `${datePrefix}-A${nextSequence}`;

    // Pre-create validation: Check stock if activity is already COMPLETED or being created as COMPLETED
    if (createActivityDto.status === ActivityStatus.COMPLETED && createActivityDto.productId) {
      const product = await this.productsService.findOne(createActivityDto.productId);
      if (product) {
        if ([ActivityType.SALE, ActivityType.EXPORT].includes(createActivityDto.type)) {
          if (createActivityDto.quantity > product.stockQuantity) {
            throw new BadRequestException(`Stock insuffisant: ${product.stockQuantity} disponible(s), ${createActivityDto.quantity} demandé(s).`);
          }
        } else if (createActivityDto.type === ActivityType.ADJUSTMENT) {
          if (product.stockQuantity + createActivityDto.quantity < 0) {
            throw new BadRequestException(`Ajustement impossible: le stock ne peut pas être négatif.`);
          }
        }
      }
    }

    const createdActivity = new this.activityModel(createActivityDto);
    const savedActivity = await createdActivity.save();

    // Automatic Stock Update if the activity is COMPLETED
    if (savedActivity.status === ActivityStatus.COMPLETED && savedActivity.productId) {
      await this.handleStockUpdate(savedActivity);
    }

    return savedActivity;
  }

  private async handleStockUpdate(activity: any) {
    const productId = activity.productId?._id?.toString?.() || activity.productId?.toString?.() || activity.productId;
    if (!productId) return;

    const product = await this.productsService.findOne(productId);
    if (!product) return;

    let newQuantity = Number(product.stockQuantity) || 0;
    const type = activity.type;
    const quantity = Number(activity.quantity) || 0;

    // Ignore non-stock activity types
    if ([ActivityType.PRODUCT_CREATED, ActivityType.PRODUCT_UPDATED, ActivityType.PRODUCT_DELETED].includes(type)) {
      return;
    }

    if ([ActivityType.PURCHASE, ActivityType.PRODUCTION, ActivityType.TRANSFORMATION].includes(type)) {
      newQuantity += quantity;
    } else if ([ActivityType.SALE, ActivityType.EXPORT].includes(type)) {
      if (quantity > newQuantity) {
        throw new BadRequestException(`Stock insuffisant pour le produit ${product.localizedName || product.name}.`);
      }
      newQuantity -= quantity;
    } else if (type === ActivityType.ADJUSTMENT) {
      newQuantity += quantity;
    }

    await this.productsService.update((product as any)._id.toString(), {
      stockQuantity: Math.max(0, newQuantity),
    });
  }

  async findAll(): Promise<Activity[]> {
    return this.activityModel.find().populate('productId').exec();
  }

  async findLogs(page: number, limit: number, filter: string): Promise<{ data: Activity[], total: number }> {
    const query: any = {};
    if (filter) {
      query.$or = [
        { type: { $regex: filter, $options: 'i' } },
        { status: { $regex: filter, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.activityModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actorId')
        .populate('productId')
        .exec(),
      this.activityModel.countDocuments(query).exec()
    ]);
    return { data, total };
  }

  async findOne(id: string): Promise<Activity> {
    return this.activityModel.findById(id).populate('productId').exec();
  }

  async update(id: string, updateActivityDto: any, actorId?: string): Promise<Activity> {
    const existing = await this.activityModel.findById(id).exec();
    if (!existing) return null;

    const updated = await this.activityModel.findByIdAndUpdate(id, updateActivityDto, { new: true }).exec();

    // Handle status transitions for stock consistency
    if (existing.status !== ActivityStatus.COMPLETED && updated.status === ActivityStatus.COMPLETED) {
      // Transition TO Completed: Update stock
      await this.handleStockUpdate(updated);
    } else if (existing.status === ActivityStatus.COMPLETED && updated.status !== ActivityStatus.COMPLETED) {
      // Transition AWAY FROM Completed: Reverse stock update
      await this.reverseStockUpdate(existing);
    }

    // Audit log for admin status changes
    if (actorId && existing.status !== updated.status) {
      const product = await this.productsService.findOne(existing.productId.toString());
      const productName = product ? (product.localizedName || product.name) : 'Produit inconnu';
      await this.activityModel.create({
        type: ActivityType.PRODUCT_UPDATED,
        status: updated.status,
        actorId: new Types.ObjectId(actorId),
        productId: existing.productId,
        quantity: 0,
        notes: `Statut commande ${existing.orderNumber || id} (${productName}) modifié de ${existing.status} à ${updated.status}`,
      });
    }

    return updated;
  }

  private async reverseStockUpdate(activity: any) {
    const productId = activity.productId?._id?.toString?.() || activity.productId?.toString?.() || activity.productId;
    if (!productId) return;

    const product = await this.productsService.findOne(productId);
    if (!product) return;

    let newQuantity = Number(product.stockQuantity) || 0;
    const type = activity.type;
    const quantity = Number(activity.quantity) || 0;

    // Ignore non-stock activity types
    if ([ActivityType.PRODUCT_CREATED, ActivityType.PRODUCT_UPDATED, ActivityType.PRODUCT_DELETED].includes(type)) {
      return;
    }
    if ([ActivityType.PURCHASE, ActivityType.PRODUCTION, ActivityType.TRANSFORMATION].includes(type)) {
      newQuantity -= quantity;
    } else if ([ActivityType.SALE, ActivityType.EXPORT].includes(type)) {
      newQuantity += quantity;
    }

    await this.productsService.update((product as any)._id.toString(), {
      stockQuantity: Math.max(0, newQuantity),
    });
  }

  async remove(id: string): Promise<Activity> {
    return this.activityModel.findByIdAndDelete(id).exec();
  }

  async getStats(actorId: string): Promise<any> {
    const objectId = new Types.ObjectId(actorId);
    
    // Get all activities for this actor
    const activities = await this.activityModel.find({ actorId: objectId }).exec();
    
    if (activities.length === 0) {
      return {
        totalVolume: 0,
        totalOperations: 0,
        reliability: 100, // Default to 100 if no operations
      };
    }

    const totalVolume = activities.reduce((acc, curr) => acc + curr.quantity, 0);
    const totalOperations = activities.length;
    const completedOperations = activities.filter(a => a.status === ActivityStatus.COMPLETED).length;
    
    const reliability = Math.round((completedOperations / totalOperations) * 100);

    return {
      totalVolume,
      totalOperations,
      reliability,
    };
  }

  async findByUserId(userId: string): Promise<Activity[]> {
    return this.activityModel.find({ actorId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('productId')
      .exec();
  }

  async findByProductId(productId: string): Promise<Activity[]> {
    return this.activityModel.find({ productId: new Types.ObjectId(productId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUserStats(userId: string): Promise<any> {
    const activities = await this.activityModel.find({ actorId: new Types.ObjectId(userId) })
      .populate('productId')
      .exec();

    const activeOrders = activities.filter(a => 
      a.status === ActivityStatus.PENDING || a.status === ActivityStatus.PREPARING || a.status === ActivityStatus.IN_TRANSIT
    ).length;

    const inDelivery = activities.filter(a => 
       a.status === ActivityStatus.IN_TRANSIT || a.status === ActivityStatus.PREPARING
    ).length;

    let totalSpent = 0;
    for (const activity of activities) {
      // User orders are created as SALE type
      if (activity.type === ActivityType.SALE && activity.productId) {
        const product: any = activity.productId;
        totalSpent += (product.price || 0) * activity.quantity;
      }
    }

    return {
      activeOrders,
      totalSpent,
      inDelivery
    };
  }
}
