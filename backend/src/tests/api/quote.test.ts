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

describe("Quote API", () => {
  it("returns quote", async () => {
    const response = await request(app)
      .post("/api/quote")
      .send({
        tokenIn: "WMST",
        tokenOut: "USDC",
        amountIn: "1000000000000000000"
      });
    expect(response.status).toBe(200);
  });
});
