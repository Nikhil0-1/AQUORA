import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { api } from '@aquora/api-client';
import { CheckCircle2, Clock, XCircle, RefreshCw, Search, Filter, Eye, Droplets, Radio } from 'lucide-react';
export function AdminDispenseJobsView({ products, onRefresh }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedJob, setSelectedJob] = useState(null);
    const fetchJobs = async () => {
        try {
            const data = await api.getAdminJobs();
            setJobs(data || []);
        }
        catch (err) {
            console.warn('Failed to load dispense jobs:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchJobs();
        const interval = setInterval(fetchJobs, 4000);
        return () => clearInterval(interval);
    }, []);
    const filteredJobs = jobs.filter((j) => {
        const matchesSearch = (j.order_id && j.order_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (j.id && j.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (j.machine_id && j.machine_id.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED':
            case 'DISPENSED':
                return (_jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400", children: [_jsx(CheckCircle2, { className: "w-3 h-3" }), "COMPLETED"] }));
            case 'DISPENSING':
            case 'STARTED':
                return (_jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse", children: [_jsx(Radio, { className: "w-3 h-3" }), "DISPENSING"] }));
            case 'QUEUED':
            case 'ACCEPTED':
                return (_jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400", children: [_jsx(Clock, { className: "w-3 h-3" }), status] }));
            case 'FAILED':
                return (_jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400", children: [_jsx(XCircle, { className: "w-3 h-3" }), "FAILED"] }));
            default:
                return (_jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400", children: status }));
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Droplets, { className: "w-5 h-5 text-cyan-400" }), _jsx("h3", { className: "text-lg font-bold text-white", children: "Dispense Jobs Queue & History" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Authoritative lifecycle of hardware dispense jobs dispatched to System 2 dispensing controller." })] }), _jsx("div", { className: "flex items-center gap-3", children: _jsx("button", { onClick: () => {
                                setLoading(true);
                                fetchJobs();
                                onRefresh();
                            }, className: "p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition", title: "Refresh Jobs", children: _jsx(RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }) }) })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 border border-slate-800 p-4 rounded-xl", children: [_jsxs("div", { className: "relative w-full sm:w-80", children: [_jsx(Search, { className: "w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Search order ID or machine...", className: "w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" })] }), _jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto", children: [_jsx(Filter, { className: "w-4 h-4 text-slate-500" }), _jsx("div", { className: "flex gap-1.5 overflow-x-auto text-[11px] font-mono", children: ['ALL', 'QUEUED', 'DISPENSING', 'COMPLETED', 'FAILED'].map((st) => (_jsx("button", { onClick: () => setStatusFilter(st), className: `px-3 py-1.5 rounded-lg transition ${statusFilter === st
                                        ? 'bg-cyan-500 text-slate-950 font-bold'
                                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'}`, children: st }, st))) })] })] }), _jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs font-mono", children: [_jsx("thead", { className: "bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3.5 px-4", children: "Order / Job ID" }), _jsx("th", { className: "py-3.5 px-4", children: "Machine & CH" }), _jsx("th", { className: "py-3.5 px-4", children: "Product" }), _jsx("th", { className: "py-3.5 px-4", children: "Requested Vol" }), _jsx("th", { className: "py-3.5 px-4", children: "Actual Vol" }), _jsx("th", { className: "py-3.5 px-4", children: "Status" }), _jsx("th", { className: "py-3.5 px-4", children: "Created Time" }), _jsx("th", { className: "py-3.5 px-4 text-right", children: "Details" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800/60", children: filteredJobs.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 8, className: "py-12 text-center text-slate-500", children: "No dispense jobs found matching criteria." }) })) : (filteredJobs.map((j) => {
                                    const prod = products.find((p) => p.id === j.product_id);
                                    return (_jsxs("tr", { className: "hover:bg-slate-800/30 transition", children: [_jsxs("td", { className: "py-3 px-4", children: [_jsx("div", { className: "font-bold text-white truncate max-w-[140px]", children: j.order_id || j.id }), _jsx("div", { className: "text-[10px] text-slate-500 truncate max-w-[140px]", children: j.id })] }), _jsxs("td", { className: "py-3 px-4", children: [_jsx("div", { className: "text-cyan-400 font-bold", children: j.machine_id || 'AQ-DM-001' }), _jsxs("div", { className: "text-[11px] text-slate-400", children: ["Channel ", j.channel_id] })] }), _jsx("td", { className: "py-3 px-4 font-sans font-medium text-slate-200", children: prod ? prod.name : 'Sanitizer Solution' }), _jsxs("td", { className: "py-3 px-4 text-white font-bold", children: [j.target_volume_ml, " ml"] }), _jsx("td", { className: "py-3 px-4", children: _jsxs("span", { className: `font-bold ${j.dispensed_volume_ml >= j.target_volume_ml
                                                        ? 'text-emerald-400'
                                                        : j.dispensed_volume_ml > 0
                                                            ? 'text-amber-400'
                                                            : 'text-slate-500'}`, children: [j.dispensed_volume_ml || 0, " ml"] }) }), _jsx("td", { className: "py-3 px-4", children: getStatusBadge(j.status) }), _jsx("td", { className: "py-3 px-4 text-slate-400 text-[11px]", children: j.created_at ? new Date(j.created_at).toLocaleTimeString() : '—' }), _jsx("td", { className: "py-3 px-4 text-right", children: _jsx("button", { onClick: () => setSelectedJob(j), className: "p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition", title: "Inspect Job", children: _jsx(Eye, { className: "w-3.5 h-3.5" }) }) })] }, j.id));
                                })) })] }) }) }), selectedJob && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center border-b border-slate-800 pb-3", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-base font-bold text-white", children: "Dispense Job Inspection" }), _jsx("span", { className: "text-[11px] font-mono text-cyan-400", children: selectedJob.id })] }), _jsx("button", { onClick: () => setSelectedJob(null), className: "text-slate-400 hover:text-white p-1", children: "\u2715" })] }), _jsxs("div", { className: "space-y-3 text-xs font-mono", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800", children: [_jsxs("div", { children: [_jsx("span", { className: "text-slate-500 text-[10px] block", children: "ASSOCIATED ORDER" }), _jsx("span", { className: "text-white font-bold", children: selectedJob.order_id })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 text-[10px] block", children: "STATUS" }), _jsx("div", { className: "mt-0.5", children: getStatusBadge(selectedJob.status) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 text-[10px] block", children: "TARGET VOLUME" }), _jsxs("span", { className: "text-white font-bold", children: [selectedJob.target_volume_ml, " ml"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 text-[10px] block", children: "ACTUAL DISPENSED" }), _jsxs("span", { className: "text-emerald-400 font-bold", children: [selectedJob.dispensed_volume_ml || 0, " ml"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 text-[10px] block", children: "MACHINE CODE" }), _jsx("span", { className: "text-cyan-400", children: selectedJob.machine_id || 'AQ-DM-001' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 text-[10px] block", children: "CHANNEL NUMBER" }), _jsxs("span", { className: "text-cyan-400", children: ["CH ", selectedJob.channel_id] })] })] }), _jsxs("div", { className: "bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2", children: [_jsx("span", { className: "text-slate-400 font-bold block text-[11px]", children: "TIMELINE & TRANSITIONS" }), _jsxs("div", { className: "space-y-1 text-[11px] text-slate-300", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Created:" }), _jsx("span", { children: selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleString() : 'N/A' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Accepted:" }), _jsx("span", { children: selectedJob.accepted_at ? new Date(selectedJob.accepted_at).toLocaleString() : '—' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Started:" }), _jsx("span", { children: selectedJob.started_at ? new Date(selectedJob.started_at).toLocaleString() : '—' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Completed:" }), _jsx("span", { children: selectedJob.completed_at ? new Date(selectedJob.completed_at).toLocaleString() : '—' })] })] })] }), selectedJob.error_code && (_jsxs("div", { className: "bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-400", children: [_jsxs("span", { className: "font-bold block", children: ["FAILURE CODE: ", selectedJob.error_code] }), _jsx("span", { className: "text-[11px]", children: selectedJob.error_message || 'Hardware safety abort or timeout reported' })] }))] }), _jsx("div", { className: "flex justify-end pt-2", children: _jsx("button", { onClick: () => setSelectedJob(null), className: "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold", children: "Close" }) })] }) }))] }));
}
