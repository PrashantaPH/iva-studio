# Mini IVA Studio UI HLD

## 1. Goal
Build a learning-grade, production-style frontend for a mini IVA Studio platform with:
- Authentication (Email OTP, Google sign-in)
- Organization and Workspace hierarchy
- Workspace modules: Home, Integrations, Models, Intents, Entities, Triggers, Conversation Flows, Messenger Testing, Workspace Settings
- Light and Dark themes

## 2. Technology Stack
- React 18
- TypeScript
- Chakra UI (component system, theming, dark mode)
- React Router
- TanStack Query (server state)
- Zustand (local UI and builder state)
- React Flow (flow canvas, nodes, edges, drag/drop)
- Monaco Editor (code editing for Proxy Scripts, Global Variables, Widget Code)
- Zod (runtime validation for forms and API contracts)
- Axios (HTTP client)

## 3. UI Architecture

## 3.1 Layered Structure
1. App Shell Layer
- Global layout
- Header bar, user avatar, profile menu, preferences, sign out
- Organization and Workspace context switch

2. Feature Module Layer
- Auth
- Org and Workspace
- Integrations
- NLP (Intents, Entities, Triggers)
- Flow Builder
- Messenger Testing
- Workspace Settings

3. Shared Layer
- Reusable components (tables, forms, dialogs, toasts, code editor wrapper)
- API client and typed DTOs
- Theme tokens
- Validation schemas

## 3.2 Feature Modules
1. Auth
- Login page
- Register page
- Email OTP verification step
- Continue with Google

2. Organization + Workspace
- Org selector and create org dialog
- Workspace list and create workspace dialog
- Workspace landing/home page

3. Integrations
- Proxy Scripts: list, create, edit, save, run, debug logs terminal panel
- Global Variables: list and CRUD for Object, Function, String

4. Models
- Create model
- Train model
- Status indicators

5. NLP
- Intents CRUD
- Alternates CRUD
- Entities CRUD
- Entity Values CRUD (String/Regex + flags)
- Triggers CRUD

6. Conversation Flows
- Flow list CRUD
- Canvas builder with widget side bar
- Node drag/drop and edge connect
- Save and Train actions
- Runtime debug panel

7. Messenger Testing
- Simple web chat simulation
- Session selector
- Request and response timeline

8. Workspace Settings
- General settings form
- Save action

## 4. Navigation Model
- Top-level route: Workspace shell
- Left menu sections:
  - Home
  - Integrations
  - Models
  - Intents
  - Entities
  - Triggers
  - Conversation Flows
  - Messenger Testing
  - Workspace Settings

## 5. Theme Strategy
- Chakra semantic tokens for colors, border, background, text
- Color mode toggle in Preferences modal
- Persist preference to backend user profile

## 6. Security and UX Controls
- Route guards for auth and workspace context
- Feature-level permission checks (future-ready)
- Input validation and safe JSON editor validation
- Autosave indicators for long-form editors (proxy and flow builder)

## 7. Non-functional Targets
- First meaningful render under 2.5 seconds in dev-sized data
- Page-level skeleton loaders
- Optimistic updates on CRUD where safe
- Accessibility: keyboard navigation for forms and dialogs

## 8. Deliverables
- Fully modular SPA with typed APIs
- End-to-end UI for defined MVP modules
- Light and dark mode parity across all modules
