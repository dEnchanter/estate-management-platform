"use client";

import React, { JSX, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, SlidersHorizontal, Loader2 } from "lucide-react";
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
import { AccessCodeDataTable } from "@/components/access-codes/access-code-data-table";
import {
  useActiveAccessCodes,
  useGenerateAccessCode,
  useCancelAccessCode,
  useValidateAccessCode,
  useGenerateBulkCodes,
} from "@/hooks/use-access-codes";
import { useCurrentUser } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { AccessCode } from "@/types/api.types";

// Zod schemas
const generateCodeSchema = z.object({
  codeCategory: z.string().min(1, "Category is required"),
  details: z.string().optional(),
});

const bulkCodesSchema = z.object({
  codeType: z.number().min(4).max(6),
  count: z.number().min(1).max(1000),
});

type GenerateCodeFormData = z.infer<typeof generateCodeSchema>;
type BulkCodesFormData = z.infer<typeof bulkCodesSchema>;

// Generate Access Code Dialog
interface GenerateCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const GenerateCodeDialog = ({ open, onOpenChange, onSuccess }: GenerateCodeDialogProps) => {
  const generateCode = useGenerateAccessCode();
  const { data: currentUser } = useCurrentUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<GenerateCodeFormData>({
    resolver: zodResolver(generateCodeSchema),
    defaultValues: {
      codeCategory: "",
      details: "",
    },
  });

