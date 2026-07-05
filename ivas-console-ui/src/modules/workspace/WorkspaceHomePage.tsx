import {
  Box,
  Card,
  CardBody,
  Grid,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/react";
import {
  FiBox,
  FiCode,
  FiGitMerge,
  FiMessageSquare,
  FiTag,
  FiZap,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  entityApi,
  flowApi,
  intentApi,
  modelApi,
  proxyApi,
  triggerApi,
} from "@/core/api/services";
import { PageHeader } from "@/shared/components/PageHeader";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";

export function WorkspaceHomePage() {
  const { orgId, workspaceId } = useWorkspaceParams();
  const navigate = useNavigate();
  const base = `/orgs/${orgId}/workspaces/${workspaceId}`;

  const models = useQuery({
    queryKey: ["models", workspaceId],
    queryFn: () => modelApi.list(workspaceId),
  });
  const intents = useQuery({
    queryKey: ["intents", workspaceId],
    queryFn: () => intentApi.list(workspaceId),
  });
  const entities = useQuery({
    queryKey: ["entities", workspaceId],
    queryFn: () => entityApi.list(workspaceId),
  });
  const triggers = useQuery({
    queryKey: ["triggers", workspaceId],
    queryFn: () => triggerApi.list(workspaceId),
  });
  const flows = useQuery({
    queryKey: ["flows", workspaceId],
    queryFn: () => flowApi.list(workspaceId),
  });
  const proxies = useQuery({
    queryKey: ["proxy", workspaceId],
    queryFn: () => proxyApi.list(workspaceId),
  });

  const stats = [
    { label: "Models", value: models.data?.length ?? 0 },
    { label: "Intents", value: intents.data?.length ?? 0 },
    { label: "Entities", value: entities.data?.length ?? 0 },
    { label: "Triggers", value: triggers.data?.length ?? 0 },
    { label: "Flows", value: flows.data?.length ?? 0 },
    { label: "Proxy Scripts", value: proxies.data?.length ?? 0 },
  ];

  const quickLinks: { label: string; icon: IconType; to: string }[] = [
    { label: "Models", icon: FiBox, to: `${base}/models` },
    { label: "Intents", icon: FiTag, to: `${base}/intents` },
    { label: "Triggers", icon: FiZap, to: `${base}/triggers` },
    { label: "Conversation Flows", icon: FiGitMerge, to: `${base}/flows` },
    {
      label: "Proxy Scripts",
      icon: FiCode,
      to: `${base}/integrations/proxy-scripts`,
    },
    { label: "Messenger", icon: FiMessageSquare, to: `${base}/messenger` },
  ];

  return (
    <Box p={8}>
      <PageHeader
        title="Workspace Home"
        subtitle="Overview of your agent building blocks"
      />

      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} mb={8}>
        {stats.map((s) => (
          <Card
            key={s.label}
            bg="app.surface"
            borderWidth="1px"
            borderColor="app.border"
          >
            <CardBody>
              <Stat>
                <StatLabel color="app.textMuted">{s.label}</StatLabel>
                <StatNumber>{s.value}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Heading size="sm" mb={3}>
        Quick access
      </Heading>
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
        {quickLinks.map((link) => (
          <Card
            key={link.label}
            cursor="pointer"
            bg="app.surface"
            borderWidth="1px"
            borderColor="app.border"
            _hover={{ borderColor: "brand.400", shadow: "md" }}
            onClick={() => navigate(link.to)}
          >
            <CardBody>
              <HStack spacing={3}>
                <Icon as={link.icon} boxSize={5} color="brand.500" />
                <Text fontWeight="medium">{link.label}</Text>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Box>
  );
}
