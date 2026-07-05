import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
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
import { FiArrowLeft, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { entityApi } from "@/core/api/services";
import { PageHeader } from "@/shared/components/PageHeader";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";
import type {
  EntityValue,
  EntityValueType,
  RegexFlag,
} from "@/core/types/dto";

const ALL_FLAGS: RegexFlag[] = ["g", "m", "i", "s", "u"];

export function EntityDetailPage() {
  const { entityId = "" } = useParams();
  const { orgId, workspaceId } = useWorkspaceParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [editing, setEditing] = useState<EntityValue | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<EntityValueType>("string");
  const [valueOrPattern, setValueOrPattern] = useState("");
  const [flags, setFlags] = useState<RegexFlag[]>([]);

  const entity = useQuery({
    queryKey: ["entity", entityId],
    queryFn: () => entityApi.get(entityId),
  });
  const values = useQuery({
    queryKey: ["entity-values", entityId],
    queryFn: () => entityApi.listValues(entityId),
  });

  const openCreate = () => {
    setEditing(null);
    setName("");
    setType("string");
    setValueOrPattern("");
    setFlags([]);
    onOpen();
  };

  const openEdit = (v: EntityValue) => {
    setEditing(v);
    setName(v.name);
    setType(v.type);
    setValueOrPattern(v.valueOrPattern);
    setFlags(v.flags);
    onOpen();
  };

  const save = useMutation({
    mutationFn: () => {
      const body = { name, type, valueOrPattern, flags };
      return editing
        ? entityApi.updateValue(editing.id, body)
        : entityApi.addValue(entityId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity-values", entityId] });
      onClose();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => entityApi.removeValue(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["entity-values", entityId] }),
  });

  if (entity.isLoading) {
    return (
      <Box p={8}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box p={8}>
      <PageHeader
        title="Edit Entity"
        subtitle={entity.data?.label}
        actions={
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            onClick={() =>
              navigate(`/orgs/${orgId}/workspaces/${workspaceId}/entities`)
            }
          >
            Back
          </Button>
        }
      />

      <Flex align="center" mb={3}>
        <FormLabel m={0} fontWeight="bold">
          Entity Values
        </FormLabel>
        <Box flex="1" />
        <Button size="sm" leftIcon={<FiPlus />} onClick={openCreate}>
          Add entity value
        </Button>
      </Flex>

      <Box
        bg="app.surface"
        borderWidth="1px"
        borderColor="app.border"
        rounded="md"
        overflow="hidden"
      >
        {values.isLoading ? (
          <Box p={6}>
            <Spinner />
          </Box>
        ) : (
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Value(s)</Th>
                <Th w="80px" />
              </Tr>
            </Thead>
            <Tbody>
              {values.data?.map((v) => (
                <Tr key={v.id} _hover={{ bg: "app.surfaceAlt" }}>
                  <Td fontWeight="medium">{v.name}</Td>
                  <Td>{v.type}</Td>
                  <Td fontFamily="mono">
                    {v.valueOrPattern}
                    {v.type === "regex" && v.flags.length
                      ? `  [${v.flags.join(", ")}]`
                      : ""}
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

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="app.surface">
          <ModalHeader>{editing ? "Edit" : "New"} entity value</ModalHeader>
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
                onChange={(e) => setType(e.target.value as EntityValueType)}
              >
                <option value="string">String</option>
                <option value="regex">Regex</option>
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>{type === "regex" ? "Pattern" : "Values"}</FormLabel>
              <Input
                value={valueOrPattern}
                onChange={(e) => setValueOrPattern(e.target.value)}
                fontFamily={type === "regex" ? "mono" : undefined}
              />
            </FormControl>
            {type === "regex" && (
              <FormControl>
                <FormLabel>Flags</FormLabel>
                <CheckboxGroup
                  value={flags}
                  onChange={(vals) => setFlags(vals as RegexFlag[])}
                >
                  <HStack spacing={4}>
                    {ALL_FLAGS.map((f) => (
                      <Checkbox key={f} value={f}>
                        {f}
                      </Checkbox>
                    ))}
                  </HStack>
                </CheckboxGroup>
              </FormControl>
            )}
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
