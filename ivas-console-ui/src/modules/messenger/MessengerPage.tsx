import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiPlus, FiSend } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { messengerApi } from "@/core/api/services";
import { PageHeader } from "@/shared/components/PageHeader";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";
import type { ChatMessage } from "@/core/types/dto";

export function MessengerPage() {
  const { workspaceId } = useWorkspaceParams();
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [showTrace, setShowTrace] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sessions = useQuery({
    queryKey: ["chat-sessions", workspaceId],
    queryFn: () => messengerApi.listSessions(workspaceId),
  });

  const messages = useQuery({
    queryKey: ["chat-messages", sessionId],
    queryFn: () => messengerApi.listMessages(sessionId!),
    enabled: !!sessionId,
  });

  const createSession = useMutation({
    mutationFn: () => messengerApi.createSession(workspaceId),
    onSuccess: (s) => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions", workspaceId] });
      setSessionId(s.id);
    },
  });

  const send = useMutation({
    mutationFn: () => messengerApi.sendMessage(sessionId!, text),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["chat-messages", sessionId] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data]);

  return (
    <Box p={8} h="full">
      <PageHeader
        title="Messenger"
        subtitle="Test your bot in a simulated web channel"
      />

      <Flex
        gap={4}
        h="calc(100vh - 200px)"
        bg="app.surface"
        borderWidth="1px"
        borderColor="app.border"
        rounded="md"
        overflow="hidden"
      >
        {/* Sessions */}
        <Box
          w="240px"
          borderRightWidth="1px"
          borderColor="app.border"
          p={3}
          overflowY="auto"
        >
          <Button
            size="sm"
            w="full"
            leftIcon={<FiPlus />}
            mb={3}
            onClick={() => createSession.mutate()}
            isLoading={createSession.isPending}
          >
            New session
          </Button>
          {sessions.isLoading ? (
            <Spinner />
          ) : (
            <Stack spacing={1}>
              {sessions.data?.map((s) => (
                <Box
                  key={s.id}
                  p={2}
                  rounded="md"
                  cursor="pointer"
                  bg={sessionId === s.id ? "brand.50" : undefined}
                  _dark={{
                    bg: sessionId === s.id ? "whiteAlpha.100" : undefined,
                  }}
                  _hover={{ bg: "app.surfaceAlt" }}
                  onClick={() => setSessionId(s.id)}
                >
                  <Text fontSize="sm" fontWeight="medium">
                    {s.channel} session
                  </Text>
                  <Text fontSize="xs" color="app.textMuted">
                    {new Date(s.createdAt).toLocaleTimeString()}
                  </Text>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Transcript */}
        <Flex flex="1" direction="column">
          {!sessionId ? (
            <Flex flex="1" align="center" justify="center">
              <Text color="app.textMuted">
                Create or select a session to start chatting
              </Text>
            </Flex>
          ) : (
            <>
              <Box flex="1" overflowY="auto" p={4}>
                <VStack align="stretch" spacing={3}>
                  {messages.data?.map((m) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      onShowTrace={() =>
                        setShowTrace(showTrace === m.id ? null : m.id)
                      }
                      traceOpen={showTrace === m.id}
                    />
                  ))}
                  <div ref={bottomRef} />
                </VStack>
              </Box>
              <HStack p={3} borderTopWidth="1px" borderColor="app.border">
                <Input
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && text) send.mutate();
                  }}
                />
                <IconButton
                  aria-label="Send"
                  icon={<FiSend />}
                  onClick={() => send.mutate()}
                  isLoading={send.isPending}
                  isDisabled={!text}
                />
              </HStack>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

function MessageBubble({
  message,
  onShowTrace,
  traceOpen,
}: {
  message: ChatMessage;
  onShowTrace: () => void;
  traceOpen: boolean;
}) {
  const isUser = message.sender === "user";
  return (
    <Flex justify={isUser ? "flex-end" : "flex-start"}>
      <HStack align="flex-start" maxW="75%" flexDir={isUser ? "row-reverse" : "row"}>
        <Avatar
          size="xs"
          name={isUser ? "You" : "Bot"}
          bg={isUser ? "brand.500" : "green.500"}
        />
        <Box>
          <Box
            bg={isUser ? "brand.500" : "app.surfaceAlt"}
            color={isUser ? "white" : "app.text"}
            px={3}
            py={2}
            rounded="lg"
          >
            <Text fontSize="sm">{message.message}</Text>
          </Box>
          {!isUser && message.debugTrace && (
            <>
              <Button
                size="xs"
                variant="link"
                mt={1}
                onClick={onShowTrace}
                colorScheme="gray"
              >
                {traceOpen ? "Hide" : "Show"} debug trace
              </Button>
              {traceOpen && (
                <Box
                  mt={1}
                  p={2}
                  bg="app.terminalBg"
                  rounded="md"
                  fontFamily="mono"
                  fontSize="xs"
                >
                  {message.debugTrace.map((line, i) => (
                    <Text key={i} color="green.300">
                      {line}
                    </Text>
                  ))}
                </Box>
              )}
            </>
          )}
        </Box>
      </HStack>
    </Flex>
  );
}
