import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument, MessageFolder, MessageStatus, MessageType, TargetRole } from './schemas/message.schema';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MessagesService implements OnModuleInit {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private mailService: MailService,
  ) {}

  async onModuleInit() {
    const count = await this.messageModel.countDocuments();
    if (count === 0) {
      await this.messageModel.insertMany([
        {
          sender: 'CM Podor (cmp@gmail.com)',
          subject: 'Demande de réapprovisionnement',
          content: 'Bonjour, nous souhaiterions commander 5 Tonnes de semences pour la semaine prochaine.',
          status: MessageStatus.UNREAD,
          folder: MessageFolder.INBOX,
          type: MessageType.CONTACT
        },
        {
          sender: 'AgriCorp',
          subject: 'Confirmation de livraison',
          content: "La livraison des 10 Tonnes d'engrais a été effectuée ce matin à 8h.",
          status: MessageStatus.READ,
          folder: MessageFolder.INBOX,
          type: MessageType.DIRECT
        }
      ]);
    }
  }

  // ─── Admin Messaging ───────────────────────────────────────────────────────

  async create(createMessageDto: any): Promise<Message> {
    const createdMessage = new this.messageModel({
      ...createMessageDto,
      folder: MessageFolder.SENT,
      type: createMessageDto.type || MessageType.DIRECT,
      receiverEmail: createMessageDto.receiverEmail || undefined,
    });
    return createdMessage.save();
  }

  async createContactMessage(createContactMessageDto: CreateContactMessageDto): Promise<Message> {
    const { sender, email, subject, content } = createContactMessageDto;
    const createdMessage = new this.messageModel({
      sender: `${sender} (${email})`,
      subject,
      content,
      status: MessageStatus.UNREAD,
      folder: MessageFolder.INBOX,
      type: MessageType.CONTACT
    });

    // Save to database
    const savedMessage = await createdMessage.save();

    // Trigger real-world email notification (reliability improvement)
    this.mailService.sendContactNotification({ sender, email, subject, content })
      .catch(err => console.error('Background contact notification failed:', err));

    return savedMessage;
  }

  async findByFolder(folder: string): Promise<Message[]> {
    return this.messageModel.find({ folder }).populate('receiverId').sort({ createdAt: -1 }).exec();
  }

  async findAdminInbox(): Promise<Message[]> {
    // Returns INBOX messages + BROADCASTS received by admins
    return this.messageModel
      .find({
        $or: [
          { folder: MessageFolder.INBOX },
          { type: MessageType.BROADCAST, targetRole: { $in: [TargetRole.ADMIN, TargetRole.ALL] } }
        ]
      })
      .populate('receiverId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findMyMessages(email: string): Promise<Message[]> {
    return this.messageModel.find({
      $or: [
        { receiverEmail: email },
        { 
          type: MessageType.BROADCAST, 
          targetRole: { $in: [TargetRole.USER, TargetRole.ALL] } 
        }
      ]
    }).sort({ createdAt: -1 }).exec();
  }

  async findAll(): Promise<Message[]> {
    return this.messageModel.find().populate('receiverId').sort({ createdAt: -1 }).exec();
  }

  async update(id: string, updateMessageDto: any): Promise<Message> {
    return this.messageModel.findByIdAndUpdate(id, updateMessageDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Message> {
    return this.messageModel.findByIdAndDelete(id).exec();
  }

  // ─── Super Admin Broadcast ─────────────────────────────────────────────────

  async createBroadcast(createBroadcastDto: CreateBroadcastDto, senderName: string): Promise<Message> {
    const { subject, content, targetRole } = createBroadcastDto;
    const broadcast = new this.messageModel({
      sender: senderName,
      senderRole: 'SUPER_ADMIN',
      subject,
      content,
      type: MessageType.BROADCAST,
      targetRole: targetRole as TargetRole,
      folder: MessageFolder.BROADCASTS,
      status: MessageStatus.UNREAD,
      attachments: createBroadcastDto.attachments || []
    });
    return broadcast.save();
  }

  async findBroadcasts(): Promise<Message[]> {
    return this.messageModel
      .find({ type: MessageType.BROADCAST })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findBroadcastsForRole(role: 'ADMIN' | 'USER' | 'ALL'): Promise<Message[]> {
    return this.messageModel
      .find({
        type: MessageType.BROADCAST,
        targetRole: { $in: [role, TargetRole.ALL] }
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
