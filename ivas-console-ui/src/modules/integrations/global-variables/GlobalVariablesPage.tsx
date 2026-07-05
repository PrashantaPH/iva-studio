import {
  Badge,
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
  Select,
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
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { globalVarApi } from "@/core/api/services";
import { CodeEditorPanel } from "@/shared/components/CodeEditorPanel";
import { PageHeader } from "@/shared/components/PageHeader";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";
import type { GlobalVariable, GlobalVariableType } from "@/core/types/dto";

export function GlobalVariablesPage() {
  const { workspaceId } = useWorkspaceParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [editing, setEditing] = useState<GlobalVariable | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<GlobalVariableType>("Object");
  const [value, setValue] = useState("");

  const vars = useQuery({
    queryKey: ["global-vars", workspaceId],
    queryFn: () => globalVarApi.list(workspaceId),
  });

  const openCreate = () => {
    setEditing(null);
    setName("");
    setType("Object");
    setValue("");
    onOpen();
  };

  const openEdit = (v: GlobalVariable) => {
    setEditing(v);
    setName(v.name);
    setType(v.type);
    setValue(v.value);
    onOpen();
  };

  const save = useMutation({
    mutationFn: () => {
      if (type === "Object") {
        try {
          JSON.parse(value || "{}");
        } catch {
          throw new Error("Invalid JSON");
        }
      }
      return editing
        ? globalVarApi.update(editing.id, { name, type, value })
        : globalVarApi.create(workspaceId, { name, type, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-vars", workspaceId] });
      onClose();
    },
    onError: (e: Error) =>
      toast({ title: e.message, status: "error" }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => globalVarApi.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["global-vars", workspaceId] }),
  });

  const editorLanguage = type === "Object" ? "json" : "javascript";

  return (
    <Box p={8}>
      <PageHeader
        title="Global Variables"
        subtitle="Reusable config and helper logic shared across flows"
        actions={
          <Button leftIcon={<FiPlus />} onClick={openCreate}>
            Add global variable
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
        {vars.isLoading ? (
          <Box p={6}>
            <Spinner />
          </Box>
        ) : (
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Updated</Th>
                <Th w="80px" />
              </Tr>
            </Thead>
            <Tbody>
              {vars.data?.map((v) => (
                <Tr key={v.id} _hover={{ bg: "app.surfaceAlt" }}>
                  <Td fontWeight="medium">{v.name}</Td>
                  <Td>
                    <Badge>{v.type}</Badge>
                  </Td>
                  <Td color="app.textMuted">
                    {new Date(v.updatedAt).toLocaleString()}
                  </Td>
                  <Td>
                    <IconButton
                      aria-label="Edit"
                      icon={<FiEdit2 />}
                      size="xs"
                      variant="ghost"
                      mr={1}
                      onClick={() => openEdit(v)}
                    />
                    <IconButton
                      aria-label="Delete"
                      icon={<FiTrash2 />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => remove.mutate(v.id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="app.surface">
          <ModalHeader>{editing ? "Edit" : "New"} global variable</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Type</FormLabel>
              <Select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as GlobalVariableType)
                }
              >
                <option value="Object">Object</option>
                <option value="Function">Function</option>
                <option value="String">String</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>{type === "String" ? "Value" : "Code"}</FormLabel>
              {type === "String" ? (
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              ) : (
                <CodeEditorPanel
                  value={value}
                  onChange={setValue}
                  language={editorLanguage}
                  height={260}
                />
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => save.mutate()}
              isLoading={save.isPending}
              isDisabled={!name}
            >
              {editing ? "Save" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
