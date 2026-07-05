import { apiClient, unwrap } from "./client";
import type {
  Alternate,
  AuthSession,
  ChatMessage,
  ChatSession,
  Entity,
  EntityValue,
  Flow,
  FlowGraph,
  GlobalVariable,
  GlobalVariableType,
  HttpMethod,
  Intent,
  Model,
  Organization,
  ProxyScript,
  RuntimeLog,
  Trigger,
  User,
  UserPreferences,
  Workspace,
  WorkspaceSettings,
} from "@/core/types/dto";

// ---------------- Auth ----------------
export const authApi = {
  register: (email: string, name: string) =>
    unwrap<{ email: string; otpSent: boolean; devOtp: string }>(
      apiClient.post("/auth/register", { email, name }),
    ),
  loginEmail: (email: string) =>
    unwrap<{ email: string; otpSent: boolean; devOtp: string }>(
      apiClient.post("/auth/login/email", { email }),
    ),
  verifyOtp: (email: string, code: string) =>
    unwrap<AuthSession>(apiClient.post("/auth/otp/verify", { email, code })),
  google: () => unwrap<AuthSession>(apiClient.post("/auth/google", {})),
  me: () => unwrap<User>(apiClient.get("/auth/me")),
  updatePreferences: (prefs: Partial<UserPreferences>) =>
    unwrap<User>(apiClient.put("/auth/me/preferences", prefs)),
};

// ---------------- Organizations & Workspaces ----------------
export const orgApi = {
  list: () => unwrap<Organization[]>(apiClient.get("/orgs")),
  create: (name: string) =>
    unwrap<Organization>(apiClient.post("/orgs", { name })),
};

export const workspaceApi = {
  list: (orgId: string) =>
    unwrap<Workspace[]>(apiClient.get(`/orgs/${orgId}/workspaces`)),
  create: (orgId: string, name: string) =>
    unwrap<Workspace>(apiClient.post(`/orgs/${orgId}/workspaces`, { name })),
  getSettings: (workspaceId: string) =>
    unwrap<WorkspaceSettings>(
      apiClient.get(`/workspaces/${workspaceId}/settings`),
    ),
  updateSettings: (workspaceId: string, body: Partial<WorkspaceSettings>) =>
    unwrap<WorkspaceSettings>(
      apiClient.put(`/workspaces/${workspaceId}/settings`, body),
    ),
};

// ---------------- Models ----------------
export const modelApi = {
  list: (workspaceId: string) =>
    unwrap<Model[]>(apiClient.get(`/workspaces/${workspaceId}/models`)),
  create: (workspaceId: string, name: string, language: string) =>
    unwrap<Model>(
      apiClient.post(`/workspaces/${workspaceId}/models`, { name, language }),
    ),
  train: (workspaceId: string, modelId: string) =>
    unwrap<Model>(
      apiClient.post(`/workspaces/${workspaceId}/models/${modelId}/train`, {}),
    ),
};

// ---------------- Intents ----------------
export const intentApi = {
  list: (workspaceId: string) =>
    unwrap<Intent[]>(apiClient.get(`/workspaces/${workspaceId}/intents`)),
  create: (workspaceId: string, label: string, modelId?: string) =>
    unwrap<Intent>(
      apiClient.post(`/workspaces/${workspaceId}/intents`, { label, modelId }),
    ),
  get: (intentId: string) =>
    unwrap<Intent>(apiClient.get(`/intents/${intentId}`)),
  update: (intentId: string, body: Partial<Intent>) =>
    unwrap<Intent>(apiClient.put(`/intents/${intentId}`, body)),
  remove: (intentId: string) =>
    unwrap<{ deleted: boolean }>(apiClient.delete(`/intents/${intentId}`)),
  listAlternates: (intentId: string) =>
    unwrap<Alternate[]>(apiClient.get(`/intents/${intentId}/alternates`)),
  addAlternate: (intentId: string, value: string) =>
    unwrap<Alternate>(
      apiClient.post(`/intents/${intentId}/alternates`, { value }),
    ),
  removeAlternate: (alternateId: string) =>
    unwrap<{ deleted: boolean }>(
      apiClient.delete(`/alternates/${alternateId}`),
    ),
};

// ---------------- Entities ----------------
export const entityApi = {
  list: (workspaceId: string) =>
    unwrap<Entity[]>(apiClient.get(`/workspaces/${workspaceId}/entities`)),
  create: (workspaceId: string, label: string, modelId?: string) =>
    unwrap<Entity>(
      apiClient.post(`/workspaces/${workspaceId}/entities`, { label, modelId }),
    ),
  get: (entityId: string) =>
    unwrap<Entity>(apiClient.get(`/entities/${entityId}`)),
  update: (entityId: string, body: Partial<Entity>) =>
    unwrap<Entity>(apiClient.put(`/entities/${entityId}`, body)),
  remove: (entityId: string) =>
    unwrap<{ deleted: boolean }>(apiClient.delete(`/entities/${entityId}`)),
  listValues: (entityId: string) =>
    unwrap<EntityValue[]>(apiClient.get(`/entities/${entityId}/values`)),
  addValue: (entityId: string, body: Partial<EntityValue>) =>
    unwrap<EntityValue>(apiClient.post(`/entities/${entityId}/values`, body)),
  updateValue: (valueId: string, body: Partial<EntityValue>) =>
    unwrap<EntityValue>(apiClient.put(`/entity-values/${valueId}`, body)),
  removeValue: (valueId: string) =>
    unwrap<{ deleted: boolean }>(
      apiClient.delete(`/entity-values/${valueId}`),
    ),
};

