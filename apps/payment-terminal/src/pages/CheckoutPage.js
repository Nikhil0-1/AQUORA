import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
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
    const [error, setError] = useState(null);
    if (items.length === 0) {
        return (_jsxs("div", { className: "min-h-screen pt-32 text-center text-white bg-black", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Your cart is empty" }), _jsx("button", { onClick: () => navigate('/'), className: "text-cyan-500 hover:underline", children: "Return to Menu" })] }));
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
        }
        catch (err) {
            console.error(err);
            setError(err.message || "An error occurred during checkout.");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen pt-24 pb-12 bg-black", children: _jsxs("div", { className: "container mx-auto px-4 max-w-4xl", children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-8 tracking-tight", children: "Checkout" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "bg-zinc-900 border border-white/10 rounded-3xl p-8", children: [_jsx("h2", { className: "text-xl font-bold text-white mb-6", children: "Order Summary" }), _jsx("div", { className: "space-y-4", children: items.map(item => (_jsxs("div", { className: "flex justify-between items-center py-2 border-b border-white/5 last:border-0", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-12 h-12 bg-black rounded-lg overflow-hidden", children: item.product.image_url && _jsx("img", { src: item.product.image_url, alt: item.product.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-medium", children: item.product.name }), _jsxs("p", { className: "text-gray-500 text-sm", children: ["Qty: ", item.quantity] })] })] }), _jsxs("p", { className: "font-mono text-white", children: ["\u20B9", (item.product.price * item.quantity).toFixed(2)] })] }, item.product.id))) })] }), _jsxs("div", { className: "bg-zinc-900 border border-white/10 rounded-3xl p-8", children: [_jsxs("h2", { className: "text-xl font-bold text-white mb-6 flex items-center space-x-2", children: [_jsx(CreditCard, { className: "w-6 h-6 text-gray-400" }), _jsx("span", { children: "Payment Details" })] }), _jsxs("div", { className: "bg-black/50 p-6 rounded-xl border border-white/5 flex items-center justify-between text-gray-400", children: [_jsx("span", { children: "Demo Mode" }), _jsx("span", { className: "font-mono", children: "Card on file ends in 4242" })] }), _jsxs("p", { className: "text-xs text-gray-500 mt-4 flex items-center", children: [_jsx(ShieldCheck, { className: "w-4 h-4 mr-1" }), " Payments are secure and encrypted."] })] })] }), _jsx("div", { className: "lg:col-span-1", children: _jsxs("div", { className: "bg-zinc-900 border border-white/10 rounded-3xl p-8 sticky top-28", children: [_jsx("h2", { className: "text-xl font-bold text-white mb-6", children: "Total" }), _jsxs("div", { className: "space-y-3 text-gray-400 mb-6 border-b border-white/5 pb-6", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Subtotal" }), _jsxs("span", { className: "text-white", children: ["\u20B9", total.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Tax" }), _jsx("span", { className: "text-white", children: "\u20B90.00" })] })] }), _jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("span", { className: "text-white font-bold text-lg", children: "Total" }), _jsxs("span", { className: "text-cyan-500 font-bold font-mono text-2xl", children: ["\u20B9", total.toFixed(2)] })] }), _jsxs("div", { className: "mb-4 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-xs flex items-center justify-between", children: [_jsx("span", { children: "Dispensing Station:" }), _jsxs("span", { className: "font-mono font-bold text-white", children: [effectiveMachineId, " (Online Station)"] })] }), error && (_jsx("div", { className: "mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm", children: error })), _jsx("button", { onClick: handleCheckout, disabled: loading, className: "w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2", children: loading ? (_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black" })) : (_jsxs(_Fragment, { children: [_jsx(ShieldCheck, { className: "w-5 h-5" }), _jsxs("span", { children: ["Pay \u20B9", total.toFixed(2)] })] })) })] }) })] })] }) }));
}