  const onSubmit = async (data: GenerateCodeFormData) => {
    if (!currentUser?.id) {
      toast.error("User not found");
      return;
    }

    try {
      const response = await generateCode.mutateAsync({
        residentID: currentUser.id,
        codeCategory: data.codeCategory,
        details: data.details ? JSON.parse(data.details) : {},
      });

      toast.success("Access code generated!", {
        description: `Code: ${response.code}`,
      });

      onOpenChange(false);
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to generate code", {
        description: error.message || "Please try again",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-lg">
            Generate Access Code
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="category" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("codeCategory")}
              onValueChange={(value) => setValue("codeCategory", value)}
              disabled={generateCode.isPending}
            >
              <SelectTrigger className={`w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm ${
                errors.codeCategory ? "border-red-500" : ""
              }`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Visitor">Visitor</SelectItem>
                <SelectItem value="Service Provider">Service Provider</SelectItem>
                <SelectItem value="Delivery">Delivery</SelectItem>
                <SelectItem value="Guest">Guest</SelectItem>
              </SelectContent>
            </Select>
            {errors.codeCategory && (
              <p className="text-red-500 text-xs">{errors.codeCategory.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="details" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Details (JSON)
            </Label>
            <Input
              id="details"
              {...register("details")}
              placeholder='{"name": "John Doe"}'
              className="[font-family:'SF_Pro-Regular',Helvetica] text-sm"
              disabled={generateCode.isPending}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
              className="flex-1"
              disabled={generateCode.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white"
              disabled={generateCode.isPending}
            >
              {generateCode.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Request Bulk Codes Dialog
interface BulkCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const BulkCodesDialog = ({ open, onOpenChange, onSuccess }: BulkCodesDialogProps) => {
  const generateBulk = useGenerateBulkCodes();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BulkCodesFormData>({
    resolver: zodResolver(bulkCodesSchema),
    defaultValues: {
      codeType: 4,
      count: 100,
    },
  });

  const onSubmit = async (data: BulkCodesFormData) => {
    try {
      await generateBulk.mutateAsync({
        code_type: data.codeType,
        count: data.count,
      });

      toast.success("Bulk codes requested!", {
        description: `${data.count} ${data.codeType}-digit codes requested`,
      });

      onOpenChange(false);
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to request codes", {
        description: error.message || "Please try again",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-lg">
            Request Bulk Codes
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="codeType" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Code Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("codeType")?.toString()}
              onValueChange={(value) => setValue("codeType", parseInt(value))}
              disabled={generateBulk.isPending}
            >
              <SelectTrigger className="w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm">
                <SelectValue placeholder="Select code type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4-Digit</SelectItem>
                <SelectItem value="5">5-Digit</SelectItem>
                <SelectItem value="6">6-Digit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="count" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Count <span className="text-red-500">*</span>
            </Label>
            <Input
              id="count"
              type="number"
              {...register("count", { valueAsNumber: true })}
              placeholder="Enter number of codes"
              className={`[font-family:'SF_Pro-Regular',Helvetica] text-sm ${
                errors.count ? "border-red-500" : ""
              }`}
              disabled={generateBulk.isPending}
            />
            {errors.count && (
              <p className="text-red-500 text-xs">{errors.count.message}</p>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
              className="flex-1"
              disabled={generateBulk.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white"
              disabled={generateBulk.isPending}
            >
              {generateBulk.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Requesting...
                </span>
              ) : (
                "Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function AccessCodesPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState("active");
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  // Fetch active access codes
  const { data: apiAccessCodes, isLoading, isError, refetch } = useActiveAccessCodes();
  const cancelCode = useCancelAccessCode();
  const validateCode = useValidateAccessCode();

  // Transform and filter access codes based on active tab
  const accessCodes = useMemo(() => {
    if (!apiAccessCodes) return [];

    if (activeTab === "active") {
      return apiAccessCodes;
    } else if (activeTab === "4-digit") {
      return apiAccessCodes.filter(code => code.code?.length === 4);
    } else if (activeTab === "5-digit") {
      return apiAccessCodes.filter(code => code.code?.length === 5);
    } else if (activeTab === "6-digit") {
      return apiAccessCodes.filter(code => code.code?.length === 6);
    }

    return apiAccessCodes;
  }, [apiAccessCodes, activeTab]);

  // Calculate stats
  const totalCodes = apiAccessCodes?.length || 0;
  const fourDigitCodes = apiAccessCodes?.filter(code => code.code?.length === 4).length || 0;
  const fiveDigitCodes = apiAccessCodes?.filter(code => code.code?.length === 5).length || 0;
  const sixDigitCodes = apiAccessCodes?.filter(code => code.code?.length === 6).length || 0;

  const handleCancelCode = async (accessCode: AccessCode) => {
    try {
      await cancelCode.mutateAsync(accessCode.code);
      toast.success("Access code cancelled");
      refetch();
    } catch (error: any) {
      toast.error("Failed to cancel code", {
        description: error.message || "Please try again",
      });
    }
  };

  const handleValidateCode = async (accessCode: AccessCode) => {
    try {
      await validateCode.mutateAsync(accessCode.code);
      toast.success("Access code validated");
      refetch();
    } catch (error: any) {
      toast.error("Failed to validate code", {
        description: error.message || "Please try again",
      });
    }
  };

  return (
    <div className="p-4 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-4 px-2 py-2 w-full">
          <div className="flex flex-col items-start px-3 py-0 flex-1">
            <h1 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.8px] leading-7 font-normal">
              Access Codes
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
                Access Codes
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsGenerateDialogOpen(true)}
              variant="outline"
              className="h-auto rounded-lg px-4 py-2 transition-colors"
            >
              <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
                Generate Code
              </span>
            </Button>
            <Button
              onClick={() => setIsBulkDialogOpen(true)}
              className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors"
            >
              <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
                Request Bulk Codes
              </span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 w-full">
          {/* Total Access Codes */}
          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-5 flex flex-col gap-3">
              <p className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.3px] leading-4 uppercase">
                Total Access Codes
              </p>
              <div className="flex items-baseline gap-1">
                <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-[#242426] text-3xl tracking-[-1px] leading-8">
                  {totalCodes}
                </span>
                <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#acacbf] text-base">
                  / 0
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 4-Digit Codes */}
          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-5 flex flex-col gap-3">
              <p className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.3px] leading-4 uppercase">
                4-Digit Codes
              </p>
              <div className="flex items-baseline gap-1">
                <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-[#242426] text-3xl tracking-[-1px] leading-8">
                  {fourDigitCodes}
                </span>
                <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#acacbf] text-base">
                  / 0
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 5-Digit Codes */}
          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-5 flex flex-col gap-3">
              <p className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.3px] leading-4 uppercase">
                5-Digit Codes
              </p>
              <div className="flex items-baseline gap-1">
                <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-[#242426] text-3xl tracking-[-1px] leading-8">
                  {fiveDigitCodes}
                </span>
                <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#acacbf] text-base">
                  / 0
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 6-Digit Codes */}
          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-5 flex flex-col gap-3">
              <p className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.3px] leading-4 uppercase">
                6-Digit Codes
              </p>
              <div className="flex items-baseline gap-1">
                <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-[#242426] text-3xl tracking-[-1px] leading-8">
                  {sixDigitCodes}
                </span>
                <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#acacbf] text-base">
                  / 0
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <CardContent className="flex flex-col items-start gap-4 p-6 flex-1">
            {/* Tabs and Filter */}
            <div className="flex items-center gap-6 w-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="inline-flex items-center gap-1 p-1 bg-[#f4f4f9] rounded-xl h-auto">
                  <TabsTrigger
                    value="active"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
                  >
                    Active Access Codes
                  </TabsTrigger>
                  <TabsTrigger
                    value="4-digit"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
                  >
                    4-Digit
                  </TabsTrigger>
                  <TabsTrigger
                    value="5-digit"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
                  >
                    5-Digit
                  </TabsTrigger>
                  <TabsTrigger
                    value="6-digit"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
                  >
                    6-Digit
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-100 rounded-lg transition-colors">
                <SlidersHorizontal className="w-5 h-5 text-[#5b5b66]" />
              </Button>
            </div>

            {/* Conditional Rendering: Loading, Error, Empty State or Data Table */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <Loader2 className="w-10 h-10 text-[#1f1f3f] animate-spin" />
                <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6">
                  Loading access codes...
                </p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl">
                  <div className="bg-red-50 p-4 rounded-full">
                    <Key className="w-10 h-10 text-red-600" />
                  </div>

                  <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6 max-w-md">
                    Failed to load access codes
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
            ) : accessCodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl">
                  <div className="bg-[#f4f4f9] p-4 rounded-full">
                    <Key className="w-10 h-10 text-[#5b5b66]" />
                  </div>

                  <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6 max-w-md">
                    {activeTab === "active" ? "There are no access codes in the pool." : `No ${activeTab} codes available.`}
                    <br />
                    Click the button to generate or request codes.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsGenerateDialogOpen(true)}
                    variant="outline"
                    className="h-auto rounded-lg px-4 py-2 transition-colors"
                  >
                    <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
                      Generate Code
                    </span>
                  </Button>
                  <Button
                    onClick={() => setIsBulkDialogOpen(true)}
                    className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors"
                  >
                    <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
                      Request Bulk Codes
                    </span>
                  </Button>
                </div>
              </div>
            ) : (
              <AccessCodeDataTable
                data={accessCodes}
                onCancel={handleCancelCode}
                onValidate={handleValidateCode}
              />
            )}
          </CardContent>
        </Card>
      </section>

      <GenerateCodeDialog
        open={isGenerateDialogOpen}
        onOpenChange={setIsGenerateDialogOpen}
        onSuccess={() => refetch()}
      />

      <BulkCodesDialog
        open={isBulkDialogOpen}
        onOpenChange={setIsBulkDialogOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
