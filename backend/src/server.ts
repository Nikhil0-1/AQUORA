import http from 'http';
import { app } from './app';
import { realtimeHub } from './websocket';

const port = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket Hub
realtimeHub.init(server);

// Only listen if this file is run directly and not in serverless / Vercel / test environment
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  server.listen(port, () => {
    console.log(`🚀 Aquora Smart Sanitizer Backend running on http://localhost:${port}`);
    console.log(`📡 WebSocket endpoint ready at ws://localhost:${port}/ws`);
  });
}

export { app, server };
export default app;

