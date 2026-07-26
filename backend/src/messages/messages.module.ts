import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { ImapInboxService } from './imap-inbox.service';
import { Message, MessageSchema } from './schemas/message.schema';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MailModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, ImapInboxService],
  exports: [MessagesService],
})
export class MessagesModule {}