// ---------------- Triggers ----------------
export const triggerApi = {
  list: (workspaceId: string) =>
    unwrap<Trigger[]>(apiClient.get(`/workspaces/${workspaceId}/triggers`)),
  create: (workspaceId: string, label: string, modelId?: string) =>
    unwrap<Trigger>(
      apiClient.post(`/workspaces/${workspaceId}/triggers`, { label, modelId }),
    ),
  update: (triggerId: string, body: Partial<Trigger>) =>
    unwrap<Trigger>(apiClient.put(`/triggers/${triggerId}`, body)),
  remove: (triggerId: string) =>
    unwrap<{ deleted: boolean }>(apiClient.delete(`/triggers/${triggerId}`)),
};

// ---------------- Proxy Scripts ----------------
export const proxyApi = {
  list: (workspaceId: string) =>
    unwrap<ProxyScript[]>(
      apiClient.get(`/workspaces/${workspaceId}/proxy-scripts`),
    ),
  create: (
    workspaceId: string,
    body: { name: string; method: HttpMethod; path: string },
  ) =>
    unwrap<ProxyScript>(
      apiClient.post(`/workspaces/${workspaceId}/proxy-scripts`, body),
    ),
  get: (proxyId: string) =>
    unwrap<ProxyScript>(apiClient.get(`/proxy-scripts/${proxyId}`)),
  update: (proxyId: string, body: Partial<ProxyScript>) =>
    unwrap<ProxyScript>(apiClient.put(`/proxy-scripts/${proxyId}`, body)),
  remove: (proxyId: string) =>
    unwrap<{ deleted: boolean }>(apiClient.delete(`/proxy-scripts/${proxyId}`)),
  run: (proxyId: string, payload: unknown) =>
    unwrap<{ ok: boolean; output: unknown }>(
      apiClient.post(`/proxy-scripts/${proxyId}/run`, payload),
    ),
  logs: (proxyId: string) =>
    unwrap<RuntimeLog[]>(apiClient.get(`/proxy-scripts/${proxyId}/logs`)),
};

// ---------------- Global Variables ----------------
export const globalVarApi = {
  list: (workspaceId: string) =>
    unwrap<GlobalVariable[]>(
      apiClient.get(`/workspaces/${workspaceId}/global-variables`),
    ),
  create: (
    workspaceId: string,
    body: { name: string; type: GlobalVariableType; value: string },
  ) =>
    unwrap<GlobalVariable>(
      apiClient.post(`/workspaces/${workspaceId}/global-variables`, body),
    ),
  update: (varId: string, body: Partial<GlobalVariable>) =>
    unwrap<GlobalVariable>(
      apiClient.put(`/global-variables/${varId}`, body),
    ),
  remove: (varId: string) =>
    unwrap<{ deleted: boolean }>(
      apiClient.delete(`/global-variables/${varId}`),
    ),
};

// ---------------- Flows ----------------
export const flowApi = {
  list: (workspaceId: string) =>
    unwrap<Flow[]>(apiClient.get(`/workspaces/${workspaceId}/flows`)),
  create: (workspaceId: string, name: string, global: boolean) =>
    unwrap<Flow>(
      apiClient.post(`/workspaces/${workspaceId}/flows`, { name, global }),
    ),
  get: (flowId: string) => unwrap<Flow>(apiClient.get(`/flows/${flowId}`)),
  update: (flowId: string, body: Partial<Flow> & { graph?: FlowGraph }) =>
    unwrap<Flow>(apiClient.put(`/flows/${flowId}`, body)),
  remove: (flowId: string) =>
    unwrap<{ deleted: boolean }>(apiClient.delete(`/flows/${flowId}`)),
  train: (flowId: string) =>
    unwrap<Flow>(apiClient.post(`/flows/${flowId}/train`, {})),
  logs: (flowId: string) =>
    unwrap<RuntimeLog[]>(apiClient.get(`/flows/${flowId}/logs`)),
};

// ---------------- Messenger ----------------
export const messengerApi = {
  listSessions: (workspaceId: string) =>
    unwrap<ChatSession[]>(
      apiClient.get(`/workspaces/${workspaceId}/messenger/sessions`),
    ),
  createSession: (workspaceId: string, channel = "web") =>
    unwrap<ChatSession>(
      apiClient.post(`/workspaces/${workspaceId}/messenger/sessions`, {
        channel,
      }),
    ),
  listMessages: (sessionId: string) =>
    unwrap<ChatMessage[]>(
      apiClient.get(`/messenger/sessions/${sessionId}/messages`),
    ),
  sendMessage: (sessionId: string, message: string) =>
    unwrap<{ userMessage: ChatMessage; botMessage: ChatMessage }>(
      apiClient.post(`/messenger/sessions/${sessionId}/messages`, { message }),
    ),
};
