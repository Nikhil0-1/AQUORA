/**
 * AQUORA API Client — Local copy for standalone frontend builds
 * Mirrors the functionality from @aquora/api-client
 */

import { Product, ProductVariant, Category, Order, Machine, InventoryItem } from './adminTypes';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL || '';

export class AquoraApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
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

  // --- Admin API ---
  async getAdminStats(): Promise<{
    revenue_today: number;
    orders_today: number;
    dispensed_today: number;
    failed_today: number;
    active_machines: number;
    offline_machines: number;
    low_stock_count: number;
  }> {
    return this.request('/api/v1/admin/stats');
  }

  async getAdminOrders(): Promise<Order[]> {
    return this.request<Order[]>('/api/v1/admin/orders');
  }

  async getAdminMachines(): Promise<Machine[]> {
    return this.request<Machine[]>('/api/v1/admin/machines');
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

  async getAdminProducts(): Promise<Product[]> {
    return this.request<Product[]>('/api/v1/admin/products');
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

  async deleteProduct(id: string): Promise<{ success: boolean; archived: boolean }> {
    return this.request(`/api/v1/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleProductAvailability(id: string): Promise<Product> {
    return this.request<Product>(`/api/v1/admin/products/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  // Variants API
  async createVariant(productId: string, variant: Partial<ProductVariant>): Promise<ProductVariant> {
    return this.request<ProductVariant>(`/api/v1/admin/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(variant),
    });
  }

  async updateVariant(productId: string, variantId: string, updates: Partial<ProductVariant>): Promise<ProductVariant> {
    return this.request<ProductVariant>(`/api/v1/admin/products/${productId}/variants/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteVariant(productId: string, variantId: string): Promise<{ success: boolean }> {
    return this.request(`/api/v1/admin/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
    });
  }

  // Inventory Adjustments & Audit Logs
  async adjustStock(payload: {
    machine_code: string;
    channel_number: number;
    action: 'ADD' | 'REDUCE' | 'SET';
    amount_ml: number;
    reason: string;
    actor_id?: string;
  }): Promise<InventoryItem> {
    return this.request<InventoryItem>('/api/v1/admin/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getInventoryLogs(machineCode?: string): Promise<any[]> {
    const q = machineCode ? `?machine_code=${machineCode}` : '';
    return this.request<any[]>(`/api/v1/admin/inventory/logs${q}`);
  }
}

export const api = new AquoraApiClient();
