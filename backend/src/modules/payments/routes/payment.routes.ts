import { Router } from 'express';
import { authenticate } from '../../../common/middleware/auth';
import { validate } from '../../../common/middleware/validate';
import {
  initiatePaymentSchema,
  listPaymentsSchema,
  paymentIdParamSchema,
  reconcilePaymentSchema,
} from '../validators';
import {
  cancelPayment,
  getPayment,
  initiatePayment,
  listPayments,
  reconcilePayment,
} from '../controllers';

const router = Router();
const reconcileWithIdSchema = paymentIdParamSchema.merge(reconcilePaymentSchema);

router.post('/initiate', authenticate, validate(initiatePaymentSchema), initiatePayment);
router.get('/', authenticate, validate(listPaymentsSchema), listPayments);
router.get('/:id', authenticate, validate(paymentIdParamSchema), getPayment);
router.post('/:id/reconcile', authenticate, validate(reconcileWithIdSchema), reconcilePayment);
router.delete('/:id', authenticate, validate(paymentIdParamSchema), cancelPayment);

export default router;
