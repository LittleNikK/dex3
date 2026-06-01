process.env.PORT = "0";
process.env.REDIS_URL = "";

import request from "supertest";
import app, { server, wsServer } from "../../index.ts";

afterAll(async () => {
  if (wsServer?.wss) {
    wsServer.wss.close();
  }
  if (wsServer?.sub) {
    await wsServer.sub.disconnect();
  }
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("Pools API", () => {
  it("returns pools", async () => {
    const response = await request(app).get("/api/pools");
    expect(response.status).toBe(200);
  });
});
