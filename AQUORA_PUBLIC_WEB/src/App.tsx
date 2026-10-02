import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Product, ProductVariant, CartItem } from './types';
import { publicApi } from './api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    publicApi.getProducts().then((data) => setProducts(data));
  }, []);

  const handleAddToCart = (product: Product, variant: ProductVariant | undefined, volumeMl: number) => {
    const unitPrice = variant ? variant.price : product.price;
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.volume_ml === volumeMl
      );
      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [...prev, { product, variant, volume_ml: volumeMl, quantity: 1, unit_price: unitPrice }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (idx: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(idx);
      return;
    }
    setCart((prev) => {
      const copy = [...prev];
      copy[idx].quantity = newQty;
      return copy;
    });
  };

  const handleRemoveItem = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050B14] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
        <div>
          <Navbar
            cartCount={cartTotalItems}
            onOpenCart={() => setIsCartOpen(true)}
          />

          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />

          <main>
            <Routes>
              <Route path="/" element={<HomePage products={products} onAddToCart={handleAddToCart} />} />
              <Route path="/products" element={<ProductsPage products={products} onAddToCart={handleAddToCart} />} />
              <Route path="/cart" element={<CheckoutPage cart={cart} onClearCart={() => setCart([])} />} />
              <Route path="/checkout" element={<CheckoutPage cart={cart} onClearCart={() => setCart([])} />} />
              <Route path="/order/:id" element={<OrderTrackingPage />} />
              <Route path="/dispensing" element={<OrderTrackingPage />} />
              <Route path="/payment-status" element={<OrderTrackingPage />} />
            </Routes>
          </main>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
