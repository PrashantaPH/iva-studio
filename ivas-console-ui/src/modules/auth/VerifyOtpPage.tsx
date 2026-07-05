import {
  Button,
  HStack,
  PinInput,
  PinInputField,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "@/core/api/services";
import { useAuthStore } from "@/core/auth/authStore";

export function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const setSession = useAuthStore((s) => s.setSession);
  const email = (location.state as { email?: string } | null)?.email;
  const [code, setCode] = useState("");

  const verify = useMutation({
    mutationFn: () => authApi.verifyOtp(email!, code),
    onSuccess: (session) => {
      setSession(session);
      navigate("/orgs");
    },
    onError: () => {
      toast({ title: "Invalid OTP", description: "Use 123456", status: "error" });
    },
  });

  if (!email) return <Navigate to="/auth/login" replace />;

  return (
    <Stack spacing={5}>
      <Text fontSize="lg" fontWeight="semibold" textAlign="center">
        Verify your email
      </Text>
      <Text fontSize="sm" color="app.textMuted" textAlign="center">
        We sent a 6-digit code to {email}. (Demo code: 123456)
      </Text>

      <HStack justify="center">
        <PinInput otp value={code} onChange={setCode}>
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
        </PinInput>
      </HStack>

      <Button
        onClick={() => verify.mutate()}
        isLoading={verify.isPending}
        isDisabled={code.length !== 6}
      >
        Verify &amp; continue
      </Button>
    </Stack>
  );
}
