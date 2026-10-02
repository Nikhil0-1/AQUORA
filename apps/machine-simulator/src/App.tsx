import React, { useEffect, useState, useRef } from 'react';
import { api } from '@aquora/api-client';
import { Cpu, Power, Activity, AlertTriangle, RefreshCw, Zap, Droplets, CheckCircle, ShieldAlert } from 'lucide-react';

const MACHINE_CODE = 'AQ-VM-001';
const MACHINE_ID = 'AQ-VM-001';

type LogEntry = { time: string; msg: string; type: 'info' | 'error' | 'hardware' | 'api' };

export default function App() {
  const [wifiConnected, setWifiConnected] = useState(true);
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [machineState, setMachineState] = useState<'IDLE' | 'DISPENSING' | 'ERROR' | 'SAFE_MODE'>('IDLE');
  
  // 5 Independent Tank channels
  const [channels, setChannels] = useState([
    { channel: 1, name: 'Classic Sanitizer', level: 4800, max: 5000, pumpActive: false, pulses: 0, flowFactor: 10 },
    { channel: 2, name: 'Aloe Vera Sanitizer', level: 4200, max: 5000, pumpActive: false, pulses: 0, flowFactor: 10 },
    { channel: 3, name: 'Herbal Sanitizer', level: 3900, max: 5000, pumpActive: false, pulses: 0, flowFactor: 10 },
    { channel: 4, name: 'Premium Sanitizer', level: 4500, max: 5000, pumpActive: false, pulses: 0, flowFactor: 10 },
    { channel: 5, name: 'Family Sanitizer', level: 4900, max: 5000, pumpActive: false, pulses: 0, flowFactor: 10 },
  ]);

  const [currentJob, setCurrentJob] = useState<{
    job_id: string;
    channel_number: number;
    target_volume_ml: number;
    dispensed_ml: number;
  } | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, type: 'info' | 'error' | 'hardware' | 'api' = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString('en-IN'), msg, type }].slice(-100));
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Initial boot log
  useEffect(() => {
    addLog('ESP32 Aquora Firmware v2.4.0 Boot completed', 'hardware');
    addLog('ALL PUMPS set LOW (Safety Guard Active)', 'hardware');
    addLog(`Wi-Fi connected to AQUORA-HOTSPOT (RSSI -58 dBm)`, 'info');
  }, []);

  // Periodic Heartbeat to Backend
  useEffect(() => {
    const heartbeatInterval = setInterval(async () => {
      if (!wifiConnected || emergencyStop) return;
      try {
        await api.machineHeartbeat({
          machine_id: MACHINE_ID,
          machine_code: MACHINE_CODE,
          firmware_version: 'v2.4.0-esp32',
          uptime_seconds: Math.floor(performance.now() / 1000),
          wifi_rssi_dbm: -58,
          state: machineState === 'SAFE_MODE' ? 'ERROR' : machineState,
          active_job_id: currentJob ? currentJob.job_id : undefined,
          free_heap_bytes: 245800,
        });
      } catch (err) {
        addLog(`Heartbeat failed: ${err}`, 'error');
      }
    }, 5000);

    return () => clearInterval(heartbeatInterval);
  }, [wifiConnected, emergencyStop, machineState, currentJob]);

  // Helper to ensure ONLY ONE PUMP IS ON at any time
  const activateSinglePump = (targetChannel: number) => {
    setChannels(prev => prev.map(ch => ({
      ...ch,
      pumpActive: ch.channel === targetChannel,
    })));
  };

  const deactivateAllPumps = () => {
    setChannels(prev => prev.map(ch => ({ ...ch, pumpActive: false })));
  };

  // Simulate execution of a dispensing job
  const simulateJobExecution = async (job: {
    job_id: string;
    channel_number: number;
    target_volume_ml: number;
  }) => {
    if (emergencyStop) {
      addLog('EMERGENCY STOP IS ACTIVE! Job rejected.', 'error');
      return;
    }

    // 1. Enforce strictly 1 pump at a time
    activateSinglePump(job.channel_number);
    setMachineState('DISPENSING');
    setCurrentJob({ ...job, dispensed_ml: 0 });

    addLog(`ESP32: Validating Job ${job.job_id} for Channel ${job.channel_number} (${job.target_volume_ml} ml)...`, 'hardware');
    
    // Send Start API Report
    try {
      await api.machineDispenseStart({
        machine_id: MACHINE_ID,
        machine_code: MACHINE_CODE,
        job_id: job.job_id,
        channel_number: job.channel_number,
        target_volume_ml: job.target_volume_ml,
        timestamp: new Date().toISOString(),
      });
      addLog(`API: Dispense start acknowledged for Job ${job.job_id}`, 'api');
    } catch (e) {
      addLog(`API dispense start failed: ${e}`, 'error');
    }

    const totalTarget = job.target_volume_ml;
    let currentDispensed = 0;
    const factor = channels.find(c => c.channel === job.channel_number)?.flowFactor || 10;
    const stepMl = 10; // 10 ml per tick

    const interval = setInterval(async () => {
      if (emergencyStop) {
        clearInterval(interval);
        deactivateAllPumps();
        setMachineState('SAFE_MODE');
        setCurrentJob(null);
        addLog('PUMP ABORTED: Emergency Stop Triggered!', 'error');
        await api.machineDispenseFail({
          machine_id: MACHINE_ID,
          machine_code: MACHINE_CODE,
          job_id: job.job_id,
          channel_number: job.channel_number,
          dispensed_so_far_ml: currentDispensed,
          error_code: 'ESTOP_TRIGGERED',
          error_message: 'Emergency Stop Pressed during dispensing',
        });
        return;
      }

      currentDispensed += stepMl;
      const pulsesAdded = stepMl * factor;

      setChannels(prev => prev.map(ch => {
        if (ch.channel === job.channel_number) {
          return {
            ...ch,
            level: Math.max(0, ch.level - stepMl),
            pulses: ch.pulses + pulsesAdded,
          };
        }
        return ch;
      }));

      setCurrentJob(prev => prev ? { ...prev, dispensed_ml: currentDispensed } : null);
      addLog(`Flow Sensor ${job.channel_number}: +${pulsesAdded} pulses -> ${currentDispensed}/${totalTarget} ml`, 'hardware');

      // Send progress to backend
      try {
        await api.machineDispenseProgress({
          machine_id: MACHINE_ID,
          machine_code: MACHINE_CODE,
          job_id: job.job_id,
          channel_number: job.channel_number,
          target_volume_ml: totalTarget,
          dispensed_volume_ml: currentDispensed,
          flow_rate_ml_s: 25.0,
          elapsed_seconds: currentDispensed / 25,
          percentage: Math.min(100, Math.round((currentDispensed / totalTarget) * 100)),
        });
      } catch (err) {
        addLog(`Progress report warning: ${err}`, 'error');
      }

      if (currentDispensed >= totalTarget) {
        clearInterval(interval);
        deactivateAllPumps();
        setMachineState('IDLE');
        addLog(`TARGET REACHED (${totalTarget} ml). PUMP ${job.channel_number} turned OFF automatically!`, 'hardware');

        try {
          await api.machineDispenseComplete({
            machine_id: MACHINE_ID,
            machine_code: MACHINE_CODE,
            job_id: job.job_id,
            channel_number: job.channel_number,
            final_volume_ml: totalTarget,
            duration_seconds: totalTarget / 25,
            total_pulses: totalTarget * factor,
            timestamp: new Date().toISOString(),
          });
          addLog(`API: Dispense Complete reported to Backend ✓`, 'api');
        } catch (err) {
          addLog(`Dispense complete report error: ${err}`, 'error');
        }

        setCurrentJob(null);
      }
    }, 400); // 400ms interval per step
  };

  const handleTestTriggerJob = (channelNum: number, volumeMl: number) => {
    if (machineState === 'DISPENSING') {
      alert('Machine is already dispensing! Only 1 pump can operate at a time.');
      return;
    }
    const testJob = {
      job_id: `SIM-JOB-${Date.now()}`,
      channel_number: channelNum,
      target_volume_ml: volumeMl,
    };
    simulateJobExecution(testJob);
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-slate-950 font-black">
            ESP
          </div>
          <div>
            <h1 className="text-lg font-bold flex items-center space-x-2">
              <span>ESP32 Hardware Simulator</span>
              <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-mono">
                {MACHINE_CODE}
              </span>
            </h1>
            <p className="text-xs text-slate-400">5-Channel Sanitizer Vending Machine Hardware Control</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Wi-Fi Toggle */}
          <button 
            onClick={() => setWifiConnected(!wifiConnected)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-2 ${wifiConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{wifiConnected ? 'Wi-Fi Online' : 'Wi-Fi Offline'}</span>
          </button>

          {/* Emergency Stop Button */}
          <button 
            onClick={() => {
              const nextState = !emergencyStop;
              setEmergencyStop(nextState);
              if (nextState) {
                deactivateAllPumps();
                setMachineState('SAFE_MODE');
                addLog('EMERGENCY STOP PRESSED: ALL PUMPS LOW', 'error');
              } else {
                setMachineState('IDLE');
                addLog('Emergency stop cleared: System reset to IDLE', 'info');
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 shadow-lg ${emergencyStop ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40' : 'bg-slate-800 text-rose-400 border border-rose-500/40 hover:bg-rose-500/20'}`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{emergencyStop ? 'E-STOP ACTIVE' : 'EMERGENCY STOP'}</span>
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
        
        {/* Left Column: 5 Channel Hardware Panels (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100">5 Hardware Dispensing Channels</h2>
                <p className="text-xs text-slate-400">Strictly 1 pump active at a time (MOSFET Relay Isolation)</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border font-mono ${machineState === 'DISPENSING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse' : machineState === 'SAFE_MODE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                State: {machineState}
              </span>
            </div>

            {/* 5 Channel Cards */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              {channels.map(ch => (
                <div key={ch.channel} className={`bg-slate-950 p-3 rounded-xl border transition-all flex flex-col justify-between ${ch.pumpActive ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10' : 'border-slate-800'}`}>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-cyan-400">CH {ch.channel}</span>
                      <span className={`w-2 h-2 rounded-full ${ch.pumpActive ? 'bg-amber-400 animate-ping' : 'bg-slate-700'}`} />
                    </div>
                    <div className="text-xs font-bold truncate text-slate-200 mb-2">{ch.name}</div>
                    
                    {/* Tank Level Bar */}
                    <div className="w-full bg-slate-900 h-24 rounded-lg border border-slate-800 p-0.5 flex flex-col justify-end overflow-hidden mb-2">
                      <div 
                        className={`w-full rounded transition-all duration-500 ${ch.pumpActive ? 'bg-gradient-to-t from-amber-500 to-amber-300' : 'bg-gradient-to-t from-cyan-600 to-cyan-400'}`}
                        style={{ height: `${(ch.level / ch.max) * 100}%` }}
                      />
                    </div>
                    
                    <div className="text-center font-mono text-[11px] text-slate-300 font-bold mb-1">
                      {ch.level} ml
                    </div>
                  </div>

                  <div className="space-y-1 text-[10px] font-mono text-slate-500">
                    <div className="flex justify-between">
                      <span>Pump:</span>
                      <span className={ch.pumpActive ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                        {ch.pumpActive ? 'HIGH' : 'LOW'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pulses:</span>
                      <span className="text-slate-400">{ch.pulses}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleTestTriggerJob(ch.channel, 100)}
                    disabled={machineState === 'DISPENSING' || emergencyStop}
                    className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-[11px] font-medium text-cyan-400 rounded-lg border border-slate-700 transition-colors"
                  >
                    Test 100ml
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Job Telemetry Bar */}
          {currentJob && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-amber-400 animate-spin" />
                <div>
                  <div className="font-bold text-amber-400">DISPENSING JOB IN PROGRESS</div>
                  <div className="text-slate-400 font-mono">
                    Job ID: {currentJob.job_id} | Channel {currentJob.channel_number}
                  </div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-lg font-bold text-amber-300">
                  {currentJob.dispensed_ml} / {currentJob.target_volume_ml} ml
                </div>
                <div className="text-slate-400 text-[10px]">Flow Sensor Pulse Counter Active</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Serial Monitor / ESP32 Logs (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden font-mono text-xs">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
            <span className="font-bold text-slate-300 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>ESP32 SERIAL MONITOR (115200 Baud)</span>
            </span>
            <button 
              onClick={() => setLogs([])}
              className="text-slate-500 hover:text-slate-300 text-[11px] transition-colors"
            >
              Clear Console
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-slate-950 text-slate-300">
            {logs.length === 0 ? (
              <div className="text-slate-600 italic py-8 text-center">Serial monitor initialized. Ready for events.</div>
            ) : (
              logs.map((l, i) => (
                <div key={i} className={`flex space-x-2 ${l.type === 'error' ? 'text-rose-400' : l.type === 'hardware' ? 'text-amber-300' : l.type === 'api' ? 'text-cyan-400' : 'text-slate-300'}`}>
                  <span className="text-slate-600 shrink-0">[{l.time}]</span>
                  <span className="break-all">{l.msg}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
}
