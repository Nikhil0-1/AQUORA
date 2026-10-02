import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { api } from '../api';
import { 
  Droplet, 
  RefreshCw, 
  AlertTriangle, 
  Sliders, 
  Plus, 
  Minus, 
  Check, 
  History, 
  Info,
  ShieldAlert,
  X
} from 'lucide-react';

interface Props {
  inventory: InventoryItem[];
  onRefresh: () => void;
}

export function AdminInventoryManager({ inventory, onRefresh }: Props) {
  const [selectedChannel, setSelectedChannel] = useState<number>(1);
  const [adjustAction, setAdjustAction] = useState<'ADD' | 'REDUCE' | 'SET'>('ADD');
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustReason, setAdjustReason] = useState<string>('Tank Top-up / Refill');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    try {
      const data = await api.getInventoryLogs('AQ-DM-001');
      setLogs(data || []);
    } catch (e) {
      console.warn('Could not load inventory logs:', e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleQuickRefill = async (invId: string, channelNum: number, amount: number) => {
    try {
      await api.adjustStock({
        machine_code: 'AQ-DM-001',
        channel_number: channelNum,
        action: 'ADD',
        amount_ml: amount,
        reason: `Quick Refill (+${amount}ml)`,
        actor_id: 'admin',
      });
      setSuccessMsg(`Refilled Channel ${channelNum} with +${amount}ml`);
      onRefresh();
      fetchLogs();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert('Refill failed: ' + err.message);
    }
  };

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustAmount || adjustAmount <= 0) {
      alert('Please enter a positive amount in ml');
      return;
    }
    setLoading(true);
    try {
      await api.adjustStock({
        machine_code: 'AQ-DM-001',
        channel_number: selectedChannel,
        action: adjustAction,
        amount_ml: Number(adjustAmount),
        reason: adjustReason,
        actor_id: 'admin',
      });
      setSuccessMsg(`Successfully adjusted Channel ${selectedChannel} stock (${adjustAction} ${adjustAmount}ml)`);
      setIsAdjustModalOpen(false);
      onRefresh();
      fetchLogs();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert('Adjustment failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner: ESTIMATED INVENTORY */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3.5 backdrop-blur-md">
        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <span className="font-bold text-amber-300 uppercase tracking-wider block text-sm mb-1">
            ⚠️ ESTIMATED INVENTORY (Software Flow Decrement Model)
          </span>
          Values below represent software-estimated liquid remaining derived from initial capacity minus measured flow sensor pulses.
          Inventory is deducted <strong>only after successful physical dispensing</strong> by System 2 ESP32. If dispensing fails or is canceled, stock is preserved.
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5-Channel Tanks Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {inventory.map((item) => {
          const percentage = Math.round((item.current_volume_ml / (item.max_volume_ml || 5000)) * 100);
          const isLow = percentage <= 20;
          const isCritical = percentage <= 8;

          return (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:border-slate-700 ${
                isCritical
                  ? 'border-rose-500/50 shadow-lg shadow-rose-500/10'
                  : isLow
                  ? 'border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'border-slate-800'
              }`}
            >
              {/* Channel Header */}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                    CH {item.channel_number}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400'
                        : isLow
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {item.status || (isCritical ? 'CRITICAL' : isLow ? 'LOW' : 'GOOD')}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm line-clamp-1 mb-1">
                  {item.product_name || `Formula Channel ${item.channel_number}`}
                </h4>
                <div className="text-[11px] text-slate-400 font-mono">
                  {item.current_volume_ml} / {item.max_volume_ml || 5000} ml
                </div>
              </div>

              {/* Tank Fill Bar */}
              <div className="my-5">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1.5">
                  <span>Tank Level</span>
                  <span className="font-bold text-white">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCritical
                        ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                        : isLow
                        ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleQuickRefill(item.id, item.channel_number, 2000)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold py-1.5 rounded-lg border border-slate-700 transition-colors"
                  >
                    +2L
                  </button>
                  <button
                    onClick={() => handleQuickRefill(item.id, item.channel_number, 5000)}
                    className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[11px] font-semibold py-1.5 rounded-lg border border-cyan-500/30 transition-colors"
                  >
                    Fill (5L)
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedChannel(item.channel_number);
                    setAdjustAmount(1000);
                    setIsAdjustModalOpen(true);
                  }}
                  className="w-full text-center text-xs text-slate-400 hover:text-white py-1 hover:bg-slate-800/60 rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <Sliders className="w-3 h-3" />
                  Adjust Stock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                Adjust Stock — Channel {selectedChannel}
              </h3>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Action Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustAction('ADD')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                      adjustAction === 'ADD'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustAction('REDUCE')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                      adjustAction === 'REDUCE'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    Reduce
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustAction('SET')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                      adjustAction === 'SET'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Set Exact
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Volume Amount (ml) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reason for Adjustment (Audit Log) *
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g., Tank Refill, Spillage Correction, Level Recalibration"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {loading ? 'Applying...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock History / Audit Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Stock Adjustment History (Audit Trail)
          </h3>
          <button
            onClick={fetchLogs}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Machine</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Change (ml)</th>
                <th className="p-3">Resulting Volume</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.length > 0 ? (
                logs.slice(0, 10).map((l, idx) => (
                  <tr key={l.id || idx} className="hover:bg-slate-800/30">
                    <td className="p-3 text-slate-400">{new Date(l.created_at).toLocaleString()}</td>
                    <td className="p-3">{l.machine_code}</td>
                    <td className="p-3 font-bold text-cyan-300">CH {l.channel_number}</td>
                    <td className={`p-3 font-bold ${l.reason.includes('REDUCE') || l.reason.includes('DISPENSE') ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {l.change_amount_ml > 0 ? `+${l.change_amount_ml}` : l.change_amount_ml} ml
                    </td>
                    <td className="p-3 text-white font-bold">{l.resulting_volume_ml} ml</td>
                    <td className="p-3 text-slate-300">{l.reason}</td>
                    <td className="p-3 text-slate-500">{l.actor_id || 'System'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 italic font-sans text-xs">
                    No adjustment records logged yet. Use "+2L" or "Adjust Stock" above to record entries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
