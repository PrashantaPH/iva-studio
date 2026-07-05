// Shared domain types (DTOs) for the mini IVA Studio console.
// These mirror the mock backend contracts served by MSW.

export type ID = string;

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  errorCode?: string;
  message?: string;
}

export type ThemeMode = "light" | "dark" | "system";

export interface UserPreferences {
  theme: ThemeMode;
  notifications: boolean;
}

export interface User {
  id: ID;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: "email" | "google";
  preferences: UserPreferences;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

export interface Organization {
  id: ID;
  name: string;
  ownerUserId: ID;
  createdAt: string;
}

export type WorkspaceStatus = "active" | "draft" | "archived";

export interface Workspace {
  id: ID;
  orgId: ID;
  name: string;
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt: string;
}

export type TrainStatus = "draft" | "queued" | "training" | "ready" | "failed";

export interface Model {
  id: ID;
  workspaceId: ID;
  name: string;
  language: string;
  trainStatus: TrainStatus;
  lastTrainedAt?: string;
  createdAt: string;
}

export interface Intent {
  id: ID;
  workspaceId: ID;
  modelId: ID;
  label: string;
  enabled: boolean;
  createdAt: string;
}

export interface Alternate {
  id: ID;
  intentId: ID;
  value: string;
  createdAt: string;
}

export interface Entity {
  id: ID;
  workspaceId: ID;
  modelId: ID;
  label: string;
  enabled: boolean;
  createdAt: string;
}

export type EntityValueType = "string" | "regex";
export type RegexFlag = "g" | "m" | "i" | "s" | "u";

export interface EntityValue {
  id: ID;
  entityId: ID;
  name: string;
  type: EntityValueType;
  valueOrPattern: string;
  flags: RegexFlag[];
  createdAt: string;
}

export interface Trigger {
  id: ID;
  workspaceId: ID;
  modelId: ID;
  label: string;
  enabled: boolean;
  createdAt: string;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ProxyScript {
  id: ID;
  workspaceId: ID;
  name: string;
  method: HttpMethod;
  path: string;
  authRequired: boolean;
  scriptCode: string;
  createdAt: string;
  updatedAt: string;
}

export type GlobalVariableType = "Object" | "Function" | "String";

export interface GlobalVariable {
  id: ID;
  workspaceId: ID;
  name: string;
  type: GlobalVariableType;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export type LogLevel = "info" | "success" | "warn" | "error";
export type RuntimeSource = "proxy" | "model" | "flow" | "widget";

export interface RuntimeLog {
  id: ID;
  workspaceId: ID;
  sourceType: RuntimeSource;
  sourceId: ID;
  level: LogLevel;
  message: string;
  createdAt: string;
}

// ---- Flow graph ----
export type FlowNodeType =
  | "trigger"
  | "message"
  | "code"
  | "branch"
  | "callApi"
  | "model"
  | "action"
  | "data"
  | "condition"
  | "end";

export interface FlowNode {
  id: ID;
  type: FlowNodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    config?: Record<string, unknown>;
  };
}

export interface FlowEdge {
  id: ID;
  source: ID;
  target: ID;
  label?: string;
}

export interface FlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface Flow {
  id: ID;
  workspaceId: ID;
  modelId?: ID;
  name: string;
  global: boolean;
  graph: FlowGraph;
  trainStatus: TrainStatus;
  createdAt: string;
  updatedAt: string;
}

// ---- Messenger ----
export type ChatSender = "user" | "bot";

export interface ChatMessage {
  id: ID;
  sessionId: ID;
  sender: ChatSender;
  message: string;
  createdAt: string;
  debugTrace?: string[];
}

export interface ChatSession {
  id: ID;
  workspaceId: ID;
  channel: string;
  createdAt: string;
}

export interface WorkspaceSettings {
  workspaceId: ID;
  workspaceName: string;
  defaultModelId?: ID;
  themePolicy: "system" | "user";
}
