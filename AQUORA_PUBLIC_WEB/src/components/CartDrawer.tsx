import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: Props) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0A111E] border-l border-[#1E2C44] shadow-2xl flex flex-col justify-between p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[#1E2C44]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Your Cart</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2C44]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto py-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400">Your cart is empty.</p>
                <button
                  onClick={onClose}
                  className="text-xs text-cyan-400 hover:underline font-semibold"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.volume_ml}-${idx}`}
                  className="bg-[#0F1A2D] border border-[#1E2C44] p-4 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#1E2C44]"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {item.product.name}
                      </h4>
                      <span className="text-[11px] text-cyan-400 font-mono">
                        {item.volume_ml} ml · ₹{item.unit_price} each
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#050B14] border border-[#1E2C44] rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Total */}
          {items.length > 0 && (
            <div className="pt-5 border-t border-[#1E2C44] space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Amount:</span>
                <span className="text-2xl font-extrabold text-white font-mono">
                  ₹{total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
