import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useMachine } from '../context/MachineContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const { machineId } = useMachine();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-zinc-900 border-l border-white/10 z-50 shadow-2xl flex flex-col transform transition-transform">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center space-x-2 text-white">
            <ShoppingBag className="w-6 h-6" />
            <span>Your Cart</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="flex space-x-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="w-20 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.image_url && (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-white">{item.product.name}</h3>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center space-x-3 bg-black/50 rounded-lg p-1 border border-white/10">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:bg-white/10 rounded text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-mono text-sm w-4 text-center text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:bg-white/10 rounded text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-mono text-cyan-400">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-black/20">
            <div className="flex justify-between mb-2 text-gray-400">
              <span>Subtotal</span>
              <span className="font-mono text-white">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-6 text-xl font-bold text-white">
              <span>Total</span>
              <span className="font-mono text-cyan-500">₹{total.toFixed(2)}</span>
            </div>
            
            {!machineId && (
              <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-sm rounded-lg">
                Please connect to a machine to checkout.
              </div>
            )}
            
            <button 
              onClick={handleCheckout}
              disabled={!machineId}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Checkout Now
            </button>
          </div>
        )}
      </div>
    </>
  );
}
