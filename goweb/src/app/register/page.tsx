"use client"

import { useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FcGoogle } from "react-icons/fc";

import { Checkbox } from "@nextui-org/checkbox";
import { FaUser, FaEnvelope, FaLock, FaFacebook, FaApple } from "react-icons/fa";
import SkillSelector from "@/components/login/skill-selector"; 
import SignUpForm from "@/components/login/signup";


export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [skillLevel, setSkillLevel] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-[#1e1e1e] text-white">
        <h1 className="text-2xl font-bold text-center mb-6">
          {step === 1 && "Create Your Account"}
          {step === 2 && "Choose Your Skill Level"}
          {step === 3 && "Create Your Account"}
        </h1>

        {step === 1 && (
            <div>
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              size="lg"
              onPress={handleNext}
            >
            Signup
            </Button>
          </div>

            <div className="flex items-center my-6">
                <hr className="flex-grow border-gray-600" />
                <span className="px-4 text-gray-400">OR</span>
                <hr className="flex-grow border-gray-600" />
                </div>
        
                {/* Third-Party Login Buttons */}
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
                </div>
        )}

        {step === 2 && (
          <SkillSelector
            step={step}
            skillLevel={skillLevel}
            setSkillLevel={setSkillLevel}
            handleNext={handleNext}
            handleBack={handleBack}
            />
        )}

        {step === 3 && (
            <SignUpForm
                step={step}
                handleBack={handleBack}
            />
        )}

        <div className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Login Here
          </a>
        </div>
      </div>
    </div>
  );
}
