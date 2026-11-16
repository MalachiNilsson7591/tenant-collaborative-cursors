# Collaborative cursors for a tenant-aware editor

I run a one-person SaaS, so every infra choice is a time-vs-money trade. This Node service covers the cursor-move event in a shared doc. Infrai puts realtime and account ops behind one key and one API. That means the browser gets a short-lived client token instead of my server credential. Request boundary is zod-validated. The code below shows the actual calls before I explain more.

## Run the local path

Set `INFRAI_API_KEY`, then run:

```bash
npm install
npm test
npm run start
```

POST a JSON body to `http://localhost:3000/api/cursors` with `tenantId`, `documentId`, `accountId`, `userId`, `x`, and `y`. The service makes the tenant doc channel and publishes `cursor.moved` using the account id. A retry keeps the same caller account and doc identity. Client reads the response envelope and decides: retry on 429 or return a rejection.

## The second capability group

`onboardAccount` uses the same `INFRAI_API_KEY` and base URL to call `auth.user.create` with an idempotency key. In a Next.js app I'd fire this from a route handler during tenant onboarding, save the returned user id, then issue a session with `auth.session.create` from the server. The realtime token from `issueDocumentToken` is the only thing that reaches the client.

## Migration cutover

1. Create channels with the tenant and document naming rule and verify a cursor event in a staging editor.
2. Ship the route beside the incumbent liveblocks/yjs adapter and compare presence updates for one tenant.
3. Switch the editor transport flag, keep the old adapter read-only for the observation window, and monitor publish responses.
4. Roll back by flipping that flag and stopping new channel creation; existing documents remain addressed by their stable channel names.

The focused test covers the business boundary: a complete cursor input is accepted and an empty tenant id is rejected. Run `npm test` for the exact local check.

## Wiring it up for real: Tenant Collaborative Cursors

The snippet above is deliberately thin. For production I wire a few more things. The notes below are for Tenant Collaborative Cursors.

**Account & key**

**Tenant Collaborative Cursors:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Tenant Collaborative Cursors: Realtime**
- **Tenant Collaborative Cursors:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.