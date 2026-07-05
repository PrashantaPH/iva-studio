# Mini IVA Studio Backend LLD

## 1. Service Structure

```text
backend/
  src/main/java/com/miniivastudio/
    MiniIvaStudioApplication.java
    config/
    security/
    common/
    auth/
    org/
    workspace/
    integrations/
      proxy/
      globalvar/
    model/
    nlp/
      intent/
      entity/
      trigger/
    flow/
    runtime/
      messenger/
      debug/
      script/
    train/
```

## 2. Package Responsibilities

1. auth
- OTP generation and verification
- Google OAuth callback handling
- token issuance and refresh

2. org and workspace
- org and workspace CRUD
- membership checks

3. integrations.proxy
- proxy script CRUD
- test run endpoint
- execution log persistence

4. integrations.globalvar
- global variable CRUD
- type validation and parsing

5. model
- model CRUD
- train request and status

6. nlp.intent
- intent CRUD
- alternate CRUD

7. nlp.entity
- entity CRUD
- entity value CRUD (string or regex)

8. nlp.trigger
- trigger CRUD

9. flow
- flow CRUD
- save graph (nodes and edges)
- train flow graph

10. runtime
- messenger test endpoint
- conversation execution orchestration
- debug stream events

## 3. MongoDB Collections

1. users
- _id
- email
- name
- avatarUrl
- provider (email or google)
- preferences { theme, notifications }
- createdAt, updatedAt

2. otp_codes
- _id
- email
- codeHash
- expiresAt
- attempts

3. organizations
- _id
- name
- ownerUserId
- createdAt, updatedAt

4. memberships
- _id
- orgId
- userId
- role

5. workspaces
- _id
- orgId
- name
- status
- createdAt, updatedAt

6. models
- _id
- orgId
- workspaceId
- name
- language
- trainStatus
- lastTrainedAt

7. intents
- _id
- orgId
- workspaceId
- modelId
- label
- enabled

8. intent_alternates
- _id
- intentId
- value

9. entities
- _id
- orgId
- workspaceId
- modelId
- label
- enabled

10. entity_values
- _id
- entityId
- name
- type (string or regex)
- valueOrPattern
- flags []

11. triggers
- _id
- orgId
- workspaceId
- modelId
- label
- enabled

12. flows
- _id
- orgId
- workspaceId
- modelId
- name
- graph { nodes: [], edges: [] }
- trainStatus
- updatedAt

13. proxy_scripts
- _id
- orgId
- workspaceId
- name
- method
- path
- authRequired
- scriptCode

14. global_variables
- _id
- orgId
- workspaceId
- name
- type
- value

15. runtime_logs
- _id
- orgId
- workspaceId
- sourceType (proxy, model, flow, widget)
- sourceId
- level
- message
- context
- createdAt

16. chat_sessions
- _id
- orgId
- workspaceId
- channel
- status
- createdAt

17. chat_messages
- _id
- sessionId
- sender
- message
- timestamp
- debugTrace

## 4. REST API Design

## 4.1 Auth
- POST /api/v1/auth/register
- POST /api/v1/auth/login/email
- POST /api/v1/auth/otp/verify
- GET /api/v1/auth/google/start
- GET /api/v1/auth/google/callback
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout

## 4.2 Org and Workspace
- GET /api/v1/orgs
- POST /api/v1/orgs
- GET /api/v1/orgs/{orgId}/workspaces
- POST /api/v1/orgs/{orgId}/workspaces

## 4.3 Integrations
- GET /api/v1/workspaces/{workspaceId}/proxy-scripts
- POST /api/v1/workspaces/{workspaceId}/proxy-scripts
- PUT /api/v1/workspaces/{workspaceId}/proxy-scripts/{proxyId}
- POST /api/v1/workspaces/{workspaceId}/proxy-scripts/{proxyId}/run
- GET /api/v1/workspaces/{workspaceId}/proxy-scripts/{proxyId}/logs

- GET /api/v1/workspaces/{workspaceId}/global-variables
- POST /api/v1/workspaces/{workspaceId}/global-variables
- PUT /api/v1/workspaces/{workspaceId}/global-variables/{varId}
- DELETE /api/v1/workspaces/{workspaceId}/global-variables/{varId}

## 4.4 Model and NLP
- GET /api/v1/workspaces/{workspaceId}/models
- POST /api/v1/workspaces/{workspaceId}/models
- POST /api/v1/workspaces/{workspaceId}/models/{modelId}/train

- Intents:
  - GET/POST /api/v1/workspaces/{workspaceId}/intents
  - PUT/DELETE /api/v1/workspaces/{workspaceId}/intents/{intentId}
- Alternates:
  - GET/POST /api/v1/intents/{intentId}/alternates
  - PUT/DELETE /api/v1/intents/{intentId}/alternates/{alternateId}

- Entities:
  - GET/POST /api/v1/workspaces/{workspaceId}/entities
  - PUT/DELETE /api/v1/workspaces/{workspaceId}/entities/{entityId}
- Entity values:
  - GET/POST /api/v1/entities/{entityId}/values
  - PUT/DELETE /api/v1/entities/{entityId}/values/{valueId}

- Triggers:
  - GET/POST /api/v1/workspaces/{workspaceId}/triggers
  - PUT/DELETE /api/v1/workspaces/{workspaceId}/triggers/{triggerId}

## 4.5 Flows
- GET /api/v1/workspaces/{workspaceId}/flows
- POST /api/v1/workspaces/{workspaceId}/flows
- GET /api/v1/workspaces/{workspaceId}/flows/{flowId}
- PUT /api/v1/workspaces/{workspaceId}/flows/{flowId}
- DELETE /api/v1/workspaces/{workspaceId}/flows/{flowId}
- POST /api/v1/workspaces/{workspaceId}/flows/{flowId}/train

## 4.6 Messenger Testing
- POST /api/v1/workspaces/{workspaceId}/messenger/sessions
- POST /api/v1/workspaces/{workspaceId}/messenger/sessions/{sessionId}/messages
- GET /api/v1/workspaces/{workspaceId}/messenger/sessions/{sessionId}/messages

## 5. Script Runtime Design

## 5.1 Interface
- ScriptExecutionService.execute(ScriptExecutionRequest request)

ScriptExecutionRequest:
- workspaceId
- sourceType (proxy/globalVar/widget)
- sourceId
- code
- inputContext
- timeoutMs

ScriptExecutionResponse:
- success
- output
- logs[]
- error

## 5.2 Safety
- timeout enforced
- memory threshold
- whitelist available bindings
- block dangerous host access by default

## 6. Training Design
- async job queue abstraction
- job types: model_train, flow_train
- status persisted in model and flow documents
- logs available in runtime_logs

## 7. LangChain and RAG Design
- RAG service layer:
  - document ingestion
  - chunking
  - embedding
  - vector retrieval
  - response synthesis
- Implementation options:
  - Java-first: LangChain4j modules
  - JS-runtime-assisted: LangChain core in script runtime path
- AWS integration:
  - embeddings and model inference provider via AWS services
  - storage via S3

## 8. Observability
- structured logs with requestId
- runtime log query API for debug terminal panels
- health endpoints:
  - /actuator/health
  - /actuator/metrics

## 9. Workspace Settings
- GET /api/v1/workspaces/{workspaceId}/settings
- PUT /api/v1/workspaces/{workspaceId}/settings

Settings payload (minimal):
- workspaceName
- defaultModelId
- themePolicy (system or user)
