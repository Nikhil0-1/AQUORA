import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { api } from '@aquora/api-client';
import { ShieldCheck, RefreshCw, Search } from 'lucide-react';
export function AdminAuditLogsView() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const fetchLogs = async () => {
        try {
            const data = await api.getAuditLogs();
            setLogs(data || []);
        }
        catch (err) {
            console.warn('Failed to load audit logs:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchLogs();
    }, []);
    const filteredLogs = logs.filter((l) => (l.action && l.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.actor_id && l.actor_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        JSON.stringify(l.details || {}).toLowerCase().includes(searchTerm.toLowerCase()));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ShieldCheck, { className: "w-5 h-5 text-cyan-400" }), _jsx("h3", { className: "text-lg font-bold text-white", children: "Security & Configuration Audit Logs" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Authoritative immutable record of all product, variant, pricing, channel mapping, and calibration changes." })] }), _jsx("button", { onClick: () => {
                            setLoading(true);
                            fetchLogs();
                        }, className: "p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition", title: "Refresh audit trail", children: _jsx(RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }) })] }), _jsxs("div", { className: "bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3", children: [_jsx(Search, { className: "w-4 h-4 text-slate-500" }), _jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Filter by action, user ID, or details...", className: "w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none" })] }), _jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs font-mono", children: [_jsx("thead", { className: "bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Timestamp" }), _jsx("th", { className: "py-3 px-4", children: "Action" }), _jsx("th", { className: "py-3 px-4", children: "Actor" }), _jsx("th", { className: "py-3 px-4", children: "Details" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800/60", children: filteredLogs.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "py-10 text-center text-slate-500", children: "No audit logs recorded yet." }) })) : (filteredLogs.map((l) => (_jsxs("tr", { className: "hover:bg-slate-800/30 transition", children: [_jsx("td", { className: "py-3 px-4 text-slate-400", children: new Date(l.created_at).toLocaleString() }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/40", children: l.action }) }), _jsx("td", { className: "py-3 px-4 text-slate-300 font-bold", children: l.actor_id || 'ADMIN' }), _jsx("td", { className: "py-3 px-4 text-slate-300 font-sans text-xs", children: typeof l.details === 'object' ? JSON.stringify(l.details) : String(l.details) })] }, l.id)))) })] }) }) })] }));
}
