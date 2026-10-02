export interface ProductVariant {
  id: string;
  product_id: string;
  volume_ml: number;
  price: number;
  channel_id: number;
  is_available: boolean;
  available_quantity?: number;
  display_order?: number;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  short_description?: string;
  category_id?: string;
  category_name?: string;
  price: number;
  currency: string;
  image_url: string;
  volume_ml?: number;
  variants?: ProductVariant[];
  ingredients?: string[];
  is_available: boolean;
  is_featured?: boolean;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  volume_ml: number;
  quantity: number;
  unit_price: number;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  volume_ml: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  channel_id?: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  machine_code: string;
  amount: number;
  currency: string;
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  order_status: 'CREATED' | 'QUEUED' | 'AUTHORIZED' | 'DISPENSING' | 'DISPENSED' | 'FAILED' | 'CANCELLED';
  source: 'PUBLIC_WEB';
  qr_token?: string;
  items: OrderItem[];
  created_at: string;
  dispensed_at?: string | null;
}
