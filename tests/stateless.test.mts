import { test } from "node:test";
import assert from "node:assert/strict";
process.env.MIN_STEP_MS = "0"; delete process.env.GROQ_API_KEY; delete process.env.LLM_PROVIDER;

const { NextRequest } = await import("next/server");
const { runAnalysis } = await import("../src/modules/agent-orchestrator");
const { repo } = await import("../src/modules/store");
const { SAMPLES } = await import("../src/lib/samples");
const drafts = await import("../src/app/api/cases/[id]/drafts/route");
const approve = await import("../src/app/api/cases/[id]/approve/route");

const post = (path: string, body: unknown) => new NextRequest(`http://x${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

test("drafts and approval work when the server instance has forgotten the case", async () => {
  const now = new Date().toISOString();
  const id = repo.nextId();
  assert.match(id, /^CASE-\d{4}-[0-9A-Z]{4}$/);
  repo.save({ id, status: "New", mode: "demo", createdAt: now, updatedAt: now, email: { ...SAMPLES[0].email, receivedAt: now }, events: [], results: {}, drafts: [], statusHistory: [] } as any);
  assert.equal(await runAnalysis(id, () => {}), "Analysed");
  let snapshot = JSON.parse(JSON.stringify(repo.get(id)));
  repo.clear(); // another serverless instance: no memory of the case
  assert.equal(repo.get(id), undefined);

  // unknown case, no snapshot -> 404
  let res = await drafts.POST(post(`/api/cases/${id}/drafts`, { action: "generate", type: "response" }), { params: { id } });
  assert.equal(res.status, 404);

  // clarification draft with snapshot -> works and returns the updated case
  res = await drafts.POST(post(`/api/cases/${id}/drafts`, { action: "generate", type: "clarification", snapshot }), { params: { id } });
  assert.equal(res.status, 200);
  let j = await res.json(); snapshot = j.case;
  assert.equal(j.status, "Awaiting Information"); assert.equal(j.case.drafts.length, 2);

  // manual edit, then approve on yet another "instance"
  repo.clear();
  res = await drafts.POST(post(`/api/cases/${id}/drafts`, { action: "save", type: "clarification", to: "a@b.com", subject: "s", body: "edited", snapshot }), { params: { id } });
  assert.equal(res.status, 200); snapshot = (await res.json()).case;
  repo.clear();
  res = await approve.POST(post(`/api/cases/${id}/approve`, { snapshot }), { params: { id } });
  assert.equal(res.status, 200); j = await res.json();
  assert.equal(j.status, "Approved / Response Sent (Simulated)"); assert.equal(j.approval.draftVersion, 3); assert.equal(j.approval.simulatedSend, true);

  // forged/mismatched snapshot is rejected
  repo.clear();
  res = await approve.POST(post(`/api/cases/${id}/approve`, { snapshot: { ...snapshot, id: "CASE-OTHER" } }), { params: { id } });
  assert.equal(res.status, 404);
});
