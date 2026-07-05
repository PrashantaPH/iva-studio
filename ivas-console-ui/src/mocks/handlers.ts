// Mock API route table. Each handler operates on the in-memory db.
// A tiny path matcher supports patterns like /workspaces/:workspaceId/intents.

import {
  db,
  delay,
  nowIso,
  persist,
  uid,
} from "./db";
import type {
  Alternate,
  Entity,
  EntityValue,
  Flow,
  GlobalVariable,
  Intent,
  Model,
  Organization,
  ProxyScript,
  Trigger,
  Workspace,
} from "@/core/types/dto";

export interface MockRequest {
  method: string;
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  body: any;
}

export interface MockResponse {
  status: number;
  data: unknown;
}

type Handler = (req: MockRequest) => MockResponse | Promise<MockResponse>;

interface Route {
  method: string;
  pattern: string;
  handler: Handler;
}

const ok = (data: unknown, status = 200): MockResponse => ({ status, data });
const created = (data: unknown): MockResponse => ({ status: 201, data });
const notFound = (message = "Not found"): MockResponse => ({
  status: 404,
  data: { message },
});
const badRequest = (message: string): MockResponse => ({
  status: 400,
  data: { message },
});

function log(
  workspaceId: string,
  sourceType: "proxy" | "model" | "flow" | "widget",
  sourceId: string,
  level: "info" | "success" | "warn" | "error",
  message: string,
) {
  db.runtimeLogs.push({
    id: uid(),
    workspaceId,
    sourceType,
    sourceId,
    level,
    message,
    createdAt: nowIso(),
  });
  persist();
}

