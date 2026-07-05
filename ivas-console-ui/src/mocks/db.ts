// In-memory mock database with localStorage persistence.
// This simulates the backend datastore for the mini IVA Studio console.

import type {
  Alternate,
  ChatMessage,
  ChatSession,
  Entity,
  EntityValue,
  Flow,
  GlobalVariable,
  Intent,
  Model,
  Organization,
  ProxyScript,
  RuntimeLog,
  Trigger,
  User,
  Workspace,
  WorkspaceSettings,
} from "@/core/types/dto";

export interface MockDB {
  users: User[];
  organizations: Organization[];
  workspaces: Workspace[];
  models: Model[];
  intents: Intent[];
  alternates: Alternate[];
  entities: Entity[];
  entityValues: EntityValue[];
  triggers: Trigger[];
  proxyScripts: ProxyScript[];
  globalVariables: GlobalVariable[];
  runtimeLogs: RuntimeLog[];
  flows: Flow[];
  chatSessions: ChatSession[];
  chatMessages: ChatMessage[];
  settings: WorkspaceSettings[];
}

const STORAGE_KEY = "iva-studio-mock-db";

export const uid = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const nowIso = (): string => new Date().toISOString();

export const delay = (ms = 250): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function seed(): MockDB {
  const userId = "usr_demo";
  const orgId = "org_demo";
  const wsId = "ws_finance";
  const modelId = "mdl_finance";

  const user: User = {
    id: userId,
    email: "demo@iva.studio",
    name: "Demo User",
    provider: "email",
    avatarUrl: undefined,
    preferences: { theme: "system", notifications: true },
  };

  const org: Organization = {
    id: orgId,
    name: "Verint Demo Org",
    ownerUserId: userId,
    createdAt: nowIso(),
  };

  const workspace: Workspace = {
    id: wsId,
    orgId,
    name: "Knowledge Management",
    status: "active",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const model: Model = {
    id: modelId,
    workspaceId: wsId,
    name: "FINANCE_MODEL",
    language: "English",
    trainStatus: "ready",
    lastTrainedAt: nowIso(),
    createdAt: nowIso(),
  };

  const intentLabels = [
    "Answer-Bot",
    "verintKM",
    "Payments",
    "Thanks",
    "GoodBye",
    "Greetings",
    "Connect to Live Agent",
    "View Balance",
  ];
  const intents: Intent[] = intentLabels.map((label, i) => ({
    id: `int_${i}`,
    workspaceId: wsId,
    modelId,
    label,
    enabled: label !== "test",
    createdAt: nowIso(),
  }));

  const alternates: Alternate[] = [
    { id: "alt_1", intentId: "int_0", value: "hello", createdAt: nowIso() },
    { id: "alt_2", intentId: "int_0", value: "hi", createdAt: nowIso() },
    { id: "alt_3", intentId: "int_0", value: "answer-bot", createdAt: nowIso() },
    { id: "alt_4", intentId: "int_0", value: "answer", createdAt: nowIso() },
  ];

  const entities: Entity[] = [
    {
      id: "ent_account",
      workspaceId: wsId,
      modelId,
      label: "AccountNumber",
      enabled: true,
      createdAt: nowIso(),
    },
  ];

  const entityValues: EntityValue[] = [
    {
      id: "entv_1",
      entityId: "ent_account",
      name: "8DigitAccountNumber",
      type: "regex",
      valueOrPattern: "\\b\\d{8}\\b",
      flags: ["g", "m", "i"],
      createdAt: nowIso(),
    },
  ];

  const triggers: Trigger[] = [
    {
      id: "trg_test",
      workspaceId: wsId,
      modelId,
      label: "Test",
      enabled: true,
      createdAt: nowIso(),
    },
  ];

  const proxyScripts: ProxyScript[] = [
    {
      id: "px_messenger",
      workspaceId: wsId,
      name: "messenger",
      method: "POST",
      path: "/messenger",
      authRequired: false,
      scriptCode: `// console.log(req.params);
// console.log(req.query);
// console.log(req.body);

const messengerToken = settings.messenger.token;
const messengerURL = settings.messenger.apiBaseURL;
const nluURL = settings.nlu.apiBaseURL;
const nluModelName = settings.nlu.modelName;

const external = req.body.event?.external;
const sessionId = req.body.event.connectionId;

return { ok: true, sessionId };`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];

  const globalVariables: GlobalVariable[] = [
    {
      id: "gv_answerbotSettings",
      workspaceId: wsId,
      name: "answerbotSettings",
      type: "Object",
      value: JSON.stringify(
        {
          Token: { audience: "" },
          CQA: {
            apiurl: "",
            productcode: "",
            ingress: "",
            cqaversion: "",
            vpsc: "",
            filterThresholdSourceValue: 0,
          },
        },
        null,
        2,
      ),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: "gv_settings",
      workspaceId: wsId,
      name: "settings",
      type: "Function",
      value: `function settings() {
  return {
    messenger: { token: "", apiBaseURL: "" },
    nlu: { apiBaseURL: "", modelName: "FINANCE_MODEL" },
  };
}`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];

  const flows: Flow[] = [
    {
      id: "flow_verintkm",
      workspaceId: wsId,
      modelId,
      name: "verintKM",
      global: false,
      graph: {
        nodes: [
          {
            id: "n_trigger",
            type: "trigger",
            position: { x: 60, y: 40 },
            data: { label: "Answer-Bot" },
          },
          {
            id: "n_answerbot",
            type: "model",
            position: { x: 320, y: 160 },
            data: { label: "Answer Bot" },
          },
          {
            id: "n_code",
            type: "code",
            position: { x: 620, y: 60 },
            data: { label: "Code" },
          },
          {
            id: "n_data",
            type: "data",
            position: { x: 360, y: 320 },
            data: { label: "got the data from the vector db" },
          },
        ],
        edges: [
          { id: "e1", source: "n_trigger", target: "n_answerbot" },
          { id: "e2", source: "n_answerbot", target: "n_data" },
        ],
      },
      trainStatus: "ready",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: "flow_global",
      workspaceId: wsId,
      modelId,
      name: "Global-flow",
      global: true,
      graph: { nodes: [], edges: [] },
      trainStatus: "draft",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];

  const settings: WorkspaceSettings[] = [
    {
      workspaceId: wsId,
      workspaceName: "Knowledge Management",
      defaultModelId: modelId,
      themePolicy: "user",
    },
  ];

  return {
    users: [user],
    organizations: [org],
    workspaces: [workspace],
    models: [model],
    intents,
    alternates,
    entities,
    entityValues,
    triggers,
    proxyScripts,
    globalVariables,
    runtimeLogs: [],
    flows,
    chatSessions: [],
    chatMessages: [],
    settings,
  };
}

function load(): MockDB {
  if (typeof localStorage === "undefined") return seed();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const fresh = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(raw) as MockDB;
  } catch {
    const fresh = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

export const db: MockDB = load();

export function persist(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDb(): void {
  const fresh = seed();
  (Object.keys(fresh) as (keyof MockDB)[]).forEach((key) => {
    // @ts-expect-error index assignment across union arrays
    db[key] = fresh[key];
  });
  persist();
}
