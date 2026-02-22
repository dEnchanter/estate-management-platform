"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLogin } from "@/hooks/use-auth";
import { isValidEmail, getErrorMessage } from "@/lib/utils";
import type { ApiError } from "@/lib/api-client";

export default function Home() {
  const router = useRouter();
  const login = useLogin();

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = "Email or username is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Call login mutation
      const response = await login.mutateAsync({
        username: username.trim(),
        password,
      });

      // Login successful - token is automatically stored by the hook
      console.log("Login successful:", response);

      // Show success toast
      toast.success("Login successful!", {
        description: `Welcome back, ${response.profile?.name || "User"}!`,
      });

      // Check if user needs to change password
      if (response.profile) {
        // Check for redirect URL in sessionStorage
        const redirectUrl = sessionStorage.getItem("redirectAfterLogin");

        // Clear the stored redirect URL
        if (redirectUrl) {
          sessionStorage.removeItem("redirectAfterLogin");
        }

        // Redirect to the stored URL or default to dashboard
        setTimeout(() => {
          router.push(redirectUrl || "/dashboard");
        }, 500);
      }
    } catch (error) {
      // Error handling with toast
      console.error("Login failed:", error);

      // Check if the user must change their password
      const apiError = error as ApiError;
      const rawData = apiError.data as { mustChangePassword?: string } | undefined;
      if (rawData?.mustChangePassword) {
        router.push(`/set-password?username=${encodeURIComponent(username.trim())}`);
        return;
      }

      const errorMessage = getErrorMessage(error);
      toast.error("Login failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <>
      <div
        className="relative flex flex-col min-h-screen items-center justify-center gap-16 p-8"
        data-model-id="3099:12127"
      >
        <img
          className="absolute inset-0 w-full h-full object-cover -z-10"
          alt="Bg"
          src="https://c.animaapp.com/mgnniwhlhRNaFK/img/bg.svg"
        />

        <header className="inline-flex items-center gap-2.5 px-3 py-0 z-10">
          <h1 className="w-fit mt-[-1.00px] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#1f1f3f] text-2xl tracking-[-1.50px] leading-8 whitespace-nowrap">
            Zamani
          </h1>
        </header>

        <Card className="w-full max-w-[480px] bg-white rounded-2xl overflow-hidden shadow-lg z-10 -mt-10">
          <CardContent className="flex flex-col items-center gap-6 p-6">
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
              <div className="gap-4 flex items-center w-full">
                <div className="flex-1 [font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#242426] text-xl tracking-[-0.50px] leading-7">
                  Log In
                </div>

                <div className="flex-1 [font-family:'SF_Pro-MediumItalic',Helvetica] font-medium italic text-[#acacbf] text-sm text-right tracking-[-0.50px] leading-5">
                  Super Admin
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 w-full bg-white rounded-xl">
                {/* Email/Username Field */}
                <div className="flex flex-col items-start gap-1.5 w-full">
                  <Label
                    htmlFor="username"
                    className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5"
                  >
                    Email address or Username
                  </Label>

                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) {
                        setErrors({ ...errors, username: undefined });
                      }
                    }}
                    placeholder="Enter your email or username"
                    className={`w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm tracking-[-0.50px] leading-5 placeholder:text-[#acacbf] h-auto p-3 ${
                      errors.username ? "ring-2 ring-red-500" : ""
                    }`}
                    disabled={login.isPending}
                  />

                  {errors.username && (
                    <p className="text-red-500 text-xs [font-family:'SF_Pro-Regular',Helvetica]">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="flex flex-col items-start gap-1.5 w-full">
                  <Label
                    htmlFor="password"
                    className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5"
                  >
                    Password
                  </Label>

                  <div className="relative w-full">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                          setErrors({ ...errors, password: undefined });
                        }
                      }}
                      placeholder="Enter your password"
                      className={`w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm tracking-[-0.50px] leading-5 placeholder:text-[#acacbf] h-auto p-3 pr-10 ${
                        errors.password ? "ring-2 ring-red-500" : ""
                      }`}
                      disabled={login.isPending}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#acacbf] hover:text-[#5b5b66] transition-colors"
                      aria-label="Toggle password visibility"
                      disabled={login.isPending}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="text-red-500 text-xs [font-family:'SF_Pro-Regular',Helvetica]">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Forgot Password Link */}
                {/* <button
                  type="button"
                  className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#1f1f3f] text-sm tracking-[-0.50px] leading-5 hover:underline"
                  onClick={() => {
                    // TODO: Implement forgot password flow
                    alert("Forgot password feature coming soon!");
                  }}
                >
                  Forgot password?
                </button> */}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col items-center w-full">
                <Button
                  type="submit"
                  disabled={login.isPending}
                  className="w-full bg-[#1f1f3f] hover:bg-[#2a2a4f] rounded-full overflow-hidden [font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.50px] leading-5 h-auto px-5 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {login.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="w-full text-center">
              <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#1f1f3f] hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
