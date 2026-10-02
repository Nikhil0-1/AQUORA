import { Router, Request, Response } from 'express';
import { CreateOrderSchema } from '@aquora/validation';
import { orderService } from '../services/order.service';

export const ordersRouter = Router();

// POST /api/v1/orders
ordersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validated = CreateOrderSchema.parse(req.body);
    const order = await orderService.createOrder({
      machine_code: validated.machine_code || 'AQ-DM-001',
      customer_name: validated.customer_name,
      customer_phone: validated.customer_phone,
      customer_email: validated.customer_email,
      items: validated.items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity || 1,
        volume_ml: i.volume_ml || 100,
      })),
    });
    return res.status(201).json(order);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    return res.status(400).json({ message: error.message });
  }
});

// GET /api/v1/orders/:id/status (Section 57: Explicit Order Status Endpoint)
ordersRouter.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const order = await orderService.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const isExpired = new Date() > new Date(order.expires_at);
    return res.json({
      order_id: order.id,
      order_number: order.order_number,
      payment_status: order.payment_status,
      order_status: order.order_status,
      amount: order.amount,
      currency: order.currency,
      dispensed_at: order.dispensed_at,
      expires_at: order.expires_at,
      is_expired: isExpired,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// GET /api/v1/orders/:id
ordersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await orderService.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});
