import {
  HeartbeatRequest,
  HeartbeatResponse,
  DispenseStartRequest,
  DispenseStartResponse,
  DispenseProgressReport,
  DispenseCompleteReport,
  DispenseFailReport,
  JobAccept,
} from '@aquora/machine-protocol';
import { getDatabase } from '../db';
import { realtimeHub } from '../websocket';

export class MachineService {
  private db = getDatabase();

  /**
   * Process periodic machine heartbeat from ESP32 or simulator
   */
  async handleHeartbeat(payload: any): Promise<HeartbeatResponse> {
    const machineCode = payload.machine_id || payload.machine_code || 'AQ-DM-001';
    await this.db.updateMachineHeartbeat(machineCode, undefined, payload.machine_state || payload.state);

    await this.db.recordMachineTelemetry({
      id: machineCode + '-' + Date.now(),
      machine_id: machineCode,
      machine_code: machineCode,
      timestamp: payload.timestamp || new Date().toISOString(),
      firmware_version: payload.firmware_version || '1.0.0',
      uptime_seconds: payload.uptime || payload.uptime_seconds || 0,
      wifi_rssi_dbm: payload.wifi_rssi || payload.wifi_rssi_dbm || -50,
      state: payload.machine_state || payload.state || 'IDLE',
      channel_states: payload.pump_states || payload.channel_states || {},
      active_job_id: payload.active_job_id,
      free_heap_bytes: payload.free_heap_bytes,
    });

    realtimeHub.notifyMachineTelemetry({
      machine_code: machineCode,
      state: payload.machine_state || payload.state,
      wifi_rssi: payload.wifi_rssi || payload.wifi_rssi_dbm,
      uptime: payload.uptime || payload.uptime_seconds,
      pump_states: payload.pump_states,
      flow_sensor_states: payload.flow_sensor_states,
    });

    return {
      success: true,
      server_time: new Date().toISOString(),
      command: 'NONE',
    };
  }

  async getNextJobForMachine(machineCode: string): Promise<any | null> {
    // Check if there is an active queued job for this machine
    const jobs = (this.db as any).dispenseJobs || [];
    const pendingJob = jobs.find(
      (j: any) => j.machine_id === machineCode && (j.status === 'QUEUED' || j.status === 'AUTHORIZED')
    );
    if (!pendingJob) return null;

    const order = await this.db.getOrderById(pendingJob.order_id);
    return {
      job_id: pendingJob.id,
      order_id: pendingJob.order_id,
      order_number: order?.order_number,
      machine_id: machineCode,
      channel: pendingJob.channel_id,
      product_id: pendingJob.product_id,
      target_volume_ml: pendingJob.target_volume_ml,
      protocol_version: 1,
      created_at: pendingJob.created_at || new Date().toISOString(),
      expires_at: pendingJob.expires_at || new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      signature: pendingJob.signature || 'sha256_valid_sig',
    };
  }

  async handleJobAccept(payload: JobAccept): Promise<{ success: boolean; status: string }> {
    await this.db.updateDispenseJobStatus(payload.job_id, 'AUTHORIZED');
    return { success: true, status: 'ACCEPTED' };
  }

  async handleDispenseStart(payload: DispenseStartRequest): Promise<DispenseStartResponse> {
    const job = (this.db as any).dispenseJobs?.find((j: any) => j.id === payload.job_id);
    const orderId = job ? job.order_id : payload.job_id;

    await this.db.updateOrderStatus(orderId, 'DISPENSING');
    await this.db.updateDispenseJobStatus(payload.job_id, 'DISPENSING');

    await this.db.recordMachineEvent({
      machine_id: payload.machine_id,
      machine_code: payload.machine_code,
      event_type: 'DISPENSING_STARTED',
      details: {
        order_id: orderId,
        job_id: payload.job_id,
        channel_number: payload.channel_number,
        target_volume_ml: payload.target_volume_ml,
      },
    });

    realtimeHub.notifyOrderStatus(orderId, 'DISPENSING', {
      channel_number: payload.channel_number,
      target_volume_ml: payload.target_volume_ml,
    });

    return {
      success: true,
      acknowledged: true,
      job_status: 'DISPENSING',
    };
  }

