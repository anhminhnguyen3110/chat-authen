"use client";

import { useAuth } from "@/hooks/useAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LangGraphLogoSVG } from "@/components/icons/langgraph";
import { Loader2 } from "lucide-react";

export function LoginScreen() {
  const { login, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <LangGraphLogoSVG className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Welcome to Agent Inbox</CardTitle>
          <CardDescription>
            Sign in with your Keycloak account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={login} className="w-full" size="lg">
            Sign in with Keycloak
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Secured authentication powered by Keycloak
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
