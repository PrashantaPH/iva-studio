import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { FiCheckCircle, FiPlus, FiTrash2 } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { flowApi } from "@/core/api/services";
import { PageHeader } from "@/shared/components/PageHeader";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";

export function FlowsPage() {
  const { orgId, workspaceId } = useWorkspaceParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [global, setGlobal] = useState(false);

  const flows = useQuery({
    queryKey: ["flows", workspaceId],
    queryFn: () => flowApi.list(workspaceId),
  });

  const create = useMutation({
    mutationFn: () => flowApi.create(workspaceId, name, global),
    onSuccess: (flow) => {
      queryClient.invalidateQueries({ queryKey: ["flows", workspaceId] });
      onClose();
      setName("");
      setGlobal(false);
      navigate(`/orgs/${orgId}/workspaces/${workspaceId}/flows/${flow.id}`);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => flowApi.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["flows", workspaceId] }),
  });

  return (
    <Box p={8}>
      <PageHeader
        title="Conversation Flows"
        subtitle="Design and orchestrate bot behaviour"
        actions={
          <Button leftIcon={<FiPlus />} onClick={onOpen}>
            Add conversation flow
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
        {flows.isLoading ? (
          <Box p={6}>
            <Spinner />
          </Box>
        ) : (
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th w="80px">Global</Th>
                <Th>Created</Th>
                <Th w="60px" />
              </Tr>
            </Thead>
            <Tbody>
              {flows.data?.map((flow) => (
                <Tr key={flow.id} _hover={{ bg: "app.surfaceAlt" }}>
                  <Td
                    fontWeight="medium"
                    color="brand.500"
                    cursor="pointer"
                    onClick={() =>
                      navigate(
                        `/orgs/${orgId}/workspaces/${workspaceId}/flows/${flow.id}`,
                      )
                    }
                  >
                    {flow.name}
                  </Td>
                  <Td>
                    {flow.global && (
                      <Icon as={FiCheckCircle} color="green.400" />
                    )}
                  </Td>
                  <Td color="app.textMuted">
                    {new Date(flow.createdAt).toLocaleString()}
                  </Td>
                  <Td>
                    <IconButton
                      aria-label="Delete"
                      icon={<FiTrash2 />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => remove.mutate(flow.id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="app.surface">
          <ModalHeader>New conversation flow</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </FormControl>
            <Checkbox
              isChecked={global}
              onChange={(e) => setGlobal(e.target.checked)}
            >
              Global
            </Checkbox>
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
