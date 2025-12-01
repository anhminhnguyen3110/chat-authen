"use client";

import { useSession, signIn } from "next-auth/react";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const authenticated = status === "authenticated";

  const login = useCallback(() => {
    signIn("keycloak");
  }, []);

  return {
    session,
    loading,
    authenticated,
    login,
    user: session?.user,
  };
}
