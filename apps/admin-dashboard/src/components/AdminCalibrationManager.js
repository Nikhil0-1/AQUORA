import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { api } from '@aquora/api-client';
import { Sliders, ShieldAlert, AlertTriangle, CheckCircle2, History, FlaskConical, RefreshCw, Calculator } from 'lucide-react';
export function AdminCalibrationManager({ machine, initialChannel = 1, onRefresh }) {
    const [selectedChannel, setSelectedChannel] = useState(initialChannel);
    const [testVolume, setTestVolume] = useState(100);
    const [measuredVolume, setMeasuredVolume] = useState(100);
    const [measuredPulses, setMeasuredPulses] = useState(1000);
    const [mode, setMode] = useState('VOLUME_RATIO');
    const [isPhysicallyVerified, setIsPhysicallyVerified] = useState(false);
    const [operatorName, setOperatorName] = useState('ADMIN');
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [calibrationHistory, setCalibrationHistory] = useState([]);
    const machineCode = machine?.machine_code || 'AQ-DM-001';
    const targetChannelObj = machine?.channels.find((c) => c.channel_number === selectedChannel);
    const currentFactor = targetChannelObj?.calibration_factor || 10.0;
    // Compute calculated factor
    let computedFactor = currentFactor;
    if (mode === 'VOLUME_RATIO') {
        if (measuredVolume > 0) {
            computedFactor = Number((currentFactor * (testVolume / measuredVolume)).toFixed(2));
        }
    }
    else {
        if (measuredVolume > 0 && measuredPulses > 0) {
            computedFactor = Number((measuredPulses / measuredVolume).toFixed(2));
        }
    }
    const fetchCalibrations = async () => {
        try {
            const data = await api.getCalibrations(machineCode);
            setCalibrationHistory(data || []);
        }
        catch (err) {
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
    const handleSaveCalibration = async (e) => {
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
            setSuccessMsg(`Channel ${selectedChannel} calibration updated! Factor: ${computedFactor} pulses/ml [${isPhysicallyVerified ? 'PHYSICALLY VERIFIED' : 'CONFIGURED'}]`);
            onRefresh();
            fetchCalibrations();
            setTimeout(() => setSuccessMsg(null), 5000);
        }
        catch (err) {
            setErrorMsg(err.message || 'Failed to save calibration factor');
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sliders, { className: "w-5 h-5 text-amber-400" }), _jsx("h3", { className: "text-lg font-bold text-white", children: "Flow Sensor Pulse Calibration" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Configure pulses/ml per liquid viscosity channel with hardware safety interlock compliance." })] }), _jsx("button", { onClick: fetchCalibrations, className: "p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition", title: "Refresh calibration logs", children: _jsx(RefreshCw, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3.5 backdrop-blur-md", children: [_jsx(ShieldAlert, { className: "w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "text-xs text-amber-200/90 leading-relaxed space-y-1", children: [_jsx("span", { className: "font-bold text-amber-300 uppercase tracking-wider block text-sm", children: "\uD83D\uDEE1\uFE0F Hardware Safety Interlocks Active During Calibration" }), _jsxs("p", { children: ["Flow calibration is executed strictly server-authoritative and ", _jsx("strong", { children: "NEVER bypasses" }), ":"] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2 font-mono text-[11px] text-amber-300 pt-1", children: [_jsx("div", { children: "\u2713 E-Stop (GPIO 36 Pull-Up)" }), _jsx("div", { children: "\u2713 Single Pump Mutual Exclusion" }), _jsx("div", { children: "\u2713 Max Dispense Limit (1000ml)" }), _jsx("div", { children: "\u2713 3s No-Flow Auto Shutoff" }), _jsx("div", { children: "\u2713 Hardware Watchdog (8s)" }), _jsx("div", { children: "\u2713 Machine Authentication Secret" })] })] })] }), successMsg && (_jsxs("div", { className: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 shrink-0" }), successMsg] })), errorMsg && (_jsxs("div", { className: "bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4 shrink-0" }), errorMsg] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-4", children: [_jsxs("h4", { className: "text-sm font-bold text-white flex items-center gap-2", children: [_jsx(FlaskConical, { className: "w-4 h-4 text-cyan-400" }), "Per-Channel Pulse Calculation"] }), _jsxs("span", { className: "text-[11px] font-mono text-slate-400", children: ["Controller: ", _jsx("span", { className: "text-white font-bold", children: machineCode })] })] }), _jsxs("form", { onSubmit: handleSaveCalibration, className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Target Channel" }), _jsx("select", { value: selectedChannel, onChange: (e) => setSelectedChannel(parseInt(e.target.value, 10)), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500", children: [1, 2, 3, 4, 5].map((ch) => {
                                                    const chObj = machine?.channels.find((c) => c.channel_number === ch);
                                                    return (_jsxs("option", { value: ch, children: ["Channel ", ch, " \u2014 ", chObj?.product_name || `Formula CH${ch}`, " (Current: ", chObj?.calibration_factor || 10.0, " pulses/ml)"] }, ch));
                                                }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono", children: [_jsxs("div", { children: [_jsx("span", { className: "text-slate-500 text-[10px] block", children: "CURRENT ACTIVE FACTOR" }), _jsxs("span", { className: "text-xl font-bold text-white", children: [currentFactor, " pulses/ml"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 text-[10px] block", children: "COMPUTED NEW FACTOR" }), _jsxs("span", { className: `text-xl font-bold ${computedFactor > 0 ? 'text-amber-400' : 'text-slate-500'}`, children: [computedFactor, " pulses/ml"] })] })] }), _jsxs("div", { className: "flex gap-4 pt-1", children: [_jsxs("label", { className: "flex items-center gap-2 text-slate-300 cursor-pointer", children: [_jsx("input", { type: "radio", name: "calMode", checked: mode === 'VOLUME_RATIO', onChange: () => setMode('VOLUME_RATIO'), className: "text-cyan-500 focus:ring-0" }), "Volume Ratio (Target vs Measured)"] }), _jsxs("label", { className: "flex items-center gap-2 text-slate-300 cursor-pointer", children: [_jsx("input", { type: "radio", name: "calMode", checked: mode === 'PULSE_COUNT', onChange: () => setMode('PULSE_COUNT'), className: "text-cyan-500 focus:ring-0" }), "Direct Pulses / Measured Volume"] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [mode === 'VOLUME_RATIO' ? (_jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Test Volume Dispensed (ml)" }), _jsx("input", { type: "number", value: testVolume, onChange: (e) => setTestVolume(parseFloat(e.target.value) || 0), min: "10", max: "1000", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-mono" })] })) : (_jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Total Measured Flow Pulses" }), _jsx("input", { type: "number", value: measuredPulses, onChange: (e) => setMeasuredPulses(parseInt(e.target.value, 10) || 0), min: "1", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-mono" })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Physical Measured Liquid (ml)" }), _jsx("input", { type: "number", value: measuredVolume, onChange: (e) => setMeasuredVolume(parseFloat(e.target.value) || 0), min: "1", max: "1500", step: "0.5", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-mono" })] })] }), _jsx("div", { className: "p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2", children: _jsxs("label", { className: "flex items-start gap-3 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: isPhysicallyVerified, onChange: (e) => setIsPhysicallyVerified(e.target.checked), className: "mt-0.5 rounded text-cyan-500 focus:ring-0" }), _jsxs("div", { children: [_jsx("span", { className: "font-bold text-white block", children: "Physically Verified on Dispenser Hardware" }), _jsxs("span", { className: "text-[11px] text-slate-400", children: ["Check only if an operator physically caught and measured liquid volume using a graduated measuring cylinder. Unchecked entries are marked as ", _jsx("strong", { children: "CONFIGURED (NOT PHYSICALLY VERIFIED)" }), "."] })] })] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Operator Signature / Name" }), _jsx("input", { type: "text", value: operatorName, onChange: (e) => setOperatorName(e.target.value), placeholder: "e.g. Lead Technician", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" })] }), _jsxs("button", { type: "submit", disabled: saving, className: "w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2", children: [_jsx(Calculator, { className: "w-4 h-4" }), saving ? 'Saving...' : `Save Channel ${selectedChannel} Calibration (${computedFactor} p/ml)`] })] })] }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3", children: [_jsx("h4", { className: "text-sm font-bold text-white", children: "All Channels Calibration" }), _jsx("div", { className: "space-y-2", children: [1, 2, 3, 4, 5].map((ch) => {
                                        const chObj = machine?.channels.find((c) => c.channel_number === ch);
                                        return (_jsxs("div", { onClick: () => setSelectedChannel(ch), className: `p-3 rounded-xl border cursor-pointer transition ${selectedChannel === ch
                                                ? 'bg-slate-950 border-amber-500/60'
                                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'}`, children: [_jsxs("div", { className: "flex justify-between items-center text-xs", children: [_jsxs("span", { className: "font-mono font-bold text-cyan-400", children: ["CH ", ch] }), _jsxs("span", { className: "font-mono text-amber-300 font-bold", children: [chObj?.calibration_factor || 10.0, " p/ml"] })] }), _jsx("div", { className: "text-[11px] text-slate-400 truncate mt-1", children: chObj?.product_name || `Formula CH${ch}` })] }, ch));
                                    }) })] }) })] }), calibrationHistory.length > 0 && (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-6", children: [_jsxs("h4", { className: "font-bold text-white mb-4 text-sm flex items-center gap-2", children: [_jsx(History, { className: "w-4 h-4 text-cyan-400" }), "Calibration History & Verification Audit"] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs font-mono", children: [_jsx("thead", { className: "border-b border-slate-800 text-slate-400", children: _jsxs("tr", { children: [_jsx("th", { className: "py-2.5 px-3", children: "Date" }), _jsx("th", { className: "py-2.5 px-3", children: "Channel" }), _jsx("th", { className: "py-2.5 px-3", children: "Calibration Factor" }), _jsx("th", { className: "py-2.5 px-3", children: "Test Vol" }), _jsx("th", { className: "py-2.5 px-3", children: "Measured Vol" }), _jsx("th", { className: "py-2.5 px-3", children: "Verification" }), _jsx("th", { className: "py-2.5 px-3", children: "Operator" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800/50", children: calibrationHistory.map((item, idx) => (_jsxs("tr", { className: "hover:bg-slate-800/40", children: [_jsx("td", { className: "py-2.5 px-3 text-slate-300", children: new Date(item.created_at).toLocaleString() }), _jsxs("td", { className: "py-2.5 px-3 text-cyan-400 font-bold", children: ["CH", item.channel_number] }), _jsxs("td", { className: "py-2.5 px-3 text-amber-300 font-bold", children: [item.calibration_factor, " p/ml"] }), _jsxs("td", { className: "py-2.5 px-3 text-slate-400", children: [item.test_volume_ml, " ml"] }), _jsxs("td", { className: "py-2.5 px-3 text-slate-300", children: [item.measured_volume_ml, " ml"] }), _jsx("td", { className: "py-2.5 px-3", children: item.is_verified ? (_jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold", children: "PHYSICALLY VERIFIED" })) : (_jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] bg-amber-950 border border-amber-800 text-amber-400 font-bold", children: "CONFIGURED (NOT PHYSICALLY VERIFIED)" })) }), _jsx("td", { className: "py-2.5 px-3 text-slate-400", children: item.operator || 'ADMIN' })] }, idx))) })] }) })] }))] }));
}
