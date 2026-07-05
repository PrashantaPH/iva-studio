# Mini IVA Studio Backend HLD

## 1. Goal
Build a backend platform using Spring Boot as the primary API layer, with support for executing user-authored JavaScript (Proxy Script, Global Variable Function, Widget Code) safely and enabling LLM and RAG workflows.

## 2. Technology Stack
- Java 21
- Spring Boot 3.x
- Spring Security (JWT, OAuth2 for Google)
- MongoDB
- Spring Data MongoDB
- WebSocket (chat stream and debug stream)
- Redis (OTP and transient runtime state)
- AWS SDK (S3, Secrets Manager, Bedrock or other AWS services as needed)
- LangChain support:
  - Primary option: LangChain4j in Spring services
  - Optional runtime sidecar: LangChain JS Core for script-driven agent paths

## 3. Service Topology

## 3.1 Core API Service (Spring Boot)
Responsibilities:
- Authentication (email OTP, Google)
- Organization and workspace management
- CRUD APIs for models, intents, alternates, entities, triggers, flows
- Training orchestration APIs
- Debug log aggregation and retrieval
- Messenger test session orchestration

## 3.2 Script Runtime Service (JS execution)
Responsibilities:
- Execute user JavaScript from UI-managed artifacts:
  - Proxy Script
  - Global Variable Function
  - Widget code execution node
- Run in isolated sandbox with time and memory limits
- Emit execution logs and errors

Implementation options:
1. In-process with GraalVM JavaScript (single deploy, simpler local setup)
2. Sidecar Node runtime (isolated-vm or vm2 style isolation) for stronger isolation and LangChain JS Core integration

Recommended for learning MVP:
- Start in-process with GraalVM JS for fewer moving parts
- Keep adapter interface to move to sidecar later

## 4. Domain Boundaries
1. Identity Domain
- User, Auth session, OTP, OAuth mapping, preferences

2. Tenancy Domain
- Organization, membership, workspace

3. Integration Domain
- Proxy script, global variables, execution runs, run logs

4. NLP Domain
- Model, intent, alternate, entity, entity value, trigger

5. Flow Domain
- Conversation flow, nodes, edges, publishable runtime graph

6. Runtime Domain
- Messenger test sessions
- Conversation execution engine
- Debug event stream

## 5. Data Storage Strategy
- MongoDB stores all tenant-scoped entities and flow graphs
- Redis stores OTP codes, short-lived locks, and execution state
- S3 stores optional large artifacts (exported flows, training datasets, snapshots)

## 6. Training and Debug Model
- Train endpoints enqueue a job per workspace model
- Job states: queued, running, completed, failed
- Debug events available by:
  - proxy run
  - flow run
  - model train run
  - widget execution run

## 7. Security Model
- JWT access and refresh token lifecycle
- Workspace-scoped authorization checks on every endpoint
- Script safety controls:
  - restricted globals
  - deny file system and network unless explicitly permitted by proxy policy
  - execution timeout and max memory constraints

## 8. Non-functional Targets
- CRUD p95 < 300 ms (local env with moderate data)
- Script run timeout defaults under 3 seconds (configurable)
- Debug log streaming near-real-time for test sessions
- Full audit fields on mutable entities

## 9. Deployment Model
- Minimal learning deployment:
  - 1x Spring Boot app
  - 1x MongoDB
  - 1x Redis
- Optional extension:
  - Script runtime sidecar
  - Queue worker for training and long jobs
