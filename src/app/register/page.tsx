"use client";

import React, { JSX, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegister } from "@/hooks/use-auth";
import { useCommunities } from "@/hooks/use-communities";
import { useCommunityStreets } from "@/hooks/use-streets";
import { GENDERS, USER_TYPES } from "@/lib/constants";

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  type: z.enum(["Resident", "Developer"], { error: "Account type is required" }),
  gender: z.enum(["Male", "Female"], { error: "Gender is required" }),
  myCommunityID: z.string().min(1, "Community is required"),
  street: z.string().min(1, "Street is required"),
  number: z.string().min(1, "House/unit number is required"),
  movedIn: z.string().min(1, "Move-in date is required"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm(): JSX.Element {
  const router = useRouter();
  const registerUser = useRegister();
  const [selectedCommunityCode, setSelectedCommunityCode] = useState("");

  const { data: communities, isLoading: communitiesLoading } = useCommunities(undefined, true);
  const { data: streets, isLoading: streetsLoading } = useCommunityStreets(selectedCommunityCode, true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const watchedCommunity = watch("myCommunityID");

  const handleCommunityChange = (value: string) => {
    setValue("myCommunityID", value, { shouldValidate: true });
    setValue("street", "", { shouldValidate: false });
    setSelectedCommunityCode(value);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser.mutateAsync({
        username: data.username,
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: data.type,
        gender: data.gender,
        myCommunityID: data.myCommunityID,
        street: data.street,
        number: data.number,
        movedIn: data.movedIn,
      });
      toast.success("Registration submitted", {
        description: "Your account is pending approval. You can log in once approved.",
      });
      router.push("/");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center w-full">
        <div className="flex-1 [font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#242426] text-xl tracking-[-0.50px] leading-7">
          Create Account
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {/* Username */}
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5">
            Username
          </Label>
          <Input
            {...register("username")}
            placeholder="Choose a username"
            className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm placeholder:text-[#acacbf] h-auto p-3"
            disabled={registerUser.isPending}
          />
          {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
        </div>

        {/* Full Name */}
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5">
            Full Name
          </Label>
          <Input
            {...register("name")}
            placeholder="Enter your full name"
            className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm placeholder:text-[#acacbf] h-auto p-3"
            disabled={registerUser.isPending}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5">
            Email Address
          </Label>
          <Input
            type="email"
            {...register("email")}
            placeholder="Enter your email"
            className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm placeholder:text-[#acacbf] h-auto p-3"
            disabled={registerUser.isPending}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5">
            Phone Number
          </Label>
          <Input
            type="tel"
            {...register("phone")}
            placeholder="Enter your phone number"
            className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm placeholder:text-[#acacbf] h-auto p-3"
            disabled={registerUser.isPending}
          />
          {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
        </div>

        {/* Account Type */}
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5">
            Account Type
          </Label>
          <Select onValueChange={(v) => setValue("type", v as "Resident" | "Developer", { shouldValidate: true })} disabled={registerUser.isPending}>
            <SelectTrigger className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] text-sm h-auto p-3">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={USER_TYPES.RESIDENT}>{USER_TYPES.RESIDENT}</SelectItem>
              <SelectItem value={USER_TYPES.DEVELOPER}>{USER_TYPES.DEVELOPER}</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
        </div>

        {/* Gender */}
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5">
            Gender
          </Label>
          <Select onValueChange={(v) => setValue("gender", v as "Male" | "Female", { shouldValidate: true })} disabled={registerUser.isPending}>
            <SelectTrigger className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] text-sm h-auto p-3">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={GENDERS.MALE}>{GENDERS.MALE}</SelectItem>
              <SelectItem value={GENDERS.FEMALE}>{GENDERS.FEMALE}</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && <p className="text-red-500 text-xs">{errors.gender.message}</p>}
        </div>

        {/* Community */}
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5">
            Community
          </Label>
          <Select onValueChange={handleCommunityChange} disabled={registerUser.isPending || communitiesLoading}>
            <SelectTrigger className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] text-sm h-auto p-3">
              <SelectValue placeholder={communitiesLoading ? "Loading communities..." : "Select your community"} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {(communities || []).map((c) => (
                <SelectItem key={c.myCommunityID} value={c.myCommunityID}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.myCommunityID && <p className="text-red-500 text-xs">{errors.myCommunityID.message}</p>}
        </div>

        {/* Street */}
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5">
            Street
          </Label>
          <Select
            onValueChange={(v) => setValue("street", v, { shouldValidate: true })}
            disabled={registerUser.isPending || !watchedCommunity || streetsLoading}
          >
            <SelectTrigger className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] text-sm h-auto p-3">
              <SelectValue
                placeholder={
                  !watchedCommunity
                    ? "Select a community first"
                    : streetsLoading
                    ? "Loading streets..."
                    : "Select your street"
                }
              />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {(streets || [])
                .filter((s) => s.isActive)
                .map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.street && <p className="text-red-500 text-xs">{errors.street.message}</p>}
        </div>

        {/* House/Unit Number */}
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5">
            House / Unit Number
          </Label>
          <Input
            {...register("number")}
            placeholder="e.g. 12B"
            className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm placeholder:text-[#acacbf] h-auto p-3"
            disabled={registerUser.isPending}
          />
          {errors.number && <p className="text-red-500 text-xs">{errors.number.message}</p>}
        </div>

        {/* Move-in Date */}
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5">
            Move-in Date
          </Label>
          <Input
            type="date"
            {...register("movedIn")}
            className="w-full bg-[#f4f4f9] rounded-lg border-0 [font-family:'SF_Pro-Regular',Helvetica] font-normal text-sm placeholder:text-[#acacbf] h-auto p-3"
            disabled={registerUser.isPending}
          />
          {errors.movedIn && <p className="text-red-500 text-xs">{errors.movedIn.message}</p>}
        </div>
      </div>

      <div className="flex flex-col items-center w-full gap-3 mt-2">
        <Button
          type="submit"
          disabled={registerUser.isPending}
          className="w-full bg-[#1f1f3f] hover:bg-[#2a2a4f] rounded-full overflow-hidden [font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.50px] leading-5 h-auto px-5 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {registerUser.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#1f1f3f] hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </form>
  );
}

export default function RegisterPage(): JSX.Element {
  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center gap-8 p-8">
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

      <Card className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-lg z-10">
        <CardContent className="flex flex-col items-center gap-6 p-6">
          <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin text-[#1f1f3f]" />}>
            <RegisterForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
