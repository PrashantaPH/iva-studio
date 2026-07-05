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
  useDisclosure,
} from "@chakra-ui/react";
import { FiCpu, FiLogOut, FiSliders } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/core/auth/authStore";
import { ColorModeToggle } from "@/shared/components/ColorModeToggle";
import { PreferencesModal } from "@/modules/workspace/PreferencesModal";

export function ConsoleTopBar() {
  const navigate = useNavigate();
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const prefs = useDisclosure();

  const handleSignOut = () => {
    signOut();
    navigate("/auth/login");
  };

  return (
    <>
      <Flex
        as="header"
        align="center"
        h="52px"
        px={4}
        bg="app.headerBg"
        color="whiteAlpha.900"
      >
        <HStack spacing={2} cursor="pointer" onClick={() => navigate("/orgs")}>
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
      <PreferencesModal isOpen={prefs.isOpen} onClose={prefs.onClose} />
    </>
  );
}
