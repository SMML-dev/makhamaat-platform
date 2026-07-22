import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from './schemas/content.schema';

@Injectable()
export class ContentService {
  constructor(@InjectModel(Content.name) private contentModel: Model<ContentDocument>) {}

  async findAll(): Promise<Record<string, { en?: string; fr?: string }>> {
    const docs = await this.contentModel.find().exec();
    return docs.reduce((acc, doc) => {
      acc[doc.key] = doc.value;
      return acc;
    }, {} as Record<string, { en?: string; fr?: string }>);
  }

  async upsert(key: string, value: { en?: string; fr?: string }, updatedBy?: string) {
    return this.contentModel
      .findOneAndUpdate({ key }, { key, value, updatedBy }, { upsert: true, new: true })
      .exec();
  }

  async remove(key: string) {
    return this.contentModel.findOneAndDelete({ key }).exec();
  }
}
