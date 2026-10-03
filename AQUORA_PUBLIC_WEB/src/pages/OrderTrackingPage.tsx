import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order } from '../types';
import { publicApi } from '../api';
import { CheckCircle2, Clock, Droplets, MapPin, AlertCircle, ArrowLeft, RefreshCw, XCircle, ShieldAlert } from 'lucide-react';

export function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Poll for genuine hardware dispense state from backend
  useEffect(() => {
    if (!id) return;

    let mounted = true;

    const fetchStatus = async () => {
      try {
        const liveOrder = await publicApi.getOrder(id);
        if (mounted) {
          if (liveOrder) {
            setOrder(liveOrder);
            setErrorMsg(null);
          } else if (!order) {
            setErrorMsg('Order not found on server or session expired.');
          }
        }
      } catch (err: any) {
        if (mounted) {
          console.error('Error fetching order status:', err);
          setErrorMsg(err.message || 'Failed to connect to backend.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [id]);

  if (loading && !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPaid = order?.payment_status === 'PAID';
  const isDispensing = isPaid && order?.order_status === 'DISPENSING';
  const isComplete = isPaid && order?.order_status === 'DISPENSED';
  const isQueued = isPaid && order?.order_status === 'QUEUED';
  const isFailed = order?.order_status === 'FAILED' || order?.payment_status === 'FAILED';
  const isPendingPayment = !isPaid && !isFailed;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8 font-sans">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Catalog</span>
      </button>

      {errorMsg && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-2xl text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Status Card */}
      <div className="bg-[#0A111E] border border-[#1E2C44] rounded-3xl p-8 shadow-2xl space-y-8 text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* State Icon */}
        <div className="relative z-10">
          {isComplete ? (
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-in zoom-in-95">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
          ) : isDispensing ? (
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto relative">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <Droplets className="w-8 h-8 animate-pulse" />
            </div>
          ) : isFailed ? (
            <div className="w-20 h-20 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
          ) : isPendingPayment ? (
            <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Status Texts */}
        <div className="space-y-2 relative z-10">
          <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
            {order?.order_number || id}
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            {isComplete
              ? 'Sanitizer Dispensed!'
              : isDispensing
              ? 'Dispensing In Progress...'
              : isFailed
              ? 'Payment or Dispense Failed'
              : isPendingPayment
              ? 'Payment Pending Verification'
              : 'Order Queued & Waiting'}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {isComplete
              ? 'Your sanitizer has been precision-dispensed and confirmed by flow sensor. Thank you for using AQUORA.'
              : isDispensing
              ? 'System 2 pump is active. Please keep your hands or bottle beneath nozzle at Station AQ-DM-001.'
              : isFailed
              ? 'Payment was declined or cancelled. No sanitizer was dispensed.'
              : isPendingPayment
              ? 'Payment has not been confirmed by Razorpay. System 2 will NEVER dispense without verified payment.'
              : 'Payment confirmed. System 2 is queuing your dispense request at Station AQ-DM-001.'}
          </p>
        </div>

        {/* Dispense Pipeline Step Tracker */}
        <div className="bg-[#050B14] p-5 rounded-2xl border border-[#1E2C44] text-left space-y-4">
          {/* Step 1: Order Created */}
          <div className="flex items-center gap-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1 flex justify-between">
              <span className="font-semibold text-white">Order Created</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {order?.source || 'PUBLIC_WEB'}
              </span>
            </div>
          </div>

          {/* Step 2: Payment Verification */}
          <div className="flex items-center gap-3 text-xs">
            {isPaid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : isFailed ? (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
            )}
            <div className="flex-1 flex justify-between">
              <span className={`font-semibold ${isPaid ? 'text-white' : 'text-amber-400'}`}>
                {isPaid ? 'Payment Verified' : isFailed ? 'Payment Failed' : 'Payment Verification Pending'}
              </span>
              <span className={`text-[11px] font-mono font-bold ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {order?.payment_status} (₹{order?.amount ? order.amount.toFixed(2) : '0.00'})
              </span>
            </div>
          </div>

          {/* Step 3: Dispense Queue */}
          <div className="flex items-center gap-3 text-xs">
            {isComplete || isDispensing ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : isQueued ? (
              <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-slate-800 shrink-0" />
            )}
            <div className="flex-1 flex justify-between">
              <span className={`font-semibold ${isPaid ? 'text-white' : 'text-slate-500'}`}>
                Station Dispense Queue
              </span>
              <span className="text-[11px] text-cyan-400 font-mono">
                {order?.machine_code || 'AQ-DM-001'}
              </span>
            </div>
          </div>

          {/* Step 4: Flow Sensor Confirmation */}
          <div className="flex items-center gap-3 text-xs">
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : isDispensing ? (
              <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-slate-800 shrink-0" />
            )}
            <div className="flex-1 flex justify-between">
              <span className={`font-semibold ${isComplete ? 'text-white' : 'text-slate-500'}`}>
                Flow Sensor Verified Dispense
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {isComplete ? 'DISPENSED' : isDispensing ? 'PUMP ACTIVE' : 'LOCKED'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
