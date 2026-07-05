import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { authApi } from "@/core/api/services";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const register = useMutation({
    mutationFn: () => authApi.register(email, name),
    onSuccess: (res) => {
      toast({
        title: "OTP sent",
        description: `Use code ${res.devOtp} (demo)`,
        status: "info",
      });
      navigate("/auth/verify-otp", { state: { email } });
    },
  });

  return (
    <Stack spacing={5}>
      <Text fontSize="lg" fontWeight="semibold" textAlign="center">
        Create account
      </Text>

      <FormControl>
        <FormLabel fontSize="sm">Full name</FormLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </FormControl>

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
        onClick={() => register.mutate()}
        isLoading={register.isPending}
        isDisabled={!email || !name}
      >
        Register &amp; send OTP
      </Button>

      <Text fontSize="sm" textAlign="center" color="app.textMuted">
        Already have an account?{" "}
        <Text as={RouterLink} to="/auth/login" color="brand.500">
          Sign in
        </Text>
      </Text>
    </Stack>
  );
}
