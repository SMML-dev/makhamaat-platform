import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Actor, ActorDocument } from './schemas/actor.schema';
import { MessagesService } from '../messages/messages.service';
import { MessageType, TargetRole } from '../messages/schemas/message.schema';

@Injectable()
export class ActorsService implements OnModuleInit {
  constructor(
    @InjectModel(Actor.name) private actorModel: Model<ActorDocument>,
    private messagesService: MessagesService,
  ) {}

  async onModuleInit() {
    // Seeding removed per user request
  }

  async create(createActorDto: any): Promise<Actor> {
    const createdActor = new this.actorModel(createActorDto);
    return createdActor.save();
  }

  async findAll(): Promise<Actor[]> {
    return this.actorModel.find().exec();
  }

  async findOne(id: string): Promise<Actor> {
    return this.actorModel.findById(id).exec();
  }

  async findByName(name: string): Promise<Actor> {
    return this.actorModel.findOne({ name }).exec();
  }

  async findByEmail(contactEmail: string): Promise<ActorDocument> {
    return this.actorModel.findOne({ contactEmail }).exec();
  }

  async update(id: string, updateActorDto: any, performingUser?: any): Promise<Actor> {
    const actor = await this.actorModel.findById(id).exec();
    const result = await this.actorModel.findByIdAndUpdate(id, updateActorDto, { new: true }).exec();
    
    // Notification Super Admin
    if (result) {
      await this.messagesService.create({
        sender: performingUser ? `${performingUser.name} (Admin)` : 'System',
        subject: `Mise à jour Partenaire : ${actor.name}`,
        content: `Le partenaire "${actor.name}" (${actor.type}) a été mis à jour par un administrateur.`,
        type: MessageType.BROADCAST,
        targetRole: TargetRole.SUPER_ADMIN,
      });
    }
    return result;
  }

  async remove(id: string, performingUser?: any): Promise<Actor> {
    const actor = await this.actorModel.findById(id).exec();
    const result = await this.actorModel.findByIdAndDelete(id).exec();
    
    // Notification Super Admin
    if (result) {
      await this.messagesService.create({
        sender: performingUser ? `${performingUser.name} (Admin)` : 'System',
        subject: `SUPPRESSION Partenaire : ${actor.name}`,
        content: `Le partenaire "${actor.name}" (${actor.type}) a été SUPPRIMÉ du réseau par un administrateur.`,
        type: MessageType.BROADCAST,
        targetRole: TargetRole.SUPER_ADMIN,
      });
    }
    return result;
  }
}
