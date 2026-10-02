import { v4 as uuidv4 } from 'uuid';
import { Order, OrderItem, OrderStatus } from '@aquora/shared-types';
import { getDatabase } from '../db';
import { realtimeHub } from '../websocket';

export class OrderService {
  private db = getDatabase();

  /**
   * Creates an order with strict server-side price calculation and machine validation.
   */
  async createOrder(params: {
    machine_code: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    items: Array<{ product_id: string; quantity: number; volume_ml: number }>;
  }): Promise<Order> {
    const machine = await this.db.getMachineByCode(params.machine_code);
    if (!machine) {
      throw new Error(`Machine with code ${params.machine_code} not found`);
    }

    if (machine.status === 'OFFLINE' || machine.status === 'DISABLED') {
      throw new Error(`Machine ${params.machine_code} is currently ${machine.status}`);
    }

    const orderId = uuidv4();
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const item of params.items) {
      const product = await this.db.getProductById(item.product_id);
      if (!product) {
        throw new Error(`Product ${item.product_id} does not exist`);
      }
      if (!product.is_available) {
        throw new Error(`Product ${product.name} is currently unavailable`);
      }

      // Check machine channel mapping
      const channel = machine.channels.find(
        (c) => c.product_id === product.id && c.is_active
      );
      if (!channel) {
        throw new Error(`Product ${product.name} is not loaded on machine ${machine.machine_code}`);
      }

      if (channel.stock_status === 'OUT_OF_STOCK') {
        throw new Error(`Product ${product.name} is out of stock on machine ${machine.machine_code}`);
      }

      // Server-side price: calculate variant or proportional price
      let unitPrice = product.price;
      if (product.variants && product.variants.length > 0) {
        const matchingVariant = product.variants.find((v) => v.volume_ml === item.volume_ml);
        if (matchingVariant) {
          unitPrice = matchingVariant.price;
        } else {
          unitPrice = Math.round((product.price * (item.volume_ml / (product.volume_ml || 100))) * 100) / 100;
        }
      } else {
        unitPrice = Math.round((product.price * (item.volume_ml / (product.volume_ml || 100))) * 100) / 100;
      }

      const lineTotal = Math.round(unitPrice * item.quantity * 100) / 100;
      totalAmount += lineTotal;

      orderItems.push({
        id: uuidv4(),
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        channel_id: channel.channel_number,
        quantity: item.quantity,
        volume_ml: item.volume_ml,
        unit_price: unitPrice,
        total_price: lineTotal,
      });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AQ-${dateStr}-${randSuffix}`;

    const now = new Date();
    // Order expires in 15 minutes if unpaid
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_name: params.customer_name || 'Valued Customer',
      machine_id: machine.id,
      machine_code: machine.machine_code,
      items: orderItems,
      amount: totalAmount,
      currency: 'INR',
      payment_status: 'PENDING',
      order_status: 'CREATED',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      expires_at: expiresAt,
    };

    const saved = await this.db.createOrder(newOrder);
    realtimeHub.notifyOrderStatus(saved.id, saved.order_status, { order: saved });
    return saved;
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.db.getOrderById(id);
  }

  async updateStatus(orderId: string, status: OrderStatus, dispensedAt?: string): Promise<Order | null> {
    const updated = await this.db.updateOrderStatus(orderId, status, dispensedAt);
    if (updated) {
      realtimeHub.notifyOrderStatus(orderId, status, { order: updated });
    }
    return updated;
  }
}

export const orderService = new OrderService();
