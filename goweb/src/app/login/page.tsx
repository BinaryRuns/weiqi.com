"use client";

import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { Checkbox } from "@nextui-org/checkbox";
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import React, { useState } from "react";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setAccessToken } from "@/store/authSlice";

const LoginSchema = z.object({
  username: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ username: "", password: "" });

  const dispatch = useDispatch();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validate data using zod
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

    // send data to backend
    const response = await fetch("api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    const accessToken = data.accessToken;

    dispatch(setAccessToken(accessToken));

    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-[#1e1e1e] text-white">
        <h1 className="text-2xl font-bold text-center mb-6">Log In</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <Input
              name="username"
              placeholder="you@example.com"
              startContent={<FaUser />}
              size="lg"
              type="email"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div>
            <Input
              name="password"
              placeholder="Enter your password"
              type="password"
              size="lg"
              startContent={<FaLock />}
              className="w-full"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

   
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Checkbox size="md">Remember me</Checkbox>
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
            className="w-full bg-black text-white border border-gray-600 hover:bg-gray-800"
            size="lg"
            startContent={<FaApple size={25} />}
          >
            Continue with Apple
          </Button>
          <Button
            className="w-full bg-black text-white border border-gray-600 hover:bg-gray-800"
            size="lg"
            startContent={<FcGoogle size={25} />}
          >
            Continue with Google
          </Button>
          <Button
            className="w-full bg-black text-white border border-gray-600 hover:bg-gray-800"
            size="lg"
            startContent={<FaFacebook size={25} />}
          >
            Continue with Facebook
          </Button>
        </div>

        {/* Sign-Up Link */}
        <div className="mt-4 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
