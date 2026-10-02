import { Router, Request, Response } from 'express';
import { CreateProductSchema, UpdateProductSchema } from '@aquora/validation';
import { getDatabase } from '../db';

export const adminRouter = Router();
const db = getDatabase();

// GET /api/v1/admin/stats
adminRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const orders = await db.getOrders();
    const machines = await db.getMachines();
    const inventory = await db.getInventory();
    const products = await db.getProducts();

    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter((o) => o.created_at.startsWith(today));

    const revenue_today = todayOrders
      .filter((o) => o.payment_status === 'PAID')
      .reduce((sum, o) => sum + o.amount, 0);

    const orders_today = todayOrders.length;
    const dispensed_today = todayOrders.filter((o) => o.order_status === 'DISPENSED').length;
    const failed_today = todayOrders.filter((o) => o.order_status === 'FAILED').length;

    const active_machines = machines.filter((m) => m.status === 'ONLINE').length;
    const offline_machines = machines.filter((m) => m.status !== 'ONLINE').length;

    const low_stock_count = inventory.filter(
      (i) => i.status === 'LOW' || i.status === 'CRITICAL' || i.status === 'OUT_OF_STOCK'
    ).length;

    // Popular sanitizers
    const productSalesMap: Record<string, { name: string; sales_count: number; revenue: number }> = {};
    for (const p of products) {
      productSalesMap[p.id] = { name: p.name, sales_count: 0, revenue: 0 };
    }
    for (const o of orders) {
      if (o.payment_status === 'PAID') {
        for (const item of o.items) {
          if (productSalesMap[item.product_id]) {
            productSalesMap[item.product_id].sales_count += item.quantity;
            productSalesMap[item.product_id].revenue += item.total_price;
          }
        }
      }
    }
    const popular_sanitizers = Object.values(productSalesMap).sort(
      (a, b) => b.sales_count - a.sales_count
    );

    // Hourly trends (last 6 hours simulated or current day)
    const hourly_trends = [
      { hour: '10:00', revenue: 180, orders: 3 },
      { hour: '12:00', revenue: 320, orders: 6 },
      { hour: '14:00', revenue: 240, orders: 4 },
      { hour: '16:00', revenue: 410, orders: 7 },
      { hour: '18:00', revenue: revenue_today || 120, orders: orders_today || 2 },
    ];

    return res.json({
      revenue_today,
      orders_today,
      dispensed_today,
      failed_today,
      active_machines,
      offline_machines,
      low_stock_count,
      popular_sanitizers,
      hourly_trends,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// GET /api/v1/admin/orders
adminRouter.get('/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await db.getOrders();
    return res.json(orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// GET /api/v1/admin/machines
adminRouter.get('/machines', async (_req: Request, res: Response) => {
  try {
    const machines = await db.getMachines();
    return res.json(machines);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// PATCH /api/v1/admin/machines/:id/channels/:ch
adminRouter.patch('/machines/:id/channels/:ch', async (req: Request, res: Response) => {
  try {
    const machineId = req.params.id;
    const channelNumber = parseInt(req.params.ch, 10);
    const updated = await db.updateMachineChannel(machineId, channelNumber, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Channel or Machine not found' });
    }
    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// GET /api/v1/admin/inventory
adminRouter.get('/inventory', async (_req: Request, res: Response) => {
  try {
    const inv = await db.getInventory();
    return res.json(inv);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// POST /api/v1/admin/inventory/:id/refill
adminRouter.post('/inventory/:id/refill', async (req: Request, res: Response) => {
  try {
    const { amount_ml = 2000 } = req.body;
    const refilled = await db.refillInventory(req.params.id, amount_ml);
    if (!refilled) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    return res.json(refilled);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// Products CRUD
adminRouter.post('/products', async (req: Request, res: Response) => {
  try {
    const validated = CreateProductSchema.parse(req.body);
    const slug = validated.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const created = await db.createProduct({
      ...validated,
      slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any);
    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

adminRouter.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const validated = UpdateProductSchema.parse(req.body);
    const updated = await db.updateProduct(req.params.id, validated as any);
    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

adminRouter.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const ok = await db.deleteProduct(req.params.id);
    if (!ok) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// GET /api/v1/admin/events
adminRouter.get('/events', async (req: Request, res: Response) => {
  try {
    const machineCode = req.query.machine as string | undefined;
    const events = await db.getMachineEvents(machineCode);
    const errors = await db.getMachineErrors(machineCode);
    return res.json({ events, errors });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});
