"use client";

import { SlidersHorizontalIcon, Loader2 } from "lucide-react";
import React, { JSX, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserDataTable, User } from "@/components/users/user-data-table";
import { usePendingResidents, useCreateUserWithRole, useAdminRoles, useApproveResident, useCurrentUser } from "@/hooks/use-auth";
import { useCommunityCategories } from "@/hooks/use-communities";
import { isCommunityAdmin } from "@/lib/permissions";
import { toast } from "sonner";
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

// Zod schema for approve resident form
const approveResidentSchema = z.object({
  categoryID: z.string().min(1, "Category is required"),
});

type ApproveResidentFormData = z.infer<typeof approveResidentSchema>;

// Approve Resident Dialog Component
interface ApproveResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident: { id: string; name: string } | null;
}

const ApproveResidentDialog = ({ open, onOpenChange, resident }: ApproveResidentDialogProps) => {
  const approveResident = useApproveResident();
  const { data: categories, isLoading: categoriesLoading } = useCommunityCategories(undefined, open);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ApproveResidentFormData>({
    resolver: zodResolver(approveResidentSchema),
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: ApproveResidentFormData) => {
    if (!resident) return;
    try {
      await approveResident.mutateAsync({ residentID: resident.id, categoryID: data.categoryID });
      toast.success(`${resident.name} has been approved successfully`);
      handleClose();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to approve resident");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-lg">
            Approve Resident
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          {resident && (
            <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm">
              Approving <span className="font-semibold text-[#242426]">{resident.name}</span>. Select a category to assign.
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Label className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Resident Category <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(v) => setValue("categoryID", v)} disabled={categoriesLoading || approveResident.isPending}>
              <SelectTrigger className="w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm">
                <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
              </SelectTrigger>
              <SelectContent>
                {(categories || []).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryID && <p className="text-red-500 text-xs">{errors.categoryID.message}</p>}
          </div>
          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={approveResident.isPending}
              className="flex-1 [font-family:'SF_Pro-Medium',Helvetica] text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={approveResident.isPending}
              className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white [font-family:'SF_Pro-Medium',Helvetica] text-sm"
            >
              {approveResident.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Approve"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Zod schema for create user form
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  username: z.string().min(1, "Username is required"),
  roleName: z.string().min(1, "Role is required"),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

// Create User Dialog Component
interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateUserDialog = ({ open, onOpenChange, onSuccess }: CreateUserDialogProps) => {
  const createUser = useCreateUserWithRole();
  const { data: roles, isLoading: rolesLoading } = useAdminRoles();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      username: "",
      roleName: "",
    },
  });

  // Reset form
  const resetForm = () => {
    reset();
  };

  // Handle form submission
  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await createUser.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        username: data.username,
        roleName: data.roleName,
      });

      // Success
      toast.success("User created successfully!", {
        description: `${data.name} has been added with role: ${data.roleName}`,
      });

      // Close dialog and reset form
      onOpenChange(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error("Create user error:", error);
      toast.error("Failed to create user", {
        description: error.message || "Please try again",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-lg">
            Add New User
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter full name"
              className={`[font-family:'SF_Pro-Regular',Helvetica] text-sm ${
                errors.name ? "border-red-500" : ""
              }`}
              disabled={createUser.isPending}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email address"
              className={`[font-family:'SF_Pro-Regular',Helvetica] text-sm ${
                errors.email ? "border-red-500" : ""
              }`}
              disabled={createUser.isPending}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="Enter phone number"
              className={`[font-family:'SF_Pro-Regular',Helvetica] text-sm ${
                errors.phone ? "border-red-500" : ""
              }`}
              disabled={createUser.isPending}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs">{errors.phone.message}</p>
            )}
          </div>

          {/* Username */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="username" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Username <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="Enter username"
              className={`[font-family:'SF_Pro-Regular',Helvetica] text-sm ${
                errors.username ? "border-red-500" : ""
              }`}
              disabled={createUser.isPending}
            />
            {errors.username && (
              <p className="text-red-500 text-xs">{errors.username.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="role" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("roleName")}
              onValueChange={(value) => setValue("roleName", value)}
              disabled={createUser.isPending || rolesLoading}
            >
              <SelectTrigger className={`w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm ${
                errors.roleName ? "border-red-500" : ""
              }`}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {rolesLoading ? (
                  <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                ) : roles?.roles && roles.roles.length > 0 ? (
                  roles.roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-roles" disabled>No roles available</SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.roleName && (
              <p className="text-red-500 text-xs">{errors.roleName.message}</p>
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
              disabled={createUser.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white [font-family:'SF_Pro-Medium',Helvetica] text-sm"
              disabled={createUser.isPending}
            >
              {createUser.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Add User"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function UsersPage(): JSX.Element {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; resident: { id: string; name: string } | null }>({
    open: false,
    resident: null,
  });

  const { data: currentUser } = useCurrentUser();
  const canManageResidents = isCommunityAdmin(currentUser?.profileType);

  // Only fetch for Community Admins — these endpoints deny Super Admin
  const { data: apiResidents, isLoading, isError, refetch } = usePendingResidents(canManageResidents);

  // Transform API data to table format
  const users: User[] = useMemo(() => {
    if (!apiResidents) return [];

    return apiResidents.map((resident) => ({
      id: resident.id || "",
      name: resident.name || "",
      email: resident.email || "",
      avatar: undefined, // API doesn't provide avatar
      username: resident.username || "",
      community: resident.community || "N/A",
      userType: "Resident" as const,
      category: resident.role || "N/A",
    }));
  }, [apiResidents]);

  const handleRowClick = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  const handleEditUser = (user: User) => {
    setApproveDialog({ open: true, resident: { id: user.id, name: user.name } });
  };

  const handleDeleteUser = (user: User) => {
    // Handle delete logic here
    console.log("Delete user:", user);
    toast.info("Delete feature coming soon!");
    // TODO: Implement delete API call
  };

  const handleCreateSuccess = () => {
    // Refetch pending residents after creating a new user
    refetch();
  };

  return (
    <div className="p-4 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-4 px-2 py-2 w-full">
          <div className="flex flex-col items-start px-3 py-0 flex-1">
            <h1 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.8px] leading-7 font-normal">
              Users
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
                Users
              </span>
            </div>
          </div>

          <Button onClick={() => setIsCreateDialogOpen(true)} className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors">
            <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
              Add User
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
                    All users
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
            {!canManageResidents ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <div className="bg-[#f4f4f9] p-4 rounded-full">
                  <img className="w-10 h-10" alt="Lock icon" src="/frame-4.svg" />
                </div>
                <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6 max-w-md">
                  Resident management is scoped to Community Admins.
                  <br />
                  Log in as a Community Admin to view and approve residents.
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <Loader2 className="w-10 h-10 text-[#1f1f3f] animate-spin" />
                <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6">
                  Loading pending residents...
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
                    Failed to load pending residents
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
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl">
                  <div className="bg-[#f4f4f9] p-4 rounded-full">
                    <img
                      className="w-10 h-10"
                      alt="User icon"
                      src="/frame-4.svg"
                    />
                  </div>

                  <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6 max-w-md">
                    No pending residents at the moment.
                    <br />
                    Residents awaiting approval will appear here
                  </p>
                </div>
              </div>
            ) : (
              <UserDataTable
                data={users}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onRowClick={handleRowClick}
              />
            )}
          </CardContent>
        </Card>
      </section>

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <ApproveResidentDialog
        open={approveDialog.open}
        onOpenChange={(open) => setApproveDialog((prev) => ({ ...prev, open }))}
        resident={approveDialog.resident}
      />
    </div>
  );
}
