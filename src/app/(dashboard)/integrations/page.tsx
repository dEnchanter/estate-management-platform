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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IntegrationDataTable, IntegrationRow } from "@/components/integrations/integration-data-table";
import { useIntegrations, useCreateOrUpdateIntegration } from "@/hooks/use-integrations";

const integrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  method: z.string().min(1, "Method is required"),
  description: z.string().optional(),
});

type IntegrationFormData = z.infer<typeof integrationSchema>;

export default function IntegrationsPage(): JSX.Element {
  const [dialogState, setDialogState] = useState<{ open: boolean; editId?: string }>({ open: false });

  const { data: apiIntegrations, isLoading, isError, refetch } = useIntegrations();
  const createOrUpdate = useCreateOrUpdateIntegration();

  const integrations: IntegrationRow[] = (apiIntegrations || []).map((i) => ({
    id: i.id,
    name: i.name,
    method: i.method,
    description: i.description || "",
    isActive: i.isActive ?? false,
  }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IntegrationFormData>({ resolver: zodResolver(integrationSchema) });

  const handleOpenCreate = () => {
    reset({ name: "", method: "", description: "" });
    setDialogState({ open: true });
  };

  const handleCloseDialog = () => {
    setDialogState({ open: false });
    reset();
  };

  const onSubmit = async (data: IntegrationFormData) => {
    try {
      await createOrUpdate.mutateAsync({
        id: dialogState.editId,
        name: data.name,
        method: data.method,
        description: data.description,
      });
      toast.success(dialogState.editId ? "Integration updated" : "Integration created", {
        description: `${data.name} has been ${dialogState.editId ? "updated" : "added"}.`,
      });
      handleCloseDialog();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to save integration");
    }
  };

  const handleEditIntegration = (integration: IntegrationRow) => {
    reset({ name: integration.name, method: integration.method, description: integration.description });
    setDialogState({ open: true, editId: integration.id });
  };

  const handleDeleteIntegration = (_integration: IntegrationRow) => {
    // TODO: Wire to DELETE /config/integrations/:id when available
    toast.info("Delete functionality coming soon");
  };

  const isEdit = !!dialogState.editId;

  return (
    <div className="p-4 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-4 px-2 py-2 w-full">
          <div className="flex flex-col items-start px-3 py-0 flex-1">
            <h1 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.8px] leading-7 font-normal">
              Integrations
            </h1>
            <div className="flex items-center gap-2">
              <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#acacbf] text-xs tracking-[-0.5px] leading-4 font-normal">
                Home
              </span>
              <img className="w-px h-3 object-cover" alt="Divider" src="/divider.svg" />
              <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.5px] leading-4">
                All integrations
              </span>
            </div>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors"
          >
            <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
              Add Integration
            </span>
          </Button>
        </div>

        {/* Create / Edit Dialog */}
        <Dialog open={dialogState.open} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.8px]">
                {isEdit ? "Edit Integration" : "Add Integration"}
              </DialogTitle>
              <DialogDescription className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm tracking-[-0.5px]">
                {isEdit ? "Update the integration details." : "Fill in the details to add a new integration."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">Name</Label>
                  <Input
                    {...register("name")}
                    placeholder="Integration name"
                    className="[font-family:'SF_Pro-Regular',Helvetica] text-sm"
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">Method</Label>
                  <Input
                    {...register("method")}
                    placeholder="e.g. REST, SOAP, GraphQL"
                    className="[font-family:'SF_Pro-Regular',Helvetica] text-sm"
                  />
                  {errors.method && <p className="text-red-500 text-xs">{errors.method.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
                    Description (optional)
                  </Label>
                  <Textarea
                    {...register("description")}
                    placeholder="Brief description"
                    className="[font-family:'SF_Pro-Regular',Helvetica] text-sm resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={createOrUpdate.isPending}
                  className="rounded-lg text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createOrUpdate.isPending}
                  className="bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white text-sm rounded-lg"
                >
                  {createOrUpdate.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isEdit ? (
                    "Update"
                  ) : (
                    "Save Integration"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <CardContent className="flex flex-col items-start gap-4 p-6 flex-1 min-h-[600px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 flex-1 w-full py-16">
                <Loader2 className="w-10 h-10 text-[#1f1f3f] animate-spin" />
                <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-base tracking-[-0.5px]">
                  Loading integrations...
                </p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-4 flex-1 w-full py-16">
                <div className="bg-red-50 p-4 rounded-full">
                  <img className="w-10 h-10" alt="Error icon" src="/frame-4.svg" />
                </div>
                <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-base text-center tracking-[-0.5px] max-w-md">
                  Failed to load integrations. Please try again.
                </p>
                <Button onClick={() => refetch()} className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2">
                  <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm">Try Again</span>
                </Button>
              </div>
            ) : integrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 flex-1 w-full py-16">
                <div className="bg-[#f4f4f9] p-4 rounded-full">
                  <img className="w-10 h-10" alt="Integration icon" src="/frame-4.svg" />
                </div>
                <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-base text-center tracking-[-0.5px] max-w-md">
                  No integrations have been added yet.
                  <br />
                  Click the button to add your first integration.
                </p>
                <Button
                  onClick={handleOpenCreate}
                  className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2"
                >
                  <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm">
                    Add Integration
                  </span>
                </Button>
              </div>
            ) : (
              <IntegrationDataTable
                data={integrations}
                onEdit={handleEditIntegration}
                onDelete={handleDeleteIntegration}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
