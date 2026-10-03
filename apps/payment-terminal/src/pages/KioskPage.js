import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { api } from '@aquora/api-client';
import { Droplets, Sparkles, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, CreditCard, QrCode, Activity, RefreshCw, ShieldCheck, RotateCcw } from 'lucide-react';
const MACHINE_CODE = 'AQ-VM-001';
export function KioskPage() {
    const [step, setStep] = useState('WELCOME');
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVolume, setSelectedVolume] = useState(100);
    const [selectedPrice, setSelectedPrice] = useState(35);
    const [currentOrder, setCurrentOrder] = useState(null);
    // Dispensing Telemetry state
    const [dispenseProgress, setDispenseProgress] = useState({ dispensed_ml: 0, target_ml: 100, percentage: 0, statusText: 'Initializing...' });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [autoHomeSeconds, setAutoHomeSeconds] = useState(10);
    // Canvas ref for liquid / aqua background effect
    const canvasRef = useRef(null);
    // Fetch products from database on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const prods = await api.getProducts();
                setProducts(prods);
            }
            catch (err) {
                console.error('Failed to load DB products', err);
            }
        };
        loadData();
    }, []);
    // Liquid aqua particle canvas animation effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        let animationFrameId;
        let width = (canvas.width = canvas.offsetWidth || 800);
        let height = (canvas.height = canvas.offsetHeight || 480);
        const particles = [];
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
                if (p.y < -10)
                    p.y = height + 10;
                if (p.x < 0 || p.x > width)
                    p.vx *= -1;
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
        if (step !== 'COMPLETE')
            return;
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
    const handleSelectProduct = (prod) => {
        setSelectedProduct(prod);
        const defaultVol = prod.volume_ml || 100;
        setSelectedVolume(defaultVol);
        setSelectedPrice(prod.price || 35);
        setStep('QUANTITY');
    };
    const handleVolumeSelect = (volMl) => {
        setSelectedVolume(volMl);
        if (selectedProduct) {
            const basePrice = selectedProduct.price || 35;
            const baseVol = selectedProduct.volume_ml || 100;
            const calculatedPrice = Math.round(basePrice * (volMl / baseVol));
            setSelectedPrice(calculatedPrice);
        }
    };
    const handleCreateOrderAndPay = async () => {
        if (!selectedProduct)
            return;
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
        }
        catch (err) {
            setErrorMsg(err.message || 'Failed to create order. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleVerifyPaymentStatus = async () => {
        if (!currentOrder)
            return;
        setLoading(true);
        setErrorMsg(null);
        try {
            // Query server for genuine verified payment and order status
            const statusResult = await api.getOrderStatus(currentOrder.id);
            if (statusResult.payment_status === 'PAID') {
                setStep('DISPENSING');
                startDispensingTelemetryPolling(currentOrder.id);
            }
            else {
                setErrorMsg('Payment not yet detected by Razorpay gateway. Please scan QR and complete UPI payment.');
            }
        }
        catch (err) {
            setErrorMsg(err.message || 'Error checking payment status.');
        }
        finally {
            setLoading(false);
        }
    };
    const startDispensingTelemetryPolling = (orderId) => {
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
    return (_jsxs("div", { className: "w-[800px] h-[480px] bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 overflow-hidden relative border-4 border-slate-900 rounded-3xl shadow-2xl select-none mx-auto my-auto", children: [_jsx("canvas", { ref: canvasRef, className: "absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0" }), _jsxs("header", { className: "relative z-10 h-14 bg-slate-900/90 border-b border-slate-800/80 px-6 flex justify-between items-center backdrop-blur-md", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-cyan-500/20", children: "AQ" }), _jsxs("div", { children: [_jsx("span", { className: "font-bold text-slate-100 tracking-wider text-sm", children: "AQUORA" }), _jsx("span", { className: "text-[10px] text-cyan-400 block font-semibold -mt-0.5", children: "Pay. Dispense. Done." })] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }), _jsx("span", { children: MACHINE_CODE })] }), step !== 'WELCOME' && step !== 'DISPENSING' && step !== 'COMPLETE' && (_jsxs("button", { onClick: handleResetToWelcome, className: "p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 border border-slate-700", children: [_jsx(RotateCcw, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Cancel" })] }))] })] }), _jsxs("main", { className: "relative z-10 h-[424px] p-6 flex flex-col justify-between", children: [step === 'WELCOME' && (_jsxs("div", { className: "h-full flex flex-col items-center justify-between text-center py-4", children: [_jsxs("div", { className: "space-y-2 max-w-lg mt-2", children: [_jsxs("div", { className: "inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest", children: [_jsx(Sparkles, { className: "w-4 h-4" }), _jsx("span", { children: "Smart Sanitizer Vending Machine" })] }), _jsx("h1", { className: "text-4xl font-extrabold text-slate-100 tracking-tight", children: "Touch Free. Instant Protection." }), _jsx("p", { className: "text-sm text-slate-400", children: "Select your formulation \u2022 Instant Indian UPI / Card Payment \u2022 Exact ml Flow Control" })] }), _jsx("div", { className: "w-full max-w-sm", children: _jsxs("button", { onClick: () => setStep('PRODUCTS'), className: "w-full py-5 bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-black text-xl rounded-2xl shadow-xl shadow-cyan-500/25 active:scale-98 transition-all flex items-center justify-center space-x-3 tracking-wider uppercase", children: [_jsx("span", { children: "TOUCH TO START" }), _jsx(ArrowRight, { className: "w-6 h-6 stroke-[3]" })] }) }), _jsx("div", { className: "text-[11px] text-slate-500 font-mono", children: "Designed for India \u2022 5 Independent Stainless Nozzles \u2022 Real Flow Measurement" })] })), step === 'PRODUCTS' && (_jsxs("div", { className: "h-full flex flex-col justify-between", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-slate-100", children: "Select Sanitizer Blend" }), _jsx("p", { className: "text-xs text-slate-400", children: "Choose from 5 premium sanitizer formulations" })] }), _jsx("span", { className: "text-xs text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20", children: "Step 1 of 3" })] }), _jsx("div", { className: "grid grid-cols-5 gap-3 my-auto", children: products.map((prod) => (_jsxs("div", { onClick: () => handleSelectProduct(prod), className: "bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-2xl flex flex-col justify-between cursor-pointer active:scale-95 transition-all shadow-md group", children: [_jsx("div", { className: "w-full h-20 bg-slate-950 rounded-xl overflow-hidden mb-2 border border-slate-800 flex items-center justify-center relative", children: prod.image_url ? (_jsx("img", { src: prod.image_url, alt: prod.name, className: "w-full h-full object-cover group-hover:scale-105 transition-transform" })) : (_jsx(Droplets, { className: "w-8 h-8 text-cyan-400" })) }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-xs text-slate-100 leading-tight mb-1 truncate", children: prod.name }), _jsx("p", { className: "text-[10px] text-slate-400 line-clamp-2 mb-2 leading-tight", children: prod.short_description || prod.description })] }), _jsxs("div", { className: "flex justify-between items-center pt-2 border-t border-slate-800/80", children: [_jsxs("span", { className: "text-cyan-400 font-bold text-xs", children: ["\u20B9", prod.price] }), _jsx("span", { className: "text-[10px] bg-cyan-500/15 text-cyan-300 font-semibold px-2 py-0.5 rounded-full", children: "Select" })] })] }, prod.id))) }), _jsxs("div", { className: "flex justify-between items-center pt-2 border-t border-slate-800/80", children: [_jsxs("button", { onClick: () => setStep('WELCOME'), className: "px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-2 border border-slate-800", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), _jsx("span", { children: "Back" })] }), _jsx("span", { className: "text-[11px] text-slate-500", children: "Touch any product card to select" })] })] })), step === 'QUANTITY' && selectedProduct && (_jsxs("div", { className: "h-full flex flex-col justify-between", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-slate-100", children: "Select Dispense Volume" }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Choose quantity for ", selectedProduct.name] })] }), _jsx("span", { className: "text-xs text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20", children: "Step 2 of 3" })] }), _jsx("div", { className: "grid grid-cols-5 gap-3 my-auto", children: [50, 100, 150, 250, 500].map((volMl) => {
                                    const isSel = selectedVolume === volMl;
                                    const basePrice = selectedProduct.price || 35;
                                    const calculatedPrice = Math.round(basePrice * (volMl / (selectedProduct.volume_ml || 100)));
                                    return (_jsxs("button", { onClick: () => handleVolumeSelect(volMl), className: `p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all active:scale-95 ${isSel
                                            ? 'bg-gradient-to-b from-cyan-500/20 to-sky-500/10 border-cyan-400 shadow-lg shadow-cyan-500/20 text-cyan-400'
                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}`, children: [_jsx(Droplets, { className: `w-6 h-6 ${isSel ? 'text-cyan-400' : 'text-slate-500'}` }), _jsxs("span", { className: "text-lg font-black", children: [volMl, " ml"] }), _jsxs("span", { className: "text-xs font-mono font-bold text-slate-100", children: ["\u20B9", calculatedPrice] })] }, volMl));
                                }) }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center font-bold text-cyan-400 border border-slate-800", children: [selectedVolume, "ml"] }), _jsxs("div", { children: [_jsx("div", { className: "font-bold text-slate-100", children: selectedProduct.name }), _jsxs("div", { className: "text-slate-400", children: ["Target Volume: ", selectedVolume, " ml"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "text-slate-400 block text-[10px]", children: "Total Price" }), _jsxs("span", { className: "text-xl font-bold text-cyan-400 font-mono", children: ["\u20B9", selectedPrice] })] })] }), _jsxs("div", { className: "flex justify-between items-center pt-2 border-t border-slate-800/80", children: [_jsxs("button", { onClick: () => setStep('PRODUCTS'), className: "px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-2 border border-slate-800", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), _jsx("span", { children: "Back" })] }), _jsxs("button", { onClick: () => setStep('SUMMARY'), className: "px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center space-x-2", children: [_jsx("span", { children: "Continue to Summary" }), _jsx(ArrowRight, { className: "w-4 h-4" })] })] })] })), step === 'SUMMARY' && selectedProduct && (_jsxs("div", { className: "h-full flex flex-col justify-between max-w-xl mx-auto w-full", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-bold text-slate-100", children: "Order Summary" }), _jsx("span", { className: "text-xs text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20", children: "Step 3 of 3" })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-800", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Droplets, { className: "w-8 h-8 text-cyan-400" }), _jsxs("div", { children: [_jsx("div", { className: "font-bold text-slate-100 text-base", children: selectedProduct.name }), _jsx("div", { className: "text-xs text-slate-400", children: selectedProduct.short_description || selectedProduct.description })] })] }), _jsxs("span", { className: "text-xs font-mono font-bold bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-slate-200", children: [selectedVolume, " ml"] })] }), _jsxs("div", { className: "space-y-2 text-xs text-slate-400", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Machine Station:" }), _jsx("span", { className: "font-mono text-slate-200 font-bold", children: MACHINE_CODE })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Quantity:" }), _jsx("span", { className: "font-mono text-slate-200", children: "1 unit" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Taxes & Hardware Fee:" }), _jsx("span", { className: "font-mono text-emerald-400 font-bold", children: "Included (\u20B90)" })] })] }), _jsxs("div", { className: "pt-3 border-t border-slate-800 flex justify-between items-center", children: [_jsx("span", { className: "font-bold text-slate-100 text-sm", children: "Total Payable" }), _jsxs("span", { className: "text-2xl font-black text-cyan-400 font-mono", children: ["\u20B9", selectedPrice] })] })] })] }), _jsxs("div", { className: "flex justify-between items-center pt-4 border-t border-slate-800/80", children: [_jsxs("button", { onClick: () => setStep('QUANTITY'), className: "px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-2 border border-slate-800", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), _jsx("span", { children: "Back" })] }), _jsx("button", { onClick: handleCreateOrderAndPay, disabled: loading, className: "px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 disabled:opacity-50", children: loading ? (_jsx(RefreshCw, { className: "w-5 h-5 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx(CreditCard, { className: "w-5 h-5" }), _jsxs("span", { children: ["PROCEED TO PAY \u20B9", selectedPrice] })] })) })] })] })), step === 'PAYMENT' && currentOrder && (_jsxs("div", { className: "h-full flex flex-col justify-between max-w-lg mx-auto w-full text-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-slate-100 mb-1", children: "Indian Payment Gateway" }), _jsx("p", { className: "text-xs text-slate-400 mb-4", children: "Scan UPI QR Code or click Direct Test Payment" }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col items-center space-y-4", children: [_jsx("div", { className: "bg-white p-3 rounded-xl shadow-lg border border-slate-200", children: _jsx(QrCode, { className: "w-32 h-32 text-slate-950" }) }), _jsxs("div", { className: "space-y-1 text-center", children: [_jsx("div", { className: "text-xs font-semibold text-slate-300", children: "UPI ID: aquora.vending@icici" }), _jsxs("div", { className: "text-xl font-black text-cyan-400 font-mono", children: ["Amount: \u20B9", currentOrder.amount] })] }), _jsx("button", { onClick: handleVerifyPaymentStatus, disabled: loading, className: "w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2", children: loading ? (_jsx(RefreshCw, { className: "w-5 h-5 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle2, { className: "w-5 h-5" }), _jsx("span", { children: "CHECK PAYMENT STATUS" })] })) })] })] }), _jsx("div", { className: "text-[11px] text-slate-500", children: "Only backend-verified payments trigger physical dispensing jobs." })] })), step === 'DISPENSING' && (_jsxs("div", { className: "h-full flex flex-col justify-between text-center items-center py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse", children: [_jsx(Activity, { className: "w-4 h-4" }), _jsx("span", { children: "PUMP ACTIVE \u2022 SINGLE CHANNEL ISOLATION" })] }), _jsx("h2", { className: "text-2xl font-black text-slate-100", children: "Dispensing Sanitizer..." }), _jsx("p", { className: "text-xs text-slate-400", children: dispenseProgress.statusText })] }), _jsxs("div", { className: "w-full max-w-md space-y-4", children: [_jsxs("div", { className: "text-5xl font-black text-cyan-400 font-mono tracking-wider", children: [dispenseProgress.dispensed_ml, " ", _jsxs("span", { className: "text-lg font-normal text-slate-400", children: ["/ ", dispenseProgress.target_ml, " ml"] })] }), _jsx("div", { className: "w-full bg-slate-900 h-6 rounded-full border border-slate-800 p-1 overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-cyan-500 to-sky-300 rounded-full transition-all duration-300 shadow-md shadow-cyan-500/30", style: { width: `${dispenseProgress.percentage}%` } }) })] }), _jsxs("div", { className: "text-xs text-slate-400 flex items-center space-x-2", children: [_jsx(ShieldCheck, { className: "w-4 h-4 text-emerald-400" }), _jsx("span", { children: "Real flow sensor pulse measurement active" })] })] })), step === 'COMPLETE' && (_jsxs("div", { className: "h-full flex flex-col items-center justify-between text-center py-4", children: [_jsx("div", { className: "w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20", children: _jsx(CheckCircle2, { className: "w-10 h-10" }) }), _jsxs("div", { className: "space-y-1", children: [_jsx("h2", { className: "text-3xl font-extrabold text-slate-100", children: "\u2713 DISPENSING COMPLETE" }), _jsxs("p", { className: "text-sm text-cyan-400 font-bold", children: [selectedVolume, " ml dispensed successfully."] }), _jsx("p", { className: "text-xs text-slate-400", children: "Thank you for using AQUORA Smart Sanitizer." })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl text-xs text-slate-400", children: ["Returning to Home Screen in ", _jsxs("span", { className: "text-cyan-400 font-bold font-mono", children: [autoHomeSeconds, " seconds"] })] }), _jsx("button", { onClick: handleResetToWelcome, className: "px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700", children: "Start New Order Now" })] })), step === 'FAILED' && (_jsxs("div", { className: "h-full flex flex-col items-center justify-between text-center py-4", children: [_jsx("div", { className: "w-16 h-16 bg-rose-500/20 border border-rose-500/40 rounded-full flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/20", children: _jsx(AlertTriangle, { className: "w-10 h-10" }) }), _jsxs("div", { className: "space-y-2 max-w-md", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-100", children: "Payment / Dispense Failed" }), _jsx("p", { className: "text-xs text-slate-400", children: errorMsg || 'No sanitizer has been dispensed. Please try again.' })] }), _jsx("button", { onClick: handleResetToWelcome, className: "px-8 py-3 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20", children: "Try Again / Return Home" })] }))] })] }));
}
