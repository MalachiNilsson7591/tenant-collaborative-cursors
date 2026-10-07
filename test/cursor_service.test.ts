import assert from "node:assert/strict";
import { CursorBody } from "../src/cursor_service.ts";

const parsed = CursorBody.parse({ tenantId: "acme", documentId: "roadmap", accountId: "acct_1", userId: "u_1", x: 12, y: 34 });
assert.equal(parsed.tenantId, "acme");
assert.throws(() => CursorBody.parse({ tenantId: "", documentId: "roadmap", accountId: "acct_1", userId: "u_1", x: 1, y: 2 }));
console.log("cursor input decision passed");
