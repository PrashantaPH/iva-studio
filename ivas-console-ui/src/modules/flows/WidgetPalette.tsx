import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { WIDGETS } from "./widgets";
import type { FlowNodeType } from "@/core/types/dto";

export function WidgetPalette() {
  const onDragStart = (e: React.DragEvent, type: FlowNodeType) => {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <Box
      w="200px"
      flexShrink={0}
      bg="app.surface"
      borderRightWidth="1px"
      borderColor="app.border"
      overflowY="auto"
      p={3}
    >
      <Text fontSize="xs" fontWeight="bold" color="app.textMuted" mb={2}>
        WIDGETS
      </Text>
      {WIDGETS.map((w) => (
        <Flex
          key={w.type}
          align="center"
          gap={2}
          p={2}
          mb={1.5}
          rounded="md"
          borderWidth="1px"
          borderColor="app.border"
          cursor="grab"
          draggable
          onDragStart={(e) => onDragStart(e, w.type)}
          _hover={{ borderColor: `${w.color}.400`, bg: "app.surfaceAlt" }}
        >
          <Icon as={w.icon} color={`${w.color}.500`} boxSize={4} />
          <Box>
            <Text fontSize="sm" fontWeight="medium" lineHeight="1.1">
              {w.label}
            </Text>
            <Text fontSize="10px" color="app.textMuted" lineHeight="1.1">
              {w.description}
            </Text>
          </Box>
        </Flex>
      ))}
    </Box>
  );
}
