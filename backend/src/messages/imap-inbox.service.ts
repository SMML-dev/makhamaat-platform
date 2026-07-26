import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { MessagesService } from './messages.service';

@Injectable()
export class ImapInboxService implements OnModuleInit {
  private readonly logger = new Logger(ImapInboxService.name);

  constructor(private readonly messagesService: MessagesService) {}

  onModuleInit() {
    if (!process.env.IMAP_HOST || !process.env.IMAP_USER || !process.env.IMAP_PASSWORD) {
      this.logger.log('IMAP inbox not configured; skipping inbound email polling.');
      return;
    }

    this.logger.log('Starting IMAP inbound email polling...');
    this.poll();
    setInterval(
      () => this.poll(),
      parseInt(process.env.IMAP_POLL_INTERVAL_MS || '60000', 10),
    );
  }

  async poll() {
    const targetEmails = (process.env.IMAP_TARGET_EMAILS || 'contact@mbc-suarl.com,privacy@mbc-suarl.com')
      .split(',')
      .map((e) => e.trim().toLowerCase());

    const client = new ImapFlow({
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT || '993', 10),
      secure: process.env.IMAP_TLS !== 'false',
      auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASSWORD,
      },
      logger: false,
    });

    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');
      try {
        const uids = await client.search({ seen: false });
        if (!uids || !uids.length) {
          return;
        }
        for (const uid of uids) {
          try {
            const message = await client.fetchOne(uid, { source: true }, { uid: true });
            if (!message || !message.source) {
              continue;
            }
            const parsed = await simpleParser(message.source);

            const toAddresses = (parsed.to?.value || []).map((a) => a.address?.toLowerCase() || '');
            if (!toAddresses.some((addr) => targetEmails.includes(addr))) {
              continue;
            }

            const fromEntry = parsed.from?.value?.[0];
            const fromStr = fromEntry
              ? `${fromEntry.name || fromEntry.address} <${fromEntry.address}>`
              : parsed.from?.text || 'unknown';

            await this.messagesService.createInboundMessage({
              from: fromStr,
              to: parsed.to?.text || '',
              subject: parsed.subject || '',
              text: parsed.text,
              html: parsed.html,
            });

            await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
            this.logger.log(`Imported inbound email: ${parsed.subject}`);
          } catch (msgError) {
            this.logger.error('Failed to process single inbound email', msgError);
          }
        }
      } finally {
        lock.release();
      }
    } catch (error) {
      this.logger.error('IMAP poll failed', error);
    } finally {
      await client.logout();
    }
  }
}
