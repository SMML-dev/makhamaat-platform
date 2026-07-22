import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from './schemas/content.schema';

@Injectable()
export class ContentService {
  constructor(@InjectModel(Content.name) private contentModel: Model<ContentDocument>) {}

  async findAll(): Promise<Record<string, { en?: string; fr?: string; zone?: string }>> {
    const docs = await this.contentModel.find().exec();
    return docs.reduce((acc, doc) => {
      acc[doc.key] = { ...doc.value, zone: doc.zone };
      return acc;
    }, {} as Record<string, { en?: string; fr?: string; zone?: string }>);
  }

  async upsert(key: string, value: { en?: string; fr?: string; zone?: string }, updatedBy?: string) {
    const { zone, ...rest } = value;
    return this.contentModel
      .findOneAndUpdate({ key }, { key, value: rest, zone, updatedBy }, { upsert: true, new: true })
      .exec();
  }

  async remove(key: string) {
    return this.contentModel.findOneAndDelete({ key }).exec();
  }
}
