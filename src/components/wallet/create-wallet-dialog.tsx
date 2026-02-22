"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateWalletByProfile } from "@/hooks/use-wallets";

const createWalletSchema = z.object({
  name: z.string().min(1, "Wallet name is required"),
});

type CreateWalletFormData = z.infer<typeof createWalletSchema>;

interface CreateWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateWalletDialog = ({
  open,
  onOpenChange,
}: CreateWalletDialogProps) => {
  const createWallet = useCreateWalletByProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWalletFormData>({
    resolver: zodResolver(createWalletSchema),
  });

  const onSubmit = async (data: CreateWalletFormData) => {
    try {
      await createWallet.mutateAsync(data.name);
      toast.success("Wallet created successfully");
      reset();
      onOpenChange(false);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to create wallet");
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.8px] leading-7 font-normal">
            Create Wallet
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="name"
              className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#242426] text-sm tracking-[-0.3px] leading-5"
            >
              Wallet Name
            </Label>
            <Input
              id="name"
              type="text"
              {...register("name")}
              placeholder="Enter name of wallet"
              className="[font-family:'SF_Pro-Regular',Helvetica] text-[#242426] text-sm tracking-[-0.3px] leading-5"
            />
            {errors.name && (
              <p className="[font-family:'SF_Pro-Regular',Helvetica] text-red-500 text-xs tracking-[-0.3px]">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createWallet.isPending}
              className="h-auto border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2 transition-colors"
            >
              <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#242426] text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
                Cancel
              </span>
            </Button>
            <Button
              type="submit"
              disabled={createWallet.isPending}
              className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors"
            >
              {createWallet.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
                  Create Wallet
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
