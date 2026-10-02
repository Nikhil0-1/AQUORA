import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { firebaseAuth } from '../services/firebaseAuth';
import { ShieldCheck, LogIn, LogOut, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
export function AdminAuthModal({ onAuthChange }) {
    const [user, setUser] = useState(firebaseAuth.getCurrentUser());
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isConfigured = firebaseAuth.isConfigured();
    useEffect(() => {
        const unsubscribe = firebaseAuth.onAuthStateChanged((u) => {
            setUser(u);
            onAuthChange(u);
        });
        return unsubscribe;
    }, []);
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const loggedIn = await firebaseAuth.signIn(email, password);
            setUser(loggedIn);
            onAuthChange(loggedIn);
            setIsOpen(false);
        }
        catch (err) {
            setError(err.message || 'Login failed');
        }
        finally {
            setLoading(false);
        }
    };
    const handleLogout = async () => {
        await firebaseAuth.signOut();
        setUser(null);
        onAuthChange(null);
    };
    return (_jsxs("div", { children: [user ? (_jsxs("div", { className: "flex items-center gap-3 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl", children: [_jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" }), _jsxs("div", { className: "text-left text-xs", children: [_jsx("span", { className: "text-white font-semibold block", children: user.email }), _jsx("span", { className: "text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40", children: user.role })] }), _jsx("button", { onClick: handleLogout, className: "text-slate-400 hover:text-rose-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors ml-1", title: "Log out", children: _jsx(LogOut, { className: "w-4 h-4" }) })] })) : (_jsxs("button", { onClick: () => setIsOpen(true), className: "flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]", children: [_jsx(LogIn, { className: "w-4 h-4" }), "Admin Login"] })), isOpen && !user && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ShieldCheck, { className: "w-6 h-6 text-cyan-400" }), _jsx("h3", { className: "text-lg font-bold text-white", children: "Firebase Admin Login" })] }), _jsx("button", { onClick: () => setIsOpen(false), className: "text-slate-400 hover:text-white text-sm", children: "\u2715" })] }), !isConfigured ? (_jsxs("div", { className: "bg-blue-500/10 border border-blue-500/30 text-blue-300 p-3 rounded-xl text-xs leading-relaxed space-y-1", children: [_jsxs("div", { className: "font-bold flex items-center gap-1.5 text-blue-200", children: [_jsx(Sparkles, { className: "w-4 h-4 text-cyan-400" }), "Firebase Configuration Setup"] }), _jsxs("div", { children: ["Firebase Web API credentials are not yet configured in ", _jsx("code", { className: "bg-slate-950 px-1 py-0.5 rounded text-cyan-300", children: ".env" }), ". Enter any admin email (e.g. ", _jsx("code", { children: "admin@aquora.com" }), ") below to sign in via development role mapping."] })] })) : (_jsxs("div", { className: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-xl text-xs flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 flex-shrink-0" }), _jsx("span", { children: "Connected to Firebase Authentication" })] })), error && (_jsxs("div", { className: "bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0" }), _jsx("span", { children: error })] })), _jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-300 mb-1", children: "Admin Email" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "admin@aquora.com", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-300 mb-1", children: "Password" }), _jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500" })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => setIsOpen(false), className: "px-4 py-2 text-xs text-slate-400 hover:text-white", children: "Cancel" }), _jsx("button", { type: "submit", disabled: loading, className: "px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50", children: loading ? 'Authenticating...' : 'Sign In' })] })] })] }) }))] }));
}
