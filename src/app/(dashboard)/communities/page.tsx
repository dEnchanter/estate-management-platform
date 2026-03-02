"use client";

import { SlidersHorizontalIcon, Upload, X, Loader2, CheckCircle2, XCircle } from "lucide-react";
import React, { JSX, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CommunityDataTable, Community } from "@/components/communities/community-data-table";
import { useCommunities, useCreateCommunity, useCheckCommunityId } from "@/hooks/use-communities";
import { useCheckUsername } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { CreateCommunityRequest } from "@/types/api.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Zod schema for create community form
const createCommunitySchema = z.object({
  estateName: z.string().min(1, "Estate name is required"),
  communityId: z.string().min(4, "Community ID must be at least 4 characters"),
  address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  lga: z.string().min(1, "LGA is required"),
  state: z.string().min(1, "State is required"),
  nationality: z.string().min(1, "Country is required"),
  adminName: z.string().min(1, "Admin name is required"),
  username: z.string().min(4, "Username must be at least 4 characters").regex(/^[a-zA-Z0-9]+$/, "Username must be alphanumeric only"),
  adminPhone: z.string().min(1, "Admin phone is required"),
  adminEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
});

type CreateCommunityFormData = z.infer<typeof createCommunitySchema>;

// Create Community Dialog Component
interface CreateCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCommunityDialog = ({ open, onOpenChange }: CreateCommunityDialogProps) => {
  const createCommunity = useCreateCommunity();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateCommunityFormData>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      estateName: "",
      communityId: "",
      address: "",
      city: "",
      lga: "",
      state: "",
      nationality: "",
      adminName: "",
      username: "",
      adminPhone: "",
      adminEmail: "",
    },
  });

  // Debounced username for validation
  const usernameValue = watch("username");
  const [debouncedUsername, setDebouncedUsername] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUsername(usernameValue || ""), 500);
    return () => clearTimeout(timer);
  }, [usernameValue]);

  const {
    data: usernameCheck,
    isLoading: isCheckingUsername,
    isError: isUsernameError,
  } = useCheckUsername(debouncedUsername);

  // Debounced communityId for availability check
  const communityIdValue = watch("communityId");
  const [debouncedCommunityId, setDebouncedCommunityId] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCommunityId(communityIdValue || ""), 500);
    return () => clearTimeout(timer);
  }, [communityIdValue]);

  const {
    data: communityIdCheck,
    isLoading: isCheckingCommunityId,
  } = useCheckCommunityId(debouncedCommunityId);

  // File state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoError, setLogoError] = useState<string>("");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  // Reset form — `reset()` covers all registered fields via defaultValues
  const resetForm = () => {
    reset();
    setLogoFile(null);
    setLogoPreview("");
    setLogoError("");
    setDebouncedUsername("");
    setDebouncedCommunityId("");
  };

  // Handle form submission
  const onSubmit = async (data: CreateCommunityFormData) => {
    // Validate logo file
    if (!logoFile) {
      setLogoError("Community logo is required");
      toast.error("Please upload a community logo");
      return;
    }

    // Validate communityId availability
    if (communityIdCheck?.taken) {
      toast.error("Community ID already taken", {
        description: "Please choose a different community ID",
      });
      return;
    }

    // Validate username
    if (isUsernameError) {
      toast.error("Username already taken", {
        description: "Please choose a different username",
      });
      return;
    }
    if (!usernameCheck?.success) {
      toast.error("Invalid username", {
        description: "Please enter a valid username before creating the community",
      });
      return;
    }

    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Add logo file
      formData.append("logo", logoFile);

      // Build payload matching CreateCommunityWithAdminRequest struct
      const payload: CreateCommunityRequest = {
        community: {
          name: data.estateName,
          address: {
            address: data.address,
            city: data.city,
            lga: data.lga,
            state: data.state,
            nationality: data.nationality,
          },
          myCommunityID: data.communityId,
        },
        user: {
          name: data.adminName,
          username: data.username,
          phone: data.adminPhone,
          ...(data.adminEmail ? { email: data.adminEmail } : {}),
        },
      };

      // Add payload as JSON string
      formData.append("payload", JSON.stringify(payload));

      // Call API
      await createCommunity.mutateAsync(formData);

      // Success
      toast.success("Community created successfully!", {
        description: `${data.estateName} has been created.`,
      });

      // Close dialog and reset form
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Create community error:", error);
      toast.error("Failed to create community", {
        description: error.message || "Please try again",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-semibold text-[#242426] text-lg">
            Create Community
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 py-2">

          {/* ── Community Information ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Community Information</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Estate Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="estate-name" className="text-sm font-medium text-gray-700">
                Estate Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="estate-name"
                {...register("estateName")}
                placeholder="e.g. Greenville Estate"
                className={`text-sm ${errors.estateName ? "border-red-500" : ""}`}
                disabled={createCommunity.isPending}
              />
              {errors.estateName && <p className="text-red-500 text-xs">{errors.estateName.message}</p>}
            </div>

            {/* Community ID */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="community-id" className="text-sm font-medium text-gray-700">
                Community ID <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="community-id"
                  {...register("communityId")}
                  placeholder="e.g. greenville01 (unique, alphanumeric)"
                  className={`text-sm pr-8 ${errors.communityId ? "border-red-500" : ""}`}
                  disabled={createCommunity.isPending}
                />
                {debouncedCommunityId.length >= 4 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    {isCheckingCommunityId ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : communityIdCheck?.taken ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </span>
                )}
              </div>
              {errors.communityId && <p className="text-red-500 text-xs">{errors.communityId.message}</p>}
              {debouncedCommunityId.length >= 4 && !isCheckingCommunityId && communityIdCheck && (
                <p className={`text-xs ${communityIdCheck.taken ? "text-red-500" : "text-green-600"}`}>
                  {communityIdCheck.taken ? "Community ID already taken" : "Community ID is available"}
                </p>
              )}
            </div>

            {/* Street Address */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="e.g. 15 Cameron Road, Ikoyi"
                className={`text-sm ${errors.address ? "border-red-500" : ""}`}
                disabled={createCommunity.isPending}
              />
              {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
            </div>

            {/* City + LGA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="e.g. Ikoyi"
                  className={`text-sm ${errors.city ? "border-red-500" : ""}`}
                  disabled={createCommunity.isPending}
                />
                {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lga" className="text-sm font-medium text-gray-700">
                  LGA <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lga"
                  {...register("lga")}
                  placeholder="e.g. Lagos Island"
                  className={`text-sm ${errors.lga ? "border-red-500" : ""}`}
                  disabled={createCommunity.isPending}
                />
                {errors.lga && <p className="text-red-500 text-xs">{errors.lga.message}</p>}
              </div>
            </div>

            {/* State + Country */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  {...register("state")}
                  placeholder="e.g. Lagos"
                  className={`text-sm ${errors.state ? "border-red-500" : ""}`}
                  disabled={createCommunity.isPending}
                />
                {errors.state && <p className="text-red-500 text-xs">{errors.state.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nationality" className="text-sm font-medium text-gray-700">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nationality"
                  {...register("nationality")}
                  placeholder="e.g. Nigeria"
                  className={`text-sm ${errors.nationality ? "border-red-500" : ""}`}
                  disabled={createCommunity.isPending}
                />
                {errors.nationality && <p className="text-red-500 text-xs">{errors.nationality.message}</p>}
              </div>
            </div>

            {/* Logo */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Logo <span className="text-red-500">*</span>
              </Label>
              {logoPreview ? (
                <div className="relative w-24 h-24 border border-gray-200 rounded-lg overflow-hidden">
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full hover:bg-red-700 transition-colors"
                    disabled={createCommunity.isPending}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className={`flex items-center gap-3 px-4 py-3 border border-dashed rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors ${logoError ? "border-red-500" : "border-gray-300"} ${createCommunity.isPending ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <Upload className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-500">Click to upload community logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" disabled={createCommunity.isPending} />
                </label>
              )}
              {logoError && <p className="text-red-500 text-xs">{logoError}</p>}
            </div>
          </div>

          {/* ── Admin Information ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Admin Information</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Name + Username */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-name" className="text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="admin-name"
                  {...register("adminName")}
                  placeholder="e.g. Chidi Okeke"
                  className={`text-sm ${errors.adminName ? "border-red-500" : ""}`}
                  disabled={createCommunity.isPending}
                />
                {errors.adminName && <p className="text-red-500 text-xs">{errors.adminName.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    {...register("username")}
                    placeholder="e.g. chidiokeke"
                    className={`text-sm pr-8 ${errors.username ? "border-red-500" : ""}`}
                    disabled={createCommunity.isPending}
                  />
                  {debouncedUsername.length >= 4 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2">
                      {isCheckingUsername ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : usernameCheck?.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </span>
                  )}
                </div>
                {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
                {debouncedUsername.length >= 4 && !isCheckingUsername && (usernameCheck || isUsernameError) && (
                  <p className={`text-xs ${usernameCheck?.success ? "text-green-600" : "text-red-500"}`}>
                    {isUsernameError ? "Username already taken" : usernameCheck?.success ? "Username is valid" : ""}
                  </p>
                )}
              </div>
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-phone" className="text-sm font-medium text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="admin-phone"
                  {...register("adminPhone")}
                  placeholder="e.g. +2348012345678"
                  className={`text-sm ${errors.adminPhone ? "border-red-500" : ""}`}
                  disabled={createCommunity.isPending}
                />
                {errors.adminPhone && <p className="text-red-500 text-xs">{errors.adminPhone.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-email" className="text-sm font-medium text-gray-700">
                  Email <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  {...register("adminEmail")}
                  placeholder="e.g. chidi@estate.com"
                  className={`text-sm ${errors.adminEmail ? "border-red-500" : ""}`}
                  disabled={createCommunity.isPending}
                />
                {errors.adminEmail && <p className="text-red-500 text-xs">{errors.adminEmail.message}</p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => { onOpenChange(false); resetForm(); }}
              className="flex-1 text-sm"
              disabled={createCommunity.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white text-sm"
              disabled={createCommunity.isPending}
            >
              {createCommunity.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : "Create Community"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function CommunitiesPage(): JSX.Element {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch communities from API
  const { data: apiCommunities, isLoading, isError, error, refetch } = useCommunities();

  // Transform API data to table format
  const communities: Community[] = useMemo(() => {
    if (!apiCommunities) return [];

    return apiCommunities
      .filter((community) => !!community.myCommunityID)
      .map((community) => ({
      id: community.myCommunityID || community.id || "",
      name: community.name || "",
      address: [
        community.address?.address,
        community.address?.city,
        community.address?.lga,
        community.address?.state,
        community.address?.nationality
      ]
        .filter(Boolean)
        .join(", ") || "N/A",
      avatar: community.logoUrl || undefined,
    }));
  }, [apiCommunities]);

  const handleRowClick = (community: Community) => {
    router.push(`/communities/${community.id}`);
  };

  const handleEditCommunity = (community: Community) => {
    // Handle edit logic here
    console.log("Edit community:", community);
    toast.info("Edit feature coming soon!");
    // TODO: Open dialog with pre-filled community data
  };

  const handleDeleteCommunity = (community: Community) => {
    // Handle delete logic here
    console.log("Delete community:", community);
    toast.info("Delete feature coming soon!");
    // TODO: Implement delete API call
  };

  return (
    <div className="p-4 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-4 px-2 py-2 w-full">
          <div className="flex flex-col items-start px-3 py-0 flex-1">
            <h1 className="font-semibold text-[#242426] text-xl tracking-[-0.8px] leading-7 font-normal">
              Communities
            </h1>

            <div className="flex items-center gap-2">
              <span className="text-[#acacbf] text-xs tracking-[-0.5px] leading-4 font-normal">
                Home
              </span>

              <img
                className="w-px h-3 object-cover"
                alt="Divider"
                src="/divider.svg"
              />

              <span className="font-mediumtext-[#5b5b66] text-xs tracking-[-0.5px] leading-4">
                Communities
              </span>
            </div>
          </div>

          <Button onClick={() => setIsCreateDialogOpen(true)} className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors">
            <span className="font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
              Create Community
            </span>
          </Button>
        </div>

        {/* Main Content Card */}
        <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <CardContent className="flex flex-col items-start gap-4 p-6 flex-1">
            {/* Tabs and Filter */}
            <div className="flex items-center gap-6 w-full">
              <div className="flex items-center gap-1 border-b border-gray-200 flex-1">
                <button
                  className="px-4 py-2.5 text-sm font-medium text-[#1f1f3f] border-b-2 border-[#1f1f3f] -mb-px transition-colors"
                >
                  All communities
                </button>
                <span
                  className="px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed select-none"
                  title="Coming soon"
                >
                  Active
                </span>
                <span
                  className="px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed select-none"
                  title="Coming soon"
                >
                  Inactive
                </span>
              </div>

              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-100 rounded-lg transition-colors">
                <SlidersHorizontalIcon className="w-5 h-5 text-[#5b5b66]" />
              </Button>
            </div>

            {/* Conditional Rendering: Loading, Error, Empty State or Data Table */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <Loader2 className="w-10 h-10 text-[#1f1f3f] animate-spin" />
                <p className="font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6">
                  Loading communities...
                </p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl">
                  <div className="bg-red-50 p-4 rounded-full">
                    <img
                      className="w-10 h-10"
                      alt="Error icon"
                      src="/frame-4.svg"
                    />
                  </div>

                  <p className="font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6 max-w-md">
                    Failed to load communities
                    <br />
                    Please try again or contact support if the problem persists
                  </p>
                </div>

                <Button onClick={() => refetch()} className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors">
                  <span className="font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
                    Try Again
                  </span>
                </Button>
              </div>
            ) : communities.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl">
                  <div className="bg-[#f4f4f9] p-4 rounded-full">
                    <img
                      className="w-10 h-10"
                      alt="Community icon"
                      src="/frame-4.svg"
                    />
                  </div>

                  <p className="font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6 max-w-md">
                    No community has been created yet.
                    <br />
                    Click the button to create your first community
                  </p>
                </div>

                <Button onClick={() => setIsCreateDialogOpen(true)} className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors">
                  <span className="font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
                    Create Community
                  </span>
                </Button>
              </div>
            ) : (
              <CommunityDataTable
                data={communities}
                onViewDetails={handleRowClick}
                onEdit={handleEditCommunity}
                onDelete={handleDeleteCommunity}
              />
            )}
          </CardContent>
        </Card>
      </section>

      <CreateCommunityDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
