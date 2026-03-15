"use client";

import React, { JSX, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetPassword } from "@/hooks/use-auth";

// Schema is the same for both modes; currentPassword only validated when shown
const setPasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

function SetPasswordForm(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";
  const isManualChange = searchParams.get("mode") === "change";
  const setPassword = useSetPassword();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, touchedFields },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SetPasswordFormData) => {
    // Manual change: use the typed current password
    // First-login: pull from sessionStorage (set by the login page)
    let oldPassword: string;
    if (isManualChange) {
      oldPassword = data.currentPassword ?? "";
    } else {
      oldPassword = sessionStorage.getItem("pendingPassword") ?? "";
      sessionStorage.removeItem("pendingPassword");
    }

    try {
      await setPassword.mutateAsync({
        username,
        oldPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully", {
        description: isManualChange
          ? "Your password has been changed."
          : "You can now log in with your new password.",
      });
      router.push(isManualChange ? "/dashboard" : "/");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to update password");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center w-full">
        <div className="flex-1 [font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#242426] text-xl tracking-[-0.50px] leading-7">
          {isManualChange ? "Change Password" : "Set New Password"}
        </div>
      </div>

      <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm tracking-[-0.5px] w-full">
        {isManualChange
          ? "Enter your current password and choose a new one."
          : "You are required to change your password before continuing."}
      </p>

      <div className="flex flex-col items-start gap-4 w-full bg-white rounded-xl">
        {/* Current Password — manual change only */}
        {isManualChange && (
          <div className="flex flex-col items-start gap-1.5 w-full">
            <Label
              htmlFor="currentPassword"
              className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5"
            >
              Current Password
            </Label>
            <div className="relative w-full">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                {...register("currentPassword")}
                placeholder="Enter your current password"
                className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm tracking-[-0.50px] leading-5 placeholder:text-[#acacbf] h-auto p-3 pr-10"
                disabled={setPassword.isPending}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#acacbf] hover:text-[#5b5b66] transition-colors"
                aria-label="Toggle current password visibility"
                disabled={setPassword.isPending}
              >
                {showCurrentPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 text-xs">{errors.currentPassword.message}</p>
            )}
          </div>
        )}

        {/* New Password */}
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label
            htmlFor="newPassword"
            className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5"
          >
            New Password
          </Label>
          <div className="relative w-full">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              {...register("newPassword", {
                onChange: () => { if (touchedFields.confirmPassword) trigger("confirmPassword"); },
              })}
              placeholder="Enter new password (min. 6 characters)"
              className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm tracking-[-0.50px] leading-5 placeholder:text-[#acacbf] h-auto p-3 pr-10"
              disabled={setPassword.isPending}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#acacbf] hover:text-[#5b5b66] transition-colors"
              aria-label="Toggle new password visibility"
              disabled={setPassword.isPending}
            >
              {showNewPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
          {errors.newPassword && <p className="text-red-500 text-xs">{errors.newPassword.message}</p>}
        </div>

        {/* Confirm New Password */}
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label
            htmlFor="confirmPassword"
            className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5"
          >
            Confirm New Password
          </Label>
          <div className="relative w-full">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm new password"
              className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm tracking-[-0.50px] leading-5 placeholder:text-[#acacbf] h-auto p-3 pr-10"
              disabled={setPassword.isPending}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#acacbf] hover:text-[#5b5b66] transition-colors"
              aria-label="Toggle confirm password visibility"
              disabled={setPassword.isPending}
            >
              {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <div className="flex flex-col items-center w-full">
        <Button
          type="submit"
          disabled={setPassword.isPending}
          className="w-full bg-[#1f1f3f] hover:bg-[#2a2a4f] rounded-full overflow-hidden [font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.50px] leading-5 h-auto px-5 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {setPassword.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </span>
          ) : (
            isManualChange ? "Change Password" : "Update Password"
          )}
        </Button>
      </div>
    </form>
  );
}

export default function SetPasswordPage(): JSX.Element {
  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center gap-16 p-8">
      <img
        className="absolute inset-0 w-full h-full object-cover -z-10"
        alt="Background"
        src="https://c.animaapp.com/mgnniwhlhRNaFK/img/bg.svg"
      />

      <header className="inline-flex items-center gap-2.5 px-3 py-0 z-10">
        <h1 className="w-fit mt-[-1.00px] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#1f1f3f] text-2xl tracking-[-1.50px] leading-8 whitespace-nowrap">
          Zamani
        </h1>
      </header>

      <Card className="w-full max-w-[480px] bg-white rounded-2xl overflow-hidden shadow-lg z-10 -mt-10">
        <CardContent className="flex flex-col items-center gap-6 p-6">
          <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin text-[#1f1f3f]" />}>
            <SetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
