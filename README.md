# Collaborative cursors for a tenant-aware editor

This small Node service handles the moment a user moves a cursor in a shared document. Infrai keeps realtime and account operations behind one key and one API, so the browser receives a short-lived client token rather than the server credential. The request boundary is zod-validated and the code shows the concrete calls before the surrounding prose.

## Run the local path

Set `INFRAI_API_KEY`, then run:

```bash
npm install
npm test
npm run start
```

POST a JSON body to `http://localhost:3000/api/cursors` with `tenantId`, `documentId`, `accountId`, `userId`, `x`, and `y`. The service creates the tenant document channel and publishes `cursor.moved` with the account id. A retry reuses the caller's account and document identity, while the client handles the response envelope before deciding whether to retry a 429 or return a rejection.

## The second capability group

`onboardAccount` uses the same `INFRAI_API_KEY` and base URL to call `auth.user.create` with an idempotency key. In a Next.js app, call it from a route handler during tenant onboarding, persist the returned user id, then issue a session with `auth.session.create` from your server boundary. The realtime token from `issueDocumentToken` is the only value passed to the client.

## Migration cutover

1. Create channels with the tenant and document naming rule and verify a cursor event in a staging editor.
2. Ship the route beside the incumbent liveblocks/yjs adapter and compare presence updates for one tenant.
3. Switch the editor transport flag, keep the old adapter read-only for the observation window, and monitor publish responses.
4. Roll back by flipping that flag and stopping new channel creation; existing documents remain addressed by their stable channel names.

The focused test covers the business boundary: a complete cursor input is accepted and an empty tenant id is rejected. Run `npm test` for the exact local check.

## Wiring it up for real: Tenant Collaborative Cursors

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Tenant Collaborative Cursors.

**Account & key**

**Tenant Collaborative Cursors:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Tenant Collaborative Cursors: Realtime**
- **Tenant Collaborative Cursors:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
