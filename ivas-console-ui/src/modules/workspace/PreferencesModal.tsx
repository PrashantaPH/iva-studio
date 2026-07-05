import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  useColorMode,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { authApi } from "@/core/api/services";
import { useAuthStore } from "@/core/auth/authStore";
import type { ThemeMode } from "@/core/types/dto";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const { setColorMode } = useColorMode();
  const session = useAuthStore((s) => s.session);
  const setUser = useAuthStore((s) => s.setUser);
  const [theme, setTheme] = useState<ThemeMode>(
    session?.user.preferences.theme ?? "system",
  );
  const [notifications, setNotifications] = useState<boolean>(
    session?.user.preferences.notifications ?? true,
  );

  useEffect(() => {
    if (session) {
      setTheme(session.user.preferences.theme);
      setNotifications(session.user.preferences.notifications);
    }
  }, [session]);

  const mutation = useMutation({
    mutationFn: () => authApi.updatePreferences({ theme, notifications }),
    onSuccess: (user) => {
      setUser(user);
      if (theme !== "system") setColorMode(theme);
      onClose();
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="app.surface">
        <ModalHeader>Preferences</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={5}>
            <FormControl>
              <FormLabel>Theme</FormLabel>
              <RadioGroup
                value={theme}
                onChange={(v) => {
                  const mode = v as ThemeMode;
                  setTheme(mode);
                  if (mode !== "system") setColorMode(mode);
                }}
              >
                <HStack spacing={5}>
                  <Radio value="light">Light</Radio>
                  <Radio value="dark">Dark</Radio>
                  <Radio value="system">System</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Email notifications</FormLabel>
              <Switch
                isChecked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            isLoading={mutation.isPending}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
