export class CreateInboundEmailDto {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
