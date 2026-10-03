import type { Server as HttpServer } from 'http';

interface ClientSubscription {
  ws: any;
  orderId?: string;
  machineCode?: string;
  isAdmin?: boolean;
}

let WebSocketServerClass: any = null;
const WS_OPEN_STATE = 1;

try {
  if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // Dynamic require so serverless bundle does not fail on native bindings
    const wsModule = require('ws');
    WebSocketServerClass = wsModule.WebSocketServer || wsModule.Server;
  }
} catch {
  // Serverless / Lambda environment fallback
}

class RealtimeHub {
  private wss: any = null;
  private clients: Set<ClientSubscription> = new Set();

  init(server: HttpServer) {
    if (!WebSocketServerClass) {
      return;
    }
    try {
      this.wss = new WebSocketServerClass({ server, path: '/ws' });
      this.wss.on('connection', (ws: any) => {
        const sub: ClientSubscription = { ws };
        this.clients.add(sub);

        ws.on('message', (data: string) => {
          try {
            const msg = JSON.parse(data.toString());
            if (msg.type === 'SUBSCRIBE_ORDER') {
              sub.orderId = msg.orderId;
              ws.send(JSON.stringify({ type: 'SUBSCRIBED', orderId: msg.orderId }));
            } else if (msg.type === 'SUBSCRIBE_MACHINE') {
              sub.machineCode = msg.machineCode;
              ws.send(JSON.stringify({ type: 'SUBSCRIBED_MACHINE', machineCode: msg.machineCode }));
            } else if (msg.type === 'SUBSCRIBE_ADMIN') {
              sub.isAdmin = true;
              ws.send(JSON.stringify({ type: 'SUBSCRIBED_ADMIN' }));
            }
          } catch (e) {
            // ignore malformed
          }
        });

        ws.on('close', () => {
          this.clients.delete(sub);
        });

        // Send initial welcome
        ws.send(JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() }));
      });

      console.log('⚡ WebSocket Realtime Hub initialized on /ws');
    } catch (err) {
      console.warn('WebSocket init bypassed:', err);
    }
  }

  broadcast(message: any) {
    if (!this.wss || this.clients.size === 0) return;
    const payload = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.ws?.readyState === WS_OPEN_STATE) {
        if (message.orderId && client.orderId && client.orderId !== message.orderId && !client.isAdmin) {
          continue;
        }
        client.ws.send(payload);
      }
    }
  }

  notifyOrderStatus(orderId: string, status: string, details?: any) {
    this.broadcast({
      type: 'ORDER_STATUS_CHANGED',
      orderId,
      status,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  notifyDispenseProgress(orderId: string, progress: any) {
    this.broadcast({
      type: 'DISPENSE_PROGRESS',
      orderId,
      progress,
      timestamp: new Date().toISOString(),
    });
  }

  notifyMachineTelemetry(telemetry: any) {
    this.broadcast({
      type: 'MACHINE_TELEMETRY',
      machineCode: telemetry.machine_code,
      telemetry,
      timestamp: new Date().toISOString(),
    });
  }

  sendCommandToMachine(machineId: string, command: any) {
    if (!this.wss || this.clients.size === 0) return;
    const payload = JSON.stringify(command);
    for (const client of this.clients) {
      if (client.ws?.readyState === WS_OPEN_STATE && (client.machineCode === machineId || client.machineCode === 'AQ-VM-001')) {
        client.ws.send(payload);
      }
    }
  }
}

export const realtimeHub = new RealtimeHub();
