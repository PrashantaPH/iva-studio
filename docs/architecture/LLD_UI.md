# Mini IVA Studio UI LLD

## 1. Project Structure

```text
ivas-console-ui
src/
  app/
    App.tsx
    providers/
      ChakraProvider.tsx
      QueryProvider.tsx
      RouterProvider.tsx
  core/
    api/
      client.ts
      interceptors.ts
    auth/
      authStore.ts
      authGuards.tsx
    types/
      dto.ts
  theme/
    index.ts
    semanticTokens.ts
  layouts/
    AuthLayout.tsx
    WorkspaceLayout.tsx
  modules/
    auth/
    org/
    workspace/
    integrations/
      proxy-scripts/
      global-variables/
    models/
    intents/
    entities/
    triggers/
    flows/
    messenger/
    settings/
  shared/
    components/
    forms/
    hooks/
    utils/
```

## 2. Routing Design
- /auth/login
- /auth/register
- /auth/verify-otp
- /auth/google/callback
- /orgs
- /orgs/:orgId/workspaces
- /orgs/:orgId/workspaces/:workspaceId/home
- /orgs/:orgId/workspaces/:workspaceId/integrations/proxy-scripts
- /orgs/:orgId/workspaces/:workspaceId/integrations/global-variables
- /orgs/:orgId/workspaces/:workspaceId/models
- /orgs/:orgId/workspaces/:workspaceId/intents
- /orgs/:orgId/workspaces/:workspaceId/entities
- /orgs/:orgId/workspaces/:workspaceId/triggers
- /orgs/:orgId/workspaces/:workspaceId/flows
- /orgs/:orgId/workspaces/:workspaceId/flows/:flowId
- /orgs/:orgId/workspaces/:workspaceId/messenger
- /orgs/:orgId/workspaces/:workspaceId/settings

## 3. State Management

## 3.1 TanStack Query
Use for all server state:
- Lists and details
- Mutation invalidations
- Job status polling (model and flow train)

## 3.2 Zustand Stores
Use for local volatile state:
- builderStore
  - activeFlowId
  - nodes
  - edges
  - selectedNodeId
  - debugPanelOpen
- uiStore
  - leftNavCollapsed
  - preferences modal
  - theme override

## 4. Core Components

## 4.1 App Shell
- TopHeader
  - org and workspace selectors
  - avatar
  - preferences
  - sign out
- LeftSidebar
  - workspace module menu
- MainContent

## 4.2 Reusable Data Components
- DataTable
- ConfirmDialog
- EntityFormDialog
- IntentAlternateDialog
- CodeEditorPanel
- DebugTerminalPanel

## 4.3 Flow Builder Components
- FlowCanvasPage
- WidgetPalette
- NodeConfigDrawer
- ReactFlowCanvas
- FlowActionBar (save, train)
- FlowDebugPanel

## 5. Feature LLD

## 5.1 Proxy Scripts
Views:
- List page
- Create/Edit page

Fields:
- name
- method
- path
- authRequired
- scriptCode

Actions:
- save
- run test
- view logs

## 5.2 Global Variables
Types:
- Object (JSON editor)
- Function (JS editor)
- String (text input)

Validation:
- Object must be valid JSON
- Function code lint check in browser before save

## 5.3 Models
Actions:
- create model
- train model
- show last train status

## 5.4 Intents and Alternates
- Intents list CRUD
- Intent details with alternates list CRUD

## 5.5 Entities
- Entities list CRUD
- Entity values list CRUD
- value type: string or regex
- regex flags multi-select

## 5.6 Triggers
- Triggers list CRUD

## 5.7 Flows
Node types:
- Trigger
- Message
- Code
- Branch
- Call API
- Model
- Action
- Data
- Condition
- End

Stored data:
- nodes[]
- edges[]
- metadata

## 5.8 Messenger Testing
- left panel: sessions
- center panel: chat transcript
- bottom input and send
- right panel optional: debug trace

## 6. UI API Contract Pattern
- requests and responses validated using Zod
- typed service methods per module
- common envelope:
  - success
  - data
  - errorCode
  - message

## 7. Theme and Accessibility
- Chakra color mode with semantic tokens
- keyboard support for dialogs
- focus management in modals and flow panel

## 8. Error Handling
- inline field errors for forms
- toast for action results
- panel errors for script runtime failures
- fallback error boundaries for page-level crashes
