"use client";

import { useSupabaseAuth } from "@/auth/SupabaseAuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchWithAuth } from "@/utils/api";
import { useEffect, useState } from "react";

export default function TestAuthPage() {
  const { user, session } = useSupabaseAuth();
  const [authStatus, setAuthStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function verifyWithBackend() {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth("/api/auth/verify");
      const data = await response.json();
      setAuthStatus(JSON.stringify(data, null, 2));
    } catch (error) {
      setAuthStatus(`Error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>
            Test your Supabase authentication with the Spring Boot backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Authentication Status:</h3>
              <p>
                {user ? "Authenticated as " + user.email : "Not authenticated"}
              </p>
            </div>

            <div>
              <h3 className="font-medium">Supabase User ID:</h3>
              <p className="break-all">{user?.id || "None"}</p>
            </div>

            <div>
              <h3 className="font-medium">Backend Verification:</h3>
              <pre className="bg-slate-100 p-4 rounded text-sm overflow-auto max-h-60 text-black">
                {authStatus || "Click verify to check backend authentication"}
              </pre>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={verifyWithBackend} disabled={isLoading || !user}>
            {isLoading ? "Verifying..." : "Verify with Backend"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 