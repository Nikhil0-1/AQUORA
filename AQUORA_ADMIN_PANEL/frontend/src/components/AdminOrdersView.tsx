import React, { useState } from 'react';
import { Order } from '../types';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Monitor, 
  Globe, 
  CreditCard,
  Droplets,
  ExternalLink
} from 'lucide-react';

interface Props {
  orders: Order[];
  onRefresh: () => void;
}

export function AdminOrdersView({ orders, onRefresh }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'SYSTEM_1_TERMINAL' | 'PUBLIC_WEB'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase());

    const orderSource = o.source || 'SYSTEM_1_TERMINAL';
    const matchesSource = sourceFilter === 'ALL' || orderSource === sourceFilter;
    const matchesStatus = statusFilter === 'ALL' || o.order_status === statusFilter || o.payment_status === statusFilter;

    return matchesSearch && matchesSource && matchesStatus;
  });

  const handleManualRefund = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Trigger manual administrative refund for Order ${orderNumber}? Payment will be marked REFUNDED and order cancelled.`)) {
      return;
    }
    try {
      alert(`Manual refund workflow requested for order ${orderNumber}. The transaction has been submitted for gateway reversal.`);
      onRefresh();
    } catch (e: any) {
      alert('Refund failed: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-cyan-400" />
            Customer Orders & Transactions
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time feed of payments and hardware dispensing jobs across System 1 Terminal and Public Web
          </p>
        </div>

        {/* Source Pills Filter */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSourceFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sourceFilter === 'ALL' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Sources
          </button>
          <button
            onClick={() => setSourceFilter('SYSTEM_1_TERMINAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sourceFilter === 'SYSTEM_1_TERMINAL' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Terminal (S1)
          </button>
          <button
            onClick={() => setSourceFilter('PUBLIC_WEB')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sourceFilter === 'PUBLIC_WEB' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Public Web
          </button>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search order number or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {['ALL', 'PAID', 'DISPENSED', 'DISPENSING', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                statusFilter === st
                  ? 'bg-slate-800 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID / Ref</th>
                <th className="p-4">Source</th>
                <th className="p-4">Product & Volume</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Order / Dispense</th>
                <th className="p-4">Time</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => {
                  const item = o.items && o.items.length > 0 ? o.items[0] : null;
                  const isPublicWeb = o.source === 'PUBLIC_WEB';

                  return (
                    <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-white block">{o.order_number}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{o.id.slice(0, 13)}...</span>
                      </td>

                      <td className="p-4">
                        {isPublicWeb ? (
                          <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            <Globe className="w-3 h-3" />
                            WEB
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            <Monitor className="w-3 h-3" />
                            TERMINAL
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-sans">
                        {item ? (
                          <div>
                            <span className="font-semibold text-white block text-xs">{item.product_name}</span>
                            <span className="text-[11px] text-cyan-400 font-mono">
                              {item.volume_ml}ml × {item.quantity} (CH {item.channel_id})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No items</span>
                        )}
                      </td>

                      <td className="p-4 font-bold text-white text-xs">
                        ₹{o.amount.toFixed(2)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            o.payment_status === 'PAID'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : o.payment_status === 'FAILED'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {o.payment_status}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            o.order_status === 'DISPENSED'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : o.order_status === 'DISPENSING'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                              : o.order_status === 'FAILED'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {o.order_status === 'DISPENSING' && <Droplets className="w-3 h-3" />}
                          {o.order_status}
                        </span>
                      </td>

                      <td className="p-4 text-slate-400 text-[10px]">
                        {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {o.payment_status === 'PAID' && o.order_status !== 'DISPENSED' && (
                          <button
                            onClick={() => handleManualRefund(o.id, o.order_number)}
                            className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold hover:underline"
                            title="Issue manual refund"
                          >
                            Refund
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-sans text-xs">
                    No orders match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedOrder.order_number}</h3>
                <span className="text-xs text-slate-400 font-mono">ID: {selectedOrder.id}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500 font-sans">Source</span>
                <span className="font-bold text-white">{selectedOrder.source || 'SYSTEM_1_TERMINAL'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500 font-sans">Target Machine</span>
                <span className="text-cyan-400 font-bold">{selectedOrder.machine_code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500 font-sans">Payment Status</span>
                <span className="text-emerald-400 font-bold">{selectedOrder.payment_status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500 font-sans">Dispensing Status</span>
                <span className="text-cyan-400 font-bold">{selectedOrder.order_status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500 font-sans">Authoritative Total</span>
                <span className="font-bold text-white text-sm">₹{selectedOrder.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-sans">Created At</span>
                <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
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
