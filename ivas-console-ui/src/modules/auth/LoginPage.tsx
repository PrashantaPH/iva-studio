import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { authApi } from "@/core/api/services";
import { useAuthStore } from "@/core/auth/authStore";

export function LoginPage() {
  const [email, setEmail] = useState("demo@iva.studio");
  const navigate = useNavigate();
  const toast = useToast();
  const setSession = useAuthStore((s) => s.setSession);

  const emailLogin = useMutation({
    mutationFn: () => authApi.loginEmail(email),
    onSuccess: (res) => {
      toast({
        title: "OTP sent",
        description: `Use code ${res.devOtp} (demo)`,
        status: "info",
      });
      navigate("/auth/verify-otp", { state: { email } });
    },
  });

  const googleLogin = useMutation({
    mutationFn: () => authApi.google(),
    onSuccess: (session) => {
      setSession(session);
      navigate("/orgs");
    },
  });

  return (
    <Stack spacing={5}>
      <Text fontSize="lg" fontWeight="semibold" textAlign="center">
        Sign in
      </Text>

      <Button
        leftIcon={<FcGoogle />}
        variant="outline"
        colorScheme="gray"
        onClick={() => googleLogin.mutate()}
        isLoading={googleLogin.isPending}
      >
        Continue with Google
      </Button>

      <HStack>
        <Divider />
        <Text fontSize="xs" color="app.textMuted" whiteSpace="nowrap">
          or with email
        </Text>
        <Divider />
      </HStack>

      <FormControl>
        <FormLabel fontSize="sm">Email</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </FormControl>

      <Button
        onClick={() => emailLogin.mutate()}
        isLoading={emailLogin.isPending}
        isDisabled={!email}
      >
        Send OTP
      </Button>

      <Text fontSize="sm" textAlign="center" color="app.textMuted">
        New here?{" "}
        <Text as={RouterLink} to="/auth/register" color="brand.500">
          Create an account
        </Text>
      </Text>
    </Stack>
  );
}
