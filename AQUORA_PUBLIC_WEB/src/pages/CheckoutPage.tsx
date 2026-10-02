import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import { publicApi } from '../api';
import { ShieldCheck, CreditCard, Droplets, MapPin, ArrowRight, Lock } from 'lucide-react';

interface Props {
  cart: CartItem[];
  onClearCart: () => void;
}

export function CheckoutPage({ cart, onClearCart }: Props) {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
        <p className="text-xs text-slate-400">Please select a sanitizer formula from our catalog.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-cyan-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs"
        >
          Browse Formulas
        </button>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  const handlePayAndOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create Server-Authoritative Order
      const order = await publicApi.createOrder({
        customer_name: customerName || 'Online Guest',
        customer_phone: customerPhone,
        items: cart.map((c) => ({
          product_id: c.product.id,
          variant_id: c.variant?.id,
          quantity: c.quantity,
          volume_ml: c.volume_ml,
        })),
      });

      // 2. Process Payment via Gateway / Test pipeline
      const paymentResult = await publicApi.processPayment(order.id);

      if (paymentResult.success) {
        onClearCart();
        navigate(`/order/${order.id}`);
      } else {
        setError('Payment authorization could not be completed. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while creating order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      <div>
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">
          Secure Order
        </span>
        <h1 className="text-3xl font-extrabold text-white">Checkout & Dispense Setup</h1>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Order Details & Customer Form */}
        <form onSubmit={handlePayAndOrder} className="md:col-span-2 space-y-6">
          {/* Station Assignment */}
          <div className="bg-[#0A111E] border border-[#1E2C44] rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Dispensing Station Assignment</span>
            </h3>
            <div className="bg-[#050B14] p-4 rounded-2xl border border-[#1E2C44] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">AQUORA Dispenser 001</span>
                <span className="text-[11px] text-slate-400">Main Station (5 Active Channels)</span>
              </div>
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/40">
                AQ-DM-001
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Assigned automatically by server. Walk up to station AQ-DM-001 after completing payment.
            </p>
          </div>

          {/* Optional Contact Form */}
          <div className="bg-[#0A111E] border border-[#1E2C44] rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Customer Details (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#050B14] border border-[#1E2C44] rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-[#050B14] border border-[#1E2C44] rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-[#0A111E] border border-[#1E2C44] rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span>Razorpay Instant Payment</span>
            </h3>
            <div className="bg-[#050B14] p-4 rounded-2xl border border-[#1E2C44] flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  ₹
                </div>
                <span>UPI / Netbanking / Credit & Debit Cards</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>256-bit encrypted secure transaction</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-4 rounded-2xl text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <span>Pay ₹{subtotal.toFixed(2)} & Dispense</span>
              </>
            )}
          </button>
        </form>

        {/* Order Summary Sidebar */}
        <div className="bg-[#0A111E] border border-[#1E2C44] rounded-3xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-white">Order Summary</h3>

          <div className="divide-y divide-[#1E2C44]/80 space-y-3">
            {cart.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-white line-clamp-1">{item.product.name}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {item.volume_ml}ml × {item.quantity}
                  </span>
                </div>
                <span className="font-mono font-bold text-white">
                  ₹{(item.unit_price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#1E2C44] space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-white">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Station Fee</span>
              <span className="font-mono text-emerald-400">FREE</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-[#1E2C44]">
              <span>Total Payable</span>
              <span className="text-cyan-400 text-lg font-mono">₹{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
