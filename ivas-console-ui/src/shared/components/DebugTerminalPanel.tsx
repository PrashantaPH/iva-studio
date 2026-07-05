import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { FiTerminal, FiTrash2 } from "react-icons/fi";
import type { RuntimeLog, LogLevel } from "@/core/types/dto";

const levelColor: Record<LogLevel, string> = {
  info: "blue.300",
  success: "green.300",
  warn: "yellow.300",
  error: "red.300",
};

interface DebugTerminalPanelProps {
  logs: RuntimeLog[];
  title?: string;
  onClear?: () => void;
  height?: string | number;
}

export function DebugTerminalPanel({
  logs,
  title = "Terminal",
  onClear,
  height = 220,
}: DebugTerminalPanelProps) {
  return (
    <Box
      bg="app.terminalBg"
      rounded="md"
      overflow="hidden"
      borderWidth="1px"
      borderColor="app.border"
    >
      <Flex
        align="center"
        px={3}
        py={2}
        borderBottomWidth="1px"
        borderColor="whiteAlpha.200"
      >
        <HStack color="gray.300" spacing={2}>
          <Icon as={FiTerminal} />
          <Text fontSize="sm" fontWeight="medium">
            {title}
          </Text>
        </HStack>
        <Box flex="1" />
        {onClear && (
          <IconButton
            aria-label="Clear logs"
            icon={<FiTrash2 />}
            size="xs"
            variant="ghost"
            colorScheme="gray"
            color="gray.400"
            onClick={onClear}
          />
        )}
      </Flex>
      <Box
        height={height}
        overflowY="auto"
        px={3}
        py={2}
        fontFamily="mono"
        fontSize="xs"
      >
        {logs.length === 0 ? (
          <Text color="gray.500">No logs yet. Run to see output.</Text>
        ) : (
          logs.map((log, idx) => (
            <Flex key={log.id} gap={2} py={0.5}>
              <Text color="gray.600" minW="24px" textAlign="right">
                {idx + 1}
              </Text>
              <Text color={levelColor[log.level]} whiteSpace="pre-wrap">
                [{log.level}] {log.message}
              </Text>
            </Flex>
          ))
        )}
      </Box>
    </Box>
  );
}
