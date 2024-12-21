import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { Checkbox } from "@nextui-org/checkbox";
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-[#1e1e1e] text-white">
        <h1 className="text-2xl font-bold text-center mb-6">Log In</h1>
        <form className="flex flex-col gap-4">
          <div>
            <Input
              placeholder="you@example.com"
              startContent={<FaUser />}
              size="lg"
              type="email"
            />
          </div>
          <div>
            <Input
              placeholder="Enter your password"
              type="password"
              size="lg"
              startContent={<FaLock />}
              className="w-full"
            />
          </div>

          {/* Remember me / Forget Password */}
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

        {/* OR Divider */}
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
            Log in with Apple
          </Button>
          <Button
            className="w-full bg-black text-white border border-gray-600 hover:bg-gray-800"
            size="lg"
            startContent={<FcGoogle size={25} />}
          >
            Log in with Google
          </Button>
          <Button
            className="w-full bg-black text-white border border-gray-600 hover:bg-gray-800"
            size="lg"
            startContent={<FaFacebook size={25} />}
          >
            Log in with Facebook
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
