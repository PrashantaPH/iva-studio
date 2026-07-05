import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Grid,
  Heading,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { FiGrid, FiPlus } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { workspaceApi } from "@/core/api/services";
import { useAuthStore } from "@/core/auth/authStore";
import { ConsoleTopBar } from "@/shared/components/ConsoleTopBar";
import { PageHeader } from "@/shared/components/PageHeader";
import type { WorkspaceStatus } from "@/core/types/dto";

const statusColor: Record<WorkspaceStatus, string> = {
  active: "green",
  draft: "yellow",
  archived: "gray",
};

export function WorkspacesPage() {
  const { orgId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setActiveWorkspace = useAuthStore((s) => s.setActiveWorkspace);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");

  const workspaces = useQuery({
    queryKey: ["workspaces", orgId],
    queryFn: () => workspaceApi.list(orgId),
  });

  const createWs = useMutation({
    mutationFn: () => workspaceApi.create(orgId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", orgId] });
      setName("");
      onClose();
    },
  });

  return (
    <Box minH="100vh" bg="app.bg">
      <ConsoleTopBar />
      <Container maxW="6xl" py={8}>
        <PageHeader
          title="Workspaces"
          subtitle="Open a workspace to start building"
          actions={
            <HStack>
              <Button variant="ghost" onClick={() => navigate("/orgs")}>
                Back to orgs
              </Button>
              <Button leftIcon={<FiPlus />} onClick={onOpen}>
                New workspace
              </Button>
            </HStack>
          }
        />

        {workspaces.isLoading ? (
          <Spinner />
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            {workspaces.data?.map((ws) => (
              <Card
                key={ws.id}
                bg="app.surface"
                borderWidth="1px"
                borderColor="app.border"
                _hover={{ borderColor: "brand.400", shadow: "md" }}
              >
                <CardBody>
                  <HStack justify="space-between" mb={2}>
                    <Icon as={FiGrid} boxSize={6} color="brand.500" />
                    <Badge colorScheme={statusColor[ws.status]}>
                      {ws.status}
                    </Badge>
                  </HStack>
                  <Heading size="sm" mb={1}>
                    {ws.name}
                  </Heading>
                  <Text fontSize="xs" color="app.textMuted" mb={4}>
                    Updated {new Date(ws.updatedAt).toLocaleDateString()}
                  </Text>
                  <Button
                    size="sm"
                    w="full"
                    onClick={() => {
                      setActiveWorkspace(ws.id);
                      navigate(
                        `/orgs/${orgId}/workspaces/${ws.id}/home`,
                      );
                    }}
                  >
                    Get started
                  </Button>
                </CardBody>
              </Card>
            ))}
          </Grid>
        )}
      </Container>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="app.surface">
          <ModalHeader>New workspace</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Workspace name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => createWs.mutate()}
              isLoading={createWs.isPending}
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
