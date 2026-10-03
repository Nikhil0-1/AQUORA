/**
 * AQUORA Shared Types — Local copy for standalone frontend builds
 * Mirrors the types from @aquora/shared-types
 */

export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'QUEUED'
  | 'AUTHORIZED'
  | 'DISPENSING'
  | 'DISPENSED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type DispenseJobStatus =
  | 'QUEUED'
  | 'AUTHORIZED'
  | 'STARTED'
  | 'DISPENSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export type MachineStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR' | 'DISABLED';

export type StockLevelStatus = 'GOOD' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';

export interface ProductVariant {
  id: string;
  product_id: string;
  volume_ml: number;
  price: number;
  channel_id: number;
  is_available: boolean;
  is_archived?: boolean;
  available_quantity?: number;
  display_order?: number;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  short_description?: string;
  category_id: string;
  category_name?: string;
  price: number;
  currency: string;
  image_url: string;
  volume_ml?: number;
  variants?: ProductVariant[];
  ingredients?: string[];
  is_available: boolean;
  is_archived?: boolean;
  is_featured?: boolean;
  display_order?: number;
  channel_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MachineChannel {
  channel_number: number;
  product_id: string | null;
  product_name?: string;
  is_active: boolean;
  gpio_pin: number;
  flow_sensor_pin: number;
  current_level_ml: number;
  max_capacity_ml: number;
  stock_status: StockLevelStatus;
  calibration_factor: number;
}

export interface Machine {
  id: string;
  machine_code: string;
  name: string;
  location: string;
  status: MachineStatus;
  firmware_version: string;
  ip_address?: string | null;
  last_seen: string;
  created_at: string;
  updated_at: string;
  channels: MachineChannel[];
}

export interface InventoryItem {
  id: string;
  machine_id: string;
  machine_code?: string;
  channel_number: number;
  product_id: string;
  product_name?: string;
  current_volume_ml: number;
  max_volume_ml: number;
  low_threshold_ml: number;
  critical_threshold_ml?: number;
  status: StockLevelStatus;
  last_refilled_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  channel_id?: number;
  quantity: number;
  volume_ml: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  machine_id: string;
  machine_code: string;
  items: OrderItem[];
  amount: number;
  currency: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  source?: 'SYSTEM_1_TERMINAL' | 'PUBLIC_WEB';
  qr_token?: string;
  dispensed_at?: string | null;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

export interface MachineTelemetry {
  id: string;
  machine_id: string;
  machine_code: string;
  timestamp: string;
  firmware_version: string;
  uptime_seconds: number;
  wifi_rssi_dbm: number;
  state: string;
}

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'TECHNICIAN';

export interface AdminUser {
  id: string;
  firebase_uid: string;
  email: string;
  display_name?: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
