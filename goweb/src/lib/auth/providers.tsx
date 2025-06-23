import { ProviderConfig } from "@/components/login/AuthProviderButton";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaApple } from "react-icons/fa";

// Export individual provider configurations
export const googleProvider: ProviderConfig = {
  id: 'google',
  name: 'Google',
  icon: <FcGoogle className="h-5 w-5" />,
  className: "bg-white text-black border border-gray-300 hover:bg-gray-100"
};

export const githubProvider: ProviderConfig = {
  id: 'github',
  name: 'GitHub',
  icon: <FaGithub className="h-5 w-5" />,
  className: "bg-black text-white border border-gray-600 hover:bg-gray-800"
};

// These providers are prepared for future use
export const discordProvider: ProviderConfig = {
  id: 'discord',
  name: 'Discord',
  icon: <FaDiscord className="h-5 w-5" />,
  className: "bg-[#5865F2] text-white hover:bg-[#4a55d6]"
};

export const twitterProvider: ProviderConfig = {
  id: 'twitter',
  name: 'X / Twitter',
  icon: <FaXTwitter className="h-5 w-5" />,
  className: "bg-black text-white hover:bg-gray-800"
};

export const appleProvider: ProviderConfig = {
  id: 'apple',
  name: 'Apple',
  icon: <FaApple className="h-5 w-5" />,
  className: "bg-black text-white hover:bg-gray-800"
};

// Export all available providers
export const availableProviders = {
  google: googleProvider,
  github: githubProvider,
  // Uncomment when implemented in Supabase project
  // discord: discordProvider,
  // twitter: twitterProvider,
  // apple: appleProvider,
}; 