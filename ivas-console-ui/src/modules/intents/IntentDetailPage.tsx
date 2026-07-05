import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  HStack,
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
  useToast,
} from "@chakra-ui/react";
import { FiArrowLeft, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { intentApi } from "@/core/api/services";
import { PageHeader } from "@/shared/components/PageHeader";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";

export function IntentDetailPage() {
  const { intentId = "" } = useParams();
  const { orgId, workspaceId } = useWorkspaceParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [altValue, setAltValue] = useState("");

  const intent = useQuery({
    queryKey: ["intent", intentId],
    queryFn: () => intentApi.get(intentId),
  });
  const alternates = useQuery({
    queryKey: ["alternates", intentId],
    queryFn: () => intentApi.listAlternates(intentId),
  });

  useEffect(() => {
    if (intent.data) {
      setLabel(intent.data.label);
      setEnabled(intent.data.enabled);
    }
  }, [intent.data]);

  const save = useMutation({
    mutationFn: () => intentApi.update(intentId, { label, enabled }),
    onSuccess: () => {
      toast({ title: "Saved", status: "success" });
      queryClient.invalidateQueries({ queryKey: ["intent", intentId] });
      queryClient.invalidateQueries({ queryKey: ["intents", workspaceId] });
    },
  });

  const addAlt = useMutation({
    mutationFn: () => intentApi.addAlternate(intentId, altValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alternates", intentId] });
      setAltValue("");
      onClose();
    },
  });

  const removeAlt = useMutation({
    mutationFn: (id: string) => intentApi.removeAlternate(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["alternates", intentId] }),
  });

  if (intent.isLoading) {
    return (
      <Box p={8}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box p={8}>
      <PageHeader
        title="Edit Intent"
        actions={
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            onClick={() =>
              navigate(`/orgs/${orgId}/workspaces/${workspaceId}/intents`)
            }
          >
            Back
          </Button>
        }
      />

      <Box
        bg="app.surface"
        borderWidth="1px"
        borderColor="app.border"
        rounded="md"
        p={5}
        mb={6}
      >
        <FormControl mb={4}>
          <FormLabel>Label</FormLabel>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </FormControl>
        <Checkbox
          isChecked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          mb={4}
        >
          Enabled
        </Checkbox>
        <Box>
          <Button
            leftIcon={<FiSave />}
            onClick={() => save.mutate()}
            isLoading={save.isPending}
          >
            Save
          </Button>
        </Box>
      </Box>

      <Flex align="center" mb={3}>
        <FormLabel m={0} fontWeight="bold">
          Alternates
        </FormLabel>
        <Box flex="1" />
        <Button size="sm" leftIcon={<FiPlus />} onClick={onOpen}>
          Add alternate
        </Button>
      </Flex>

      <Box
        bg="app.surface"
        borderWidth="1px"
        borderColor="app.border"
        rounded="md"
        overflow="hidden"
      >
        {alternates.isLoading ? (
          <Box p={6}>
            <Spinner />
          </Box>
        ) : (
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Value</Th>
                <Th>Created</Th>
                <Th w="60px" />
              </Tr>
            </Thead>
            <Tbody>
              {alternates.data?.map((alt) => (
                <Tr key={alt.id} _hover={{ bg: "app.surfaceAlt" }}>
                  <Td>{alt.value}</Td>
                  <Td color="app.textMuted">
                    {new Date(alt.createdAt).toLocaleString()}
                  </Td>
                  <Td>
                    <IconButton
                      aria-label="Delete"
                      icon={<FiTrash2 />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => removeAlt.mutate(alt.id)}
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
          <ModalHeader>New alternate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={altValue}
              onChange={(e) => setAltValue(e.target.value)}
              placeholder="training phrase"
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => addAlt.mutate()}
                isLoading={addAlt.isPending}
                isDisabled={!altValue}
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
