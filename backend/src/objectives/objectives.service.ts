import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Objective, ObjectiveDocument } from './schemas/objective.schema';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';

@Injectable()
export class ObjectivesService {
  constructor(
    @InjectModel(Objective.name) private objectiveModel: Model<ObjectiveDocument>,
  ) {}

  async create(createObjectiveDto: CreateObjectiveDto): Promise<Objective> {
    const created = new this.objectiveModel(createObjectiveDto);
    return created.save();
  }

  async findAll(filters: { product?: string } = {}): Promise<Objective[]> {
    const query: any = {};
    if (filters.product) query.product = filters.product;
    return this.objectiveModel
      .find(query)
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Objective> {
    const objective = await this.objectiveModel
      .findById(id)
      .populate('product', 'name')
      .exec();
    if (!objective) throw new NotFoundException('Objective not found');
    return objective;
  }

  async update(id: string, updateObjectiveDto: UpdateObjectiveDto): Promise<Objective> {
    const objective = await this.objectiveModel
      .findByIdAndUpdate(id, updateObjectiveDto, { new: true })
      .exec();
    if (!objective) throw new NotFoundException('Objective not found');
    return objective;
  }

  async remove(id: string): Promise<Objective> {
    const objective = await this.objectiveModel.findByIdAndDelete(id).exec();
    if (!objective) throw new NotFoundException('Objective not found');
    return objective;
  }
}
