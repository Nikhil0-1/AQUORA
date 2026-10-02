import React, { useState } from 'react';
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

  const isKioskPath = location.pathname === '/kiosk' || (import.meta as any).env?.VITE_KIOSK_MODE === 'true';

  if (isKioskPath) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden">
        <KioskPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col justify-between">
      <div>
        <Navbar onOpenCart={() => setIsCartOpen(true)} />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/kiosk" element={<KioskPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:id" element={<OrderReadyPage />} />
          </Routes>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MachineProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </MachineProvider>
    </BrowserRouter>
  );
}
