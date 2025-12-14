"use client";

import { useSession, signIn } from "next-auth/react";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const loading = false; // Disable loading for testing
  const authenticated = true; // Always authenticated for testing

  const login = useCallback(() => {
    signIn("keycloak");
  }, []);

  return {
    session,
    loading,
    authenticated,
    login,
    user: session?.user || { name: "Test User", email: "test@example.com" },
  };
}
