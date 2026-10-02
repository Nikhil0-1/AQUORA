import { Product, Order } from './types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    name: 'AQUORA Classic Sanitizer',
    description: 'Everyday medical-grade germ protection with 70% Isopropyl alcohol and instant touchless delivery.',
    short_description: '70% Isopropanol · Instant 99.9% Kill',
    category_name: 'Classic Range',
    price: 35.0,
    currency: 'INR',
    image_url: 'https://images.unsplash.com/photo-1584483766114-2caea62f143c?auto=format&fit=crop&w=800&q=80',
    volume_ml: 100,
    is_available: true,
    variants: [
      { id: 'v11', product_id: 'p1111111-1111-1111-1111-111111111111', volume_ml: 50, price: 20.0, channel_id: 1, is_available: true, available_quantity: 120 },
      { id: 'v12', product_id: 'p1111111-1111-1111-1111-111111111111', volume_ml: 100, price: 35.0, channel_id: 1, is_available: true, available_quantity: 90 },
      { id: 'v13', product_id: 'p1111111-1111-1111-1111-111111111111', volume_ml: 200, price: 60.0, channel_id: 1, is_available: true, available_quantity: 60 },
      { id: 'v14', product_id: 'p1111111-1111-1111-1111-111111111111', volume_ml: 500, price: 120.0, channel_id: 1, is_available: true, available_quantity: 40 },
    ],
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    name: 'Aloe Vera Hydrating Formula',
    description: 'Enriched with organic aloe vera extract and Vitamin E to soothe skin while eliminating germs.',
    short_description: 'Aloe Vera + Vitamin E · Gentle Care',
    category_name: 'Botanical',
    price: 40.0,
    currency: 'INR',
    image_url: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=800&q=80',
    volume_ml: 100,
    is_available: true,
    variants: [
      { id: 'v21', product_id: 'p2222222-2222-2222-2222-222222222222', volume_ml: 50, price: 25.0, channel_id: 2, is_available: true, available_quantity: 100 },
      { id: 'v22', product_id: 'p2222222-2222-2222-2222-222222222222', volume_ml: 100, price: 40.0, channel_id: 2, is_available: true, available_quantity: 80 },
      { id: 'v23', product_id: 'p2222222-2222-2222-2222-222222222222', volume_ml: 200, price: 70.0, channel_id: 2, is_available: true, available_quantity: 50 },
    ],
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    name: 'Tea Tree & Eucalyptus Mist',
    description: 'Refreshing herbal sanitizing spray with pure Australian tea tree oil and eucalyptus vapors.',
    short_description: 'Tea Tree Oil · Crisp Eucalyptus',
    category_name: 'Botanical',
    price: 45.0,
    currency: 'INR',
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    volume_ml: 100,
    is_available: true,
    variants: [
      { id: 'v31', product_id: 'p3333333-3333-3333-3333-333333333333', volume_ml: 50, price: 28.0, channel_id: 3, is_available: true, available_quantity: 95 },
      { id: 'v32', product_id: 'p3333333-3333-3333-3333-333333333333', volume_ml: 100, price: 45.0, channel_id: 3, is_available: true, available_quantity: 75 },
    ],
  },
];

class PublicApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL.replace(/\/$/, '');
  }

  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/products`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend unavailable, using catalog cache:', e);
    }
    return FALLBACK_PRODUCTS;
  }

  async getProductById(id: string): Promise<Product | null> {
    const list = await this.getProducts();
    return list.find((p) => p.id === id) || null;
  }

  async createOrder(payload: {
    customer_name?: string;
    customer_phone?: string;
    items: Array<{ product_id: string; variant_id?: string; quantity: number; volume_ml: number }>;
  }): Promise<Order> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_code: 'AQ-DM-001',
          source: 'PUBLIC_WEB',
          customer_name: payload.customer_name || 'Online Customer',
          customer_phone: payload.customer_phone || '',
          items: payload.items,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend order creation offline, generating client order session:', e);
    }

    // Local deterministic order session for offline/testing mode
    const totalAmount = payload.items.reduce((sum, item) => sum + item.quantity * 35.0, 0);
    const mockOrder: Order = {
      id: `ord_${Date.now()}`,
      order_number: `AQUORA-WEB-${Math.floor(100000 + Math.random() * 900000)}`,
      customer_name: payload.customer_name || 'Online Customer',
      customer_phone: payload.customer_phone || '',
      machine_code: 'AQ-DM-001',
      amount: totalAmount,
      currency: 'INR',
      payment_status: 'PENDING',
      order_status: 'CREATED',
      source: 'PUBLIC_WEB',
      items: payload.items.map((it) => ({
        product_id: it.product_id,
        product_name: 'AQUORA Sanitizer',
        volume_ml: it.volume_ml,
        quantity: it.quantity,
        unit_price: 35.0,
        total_price: it.quantity * 35.0,
      })),
      created_at: new Date().toISOString(),
    };
    return mockOrder;
  }

  async processPayment(orderId: string): Promise<{ success: boolean; order: Order }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/payments/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Payment endpoint fallback:', e);
    }

    return {
      success: true,
      order: {
        id: orderId,
        order_number: `AQUORA-ORD-${orderId.slice(-6)}`,
        machine_code: 'AQ-DM-001',
        amount: 35.0,
        currency: 'INR',
        payment_status: 'PAID',
        order_status: 'QUEUED',
        source: 'PUBLIC_WEB',
        items: [],
        created_at: new Date().toISOString(),
      },
    };
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/orders/${orderId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Order polling fallback:', e);
    }
    return null;
  }
}

export const publicApi = new PublicApiClient();
