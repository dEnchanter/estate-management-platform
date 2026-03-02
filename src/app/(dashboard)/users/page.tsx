"use client";

import { SlidersHorizontalIcon, Loader2 } from "lucide-react";
import React, { JSX, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserDataTable, User } from "@/components/users/user-data-table";
import { usePendingResidents, useCreateUserWithRole, useAdminRoles, useApproveResident, useCurrentUser, useRegister } from "@/hooks/use-auth";
import { useUsers, useUpdateUser, useDeleteUser } from "@/hooks/use-users";
import { useCommunityCategories } from "@/hooks/use-communities";
import { useCommunityStreets } from "@/hooks/use-streets";
import { isCommunityAdmin } from "@/lib/permissions";
import { GENDERS, USER_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ============================================================================
// APPROVE RESIDENT DIALOG
// ============================================================================

const approveResidentSchema = z.object({
  categoryID: z.string().min(1, "Category is required"),
});

type ApproveResidentFormData = z.infer<typeof approveResidentSchema>;

interface ApproveResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident: { id: string; name: string } | null;
}

const ApproveResidentDialog = ({ open, onOpenChange, resident }: ApproveResidentDialogProps) => {
  const approveResident = useApproveResident();
  const { data: categories, isLoading: categoriesLoading } = useCommunityCategories(undefined, open);

  const { handleSubmit, formState: { errors }, reset, setValue } = useForm<ApproveResidentFormData>({
    resolver: zodResolver(approveResidentSchema),
  });

  const handleClose = () => { reset(); onOpenChange(false); };

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
          <DialogTitle className="font-semibold text-[#242426] text-lg">
            Approve Resident
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          {resident && (
            <p className="text-[#5b5b66] text-sm">
              Approving <span className="font-semibold text-[#242426]">{resident.name}</span>. Select a category to assign.
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Label className="font-medium text-[#242426] text-sm">
              Resident Category <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(v) => setValue("categoryID", v)} disabled={categoriesLoading || approveResident.isPending}>
              <SelectTrigger className="w-full text-sm">
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
            <Button type="button" variant="outline" onClick={handleClose} disabled={approveResident.isPending} className="flex-1 font-medium text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={approveResident.isPending} className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white font-medium text-sm">
              {approveResident.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// EDIT USER DIALOG
// ============================================================================

const editUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
}

const EditUserDialog = ({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) => {
  const updateUser = useUpdateUser();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  useEffect(() => {
    if (user && open) {
      reset({ name: user.name, email: user.email, phone: user.username || "" });
    }
  }, [user, open, reset]);

  const handleClose = () => { reset(); onOpenChange(false); };

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return;
    try {
      await updateUser.mutateAsync({ id: user.id, name: data.name, email: data.email, phone: data.phone });
      toast.success("User updated successfully");
      onSuccess();
      handleClose();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to update user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-[#242426] text-lg">
            Edit User
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name" className="font-medium text-[#242426] text-sm">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-name"
              {...register("name")}
              placeholder="Enter full name"
              className={`text-sm ${errors.name ? "border-red-500" : ""}`}
              disabled={updateUser.isPending}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-email" className="font-medium text-[#242426] text-sm">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-email"
              type="email"
              {...register("email")}
              placeholder="Enter email address"
              className={`text-sm ${errors.email ? "border-red-500" : ""}`}
              disabled={updateUser.isPending}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-phone" className="font-medium text-[#242426] text-sm">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-phone"
              type="tel"
              {...register("phone")}
              placeholder="Enter phone number"
              className={`text-sm ${errors.phone ? "border-red-500" : ""}`}
              disabled={updateUser.isPending}
            />
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={updateUser.isPending} className="flex-1 font-medium text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={updateUser.isPending} className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white font-medium text-sm">
              {updateUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// REGISTER RESIDENT DIALOG
// ============================================================================

const registerResidentSchema = z.object({
  username: z.string().min(1, "Username is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  type: z.enum(["Resident", "Developer"] as const),
  gender: z.enum(["Male", "Female"] as const),
  street: z.string().min(1, "Street is required"),
  number: z.string().min(1, "House/unit number is required"),
  movedIn: z.string().min(1, "Move-in date is required"),
});

type RegisterResidentFormData = z.infer<typeof registerResidentSchema>;

interface RegisterResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityCode: string;
  communityName: string;
  onSuccess: () => void;
}

const RegisterResidentDialog = ({ open, onOpenChange, communityCode, communityName, onSuccess }: RegisterResidentDialogProps) => {
  const registerMutation = useRegister();
  const { data: streets, isLoading: streetsLoading } = useCommunityStreets(communityCode);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RegisterResidentFormData>({
    resolver: zodResolver(registerResidentSchema),
    defaultValues: { type: "Resident", gender: "Male" },
  });

  const handleClose = () => { reset(); onOpenChange(false); };

  const onSubmit = async (data: RegisterResidentFormData) => {
    try {
      await registerMutation.mutateAsync({
        username: data.username,
        name: data.name,
        email: data.email,
        phone: data.phone,
        myCommunityID: communityCode,
        street: data.street,
        number: data.number,
        type: data.type,
        gender: data.gender,
        movedIn: data.movedIn,
      });
      toast.success(`${data.name} registered successfully`, {
        description: "They will appear in Pending Approval once processed.",
      });
      onSuccess();
      handleClose();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to register resident");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-semibold text-[#242426] text-lg">
            Register Resident
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          {/* Community (read-only) */}
          <div className="flex flex-col gap-2">
            <Label className="font-medium text-[#242426] text-sm">Community</Label>
            <div className="px-3 py-2 bg-[#f4f4f9] rounded-md text-sm text-[#5b5b66]">
              {communityName || communityCode || "—"}
            </div>
          </div>

          {/* Username + Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-[#242426] text-sm">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("username")}
                placeholder="e.g. johndoe"
                className={`text-sm ${errors.username ? "border-red-500" : ""}`}
                disabled={registerMutation.isPending}
              />
              {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-[#242426] text-sm">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("name")}
                placeholder="John Doe"
                className={`text-sm ${errors.name ? "border-red-500" : ""}`}
                disabled={registerMutation.isPending}
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-[#242426] text-sm">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                {...register("email")}
                placeholder="john@email.com"
                className={`text-sm ${errors.email ? "border-red-500" : ""}`}
                disabled={registerMutation.isPending}
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-[#242426] text-sm">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                type="tel"
                {...register("phone")}
                placeholder="+234 801 234 5678"
                className={`text-sm ${errors.phone ? "border-red-500" : ""}`}
                disabled={registerMutation.isPending}
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Type + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-[#242426] text-sm">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch("type")}
                onValueChange={(v) => setValue("type", v as "Resident" | "Developer")}
                disabled={registerMutation.isPending}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={USER_TYPES.RESIDENT}>Resident</SelectItem>
                  <SelectItem value={USER_TYPES.DEVELOPER}>Developer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-[#242426] text-sm">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch("gender")}
                onValueChange={(v) => setValue("gender", v as "Male" | "Female")}
                disabled={registerMutation.isPending}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GENDERS.MALE}>Male</SelectItem>
                  <SelectItem value={GENDERS.FEMALE}>Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Street + House Number */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-[#242426] text-sm">
                Street <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(v) => setValue("street", v)}
                disabled={streetsLoading || registerMutation.isPending}
              >
                <SelectTrigger className={`w-full text-sm ${errors.street ? "border-red-500" : ""}`}>
                  <SelectValue placeholder={streetsLoading ? "Loading streets..." : "Select street"} />
                </SelectTrigger>
                <SelectContent>
                  {(streets || []).filter((s) => s.isActive).map((s) => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.street && <p className="text-red-500 text-xs">{errors.street.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-[#242426] text-sm">
                House/Unit No. <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("number")}
                placeholder="e.g. 12A"
                className={`text-sm ${errors.number ? "border-red-500" : ""}`}
                disabled={registerMutation.isPending}
              />
              {errors.number && <p className="text-red-500 text-xs">{errors.number.message}</p>}
            </div>
          </div>

          {/* Move-in Date */}
          <div className="flex flex-col gap-2">
            <Label className="font-medium text-[#242426] text-sm">
              Move-in Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              {...register("movedIn")}
              className={`text-sm ${errors.movedIn ? "border-red-500" : ""}`}
              disabled={registerMutation.isPending}
            />
            {errors.movedIn && <p className="text-red-500 text-xs">{errors.movedIn.message}</p>}
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={registerMutation.isPending} className="flex-1 font-medium text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={registerMutation.isPending} className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white font-medium text-sm">
              {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Register Resident"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// CREATE USER DIALOG
// ============================================================================

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  username: z.string().min(1, "Username is required"),
  roleName: z.string().min(1, "Role is required"),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateUserDialog = ({ open, onOpenChange, onSuccess }: CreateUserDialogProps) => {
  const createUser = useCreateUserWithRole();
  const { data: roles, isLoading: rolesLoading } = useAdminRoles();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", phone: "", username: "", roleName: "" },
  });

  const resetForm = () => reset();

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await createUser.mutateAsync({ name: data.name, email: data.email, phone: data.phone, username: data.username, roleName: data.roleName });
      toast.success("User created successfully!", { description: `${data.name} has been added with role: ${data.roleName}` });
      onOpenChange(false);
      resetForm();
      onSuccess();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Failed to create user", { description: err.message || "Please try again" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-[#242426] text-lg">
            Add New User
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-medium text-[#242426] text-sm">Full Name <span className="text-red-500">*</span></Label>
            <Input id="name" {...register("name")} placeholder="Enter full name" className={`text-sm ${errors.name ? "border-red-500" : ""}`} disabled={createUser.isPending} />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="font-medium text-[#242426] text-sm">Email Address <span className="text-red-500">*</span></Label>
            <Input id="email" type="email" {...register("email")} placeholder="Enter email address" className={`text-sm ${errors.email ? "border-red-500" : ""}`} disabled={createUser.isPending} />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="font-medium text-[#242426] text-sm">Phone Number <span className="text-red-500">*</span></Label>
            <Input id="phone" type="tel" {...register("phone")} placeholder="Enter phone number" className={`text-sm ${errors.phone ? "border-red-500" : ""}`} disabled={createUser.isPending} />
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="username" className="font-medium text-[#242426] text-sm">Username <span className="text-red-500">*</span></Label>
            <Input id="username" {...register("username")} placeholder="Enter username" className={`text-sm ${errors.username ? "border-red-500" : ""}`} disabled={createUser.isPending} />
            {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="role" className="font-medium text-[#242426] text-sm">Role <span className="text-red-500">*</span></Label>
            <Select value={watch("roleName")} onValueChange={(value) => setValue("roleName", value)} disabled={createUser.isPending || rolesLoading}>
              <SelectTrigger className={`w-full text-sm ${errors.roleName ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {rolesLoading ? (
                  <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                ) : roles?.roles && roles.roles.length > 0 ? (
                  roles.roles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)
                ) : (
                  <SelectItem value="no-roles" disabled>No roles available</SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.roleName && <p className="text-red-500 text-xs">{errors.roleName.message}</p>}
          </div>

          <div className="flex gap-3 mt-4">
            <Button type="button" variant="outline" onClick={() => { onOpenChange(false); resetForm(); }} className="flex-1 font-medium text-sm" disabled={createUser.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white font-medium text-sm" disabled={createUser.isPending}>
              {createUser.isPending ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Creating...</span> : "Add User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function UsersPage(): JSX.Element {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; resident: { id: string; name: string } | null }>({ open: false, resident: null });

  const { data: currentUser } = useCurrentUser();
  const canManageResidents = isCommunityAdmin(currentUser?.userType);
  const communityCode = currentUser?.communityCode || "";
  const communityName = currentUser?.communityName || "";

  // All users (Community Admin only)
  const { data: apiUsers, isLoading: usersLoading, isError: usersError, refetch: refetchUsers } = useUsers(undefined, canManageResidents);

  // Pending residents (Community Admin only)
  const { data: apiResidents, isLoading: pendingLoading, isError: pendingError, refetch: refetchPending } = usePendingResidents(canManageResidents);

  const deleteUserMutation = useDeleteUser();

  const allUsers: User[] = useMemo(() => {
    if (!apiUsers) return [];
    return apiUsers.map((u) => ({
      id: u.id || "",
      name: u.name || "",
      email: u.email || "",
      avatar: u.avatar,
      username: u.username || "",
      community: u.community || "N/A",
      userType: (u.profileType === "Developer" ? "Builder" : "Resident") as "Resident" | "Builder",
      category: u.role || "N/A",
    }));
  }, [apiUsers]);

  const pendingUsers: User[] = useMemo(() => {
    if (!apiResidents) return [];
    return apiResidents.map((resident) => ({
      id: resident.id || "",
      name: resident.name || "",
      email: resident.email || "",
      avatar: undefined,
      username: resident.username || "",
      community: resident.community || "N/A",
      userType: "Resident" as const,
      category: resident.role || "N/A",
    }));
  }, [apiResidents]);

  const handleRowClick = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.user) return;
    try {
      await deleteUserMutation.mutateAsync(deleteDialog.user.id);
      toast.success(`${deleteDialog.user.name} has been deleted`);
      setDeleteDialog({ open: false, user: null });
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to delete user");
      setDeleteDialog({ open: false, user: null });
    }
  };

  const isLoading = activeTab === "all" ? usersLoading : pendingLoading;
  const isError = activeTab === "all" ? usersError : pendingError;
  const currentData = activeTab === "all" ? allUsers : pendingUsers;
  const refetch = activeTab === "all" ? refetchUsers : refetchPending;

  return (
    <div className="p-4 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-4 px-2 py-2 w-full">
          <div className="flex flex-col items-start px-3 py-0 flex-1">
            <h1 className="font-semibold text-[#242426] text-xl tracking-[-0.8px] leading-7">
              Users
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[#acacbf] text-xs">Home</span>
              <img className="w-px h-3 object-cover" alt="Divider" src="/divider.svg" />
              <span className="font-medium text-[#5b5b66] text-xs">Users</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline" className="h-auto rounded-lg px-4 py-2 transition-colors border-[#1f1f3f]">
              <span className="font-medium text-[#1f1f3f] text-sm whitespace-nowrap">
                Add User
              </span>
            </Button>
            <Button onClick={() => setIsRegisterDialogOpen(true)} className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors">
              <span className="font-medium text-white text-sm whitespace-nowrap">
                Register Resident
              </span>
            </Button>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <CardContent className="flex flex-col items-start gap-4 p-6 flex-1">
            {/* Tabs and Filter */}
            <div className="flex items-center gap-6 w-full">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "pending")} className="flex-1">
                <TabsList className="inline-flex items-center gap-1 p-1 bg-[#f4f4f9] rounded-xl h-auto">
                  <TabsTrigger
                    value="all"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-[#5b5b66] text-sm transition-colors"
                  >
                    All Users
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-[#5b5b66] text-sm transition-colors"
                  >
                    Pending Approval
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-100 rounded-lg transition-colors">
                <SlidersHorizontalIcon className="w-5 h-5 text-[#5b5b66]" />
              </Button>
            </div>

            {/* Content */}
            {!canManageResidents ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <div className="bg-[#f4f4f9] p-4 rounded-full">
                  <img className="w-10 h-10" alt="Lock icon" src="/frame-4.svg" />
                </div>
                <p className="text-[#5b5b66] text-base text-center max-w-md">
                  Resident management is scoped to Community Admins.
                  <br />
                  Log in as a Community Admin to view and manage users.
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <Loader2 className="w-10 h-10 text-[#1f1f3f] animate-spin" />
                <p className="text-[#5b5b66] text-base text-center">
                  Loading users...
                </p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <div className="bg-red-50 p-4 rounded-full">
                  <img className="w-10 h-10" alt="Error icon" src="/frame-4.svg" />
                </div>
                <p className="text-[#5b5b66] text-base text-center max-w-md">
                  Failed to load users.
                  <br />
                  Please try again or contact support if the problem persists.
                </p>
                <Button onClick={() => refetch()} className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors">
                  <span className="font-medium text-white text-sm whitespace-nowrap">
                    Try Again
                  </span>
                </Button>
              </div>
            ) : currentData.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <div className="bg-[#f4f4f9] p-4 rounded-full">
                  <img className="w-10 h-10" alt="Empty icon" src="/frame-4.svg" />
                </div>
                <p className="text-[#5b5b66] text-base text-center max-w-md">
                  {activeTab === "all"
                    ? "No users found."
                    : "No pending residents at the moment. Residents awaiting approval will appear here."}
                </p>
              </div>
            ) : activeTab === "all" ? (
              <UserDataTable
                data={allUsers}
                onEdit={(user) => setEditDialog({ open: true, user })}
                onDelete={(user) => setDeleteDialog({ open: true, user })}
                onRowClick={handleRowClick}
              />
            ) : (
              <UserDataTable
                data={pendingUsers}
                editLabel="Approve"
                onEdit={(user) => setApproveDialog({ open: true, resident: { id: user.id, name: user.name } })}
                onRowClick={handleRowClick}
              />
            )}
          </CardContent>
        </Card>
      </section>

      {/* Dialogs */}
      <RegisterResidentDialog
        open={isRegisterDialogOpen}
        onOpenChange={setIsRegisterDialogOpen}
        communityCode={communityCode}
        communityName={communityName}
        onSuccess={() => refetchPending()}
      />

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => refetchUsers()}
      />

      <EditUserDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog((prev) => ({ ...prev, open }))}
        user={editDialog.user}
        onSuccess={() => refetchUsers()}
      />

      <ApproveResidentDialog
        open={approveDialog.open}
        onOpenChange={(open) => setApproveDialog((prev) => ({ ...prev, open }))}
        resident={approveDialog.resident}
      />

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-semibold text-[#242426] text-lg">
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#5b5b66] text-sm">
              Are you sure you want to delete <span className="font-semibold text-[#242426]">{deleteDialog.user?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-medium text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-medium text-sm"
            >
              {deleteUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
