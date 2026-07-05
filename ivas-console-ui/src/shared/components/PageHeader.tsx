import { Box, Flex, Heading, Spacer, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Flex align="center" mb={6} gap={4} wrap="wrap">
      <Box>
        <Heading size="md">{title}</Heading>
        {subtitle && (
          <Text color="app.textMuted" fontSize="sm" mt={1}>
            {subtitle}
          </Text>
        )}
      </Box>
      <Spacer />
      {actions}
    </Flex>
  );
}
