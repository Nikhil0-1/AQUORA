import { z } from 'zod';

export const NutritionSchema = z.object({
  calories: z.number().nonnegative(),
  sugar_g: z.number().nonnegative(),
  vitamin_c_mg: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fat_g: z.number().nonnegative(),
  protein_g: z.number().nonnegative(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(5),
  short_description: z.string().min(2).max(200),
  category_id: z.string().min(1),
  price: z.number().positive(),
  discount_price: z.number().positive().nullable().optional(),
  currency: z.string().default('INR'),
  image_url: z.string(),
  model_3d_url: z.string().nullable().optional(),
  volume_ml: z.number().positive(),
  ingredients: z.array(z.string()).min(1),
  nutrition: NutritionSchema,
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  channel_id: z.number().int().min(1).max(5),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const CreateOrderSchema = z.object({
  terminal_code: z.string().min(2).optional().default('AQ-PT-001'),
  machine_code: z.string().min(2).default('AQ-DM-001'),
  customer_name: z.string().min(1).optional(),
  customer_phone: z.string().min(5).optional(),
  customer_email: z.string().email().optional(),
  items: z.array(
    z.object({
      product_id: z.string().min(1),
      quantity: z.number().int().positive().max(5).default(1),
      volume_ml: z.number().positive().default(100),
      channel_id: z.number().int().min(1).max(5).optional(),
      unit_price: z.number().positive().optional(),
    })
  ).min(1),
});

export const ProcessPaymentSchema = z.object({
  order_id: z.string().min(1),
  provider: z.enum(['RAZORPAY', 'CASHFREE', 'PAYU', 'UPI_MOCK']).default('RAZORPAY'),
  amount: z.number().positive().optional(),
});

export const PaymentWebhookSchema = z.object({
  event: z.string().min(1),
  payment_id: z.string().min(1),
  order_id: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  signature: z.string().min(1),
});

export const MachineAuthSchema = z.object({
  machine_id: z.string().min(1),
  api_key: z.string().min(1),
  timestamp: z.string().optional(),
});

export const JobAcceptSchema = z.object({
  job_id: z.string().min(1),
  machine_id: z.string().min(1),
  status: z.literal('ACCEPTED'),
});

export const JobStartSchema = z.object({
  job_id: z.string().min(1),
  machine_id: z.string().min(1),
  channel: z.number().int().min(1).max(5),
  started_at: z.string().optional(),
});

export const JobProgressSchema = z.object({
  job_id: z.string().min(1),
  machine_id: z.string().min(1),
  channel: z.number().int().min(1).max(5),
  target_volume_ml: z.number().positive(),
  dispensed_volume_ml: z.number().nonnegative(),
  flow_rate_ml_s: z.number().nonnegative().optional().default(0),
  percentage: z.number().min(0).max(100),
  elapsed_ms: z.number().nonnegative().optional(),
});

export const JobCompleteSchema = z.object({
  job_id: z.string().min(1),
  machine_id: z.string().min(1),
  channel: z.number().int().min(1).max(5),
  final_volume_ml: z.number().positive(),
  total_pulses: z.number().int().nonnegative(),
  duration_ms: z.number().nonnegative().optional(),
  completed_at: z.string().optional(),
});

export const JobFailSchema = z.object({
  job_id: z.string().min(1),
  machine_id: z.string().min(1),
  channel: z.number().int().min(1).max(5),
  dispensed_so_far_ml: z.number().nonnegative().default(0),
  error_code: z.string().min(1),
  error_message: z.string().min(1),
  failed_at: z.string().optional(),
});

export const MachineHeartbeatSchema = z.object({
  machine_id: z.string().min(1),
  firmware_version: z.string(),
  protocol_version: z.number().int().default(1),
  uptime: z.number().int().nonnegative(),
  wifi_status: z.boolean().default(true),
  wifi_rssi: z.number(),
  machine_state: z.string(),
  pump_states: z.array(z.boolean()).length(5),
  flow_sensor_states: z.array(z.boolean()).length(5).optional(),
  error_code: z.string().nullable().optional(),
  timestamp: z.string().optional(),
});

export const MachineTelemetrySchema = z.object({
  machine_id: z.string().min(1),
  wifi_rssi: z.number(),
  state: z.string(),
  pump_states: z.array(z.boolean()).length(5),
  flow_pulses: z.array(z.number()).length(5),
  current_volume: z.number().nonnegative(),
  job_id: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  uptime: z.number().int().nonnegative(),
  firmware_version: z.string(),
  timestamp: z.string().optional(),
});

export const MachineErrorSchema = z.object({
  machine_id: z.string().min(1),
  job_id: z.string().optional(),
  error_code: z.string().min(1),
  message: z.string().min(1),
  channel: z.number().int().min(1).max(5).optional(),
  timestamp: z.string().optional(),
});

export const CalibrationSchema = z.object({
  machine_code: z.string().min(1),
  channel_number: z.number().int().min(1).max(5),
  pulse_count: z.number().int().positive(),
  test_volume_ml: z.number().positive(),
  measured_volume_ml: z.number().positive(),
  calibration_factor: z.number().positive(),
  operator: z.string().default('ADMIN'),
});

// Backward compatible aliases
export const QRValidateRequestSchema = z.object({
  machine_id: z.string().min(1),
  machine_code: z.string().min(2),
  token: z.string().min(8),
  scanned_at: z.string().datetime().optional().default(() => new Date().toISOString()),
});

export const DispenseStartRequestSchema = JobStartSchema.extend({
  target_volume_ml: z.number().positive().optional(),
});
export const DispenseProgressReportSchema = JobProgressSchema;
export const DispenseCompleteReportSchema = JobCompleteSchema;
export const DispenseFailReportSchema = JobFailSchema;
