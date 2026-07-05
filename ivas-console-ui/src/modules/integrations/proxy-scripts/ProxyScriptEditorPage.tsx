import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Spinner,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import { FiPlay, FiSave, FiTrash2 } from "react-icons/fi";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { proxyApi } from "@/core/api/services";
import { CodeEditorPanel } from "@/shared/components/CodeEditorPanel";
import { DebugTerminalPanel } from "@/shared/components/DebugTerminalPanel";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { PageHeader } from "@/shared/components/PageHeader";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";
import { useDisclosure } from "@chakra-ui/react";

export function ProxyScriptEditorPage() {
  const { proxyId = "" } = useParams();
  const { orgId, workspaceId } = useWorkspaceParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const del = useDisclosure();

  const [code, setCode] = useState("");
  const [authRequired, setAuthRequired] = useState(false);

  const script = useQuery({
    queryKey: ["proxy-script", proxyId],
    queryFn: () => proxyApi.get(proxyId),
  });

  const logs = useQuery({
    queryKey: ["proxy-logs", proxyId],
    queryFn: () => proxyApi.logs(proxyId),
    refetchInterval: 1500,
  });

  useEffect(() => {
    if (script.data) {
      setCode(script.data.scriptCode);
      setAuthRequired(script.data.authRequired);
    }
  }, [script.data]);

  const save = useMutation({
    mutationFn: () =>
      proxyApi.update(proxyId, { scriptCode: code, authRequired }),
    onSuccess: () => {
      toast({ title: "Saved", status: "success" });
      queryClient.invalidateQueries({ queryKey: ["proxy-script", proxyId] });
    },
  });

  const run = useMutation({
    mutationFn: () => proxyApi.run(proxyId, { event: { connectionId: "demo" } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxy-logs", proxyId] });
    },
  });

  const remove = useMutation({
    mutationFn: () => proxyApi.remove(proxyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxy", workspaceId] });
      navigate(
        `/orgs/${orgId}/workspaces/${workspaceId}/integrations/proxy-scripts`,
      );
    },
  });

  if (script.isLoading) {
    return (
      <Box p={8}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box p={8}>
      <PageHeader
        title="Edit Proxy Script"
        subtitle={script.data?.name}
        actions={
          <HStack>
            <Button
              leftIcon={<FiSave />}
              onClick={() => save.mutate()}
              isLoading={save.isPending}
            >
              Save
            </Button>
            <Button
              leftIcon={<FiPlay />}
              colorScheme="green"
              onClick={() => run.mutate()}
              isLoading={run.isPending}
            >
              Run
            </Button>
            <Button
              leftIcon={<FiTrash2 />}
              variant="outline"
              colorScheme="red"
              onClick={del.onOpen}
            >
              Delete
            </Button>
          </HStack>
        }
      />

      <Flex
        gap={4}
        mb={4}
        p={4}
        bg="app.surface"
        borderWidth="1px"
        borderColor="app.border"
        rounded="md"
        align="center"
        wrap="wrap"
      >
        <FormControl maxW="200px">
          <FormLabel fontSize="xs" mb={1}>
            Route
          </FormLabel>
          <Input size="sm" value={script.data?.name} isReadOnly />
        </FormControl>
        <FormControl maxW="120px">
          <FormLabel fontSize="xs" mb={1}>
            Method
          </FormLabel>
          <Input size="sm" value={script.data?.method} isReadOnly />
        </FormControl>
        <Box flex="1" minW="200px">
          <FormLabel fontSize="xs" mb={1}>
            Endpoint
          </FormLabel>
          <Text fontSize="sm" fontFamily="mono" color="app.textMuted">
            /ProxyScript/run/{workspaceId}/current{script.data?.path}
          </Text>
        </Box>
        <FormControl display="flex" alignItems="center" w="auto" gap={2}>
          <FormLabel fontSize="xs" mb={0}>
            Authentication
          </FormLabel>
          <Switch
            isChecked={authRequired}
            onChange={(e) => setAuthRequired(e.target.checked)}
          />
        </FormControl>
      </Flex>

      <Text fontSize="xs" fontWeight="bold" mb={2} color="app.textMuted">
        JAVASCRIPT
      </Text>
      <Box mb={4}>
        <CodeEditorPanel
          value={code}
          onChange={setCode}
          language="javascript"
          height={340}
        />
      </Box>

      <DebugTerminalPanel
        logs={logs.data ?? []}
        title="messenger"
        height={200}
      />

      <ConfirmDialog
        isOpen={del.isOpen}
        title="Delete proxy script"
        message="This action cannot be undone."
        isLoading={remove.isPending}
        onConfirm={() => remove.mutate()}
        onClose={del.onClose}
      />
    </Box>
  );
}
