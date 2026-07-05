import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./authStore";
import type { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useAuthStore((s) => s.session);
  const location = useLocation();
  if (!session) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
