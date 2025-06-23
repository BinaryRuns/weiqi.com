"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabase";
import { AuthProviderButton } from "@/components/login/AuthProviderButton";
import { googleProvider, githubProvider } from "@/lib/auth/providers";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Check for error in URL (from auth callback)
  const errorMessage = searchParams.get("error");
  if (errorMessage) {
    toast({
      title: "Authentication Error",
      description: errorMessage,
      variant: "destructive",
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate data using zod
    const validationResult = LoginSchema.safeParse(formData);
    if (!validationResult.success) {
      // Extract and display errors
      const fieldErrors: any = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Sign in with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Login Successful",
        description: "You are being redirected to the home page.",
      });

      // Redirect to home page after a short delay to allow toast display
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error: any) {
      // Handle any other errors
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-[#1e1e1e] text-white">
          <h1 className="text-2xl font-bold text-center mb-6">Log In</h1>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Input
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            <div>
              <Input
                name="password"
                placeholder="Enter your password"
                type="password"
                className="w-full"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me">Remember me</Checkbox>
                <Label htmlFor="remember-me">Remember Me</Label>
              </div>
              <a href="/forgot-password" className="text-sm hover:underline">
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-600" />
            <span className="px-4 text-gray-400">OR</span>
            <hr className="flex-grow border-gray-600" />
          </div>

          <div className="space-y-3">
            <AuthProviderButton provider={googleProvider} fullWidth />
            <AuthProviderButton provider={githubProvider} fullWidth />
          </div>

          <div className="mt-4 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
