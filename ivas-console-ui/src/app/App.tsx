import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/core/auth/guards";
import { AuthLayout } from "@/layouts/AuthLayout";
import { WorkspaceLayout } from "@/layouts/WorkspaceLayout";
import { LoginPage } from "@/modules/auth/LoginPage";
import { RegisterPage } from "@/modules/auth/RegisterPage";
import { VerifyOtpPage } from "@/modules/auth/VerifyOtpPage";
import { OrgsPage } from "@/modules/org/OrgsPage";
import { WorkspacesPage } from "@/modules/workspace/WorkspacesPage";
import { WorkspaceHomePage } from "@/modules/workspace/WorkspaceHomePage";
import { ProxyScriptsPage } from "@/modules/integrations/proxy-scripts/ProxyScriptsPage";
import { ProxyScriptEditorPage } from "@/modules/integrations/proxy-scripts/ProxyScriptEditorPage";
import { GlobalVariablesPage } from "@/modules/integrations/global-variables/GlobalVariablesPage";
import { ModelsPage } from "@/modules/models/ModelsPage";
import { IntentsPage } from "@/modules/intents/IntentsPage";
import { IntentDetailPage } from "@/modules/intents/IntentDetailPage";
import { EntitiesPage } from "@/modules/entities/EntitiesPage";
import { EntityDetailPage } from "@/modules/entities/EntityDetailPage";
import { TriggersPage } from "@/modules/triggers/TriggersPage";
import { FlowsPage } from "@/modules/flows/FlowsPage";
import { FlowCanvasPage } from "@/modules/flows/FlowCanvasPage";
import { MessengerPage } from "@/modules/messenger/MessengerPage";
import { WorkspaceSettingsPage } from "@/modules/settings/WorkspaceSettingsPage";

export function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/verify-otp" element={<VerifyOtpPage />} />
      </Route>

      <Route
        path="/orgs"
        element={
          <RequireAuth>
            <OrgsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/orgs/:orgId/workspaces"
        element={
          <RequireAuth>
            <WorkspacesPage />
          </RequireAuth>
        }
      />

      <Route
        path="/orgs/:orgId/workspaces/:workspaceId"
        element={
          <RequireAuth>
            <WorkspaceLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<WorkspaceHomePage />} />
        <Route
          path="integrations/proxy-scripts"
          element={<ProxyScriptsPage />}
        />
        <Route
          path="integrations/proxy-scripts/:proxyId"
          element={<ProxyScriptEditorPage />}
        />
        <Route
          path="integrations/global-variables"
          element={<GlobalVariablesPage />}
        />
        <Route path="models" element={<ModelsPage />} />
        <Route path="intents" element={<IntentsPage />} />
        <Route path="intents/:intentId" element={<IntentDetailPage />} />
        <Route path="entities" element={<EntitiesPage />} />
        <Route path="entities/:entityId" element={<EntityDetailPage />} />
        <Route path="triggers" element={<TriggersPage />} />
        <Route path="flows" element={<FlowsPage />} />
        <Route path="flows/:flowId" element={<FlowCanvasPage />} />
        <Route path="messenger" element={<MessengerPage />} />
        <Route path="settings" element={<WorkspaceSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/orgs" replace />} />
    </Routes>
  );
}
