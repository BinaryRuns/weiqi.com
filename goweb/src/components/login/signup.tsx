import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SignUpFormProps {
  step: number;
  formData: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  };
  handleBack: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  isLoading?: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  step,
  handleBack,
  handleInputChange,
  formData,
  handleSubmit,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div>
        <Input
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          disabled={isLoading}
        />
      </div>
      <div>
        <Input
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Choose a username"
          type="text"
          autoComplete="username"
          disabled={isLoading}
        />
      </div>
      <div>
        <Input
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Create password"
          type="password"
          autoComplete="new-password"
          disabled={isLoading}
        />
      </div>
      <div>
        <Input
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm password"
          type="password"
          autoComplete="new-password"
          disabled={isLoading}
        />
      </div>
      <Button
        onClick={handleSubmit}
        variant="outline"
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? "Signing up..." : "Sign Up"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white hover:bg-gray-700"
        size="lg"
        onClick={handleBack}
        disabled={isLoading}
      >
        Back
      </Button>
    </div>
  );
};

export default SignUpForm;
