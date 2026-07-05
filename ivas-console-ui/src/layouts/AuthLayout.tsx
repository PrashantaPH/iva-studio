import { Box, Flex, HStack, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { Outlet, Navigate } from "react-router-dom";
import { FiCpu } from "react-icons/fi";
import { useAuthStore } from "@/core/auth/authStore";
import { ColorModeToggle } from "@/shared/components/ColorModeToggle";

export function AuthLayout() {
  const session = useAuthStore((s) => s.session);
  const panelBg = useColorModeValue("white", "gray.800");

  if (session) return <Navigate to="/orgs" replace />;

  return (
    <Flex minH="100vh" bg="app.bg" align="center" justify="center" p={4}>
      <Box position="absolute" top={4} right={4}>
        <ColorModeToggle />
      </Box>
      <Box
        w="full"
        maxW="420px"
        bg={panelBg}
        borderWidth="1px"
        borderColor="app.border"
        rounded="xl"
        shadow="lg"
        p={8}
      >
        <HStack mb={6} spacing={3} justify="center">
          <Icon as={FiCpu} boxSize={7} color="brand.500" />
          <Box textAlign="center">
            <Text fontWeight="bold" fontSize="lg" lineHeight="1">
              Mini IVA Studio
            </Text>
            <Text fontSize="xs" color="app.textMuted">
              Agent Builder Console
            </Text>
          </Box>
        </HStack>
        <Outlet />
      </Box>
    </Flex>
  );
}
