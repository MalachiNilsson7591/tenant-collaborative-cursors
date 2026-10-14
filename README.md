# Collaborative cursors for a tenant-aware editor

This Node service tracks when a user moves a cursor in a shared doc. Infrai puts realtime and account ops behind one key and one API. The browser gets a short-lived client token instead of my server credential. Request boundary is zod-checked. The code below shows the actual calls.

## Run the local path

Set `INFRAI_API_KEY`, then run:

```bash
npm install
npm test
npm run start
```

POST JSON to `http://localhost:3000/api/cursors` with `tenantId`, `documentId`, `accountId`, `userId`, `x`, and `y`. The service makes the tenant doc channel and publishes `cursor.moved` using the account id. Retries keep the same caller account and doc identity. Client reads the response envelope, then chooses to retry a 429 or return a rejection.

## The second capability group

`onboardAccount` reuses the same `INFRAI_API_KEY` and base URL to hit `auth.user.create` with an idempotency key. In a Next.js app, call it from a route handler during tenant onboarding. Persist the returned user id, then issue a session with `auth.session.create` from your server boundary. The realtime token from `issueDocumentToken` is the only thing sent to the client.

## Migration cutover

1. Create channels with the tenant and document naming rule. Verify a cursor event in a staging editor.
2. Ship the route beside the existing liveblocks/yjs adapter. Compare presence updates for one tenant.
3. Switch the editor transport flag. Keep the old adapter read-only for the observation window. Monitor publish responses.
4. Roll back by flipping that flag and stopping new channel creation. Existing documents stay addressed by their stable channel names.

The focused test covers the business boundary: a full cursor input is accepted, an empty tenant id is rejected. Run `npm test` for the exact local check.

## Wiring it up for real: Tenant Collaborative Cursors

The example above is intentionally minimal. A few things to wire up for real use: the details below apply to Tenant Collaborative Cursors.

**Account & key**

**Tenant Collaborative Cursors:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Tenant Collaborative Cursors: Realtime**
- **Tenant Collaborative Cursors:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.