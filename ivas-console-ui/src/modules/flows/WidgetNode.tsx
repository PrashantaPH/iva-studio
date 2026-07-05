import { Box, Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { Handle, Position, type NodeProps } from "reactflow";
import { widgetByType } from "./widgets";
import type { FlowNodeType } from "@/core/types/dto";

export interface WidgetNodeData {
  label: string;
  widgetType: FlowNodeType;
}

export function WidgetNode({ data, selected }: NodeProps<WidgetNodeData>) {
  const widget = widgetByType(data.widgetType);
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue(
    `${widget.color}.300`,
    `${widget.color}.500`,
  );
  const iconColor = `${widget.color}.500`;

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderColor={selected ? "brand.500" : border}
      boxShadow={selected ? "0 0 0 2px var(--chakra-colors-brand-400)" : "sm"}
      rounded="md"
      minW="170px"
    >
      <Handle type="target" position={Position.Left} />
      <Flex align="center" gap={2} px={3} py={2}>
        <Icon as={widget.icon} color={iconColor} boxSize={4} />
        <Box>
          <Text fontSize="10px" color="app.textMuted" lineHeight="1">
            {widget.label}
          </Text>
          <Text fontSize="sm" fontWeight="medium" lineHeight="1.2">
            {data.label}
          </Text>
        </Box>
      </Flex>
      <Handle type="source" position={Position.Right} />
    </Box>
  );
}
