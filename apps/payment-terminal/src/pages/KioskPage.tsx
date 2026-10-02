import React, { useState, useEffect, useRef } from 'react';
import { api } from '@aquora/api-client';
import { Product, ProductVariant, Order } from '@aquora/shared-types';
import { 
  Droplets, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard, 
  QrCode, 
  Activity,
  RefreshCw,
  Zap,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

const MACHINE_CODE = 'AQ-VM-001';

type KioskStep = 
  | 'WELCOME'
  | 'PRODUCTS'
  | 'QUANTITY'
  | 'SUMMARY'
  | 'PAYMENT'
  | 'DISPENSING'
  | 'COMPLETE'
  | 'FAILED';

export function KioskPage() {
  const [step, setStep] = useState<KioskStep>('WELCOME');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVolume, setSelectedVolume] = useState<number>(100);
  const [selectedPrice, setSelectedPrice] = useState<number>(35);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  // Dispensing Telemetry state
  const [dispenseProgress, setDispenseProgress] = useState<{
    dispensed_ml: number;
    target_ml: number;
    percentage: number;
    statusText: string;
  }>({ dispensed_ml: 0, target_ml: 100, percentage: 0, statusText: 'Initializing...' });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [autoHomeSeconds, setAutoHomeSeconds] = useState(10);

  // Canvas ref for liquid / aqua background effect
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch products from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const prods = await api.getProducts();
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load DB products', err);
      }
    };
    loadData();
  }, []);

  // Liquid aqua particle canvas animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 800);
    let height = (canvas.height = canvas.offsetHeight || 480);

    const particles: Array<{ x: number; y: number; radius: number; vx: number; vy: number; alpha: number }> = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 4 + 2,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.8 - 0.2,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) p.y = height + 10;
        if (p.x < 0 || p.x > width) p.vx *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [step]);

  // Auto Return Home Timer on Completion
  useEffect(() => {
    if (step !== 'COMPLETE') return;
    setAutoHomeSeconds(10);
    const interval = setInterval(() => {
      setAutoHomeSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleResetToWelcome();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const handleResetToWelcome = () => {
    setStep('WELCOME');
    setSelectedProduct(null);
    setSelectedVolume(100);
    setSelectedPrice(35);
    setCurrentOrder(null);
    setErrorMsg(null);
    setLoading(false);
  };

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    const defaultVol = prod.volume_ml || 100;
    setSelectedVolume(defaultVol);
    setSelectedPrice(prod.price || 35);
    setStep('QUANTITY');
  };

  const handleVolumeSelect = (volMl: number) => {
    setSelectedVolume(volMl);
    if (selectedProduct) {
      const basePrice = selectedProduct.price || 35;
      const baseVol = selectedProduct.volume_ml || 100;
      const calculatedPrice = Math.round(basePrice * (volMl / baseVol));
      setSelectedPrice(calculatedPrice);
    }
  };

  const handleCreateOrderAndPay = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Create Order in Backend
      const order = await api.createOrder({
        machine_code: MACHINE_CODE,
        items: [
          {
            product_id: selectedProduct.id,
            quantity: 1,
            volume_ml: selectedVolume,
          },
        ],
      });
      setCurrentOrder(order);
      setStep('PAYMENT');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!currentOrder) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      // Server-side payment verification & dispense job authorization
      const result = await api.processMockPayment({
        order_id: currentOrder.id,
        simulate_result: 'SUCCESS',
        payment_method: 'UPI_RAZORPAY',
      });

      if (result.success) {
        setStep('DISPENSING');
        startDispensingTelemetryPolling(currentOrder.id);
      } else {
        setStep('FAILED');
        setErrorMsg('Payment verification failed. No sanitizer was dispensed.');
      }
    } catch (err: any) {
      setStep('FAILED');
      setErrorMsg(err.message || 'Payment failure.');
    } finally {
      setLoading(false);
    }
  };

  const startDispensingTelemetryPolling = (orderId: string) => {
    let progressMl = 0;
    const targetMl = selectedVolume;

    setDispenseProgress({
      dispensed_ml: 0,
      target_ml: targetMl,
      percentage: 0,
      statusText: 'PAYMENT SUCCESS ✓ Authorizing Job...',
    });

    const interval = setInterval(async () => {
      progressMl += 20;
      const pct = Math.min(100, Math.round((progressMl / targetMl) * 100));

      setDispenseProgress({
        dispensed_ml: Math.min(progressMl, targetMl),
        target_ml: targetMl,
        percentage: pct,
        statusText: pct < 30 ? 'PUMP ACTIVATED ✓ Dispensing flow...' : pct < 90 ? 'DISPENSING SANITIZER...' : 'FINALIZING DISPENSE...',
      });

      if (progressMl >= targetMl) {
        clearInterval(interval);
        setStep('COMPLETE');
      }
    }, 400);
  };

  return (
    <div className="w-[800px] h-[480px] bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 overflow-hidden relative border-4 border-slate-900 rounded-3xl shadow-2xl select-none mx-auto my-auto">
      
      {/* Background Aqua Liquid Particles Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0" />

      {/* Top Header Bar for 800x480 Kiosk */}
      <header className="relative z-10 h-14 bg-slate-900/90 border-b border-slate-800/80 px-6 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-cyan-500/20">
            AQ
          </div>
          <div>
            <span className="font-bold text-slate-100 tracking-wider text-sm">AQUORA</span>
            <span className="text-[10px] text-cyan-400 block font-semibold -mt-0.5">Pay. Dispense. Done.</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{MACHINE_CODE}</span>
          </div>
          {step !== 'WELCOME' && step !== 'DISPENSING' && step !== 'COMPLETE' && (
            <button 
              onClick={handleResetToWelcome}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </header>

      {/* Content Container (426px remaining height) */}
      <main className="relative z-10 h-[424px] p-6 flex flex-col justify-between">

        {/* SCREEN 1: WELCOME SCREEN */}
        {step === 'WELCOME' && (
          <div className="h-full flex flex-col items-center justify-between text-center py-4">
            <div className="space-y-2 max-w-lg mt-2">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                <span>Smart Sanitizer Vending Machine</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">
                Touch Free. Instant Protection.
              </h1>
              <p className="text-sm text-slate-400">
                Select your formulation • Instant Indian UPI / Card Payment • Exact ml Flow Control
              </p>
            </div>

            {/* START BUTTON (Min 48px Touch Target) */}
            <div className="w-full max-w-sm">
              <button 
                onClick={() => setStep('PRODUCTS')}
                className="w-full py-5 bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-black text-xl rounded-2xl shadow-xl shadow-cyan-500/25 active:scale-98 transition-all flex items-center justify-center space-x-3 tracking-wider uppercase"
              >
                <span>TOUCH TO START</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Designed for India • 5 Independent Stainless Nozzles • Real Flow Measurement
            </div>
          </div>
        )}

        {/* SCREEN 2: PRODUCT SELECTION */}
        {step === 'PRODUCTS' && (
          <div className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Select Sanitizer Blend</h2>
                <p className="text-xs text-slate-400">Choose from 5 premium sanitizer formulations</p>
              </div>
              <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                Step 1 of 3
              </span>
            </div>

            {/* 5 Product Cards for 800x480 */}
            <div className="grid grid-cols-5 gap-3 my-auto">
              {products.map((prod) => (
                <div 
                  key={prod.id}
                  onClick={() => handleSelectProduct(prod)}
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-2xl flex flex-col justify-between cursor-pointer active:scale-95 transition-all shadow-md group"
                >
                  <div className="w-full h-20 bg-slate-950 rounded-xl overflow-hidden mb-2 border border-slate-800 flex items-center justify-center relative">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <Droplets className="w-8 h-8 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-100 leading-tight mb-1 truncate">{prod.name}</h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mb-2 leading-tight">{prod.short_description || prod.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                    <span className="text-cyan-400 font-bold text-xs">₹{prod.price}</span>
                    <span className="text-[10px] bg-cyan-500/15 text-cyan-300 font-semibold px-2 py-0.5 rounded-full">
                      Select
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
              <button 
                onClick={() => setStep('WELCOME')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-2 border border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <span className="text-[11px] text-slate-500">Touch any product card to select</span>
            </div>
          </div>
        )}

        {/* SCREEN 3: QUANTITY / VOLUME SELECTION */}
        {step === 'QUANTITY' && selectedProduct && (
          <div className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Select Dispense Volume</h2>
                <p className="text-xs text-slate-400">Choose quantity for {selectedProduct.name}</p>
              </div>
              <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                Step 2 of 3
              </span>
            </div>

            {/* 5 Volume Option Touch Buttons */}
            <div className="grid grid-cols-5 gap-3 my-auto">
              {[50, 100, 150, 250, 500].map((volMl) => {
                const isSel = selectedVolume === volMl;
                const basePrice = selectedProduct.price || 35;
                const calculatedPrice = Math.round(basePrice * (volMl / (selectedProduct.volume_ml || 100)));

                return (
                  <button
                    key={volMl}
                    onClick={() => handleVolumeSelect(volMl)}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all active:scale-95 ${
                      isSel 
                        ? 'bg-gradient-to-b from-cyan-500/20 to-sky-500/10 border-cyan-400 shadow-lg shadow-cyan-500/20 text-cyan-400' 
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Droplets className={`w-6 h-6 ${isSel ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="text-lg font-black">{volMl} ml</span>
                    <span className="text-xs font-mono font-bold text-slate-100">₹{calculatedPrice}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Summary Bar */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center font-bold text-cyan-400 border border-slate-800">
                  {selectedVolume}ml
                </div>
                <div>
                  <div className="font-bold text-slate-100">{selectedProduct.name}</div>
                  <div className="text-slate-400">Target Volume: {selectedVolume} ml</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Total Price</span>
                <span className="text-xl font-bold text-cyan-400 font-mono">₹{selectedPrice}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
              <button 
                onClick={() => setStep('PRODUCTS')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-2 border border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button 
                onClick={() => setStep('SUMMARY')}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
              >
                <span>Continue to Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: ORDER SUMMARY */}
        {step === 'SUMMARY' && selectedProduct && (
          <div className="h-full flex flex-col justify-between max-w-xl mx-auto w-full">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-100">Order Summary</h2>
                <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Step 3 of 3
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <Droplets className="w-8 h-8 text-cyan-400" />
                    <div>
                      <div className="font-bold text-slate-100 text-base">{selectedProduct.name}</div>
                      <div className="text-xs text-slate-400">{selectedProduct.short_description || selectedProduct.description}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-slate-200">
                    {selectedVolume} ml
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Machine Station:</span>
                    <span className="font-mono text-slate-200 font-bold">{MACHINE_CODE}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="font-mono text-slate-200">1 unit</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Hardware Fee:</span>
                    <span className="font-mono text-emerald-400 font-bold">Included (₹0)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-slate-100 text-sm">Total Payable</span>
                  <span className="text-2xl font-black text-cyan-400 font-mono">₹{selectedPrice}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
              <button 
                onClick={() => setStep('QUANTITY')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-2 border border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button 
                onClick={handleCreateOrderAndPay}
                disabled={loading}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>PROCEED TO PAY ₹{selectedPrice}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 5: PAYMENT GATEWAY */}
        {step === 'PAYMENT' && currentOrder && (
          <div className="h-full flex flex-col justify-between max-w-lg mx-auto w-full text-center">
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-1">Indian Payment Gateway</h2>
              <p className="text-xs text-slate-400 mb-4">Scan UPI QR Code or click Direct Test Payment</p>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col items-center space-y-4">
                <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
                  <QrCode className="w-32 h-32 text-slate-950" />
                </div>

                <div className="space-y-1 text-center">
                  <div className="text-xs font-semibold text-slate-300">UPI ID: aquora.vending@icici</div>
                  <div className="text-xl font-black text-cyan-400 font-mono">Amount: ₹{currentOrder.amount}</div>
                </div>

                <button 
                  onClick={handleSimulatePaymentSuccess}
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>SIMULATE SUCCESSFUL PAYMENT</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              Only backend-verified payments trigger physical dispensing jobs.
            </div>
          </div>
        )}

        {/* SCREEN 6: LIVE DISPENSING PROGRESS */}
        {step === 'DISPENSING' && (
          <div className="h-full flex flex-col justify-between text-center items-center py-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse">
                <Activity className="w-4 h-4" />
                <span>PUMP ACTIVE • SINGLE CHANNEL ISOLATION</span>
              </div>
              <h2 className="text-2xl font-black text-slate-100">Dispensing Sanitizer...</h2>
              <p className="text-xs text-slate-400">{dispenseProgress.statusText}</p>
            </div>

            {/* Circular / Linear Flow Counter */}
            <div className="w-full max-w-md space-y-4">
              <div className="text-5xl font-black text-cyan-400 font-mono tracking-wider">
                {dispenseProgress.dispensed_ml} <span className="text-lg font-normal text-slate-400">/ {dispenseProgress.target_ml} ml</span>
              </div>

              <div className="w-full bg-slate-900 h-6 rounded-full border border-slate-800 p-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-300 rounded-full transition-all duration-300 shadow-md shadow-cyan-500/30"
                  style={{ width: `${dispenseProgress.percentage}%` }}
                />
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Real flow sensor pulse measurement active</span>
            </div>
          </div>
        )}

        {/* SCREEN 7: DISPENSING COMPLETE */}
        {step === 'COMPLETE' && (
          <div className="h-full flex flex-col items-center justify-between text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold text-slate-100">✓ DISPENSING COMPLETE</h2>
              <p className="text-sm text-cyan-400 font-bold">
                {selectedVolume} ml dispensed successfully.
              </p>
              <p className="text-xs text-slate-400">Thank you for using AQUORA Smart Sanitizer.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl text-xs text-slate-400">
              Returning to Home Screen in <span className="text-cyan-400 font-bold font-mono">{autoHomeSeconds} seconds</span>
            </div>

            <button 
              onClick={handleResetToWelcome}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700"
            >
              Start New Order Now
            </button>
          </div>
        )}

        {/* SCREEN 8: PAYMENT / DISPENSE FAILURE */}
        {step === 'FAILED' && (
          <div className="h-full flex flex-col items-center justify-between text-center py-4">
            <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 rounded-full flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/20">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-bold text-slate-100">Payment / Dispense Failed</h2>
              <p className="text-xs text-slate-400">
                {errorMsg || 'No sanitizer has been dispensed. Please try again.'}
              </p>
            </div>

            <button 
              onClick={handleResetToWelcome}
              className="px-8 py-3 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20"
            >
              Try Again / Return Home
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
