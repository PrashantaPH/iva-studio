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
import { triggerApi } from "@/core/api/services";
import { PageHeader } from "@/shared/components/PageHeader";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";

export function TriggersPage() {
  const { workspaceId } = useWorkspaceParams();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [label, setLabel] = useState("");

  const triggers = useQuery({
    queryKey: ["triggers", workspaceId],
    queryFn: () => triggerApi.list(workspaceId),
  });

  const create = useMutation({
    mutationFn: () => triggerApi.create(workspaceId, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triggers", workspaceId] });
      setLabel("");
      onClose();
    },
  });

  const toggle = useMutation({
    mutationFn: (p: { id: string; enabled: boolean }) =>
      triggerApi.update(p.id, { enabled: p.enabled }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["triggers", workspaceId] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => triggerApi.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["triggers", workspaceId] }),
  });

  return (
    <Box p={8}>
      <PageHeader
        title="Triggers"
        subtitle="Event triggers for conversation entry points"
        actions={
          <Button leftIcon={<FiPlus />} onClick={onOpen}>
            Add trigger
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
        {triggers.isLoading ? (
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
              {triggers.data?.map((trigger) => (
                <Tr key={trigger.id} _hover={{ bg: "app.surfaceAlt" }}>
                  <Td fontWeight="medium" color="brand.500">
                    {trigger.label}
                  </Td>
                  <Td>
                    <Switch
                      isChecked={trigger.enabled}
                      onChange={(e) =>
                        toggle.mutate({
                          id: trigger.id,
                          enabled: e.target.checked,
                        })
                      }
                    />
                  </Td>
                  <Td color="app.textMuted">
                    {new Date(trigger.createdAt).toLocaleString()}
                  </Td>
                  <Td>
                    <IconButton
                      aria-label="Delete"
                      icon={<FiTrash2 />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => remove.mutate(trigger.id)}
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
          <ModalHeader>New trigger</ModalHeader>
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
              Create trigger
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
