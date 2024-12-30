import React, { useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

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
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  step,
  handleBack,
  handleInputChange,
  formData,
  handleSubmit,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div>
        <Input
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="johndoe@example.com"
          startContent={<FaEnvelope />}
          size="lg"
          type="email"
        />
      </div>
      <div>
        <Input
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="create username"
          startContent={<FaUser />}
          size="lg"
          type="text"
        />
      </div>
      <div>
        <Input
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="create password"
          startContent={<FaLock />}
          size="lg"
          type="password"
        />
      </div>
      <div>
        <Input
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="confirm password"
          startContent={<FaLock />}
          size="lg"
          type="password"
        />
      </div>
      <Button
        onPress={handleSubmit}
        className="w-full bg-blue-600 text-white hover:bg-blue-700"
        size="lg"
      >
        Sign Up
      </Button>
      <Button
        type="button"
        className="w-full bg-gray-600 text-white hover:bg-gray-700"
        size="lg"
        onClick={handleBack}
      >
        Back
      </Button>
    </div>
  );
};

export default SignUpForm;
