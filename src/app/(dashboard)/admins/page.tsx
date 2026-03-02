"use client";

import { SlidersHorizontalIcon, Loader2 } from "lucide-react";
import React, { JSX, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDataTable, Admin } from "@/components/admins/admin-data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateUserWithRole, useAdminRoles } from "@/hooks/use-auth";

const createAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(1, "Username is required"),
  phone: z.string().min(1, "Phone number is required"),
  roleName: z.string().min(1, "Role is required"),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

// TODO: Replace with GET /admins endpoint when available from backend
const mockAdmins: Admin[] = [
  {
    id: "00001A",
    name: "John Doe",
    email: "johndoe@email.com",
    avatar: "/avatar.svg",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001B",
    name: "Evans Femi",
    email: "evansfemi@email.com",
    initials: "EF",
    type: "Security",
    username: "@evansfemi",
    phone: "(234) 8034802679",
  },
];

export default function AdminsPage(): JSX.Element {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [admins] = useState<Admin[]>(mockAdmins);

  const createUserWithRole = useCreateUserWithRole();
  const { data: rolesData, isLoading: rolesLoading } = useAdminRoles();
  const roles = rolesData?.roles || [];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    reset();
  };

  const onSubmit = async (data: CreateAdminFormData) => {
    try {
      await createUserWithRole.mutateAsync({
        name: data.name,
        email: data.email,
        username: data.username,
        phone: data.phone,
        roleName: data.roleName,
      });
      toast.success("Admin created successfully", {
        description: `${data.name} has been added as ${data.roleName}.`,
      });
      handleCloseDialog();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to create admin");
    }
  };

  const handleEditAdmin = (admin: Admin) => {
    // TODO: Wire to PUT /admins/:id endpoint when available
    toast.info("Edit functionality coming soon");
  };

  const handleDeleteAdmin = (admin: Admin) => {
    // TODO: Wire to DELETE /admins/:id endpoint when available
    toast.info("Delete functionality coming soon");
  };

  return (
    <div className="p-4 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-4 px-2 py-2 w-full">
          <div className="flex flex-col items-start px-3 py-0 flex-1">
            <h1 className="font-semibold text-[#242426] text-xl tracking-[-0.8px] leading-7">
              Admins
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[#acacbf] text-xs">
                Home
              </span>
              <img className="w-px h-3 object-cover" alt="Divider" src="/divider.svg" />
              <span className="font-medium text-[#5b5b66] text-xs">
                All admins
              </span>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors">
                <span className="font-medium text-white text-sm whitespace-nowrap">
                  Create Admin
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white">
              <DialogHeader>
                <DialogTitle className="font-semibold text-[#242426] text-xl">
                  Create New Admin
                </DialogTitle>
                <DialogDescription className="text-[#5b5b66] text-sm">
                  Fill in the details to create a new admin account.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="font-medium text-[#242426] text-sm">
                      Name
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Enter admin name"
                      className="text-sm"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="font-medium text-[#242426] text-sm">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="Enter email address"
                      className="text-sm"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="roleName" className="font-medium text-[#242426] text-sm">
                      Role
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("roleName", value)}
                      disabled={rolesLoading}
                    >
                      <SelectTrigger className="w-full text-sm">
                        <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select role"} />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.roleName && (
                      <p className="text-red-500 text-xs">{errors.roleName.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="username" className="font-medium text-[#242426] text-sm">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      {...register("username")}
                      placeholder="@username"
                      className="text-sm"
                    />
                    {errors.username && (
                      <p className="text-red-500 text-xs">{errors.username.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="font-medium text-[#242426] text-sm">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone")}
                      placeholder="Enter phone number"
                      className="text-sm"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    disabled={createUserWithRole.isPending}
                    className="text-sm rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUserWithRole.isPending}
                    className="bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white text-sm rounded-lg"
                  >
                    {createUserWithRole.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save Admin"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content Card */}
        <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200">
          <CardContent className="flex flex-col items-start gap-4 p-6 min-h-[600px]">
            {/* Tabs and Filter */}
            <div className="flex items-center gap-6 w-full">
              <Tabs defaultValue="all" className="flex-1">
                <TabsList className="inline-flex items-center gap-1 p-1 bg-[#f4f4f9] rounded-xl h-auto">
                  <TabsTrigger
                    value="all"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-[#5b5b66] text-sm transition-colors"
                  >
                    All admins
                  </TabsTrigger>
                  <TabsTrigger
                    value="operations"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-[#5b5b66] text-sm transition-colors"
                  >
                    Operations
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-[#5b5b66] text-sm transition-colors"
                  >
                    Security
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-100 rounded-lg transition-colors">
                <SlidersHorizontalIcon className="w-5 h-5 text-[#5b5b66]" />
              </Button>
            </div>

            {/* TODO: Replace mockAdmins with GET /admins endpoint when available from backend */}
            {admins.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl">
                  <div className="bg-[#f4f4f9] p-4 rounded-full">
                    <img className="w-10 h-10" alt="Admin icon" src="/frame-4.svg" />
                  </div>
                  <p className="text-[#5b5b66] text-base text-center max-w-md">
                    No admin has been created yet.
                    <br />
                    Click the button to create your first admin
                  </p>
                </div>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors"
                >
                  <span className="font-medium text-white text-sm whitespace-nowrap">
                    Create Admin
                  </span>
                </Button>
              </div>
            ) : (
              <AdminDataTable
                data={admins}
                onEdit={handleEditAdmin}
                onDelete={handleDeleteAdmin}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
