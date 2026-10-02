import { Router, Request, Response } from 'express';
import * as crypto from 'crypto';
import {
  MachineHeartbeatSchema,
  JobAcceptSchema,
  MachineTelemetrySchema,
  MachineErrorSchema,
} from '@aquora/validation';
import { machineService } from '../services/machine.service';
import { getDatabase } from '../db';

export const machineRouter = Router();

// POST /api/v1/machine/auth
machineRouter.post('/auth', async (req: Request, res: Response) => {
  try {
    const { machine_id, api_key } = req.body;
    if (!machine_id) {
      return res.status(400).json({ error: 'AUTH_FAILED', message: 'machine_id is required' });
    }

    const db = getDatabase();
    const machine = await db.getMachineByCode(machine_id);
    if (!machine) {
      return res.status(401).json({ error: 'AUTH_FAILED', message: 'Unknown machine ID' });
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');

    return res.json({
      success: true,
      token,
      machine_id: machine.machine_code,
      name: machine.name,
      protocol_version: 1,
      channels_count: machine.channels.length,
      server_time: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'AUTH_FAILED', message: error.message });
  }
});

// POST /api/v1/machine/heartbeat
machineRouter.post('/heartbeat', async (req: Request, res: Response) => {
  try {
    const result = await machineService.handleHeartbeat(req.body);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// GET /api/v1/machine/config
machineRouter.get('/config', async (req: Request, res: Response) => {
  try {
    const machineCode = (req.query.machine_id as string) || 'AQ-DM-001';
    const db = getDatabase();
    const machine = await db.getMachineByCode(machineCode);
    if (!machine) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Machine not found' });
    }

    return res.json({
      machine_id: machine.machine_code,
      name: machine.name,
      location: machine.location,
      protocol_version: 1,
      safety_limits: {
        max_single_dispense_ml: 1000,
        pump_timeout_seconds: 45,
        no_flow_timeout_seconds: 3,
        single_pump_interlock: true,
      },
      channels: machine.channels.map((c) => ({
        channel_number: c.channel_number,
        is_active: c.is_active,
        gpio_pin: c.gpio_pin,
        flow_sensor_pin: c.flow_sensor_pin,
        calibration_factor: c.calibration_factor,
        current_level_ml: c.current_level_ml,
        product_id: c.product_id,
        product_name: c.product_name,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// GET /api/v1/machine/jobs/next
machineRouter.get('/jobs/next', async (req: Request, res: Response) => {
  try {
    const machineCode = (req.query.machine_id as string) || 'AQ-DM-001';
    const job = await machineService.getNextJobForMachine(machineCode);
    if (!job) {
      return res.status(204).send(); // No job waiting
    }
    return res.json(job);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// POST /api/v1/machine/jobs/accept
machineRouter.post('/jobs/accept', async (req: Request, res: Response) => {
  try {
    const payload = JobAcceptSchema.parse(req.body);
    const result = await machineService.handleJobAccept({
      job_id: payload.job_id,
      machine_id: payload.machine_id,
      status: 'ACCEPTED',
      timestamp: new Date().toISOString(),
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// POST /api/v1/machine/jobs/start
machineRouter.post('/jobs/start', async (req: Request, res: Response) => {
  try {
    const result = await machineService.handleDispenseStart({
      machine_id: req.body.machine_id || 'AQ-DM-001',
      machine_code: req.body.machine_id || req.body.machine_code || 'AQ-DM-001',
      channel_number: Number(req.body.channel || req.body.channel_number || 1),
      job_id: req.body.job_id,
      target_volume_ml: Number(req.body.target_volume_ml || 100),
      timestamp: req.body.started_at || req.body.timestamp || new Date().toISOString(),
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// POST /api/v1/machine/jobs/progress
machineRouter.post('/jobs/progress', async (req: Request, res: Response) => {
  try {
    await machineService.handleDispenseProgress({
      machine_id: req.body.machine_id || 'AQ-DM-001',
      machine_code: req.body.machine_id || req.body.machine_code || 'AQ-DM-001',
      channel_number: Number(req.body.channel || req.body.channel_number || 1),
      job_id: req.body.job_id,
      target_volume_ml: Number(req.body.target_volume_ml || 100),
      dispensed_volume_ml: Number(req.body.dispensed_volume_ml || 0),
      flow_rate_ml_s: Number(req.body.flow_rate_ml_s || 0),
      elapsed_seconds: Number(req.body.elapsed_seconds || (req.body.elapsed_ms || 0) / 1000),
      percentage: Number(req.body.percentage || 0),
    });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// POST /api/v1/machine/jobs/complete
machineRouter.post('/jobs/complete', async (req: Request, res: Response) => {
  try {
    const result = await machineService.handleDispenseComplete({
      machine_id: req.body.machine_id || 'AQ-DM-001',
      machine_code: req.body.machine_id || req.body.machine_code || 'AQ-DM-001',
      channel_number: Number(req.body.channel || req.body.channel_number || 1),
      job_id: req.body.job_id,
      timestamp: req.body.completed_at || req.body.timestamp || new Date().toISOString(),
      final_volume_ml: Number(req.body.final_volume_ml || 100),
      duration_seconds: Number(req.body.duration_seconds || (req.body.duration_ms || 0) / 1000),
      total_pulses: Number(req.body.total_pulses || 0),
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// POST /api/v1/machine/jobs/fail
machineRouter.post('/jobs/fail', async (req: Request, res: Response) => {
  try {
    await machineService.handleDispenseFail({
      machine_id: req.body.machine_id || 'AQ-DM-001',
      machine_code: req.body.machine_id || req.body.machine_code || 'AQ-DM-001',
      channel_number: Number(req.body.channel || req.body.channel_number || 1),
      job_id: req.body.job_id,
      dispensed_so_far_ml: Number(req.body.dispensed_so_far_ml || 0),
      error_code: req.body.error_code || 'FLOW_ERROR',
      error_message: req.body.error_message || 'Dispensing failure',
    });
    return res.json({ success: true, order_status: 'FAILED' });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// POST /api/v1/machine/telemetry
machineRouter.post('/telemetry', async (req: Request, res: Response) => {
  try {
    await machineService.handleTelemetry(req.body);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// POST /api/v1/machine/errors
machineRouter.post('/errors', async (req: Request, res: Response) => {
  try {
    await machineService.handleMachineError(req.body);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// Legacy backward-compatible endpoints
machineRouter.post('/dispense/start', async (req: Request, res: Response) => {
  try {
    const result = await machineService.handleDispenseStart({
      machine_id: req.body.machine_id || 'AQ-DM-001',
      machine_code: req.body.machine_id || req.body.machine_code || 'AQ-DM-001',
      channel_number: Number(req.body.channel_number || req.body.channel || 1),
      job_id: req.body.job_id,
      target_volume_ml: Number(req.body.target_volume_ml || 100),
      timestamp: req.body.timestamp || new Date().toISOString(),
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

machineRouter.post('/dispense/progress', async (req: Request, res: Response) => {
  try {
    await machineService.handleDispenseProgress({
      machine_id: req.body.machine_id || 'AQ-DM-001',
      machine_code: req.body.machine_id || req.body.machine_code || 'AQ-DM-001',
      channel_number: Number(req.body.channel_number || req.body.channel || 1),
      job_id: req.body.job_id,
      target_volume_ml: Number(req.body.target_volume_ml || 100),
      dispensed_volume_ml: Number(req.body.dispensed_volume_ml || 0),
      flow_rate_ml_s: Number(req.body.flow_rate_ml_s || 0),
      elapsed_seconds: Number(req.body.elapsed_seconds || 0),
      percentage: Number(req.body.percentage || 0),
    });
    return res.json({ received: true });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

machineRouter.post('/dispense/complete', async (req: Request, res: Response) => {
  try {
    const result = await machineService.handleDispenseComplete({
      machine_id: req.body.machine_id || 'AQ-DM-001',
      machine_code: req.body.machine_id || req.body.machine_code || 'AQ-DM-001',
      channel_number: Number(req.body.channel_number || req.body.channel || 1),
      job_id: req.body.job_id,
      timestamp: req.body.timestamp || new Date().toISOString(),
      final_volume_ml: Number(req.body.final_volume_ml || 100),
      duration_seconds: Number(req.body.duration_seconds || 0),
      total_pulses: Number(req.body.total_pulses || 0),
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

machineRouter.post('/dispense/fail', async (req: Request, res: Response) => {
  try {
    await machineService.handleDispenseFail({
      machine_id: req.body.machine_id || 'AQ-DM-001',
      machine_code: req.body.machine_id || req.body.machine_code || 'AQ-DM-001',
      channel_number: Number(req.body.channel_number || req.body.channel || 1),
      job_id: req.body.job_id,
      dispensed_so_far_ml: Number(req.body.dispensed_so_far_ml || 0),
      error_code: req.body.error_code || 'FLOW_ERROR',
      error_message: req.body.error_message || 'Failure reported',
    });
    return res.json({ received: true, order_status: 'FAILED' });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});
