import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MachineProvider } from './context/MachineContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderReadyPage } from './pages/OrderReadyPage';
import { KioskPage } from './pages/KioskPage';
function AppContent() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const location = useLocation();
    const isKioskPath = location.pathname === '/kiosk' || import.meta.env?.VITE_KIOSK_MODE === 'true';
    if (isKioskPath) {
        return (_jsx("div", { className: "w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden", children: _jsx(KioskPage, {}) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsx(Navbar, { onOpenCart: () => setIsCartOpen(true) }), _jsx(CartDrawer, { isOpen: isCartOpen, onClose: () => setIsCartOpen(false) }), _jsx("main", { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/kiosk", element: _jsx(KioskPage, {}) }), _jsx(Route, { path: "/product/:id", element: _jsx(ProductDetailPage, {}) }), _jsx(Route, { path: "/checkout", element: _jsx(CheckoutPage, {}) }), _jsx(Route, { path: "/order/:id", element: _jsx(OrderReadyPage, {}) })] }) })] }), _jsx(Footer, {})] }));
}
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(MachineProvider, { children: _jsx(CartProvider, { children: _jsx(AppContent, {}) }) }) }));
}
