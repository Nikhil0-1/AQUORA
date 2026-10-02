// Shared types for the Machine Protocol (HTTP & Realtime/WS)
// Specification: Version 1

export const PROTOCOL_VERSION = 1;

export enum ErrorCode {
  AUTH_FAILED = 'AUTH_FAILED',
  INVALID_JOB = 'INVALID_JOB',
  EXPIRED_JOB = 'EXPIRED_JOB',
  DUPLICATE_JOB = 'DUPLICATE_JOB',
  INVALID_MACHINE = 'INVALID_MACHINE',
  INVALID_CHANNEL = 'INVALID_CHANNEL',
  INVALID_VOLUME = 'INVALID_VOLUME',
  NO_CALIBRATION = 'NO_CALIBRATION',
  FLOW_ERROR = 'FLOW_ERROR',
  FLOW_SENSOR_ERROR = 'FLOW_SENSOR_ERROR',
  PUMP_TIMEOUT = 'PUMP_TIMEOUT',
  TANK_EMPTY = 'TANK_EMPTY',
  EMERGENCY_STOP = 'EMERGENCY_STOP',
  NETWORK_ERROR = 'NETWORK_ERROR',
  BACKEND_ERROR = 'BACKEND_ERROR',
  SAFE_MODE = 'SAFE_MODE',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
}

export type MachineStateType =
  | 'BOOT'
  | 'CONNECTING_WIFI'
  | 'AUTHENTICATING'
  | 'IDLE'
  | 'WAITING_FOR_JOB'
  | 'JOB_RECEIVED'
  | 'VALIDATING_JOB'
  | 'SAFETY_CHECK'
  | 'DISPENSING'
  | 'COMPLETING'
  | 'ERROR'
  | 'SAFE_MODE'
  | 'MAINTENANCE'
  | 'OFFLINE';

// Section 36 & 67: JobMessage
export interface JobMessage {
  job_id: string;
  order_id: string;
  machine_id: string;
  channel: number;
  product_id: string;
  target_volume_ml: number;
  protocol_version: number;
  created_at: string;
  expires_at: string;
  signature: string;
}

// Section 67: Job lifecycle protocol packets
export interface JobAccept {
  job_id: string;
  machine_id: string;
  timestamp: string;
  status: 'ACCEPTED';
}

export interface JobStart {
  job_id: string;
  machine_id: string;
  channel: number;
  started_at: string;
}

export interface JobProgress {
  job_id: string;
  machine_id: string;
  channel: number;
  target_volume_ml: number;
  dispensed_volume_ml: number;
  flow_rate_ml_s: number;
  percentage: number;
  elapsed_ms: number;
}

export interface JobComplete {
  job_id: string;
  machine_id: string;
  channel: number;
  final_volume_ml: number;
  total_pulses: number;
  duration_ms: number;
  completed_at: string;
}

export interface JobFail {
  job_id: string;
  machine_id: string;
  channel: number;
  dispensed_so_far_ml: number;
  error_code: ErrorCode | string;
  error_message: string;
  failed_at: string;
}

// Section 46 & 67: Heartbeat
export interface Heartbeat {
  machine_id: string;
  firmware_version: string;
  protocol_version: number;
  uptime: number;
  wifi_status: boolean;
  wifi_rssi: number;
  machine_state: MachineStateType | string;
  pump_states: [boolean, boolean, boolean, boolean, boolean];
  flow_sensor_states: [boolean, boolean, boolean, boolean, boolean];
  error_code: string | null;
  timestamp: string;
}

// Section 47 & 67: Telemetry
export interface Telemetry {
  machine_id: string;
  wifi_rssi: number;
  state: MachineStateType | string;
  pump_states: [boolean, boolean, boolean, boolean, boolean];
  flow_pulses: [number, number, number, number, number];
  current_volume: number;
  job_id: string | null;
  error: string | null;
  uptime: number;
  firmware_version: string;
  timestamp: string;
}

// Section 67: MachineError
export interface MachineError {
  machine_id: string;
  job_id?: string;
  error_code: ErrorCode | string;
  message: string;
  channel?: number;
  timestamp: string;
}

// Backward compatible aliases
export type HeartbeatRequest = {
  machine_id: string;
  machine_code: string;
  timestamp?: string;
  firmware_version: string;
  uptime_seconds: number;
  wifi_rssi_dbm: number;
  state: string;
  channel_states?: any;
  active_job_id?: string;
  free_heap_bytes: number;
};

export type HeartbeatResponse = {
  success: boolean;
  server_time: string;
  command: string;
};

export type DispenseStartRequest = {
  machine_id: string;
  machine_code: string;
  channel_number: number;
  job_id: string;
  target_volume_ml: number;
  timestamp: string;
};

export type DispenseStartResponse = {
  success: boolean;
  acknowledged?: boolean;
  job_status: string;
};

export type DispenseProgressReport = {
  machine_id: string;
  machine_code: string;
  channel_number: number;
  job_id: string;
  target_volume_ml: number;
  dispensed_volume_ml: number;
  flow_rate_ml_s: number;
  elapsed_seconds: number;
  percentage: number;
};

export type DispenseCompleteReport = {
  machine_id: string;
  machine_code: string;
  channel_number: number;
  job_id: string;
  timestamp: string;
  final_volume_ml: number;
  duration_seconds: number;
  total_pulses: number;
};

export type DispenseFailReport = {
  machine_id: string;
  machine_code: string;
  channel_number: number;
  job_id: string;
  dispensed_so_far_ml?: number;
  error_code: string;
  error_message: string;
};

export interface DispenseInstruction {
  channelId: number;
  volumeMl: number;
  durationMs: number;
}

export type ClientMessage =
  | { type: 'AUTH'; machineId: string; timestamp: number; payload: { secretKey: string } }
  | { type: 'STATUS_REPORT'; machineId: string; timestamp: number; payload: { status: string; temperature: number; inventory: { channelId: number; levelMl: number }[]; errors: any[] } }
  | { type: 'DISPENSE_STARTED'; machineId: string; timestamp: number; payload: { orderId: string } }
  | { type: 'DISPENSE_PROGRESS'; machineId: string; timestamp: number; payload: { orderId: string; dispensedMl: number; targetMl: number } }
  | { type: 'DISPENSE_COMPLETED'; machineId: string; timestamp: number; payload: { orderId: string } }
  | { type: 'DISPENSE_FAILED'; machineId: string; timestamp: number; payload: { orderId: string; reason: string } };

export type ServerMessage =
  | { type: 'AUTH_SUCCESS'; payload: { message: string } }
  | { type: 'AUTH_FAILED'; payload: { reason: string } }
  | { type: 'DISPENSE_COMMAND'; payload: { orderId: string; instructions: DispenseInstruction[] } };