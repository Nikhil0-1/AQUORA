import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '@aquora/api-client';
import { Droplets, ShoppingCart, RefreshCw, Gauge, Sliders, TrendingUp, Activity, Tag } from 'lucide-react';
import { AdminProductManager } from './components/AdminProductManager';
import { AdminInventoryManager } from './components/AdminInventoryManager';
import { AdminOrdersView } from './components/AdminOrdersView';
import { AdminLoginView } from './components/AdminLoginView';
import { firebaseAuth } from './services/firebaseAuth';
export default function App() {
    const [machines, setMachines] = useState([]);
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('products');
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(firebaseAuth.getCurrentUser());
    // Calibration state
    const [selectedChannel, setSelectedChannel] = useState(1);
    const [testVolume, setTestVolume] = useState(100);
    const [measuredVolume, setMeasuredVolume] = useState(100);
    const [currentFactor, setCurrentFactor] = useState(10.0);
    const [calibrationSuccess, setCalibrationSuccess] = useState(null);
    const fetchAdminData = async () => {
        try {
            const [m, o, inv, prod, st] = await Promise.all([
                api.getAdminMachines().catch(() => []),
                api.getAdminOrders().catch(() => []),
                api.getInventory().catch(() => []),
                api.getAdminProducts().catch(() => []),
                api.getAdminStats().catch(() => null),
            ]);
            setMachines(m);
            setOrders(o);
            setInventory(inv);
            setProducts(prod);
            setStats(st);
        }
        catch (err) {
            console.error('Failed to fetch admin data', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAdminData();
        const interval = setInterval(fetchAdminData, 5000);
        return () => clearInterval(interval);
    }, []);
    const handleSaveCalibration = async () => {
        if (!measuredVolume || measuredVolume <= 0) {
            alert('Please enter a valid measured volume');
            return;
        }
        const newFactor = Number((currentFactor * (testVolume / measuredVolume)).toFixed(2));
        try {
            const targetMachine = machines[0];
            if (targetMachine) {
                await api.updateMachineChannel(targetMachine.id, selectedChannel, {
                    calibration_factor: newFactor,
                });
                setCurrentFactor(newFactor);
                setCalibrationSuccess(`Calibration updated for Channel ${selectedChannel}! New Factor: ${newFactor} pulses/ml`);
                fetchAdminData();
                setTimeout(() => setCalibrationSuccess(null), 5000);
            }
        }
        catch (err) {
            alert('Failed to save calibration: ' + err.message);
        }
    };
    // Admin Auth Guard: Public web has no auth, Admin requires Firebase login
    if (!currentUser) {
        return _jsx(AdminLoginView, { onLoginSuccess: (u) => setCurrentUser(u) });
    }
    const currentMachine = machines[0];
    return (_jsxs("div", { className: "min-h-screen flex bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30", children: [_jsxs("aside", { className: "w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0", children: [_jsxs("div", { children: [_jsx("div", { className: "p-6 border-b border-slate-800 flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20", children: _jsx(Droplets, { className: "w-5 h-5 text-slate-950 stroke-[2.5]" }) }), _jsxs("div", { children: [_jsx("h1", { className: "font-extrabold text-lg tracking-wider text-white", children: "AQUORA" }), _jsx("p", { className: "text-[10px] text-cyan-400 font-mono tracking-widest uppercase", children: "Admin Operations" })] })] }) }), _jsxs("nav", { className: "p-4 space-y-1.5", children: [_jsxs("button", { onClick: () => setActiveTab('products'), className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeTab === 'products'
                                            ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`, children: [_jsx(Tag, { className: "w-4 h-4" }), "Products & Variants"] }), _jsxs("button", { onClick: () => setActiveTab('inventory'), className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeTab === 'inventory'
                                            ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`, children: [_jsx(Droplets, { className: "w-4 h-4" }), "Estimated Inventory"] }), _jsxs("button", { onClick: () => setActiveTab('orders'), className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeTab === 'orders'
                                            ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`, children: [_jsx(ShoppingCart, { className: "w-4 h-4" }), "Orders & Source"] }), _jsxs("button", { onClick: () => setActiveTab('machines'), className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeTab === 'machines'
                                            ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`, children: [_jsx(Gauge, { className: "w-4 h-4" }), "Hardware Telemetry"] }), _jsxs("button", { onClick: () => setActiveTab('calibration'), className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeTab === 'calibration'
                                            ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`, children: [_jsx(Sliders, { className: "w-4 h-4" }), "Flow Calibration"] }), _jsxs("button", { onClick: () => setActiveTab('analytics'), className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeTab === 'analytics'
                                            ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`, children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "Analytics & Trends"] })] })] }), _jsxs("div", { className: "p-4 border-t border-slate-800 space-y-3", children: [_jsxs("div", { className: "bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[11px] font-mono", children: [_jsx("span", { className: "text-slate-500 block text-[10px]", children: "ACTIVE DISPENSER" }), _jsxs("div", { className: "flex justify-between items-center text-slate-300 mt-0.5", children: [_jsx("span", { className: "font-bold text-white", children: "AQ-DM-001" }), _jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" })] })] }), _jsx("div", { className: "text-[10px] text-slate-500 text-center", children: "AQUORA IoT Platform v1.0.0" })] })] }), _jsxs("main", { className: "flex-1 overflow-y-auto min-h-screen", children: [_jsxs("header", { className: "h-20 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[11px] font-bold text-cyan-400 uppercase tracking-widest block", children: "Dashboard Overview" }), _jsx("h2", { className: "text-xl font-extrabold text-white capitalize", children: activeTab === 'products' ? 'Product & Variant Management' : activeTab })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: fetchAdminData, className: "p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all", title: "Refresh Data", children: _jsx(RefreshCw, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex items-center gap-3 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl", children: [_jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" }), _jsxs("div", { className: "text-left text-xs", children: [_jsx("span", { className: "text-white font-semibold block", children: currentUser.email }), _jsx("span", { className: "text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40", children: currentUser.role })] }), _jsx("button", { onClick: async () => {
                                                    await firebaseAuth.signOut();
                                                    setCurrentUser(null);
                                                }, className: "text-slate-400 hover:text-rose-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors ml-1 text-xs font-semibold", title: "Sign out of Admin Panel", children: "Sign Out" })] })] })] }), _jsx("div", { className: "p-8", children: loading ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500" }) })) : (_jsxs(_Fragment, { children: [activeTab === 'products' && (_jsx(AdminProductManager, { products: products, onRefresh: fetchAdminData })), activeTab === 'inventory' && (_jsx(AdminInventoryManager, { inventory: inventory, onRefresh: fetchAdminData })), activeTab === 'orders' && (_jsx(AdminOrdersView, { orders: orders, onRefresh: fetchAdminData })), activeTab === 'machines' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 p-5 rounded-2xl", children: [_jsx("span", { className: "text-xs text-slate-400 block mb-1", children: "Fleet Machine" }), _jsx("span", { className: "text-2xl font-bold font-mono text-white", children: "AQ-DM-001" }), _jsx("span", { className: "text-[11px] text-emerald-400 block mt-1", children: "\u25CF 5 Active Channels" })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 p-5 rounded-2xl", children: [_jsx("span", { className: "text-xs text-slate-400 block mb-1", children: "Firmware" }), _jsx("span", { className: "text-2xl font-bold font-mono text-white", children: "v1.0.0-esp32" }), _jsx("span", { className: "text-[11px] text-cyan-400 block mt-1", children: "Watchdog: 8s Active" })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 p-5 rounded-2xl", children: [_jsx("span", { className: "text-xs text-slate-400 block mb-1", children: "Safety Interlock" }), _jsx("span", { className: "text-2xl font-bold font-mono text-emerald-400", children: "HARDWARE OK" }), _jsx("span", { className: "text-[11px] text-slate-400 block mt-1", children: "Mutual Exclusion ON" })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 p-5 rounded-2xl", children: [_jsx("span", { className: "text-xs text-slate-400 block mb-1", children: "Emergency Stop" }), _jsx("span", { className: "text-2xl font-bold font-mono text-emerald-400", children: "NORMAL (GPIO 36)" }), _jsx("span", { className: "text-[11px] text-slate-400 block mt-1", children: "Active LOW Pull-up" })] })] }), currentMachine && (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-6", children: [_jsxs("h3", { className: "font-bold text-white mb-4 text-sm flex items-center gap-2", children: [_jsx(Activity, { className: "w-4 h-4 text-cyan-400" }), "Channel Driver & Sensor Status"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4", children: currentMachine.channels.map((ch) => (_jsxs("div", { className: "bg-slate-950 p-4 rounded-xl border border-slate-800", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsxs("span", { className: "font-mono font-bold text-cyan-300 text-xs", children: ["CH ", ch.channel_number] }), _jsxs("span", { className: "text-[10px] text-slate-500 font-mono", children: ["Pump: GPIO ", ch.gpio_pin] })] }), _jsx("h4", { className: "font-semibold text-white text-xs mb-2 line-clamp-1", children: ch.product_name }), _jsxs("div", { className: "text-[11px] text-slate-400 font-mono space-y-0.5", children: [_jsxs("div", { children: ["Flow: GPIO ", ch.flow_sensor_pin] }), _jsxs("div", { children: ["Factor: ", ch.calibration_factor, " pulses/ml"] }), _jsxs("div", { children: ["Capacity: ", ch.current_level_ml, " ml"] })] })] }, ch.channel_number))) })] }))] })), activeTab === 'calibration' && (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-xl mx-auto space-y-6", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(Sliders, { className: "w-5 h-5 text-cyan-400" }), "Flow Sensor Pulse Calibration"] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Calibrate pulses per ml for precise liquid sanitizer dispensing" })] }), calibrationSuccess && (_jsx("div", { className: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-semibold", children: calibrationSuccess })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-300 mb-1", children: "Target Channel" }), _jsx("select", { value: selectedChannel, onChange: (e) => setSelectedChannel(parseInt(e.target.value)), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm", children: [1, 2, 3, 4, 5].map((ch) => (_jsxs("option", { value: ch, children: ["Channel ", ch, " \u2014 ", currentMachine?.channels.find((c) => c.channel_number === ch)?.product_name || `Formula ${ch}`] }, ch))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-300 mb-1", children: "Test Volume Dispensed (ml)" }), _jsx("input", { type: "number", value: testVolume, onChange: (e) => setTestVolume(parseFloat(e.target.value) || 0), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-300 mb-1", children: "Measured Liquid (ml)" }), _jsx("input", { type: "number", value: measuredVolume, onChange: (e) => setMeasuredVolume(parseFloat(e.target.value) || 0), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm font-mono" })] })] }), _jsx("button", { onClick: handleSaveCalibration, className: "w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3 rounded-xl text-xs shadow-lg shadow-cyan-500/20", children: "Compute & Save Calibration Factor" })] })] })), activeTab === 'analytics' && stats && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 p-6 rounded-2xl", children: [_jsx("span", { className: "text-xs text-slate-400 font-semibold uppercase block mb-1", children: "Revenue Today" }), _jsxs("span", { className: "text-3xl font-extrabold text-white font-mono", children: ["\u20B9", stats.revenue_today || 0] }), _jsx("span", { className: "text-xs text-emerald-400 block mt-2", children: "\u2191 Authoritative captured total" })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 p-6 rounded-2xl", children: [_jsx("span", { className: "text-xs text-slate-400 font-semibold uppercase block mb-1", children: "Orders Today" }), _jsx("span", { className: "text-3xl font-extrabold text-white font-mono", children: stats.orders_today || 0 }), _jsx("span", { className: "text-xs text-slate-400 block mt-2", children: "S1 Kiosk + Web Orders" })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 p-6 rounded-2xl", children: [_jsx("span", { className: "text-xs text-slate-400 font-semibold uppercase block mb-1", children: "Completed Dispenses" }), _jsx("span", { className: "text-3xl font-extrabold text-cyan-400 font-mono", children: stats.dispensed_today || 0 }), _jsx("span", { className: "text-xs text-cyan-300 block mt-2", children: "Hardware-verified volume" })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 p-6 rounded-2xl", children: [_jsx("span", { className: "text-xs text-slate-400 font-semibold uppercase block mb-1", children: "Failed Jobs" }), _jsx("span", { className: "text-3xl font-extrabold text-rose-400 font-mono", children: stats.failed_today || 0 }), _jsx("span", { className: "text-xs text-rose-300 block mt-2", children: "Safety aborts / timeouts" })] })] }) }))] })) })] })] }));
}
