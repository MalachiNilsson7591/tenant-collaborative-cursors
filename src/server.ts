import { createServer } from "node:http";
import { InfraiClient, InfraiError } from "./infrai_client.ts";
import { publishCursor } from "./cursor_service.ts";

const client = new InfraiClient();
const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/api/cursors") { response.writeHead(404).end(); return; }
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    const result = await publishCursor(client, JSON.parse(Buffer.concat(chunks).toString("utf8")));
    response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(result));
  } catch (error) {
    const status = error instanceof InfraiError && error.status < 500 ? error.status : 400;
    response.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify({ error: error instanceof Error ? error.message : "invalid request" }));
  }
});
server.listen(Number(process.env.PORT ?? 3000), () => console.log("cursor service listening"));
