import React, { useState, useEffect } from 'react';
import { Machine } from '@aquora/shared-types';
import { api } from '@aquora/api-client';
import { 
  Sliders, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  FlaskConical, 
  Info, 
  RefreshCw,
  Calculator
} from 'lucide-react';

interface Props {
  machine: Machine | null;
  initialChannel?: number;
  onRefresh: () => void;
}

export function AdminCalibrationManager({ machine, initialChannel = 1, onRefresh }: Props) {
  const [selectedChannel, setSelectedChannel] = useState<number>(initialChannel);
  const [testVolume, setTestVolume] = useState<number>(100);
  const [measuredVolume, setMeasuredVolume] = useState<number>(100);
  const [measuredPulses, setMeasuredPulses] = useState<number>(1000);
  const [mode, setMode] = useState<'VOLUME_RATIO' | 'PULSE_COUNT'>('VOLUME_RATIO');
  const [isPhysicallyVerified, setIsPhysicallyVerified] = useState<boolean>(false);
  const [operatorName, setOperatorName] = useState<string>('ADMIN');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [calibrationHistory, setCalibrationHistory] = useState<any[]>([]);

  const machineCode = machine?.machine_code || 'AQ-DM-001';
  const targetChannelObj = machine?.channels.find((c) => c.channel_number === selectedChannel);
  const currentFactor = targetChannelObj?.calibration_factor || 10.0;

  // Compute calculated factor
  let computedFactor = currentFactor;
  if (mode === 'VOLUME_RATIO') {
    if (measuredVolume > 0) {
      computedFactor = Number((currentFactor * (testVolume / measuredVolume)).toFixed(2));
    }
  } else {
    if (measuredVolume > 0 && measuredPulses > 0) {
      computedFactor = Number((measuredPulses / measuredVolume).toFixed(2));
    }
  }

  const fetchCalibrations = async () => {
    try {
      const data = await api.getCalibrations(machineCode);
      setCalibrationHistory(data || []);
    } catch (err) {
      console.warn('Failed to load calibrations:', err);
    }
  };

  useEffect(() => {
    fetchCalibrations();
  }, [machineCode]);

  useEffect(() => {
    if (initialChannel && initialChannel >= 1 && initialChannel <= 5) {
      setSelectedChannel(initialChannel);
    }
  }, [initialChannel]);

  const handleSaveCalibration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (measuredVolume <= 0) {
      setErrorMsg('Measured volume must be greater than 0 ml.');
      return;
    }
    if (computedFactor < 1.0 || computedFactor > 100.0) {
      setErrorMsg('Computed factor is outside the safe operating range (1.0 to 100.0 pulses/ml). Please check measurements.');
      return;
    }

    setSaving(true);
    try {
      await api.saveCalibration({
        machine_code: machineCode,
        channel_number: selectedChannel,
        pulse_count: mode === 'PULSE_COUNT' ? measuredPulses : Math.round(testVolume * currentFactor),
        test_volume_ml: testVolume,
        measured_volume_ml: measuredVolume,
        calibration_factor: computedFactor,
        operator: operatorName || 'ADMIN',
        is_verified: isPhysicallyVerified,
      });

      setSuccessMsg(
        `Channel ${selectedChannel} calibration updated! Factor: ${computedFactor} pulses/ml [${
          isPhysicallyVerified ? 'PHYSICALLY VERIFIED' : 'CONFIGURED'
        }]`
      );
      onRefresh();
      fetchCalibrations();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save calibration factor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Flow Sensor Pulse Calibration</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure pulses/ml per liquid viscosity channel with hardware safety interlock compliance.
          </p>
        </div>

        <button
          onClick={fetchCalibrations}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          title="Refresh calibration logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Mandatory Safety Notice Banner (Requirement 17) */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3.5 backdrop-blur-md">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed space-y-1">
          <span className="font-bold text-amber-300 uppercase tracking-wider block text-sm">
            🛡️ Hardware Safety Interlocks Active During Calibration
          </span>
          <p>
            Flow calibration is executed strictly server-authoritative and <strong>NEVER bypasses</strong>:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-mono text-[11px] text-amber-300 pt-1">
            <div>✓ E-Stop (GPIO 36 Pull-Up)</div>
            <div>✓ Single Pump Mutual Exclusion</div>
            <div>✓ Max Dispense Limit (1000ml)</div>
            <div>✓ 3s No-Flow Auto Shutoff</div>
            <div>✓ Hardware Watchdog (8s)</div>
            <div>✓ Machine Authentication Secret</div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Calibration Interactive Editor & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              Per-Channel Pulse Calculation
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Controller: <span className="text-white font-bold">{machineCode}</span>
            </span>
          </div>

          <form onSubmit={handleSaveCalibration} className="space-y-4 text-xs">
            {/* Target Channel */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Channel</label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
              >
                {[1, 2, 3, 4, 5].map((ch) => {
                  const chObj = machine?.channels.find((c) => c.channel_number === ch);
                  return (
                    <option key={ch} value={ch}>
                      Channel {ch} — {chObj?.product_name || `Formula CH${ch}`} (Current: {chObj?.calibration_factor || 10.0} pulses/ml)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Current vs Computed Factor Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block">CURRENT ACTIVE FACTOR</span>
                <span className="text-xl font-bold text-white">{currentFactor} pulses/ml</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">COMPUTED NEW FACTOR</span>
                <span className={`text-xl font-bold ${computedFactor > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {computedFactor} pulses/ml
                </span>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-4 pt-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="calMode"
                  checked={mode === 'VOLUME_RATIO'}
                  onChange={() => setMode('VOLUME_RATIO')}
                  className="text-cyan-500 focus:ring-0"
                />
                Volume Ratio (Target vs Measured)
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="calMode"
                  checked={mode === 'PULSE_COUNT'}
                  onChange={() => setMode('PULSE_COUNT')}
                  className="text-cyan-500 focus:ring-0"
                />
                Direct Pulses / Measured Volume
              </label>
            </div>

            {/* Inputs based on Mode */}
            <div className="grid grid-cols-2 gap-4">
              {mode === 'VOLUME_RATIO' ? (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Test Volume Dispensed (ml)</label>
                  <input
                    type="number"
                    value={testVolume}
                    onChange={(e) => setTestVolume(parseFloat(e.target.value) || 0)}
                    min="10"
                    max="1000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Measured Flow Pulses</label>
                  <input
                    type="number"
                    value={measuredPulses}
                    onChange={(e) => setMeasuredPulses(parseInt(e.target.value, 10) || 0)}
                    min="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Physical Measured Liquid (ml)</label>
                <input
                  type="number"
                  value={measuredVolume}
                  onChange={(e) => setMeasuredVolume(parseFloat(e.target.value) || 0)}
                  min="1"
                  max="1500"
                  step="0.5"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Verification Status (Requirement 16) */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPhysicallyVerified}
                  onChange={(e) => setIsPhysicallyVerified(e.target.checked)}
                  className="mt-0.5 rounded text-cyan-500 focus:ring-0"
                />
                <div>
                  <span className="font-bold text-white block">Physically Verified on Dispenser Hardware</span>
                  <span className="text-[11px] text-slate-400">
                    Check only if an operator physically caught and measured liquid volume using a graduated measuring cylinder. Unchecked entries are marked as <strong>CONFIGURED (NOT PHYSICALLY VERIFIED)</strong>.
                  </span>
                </div>
              </label>
            </div>

            {/* Operator Signature */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Operator Signature / Name</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="e.g. Lead Technician"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              {saving ? 'Saving...' : `Save Channel ${selectedChannel} Calibration (${computedFactor} p/ml)`}
            </button>
          </form>
        </div>

        {/* Channels Calibration Overview Sidebar */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-white">All Channels Calibration</h4>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((ch) => {
                const chObj = machine?.channels.find((c) => c.channel_number === ch);
                return (
                  <div
                    key={ch}
                    onClick={() => setSelectedChannel(ch)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      selectedChannel === ch
                        ? 'bg-slate-950 border-amber-500/60'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-cyan-400">CH {ch}</span>
                      <span className="font-mono text-amber-300 font-bold">
                        {chObj?.calibration_factor || 10.0} p/ml
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-1">
                      {chObj?.product_name || `Formula CH${ch}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Calibration History Table */}
      {calibrationHistory.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h4 className="font-bold text-white mb-4 text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Calibration History & Verification Audit
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Calibration Factor</th>
                  <th className="py-2.5 px-3">Test Vol</th>
                  <th className="py-2.5 px-3">Measured Vol</th>
                  <th className="py-2.5 px-3">Verification</th>
                  <th className="py-2.5 px-3">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {calibrationHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-300">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">CH{item.channel_number}</td>
                    <td className="py-2.5 px-3 text-amber-300 font-bold">{item.calibration_factor} p/ml</td>
                    <td className="py-2.5 px-3 text-slate-400">{item.test_volume_ml} ml</td>
                    <td className="py-2.5 px-3 text-slate-300">{item.measured_volume_ml} ml</td>
                    <td className="py-2.5 px-3">
                      {item.is_verified ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                          PHYSICALLY VERIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-950 border border-amber-800 text-amber-400 font-bold">
                          CONFIGURED (NOT PHYSICALLY VERIFIED)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{item.operator || 'ADMIN'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
