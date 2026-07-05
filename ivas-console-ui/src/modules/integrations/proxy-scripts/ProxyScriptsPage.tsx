import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { proxyApi } from "@/core/api/services";
import { PageHeader } from "@/shared/components/PageHeader";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";
import type { HttpMethod } from "@/core/types/dto";

const methodColor: Record<HttpMethod, string> = {
  GET: "green",
  POST: "blue",
  PUT: "orange",
  DELETE: "red",
  PATCH: "purple",
};

export function ProxyScriptsPage() {
  const { orgId, workspaceId } = useWorkspaceParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [method, setMethod] = useState<HttpMethod>("POST");
  const [path, setPath] = useState("/route");

  const scripts = useQuery({
    queryKey: ["proxy", workspaceId],
    queryFn: () => proxyApi.list(workspaceId),
  });

  const create = useMutation({
    mutationFn: () => proxyApi.create(workspaceId, { name, method, path }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["proxy", workspaceId] });
      onClose();
      setName("");
      navigate(
        `/orgs/${orgId}/workspaces/${workspaceId}/integrations/proxy-scripts/${created.id}`,
      );
    },
  });

  return (
    <Box p={8}>
      <PageHeader
        title="Proxy Scripts"
        subtitle="HTTP routes with server-side JavaScript handlers"
        actions={
          <Button leftIcon={<FiPlus />} onClick={onOpen}>
            Add proxy script
          </Button>
        }
      />

      <Box
        bg="app.surface"
        borderWidth="1px"
        borderColor="app.border"
        rounded="md"
        overflow="hidden"
      >
        {scripts.isLoading ? (
          <Box p={6}>
            <Spinner />
          </Box>
        ) : (
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Route name</Th>
                <Th>Method</Th>
                <Th>Path</Th>
                <Th>Auth</Th>
              </Tr>
            </Thead>
            <Tbody>
              {scripts.data?.map((s) => (
                <Tr
                  key={s.id}
                  cursor="pointer"
                  _hover={{ bg: "app.surfaceAlt" }}
                  onClick={() =>
                    navigate(
                      `/orgs/${orgId}/workspaces/${workspaceId}/integrations/proxy-scripts/${s.id}`,
                    )
                  }
                >
                  <Td fontWeight="medium">{s.name}</Td>
                  <Td>
                    <Badge colorScheme={methodColor[s.method]}>{s.method}</Badge>
                  </Td>
                  <Td>{s.path}</Td>
                  <Td>{s.authRequired ? "Required" : "Off"}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="app.surface">
          <ModalHeader>New proxy script</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Route name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Method</FormLabel>
              <Select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Path</FormLabel>
              <Input value={path} onChange={(e) => setPath(e.target.value)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => create.mutate()}
              isLoading={create.isPending}
              isDisabled={!name}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
