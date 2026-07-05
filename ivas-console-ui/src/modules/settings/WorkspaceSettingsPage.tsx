import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Spinner,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { FiSave } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { modelApi, workspaceApi } from "@/core/api/services";
import { PageHeader } from "@/shared/components/PageHeader";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";

export function WorkspaceSettingsPage() {
  const { workspaceId } = useWorkspaceParams();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [workspaceName, setWorkspaceName] = useState("");
  const [defaultModelId, setDefaultModelId] = useState("");
  const [themePolicy, setThemePolicy] = useState<"system" | "user">("user");

  const settings = useQuery({
    queryKey: ["settings", workspaceId],
    queryFn: () => workspaceApi.getSettings(workspaceId),
  });
  const models = useQuery({
    queryKey: ["models", workspaceId],
    queryFn: () => modelApi.list(workspaceId),
  });

  useEffect(() => {
    if (settings.data) {
      setWorkspaceName(settings.data.workspaceName);
      setDefaultModelId(settings.data.defaultModelId ?? "");
      setThemePolicy(settings.data.themePolicy);
    }
  }, [settings.data]);

  const save = useMutation({
    mutationFn: () =>
      workspaceApi.updateSettings(workspaceId, {
        workspaceName,
        defaultModelId: defaultModelId || undefined,
        themePolicy,
      }),
    onSuccess: () => {
      toast({ title: "Settings saved", status: "success" });
      queryClient.invalidateQueries({ queryKey: ["settings", workspaceId] });
    },
  });

  if (settings.isLoading) {
    return (
      <Box p={8}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box p={8}>
      <PageHeader
        title="Workspace Settings"
        subtitle="General configuration for this workspace"
      />

      <Box
        maxW="600px"
        bg="app.surface"
        borderWidth="1px"
        borderColor="app.border"
        rounded="md"
        p={6}
      >
        <Stack spacing={5}>
          <FormControl>
            <FormLabel>Workspace name</FormLabel>
            <Input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Default model</FormLabel>
            <Select
              value={defaultModelId}
              onChange={(e) => setDefaultModelId(e.target.value)}
              placeholder="Select a model"
            >
              {models.data?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Theme policy</FormLabel>
            <Select
              value={themePolicy}
              onChange={(e) =>
                setThemePolicy(e.target.value as "system" | "user")
              }
            >
              <option value="user">Follow user preference</option>
              <option value="system">Follow system</option>
            </Select>
          </FormControl>

          <Box>
            <Button
              leftIcon={<FiSave />}
              onClick={() => save.mutate()}
              isLoading={save.isPending}
            >
              Save
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
