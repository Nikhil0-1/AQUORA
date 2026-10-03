import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@aquora/api-client';
import { useCart } from '../context/CartContext';
import { useMachine } from '../context/MachineContext';
import { CreditCard, ShieldCheck } from 'lucide-react';

export function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { machineId } = useMachine();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 text-center text-white bg-black">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="text-cyan-500 hover:underline">
          Return to Menu
        </button>
      </div>
    );
  }

  const effectiveMachineId = machineId || 'AQ-DM-001';

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create Order with server-authoritative machine assignment and source tracking
      const order = await api.createOrder({
        machine_code: effectiveMachineId,
        source: 'PUBLIC_WEB',
        items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity, volume_ml: i.volume_ml || 250 }))
      });

      // 2. Initiate Payment Session
      const paymentData = await api.createPayment(order.id);

      // 3. Clear cart and navigate to live tracking page (awaiting webhook or terminal scan)
      clearCart();
      navigate(`/order/${order.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-black rounded-lg overflow-hidden">
                        {item.product.image_url && <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.product.name}</p>
                        <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-mono text-white">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-gray-400" />
                <span>Payment Details</span>
              </h2>
              <div className="bg-black/50 p-6 rounded-xl border border-white/5 flex items-center justify-between text-gray-400">
                <span>Demo Mode</span>
                <span className="font-mono">Card on file ends in 4242</span>
              </div>
              <p className="text-xs text-gray-500 mt-4 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1" /> Payments are secure and encrypted.
              </p>
            </div>
          </div>

          {/* Totals */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 sticky top-28">
              <h2 className="text-xl font-bold text-white mb-6">Total</h2>
              <div className="space-y-3 text-gray-400 mb-6 border-b border-white/5 pb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="text-white">₹0.00</span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-8">
                <span className="text-white font-bold text-lg">Total</span>
                <span className="text-cyan-500 font-bold font-mono text-2xl">₹{total.toFixed(2)}</span>
              </div>

              <div className="mb-4 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-xs flex items-center justify-between">
                <span>Dispensing Station:</span>
                <span className="font-mono font-bold text-white">{effectiveMachineId} (Online Station)</span>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Pay ₹{total.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
