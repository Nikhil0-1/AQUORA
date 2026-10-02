import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

interface ClientSubscription {
  ws: WebSocket;
  orderId?: string;
  machineCode?: string;
  isAdmin?: boolean;
}

class RealtimeHub {
  private wss: WebSocketServer | null = null;
  private clients: Set<ClientSubscription> = new Set();

  init(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
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
  }

  broadcast(message: any) {
    const payload = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        // Filter based on subscription if relevant
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
    const payload = JSON.stringify(command);
    for (const client of this.clients) {
      // For demo, we match machineCode against the ID, or ideally both.
      if (client.ws.readyState === WebSocket.OPEN && (client.machineCode === machineId || client.machineCode === 'AQ-VM-001')) {
        client.ws.send(payload);
      }
    }
  }
}

export const realtimeHub = new RealtimeHub();
