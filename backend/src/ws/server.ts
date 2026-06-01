import { WebSocketServer } from "ws";
import type { Server } from "http";
import { Redis } from "ioredis";

export type WsServerHandle = {
  wss: WebSocketServer;
  sub: Redis | null;
};

/**
 * Real-time price tick WebSocket server.
 * Uses a dedicated Redis subscriber for the "prices" pub/sub channel and fans
 * messages out to every connected client at ws://host/ws/prices.
 */
export function startWsServer(server?: Server, port = 3001): WsServerHandle {
  const options = server ? { server, path: "/ws/prices" } : { port, path: "/ws/prices" };
  const wss = new WebSocketServer(options as any);
  const sub = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 0,
        lazyConnect: true
      })
    : null;

  if (sub) {
    sub.on("error", (error: Error) => {
      console.warn("Redis price subscription error:", error.message);
    });

    sub.connect()
      .then(() => sub.subscribe("prices"))
      .catch((error: Error) => {
        console.warn("Unable to connect to Redis for prices subscription:", error.message);
      });

    sub.on("message", (_channel: string, message: string) => {
      for (const client of wss.clients) {
        if (client.readyState === client.OPEN) {
          client.send(message);
        }
      }
    });
  } else {
    console.warn("REDIS_URL is not set. WebSocket price server will not receive price updates.");
  }

  wss.on("connection", (socket: { send: (data: string) => void }) => {
    socket.send(JSON.stringify({ type: "hello", channel: "prices" }));
  });

  const listenPort = server ? port : port;
  console.log(`WebSocket price server on ws://localhost:${listenPort}/ws/prices`);

  return { wss, sub };
}
