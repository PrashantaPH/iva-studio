import {
  Avatar,
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCpu,
  FiLogOut,
  FiSliders,
} from "react-icons/fi";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/core/auth/authStore";
import { useUiStore } from "@/core/store/uiStore";
import { ColorModeToggle } from "@/shared/components/ColorModeToggle";
import { Sidebar } from "@/layouts/Sidebar";
import { PreferencesModal } from "@/modules/workspace/PreferencesModal";

export function WorkspaceLayout() {
  const navigate = useNavigate();
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const prefs = useDisclosure();

  const headerColor = "whiteAlpha.900";

  const handleSignOut = () => {
    signOut();
    navigate("/auth/login");
  };

  return (
    <Flex direction="column" h="100vh" bg="app.bg">
      {/* Top brand + user bar */}
      <Flex
        as="header"
        align="center"
        h="52px"
        px={4}
        bg="app.headerBg"
        color={headerColor}
        flexShrink={0}
      >
        <HStack spacing={2}>
          <Icon as={FiCpu} boxSize={5} />
          <Box lineHeight="1">
            <Text fontWeight="bold" fontSize="sm">
              VERINT
            </Text>
            <Text fontSize="10px" opacity={0.8}>
              Mini IVA Studio
            </Text>
          </Box>
        </HStack>
        <Box flex="1" />
        <HStack spacing={2}>
          <ColorModeToggle />
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="User menu"
              variant="ghost"
              _hover={{ bg: "whiteAlpha.200" }}
              _active={{ bg: "whiteAlpha.300" }}
              icon={
                <Avatar
                  size="sm"
                  name={session?.user.name}
                  src={session?.user.avatarUrl}
                  bg="green.500"
                />
              }
            />
            <MenuList color="app.text">
              <Box px={3} py={2}>
                <Text fontWeight="semibold" fontSize="sm">
                  {session?.user.name}
                </Text>
                <Text fontSize="xs" color="app.textMuted">
                  {session?.user.email}
                </Text>
              </Box>
              <MenuDivider />
              <MenuItem icon={<FiSliders />} onClick={prefs.onOpen}>
                Preferences
              </MenuItem>
              <MenuItem icon={<FiLogOut />} onClick={handleSignOut}>
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Body: sidebar + content */}
      <Flex flex="1" overflow="hidden">
        <Box
          position="relative"
          w={collapsed ? "60px" : "230px"}
          transition="width 0.15s ease"
          bg="app.sidebarBg"
          borderRightWidth="1px"
          borderColor="app.border"
          flexShrink={0}
        >
          <Sidebar collapsed={collapsed} />
          <Tooltip label={collapsed ? "Expand" : "Collapse"}>
            <IconButton
              aria-label="Toggle sidebar"
              icon={collapsed ? <FiChevronRight /> : <FiChevronLeft />}
              size="xs"
              rounded="full"
              position="absolute"
              top="14px"
              right="-12px"
              zIndex={2}
              colorScheme="brand"
              onClick={toggleSidebar}
            />
          </Tooltip>
        </Box>

        <Box flex="1" overflow="auto" bg={useColorModeValue("gray.50", "gray.900")}>
          <Outlet />
        </Box>
      </Flex>

      <PreferencesModal isOpen={prefs.isOpen} onClose={prefs.onClose} />
    </Flex>
  );
}
