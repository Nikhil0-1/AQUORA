import { Product, Order } from './types';

// Authoritative AQUORA Cloud Backend on Supabase Edge Runtime
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL || 'https://vxcqywbycvasmjngolps.supabase.co/functions/v1/api';


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
    this.baseUrl = API_BASE_URL.replace(/\/+$/, '');
  }

  /**
   * Constructs the full request URL without duplicate /api prefixes.
   * If baseUrl already ends with /api (e.g. Supabase Edge function .../functions/v1/api)
   * and path starts with /api/, strips the redundant /api to produce .../functions/v1/api/v1/...
   */
  private buildUrl(path: string): string {
    const cleanBase = this.baseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (cleanBase.endsWith('/api') && cleanPath.startsWith('/api/')) {
      return `${cleanBase}${cleanPath.slice(4)}`;
    }
    return `${cleanBase}${cleanPath}`;
  }

  async checkBackendConnection(): Promise<boolean> {
    try {
      const res = await fetch(this.buildUrl('/health'), { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(this.buildUrl('/api/v1/products'));
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // In offline browsing only, show catalog cache
    }
    return FALLBACK_PRODUCTS;
  }

  async getProductById(id: string): Promise<Product | null> {
    const list = await this.getProducts();
    return list.find((p) => p.id === id) || null;
  }

  /**
   * Section 6: SERVER ORDER CREATION
   * Validates products, variants, quantities and stock on the live server.
   * NEVER generates fake orders or fake client order sessions.
   * If the backend is unavailable: Throws an error to STOP checkout.
   */
  async createOrder(payload: {
    customer_name?: string;
    customer_phone?: string;
    items: Array<{ product_id: string; variant_id?: string; quantity: number; volume_ml: number }>;
  }): Promise<Order> {
    let res: Response;
    try {
      res = await fetch(this.buildUrl('/api/v1/orders'), {
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
    } catch (netErr) {
      throw new Error('Payment service is temporarily unavailable. Please try again.');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Payment service is temporarily unavailable. Please try again.' }));
      throw new Error(err.message || 'Payment service is temporarily unavailable. Please try again.');
    }

    return await res.json();
  }

  /**
   * Section 7: RAZORPAY ORDER INITIATION
   * Real backend creates the authoritative Razorpay order.
   * NEVER creates fake order_test_* or simulated payment sessions.
   * If the backend is unavailable: Throws an error to STOP checkout.
   */
  async createPayment(orderId: string): Promise<{
    success: boolean;
    order_id: string;
    order_number: string;
    amount: number;
    amount_paise: number;
    currency: string;
    provider_order_id: string;
    razorpay_key_id: string;
    qr_code_data?: string;
  }> {
    let res: Response;
    try {
      res = await fetch(this.buildUrl('/api/v1/payments/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, provider: 'RAZORPAY' }),
      });
    } catch (netErr) {
      throw new Error('Payment service is temporarily unavailable. Please try again.');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Payment service is temporarily unavailable. Please try again.' }));
      throw new Error(err.message || 'Payment service is temporarily unavailable. Please try again.');
    }

    return await res.json();
  }

  /**
   * Section 10: Authoritative Cryptographic Payment Verification on Live Backend
   * Verifies Razorpay payment signature before any dispensing can be authorized.
   */
  async verifyPayment(payload: {
    order_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ success: boolean; order_id: string; payment_status: string; order_status: string; job_id?: string }> {
    let res: Response;
    try {
      res = await fetch(this.buildUrl('/api/v1/payments/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (netErr) {
      throw new Error('Payment verification failed on server: network unreachable.');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Payment verification failed on server.' }));
      throw new Error(err.message || 'Payment verification failed on server.');
    }

    return await res.json();
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const res = await fetch(this.buildUrl(`/api/v1/orders/${orderId}`));
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Order lookup error
    }
    return null;
  }

  async getOrderStatus(orderId: string): Promise<{
    order_id: string;
    order_number: string;
    payment_status: string;
    order_status: string;
    amount: number;
    currency: string;
    dispensed_at?: string | null;
    expires_at: string;
    is_expired: boolean;
  } | null> {
    try {
      const res = await fetch(this.buildUrl(`/api/v1/orders/${orderId}/status`));
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Order status lookup error
    }
    return null;
  }
}

export const publicApi = new PublicApiClient();
