import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '@aquora/api-client';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
export function OrderReadyPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!id)
            return;
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
        return (_jsx("div", { className: "min-h-screen pt-24 pb-12 flex items-center justify-center bg-black", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" }) }));
    }
    if (!order) {
        return (_jsxs("div", { className: "min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-black text-white", children: [_jsx("h1", { className: "text-3xl font-bold mb-4", children: "Order Not Found" }), _jsx("button", { onClick: () => navigate('/'), className: "text-cyan-500 hover:underline", children: "Return Home" })] }));
    }
    const isReadyToScan = order.order_status === 'QUEUED' || order.order_status === 'AUTHORIZED';
    const isDispensing = order.order_status === 'DISPENSING';
    const isComplete = order.order_status === 'DISPENSED';
    const isFailed = order.order_status === 'FAILED';
    const isExpired = order.order_status === 'CANCELLED';
    return (_jsx("div", { className: "min-h-screen pt-24 pb-12 bg-black flex flex-col items-center", children: _jsxs("div", { className: "container mx-auto px-4 max-w-2xl text-center", children: [isReadyToScan && (_jsxs("div", { className: "space-y-8 animate-in fade-in zoom-in duration-500", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold text-white tracking-tight", children: "Ready to Dispense" }), _jsxs("p", { className: "text-xl text-gray-400", children: ["Scan this QR code at Machine ", order.machine_code] }), _jsx("div", { className: "flex justify-center p-8", children: token ? (_jsx(QRCodeDisplay, { token: token })) : (_jsx("div", { className: "p-4 bg-red-500/10 text-red-500 rounded-xl", children: "Token not found in URL" })) }), _jsxs("div", { className: "bg-zinc-900 border border-white/10 rounded-2xl p-6 flex items-center justify-center space-x-4 text-gray-400", children: [_jsx(Clock, { className: "w-5 h-5 text-cyan-500" }), _jsx("span", { children: "Token expires in 5 minutes" })] })] })), isDispensing && (_jsxs("div", { className: "space-y-8 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700", children: [_jsxs("div", { className: "relative w-32 h-32 mx-auto", children: [_jsx("div", { className: "absolute inset-0 border-4 border-cyan-500/20 rounded-full" }), _jsx("div", { className: "absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("span", { className: "text-cyan-500 font-bold text-sm", children: "DISPENSING" }) })] }), _jsx("h1", { className: "text-4xl font-bold text-white tracking-tight", children: "Preparing your sanitizer..." }), _jsx("p", { className: "text-xl text-gray-400", children: "Please place your cup under the nozzle." })] })), isComplete && (_jsxs("div", { className: "space-y-8 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700", children: [_jsx("div", { className: "w-32 h-32 mx-auto bg-green-500/20 rounded-full flex items-center justify-center", children: _jsx(CheckCircle2, { className: "w-20 h-20 text-green-500" }) }), _jsx("h1", { className: "text-4xl font-bold text-white tracking-tight", children: "Enjoy your sanitizer!" }), _jsx("p", { className: "text-xl text-gray-400", children: "Your order has been dispensed successfully." }), _jsx("button", { onClick: () => navigate('/'), className: "mt-8 bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform inline-block", children: "Order Again" })] })), isFailed && (_jsxs("div", { className: "space-y-8 py-20", children: [_jsx("div", { className: "w-32 h-32 mx-auto bg-red-500/20 rounded-full flex items-center justify-center", children: _jsx(AlertTriangle, { className: "w-20 h-20 text-red-500" }) }), _jsx("h1", { className: "text-4xl font-bold text-white tracking-tight", children: "Dispense Failed" }), _jsx("p", { className: "text-xl text-gray-400", children: "There was a hardware error during dispensing. You will be refunded automatically." })] })), isExpired && (_jsxs("div", { className: "space-y-8 py-20", children: [_jsx("div", { className: "w-32 h-32 mx-auto bg-gray-500/20 rounded-full flex items-center justify-center", children: _jsx(XCircle, { className: "w-20 h-20 text-gray-500" }) }), _jsx("h1", { className: "text-4xl font-bold text-white tracking-tight", children: "QR Code Expired" }), _jsx("p", { className: "text-xl text-gray-400", children: "This token has expired. Please contact support or place a new order." })] }))] }) }));
}
