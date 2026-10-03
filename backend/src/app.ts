import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { productsRouter, categoriesRouter } from './routes/products.router';
import { machinesRouter } from './routes/machines.router';
import { ordersRouter } from './routes/orders.router';
import { paymentsRouter } from './routes/payments.router';
import { machineRouter } from './routes/machine.router';
import { adminRouter } from './routes/admin.router';
import { getDatabase } from './db';

dotenv.config();

const app = express();

// CORS configuration - allow all client frontends, Vercel deployments, and local development
const ALLOWED_ORIGINS = [
  'https://webaquora.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Machine-Secret', 'x-razorpay-signature'],
  })
);

app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  if (req.path !== '/api/v1/machine/heartbeat') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Health check endpoints (available at both /health and /api/health)
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'Aquora Smart Sanitizer Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// API Routes
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/machines', machinesRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/machine', machineRouter);
app.use('/api/v1/admin', adminRouter);

// Initialize DB eagerly
getDatabase();

export { app };
export default app;
