"use client";

import { SlidersHorizontalIcon, Upload, X, Loader2 } from "lucide-react";
import React, { JSX, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityDataTable, Community } from "@/components/communities/community-data-table";
import { useCommunities, useCreateCommunity } from "@/hooks/use-communities";
import { useCurrentUser } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { CreateCommunityRequest } from "@/types/api.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Zod schema for create community form
const createCommunitySchema = z.object({
  estateName: z.string().min(1, "Estate name is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  lga: z.string().optional(),
  zipCode: z.string().optional(),
  address: z.string().min(1, "Address is required"),
});

type CreateCommunityFormData = z.infer<typeof createCommunitySchema>;

// Create Community Dialog Component
interface CreateCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCommunityDialog = ({ open, onOpenChange }: CreateCommunityDialogProps) => {
  const createCommunity = useCreateCommunity();
  const { data: currentUser } = useCurrentUser();

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
      country: "",
      state: "",
      lga: "",
      zipCode: "",
      address: "",
    },
  });

  // File state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string>("");
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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview("");
  };

  // Reset form
  const resetForm = () => {
    reset();
    setLogoFile(null);
    setCoverFile(null);
    setLogoPreview("");
    setCoverPreview("");
    setLogoError("");
  };

  // Handle form submission
  const onSubmit = async (data: CreateCommunityFormData) => {
    // Validate logo file
    if (!logoFile) {
      setLogoError("Community logo is required");
      toast.error("Please upload a community logo");
      return;
    }

    // Validate current user data
    if (!currentUser) {
      toast.error("User session not found", {
        description: "Please log in again",
      });
      return;
    }

    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Add logo file
      formData.append("logo", logoFile);

      // Create payload object with admin details from current user
      const payload = {
        name: data.estateName,
        address: {
          country: data.country,
          state: data.state,
          lga: data.lga || "",
          zipCode: data.zipCode || "",
          street: data.address,
        },
        admin: {
          name: currentUser.name || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
          username: currentUser.username || "",
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
          <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-lg">
            Create Community
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          {/* Estate Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="estate-name" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Estate Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="estate-name"
              {...register("estateName")}
              placeholder="Enter estate name"
              className={`[font-family:'SF_Pro-Regular',Helvetica] text-sm ${
                errors.estateName ? "border-red-500" : ""
              }`}
              disabled={createCommunity.isPending}
            />
            {errors.estateName && (
              <p className="text-red-500 text-xs">{errors.estateName.message}</p>
            )}
          </div>

          {/* Country and State */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="country" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
                Country <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch("country")}
                onValueChange={(value) => setValue("country", value)}
                disabled={createCommunity.isPending}
              >
                <SelectTrigger className={`w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm ${
                  errors.country ? "border-red-500" : ""
                }`}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                  <SelectItem value="Ghana">Ghana</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-red-500 text-xs">{errors.country.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="state" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
                State <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch("state")}
                onValueChange={(value) => setValue("state", value)}
                disabled={createCommunity.isPending}
              >
                <SelectTrigger className={`w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm ${
                  errors.state ? "border-red-500" : ""
                }`}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lagos">Lagos</SelectItem>
                  <SelectItem value="Abuja">Abuja</SelectItem>
                  <SelectItem value="Rivers">Rivers</SelectItem>
                  <SelectItem value="Oyo">Oyo</SelectItem>
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-red-500 text-xs">{errors.state.message}</p>
              )}
            </div>
          </div>

          {/* LGA and Zip Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="lga" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
                LGA
              </Label>
              <Select
                value={watch("lga")}
                onValueChange={(value) => setValue("lga", value)}
                disabled={createCommunity.isPending}
              >
                <SelectTrigger className="w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm">
                  <SelectValue placeholder="Select LGA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ikeja">Ikeja</SelectItem>
                  <SelectItem value="Lekki">Lekki</SelectItem>
                  <SelectItem value="Victoria Island">Victoria Island</SelectItem>
                  <SelectItem value="Surulere">Surulere</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="zip-code" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
                Zip Code
              </Label>
              <Input
                id="zip-code"
                {...register("zipCode")}
                placeholder="Enter zip code"
                className="[font-family:'SF_Pro-Regular',Helvetica] text-sm"
                disabled={createCommunity.isPending}
              />
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="address" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Enter estate address"
              className={`[font-family:'SF_Pro-Regular',Helvetica] text-sm ${
                errors.address ? "border-red-500" : ""
              }`}
              disabled={createCommunity.isPending}
            />
            {errors.address && (
              <p className="text-red-500 text-xs">{errors.address.message}</p>
            )}
          </div>

          {/* Estate Logo */}
          <div className="flex flex-col gap-2">
            <Label className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Estate Logo <span className="text-red-500">*</span>
            </Label>
            {logoPreview ? (
              <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                  disabled={createCommunity.isPending}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors ${
                logoError ? "border-red-500" : "border-gray-300"
              } ${createCommunity.isPending ? "opacity-50 cursor-not-allowed" : ""}`}>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="[font-family:'SF_Pro-Regular',Helvetica] text-sm text-gray-500">
                  Click to upload logo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  disabled={createCommunity.isPending}
                />
              </label>
            )}
            {logoError && (
              <p className="text-red-500 text-xs">{logoError}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              className="flex-1 [font-family:'SF_Pro-Medium',Helvetica] text-sm"
              disabled={createCommunity.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white [font-family:'SF_Pro-Medium',Helvetica] text-sm"
              disabled={createCommunity.isPending}
            >
              {createCommunity.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Community"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function CommunitiesPage(): JSX.Element {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
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
            <h1 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.8px] leading-7 font-normal">
              Communities
            </h1>

            <div className="flex items-center gap-2">
              <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#acacbf] text-xs tracking-[-0.5px] leading-4 font-normal">
                Home
              </span>

              <img
                className="w-px h-3 object-cover"
                alt="Divider"
                src="/divider.svg"
              />

              <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.5px] leading-4">
                Communities
              </span>
            </div>
          </div>

          <Button onClick={() => setIsCreateDialogOpen(true)} className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors">
            <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
              Create Community
            </span>
          </Button>
        </div>

        {/* Main Content Card */}
        <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <CardContent className="flex flex-col items-start gap-4 p-6 flex-1">
            {/* Tabs and Filter */}
            <div className="flex items-center gap-6 w-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="inline-flex items-center gap-1 p-1 bg-[#f4f4f9] rounded-xl h-auto">
                  <TabsTrigger
                    value="all"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
                  >
                    All communities
                  </TabsTrigger>
                  <TabsTrigger
                    value="active"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
                  >
                    Active
                  </TabsTrigger>
                  <TabsTrigger
                    value="inactive"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
                  >
                    Inactive
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-100 rounded-lg transition-colors">
                <SlidersHorizontalIcon className="w-5 h-5 text-[#5b5b66]" />
              </Button>
            </div>

            {/* Conditional Rendering: Loading, Error, Empty State or Data Table */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <Loader2 className="w-10 h-10 text-[#1f1f3f] animate-spin" />
                <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6">
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

                  <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6 max-w-md">
                    Failed to load communities
                    <br />
                    Please try again or contact support if the problem persists
                  </p>
                </div>

                <Button onClick={() => refetch()} className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors">
                  <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
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

                  <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6 max-w-md">
                    No community has been created yet.
                    <br />
                    Click the button to create your first community
                  </p>
                </div>

                <Button onClick={() => setIsCreateDialogOpen(true)} className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors">
                  <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
                    Create Community
                  </span>
                </Button>
              </div>
            ) : (
              <CommunityDataTable
                data={communities}
                onEdit={handleEditCommunity}
                onDelete={handleDeleteCommunity}
                onRowClick={handleRowClick}
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
