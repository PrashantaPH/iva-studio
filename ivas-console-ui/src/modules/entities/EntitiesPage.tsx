import {
  Box,
  Button,
  FormControl,
  FormLabel,
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
  Switch,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { entityApi } from "@/core/api/services";
import { PageHeader } from "@/shared/components/PageHeader";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";

export function EntitiesPage() {
  const { orgId, workspaceId } = useWorkspaceParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [label, setLabel] = useState("");

  const entities = useQuery({
    queryKey: ["entities", workspaceId],
    queryFn: () => entityApi.list(workspaceId),
  });

  const create = useMutation({
    mutationFn: () => entityApi.create(workspaceId, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities", workspaceId] });
      setLabel("");
      onClose();
    },
  });

  const toggle = useMutation({
    mutationFn: (p: { id: string; enabled: boolean }) =>
      entityApi.update(p.id, { enabled: p.enabled }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["entities", workspaceId] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => entityApi.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["entities", workspaceId] }),
  });

  return (
    <Box p={8}>
      <PageHeader
        title="Entities"
        subtitle="Slot extraction definitions"
        actions={
          <Button leftIcon={<FiPlus />} onClick={onOpen}>
            Add entity
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
        {entities.isLoading ? (
          <Box p={6}>
            <Spinner />
          </Box>
        ) : (
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Label</Th>
                <Th w="120px">Status</Th>
                <Th>Created</Th>
                <Th w="60px" />
              </Tr>
            </Thead>
            <Tbody>
              {entities.data?.map((entity) => (
                <Tr key={entity.id} _hover={{ bg: "app.surfaceAlt" }}>
                  <Td
                    fontWeight="medium"
                    color="brand.500"
                    cursor="pointer"
                    onClick={() =>
                      navigate(
                        `/orgs/${orgId}/workspaces/${workspaceId}/entities/${entity.id}`,
                      )
                    }
                  >
                    {entity.label}
                  </Td>
                  <Td>
                    <Switch
                      isChecked={entity.enabled}
                      onChange={(e) =>
                        toggle.mutate({
                          id: entity.id,
                          enabled: e.target.checked,
                        })
                      }
                    />
                  </Td>
                  <Td color="app.textMuted">
                    {new Date(entity.createdAt).toLocaleString()}
                  </Td>
                  <Td>
                    <IconButton
                      aria-label="Delete"
                      icon={<FiTrash2 />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => remove.mutate(entity.id)}
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
          <ModalHeader>New entity</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Label</FormLabel>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                autoFocus
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => create.mutate()}
              isLoading={create.isPending}
              isDisabled={!label}
            >
              Create entity
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
