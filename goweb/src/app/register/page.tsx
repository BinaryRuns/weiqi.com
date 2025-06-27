"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FaGithub,
  FaEnvelope,
} from "react-icons/fa";
import SkillSelector from "@/components/login/skill-selector";
import SignUpForm from "@/components/login/signup";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/auth/SupabaseAuthProvider";
import { AuthProviderButton } from "@/components/login/AuthProviderButton";
import { googleProvider, githubProvider } from "@/lib/auth/providers";

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [skillLevel, setSkillLevel] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

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

  const handleSubmit = async () => {
    setIsLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            skill_level: skillLevel,
          }
        }
      });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message || "Please check your details and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Redirecting to login page...",
      });

      // Redirect to home page after a short delay to allow toast display
      setTimeout(() => {
        router.push("/");
      }, 1000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster />
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
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  size="lg"
                  onClick={handleNext}
                >
                  <FaEnvelope className="h-5 w-5" />
                  <span>Sign up with Email</span>
                </Button>
              </div>

              <div className="flex items-center my-6">
                <hr className="flex-grow border-gray-600" />
                <span className="px-4 text-gray-400">OR</span>
                <hr className="flex-grow border-gray-600" />
              </div>

              {/* Third-Party Login Buttons */}
              <div className="space-y-3">
                <AuthProviderButton provider={googleProvider} fullWidth />
                <AuthProviderButton provider={githubProvider} fullWidth />
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
              handleInputChange={handleInputChange}
              formData={formData}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
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
    </>
  );
}
