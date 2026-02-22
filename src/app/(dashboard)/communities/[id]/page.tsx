"use client";

import { ChevronLeft, Plus, MoreVertical, Trash2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import React, { JSX, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Textarea } from "@/components/ui/textarea";
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
import { useCommunityQR, useCommunityCategories, useCreateCommunityCategory } from "@/hooks/use-communities";
import { useCommunityDues, useCreateDue, useDueCategories } from "@/hooks/use-dues";
import { useWallets } from "@/hooks/use-wallets";
import { useCommunityStreets, useCreateStreet, useToggleStreetStatus } from "@/hooks/use-streets";
import { useCreateAccessRule } from "@/hooks/use-access-codes";
import { DUE_TYPES, RECUR_TYPES } from "@/lib/constants";
import type {
  CommunityQRResponse,
  CommunityCategory,
  Due,
  CommunityStreet,
  Wallet,
} from "@/types/api.types";

// ============================================================================
// TYPES
// ============================================================================

interface AccessCodeItem {
  category: string;
  codeType: string;
  uses: number;
  expiryTime: string;
}

// TODO: Replace with GET /community/access-rules endpoint when available
const accessCodesData: AccessCodeItem[] = [
  { category: "Family", codeType: "4-Digit", uses: 5, expiryTime: "23:59:59" },
  { category: "Visitor", codeType: "5-Digit", uses: 3, expiryTime: "23:59:59" },
  { category: "One-time", codeType: "6-Digit", uses: 1, expiryTime: "23:59:59" },
];

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const addDueSchema = z.object({
  name: z.string().min(1, "Name is required"),
  due_type: z.string().min(1, "Due type is required"),
  amount: z.number().optional(),
  recur_type: z.string().optional(),
  resident_category: z.string().optional(),
  wallet: z.string().min(1, "Wallet is required"),
});

const addCategorySchema = z.object({
  category: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

const addStreetSchema = z.object({
  name: z.string().min(1, "Street name is required"),
});

const createRuleSchema = z.object({
  codeCategory: z.string().min(1, "Category is required"),
  codeType: z.number().min(4, "Code type is required"),
  usageNumber: z.number().min(1, "Usage number is required"),
  expirationType: z.string().min(1, "Expiration type is required"),
  expirationNumber: z.number().min(1, "Expiration number is required"),
});

type AddDueFormData = z.infer<typeof addDueSchema>;
type AddCategoryFormData = z.infer<typeof addCategorySchema>;
type AddStreetFormData = z.infer<typeof addStreetSchema>;
type CreateRuleFormData = z.infer<typeof createRuleSchema>;

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 3.33333H11.3333M2 3.33333H9.33333M2 3.33333V3.33333C2 4.06971 2.59695 4.66667 3.33333 4.66667V4.66667C4.06971 4.66667 4.66667 4.06971 4.66667 3.33333V3.33333M2 3.33333V3.33333C2 2.59695 2.59695 2 3.33333 2V2C4.06971 2 4.66667 2.59695 4.66667 3.33333V3.33333M4.66667 3.33333H9.33333M9.33333 3.33333V3.33333C9.33333 4.06971 9.93029 4.66667 10.6667 4.66667V4.66667C11.403 4.66667 12 4.06971 12 3.33333V3.33333M9.33333 3.33333V3.33333C9.33333 2.59695 9.93029 2 10.6667 2V2C11.403 2 12 2.59695 12 3.33333V3.33333M12 3.33333H11.3333M2 8H6M2 12.6667H4.66667M14 8H8M14 12.6667H6.66667" stroke="#5b5b66" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

const DeleteConfirmationDialog = ({ open, onOpenChange, onConfirm, title, description }: DeleteConfirmationDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-lg">
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm">
          {description}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="[font-family:'SF_Pro-Medium',Helvetica] text-sm">
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 text-white [font-family:'SF_Pro-Medium',Helvetica] text-sm"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

interface PageHeaderProps {
  communityName: string;
  communityId: string;
  onBack: () => void;
  onDelete: () => void;
}

const PageHeader = ({ communityName, communityId, onBack, onDelete }: PageHeaderProps) => (
  <div className="flex items-center gap-3 px-2 py-1.5 w-full">
    <div className="flex items-center gap-3 flex-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-gray-100 rounded-lg"
        onClick={onBack}
      >
        <ChevronLeft className="w-5 h-5 text-[#5b5b66]" />
      </Button>

      <div className="flex flex-col items-start">
        <h1 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.8px] leading-7 font-normal">
          {communityName}
        </h1>

        <div className="flex items-center gap-2">
          <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#acacbf] text-xs tracking-[-0.5px] leading-4 font-normal">
            Communities
          </span>
          <img className="w-px h-3 object-cover" alt="Divider" src="/divider.svg" />
          <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.5px] leading-4">
            #{communityId}
          </span>
        </div>
      </div>
    </div>

    <Button
      variant="ghost"
      onClick={onDelete}
      className="h-auto text-red-600 hover:bg-red-50 rounded-lg px-4 py-2 transition-all duration-200 group"
    >
      <Trash2 className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform duration-200" strokeWidth={2} />
      <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-sm tracking-[-0.3px] whitespace-nowrap">
        Delete
      </span>
    </Button>
  </div>
);

interface MetricsCardsProps {
  totalBalance: string;
  isLoadingBalance: boolean;
}

const MetricsCards = ({ totalBalance, isLoadingBalance }: MetricsCardsProps) => (
  <div className="grid grid-cols-2 gap-3">
    <Card className="bg-gradient-to-br from-white to-[#f9f9fb] border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-[#e6f7f7] p-2 rounded-lg">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 18.75C5.175 18.75 1.25 14.825 1.25 10C1.25 5.175 5.175 1.25 10 1.25C14.825 1.25 18.75 5.175 18.75 10C18.75 14.825 14.825 18.75 10 18.75ZM10 2.5C5.85 2.5 2.5 5.85 2.5 10C2.5 14.15 5.85 17.5 10 17.5C14.15 17.5 17.5 14.15 17.5 10C17.5 5.85 14.15 2.5 10 2.5Z" fill="#00cccc"/>
              <path d="M10 14.375C9.65625 14.375 9.375 14.0938 9.375 13.75V10C9.375 9.65625 9.65625 9.375 10 9.375C10.3438 9.375 10.625 9.65625 10.625 10V13.75C10.625 14.0938 10.3438 14.375 10 14.375Z" fill="#00cccc"/>
              <path d="M10 7.5C9.65625 7.5 9.375 7.21875 9.375 6.875C9.375 6.53125 9.65625 6.25 10 6.25C10.3438 6.25 10.625 6.53125 10.625 6.875C10.625 7.21875 10.3438 7.5 10 7.5Z" fill="#00cccc"/>
            </svg>
          </div>
          <p className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.3px] leading-4 uppercase">
            Total Balance
          </p>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-[#242426] text-3xl tracking-[-1px] leading-9">
            {isLoadingBalance ? "—" : `₦${totalBalance}`}
          </span>
        </div>
        <div className="flex items-center gap-1 pt-1 border-t border-gray-100">
          <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-xs">
            Community wallet balance
          </span>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-white to-[#f9f9fb] border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-[#e6f0ff] p-2 rounded-lg">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 7.5V5.625C17.5 3.75 16.875 2.5 14.375 2.5H5.625C3.125 2.5 2.5 3.75 2.5 5.625V7.5C2.5 9.375 3.125 10.625 5.625 10.625H14.375C16.875 10.625 17.5 9.375 17.5 7.5Z" stroke="#0066ff" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.5 14.375V12.5C17.5 11.5625 17.3125 10.9375 16.875 10.5C16.4375 10.0625 15.8125 9.875 14.875 9.875H5.125C4.1875 9.875 3.5625 10.0625 3.125 10.5C2.6875 10.9375 2.5 11.5625 2.5 12.5V14.375C2.5 16.875 3.125 17.5 5.625 17.5H14.375C16.875 17.5 17.5 16.875 17.5 14.375Z" stroke="#0066ff" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.3px] leading-4 uppercase">
            Total Revenue
          </p>
        </div>
        <div className="flex items-baseline gap-1">
          {/* TODO: Wire to revenue endpoint when available */}
          <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-[#242426] text-3xl tracking-[-1px] leading-9">
            —
          </span>
        </div>
        <div className="flex items-center gap-1 pt-1 border-t border-gray-100">
          <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-xs">
            All-time revenue generated
          </span>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ============================================================================
// COLLECTIONS TAB
// ============================================================================

interface CollectionsTabProps {
  data: Due[];
  isLoading: boolean;
  onAddDues: () => void;
  onDeleteItem: (item: Due) => void;
}

const CollectionsTab = ({ data, isLoading, onAddDues, onDeleteItem }: CollectionsTabProps) => (
  <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-base tracking-[-0.5px] leading-6">
            Collections
          </h2>
          <Button variant="ghost" size="icon" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-lg">
            <FilterIcon />
          </Button>
        </div>
        <Button
          onClick={onAddDues}
          className="h-auto bg-gradient-to-r from-[#1f1f3f] to-[#2a2a4a] hover:from-[#2a2a4a] hover:to-[#1f1f3f] text-white rounded-lg px-5 py-2.5 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
          <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-sm tracking-[-0.3px]">
            Add Dues
          </span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[#1f1f3f] animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm text-center">
            No dues have been created yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="grid grid-cols-[100px_1fr_160px_140px_80px] gap-4 px-4 py-3 bg-[#f0f0f5] rounded-t-lg">
            {["ID", "Name", "Due type", "Amount", "Actions"].map((h, i) => (
              <span key={h} className={`[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider${i === 4 ? " text-right" : ""}`}>
                {h}
              </span>
            ))}
          </div>

          <ScrollArea className="w-full max-h-[400px]">
            <div className="flex flex-col">
              {data.map((item, index) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-[100px_1fr_160px_140px_80px] gap-4 px-4 py-3.5 ${
                    index % 2 === 0 ? "bg-white" : "bg-[#f9f9fb]"
                  } hover:bg-gray-100 transition-colors`}
                >
                  <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#242426] text-sm flex items-center truncate">
                    {item.id.slice(0, 6)}
                  </span>
                  <span className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm flex items-center">
                    {item.name}
                  </span>
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className={`w-fit h-6 px-2.5 rounded-md border ${
                        item.due_type === "Service Charge"
                          ? "bg-[#e6f7f7] text-[#00a8a8] border-[#00cccc]/30"
                          : item.due_type === "Recurring"
                          ? "bg-[#e6f0ff] text-[#0052cc] border-[#0066ff]/30"
                          : "bg-[#fff4e6] text-[#cc7a00] border-[#ff9900]/30"
                      }`}
                    >
                      <span className="[font-family:'SF_Pro-Medium',Helvetica] text-xs">
                        {item.due_type}
                      </span>
                    </Badge>
                  </div>
                  <span className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-sm flex items-center">
                    {item.amount != null ? `₦${item.amount.toLocaleString()}` : "—"}
                  </span>
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-gray-200 rounded-md">
                          <MoreVertical className="w-4 h-4 text-[#5b5b66]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 bg-white">
                        <DropdownMenuItem
                          onClick={() => onDeleteItem(item)}
                          className="cursor-pointer text-red-600 focus:text-red-600 [font-family:'SF_Pro-Regular',Helvetica] text-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </CardContent>
  </Card>
);

// ============================================================================
// ACCESS CODES TAB
// ============================================================================

interface AccessCodesTabProps {
  data: AccessCodeItem[];
  onCreateRule: () => void;
  onDeleteItem: (item: AccessCodeItem) => void;
}

const AccessCodesTab = ({ data, onCreateRule, onDeleteItem }: AccessCodesTabProps) => (
  <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-base tracking-[-0.5px] leading-6">
            Access Codes
          </h2>
          <Button variant="ghost" size="icon" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-lg">
            <FilterIcon />
          </Button>
        </div>
        <Button
          onClick={onCreateRule}
          className="h-auto bg-gradient-to-r from-[#1f1f3f] to-[#2a2a4a] hover:from-[#2a2a4a] hover:to-[#1f1f3f] text-white rounded-lg px-5 py-2.5 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
          <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-sm tracking-[-0.3px]">
            Create Rule
          </span>
        </Button>
      </div>

      {/* TODO: Replace with GET /community/access-rules endpoint when available */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_100px_140px_80px] gap-4 px-4 py-3 bg-[#f0f0f5] rounded-t-lg">
          {["Category", "Code type", "Uses", "Expiry time", "Actions"].map((h, i) => (
            <span key={h} className={`[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider${i === 4 ? " text-right" : ""}`}>
              {h}
            </span>
          ))}
        </div>

        <ScrollArea className="w-full max-h-[400px]">
          <div className="flex flex-col">
            {data.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-[1fr_140px_100px_140px_80px] gap-4 px-4 py-3.5 ${
                  index % 2 === 0 ? "bg-white" : "bg-[#f9f9fb]"
                } hover:bg-gray-100 transition-colors`}
              >
                <span className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm flex items-center">
                  {item.category}
                </span>
                <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#242426] text-sm flex items-center">
                  {item.codeType}
                </span>
                <span className="[font-family:'SF_Pro-Semibold',Helvetica] text-sm flex items-center text-[#242426]">
                  {item.uses}
                </span>
                <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#242426] text-sm flex items-center">
                  {item.expiryTime}
                </span>
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-gray-200 rounded-md">
                        <MoreVertical className="w-4 h-4 text-[#5b5b66]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 bg-white">
                      <DropdownMenuItem
                        onClick={() => onDeleteItem(item)}
                        className="cursor-pointer text-red-600 focus:text-red-600 [font-family:'SF_Pro-Regular',Helvetica] text-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// RESIDENT CATEGORIES TAB
// ============================================================================

interface ResidentCategoriesTabProps {
  data: CommunityCategory[];
  isLoading: boolean;
  onAddCategory: () => void;
  onDeleteItem: (item: CommunityCategory) => void;
}

const ResidentCategoriesTab = ({ data, isLoading, onAddCategory, onDeleteItem }: ResidentCategoriesTabProps) => (
  <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-base tracking-[-0.5px] leading-6">
            Resident Categories
          </h2>
          <Button variant="ghost" size="icon" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-lg">
            <FilterIcon />
          </Button>
        </div>
        <Button
          onClick={onAddCategory}
          className="h-auto bg-gradient-to-r from-[#1f1f3f] to-[#2a2a4a] hover:from-[#2a2a4a] hover:to-[#1f1f3f] text-white rounded-lg px-5 py-2.5 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
          <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-sm tracking-[-0.3px]">
            Add Category
          </span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[#1f1f3f] animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm text-center">
            No categories have been created yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="grid grid-cols-[160px_1fr_80px] gap-4 px-4 py-3 bg-[#f0f0f5] rounded-t-lg">
            {["Name", "Description", "Actions"].map((h, i) => (
              <span key={h} className={`[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider${i === 2 ? " text-right" : ""}`}>
                {h}
              </span>
            ))}
          </div>

          <ScrollArea className="w-full max-h-[400px]">
            <div className="flex flex-col">
              {data.map((item, index) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-[160px_1fr_80px] gap-4 px-4 py-3.5 ${
                    index % 2 === 0 ? "bg-white" : "bg-[#f9f9fb]"
                  } hover:bg-gray-100 transition-colors`}
                >
                  <span className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm flex items-center">
                    {item.category}
                  </span>
                  <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm flex items-center truncate">
                    {item.description || "—"}
                  </span>
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-gray-200 rounded-md">
                          <MoreVertical className="w-4 h-4 text-[#5b5b66]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 bg-white">
                        <DropdownMenuItem
                          onClick={() => onDeleteItem(item)}
                          className="cursor-pointer text-red-600 focus:text-red-600 [font-family:'SF_Pro-Regular',Helvetica] text-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </CardContent>
  </Card>
);

// ============================================================================
// STREETS TAB
// ============================================================================

interface StreetsTabProps {
  data: CommunityStreet[];
  isLoading: boolean;
  onAddStreet: () => void;
  onToggleStatus: (street: CommunityStreet) => void;
}

const StreetsTab = ({ data, isLoading, onAddStreet, onToggleStatus }: StreetsTabProps) => (
  <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-base tracking-[-0.5px] leading-6">
            Streets
          </h2>
        </div>
        <Button
          onClick={onAddStreet}
          className="h-auto bg-gradient-to-r from-[#1f1f3f] to-[#2a2a4a] hover:from-[#2a2a4a] hover:to-[#1f1f3f] text-white rounded-lg px-5 py-2.5 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
          <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-sm tracking-[-0.3px]">
            Add Street
          </span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[#1f1f3f] animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm text-center">
            No streets have been added yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_100px] gap-4 px-4 py-3 bg-[#f0f0f5] rounded-t-lg">
            {["Street Name", "Status", "Actions"].map((h, i) => (
              <span key={h} className={`[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider${i === 2 ? " text-right" : ""}`}>
                {h}
              </span>
            ))}
          </div>

          <ScrollArea className="w-full max-h-[400px]">
            <div className="flex flex-col">
              {data.map((street, index) => (
                <div
                  key={street.id}
                  className={`grid grid-cols-[1fr_120px_100px] gap-4 px-4 py-3.5 ${
                    index % 2 === 0 ? "bg-white" : "bg-[#f9f9fb]"
                  } hover:bg-gray-100 transition-colors`}
                >
                  <span className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm flex items-center">
                    {street.name}
                  </span>
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className={`w-fit h-6 px-2.5 rounded-md border ${
                        street.isActive
                          ? "bg-[#e6f7ef] text-[#00a854] border-[#00cc66]/30"
                          : "bg-[#f9f9fb] text-[#5b5b66] border-gray-200"
                      }`}
                    >
                      <span className="[font-family:'SF_Pro-Medium',Helvetica] text-xs">
                        {street.isActive ? "Active" : "Inactive"}
                      </span>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 hover:bg-gray-200 rounded-md"
                      onClick={() => onToggleStatus(street)}
                      title={street.isActive ? "Deactivate" : "Activate"}
                    >
                      {street.isActive ? (
                        <ToggleRight className="w-5 h-5 text-[#00cc66]" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-[#5b5b66]" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </CardContent>
  </Card>
);

// ============================================================================
// COMMUNITY INFO CARD
// ============================================================================

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  small?: boolean;
}

const InfoRow = ({ label, value, highlight = false, small = false }: InfoRowProps) => (
  <div className="flex items-center justify-between group hover:bg-[#f9f9fb] px-3 py-1.5 rounded-lg transition-colors -mx-3">
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 ${highlight ? "bg-[#e6f7f7]" : "bg-[#f4f4f9]"} rounded-md flex items-center justify-center transition-colors`}>
        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
      </div>
      <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm">
        {label}
      </span>
    </div>
    <span className={`[font-family:'SF_Pro-${small ? "Medium" : "Semibold"}',Helvetica] ${small ? "font-medium" : "font-semibold"} ${highlight ? "text-[#00cccc]" : "text-[#242426]"} text-${small ? "xs" : "sm"}`}>
      {value}
    </span>
  </div>
);

interface CommunityInfoCardProps {
  qrData: CommunityQRResponse | undefined;
  isLoading: boolean;
  communityId: string;
}

const CommunityInfoCard = ({ qrData, isLoading, communityId }: CommunityInfoCardProps) => (
  <Card className="border border-gray-200 rounded-xl h-fit sticky top-4 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
    <div className="relative w-full h-[205px] bg-gradient-to-br from-[#00cccc] to-[#00a0a0] overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        {isLoading ? (
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        ) : qrData?.logoUrl ? (
          <img
            src={qrData.logoUrl}
            alt={qrData.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-xl"
          />
        ) : (
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 8L8 14V24H14V18H18V24H24V14L16 8Z" fill="white"/>
            </svg>
          </div>
        )}
      </div>

      {qrData && (
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1.5">
            <div className="w-2 h-2 bg-[#00cc66] rounded-full animate-pulse"></div>
            <span className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-xs">
              Active
            </span>
          </div>
        </div>
      )}
    </div>

    <CardContent className="p-5 flex flex-col gap-4 bg-white">
      <div className="flex flex-col gap-1">
        <h3 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.6px] leading-6">
          {isLoading ? "Loading..." : (qrData?.name || "—")}
        </h3>
        <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-xs">
          Community Profile
        </p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      <div className="flex flex-col gap-2.5">
        <InfoRow label="Estate ID" value={qrData?.myCommunityID ? `#${qrData.myCommunityID}` : `#${communityId}`} />
        <InfoRow label="Country" value={qrData?.address?.country || "—"} />
        <InfoRow label="State" value={qrData?.address?.state || "—"} />
        <InfoRow label="LGA" value={qrData?.address?.lga || "—"} />
        <InfoRow label="ZIP Code" value={qrData?.address?.zipCode || "—"} />
        <InfoRow label="Address" value={qrData?.address?.street || qrData?.address?.city || "—"} />

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-1"></div>

        {/* TODO: Admin and created date not in QR response — wire when GET /community/:id returns admin info */}
        <InfoRow label="Admin" value="—" highlight />
        <InfoRow label="Created on" value="—" small />

        {qrData?.qrCode && (
          <div className="mt-2 flex flex-col items-center gap-2">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full"></div>
            <p className="[font-family:'SF_Pro-Medium',Helvetica] text-[#5b5b66] text-xs">Community QR Code</p>
            <img
              src={`data:image/png;base64,${qrData.qrCode}`}
              alt="Community QR Code"
              className="w-32 h-32 rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// DIALOGS
// ============================================================================

interface AddDuesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CommunityCategory[];
  wallets: Wallet[];
}

const AddDuesDialog = ({ open, onOpenChange, categories, wallets }: AddDuesDialogProps) => {
  const createDue = useCreateDue();
  const { data: dueCategories } = useDueCategories();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddDueFormData>({ resolver: zodResolver(addDueSchema) });

  const dueType = watch("due_type");

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: AddDueFormData) => {
    try {
      await createDue.mutateAsync({
        name: data.name,
        due_type: data.due_type,
        amount: data.amount,
        recur_type: data.recur_type,
        resident_category: data.resident_category,
        wallet: data.wallet,
      });
      toast.success("Due created successfully");
      handleClose();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to create due");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-lg">
            Add Dues
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="due-name" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Name
            </Label>
            <Input
              id="due-name"
              {...register("name")}
              placeholder="Enter due name"
              className="[font-family:'SF_Pro-Regular',Helvetica] text-sm"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Due Type
            </Label>
            <Select onValueChange={(v) => setValue("due_type", v)}>
              <SelectTrigger className="w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm">
                <SelectValue placeholder="Select due type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DUE_TYPES).map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.due_type && <p className="text-red-500 text-xs">{errors.due_type.message}</p>}
          </div>

          {dueType === DUE_TYPES.RECURRING && (
            <div className="flex flex-col gap-2">
              <Label className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
                Recurrence
              </Label>
              <Select onValueChange={(v) => setValue("recur_type", v)}>
                <SelectTrigger className="w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm">
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(RECUR_TYPES).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              {...register("amount", { valueAsNumber: true })}
              placeholder="Enter amount"
              className="[font-family:'SF_Pro-Regular',Helvetica] text-sm"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
                Resident Category (optional)
              </Label>
              <Select onValueChange={(v) => setValue("resident_category", v)}>
                <SelectTrigger className="w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Wallet
            </Label>
            <Select onValueChange={(v) => setValue("wallet", v)}>
              <SelectTrigger className="w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm">
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name} — ₦{parseFloat(w.balance || "0").toLocaleString()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.wallet && <p className="text-red-500 text-xs">{errors.wallet.message}</p>}
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createDue.isPending}
              className="flex-1 [font-family:'SF_Pro-Medium',Helvetica] text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createDue.isPending}
              className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white [font-family:'SF_Pro-Medium',Helvetica] text-sm"
            >
              {createDue.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Dues"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddCategoryDialog = ({ open, onOpenChange }: AddCategoryDialogProps) => {
  const createCategory = useCreateCommunityCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCategoryFormData>({ resolver: zodResolver(addCategorySchema) });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: AddCategoryFormData) => {
    try {
      await createCategory.mutateAsync({ category: data.category, description: data.description });
      toast.success("Category created successfully");
      handleClose();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to create category");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-lg">
            Add Category
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="category-name" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Name
            </Label>
            <Input
              id="category-name"
              {...register("category")}
              placeholder="Enter category name"
              className="[font-family:'SF_Pro-Regular',Helvetica] text-sm"
            />
            {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category-description" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Description (optional)
            </Label>
            <Textarea
              id="category-description"
              {...register("description")}
              placeholder="Enter category description"
              className="[font-family:'SF_Pro-Regular',Helvetica] text-sm min-h-[100px]"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createCategory.isPending}
              className="flex-1 [font-family:'SF_Pro-Medium',Helvetica] text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCategory.isPending}
              className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white [font-family:'SF_Pro-Medium',Helvetica] text-sm"
            >
              {createCategory.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface AddStreetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityCode: string;
}

const AddStreetDialog = ({ open, onOpenChange, communityCode }: AddStreetDialogProps) => {
  const createStreet = useCreateStreet();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddStreetFormData>({ resolver: zodResolver(addStreetSchema) });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: AddStreetFormData) => {
    try {
      await createStreet.mutateAsync({ name: data.name, communityCode });
      toast.success("Street added successfully");
      handleClose();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to add street");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-lg">
            Add Street
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="street-name" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Street Name
            </Label>
            <Input
              id="street-name"
              {...register("name")}
              placeholder="Enter street name"
              className="[font-family:'SF_Pro-Regular',Helvetica] text-sm"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createStreet.isPending}
              className="flex-1 [font-family:'SF_Pro-Medium',Helvetica] text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createStreet.isPending}
              className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white [font-family:'SF_Pro-Medium',Helvetica] text-sm"
            >
              {createStreet.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Street"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface CreateRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityCode: string;
}

const CreateRuleDialog = ({ open, onOpenChange, communityCode }: CreateRuleDialogProps) => {
  const createRule = useCreateAccessRule();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateRuleFormData>({ resolver: zodResolver(createRuleSchema) });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: CreateRuleFormData) => {
    try {
      await createRule.mutateAsync({
        myCommunityID: communityCode,
        codeCategory: data.codeCategory,
        codeType: data.codeType,
        usageNumber: data.usageNumber,
        expirationType: data.expirationType,
        expirationNumber: data.expirationNumber,
      });
      toast.success("Access rule created successfully");
      handleClose();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to create access rule");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-lg">
            Create Access Rule
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="code-category" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Code Category
            </Label>
            <Input
              id="code-category"
              {...register("codeCategory")}
              placeholder="e.g. Family, Visitor, One-time"
              className="[font-family:'SF_Pro-Regular',Helvetica] text-sm"
            />
            {errors.codeCategory && <p className="text-red-500 text-xs">{errors.codeCategory.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Code Type (digits)
            </Label>
            <Select onValueChange={(v) => setValue("codeType", Number(v))}>
              <SelectTrigger className="w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm">
                <SelectValue placeholder="Select code type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4-Digit</SelectItem>
                <SelectItem value="5">5-Digit</SelectItem>
                <SelectItem value="6">6-Digit</SelectItem>
              </SelectContent>
            </Select>
            {errors.codeType && <p className="text-red-500 text-xs">{errors.codeType.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="usage-number" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Number of Uses
            </Label>
            <Input
              id="usage-number"
              type="number"
              {...register("usageNumber", { valueAsNumber: true })}
              placeholder="e.g. 5"
              className="[font-family:'SF_Pro-Regular',Helvetica] text-sm"
            />
            {errors.usageNumber && <p className="text-red-500 text-xs">{errors.usageNumber.message}</p>}
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-2 flex-1">
              <Label className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
                Expiry Type
              </Label>
              <Select onValueChange={(v) => setValue("expirationType", v)}>
                <SelectTrigger className="w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                </SelectContent>
              </Select>
              {errors.expirationType && <p className="text-red-500 text-xs">{errors.expirationType.message}</p>}
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="expiration-number" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
                Duration
              </Label>
              <Input
                id="expiration-number"
                type="number"
                {...register("expirationNumber", { valueAsNumber: true })}
                placeholder="e.g. 24"
                className="[font-family:'SF_Pro-Regular',Helvetica] text-sm"
              />
              {errors.expirationNumber && <p className="text-red-500 text-xs">{errors.expirationNumber.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createRule.isPending}
              className="flex-1 [font-family:'SF_Pro-Medium',Helvetica] text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRule.isPending}
              className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white [font-family:'SF_Pro-Medium',Helvetica] text-sm"
            >
              {createRule.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Rule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CommunityDetailsPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isAddDuesDialogOpen, setIsAddDuesDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isAddStreetDialogOpen, setIsAddStreetDialogOpen] = useState(false);
  const [isCreateRuleDialogOpen, setIsCreateRuleDialogOpen] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  // Data hooks
  const { data: qrData, isLoading: qrLoading } = useCommunityQR(id);
  const { data: dues, isLoading: duesLoading } = useCommunityDues();
  const { data: categories, isLoading: categoriesLoading } = useCommunityCategories(id);
  const { data: wallets, isLoading: walletsLoading } = useWallets();
  const communityCode = qrData?.myCommunityID || "";
  const { data: streets, isLoading: streetsLoading } = useCommunityStreets(communityCode);
  const toggleStreetStatus = useToggleStreetStatus();

  const communityName = qrData?.name || "Community Details";
  const communityId = qrData?.myCommunityID || id;
  const totalBalance = (wallets || [])
    .reduce((sum, w) => sum + parseFloat(w.balance || "0"), 0)
    .toLocaleString();

  const handleDeleteCommunity = () => {
    setDeleteConfirmation({
      open: true,
      title: "Delete Community",
      description: "Are you sure you want to delete this community? This action cannot be undone.",
      onConfirm: () => {
        // TODO: Wire to DELETE /community/:id endpoint when available
        console.log("Deleting community:", id);
        setDeleteConfirmation((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleDeleteDue = (item: Due) => {
    setDeleteConfirmation({
      open: true,
      title: "Delete Due",
      description: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      onConfirm: () => {
        // TODO: Wire to DELETE /community/dues/:id endpoint when available
        console.log("Deleting due:", item.id);
        setDeleteConfirmation((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleDeleteAccessCode = (item: AccessCodeItem) => {
    setDeleteConfirmation({
      open: true,
      title: "Delete Access Rule",
      description: `Are you sure you want to delete the rule for "${item.category}"? This action cannot be undone.`,
      onConfirm: () => {
        // TODO: Wire to DELETE /access/community-rules/:id endpoint when available
        console.log("Deleting access rule:", item.category);
        setDeleteConfirmation((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleDeleteCategory = (item: CommunityCategory) => {
    setDeleteConfirmation({
      open: true,
      title: "Delete Category",
      description: `Are you sure you want to delete "${item.category}"? This action cannot be undone.`,
      onConfirm: () => {
        // TODO: Wire to DELETE /community/categories/:id endpoint when available
        console.log("Deleting category:", item.id);
        setDeleteConfirmation((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleToggleStreetStatus = async (street: CommunityStreet) => {
    try {
      const action = street.isActive ? "deactivate" : "activate";
      await toggleStreetStatus.mutateAsync({ id: street.id, action });
      toast.success(`Street ${action}d successfully`);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to update street status");
    }
  };

  return (
    <div className="p-3 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-3 w-full max-w-[1400px] mx-auto">
        <PageHeader
          communityName={communityName}
          communityId={communityId}
          onBack={() => router.back()}
          onDelete={handleDeleteCommunity}
        />

        <div className="grid grid-cols-[1fr_320px] gap-3 w-full">
          <div className="flex flex-col gap-3">
            <MetricsCards totalBalance={totalBalance} isLoadingBalance={walletsLoading} />

            <Tabs defaultValue="collections" className="w-full">
              <TabsList className="inline-flex items-center gap-2 p-0 bg-transparent h-auto border-b border-gray-200 mb-3 w-full justify-start rounded-none">
                {["collections", "accessCodes", "residentCategories", "streets"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-4 py-2.5 data-[state=active]:bg-transparent data-[state=active]:text-[#1f1f3f] data-[state=active]:border-b-2 data-[state=active]:border-[#1f1f3f] rounded-none border-b-2 border-transparent [font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-all duration-300 hover:text-[#1f1f3f]"
                  >
                    {tab === "collections" ? "Collections" : tab === "accessCodes" ? "Access Codes" : tab === "residentCategories" ? "Resident Categories" : "Streets"}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="collections" className="mt-0 transition-all duration-300 animate-in fade-in-50">
                <CollectionsTab
                  data={dues || []}
                  isLoading={duesLoading}
                  onAddDues={() => setIsAddDuesDialogOpen(true)}
                  onDeleteItem={handleDeleteDue}
                />
              </TabsContent>

              <TabsContent value="accessCodes" className="mt-0 transition-all duration-300 animate-in fade-in-50">
                <AccessCodesTab
                  data={accessCodesData}
                  onCreateRule={() => setIsCreateRuleDialogOpen(true)}
                  onDeleteItem={handleDeleteAccessCode}
                />
              </TabsContent>

              <TabsContent value="residentCategories" className="mt-0 transition-all duration-300 animate-in fade-in-50">
                <ResidentCategoriesTab
                  data={categories || []}
                  isLoading={categoriesLoading}
                  onAddCategory={() => setIsAddCategoryDialogOpen(true)}
                  onDeleteItem={handleDeleteCategory}
                />
              </TabsContent>

              <TabsContent value="streets" className="mt-0 transition-all duration-300 animate-in fade-in-50">
                <StreetsTab
                  data={streets || []}
                  isLoading={streetsLoading || (qrLoading && !communityCode)}
                  onAddStreet={() => setIsAddStreetDialogOpen(true)}
                  onToggleStatus={handleToggleStreetStatus}
                />
              </TabsContent>
            </Tabs>
          </div>

          <CommunityInfoCard qrData={qrData} isLoading={qrLoading} communityId={id} />
        </div>
      </section>

      <AddDuesDialog
        open={isAddDuesDialogOpen}
        onOpenChange={setIsAddDuesDialogOpen}
        categories={categories || []}
        wallets={wallets || []}
      />

      <AddCategoryDialog
        open={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
      />

      <AddStreetDialog
        open={isAddStreetDialogOpen}
        onOpenChange={setIsAddStreetDialogOpen}
        communityCode={communityCode}
      />

      <CreateRuleDialog
        open={isCreateRuleDialogOpen}
        onOpenChange={setIsCreateRuleDialogOpen}
        communityCode={communityCode}
      />

      <DeleteConfirmationDialog
        open={deleteConfirmation.open}
        onOpenChange={(open) => setDeleteConfirmation((prev) => ({ ...prev, open }))}
        onConfirm={deleteConfirmation.onConfirm}
        title={deleteConfirmation.title}
        description={deleteConfirmation.description}
      />
    </div>
  );
}
