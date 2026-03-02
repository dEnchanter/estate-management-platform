"use client";

import React, { JSX, useState } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PartnerDataTable, PartnerRow } from "@/components/partners/partner-data-table";
import { usePartners, useCreatePartner } from "@/hooks/use-partners";

const createPartnerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
});

type CreatePartnerFormData = z.infer<typeof createPartnerSchema>;

export default function PartnersPage(): JSX.Element {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: apiPartners, isLoading, isError, refetch } = usePartners();
  const createPartner = useCreatePartner();

  const partners: PartnerRow[] = (apiPartners || []).map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    phone: p.phone,
    username: p.username,
    walletBalance: p.wallet ? `₦${parseFloat(p.wallet.balance || "0").toLocaleString()}` : "—",
  }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePartnerFormData>({ resolver: zodResolver(createPartnerSchema) });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    reset();
  };

  const onSubmit = async (data: CreatePartnerFormData) => {
    try {
      await createPartner.mutateAsync({
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone,
        address: data.address ? { street: data.address } : undefined,
      });
      toast.success("Partner created successfully", {
        description: `${data.name} has been added as a partner.`,
      });
      handleCloseDialog();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to create partner");
    }
  };

  const handleEditPartner = (partner: PartnerRow) => {
    // TODO: Wire to PUT /partners/:id endpoint when available
    toast.info("Edit functionality coming soon");
  };

  const handleDeletePartner = (partner: PartnerRow) => {
    // TODO: Wire to DELETE /partners/:id endpoint when available
    toast.info("Delete functionality coming soon");
  };

  return (
    <div className="p-4 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-4 px-2 py-2 w-full">
          <div className="flex flex-col items-start px-3 py-0 flex-1">
            <h1 className="font-semibold text-[#242426] text-xl tracking-[-0.8px] leading-7">
              Partners
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[#acacbf] text-xs">
                Home
              </span>
              <img className="w-px h-3 object-cover" alt="Divider" src="/divider.svg" />
              <span className="font-medium text-[#5b5b66] text-xs">
                All partners
              </span>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors">
                <span className="font-medium text-white text-sm whitespace-nowrap">
                  Create Partner
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white">
              <DialogHeader>
                <DialogTitle className="font-semibold text-[#242426] text-xl">
                  Create New Partner
                </DialogTitle>
                <DialogDescription className="text-[#5b5b66] text-sm">
                  Fill in the details to create a new partner account.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label className="font-medium text-[#242426] text-sm">Name</Label>
                    <Input {...register("name")} placeholder="Enter partner name" className="text-sm" />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-medium text-[#242426] text-sm">Username</Label>
                    <Input {...register("username")} placeholder="@username" className="text-sm" />
                    {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-medium text-[#242426] text-sm">Email Address</Label>
                    <Input type="email" {...register("email")} placeholder="Enter email address" className="text-sm" />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-medium text-[#242426] text-sm">Phone Number</Label>
                    <Input type="tel" {...register("phone")} placeholder="Enter phone number" className="text-sm" />
                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-medium text-[#242426] text-sm">Address (optional)</Label>
                    <Input {...register("address")} placeholder="Enter address" className="text-sm" />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={createPartner.isPending} className="rounded-lg text-sm">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPartner.isPending} className="bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white text-sm rounded-lg">
                    {createPartner.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Partner"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <CardContent className="flex flex-col items-start gap-4 p-6 flex-1 min-h-[600px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 flex-1 w-full py-16">
                <Loader2 className="w-10 h-10 text-[#1f1f3f] animate-spin" />
                <p className="text-[#5b5b66] text-base">
                  Loading partners...
                </p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-4 flex-1 w-full py-16">
                <div className="bg-red-50 p-4 rounded-full">
                  <img className="w-10 h-10" alt="Error icon" src="/frame-4.svg" />
                </div>
                <p className="text-[#5b5b66] text-base text-center max-w-md">
                  Failed to load partners. Please try again.
                </p>
                <Button onClick={() => refetch()} className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2">
                  <span className="font-medium text-white text-sm">Try Again</span>
                </Button>
              </div>
            ) : partners.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 flex-1 w-full py-16">
                <div className="bg-[#f4f4f9] p-4 rounded-full">
                  <img className="w-10 h-10" alt="Partner icon" src="/frame-4.svg" />
                </div>
                <p className="text-[#5b5b66] text-base text-center max-w-md">
                  No partners have been created yet.
                  <br />
                  Click the button to create your first partner.
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2">
                  <span className="font-medium text-white text-sm">Create Partner</span>
                </Button>
              </div>
            ) : (
              <PartnerDataTable data={partners} onEdit={handleEditPartner} onDelete={handleDeletePartner} />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
