import {
  Box,
  Collapse,
  Flex,
  Icon,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiHome,
  FiLayers,
  FiBox,
  FiEdit3,
  FiMessageSquare,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiCode,
  FiDatabase,
  FiTag,
  FiZap,
  FiGitMerge,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { NavLink, useLocation } from "react-router-dom";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";

interface NavItem {
  label: string;
  to: string;
  icon: IconType;
}

interface NavGroup {
  label: string;
  icon: IconType;
  children: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return (entry as NavGroup).children !== undefined;
}

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { orgId, workspaceId } = useWorkspaceParams();
  const base = `/orgs/${orgId}/workspaces/${workspaceId}`;

  const entries: NavEntry[] = [
    { label: "Home", to: `${base}/home`, icon: FiHome },
    {
      label: "Integrations",
      icon: FiLayers,
      children: [
        {
          label: "Proxy Scripts",
          to: `${base}/integrations/proxy-scripts`,
          icon: FiCode,
        },
        {
          label: "Global Variables",
          to: `${base}/integrations/global-variables`,
          icon: FiDatabase,
        },
      ],
    },
    { label: "Models", to: `${base}/models`, icon: FiBox },
    {
      label: "Conversation Designer",
      icon: FiEdit3,
      children: [
        { label: "Intents", to: `${base}/intents`, icon: FiTag },
        { label: "Entities", to: `${base}/entities`, icon: FiDatabase },
        { label: "Triggers", to: `${base}/triggers`, icon: FiZap },
        {
          label: "Conversation Flows",
          to: `${base}/flows`,
          icon: FiGitMerge,
        },
      ],
    },
    { label: "Messenger", to: `${base}/messenger`, icon: FiMessageSquare },
    { label: "Settings", to: `${base}/settings`, icon: FiSettings },
  ];

  return (
    <Box py={3} overflowY="auto" h="full">
      {entries.map((entry) =>
        isGroup(entry) ? (
          <SidebarGroup key={entry.label} group={entry} collapsed={collapsed} />
        ) : (
          <SidebarLink key={entry.to} item={entry} collapsed={collapsed} />
        ),
      )}
    </Box>
  );
}

function SidebarLink({
  item,
  collapsed,
  nested,
}: {
  item: NavItem;
  collapsed: boolean;
  nested?: boolean;
}) {
  return (
    <Tooltip label={collapsed ? item.label : ""} placement="right">
      <Box
        as={NavLink}
        to={item.to}
        display="block"
        _activeLink={{
          bg: "brand.50",
          color: "brand.700",
          borderRightWidth: "3px",
          borderColor: "brand.500",
          fontWeight: "semibold",
          _dark: { bg: "whiteAlpha.100", color: "brand.200" },
        }}
      >
        <Flex
          align="center"
          gap={3}
          px={collapsed ? 0 : nested ? 8 : 4}
          justify={collapsed ? "center" : "flex-start"}
          py={2}
          _hover={{ bg: "app.surfaceAlt" }}
        >
          <Icon as={item.icon} boxSize={4} />
          {!collapsed && <Text fontSize="sm">{item.label}</Text>}
        </Flex>
      </Box>
    </Tooltip>
  );
}

function SidebarGroup({
  group,
  collapsed,
}: {
  group: NavGroup;
  collapsed: boolean;
}) {
  const location = useLocation();
  const hasActiveChild = group.children.some((c) =>
    location.pathname.startsWith(c.to),
  );
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: hasActiveChild });

  if (collapsed) {
    return (
      <>
        {group.children.map((child) => (
          <SidebarLink key={child.to} item={child} collapsed />
        ))}
      </>
    );
  }

  return (
    <Box>
      <Flex
        align="center"
        gap={3}
        px={4}
        py={2}
        cursor="pointer"
        _hover={{ bg: "app.surfaceAlt" }}
        onClick={onToggle}
      >
        <Icon as={group.icon} boxSize={4} />
        <Text fontSize="sm" flex="1">
          {group.label}
        </Text>
        <Icon as={isOpen ? FiChevronDown : FiChevronRight} boxSize={3} />
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        {group.children.map((child) => (
          <SidebarLink key={child.to} item={child} collapsed={false} nested />
        ))}
      </Collapse>
    </Box>
  );
}
