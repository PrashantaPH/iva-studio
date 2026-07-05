import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
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
import { FiPlay, FiPlus } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { modelApi } from "@/core/api/services";
import { PageHeader } from "@/shared/components/PageHeader";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";
import type { TrainStatus } from "@/core/types/dto";

const statusColor: Record<TrainStatus, string> = {
  draft: "gray",
  queued: "yellow",
  training: "orange",
  ready: "green",
  failed: "red",
};

export function ModelsPage() {
  const { workspaceId } = useWorkspaceParams();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("English");

  const models = useQuery({
    queryKey: ["models", workspaceId],
    queryFn: () => modelApi.list(workspaceId),
  });

  const create = useMutation({
    mutationFn: () => modelApi.create(workspaceId, name, language),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models", workspaceId] });
      setName("");
      onClose();
    },
  });

  const train = useMutation({
    mutationFn: (modelId: string) => modelApi.train(workspaceId, modelId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["models", workspaceId] }),
  });

  return (
    <Box p={8}>
      <PageHeader
        title="Models"
        subtitle="NLU models bound to intents, entities and flows"
        actions={
          <Button leftIcon={<FiPlus />} onClick={onOpen}>
            Add model
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
        {models.isLoading ? (
          <Box p={6}>
            <Spinner />
          </Box>
        ) : (
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Language</Th>
                <Th>Status</Th>
                <Th>Last trained</Th>
                <Th w="120px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {models.data?.map((m) => (
                <Tr key={m.id} _hover={{ bg: "app.surfaceAlt" }}>
                  <Td fontWeight="medium">{m.name}</Td>
                  <Td>{m.language}</Td>
                  <Td>
                    <Badge colorScheme={statusColor[m.trainStatus]}>
                      {m.trainStatus}
                    </Badge>
                  </Td>
                  <Td color="app.textMuted">
                    {m.lastTrainedAt
                      ? new Date(m.lastTrainedAt).toLocaleString()
                      : "—"}
                  </Td>
                  <Td>
                    <Button
                      size="xs"
                      leftIcon={<FiPlay />}
                      isLoading={
                        train.isPending && train.variables === m.id
                      }
                      onClick={() => train.mutate(m.id)}
                    >
                      Train
                    </Button>
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
          <ModalHeader>New model</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Language</FormLabel>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => create.mutate()}
                isLoading={create.isPending}
                isDisabled={!name}
              >
                Create
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
