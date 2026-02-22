"use client";

import React, { JSX, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetPassword } from "@/hooks/use-auth";

const setPasswordSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    oldPassword: z.string().min(1, "Current password is required"),
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
  const usernameFromQuery = searchParams.get("username") || "";
  const setPassword = useSetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { username: usernameFromQuery },
  });

  const onSubmit = async (data: SetPasswordFormData) => {
    try {
      await setPassword.mutateAsync({
        username: data.username,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully", {
        description: "You can now log in with your new password.",
      });
      router.push("/dashboard");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to update password");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center w-full">
        <div className="flex-1 [font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#242426] text-xl tracking-[-0.50px] leading-7">
          Set New Password
        </div>
      </div>

      <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm tracking-[-0.5px] w-full">
        You are required to change your password before continuing.
      </p>

      <div className="flex flex-col items-start gap-4 w-full bg-white rounded-xl">
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label
            htmlFor="username"
            className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5"
          >
            Username
          </Label>
          <Input
            id="username"
            type="text"
            {...register("username")}
            placeholder="Your username"
            className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm tracking-[-0.50px] leading-5 placeholder:text-[#acacbf] h-auto p-3"
            disabled={setPassword.isPending}
          />
          {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
        </div>

        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label
            htmlFor="oldPassword"
            className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5"
          >
            Current Password
          </Label>
          <Input
            id="oldPassword"
            type="password"
            {...register("oldPassword")}
            placeholder="Enter your current password"
            className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm tracking-[-0.50px] leading-5 placeholder:text-[#acacbf] h-auto p-3"
            disabled={setPassword.isPending}
          />
          {errors.oldPassword && <p className="text-red-500 text-xs">{errors.oldPassword.message}</p>}
        </div>

        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label
            htmlFor="newPassword"
            className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5"
          >
            New Password
          </Label>
          <Input
            id="newPassword"
            type="password"
            {...register("newPassword")}
            placeholder="Enter new password (min. 6 characters)"
            className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm tracking-[-0.50px] leading-5 placeholder:text-[#acacbf] h-auto p-3"
            disabled={setPassword.isPending}
          />
          {errors.newPassword && <p className="text-red-500 text-xs">{errors.newPassword.message}</p>}
        </div>

        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label
            htmlFor="confirmPassword"
            className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5"
          >
            Confirm New Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            placeholder="Confirm new password"
            className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm tracking-[-0.50px] leading-5 placeholder:text-[#acacbf] h-auto p-3"
            disabled={setPassword.isPending}
          />
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
            "Update Password"
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