const routes: Route[] = [
  // ---------------- Auth ----------------
  {
    method: "POST",
    pattern: "/auth/register",
    handler: (req) => {
      const { email, name } = req.body ?? {};
      if (!email) return badRequest("email is required");
      let user = db.users.find((u) => u.email === email);
      if (!user) {
        user = {
          id: uid(),
          email,
          name: name ?? email.split("@")[0],
          provider: "email",
          preferences: { theme: "system", notifications: true },
        };
        db.users.push(user);
        persist();
      }
      return ok({ email, otpSent: true, devOtp: "123456" });
    },
  },
  {
    method: "POST",
    pattern: "/auth/login/email",
    handler: (req) => {
      const { email } = req.body ?? {};
      if (!email) return badRequest("email is required");
      let user = db.users.find((u) => u.email === email);
      if (!user) {
        user = {
          id: uid(),
          email,
          name: email.split("@")[0],
          provider: "email",
          preferences: { theme: "system", notifications: true },
        };
        db.users.push(user);
        persist();
      }
      return ok({ email, otpSent: true, devOtp: "123456" });
    },
  },
  {
    method: "POST",
    pattern: "/auth/otp/verify",
    handler: (req) => {
      const { email, code } = req.body ?? {};
      if (code !== "123456") return badRequest("Invalid OTP. Use 123456.");
      const user =
        db.users.find((u) => u.email === email) ?? db.users[0];
      return ok({
        user,
        tokens: { accessToken: `tok_${uid()}`, refreshToken: `ref_${uid()}` },
      });
    },
  },
  {
    method: "POST",
    pattern: "/auth/google",
    handler: () => {
      const user = db.users[0];
      return ok({
        user: { ...user, provider: "google" },
        tokens: { accessToken: `tok_${uid()}`, refreshToken: `ref_${uid()}` },
      });
    },
  },
  {
    method: "GET",
    pattern: "/auth/me",
    handler: () => ok(db.users[0]),
  },
  {
    method: "PUT",
    pattern: "/auth/me/preferences",
    handler: (req) => {
      db.users[0].preferences = { ...db.users[0].preferences, ...req.body };
      persist();
      return ok(db.users[0]);
    },
  },

  // ---------------- Organizations ----------------
  {
    method: "GET",
    pattern: "/orgs",
    handler: () => ok(db.organizations),
  },
  {
    method: "POST",
    pattern: "/orgs",
    handler: (req) => {
      const org: Organization = {
        id: uid(),
        name: req.body?.name ?? "New Org",
        ownerUserId: db.users[0].id,
        createdAt: nowIso(),
      };
      db.organizations.push(org);
      persist();
      return created(org);
    },
  },

  // ---------------- Workspaces ----------------
  {
    method: "GET",
    pattern: "/orgs/:orgId/workspaces",
    handler: (req) =>
      ok(db.workspaces.filter((w) => w.orgId === req.params.orgId)),
  },
  {
    method: "POST",
    pattern: "/orgs/:orgId/workspaces",
    handler: (req) => {
      const ws: Workspace = {
        id: uid(),
        orgId: req.params.orgId,
        name: req.body?.name ?? "New Workspace",
        status: "draft",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.workspaces.push(ws);
      db.settings.push({
        workspaceId: ws.id,
        workspaceName: ws.name,
        themePolicy: "user",
      });
      persist();
      return created(ws);
    },
  },

  // ---------------- Models ----------------
  {
    method: "GET",
    pattern: "/workspaces/:workspaceId/models",
    handler: (req) =>
      ok(db.models.filter((m) => m.workspaceId === req.params.workspaceId)),
  },
  {
    method: "POST",
    pattern: "/workspaces/:workspaceId/models",
    handler: (req) => {
      const model: Model = {
        id: uid(),
        workspaceId: req.params.workspaceId,
        name: req.body?.name ?? "NEW_MODEL",
        language: req.body?.language ?? "English",
        trainStatus: "draft",
        createdAt: nowIso(),
      };
      db.models.push(model);
      persist();
      return created(model);
    },
  },
  {
    method: "POST",
    pattern: "/workspaces/:workspaceId/models/:modelId/train",
    handler: async (req) => {
      const model = db.models.find((m) => m.id === req.params.modelId);
      if (!model) return notFound("Model not found");
      model.trainStatus = "training";
      log(model.workspaceId, "model", model.id, "info", `Training ${model.name}...`);
      persist();
      await delay(400);
      model.trainStatus = "ready";
      model.lastTrainedAt = nowIso();
      log(model.workspaceId, "model", model.id, "success", `Model ${model.name} trained.`);
      persist();
      return ok(model);
    },
  },

  // ---------------- Intents ----------------
  {
    method: "GET",
    pattern: "/workspaces/:workspaceId/intents",
    handler: (req) =>
      ok(db.intents.filter((i) => i.workspaceId === req.params.workspaceId)),
  },
  {
    method: "POST",
    pattern: "/workspaces/:workspaceId/intents",
    handler: (req) => {
      const intent: Intent = {
        id: uid(),
        workspaceId: req.params.workspaceId,
        modelId: req.body?.modelId ?? db.models[0]?.id ?? "",
        label: req.body?.label ?? "New Intent",
        enabled: req.body?.enabled ?? true,
        createdAt: nowIso(),
      };
      db.intents.push(intent);
      persist();
      return created(intent);
    },
  },
  {
    method: "GET",
    pattern: "/intents/:intentId",
    handler: (req) => {
      const intent = db.intents.find((i) => i.id === req.params.intentId);
      return intent ? ok(intent) : notFound();
    },
  },
  {
    method: "PUT",
    pattern: "/intents/:intentId",
    handler: (req) => {
      const intent = db.intents.find((i) => i.id === req.params.intentId);
      if (!intent) return notFound();
      Object.assign(intent, req.body);
      persist();
      return ok(intent);
    },
  },
  {
    method: "DELETE",
    pattern: "/intents/:intentId",
    handler: (req) => {
      db.intents = db.intents.filter((i) => i.id !== req.params.intentId);
      db.alternates = db.alternates.filter(
        (a) => a.intentId !== req.params.intentId,
      );
      persist();
      return ok({ deleted: true });
    },
  },
  {
    method: "GET",
    pattern: "/intents/:intentId/alternates",
    handler: (req) =>
      ok(db.alternates.filter((a) => a.intentId === req.params.intentId)),
  },
  {
    method: "POST",
    pattern: "/intents/:intentId/alternates",
    handler: (req) => {
      const alt: Alternate = {
        id: uid(),
        intentId: req.params.intentId,
        value: req.body?.value ?? "",
        createdAt: nowIso(),
      };
      db.alternates.push(alt);
      persist();
      return created(alt);
    },
  },
  {
    method: "DELETE",
    pattern: "/alternates/:alternateId",
    handler: (req) => {
      db.alternates = db.alternates.filter(
        (a) => a.id !== req.params.alternateId,
      );
      persist();
      return ok({ deleted: true });
    },
  },

  // ---------------- Entities ----------------
  {
    method: "GET",
    pattern: "/workspaces/:workspaceId/entities",
    handler: (req) =>
      ok(db.entities.filter((e) => e.workspaceId === req.params.workspaceId)),
  },
  {
    method: "POST",
    pattern: "/workspaces/:workspaceId/entities",
    handler: (req) => {
      const entity: Entity = {
        id: uid(),
        workspaceId: req.params.workspaceId,
        modelId: req.body?.modelId ?? db.models[0]?.id ?? "",
        label: req.body?.label ?? "New Entity",
        enabled: req.body?.enabled ?? true,
        createdAt: nowIso(),
      };
      db.entities.push(entity);
      persist();
      return created(entity);
    },
  },
  {
    method: "GET",
    pattern: "/entities/:entityId",
    handler: (req) => {
      const entity = db.entities.find((e) => e.id === req.params.entityId);
      return entity ? ok(entity) : notFound();
    },
  },
  {
    method: "PUT",
    pattern: "/entities/:entityId",
    handler: (req) => {
      const entity = db.entities.find((e) => e.id === req.params.entityId);
      if (!entity) return notFound();
      Object.assign(entity, req.body);
      persist();
      return ok(entity);
    },
  },
  {
    method: "DELETE",
    pattern: "/entities/:entityId",
    handler: (req) => {
      db.entities = db.entities.filter((e) => e.id !== req.params.entityId);
      db.entityValues = db.entityValues.filter(
        (v) => v.entityId !== req.params.entityId,
      );
      persist();
      return ok({ deleted: true });
    },
  },
  {
    method: "GET",
    pattern: "/entities/:entityId/values",
    handler: (req) =>
      ok(db.entityValues.filter((v) => v.entityId === req.params.entityId)),
  },
  {
    method: "POST",
    pattern: "/entities/:entityId/values",
    handler: (req) => {
      const value: EntityValue = {
        id: uid(),
        entityId: req.params.entityId,
        name: req.body?.name ?? "value",
        type: req.body?.type ?? "string",
        valueOrPattern: req.body?.valueOrPattern ?? "",
        flags: req.body?.flags ?? [],
        createdAt: nowIso(),
      };
      db.entityValues.push(value);
      persist();
      return created(value);
    },
  },
  {
    method: "PUT",
    pattern: "/entity-values/:valueId",
    handler: (req) => {
      const value = db.entityValues.find((v) => v.id === req.params.valueId);
      if (!value) return notFound();
      Object.assign(value, req.body);
      persist();
      return ok(value);
    },
  },
  {
    method: "DELETE",
    pattern: "/entity-values/:valueId",
    handler: (req) => {
      db.entityValues = db.entityValues.filter(
        (v) => v.id !== req.params.valueId,
      );
      persist();
      return ok({ deleted: true });
    },
  },

  // ---------------- Triggers ----------------
  {
    method: "GET",
    pattern: "/workspaces/:workspaceId/triggers",
    handler: (req) =>
      ok(db.triggers.filter((t) => t.workspaceId === req.params.workspaceId)),
  },
  {
    method: "POST",
    pattern: "/workspaces/:workspaceId/triggers",
    handler: (req) => {
      const trigger: Trigger = {
        id: uid(),
        workspaceId: req.params.workspaceId,
        modelId: req.body?.modelId ?? db.models[0]?.id ?? "",
        label: req.body?.label ?? "New Trigger",
        enabled: req.body?.enabled ?? true,
        createdAt: nowIso(),
      };
      db.triggers.push(trigger);
      persist();
      return created(trigger);
    },
  },
  {
    method: "PUT",
    pattern: "/triggers/:triggerId",
    handler: (req) => {
      const trigger = db.triggers.find((t) => t.id === req.params.triggerId);
      if (!trigger) return notFound();
      Object.assign(trigger, req.body);
      persist();
      return ok(trigger);
    },
  },
  {
    method: "DELETE",
    pattern: "/triggers/:triggerId",
    handler: (req) => {
      db.triggers = db.triggers.filter((t) => t.id !== req.params.triggerId);
      persist();
      return ok({ deleted: true });
    },
  },

  // ---------------- Proxy Scripts ----------------
  {
    method: "GET",
    pattern: "/workspaces/:workspaceId/proxy-scripts",
    handler: (req) =>
      ok(
        db.proxyScripts.filter(
          (p) => p.workspaceId === req.params.workspaceId,
        ),
      ),
  },
  {
    method: "POST",
    pattern: "/workspaces/:workspaceId/proxy-scripts",
    handler: (req) => {
      const script: ProxyScript = {
        id: uid(),
        workspaceId: req.params.workspaceId,
        name: req.body?.name ?? "route",
        method: req.body?.method ?? "POST",
        path: req.body?.path ?? "/route",
        authRequired: req.body?.authRequired ?? false,
        scriptCode: req.body?.scriptCode ?? "// write your handler\nreturn { ok: true };",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.proxyScripts.push(script);
      persist();
      return created(script);
    },
  },
  {
    method: "GET",
    pattern: "/proxy-scripts/:proxyId",
    handler: (req) => {
      const script = db.proxyScripts.find((p) => p.id === req.params.proxyId);
      return script ? ok(script) : notFound();
    },
  },
  {
    method: "PUT",
    pattern: "/proxy-scripts/:proxyId",
    handler: (req) => {
      const script = db.proxyScripts.find((p) => p.id === req.params.proxyId);
      if (!script) return notFound();
      Object.assign(script, req.body, { updatedAt: nowIso() });
      persist();
      return ok(script);
    },
  },
  {
    method: "DELETE",
    pattern: "/proxy-scripts/:proxyId",
    handler: (req) => {
      db.proxyScripts = db.proxyScripts.filter(
        (p) => p.id !== req.params.proxyId,
      );
      persist();
      return ok({ deleted: true });
    },
  },
  {
    method: "POST",
    pattern: "/proxy-scripts/:proxyId/run",
    handler: async (req) => {
      const script = db.proxyScripts.find((p) => p.id === req.params.proxyId);
      if (!script) return notFound();
      log(script.workspaceId, "proxy", script.id, "info", `Connecting to ${script.name}...`);
      await delay(300);
      // Simulated sandbox execution result.
      log(
        script.workspaceId,
        "proxy",
        script.id,
        "success",
        `Connected to room ProxyScript/${script.workspaceId}/current/${uid()}`,
      );
      persist();
      return ok({
        ok: true,
        output: { echo: req.body ?? {}, route: script.path },
      });
    },
  },
  {
    method: "GET",
    pattern: "/proxy-scripts/:proxyId/logs",
    handler: (req) =>
      ok(
        db.runtimeLogs.filter(
          (l) => l.sourceType === "proxy" && l.sourceId === req.params.proxyId,
        ),
      ),
  },

  // ---------------- Global Variables ----------------
  {
    method: "GET",
    pattern: "/workspaces/:workspaceId/global-variables",
    handler: (req) =>
      ok(
        db.globalVariables.filter(
          (g) => g.workspaceId === req.params.workspaceId,
        ),
      ),
  },
  {
    method: "POST",
    pattern: "/workspaces/:workspaceId/global-variables",
    handler: (req) => {
      const variable: GlobalVariable = {
        id: uid(),
        workspaceId: req.params.workspaceId,
        name: req.body?.name ?? "variable",
        type: req.body?.type ?? "Object",
        value: req.body?.value ?? "",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.globalVariables.push(variable);
      persist();
      return created(variable);
    },
  },
  {
    method: "PUT",
    pattern: "/global-variables/:varId",
    handler: (req) => {
      const variable = db.globalVariables.find(
        (g) => g.id === req.params.varId,
      );
      if (!variable) return notFound();
      Object.assign(variable, req.body, { updatedAt: nowIso() });
      persist();
      return ok(variable);
    },
  },
  {
    method: "DELETE",
    pattern: "/global-variables/:varId",
    handler: (req) => {
      db.globalVariables = db.globalVariables.filter(
        (g) => g.id !== req.params.varId,
      );
      persist();
      return ok({ deleted: true });
    },
  },

  // ---------------- Flows ----------------
  {
    method: "GET",
    pattern: "/workspaces/:workspaceId/flows",
    handler: (req) =>
      ok(db.flows.filter((f) => f.workspaceId === req.params.workspaceId)),
  },
  {
    method: "POST",
    pattern: "/workspaces/:workspaceId/flows",
    handler: (req) => {
      const flow: Flow = {
        id: uid(),
        workspaceId: req.params.workspaceId,
        modelId: req.body?.modelId ?? db.models[0]?.id,
        name: req.body?.name ?? "New Flow",
        global: req.body?.global ?? false,
        graph: { nodes: [], edges: [] },
        trainStatus: "draft",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.flows.push(flow);
      persist();
      return created(flow);
    },
  },
  {
    method: "GET",
    pattern: "/flows/:flowId",
    handler: (req) => {
      const flow = db.flows.find((f) => f.id === req.params.flowId);
      return flow ? ok(flow) : notFound();
    },
  },
  {
    method: "PUT",
    pattern: "/flows/:flowId",
    handler: (req) => {
      const flow = db.flows.find((f) => f.id === req.params.flowId);
      if (!flow) return notFound();
      Object.assign(flow, req.body, { updatedAt: nowIso() });
      persist();
      return ok(flow);
    },
  },
  {
    method: "DELETE",
    pattern: "/flows/:flowId",
    handler: (req) => {
      db.flows = db.flows.filter((f) => f.id !== req.params.flowId);
      persist();
      return ok({ deleted: true });
    },
  },
  {
    method: "POST",
    pattern: "/flows/:flowId/train",
    handler: async (req) => {
      const flow = db.flows.find((f) => f.id === req.params.flowId);
      if (!flow) return notFound();
      flow.trainStatus = "training";
      log(flow.workspaceId, "flow", flow.id, "info", `Training flow ${flow.name}...`);
      persist();
      await delay(400);
      flow.trainStatus = "ready";
      log(flow.workspaceId, "flow", flow.id, "success", `Flow ${flow.name} trained.`);
      persist();
      return ok(flow);
    },
  },
  {
    method: "GET",
    pattern: "/flows/:flowId/logs",
    handler: (req) =>
      ok(
        db.runtimeLogs.filter(
          (l) => l.sourceType === "flow" && l.sourceId === req.params.flowId,
        ),
      ),
  },

  // ---------------- Messenger ----------------
  {
    method: "POST",
    pattern: "/workspaces/:workspaceId/messenger/sessions",
    handler: (req) => {
      const session = {
        id: uid(),
        workspaceId: req.params.workspaceId,
        channel: req.body?.channel ?? "web",
        createdAt: nowIso(),
      };
      db.chatSessions.push(session);
      persist();
      return created(session);
    },
  },
  {
    method: "GET",
    pattern: "/workspaces/:workspaceId/messenger/sessions",
    handler: (req) =>
      ok(
        db.chatSessions.filter(
          (s) => s.workspaceId === req.params.workspaceId,
        ),
      ),
  },
  {
    method: "GET",
    pattern: "/messenger/sessions/:sessionId/messages",
    handler: (req) =>
      ok(
        db.chatMessages.filter((m) => m.sessionId === req.params.sessionId),
      ),
  },
  {
    method: "POST",
    pattern: "/messenger/sessions/:sessionId/messages",
    handler: async (req) => {
      const userMsg = {
        id: uid(),
        sessionId: req.params.sessionId,
        sender: "user" as const,
        message: req.body?.message ?? "",
        createdAt: nowIso(),
      };
      db.chatMessages.push(userMsg);
      await delay(300);
      const botMsg = {
        id: uid(),
        sessionId: req.params.sessionId,
        sender: "bot" as const,
        message: `Echo from Answer-Bot: "${userMsg.message}"`,
        createdAt: nowIso(),
        debugTrace: [
          "intent matched: Answer-Bot (0.92)",
          "flow: verintKM",
          "node: model -> Answer Bot",
          "node: data -> vector db lookup",
        ],
      };
      db.chatMessages.push(botMsg);
      persist();
      return ok({ userMessage: userMsg, botMessage: botMsg });
    },
  },

  // ---------------- Settings ----------------
  {
    method: "GET",
    pattern: "/workspaces/:workspaceId/settings",
    handler: (req) => {
      const s = db.settings.find(
        (x) => x.workspaceId === req.params.workspaceId,
      );
      return s ? ok(s) : notFound();
    },
  },
  {
    method: "PUT",
    pattern: "/workspaces/:workspaceId/settings",
    handler: (req) => {
      let s = db.settings.find(
        (x) => x.workspaceId === req.params.workspaceId,
      );
      if (!s) {
        s = {
          workspaceId: req.params.workspaceId,
          workspaceName: req.body?.workspaceName ?? "Workspace",
          themePolicy: "user",
        };
        db.settings.push(s);
      } else {
        Object.assign(s, req.body);
      }
      // keep workspace name in sync
      const ws = db.workspaces.find((w) => w.id === req.params.workspaceId);
      if (ws && req.body?.workspaceName) ws.name = req.body.workspaceName;
      persist();
      return ok(s);
    },
  },
];

function matchRoute(
  method: string,
  path: string,
): { route: Route; params: Record<string, string> } | null {
  for (const route of routes) {
    if (route.method !== method) continue;
    const patternParts = route.pattern.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);
    if (patternParts.length !== pathParts.length) continue;
    const params: Record<string, string> = {};
    let matched = true;
    for (let i = 0; i < patternParts.length; i++) {
      const p = patternParts[i];
      if (p.startsWith(":")) {
        params[p.slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (p !== pathParts[i]) {
        matched = false;
        break;
      }
    }
    if (matched) return { route, params };
  }
  return null;
}

export async function handleMockRequest(
  method: string,
  url: string,
  body: unknown,
): Promise<MockResponse> {
  await delay(180);
  const [rawPath, rawQuery] = url.split("?");
  const path = rawPath.replace(/\/+$/, "") || "/";
  const query = new URLSearchParams(rawQuery ?? "");
  const match = matchRoute(method.toUpperCase(), path);
  if (!match) {
    return { status: 404, data: { message: `No mock route for ${method} ${path}` } };
  }
  const parsedBody =
    typeof body === "string" && body.length ? JSON.parse(body) : body;
  return match.route.handler({
    method: method.toUpperCase(),
    path,
    params: match.params,
    query,
    body: parsedBody,
  });
}
