import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { firebaseAuth } from '../services/firebaseAuth';
import { ShieldCheck, LogIn, Lock, Droplets, AlertCircle } from 'lucide-react';
export function AdminLoginView({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const user = await firebaseAuth.signIn(email, password);
            onLoginSuccess(user);
        }
        catch (err) {
            setError(err.message || 'Authentication failed. Please verify credentials.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans", children: [_jsx("div", { className: "absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" }), _jsx("div", { className: "absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6", children: [_jsxs("div", { className: "text-center space-y-2", children: [_jsx("div", { className: "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 mb-2", children: _jsx(Droplets, { className: "w-8 h-8 text-slate-950 stroke-[2.5]" }) }), _jsx("h1", { className: "text-2xl font-extrabold text-white tracking-tight", children: "AQUORA Admin Portal" }), _jsx("p", { className: "text-xs text-slate-400", children: "Sign in with your Firebase Administrative credentials to manage products, pricing, and dispensing machines." })] }), _jsxs("div", { className: "bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-slate-400", children: [_jsx(Lock, { className: "w-4 h-4 text-cyan-400 shrink-0 mt-0.5" }), _jsxs("div", { className: "leading-relaxed", children: [_jsx("strong", { className: "text-slate-200", children: "Admin Protected Area:" }), " Public web customers do not require authentication to place orders."] })] }), error && (_jsxs("div", { className: "bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in", children: [_jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: error })] })), _jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1.5", children: "Admin Email" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "admin@aquora.com", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1.5", children: "Password" }), _jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors" })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2", children: loading ? (_jsx("div", { className: "w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx(LogIn, { className: "w-4 h-4" }), _jsx("span", { children: "Sign In with Firebase" })] })) })] }), _jsxs("div", { className: "pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5", children: [_jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-emerald-400" }), _jsx("span", { children: "Secured via Firebase Identity (aquora-e7eb0)" })] })] })] }));
}
