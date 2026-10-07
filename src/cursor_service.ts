import { z } from "zod";
import { InfraiClient } from "./infrai_client.ts";

export const CursorBody = z.object({ tenantId: z.string().min(1), documentId: z.string().min(1), accountId: z.string().min(1), userId: z.string().min(1), x: z.number(), y: z.number() });
export type CursorInput = z.infer<typeof CursorBody>;

export async function publishCursor(client: InfraiClient, raw: unknown): Promise<{ channel: string; event: string; position: { x: number; y: number } }> {
  const input = CursorBody.parse(raw);
  const channel = `tenant:${input.tenantId}:document:${input.documentId}`;
  await client.request("/v1/realtime/channel/create", "POST", { channel, type: "presence" }); // infrai.realtime.channel.create
  await client.request("/v1/realtime/publish", "POST", { channel, event: "cursor.moved", data: { user_id: input.userId, x: input.x, y: input.y }, account_id: input.accountId });
  return { channel, event: "cursor.moved", position: { x: input.x, y: input.y } };
}

export async function issueDocumentToken(client: InfraiClient, input: { clientId: string; channel: string }): Promise<unknown> {
  return client.request("/v1/realtime/token/issue", "POST", { client_id: input.clientId, channels: [input.channel], capabilities: ["publish", "presence"], ttl_seconds: 900 });
}

export async function onboardAccount(client: InfraiClient, input: { email: string; password: string; name: string; idempotencyKey: string }): Promise<unknown> {
  return client.request("/v1/auth/user/create", "POST", { email: input.email, password: input.password, name: input.name, metadata: { source: "editor" }, vendor: "infrai", mode: "M", idempotency_key: input.idempotencyKey });
}
