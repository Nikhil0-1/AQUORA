import React, { useState } from 'react';
import { Machine, Product, MachineChannel } from '@aquora/shared-types';
import { api } from '@aquora/api-client';
import { 
  Sliders, 
  Settings2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Droplet, 
  Layers, 
  RefreshCw, 
  Radio, 
  Check, 
  X,
  Gauge,
  Activity,
  ShieldCheck
} from 'lucide-react';

interface Props {
  machines: Machine[];
  products: Product[];
  onRefresh: () => void;
  onNavigateToCalibration?: (channelNum: number) => void;
}

export function AdminChannelManager({ machines, products, onRefresh, onNavigateToCalibration }: Props) {
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || 'AQ-DM-001');
  const [editingChannel, setEditingChannel] = useState<MachineChannel | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editor form state
  const [formMachineId, setFormMachineId] = useState<string>(selectedMachineId);
  const [formChannelNumber, setFormChannelNumber] = useState<number>(1);
  const [formProductId, setFormProductId] = useState<string>('');
  const [formVariantId, setFormVariantId] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const currentMachine = machines.find(m => m.id === selectedMachineId || m.machine_code === selectedMachineId) || machines[0];

  const handleOpenEdit = (channel: MachineChannel) => {
    setEditingChannel(channel);
    setFormMachineId(currentMachine?.id || 'AQ-DM-001');
    setFormChannelNumber(channel.channel_number);
    setFormProductId(channel.product_id || '');
    setFormVariantId('');
    setFormIsActive(channel.is_active);
    setError(null);
    setIsEditorOpen(true);
  };

  const handleProductSelect = (pId: string) => {
    setFormProductId(pId);
    const prod = products.find(p => p.id === pId);
    if (prod && prod.variants && prod.variants.length > 0) {
      setFormVariantId(prod.variants[0].id);
    } else {
      setFormVariantId('');
    }
  };

  const handlePreSaveValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formMachineId) {
      setError('Please select a valid machine');
      return;
    }
    if (!formChannelNumber || formChannelNumber < 1 || formChannelNumber > 5) {
      setError('Channel number must be between 1 and 5');
      return;
    }

    // Check duplicate assignment
    if (formProductId && currentMachine) {
      const conflict = currentMachine.channels.find(
        c => c.channel_number !== formChannelNumber && c.product_id === formProductId && c.is_active
      );
      if (conflict && formIsActive) {
        setError(`Product is already actively assigned to Channel ${conflict.channel_number} on this machine. Duplicate active channels are prohibited.`);
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.assignMachineChannel(formMachineId, formChannelNumber, {
        product_id: formProductId || null,
        variant_id: formVariantId || null,
        is_active: formIsActive,
      });

      const prodName = products.find(p => p.id === formProductId)?.name || 'Unassigned';
      setSuccessMsg(`Channel ${formChannelNumber} assigned to "${prodName}" (${formIsActive ? 'ENABLED' : 'DISABLED'}) successfully!`);
      setShowConfirmModal(false);
      setIsEditorOpen(false);
      onRefresh();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update channel assignment');
      setShowConfirmModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Machine Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Channel Management & Assignment</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative channel mapping for dispensing controller (System 2), public web catalog, and kiosk (System 1).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Active Dispenser:</label>
          <select
            value={selectedMachineId}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
          >
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.machine_code} — {m.name}
              </option>
            ))}
          </select>
          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            title="Refresh channels"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* 5 Channels Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-5 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5].map((chNum) => {
          const ch = currentMachine?.channels.find((c) => c.channel_number === chNum);
          const assignedProd = products.find((p) => p.id === ch?.product_id);
          const isEnabled = ch?.is_active ?? true;

          return (
            <div
              key={chNum}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                isEnabled ? 'border-slate-800 hover:border-cyan-500/50' : 'border-slate-800/50 opacity-75'
              }`}
            >
              <div>
                {/* Channel Header */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center border border-cyan-800/40">
                      CH{chNum}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {currentMachine?.machine_code || 'AQ-DM-001'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isEnabled
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                        : 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                    }`}
                  >
                    {isEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>

                {/* Assigned Product */}
                <div className="mt-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Assigned Product</span>
                  <h4 className="text-sm font-bold text-white line-clamp-2">
                    {assignedProd ? assignedProd.name : ch?.product_name || 'Unassigned'}
                  </h4>
                  {assignedProd?.variants && assignedProd.variants.length > 0 && (
                    <div className="text-[11px] text-cyan-400/90 font-mono">
                      {assignedProd.variants.map((v) => `${v.volume_ml}ml (₹${v.price})`).join(' • ')}
                    </div>
                  )}
                </div>

                {/* Hardware Drivers & Pinout */}
                <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/70 text-[11px] font-mono space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pump:</span>
                    <span className="text-emerald-400">READY (GPIO {ch?.gpio_pin || 16})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Flow Sensor:</span>
                    <span className="text-cyan-400">ONLINE (GPIO {ch?.flow_sensor_pin || 34})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Calibration:</span>
                    <span className="text-amber-300 font-bold">{ch?.calibration_factor || 10.0} pulses/ml</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tank Level:</span>
                    <span>{ch?.current_level_ml || 5000} / {ch?.max_capacity_ml || 5000} ml</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dispense State:</span>
                    <span className="text-slate-400">IDLE</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => ch && handleOpenEdit(ch)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                  Edit Assignment
                </button>

                <button
                  onClick={() => onNavigateToCalibration && onNavigateToCalibration(chNum)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition"
                  title="Calibrate this channel"
                >
                  <Sliders className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assigned Channel Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-cyan-400" />
                  Assigned Channel Editor
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bind Product Variant to Machine Channel with server-authoritative validation
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handlePreSaveValidate} className="space-y-4 text-xs">
              {/* Machine Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Machine</label>
                <select
                  value={formMachineId}
                  onChange={(e) => setFormMachineId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.machine_code} — {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Channel Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Channel (Relay & Flow Sensor)</label>
                <select
                  value={formChannelNumber}
                  onChange={(e) => setFormChannelNumber(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono"
                >
                  {[1, 2, 3, 4, 5].map((ch) => (
                    <option key={ch} value={ch}>
                      CH{ch} — GPIO Relay {currentMachine?.channels.find(c => c.channel_number === ch)?.gpio_pin || 16}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Product</label>
                <select
                  value={formProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                >
                  <option value="">-- Unassigned (Disabled / Empty Tank) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Base ₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Variant Selection */}
              {formProductId && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Available Product Variants</label>
                  {products.find(p => p.id === formProductId)?.variants?.length ? (
                    <select
                      value={formVariantId}
                      onChange={(e) => setFormVariantId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono"
                    >
                      {products.find(p => p.id === formProductId)?.variants?.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.volume_ml} ml — ₹{v.price} ({v.is_available ? 'Available' : 'Out of Stock'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-mono">
                      Single default volume: {products.find(p => p.id === formProductId)?.volume_ml || 100} ml
                    </div>
                  )}
                </div>
              )}

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <span className="font-semibold text-white block">Channel Status</span>
                  <span className="text-[11px] text-slate-400">
                    {formIsActive ? 'Channel is active and available for customer dispensing' : 'Channel is disabled and offline'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`px-3 py-1.5 rounded-lg font-bold font-mono text-xs transition ${
                    formIsActive
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {formIsActive ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition"
                >
                  Validate & Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-bold text-white">Confirm Authoritative Channel Mapping</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to reassign <strong>Channel {formChannelNumber}</strong> on <strong>{currentMachine?.machine_code}</strong> to:
            </p>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-mono space-y-1 text-slate-200">
              <div>Product: <span className="text-cyan-400 font-bold">{products.find(p => p.id === formProductId)?.name || 'Unassigned'}</span></div>
              <div>Status: <span className={formIsActive ? 'text-emerald-400' : 'text-rose-400'}>{formIsActive ? 'ENABLED' : 'DISABLED'}</span></div>
            </div>

            <p className="text-[11px] text-slate-400">
              This change takes effect immediately on the Supabase database. The Public Web, System 1 terminal, and System 2 dispensing controller will adopt this configuration without requiring firmware re-flashing.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={saving}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                {saving ? 'Applying...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
