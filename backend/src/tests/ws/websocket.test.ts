process.env.PORT = "0";
process.env.REDIS_URL = "";

import "../../index.ts";
import { server, wsServer } from "../../index.ts";
import WebSocket from "ws";

afterAll(async () => {
  if (wsServer?.wss) {
    wsServer.wss.close();
  }
  if (wsServer?.sub) {
    await wsServer.sub.disconnect();
  }
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("WebSocket", () => {
  it("connects successfully", (done) => {
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 3001;
    const ws = new WebSocket(`ws://localhost:${port}/ws/prices`);
    ws.on("open", () => {
      expect(true).toBe(true);
      ws.close();
      done();
    });
    ws.on("error", (error) => done(error));
  });
});
