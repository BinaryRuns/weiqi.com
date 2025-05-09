"use client";

import { useState } from "react";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setAccessToken } from "@/store/authSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { FaGithub, FaGoogle } from "react-icons/fa";

const LoginSchema = z.object({
  username: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ username: "", password: "" });

  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      return;
    }

    console.log("Form data is valid:", validationResult.data);

    try {
      // Send data to backend
      const response = await fetch("api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // If the response is not ok, read the text and show a toast
      if (!response.ok) {
        await response.text(); // you could log the text if needed
        toast({
          title: "Login Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
        return;
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        toast({
          title: "Login Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
        return;
      }

      // Check if accessToken exists in the data
      if (!data.accessToken) {
        toast({
          title: "Login Failed",
          description: data.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login Successful",
        description: "You are being redirected to the home page.",
      });

      dispatch(setAccessToken(data.accessToken));

      // Redirect to home page after a short delay to allow toast display
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error: any) {
      // Handle any other errors
      toast({
        title: "Error",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
      console.error("Login error:", error);
    }
  };

  // OAuth handler
  const handleOAuthLogin = (provider: string) => {
    const providerKey = provider.toLowerCase();
    const oauthEndpoints: { [key: string]: string } = {
      google: `api/auth/oauth/google`,
      github: `api/auth/oauth/github`,
      facebook: `api/auth/oauth/facebook`,
    };

    const redirectUrl = oauthEndpoints[providerKey];

    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    } else {
      alert("OAuth provider not implemented yet");
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
                name="username"
                placeholder="you@example.com"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username}</p>
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
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              size="lg"
            >
              Log In
            </Button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-600" />
            <span className="px-4 text-gray-400">OR</span>
            <hr className="flex-grow border-gray-600" />
          </div>

          <div className="space-y-3">
            <Button
              className="w-full h-12 bg-black text-white border border-gray-600 hover:bg-gray-800 gap-3"
              onClick={() => handleOAuthLogin("google")}
            >
              <FaGoogle className="w-6 h-6" />
              Continue with Google
            </Button>
            <Button
              className="w-full h-12 bg-black text-white border border-gray-600 hover:bg-gray-800 gap-3"
              onClick={() => handleOAuthLogin("github")}
            >
              <FaGithub className="w-6 h-6" />
              Continue with Github
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-400">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
