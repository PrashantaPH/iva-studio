import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
};

// Brand palette inspired by the IVA Studio deep-teal header.
const colors = {
  brand: {
    50: "#e3f2f5",
    100: "#bfe0e6",
    200: "#98cdd6",
    300: "#6fb9c6",
    400: "#4ba9b9",
    500: "#2f96a8",
    600: "#1f7686",
    700: "#155562",
    800: "#0c3941",
    900: "#062126",
  },
  header: {
    bg: "#0f3d47",
  },
};

const semanticTokens = {
  colors: {
    "app.bg": { default: "gray.50", _dark: "gray.900" },
    "app.surface": { default: "white", _dark: "gray.800" },
    "app.surfaceAlt": { default: "gray.100", _dark: "gray.700" },
    "app.border": { default: "gray.200", _dark: "whiteAlpha.200" },
    "app.text": { default: "gray.800", _dark: "gray.100" },
    "app.textMuted": { default: "gray.500", _dark: "gray.400" },
    "app.headerBg": { default: "#0f3d47", _dark: "#0a2b32" },
    "app.sidebarBg": { default: "white", _dark: "gray.800" },
    "app.terminalBg": { default: "gray.900", _dark: "#0b0f14" },
  },
};

const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  fonts: {
    heading: `'Segoe UI', system-ui, sans-serif`,
    body: `'Segoe UI', system-ui, sans-serif`,
  },
  styles: {
    global: {
      "html, body, #root": {
        height: "100%",
      },
      body: {
        bg: "app.bg",
        color: "app.text",
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "brand",
      },
    },
  },
});

export default theme;
