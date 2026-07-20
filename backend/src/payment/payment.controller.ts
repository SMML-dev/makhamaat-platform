import { Controller, Get, Query, Body, Post, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { PaymentService } from './payment.service';
import { ActivitiesService } from '../activities/activities.service';
import { PaymentStatus, ActivityStatus } from '../activities/schemas/activity.schema';
import { Public } from '../auth/decorators/public.decorator';

@Controller('payment')
export class PaymentController {
  private readonly frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  constructor(
    private readonly paymentService: PaymentService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  @Public()
  @Get('verify')
  async verifyPayment(
    @Query('session_id') sessionId: string,
    @Query('id') id: string,
    @Query('order_ids') orderIds: string,
    @Query('return_url') returnUrlBase: string,
    @Res() res: Response,
  ) {
    const baseUrl = returnUrlBase || this.frontendUrl;
    const activeSessionId = id || sessionId;
    const isSuccess = await this.paymentService.verifyPayment(activeSessionId);

    if (isSuccess && orderIds) {
      const ids = orderIds.split(',').filter(Boolean);
      for (const id of ids) {
        try {
          await this.activitiesService.update(id, {
            paymentStatus: PaymentStatus.PAID,
            status: ActivityStatus.COMPLETED,
            paymentId: activeSessionId,
          });
        } catch (error) {
          console.error(`Failed to update order ${id}:`, error);
        }
      }
      return res.redirect(`${baseUrl}/user/dashboard?tab=orders&payment=success`);
    } else {
      return res.redirect(`${baseUrl}/user/dashboard?tab=orders&payment=failed`);
    }
  }

  @Public()
  @Post('initiate')
  async initiatePayment(
    @Req() req: Request,
    @Body() data: { 
      amount: number; 
      currency: string; 
      orderIds: string[]; 
      returnUrl?: string;
      customer?: { name: string; email: string; phone: string }
    }
  ) {
    const protocol = req.protocol;
    const host = req.get('host');
    const backendBaseUrl = `${protocol}://${host}`;

    const session = await this.paymentService.createSession(
      data.amount,
      data.currency,
      data.orderIds.join(','),
      data.returnUrl,
      backendBaseUrl,
      data.customer,
    );
    return session;
  }
}
