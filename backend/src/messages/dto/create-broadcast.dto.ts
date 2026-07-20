export class CreateBroadcastDto {
  subject: string;
  content: string;
  targetRole: 'ADMIN' | 'USER' | 'ALL';
  attachments?: { name: string; url: string }[];
}
