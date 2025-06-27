import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SkillSelectorProps {
  step: number;
  skillLevel: string;
  setSkillLevel: (level: string) => void;
  handleNext: () => void;
  handleBack: () => void;
}

const SkillSelector: React.FC<SkillSelectorProps> = ({
  step,
  skillLevel,
  setSkillLevel,
  handleNext,
  handleBack,
}) => {
  const skillLevels = ["beginner", "intermediate", "advanced"] as const;

  return step === 2 ? (
    <div className="flex flex-col gap-4">
      {skillLevels.map((level) => (
        <Button
          key={level}
          size="lg"
          variant="outline"
          className={`w-full text-white border relative ${
            skillLevel === level
              ? "border-blue-600 bg-black"
              : "border-gray-600 bg-gray-800 hover:bg-gray-800"
          }`}
          onClick={() => setSkillLevel(level)}
        >
          <div className="flex items-center justify-between w-full">
            <span className="capitalize">{level}</span>
            {skillLevel === level && <Check className="w-5 h-5" />}
          </div>
        </Button>
      ))}

      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 bg-blue-600 mt-10 text-white hover:bg-blue-700"
        size="lg"
        onClick={handleNext}
        disabled={!skillLevel}
      >
        Next
      </Button>

      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white hover:bg-gray-700"
        size="lg"
        onClick={handleBack}
      >
        Back
      </Button>
    </div>
  ) : null;
};

export default SkillSelector;
