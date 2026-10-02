import {
  Product,
  Category,
  Order,
  Machine,
  InventoryItem,
  MachineTelemetry,
} from '@aquora/shared-types';
import {
  HeartbeatRequest,
  HeartbeatResponse,
  DispenseStartRequest,
  DispenseStartResponse,
  DispenseProgressReport,
  DispenseCompleteReport,
  DispenseFailReport,
} from '@aquora/machine-protocol';

export class AquoraApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(errorBody.message || `API error: ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  // --- Customer & Public API ---
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/api/v1/products');
  }

  async getProductById(id: string): Promise<Product> {
    return this.request<Product>(`/api/v1/products/${id}`);
  }

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/v1/categories');
  }

  async getMachineByCode(code: string): Promise<Machine> {
    return this.request<Machine>(`/api/v1/machines/${code}`);
  }

  async createOrder(payload: {
    machine_code: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    items: Array<{ product_id: string; quantity: number; volume_ml: number }>;
  }): Promise<Order> {
    return this.request<Order>('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getOrder(orderId: string): Promise<Order> {
    return this.request<Order>(`/api/v1/orders/${orderId}`);
  }

  async processMockPayment(payload: {
    order_id?: string;
    job_id?: string;
    simulate_result?: 'SUCCESS' | 'FAILURE';
    payment_method?: string;
  }): Promise<{ success: boolean; order: Order; qr_token_string?: string }> {
    return this.request('/api/v1/payments/process', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Machine & Simulator API ---
  async machineHeartbeat(payload: HeartbeatRequest): Promise<HeartbeatResponse> {
    return this.request<HeartbeatResponse>('/api/v1/machine/heartbeat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async machineDispenseStart(payload: DispenseStartRequest): Promise<DispenseStartResponse> {
    return this.request<DispenseStartResponse>('/api/v1/machine/dispense/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async machineDispenseProgress(payload: DispenseProgressReport): Promise<{ received: boolean }> {
    return this.request('/api/v1/machine/dispense/progress', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async machineDispenseComplete(payload: DispenseCompleteReport): Promise<{ success: boolean; order_status: string }> {
    return this.request('/api/v1/machine/dispense/complete', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async machineDispenseFail(payload: DispenseFailReport): Promise<{ received: boolean; order_status: string }> {
    return this.request('/api/v1/machine/dispense/fail', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Admin API ---
  async getAdminStats(): Promise<{
    revenue_today: number;
    orders_today: number;
    dispensed_today: number;
    failed_today: number;
    active_machines: number;
    offline_machines: number;
    low_stock_count: number;
    popular_sanitizers: Array<{ name: string; sales_count: number; revenue: number }>;
    hourly_trends: Array<{ hour: string; revenue: number; orders: number }>;
  }> {
    return this.request('/api/v1/admin/stats');
  }

  async getAdminOrders(): Promise<Order[]> {
    return this.request<Order[]>('/api/v1/admin/orders');
  }

  async getOrders(): Promise<Order[]> {
    return this.getAdminOrders();
  }

  async getAdminMachines(): Promise<Machine[]> {
    return this.request<Machine[]>('/api/v1/admin/machines');
  }

  async getMachines(): Promise<Machine[]> {
    return this.getAdminMachines();
  }

  async updateMachineChannel(machineId: string, channelNumber: number, payload: {
    product_id?: string | null;
    current_level_ml?: number;
    is_active?: boolean;
    calibration_factor?: number;
  }): Promise<Machine> {
    return this.request(`/api/v1/admin/machines/${machineId}/channels/${channelNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async getInventory(): Promise<InventoryItem[]> {
    return this.request<InventoryItem[]>('/api/v1/admin/inventory');
  }

  async refillInventory(inventoryId: string, amountMl: number): Promise<InventoryItem> {
    return this.request(`/api/v1/admin/inventory/${inventoryId}/refill`, {
      method: 'POST',
      body: JSON.stringify({ amount_ml: amountMl }),
    });
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    return this.request<Product>('/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/api/v1/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/v1/admin/products/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new AquoraApiClient();
