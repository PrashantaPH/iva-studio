import { useParams } from "react-router-dom";

export function useWorkspaceParams() {
  const { orgId, workspaceId } = useParams<{
    orgId: string;
    workspaceId: string;
  }>();
  return { orgId: orgId ?? "", workspaceId: workspaceId ?? "" };
}