  /**
   * ESP32 reports live flow sensor telemetry & progress (pulses converted to ml)
   */
  async handleDispenseProgress(payload: DispenseProgressReport): Promise<void> {
    const job = (this.db as any).dispenseJobs?.find((j: any) => j.id === payload.job_id);
    const orderId = job ? job.order_id : payload.job_id;

    realtimeHub.notifyDispenseProgress(orderId, {
      percentage: payload.percentage,
      dispensed_volume_ml: payload.dispensed_volume_ml,
      target_volume_ml: payload.target_volume_ml,
      flow_rate_ml_s: payload.flow_rate_ml_s,
      elapsed_seconds: payload.elapsed_seconds,
    });
  }

  /**
   * ESP32 reports physical dispensing successfully completed!
   * Section 111: Idempotency check ensures duplicate complete calls never double-deduct or double-dispense.
   */
  async handleDispenseComplete(payload: DispenseCompleteReport): Promise<{ success: boolean; job_status: string }> {
    const nowIso = payload.timestamp || new Date().toISOString();
    const job = (this.db as any).dispenseJobs?.find((j: any) => j.id === payload.job_id);
    const orderId = job ? job.order_id : payload.job_id;

    const order = await this.db.getOrderById(orderId);
    if (order && order.order_status === 'DISPENSED') {
      console.log(`[IDEMPOTENCY] Dispense complete already recorded for order ${orderId}`);
      return { success: true, job_status: 'DISPENSED' };
    }

    // 1. Mark Order and Job as DISPENSED
    await this.db.updateOrderStatus(orderId, 'DISPENSED', nowIso);
    await this.db.updateDispenseJobStatus(payload.job_id, 'COMPLETED', nowIso);

    // 2. Deduct stock from machine inventory
    await this.db.deductInventory(payload.machine_id, payload.channel_number, payload.final_volume_ml);

    // 3. Record event
    await this.db.recordMachineEvent({
      machine_id: payload.machine_id,
      machine_code: payload.machine_code,
      event_type: 'DISPENSING_COMPLETED',
      details: {
        order_id: orderId,
        channel_number: payload.channel_number,
        final_volume_ml: payload.final_volume_ml,
        duration_seconds: payload.duration_seconds,
        total_pulses: payload.total_pulses,
      },
    });

    realtimeHub.notifyOrderStatus(orderId, 'DISPENSED', {
      final_volume_ml: payload.final_volume_ml,
      dispensed_at: nowIso,
    });

    return {
      success: true,
      job_status: 'DISPENSED',
    };
  }

  /**
   * ESP32 reports hardware fault or dispensing abort
   */
  async handleDispenseFail(payload: DispenseFailReport): Promise<void> {
    const job = (this.db as any).dispenseJobs?.find((j: any) => j.id === payload.job_id);
    const orderId = job ? job.order_id : payload.job_id;

    await this.db.updateOrderStatus(orderId, 'FAILED');
    await this.db.updateDispenseJobStatus(payload.job_id, 'FAILED');

    await this.db.recordMachineError({
      machine_id: payload.machine_id,
      machine_code: payload.machine_code,
      error_code: payload.error_code,
      severity: 'CRITICAL',
      message: payload.error_message,
      channel_number: payload.channel_number,
    });

    realtimeHub.notifyOrderStatus(orderId, 'FAILED', {
      error_code: payload.error_code,
      error_message: payload.error_message,
      dispensed_so_far_ml: payload.dispensed_so_far_ml,
    });
  }

  async handleTelemetry(telemetry: any): Promise<void> {
    await this.db.recordMachineTelemetry({
      id: telemetry.machine_id + '-' + Date.now(),
      machine_id: telemetry.machine_id,
      machine_code: telemetry.machine_id,
      timestamp: telemetry.timestamp || new Date().toISOString(),
      firmware_version: telemetry.firmware_version || '1.0.0',
      uptime_seconds: telemetry.uptime || 0,
      wifi_rssi_dbm: telemetry.wifi_rssi || -50,
      state: telemetry.state || 'IDLE',
      channel_states: telemetry.pump_states || {},
      active_job_id: telemetry.job_id,
      free_heap_bytes: 0,
    });
  }

  async handleMachineError(errorData: any): Promise<void> {
    await this.db.recordMachineError({
      machine_id: errorData.machine_id,
      machine_code: errorData.machine_id,
      error_code: errorData.error_code || 'UNKNOWN_ERROR',
      severity: 'CRITICAL',
      message: errorData.message || 'Machine error reported',
      channel_number: errorData.channel,
    });
  }
}

export const machineService = new MachineService();
