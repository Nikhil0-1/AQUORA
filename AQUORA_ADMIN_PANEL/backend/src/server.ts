import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { productsRouter, categoriesRouter } from './routes/products.router';
import { machinesRouter } from './routes/machines.router';
import { ordersRouter } from './routes/orders.router';
import { paymentsRouter } from './routes/payments.router';
import { machineRouter } from './routes/machine.router';
import { adminRouter } from './routes/admin.router';
import { realtimeHub } from './websocket';
import { getDatabase } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration - allow all local frontends
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Machine-Secret'],
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

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Aquora Smart Sanitizer Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

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

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket Hub
realtimeHub.init(server);

// Only listen if this file is run directly
if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`🚀 Aquora Smart Sanitizer Backend running on http://localhost:${port}`);
    console.log(`📡 WebSocket endpoint ready at ws://localhost:${port}/ws`);
  });
}

export { app, server };
