import { Controller } from '@nestjs/common'
import { Auth } from '../auth/auth.decorator'
import { PaymentService } from '../payment/service/payment.service'

@Auth()
@Controller('v1/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
}
