import {
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
import { FiFolder, FiPlus } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { orgApi } from "@/core/api/services";
import { useAuthStore } from "@/core/auth/authStore";
import { ConsoleTopBar } from "@/shared/components/ConsoleTopBar";
import { PageHeader } from "@/shared/components/PageHeader";

export function OrgsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setActiveOrg = useAuthStore((s) => s.setActiveOrg);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");

  const orgs = useQuery({ queryKey: ["orgs"], queryFn: orgApi.list });

  const createOrg = useMutation({
    mutationFn: () => orgApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      setName("");
      onClose();
    },
  });

  return (
    <Box minH="100vh" bg="app.bg">
      <ConsoleTopBar />
      <Container maxW="6xl" py={8}>
        <PageHeader
          title="Organizations"
          subtitle="Select an organization or create a new one"
          actions={
            <Button leftIcon={<FiPlus />} onClick={onOpen}>
              New organization
            </Button>
          }
        />

        {orgs.isLoading ? (
          <Spinner />
        ) : (
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
            gap={4}
          >
            {orgs.data?.map((org) => (
              <Card
                key={org.id}
                cursor="pointer"
                bg="app.surface"
                borderWidth="1px"
                borderColor="app.border"
                _hover={{ borderColor: "brand.400", shadow: "md" }}
                onClick={() => {
                  setActiveOrg(org.id);
                  navigate(`/orgs/${org.id}/workspaces`);
                }}
              >
                <CardBody>
                  <HStack spacing={3}>
                    <Icon as={FiFolder} boxSize={6} color="brand.500" />
                    <Box>
                      <Heading size="sm">{org.name}</Heading>
                      <Text fontSize="xs" color="app.textMuted">
                        Created {new Date(org.createdAt).toLocaleDateString()}
                      </Text>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        )}
      </Container>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="app.surface">
          <ModalHeader>New organization</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Organization name"
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
              onClick={() => createOrg.mutate()}
              isLoading={createOrg.isPending}
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
