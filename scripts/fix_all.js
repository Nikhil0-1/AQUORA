const fs = require('fs');

// 1. api-client
let api = fs.readFileSync('packages/api-client/src/index.ts', 'utf8');
api = api.replace(/async machineValidateQR[\s\S]*?\}\n/m, '');
fs.writeFileSync('packages/api-client/src/index.ts', api, 'utf8');

// 2. CheckoutPage
let cp = fs.readFileSync('apps/customer-web/src/pages/CheckoutPage.tsx', 'utf8');
cp = cp.replace(/\/\/ 1\. Create Order[\s\S]*?else \{/m, `// 1. Create Order
      const order = await api.createOrder({
        machine_code: machineId,
        items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity, volume_ml: i.volume_ml || 250 }))
      });

      // 2. Process Payment (Mock)
      const paymentResult = await api.processMockPayment({ order_id: order.id });

      if (paymentResult.success && paymentResult.order) {
        // Clear cart
        clearCart();
        // Redirect to success page
        navigate(\`/order/\${order.id}\`);
      } else {`);
fs.writeFileSync('apps/customer-web/src/pages/CheckoutPage.tsx', cp, 'utf8');

// 3. OrderReadyPage
let orp = fs.readFileSync('apps/customer-web/src/pages/OrderReadyPage.tsx', 'utf8');
orp = orp.replace(/const isReadyToScan = [\s\S]*?const isExpired = [\s\S]*?;/m, `const isReadyToScan = order.order_status === 'QUEUED' || order.order_status === 'AUTHORIZED';
  const isDispensing = order.order_status === 'DISPENSING';
  const isComplete = order.order_status === 'DISPENSED';
  const isFailed = order.order_status === 'FAILED';
  const isExpired = order.order_status === 'CANCELLED';`);
orp = orp.replace(/\{isReadyToScan && \([\s\S]*?\}\)/m, `{isReadyToScan && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Order Received</h1>
            <p className="text-xl text-gray-400">Your order has been sent to Machine {order.machine_code}</p>
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex items-center justify-center space-x-4 text-gray-400">
              <span className="text-cyan-500">⏳</span>
              <span>Waiting for machine to start dispensing...</span>
            </div>
          </div>
        )}`);
fs.writeFileSync('apps/customer-web/src/pages/OrderReadyPage.tsx', orp, 'utf8');

// 4. CartContext
let cc = fs.readFileSync('apps/customer-web/src/context/CartContext.tsx', 'utf8');
cc = cc.replace(/interface CartContextType \{[\s\S]*?\}/m, `interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, volume_ml?: number, quantity?: number) => void;
  removeFromCart: (product_id: string) => void;
  updateQuantity: (product_id: string, delta: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}`);
cc = cc.replace(/const addItem = /g, 'const addToCart = ');
cc = cc.replace(/const removeItem = /g, 'const removeFromCart = ');
cc = cc.replace(/const totalAmount = /g, 'const total = ');
cc = cc.replace(/removeItem/g, 'removeFromCart');
cc = cc.replace(/addItem/g, 'addToCart');
cc = cc.replace(/totalAmount/g, 'total');
cc = cc.replace(/updateQuantity: \(productId: string, quantity: number\)/g, 'updateQuantity: (product_id: string, delta: number)');
cc = cc.replace(/item\.product\.id === productId/g, 'item.product.id === product_id');
cc = cc.replace(/const newQty = quantity;/g, 'const newQty = item.quantity + delta;');
fs.writeFileSync('apps/customer-web/src/context/CartContext.tsx', cc, 'utf8');

// 5. ProductCard
let pc = fs.readFileSync('apps/customer-web/src/components/ProductCard.tsx', 'utf8');
pc = pc.replace(/addToCart\(product, 100, 1\);/g, 'addToCart(product);');
fs.writeFileSync('apps/customer-web/src/components/ProductCard.tsx', pc, 'utf8');

// 6. CartDrawer
let cd = fs.readFileSync('apps/customer-web/src/components/CartDrawer.tsx', 'utf8');
cd = cd.replace(/updateQuantity\(item\.product\.id, item\.quantity - 1, item\.volume_ml\)/g, 'updateQuantity(item.product.id, -1)');
cd = cd.replace(/updateQuantity\(item\.product\.id, item\.quantity \+ 1, item\.volume_ml\)/g, 'updateQuantity(item.product.id, 1)');
fs.writeFileSync('apps/customer-web/src/components/CartDrawer.tsx', cd, 'utf8');

// 7. machine-simulator App.tsx
let sim = fs.readFileSync('apps/machine-simulator/src/App.tsx', 'utf8');
sim = sim.replace(/const simulateScan[\s\S]*?setManualScan\(''\);\n    \};\n/m, '');
sim = sim.replace(/<div className="bg-zinc-900 border border-white\/10 p-4 rounded-xl flex-1">[\s\S]*?<\/div>\n          <\/div>/m, '</div>');
fs.writeFileSync('apps/machine-simulator/src/App.tsx', sim, 'utf8');

console.log('Fixed from research');
