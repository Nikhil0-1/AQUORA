import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '@aquora/api-client';
import { Order } from '@aquora/shared-types';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

export function OrderReadyPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Initial fetch
    const fetchOrder = () => {
      api.getOrder(id).then(o => {
        setOrder(o);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    };
    
    fetchOrder();
    
    // Poll for order status updates
    const interval = setInterval(() => {
      fetchOrder();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <button onClick={() => navigate('/')} className="text-cyan-500 hover:underline">Return Home</button>
      </div>
    );
  }

  const isReadyToScan = order.order_status === 'QUEUED' || order.order_status === 'AUTHORIZED';
  const isDispensing = order.order_status === 'DISPENSING';
  const isComplete = order.order_status === 'DISPENSED';
  const isFailed = order.order_status === 'FAILED';
  const isExpired = order.order_status === 'CANCELLED';

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black flex flex-col items-center">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        
        {isReadyToScan && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Ready to Dispense</h1>
            <p className="text-xl text-gray-400">Scan this QR code at Machine {order.machine_code}</p>
            
            <div className="flex justify-center p-8">
              {token ? (
                <QRCodeDisplay token={token} />
              ) : (
                <div className="p-4 bg-red-500/10 text-red-500 rounded-xl">Token not found in URL</div>
              )}
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex items-center justify-center space-x-4 text-gray-400">
              <Clock className="w-5 h-5 text-cyan-500" />
              <span>Token expires in 5 minutes</span>
            </div>
          </div>
        )}

        {isDispensing && (
          <div className="space-y-8 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-cyan-500 font-bold text-sm">DISPENSING</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Preparing your sanitizer...</h1>
            <p className="text-xl text-gray-400">Please place your cup under the nozzle.</p>
          </div>
        )}

        {isComplete && (
          <div className="space-y-8 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-32 h-32 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Enjoy your sanitizer!</h1>
            <p className="text-xl text-gray-400">Your order has been dispensed successfully.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-8 bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform inline-block"
            >
              Order Again
            </button>
          </div>
        )}

        {isFailed && (
          <div className="space-y-8 py-20">
            <div className="w-32 h-32 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-20 h-20 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Dispense Failed</h1>
            <p className="text-xl text-gray-400">There was a hardware error during dispensing. You will be refunded automatically.</p>
          </div>
        )}

        {isExpired && (
          <div className="space-y-8 py-20">
            <div className="w-32 h-32 mx-auto bg-gray-500/20 rounded-full flex items-center justify-center">
              <XCircle className="w-20 h-20 text-gray-500" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">QR Code Expired</h1>
            <p className="text-xl text-gray-400">This token has expired. Please contact support or place a new order.</p>
          </div>
        )}

      </div>
    </div>
  );
}
