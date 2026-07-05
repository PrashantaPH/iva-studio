import { IconButton, useColorMode, Tooltip } from "@chakra-ui/react";
import { FiMoon, FiSun } from "react-icons/fi";

export function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  return (
    <Tooltip label={isDark ? "Light mode" : "Dark mode"}>
      <IconButton
        aria-label="Toggle color mode"
        icon={isDark ? <FiSun /> : <FiMoon />}
        onClick={toggleColorMode}
        variant="ghost"
        colorScheme="gray"
        size="sm"
      />
    </Tooltip>
  );
}
