import React, { useState, useEffect } from 'react';
import { api } from '@aquora/api-client';
import { Product } from '@aquora/shared-types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Search, 
  Filter, 
  Eye, 
  Droplets,
  Radio,
  ArrowRight
} from 'lucide-react';

interface Props {
  products: Product[];
  onRefresh: () => void;
}

export function AdminDispenseJobsView({ products, onRefresh }: Props) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const fetchJobs = async () => {
    try {
      const data = await api.getAdminJobs();
      setJobs(data || []);
    } catch (err) {
      console.warn('Failed to load dispense jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      (j.order_id && j.order_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (j.id && j.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (j.machine_id && j.machine_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'DISPENSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case 'DISPENSING':
      case 'STARTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse">
            <Radio className="w-3 h-3" />
            DISPENSING
          </span>
        );
      case 'QUEUED':
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock className="w-3 h-3" />
            {status}
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <XCircle className="w-3 h-3" />
            FAILED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Dispense Jobs Queue & History</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative lifecycle of hardware dispense jobs dispatched to System 2 dispensing controller.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              fetchJobs();
              onRefresh();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            title="Refresh Jobs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order ID or machine..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex gap-1.5 overflow-x-auto text-[11px] font-mono">
            {['ALL', 'QUEUED', 'DISPENSING', 'COMPLETED', 'FAILED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === st
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order / Job ID</th>
                <th className="py-3.5 px-4">Machine & CH</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Requested Vol</th>
                <th className="py-3.5 px-4">Actual Vol</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Time</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No dispense jobs found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => {
                  const prod = products.find((p) => p.id === j.product_id);
                  return (
                    <tr key={j.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white truncate max-w-[140px]">{j.order_id || j.id}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{j.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-cyan-400 font-bold">{j.machine_id || 'AQ-DM-001'}</div>
                        <div className="text-[11px] text-slate-400">Channel {j.channel_id}</div>
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-slate-200">
                        {prod ? prod.name : 'Sanitizer Solution'}
                      </td>
                      <td className="py-3 px-4 text-white font-bold">{j.target_volume_ml} ml</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            j.dispensed_volume_ml >= j.target_volume_ml
                              ? 'text-emerald-400'
                              : j.dispensed_volume_ml > 0
                              ? 'text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {j.dispensed_volume_ml || 0} ml
                        </span>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(j.status)}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {j.created_at ? new Date(j.created_at).toLocaleTimeString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedJob(j)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                          title="Inspect Job"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white">Dispense Job Inspection</h4>
                <span className="text-[11px] font-mono text-cyan-400">{selectedJob.id}</span>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] block">ASSOCIATED ORDER</span>
                  <span className="text-white font-bold">{selectedJob.order_id}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">STATUS</span>
                  <div className="mt-0.5">{getStatusBadge(selectedJob.status)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">TARGET VOLUME</span>
                  <span className="text-white font-bold">{selectedJob.target_volume_ml} ml</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">ACTUAL DISPENSED</span>
                  <span className="text-emerald-400 font-bold">{selectedJob.dispensed_volume_ml || 0} ml</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">MACHINE CODE</span>
                  <span className="text-cyan-400">{selectedJob.machine_id || 'AQ-DM-001'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">CHANNEL NUMBER</span>
                  <span className="text-cyan-400">CH {selectedJob.channel_id}</span>
                </div>
              </div>

              {/* State Machine Transition Timeline */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold block text-[11px]">TIMELINE & TRANSITIONS</span>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Created:</span>
                    <span>{selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Accepted:</span>
                    <span>{selectedJob.accepted_at ? new Date(selectedJob.accepted_at).toLocaleString() : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Started:</span>
                    <span>{selectedJob.started_at ? new Date(selectedJob.started_at).toLocaleString() : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Completed:</span>
                    <span>{selectedJob.completed_at ? new Date(selectedJob.completed_at).toLocaleString() : '—'}</span>
                  </div>
                </div>
              </div>

              {selectedJob.error_code && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-400">
                  <span className="font-bold block">FAILURE CODE: {selectedJob.error_code}</span>
                  <span className="text-[11px]">{selectedJob.error_message || 'Hardware safety abort or timeout reported'}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
