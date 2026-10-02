/**
 * Core Enums and Types for Smart Sanitizer Vending Platform
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

export type PumpMode = 'TIME_BASED' | 'FLOW_SENSOR' | 'CALIBRATED_HYBRID';

export interface NutritionInfo {
  calories: number; // kcal
  sugar_g: number;
  vitamin_c_mg: number;
  carbs_g: number;
  fat_g: number;
  protein_g: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  volume_ml: number;
  price: number;
  channel_id: number;
  dispensing_profile_id?: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string;
  category_name?: string;
  price: number; // base price or default
  currency: string;
  image_url: string;
  model_3d_url?: string | null;
  volume_ml?: number; // legacy/default
  variants?: ProductVariant[]; // The dynamic quantities available
  ingredients: string[];
  nutrition: NutritionInfo;
  is_available: boolean;
  is_featured: boolean;
  channel_id?: number; // legacy/default
  created_at: string;
  updated_at: string;
}

export interface MachineChannel {
  channel_number: number; // 1 to 5
  product_id: string | null;
  product_name?: string;
  is_active: boolean;
  gpio_pin: number;
  flow_sensor_pin: number;
  level_sensor_pin: number;
  current_level_ml: number;
  max_capacity_ml: number;
  stock_status: StockLevelStatus;
  calibration_factor: number; // pulses per ml
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

export interface DispensingProfile {
  id: string;
  name: string;
  channel_number: number;
  target_volume_ml: number;
  max_dispense_time_sec: number;
  pump_mode: PumpMode;
  calibration_factor: number;
  min_flow_rate_ml_s: number;
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
  critical_threshold_ml: number;
  status: StockLevelStatus;
  last_refilled_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  channel_id: number;
  quantity: number;
  volume_ml: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string; 
  order_number: string; 
  customer_id?: string | null;
  customer_name?: string;
  machine_id: string;
  machine_code: string;
  items: OrderItem[]; // Usually just 1 item in vending
  amount: number;
  currency: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  dispensed_at?: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface DispenseJob {
  id: string;
  order_id: string;
  machine_id: string;
  product_id: string;
  variant_id?: string;
  channel_id: number;
  target_volume_ml: number;
  dispensed_volume_ml: number;
  flow_rate: number;
  status: DispenseJobStatus;
  started_at?: string;
  completed_at?: string;
  error_code?: string;
  error_message?: string;
}

export interface PaymentIntent {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  client_secret: string;
  status: PaymentStatus;
  payment_method: string;
  created_at: string;
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
  channel_states: Record<number, { active: boolean; current_flow_ml: number; target_ml: number }>;
  active_order_id?: string | null;
  active_job_id?: string | null;
  system_temperature_c?: number;
  free_heap_bytes?: number;
}

export interface MachineEvent {
  id: string;
  machine_id: string;
  machine_code: string;
  event_type:
    | 'HEARTBEAT'
    | 'DISPENSE_AUTHORIZED'
    | 'DISPENSING_STARTED'
    | 'DISPENSING_PROGRESS'
    | 'DISPENSING_COMPLETED'
    | 'DISPENSING_FAILED'
    | 'HARDWARE_ERROR'
    | 'ESTOP_TRIGGERED';
  details: Record<string, any>;
  created_at: string;
}

export interface MachineError {
  id: string;
  machine_id: string;
  machine_code: string;
  error_code: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  channel_number?: number;
  created_at: string;
}
