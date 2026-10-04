import React, { useState, useEffect } from 'react';
import { api } from '@aquora/api-client';
import { ShieldCheck, RefreshCw, Clock, User, FileText, Search } from 'lucide-react';

export function AdminAuditLogsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      const data = await api.getAuditLogs();
      setLogs(data || []);
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      (l.action && l.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.actor_id && l.actor_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      JSON.stringify(l.details || {}).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Security & Configuration Audit Logs</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative immutable record of all product, variant, pricing, channel mapping, and calibration changes.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchLogs();
          }}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          title="Refresh audit trail"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by action, user ID, or details..."
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-500">
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-bold">{l.actor_id || 'ADMIN'}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">
                      {typeof l.details === 'object' ? JSON.stringify(l.details) : String(l.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
