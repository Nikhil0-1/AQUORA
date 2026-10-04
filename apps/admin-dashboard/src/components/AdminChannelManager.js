import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '@aquora/api-client';
import { Sliders, Settings2, CheckCircle2, AlertTriangle, Layers, RefreshCw, X } from 'lucide-react';
export function AdminChannelManager({ machines, products, onRefresh, onNavigateToCalibration }) {
    const [selectedMachineId, setSelectedMachineId] = useState(machines[0]?.id || 'AQ-DM-001');
    const [editingChannel, setEditingChannel] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    // Editor form state
    const [formMachineId, setFormMachineId] = useState(selectedMachineId);
    const [formChannelNumber, setFormChannelNumber] = useState(1);
    const [formProductId, setFormProductId] = useState('');
    const [formVariantId, setFormVariantId] = useState('');
    const [formIsActive, setFormIsActive] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const currentMachine = machines.find(m => m.id === selectedMachineId || m.machine_code === selectedMachineId) || machines[0];
    const handleOpenEdit = (channel) => {
        setEditingChannel(channel);
        setFormMachineId(currentMachine?.id || 'AQ-DM-001');
        setFormChannelNumber(channel.channel_number);
        setFormProductId(channel.product_id || '');
        setFormVariantId('');
        setFormIsActive(channel.is_active);
        setError(null);
        setIsEditorOpen(true);
    };
    const handleProductSelect = (pId) => {
        setFormProductId(pId);
        const prod = products.find(p => p.id === pId);
        if (prod && prod.variants && prod.variants.length > 0) {
            setFormVariantId(prod.variants[0].id);
        }
        else {
            setFormVariantId('');
        }
    };
    const handlePreSaveValidate = (e) => {
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
            const conflict = currentMachine.channels.find(c => c.channel_number !== formChannelNumber && c.product_id === formProductId && c.is_active);
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
        }
        catch (err) {
            setError(err.message || 'Failed to update channel assignment');
            setShowConfirmModal(false);
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Layers, { className: "w-5 h-5 text-cyan-400" }), _jsx("h3", { className: "text-lg font-bold text-white", children: "Channel Management & Assignment" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Authoritative channel mapping for dispensing controller (System 2), public web catalog, and kiosk (System 1)." })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("label", { className: "text-xs text-slate-400 font-medium", children: "Active Dispenser:" }), _jsx("select", { value: selectedMachineId, onChange: (e) => setSelectedMachineId(e.target.value), className: "bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500", children: machines.map((m) => (_jsxs("option", { value: m.id, children: [m.machine_code, " \u2014 ", m.name] }, m.id))) }), _jsx("button", { onClick: onRefresh, className: "p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition", title: "Refresh channels", children: _jsx(RefreshCw, { className: "w-4 h-4" }) })] })] }), successMsg && (_jsxs("div", { className: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 shrink-0" }), successMsg] })), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-5 md:grid-cols-2 gap-4", children: [1, 2, 3, 4, 5].map((chNum) => {
                    const ch = currentMachine?.channels.find((c) => c.channel_number === chNum);
                    const assignedProd = products.find((p) => p.id === ch?.product_id);
                    const isEnabled = ch?.is_active ?? true;
                    return (_jsxs("div", { className: `bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all ${isEnabled ? 'border-slate-800 hover:border-cyan-500/50' : 'border-slate-800/50 opacity-75'}`, children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center pb-3 border-b border-slate-800", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center border border-cyan-800/40", children: ["CH", chNum] }), _jsx("span", { className: "text-[11px] font-mono text-slate-400", children: currentMachine?.machine_code || 'AQ-DM-001' })] }), _jsx("span", { className: `text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${isEnabled
                                                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                                                    : 'bg-rose-950/60 text-rose-400 border-rose-800/40'}`, children: isEnabled ? 'ENABLED' : 'DISABLED' })] }), _jsxs("div", { className: "mt-4 space-y-1", children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-slate-500 tracking-wider", children: "Assigned Product" }), _jsx("h4", { className: "text-sm font-bold text-white line-clamp-2", children: assignedProd ? assignedProd.name : ch?.product_name || 'Unassigned' }), assignedProd?.variants && assignedProd.variants.length > 0 && (_jsx("div", { className: "text-[11px] text-cyan-400/90 font-mono", children: assignedProd.variants.map((v) => `${v.volume_ml}ml (₹${v.price})`).join(' • ') }))] }), _jsxs("div", { className: "mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/70 text-[11px] font-mono space-y-1.5 text-slate-300", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Pump:" }), _jsxs("span", { className: "text-emerald-400", children: ["READY (GPIO ", ch?.gpio_pin || 16, ")"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Flow Sensor:" }), _jsxs("span", { className: "text-cyan-400", children: ["ONLINE (GPIO ", ch?.flow_sensor_pin || 34, ")"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Calibration:" }), _jsxs("span", { className: "text-amber-300 font-bold", children: [ch?.calibration_factor || 10.0, " pulses/ml"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Tank Level:" }), _jsxs("span", { children: [ch?.current_level_ml || 5000, " / ", ch?.max_capacity_ml || 5000, " ml"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Dispense State:" }), _jsx("span", { className: "text-slate-400", children: "IDLE" })] })] })] }), _jsxs("div", { className: "mt-5 pt-3 border-t border-slate-800 flex gap-2", children: [_jsxs("button", { onClick: () => ch && handleOpenEdit(ch), className: "flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5", children: [_jsx(Settings2, { className: "w-3.5 h-3.5 text-cyan-400" }), "Edit Assignment"] }), _jsx("button", { onClick: () => onNavigateToCalibration && onNavigateToCalibration(chNum), className: "p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition", title: "Calibrate this channel", children: _jsx(Sliders, { className: "w-4 h-4 text-amber-400" }) })] })] }, chNum));
                }) }), isEditorOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5", children: [_jsxs("div", { className: "flex justify-between items-center border-b border-slate-800 pb-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-bold text-white flex items-center gap-2", children: [_jsx(Settings2, { className: "w-5 h-5 text-cyan-400" }), "Assigned Channel Editor"] }), _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Bind Product Variant to Machine Channel with server-authoritative validation" })] }), _jsx("button", { onClick: () => setIsEditorOpen(false), className: "text-slate-400 hover:text-white p-1 rounded-lg", children: _jsx(X, { className: "w-5 h-5" }) })] }), error && (_jsxs("div", { className: "bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs font-semibold flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4 shrink-0" }), error] })), _jsxs("form", { onSubmit: handlePreSaveValidate, className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Target Machine" }), _jsx("select", { value: formMachineId, onChange: (e) => setFormMachineId(e.target.value), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono", children: machines.map((m) => (_jsxs("option", { value: m.id, children: [m.machine_code, " \u2014 ", m.name] }, m.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Channel (Relay & Flow Sensor)" }), _jsx("select", { value: formChannelNumber, onChange: (e) => setFormChannelNumber(parseInt(e.target.value, 10)), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono", children: [1, 2, 3, 4, 5].map((ch) => (_jsxs("option", { value: ch, children: ["CH", ch, " \u2014 GPIO Relay ", currentMachine?.channels.find(c => c.channel_number === ch)?.gpio_pin || 16] }, ch))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Assigned Product" }), _jsxs("select", { value: formProductId, onChange: (e) => handleProductSelect(e.target.value), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white", children: [_jsx("option", { value: "", children: "-- Unassigned (Disabled / Empty Tank) --" }), products.map((p) => (_jsxs("option", { value: p.id, children: [p.name, " (Base \u20B9", p.price, ")"] }, p.id)))] })] }), formProductId && (_jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Available Product Variants" }), products.find(p => p.id === formProductId)?.variants?.length ? (_jsx("select", { value: formVariantId, onChange: (e) => setFormVariantId(e.target.value), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono", children: products.find(p => p.id === formProductId)?.variants?.map((v) => (_jsxs("option", { value: v.id, children: [v.volume_ml, " ml \u2014 \u20B9", v.price, " (", v.is_available ? 'Available' : 'Out of Stock', ")"] }, v.id))) })) : (_jsxs("div", { className: "p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-mono", children: ["Single default volume: ", products.find(p => p.id === formProductId)?.volume_ml || 100, " ml"] }))] })), _jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-white block", children: "Channel Status" }), _jsx("span", { className: "text-[11px] text-slate-400", children: formIsActive ? 'Channel is active and available for customer dispensing' : 'Channel is disabled and offline' })] }), _jsx("button", { type: "button", onClick: () => setFormIsActive(!formIsActive), className: `px-3 py-1.5 rounded-lg font-bold font-mono text-xs transition ${formIsActive
                                                ? 'bg-emerald-500 text-slate-950'
                                                : 'bg-slate-800 text-slate-400'}`, children: formIsActive ? 'ENABLED' : 'DISABLED' })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-3 border-t border-slate-800", children: [_jsx("button", { type: "button", onClick: () => setIsEditorOpen(false), className: "px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition", children: "Cancel" }), _jsx("button", { type: "submit", className: "px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition", children: "Validate & Save Assignment" })] })] })] }) })), showConfirmModal && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3 text-amber-400", children: [_jsx(AlertTriangle, { className: "w-6 h-6 shrink-0" }), _jsx("h4", { className: "text-base font-bold text-white", children: "Confirm Authoritative Channel Mapping" })] }), _jsxs("p", { className: "text-xs text-slate-300 leading-relaxed", children: ["You are about to reassign ", _jsxs("strong", { children: ["Channel ", formChannelNumber] }), " on ", _jsx("strong", { children: currentMachine?.machine_code }), " to:"] }), _jsxs("div", { className: "bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-mono space-y-1 text-slate-200", children: [_jsxs("div", { children: ["Product: ", _jsx("span", { className: "text-cyan-400 font-bold", children: products.find(p => p.id === formProductId)?.name || 'Unassigned' })] }), _jsxs("div", { children: ["Status: ", _jsx("span", { className: formIsActive ? 'text-emerald-400' : 'text-rose-400', children: formIsActive ? 'ENABLED' : 'DISABLED' })] })] }), _jsx("p", { className: "text-[11px] text-slate-400", children: "This change takes effect immediately on the Supabase database. The Public Web, System 1 terminal, and System 2 dispensing controller will adopt this configuration without requiring firmware re-flashing." }), _jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => setShowConfirmModal(false), disabled: saving, className: "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleConfirmSave, disabled: saving, className: "px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2", children: saving ? 'Applying...' : 'Confirm & Save' })] })] }) }))] }));
}
