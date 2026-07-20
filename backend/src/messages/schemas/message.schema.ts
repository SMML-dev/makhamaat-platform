import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum MessageStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED'
}

export enum MessageFolder {
  INBOX = 'INBOX',
  SENT = 'SENT',
  TRASH = 'TRASH',
  BROADCASTS = 'BROADCASTS'
}

export enum MessageType {
  CONTACT = 'CONTACT',    // Messages du formulaire de contact public
  DIRECT = 'DIRECT',      // Messages directs admin ↔ acteur
  BROADCAST = 'BROADCAST' // Messages broadcast super admin → admins/utilisateurs
}

export enum TargetRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ALL = 'ALL'
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: String, required: true })
  sender: string;

  @Prop({ type: String, enum: MessageType, default: MessageType.DIRECT })
  type: MessageType;

  @Prop({ type: String, enum: TargetRole, required: false })
  targetRole?: TargetRole;

  @Prop({ type: String, required: false })
  senderRole?: string;

  @Prop({ type: Types.ObjectId, ref: 'Actor', required: false })
  receiverId?: Types.ObjectId;

  @Prop({ required: false })
  receiverEmail?: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: String, enum: MessageStatus, default: MessageStatus.UNREAD })
  status: MessageStatus;

  @Prop({ type: String, enum: MessageFolder, default: MessageFolder.INBOX })
  folder: MessageFolder;

  @Prop({ type: [{ name: String, url: String }], default: [] })
  attachments: { name: string; url: string }[];

  @Prop({ type: [String], default: [] })
  readBy: string[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
