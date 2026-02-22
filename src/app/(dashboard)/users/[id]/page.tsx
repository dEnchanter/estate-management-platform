"use client";

import { ChevronLeft, MoreVertical, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useCreateOrUpdateOccupant } from "@/hooks/use-resident";
import { OCCUPANT_RELATIONSHIPS } from "@/lib/constants";

// ============================================================================
// ADD OCCUPANT DIALOG
// ============================================================================

const addOccupantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  live_in: z.boolean(),
});

type AddOccupantFormData = z.infer<typeof addOccupantSchema>;

interface AddOccupantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddOccupantDialog = ({ open, onOpenChange }: AddOccupantDialogProps) => {
  const createOccupant = useCreateOrUpdateOccupant();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddOccupantFormData>({
    resolver: zodResolver(addOccupantSchema),
    defaultValues: { live_in: true },
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: AddOccupantFormData) => {
    try {
      await createOccupant.mutateAsync({
        name: data.name,
        relationship: data.relationship,
        live_in: data.live_in,
        is_active: true,
      });
      toast.success("Occupant added successfully");
      handleClose();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to add occupant");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-lg">
            Add Occupant
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="occupant-name" className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="occupant-name"
              {...register("name")}
              placeholder="Enter occupant name"
              className="[font-family:'SF_Pro-Regular',Helvetica] text-sm"
              disabled={createOccupant.isPending}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
              Relationship <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(v) => setValue("relationship", v)} disabled={createOccupant.isPending}>
              <SelectTrigger className="w-full [font-family:'SF_Pro-Regular',Helvetica] text-sm">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OCCUPANT_RELATIONSHIPS).map((rel) => (
                  <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.relationship && <p className="text-red-500 text-xs">{errors.relationship.message}</p>}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="live_in"
              {...register("live_in")}
              className="w-4 h-4 accent-[#1f1f3f]"
            />
            <Label htmlFor="live_in" className="[font-family:'SF_Pro-Regular',Helvetica] text-[#242426] text-sm cursor-pointer">
              Lives in the property
            </Label>
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createOccupant.isPending}
              className="flex-1 [font-family:'SF_Pro-Medium',Helvetica] text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createOccupant.isPending}
              className="flex-1 bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 text-white [font-family:'SF_Pro-Medium',Helvetica] text-sm"
            >
              {createOccupant.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Occupant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// TYPES
// ============================================================================

// Types
interface UserDetails {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  email: string;
  phone: string;
  address: string;
  community: string;
  userType: "Resident" | "Builder";
  category: string;
  createdOn: string;
  householdMembers: HouseholdMember[];
}

interface HouseholdMember {
  name: string;
  avatar?: string;
}

interface PaymentItem {
  id: string;
  name: string;
  wallet: string;
  type: "Recurring" | "One-off";
  status: "Paid" | "Overdue" | "Unpaid";
  dueDate: string;
}

interface AccessCodeItem {
  user: string;
  userType: string;
  code: string;
  uses: number;
  expiryTime: string;
  generatedOn: string;
}

// Mock data - replace with real data from API
const userDetails: UserDetails = {
  id: "#00001A",
  name: "John Doe",
  username: "@johndoe",
  avatar: "/avatar.svg",
  email: "johndoe@email.com",
  phone: "(234) 8012345679",
  address: "17A, Design Haven",
  community: "Green Meadows Estate",
  userType: "Resident",
  category: "Category 1",
  createdOn: "5:59 pm, Aug 12, 2025",
  householdMembers: [
    { name: "Jane", avatar: "/avatar.svg" },
    { name: "Tom" },
    { name: "Mary" },
    { name: "Peter" },
    { name: "Sarah" },
  ],
};

const paymentsData: PaymentItem[] = [
  { id: "1", name: "Water", wallet: "₦10,000", type: "Recurring", status: "Paid", dueDate: "Aug 30" },
  { id: "2", name: "Water", wallet: "₦10,000", type: "Recurring", status: "Paid", dueDate: "Aug 30" },
  { id: "3", name: "Water", wallet: "₦10,000", type: "Recurring", status: "Paid", dueDate: "Aug 30" },
  { id: "4", name: "Waste", wallet: "₦10,000", type: "Recurring", status: "Overdue", dueDate: "Aug 12" },
  { id: "5", name: "Road Project", wallet: "₦10,000", type: "One-off", status: "Unpaid", dueDate: "Aug 16" },
];

const accessCodesData: AccessCodeItem[] = [
  { user: "Jane Jackson", userType: "Households", code: "V90247", uses: 5, expiryTime: "23:59:48", generatedOn: "5:59 pm, Aug 12" },
  { user: "Jane Doe", userType: "Households", code: "V90247", uses: 0, expiryTime: "00:00:00", generatedOn: "5:59 pm, Aug 12" },
];

// Reusable Components
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 3.33333H11.3333M2 3.33333H9.33333M2 3.33333V3.33333C2 4.06971 2.59695 4.66667 3.33333 4.66667V4.66667C4.06971 4.66667 4.66667 4.06971 4.66667 3.33333V3.33333M2 3.33333V3.33333C2 2.59695 2.59695 2 3.33333 2V2C4.06971 2 4.66667 2.59695 4.66667 3.33333V3.33333M4.66667 3.33333H9.33333M9.33333 3.33333V3.33333C9.33333 4.06971 9.93029 4.66667 10.6667 4.66667V4.66667C11.403 4.66667 12 4.06971 12 3.33333V3.33333M9.33333 3.33333V3.33333C9.33333 2.59695 9.93029 2 10.6667 2V2C11.403 2 12 2.59695 12 3.33333V3.33333M12 3.33333H11.3333M2 8H6M2 12.6667H4.66667M14 8H8M14 12.6667H6.66667" stroke="#5b5b66" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

interface PageHeaderProps {
  userName: string;
  userId: string;
  username: string;
  onBack: () => void;
  onDelete: () => void;
}

const PageHeader = ({ userName, userId, username, onBack, onDelete }: PageHeaderProps) => (
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
        <div className="flex items-center gap-2">
          <h1 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.8px] leading-7 font-normal">
            {userName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#acacbf] text-xs tracking-[-0.5px] leading-4 font-normal">
            Users
          </span>

          <img
            className="w-px h-3 object-cover"
            alt="Divider"
            src="/divider.svg"
          />

          <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.5px] leading-4">
            {username}
          </span>

          <img
            className="w-px h-3 object-cover"
            alt="Divider"
            src="/divider.svg"
          />

          <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.5px] leading-4">
            {userId}
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

interface PageHeaderExtraProps extends PageHeaderProps {
  onAddOccupant: () => void;
}

const PageHeaderWithOccupant = ({ userName, userId, username, onBack, onDelete, onAddOccupant }: PageHeaderExtraProps) => (
  <div className="flex items-center gap-3 px-2 py-1.5 w-full">
    <div className="flex items-center gap-3 flex-1">
      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-lg" onClick={onBack}>
        <ChevronLeft className="w-5 h-5 text-[#5b5b66]" />
      </Button>
      <div className="flex flex-col items-start">
        <h1 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.8px] leading-7 font-normal">
          {userName}
        </h1>
        <div className="flex items-center gap-2">
          <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#acacbf] text-xs tracking-[-0.5px] leading-4 font-normal">Users</span>
          <img className="w-px h-3 object-cover" alt="Divider" src="/divider.svg" />
          <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.5px] leading-4">{username}</span>
          <img className="w-px h-3 object-cover" alt="Divider" src="/divider.svg" />
          <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.5px] leading-4">{userId}</span>
        </div>
      </div>
    </div>
    <Button
      onClick={onAddOccupant}
      className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors"
    >
      <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
      <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm tracking-[-0.5px] leading-5 whitespace-nowrap">
        Add Occupant
      </span>
    </Button>
    <Button variant="ghost" onClick={onDelete} className="h-auto text-red-600 hover:bg-red-50 rounded-lg px-4 py-2 transition-all duration-200 group">
      <Trash2 className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform duration-200" strokeWidth={2} />
      <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-sm tracking-[-0.3px] whitespace-nowrap">Delete</span>
    </Button>
  </div>
);

interface PaymentsTabProps {
  data: PaymentItem[];
  onDeleteItem: (item: PaymentItem) => void;
}

const PaymentsTab = ({ data, onDeleteItem }: PaymentsTabProps) => {
  const [activeFilter, setActiveFilter] = useState<"active" | "history">("active");

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-base tracking-[-0.5px] leading-6">
            Payments
          </h2>
          <Button variant="ghost" size="icon" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-lg">
            <FilterIcon />
          </Button>
        </div>

        {/* Sub-tabs */}
        <div className="mb-3">
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as "active" | "history")}>
            <TabsList className="inline-flex items-center gap-1 p-1 bg-[#f4f4f9] rounded-xl h-auto">
              <TabsTrigger
                value="active"
                className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
              >
                Active payments
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
              >
                History
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_120px_100px_80px] gap-4 px-4 py-3 bg-[#f0f0f5] rounded-t-lg">
            <span className="[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider">
              Name
            </span>
            <span className="[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider">
              Type
            </span>
            <span className="[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider">
              Status
            </span>
            <span className="[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider">
              Due Date
            </span>
            <span className="[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider text-right">
              Actions
            </span>
          </div>

          <ScrollArea className="w-full max-h-[400px]">
            <div className="flex flex-col">
              {data.map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-[1fr_120px_120px_100px_80px] gap-4 px-4 py-3.5 ${
                    index % 2 === 0 ? "bg-white" : "bg-[#f9f9fb]"
                  } hover:bg-gray-100 transition-colors cursor-pointer`}
                >
                  <div className="flex flex-col">
                    <span className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
                      {item.name}
                    </span>
                    <span className="[font-family:'SF_Pro-Light',Helvetica] text-[#5b5b66] text-xs">
                      {item.wallet}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#242426] text-sm">
                      {item.type}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className={`w-fit h-6 px-2.5 rounded-md border ${
                        item.status === "Paid"
                          ? "bg-[#e6f7f0] text-[#00a854] border-[#00cc66]/30"
                          : item.status === "Overdue"
                          ? "bg-[#ffe6e6] text-[#ff3333] border-[#ff3333]/30"
                          : "bg-[#fff4e6] text-[#cc7a00] border-[#ff9900]/30"
                      }`}
                    >
                      <span className="[font-family:'SF_Pro-Medium',Helvetica] text-xs">
                        {item.status}
                      </span>
                    </Badge>
                  </div>
                  <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#242426] text-sm flex items-center">
                    {item.dueDate}
                  </span>
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-gray-200 rounded-md">
                          <MoreVertical className="w-4 h-4 text-[#5b5b66]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 bg-white">
                        <DropdownMenuItem className="cursor-pointer [font-family:'SF_Pro-Regular',Helvetica] text-sm">
                          <Pencil className="w-4 h-4 mr-2 text-[#5b5b66]" />
                          Edit
                        </DropdownMenuItem>
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

        <div className="flex items-center justify-between pt-3">
          <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-xs">
            Showing 5 of 10 active payments
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <span className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#1f1f3f] text-sm">
                1
              </span>
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm">
                2
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 p-0 ml-2">
              <ChevronLeft className="w-4 h-4 text-[#5b5b66]" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 p-0">
              <ChevronLeft className="w-4 h-4 text-[#5b5b66] rotate-180" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface AccessCodesTabProps {
  data: AccessCodeItem[];
  onDeleteItem: (item: AccessCodeItem) => void;
}

const AccessCodesTab = ({ data, onDeleteItem }: AccessCodesTabProps) => {
  const [activeFilter, setActiveFilter] = useState<"active" | "history">("active");

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-base tracking-[-0.5px] leading-6">
            Access codes
          </h2>
          <Button variant="ghost" size="icon" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-lg">
            <FilterIcon />
          </Button>
        </div>

        {/* Sub-tabs */}
        <div className="mb-3">
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as "active" | "history")}>
            <TabsList className="inline-flex items-center gap-1 p-1 bg-[#f4f4f9] rounded-xl h-auto">
              <TabsTrigger
                value="active"
                className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
              >
                Active access codes
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
              >
                History
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_80px_120px_140px] gap-4 px-4 py-3 bg-[#f0f0f5] rounded-t-lg">
            <span className="[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider">
              User
            </span>
            <span className="[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider">
              Code
            </span>
            <span className="[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider">
              Uses
            </span>
            <span className="[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider">
              Expiry time
            </span>
            <span className="[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#242426] text-xs uppercase tracking-wider">
              Generated on
            </span>
          </div>

          <ScrollArea className="w-full max-h-[400px]">
            <div className="flex flex-col">
              {data.map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-[1fr_100px_80px_120px_140px] gap-4 px-4 py-3.5 ${
                    index % 2 === 0 ? "bg-white" : "bg-[#f9f9fb]"
                  } hover:bg-gray-100 transition-colors cursor-pointer`}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 rounded-lg">
                      <AvatarFallback className="bg-[#00cccc] text-white [font-family:'SF_Pro-Semibold',Helvetica] text-sm rounded-lg">
                        {item.user.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
                        {item.user}
                      </span>
                      <span className="[font-family:'SF_Pro-Light',Helvetica] text-[#5b5b66] text-xs">
                        {item.userType}
                      </span>
                    </div>
                  </div>
                  <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#242426] text-sm flex items-center">
                    {item.code}
                  </span>
                  <span
                    className={`[font-family:'SF_Pro-Semibold',Helvetica] text-sm flex items-center ${
                      item.uses === 5
                        ? "text-[#00cc66]"
                        : item.uses === 0
                        ? "text-[#ff3333]"
                        : "text-[#ff9900]"
                    }`}
                  >
                    {item.uses}
                  </span>
                  <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#242426] text-sm flex items-center">
                    {item.expiryTime}
                  </span>
                  <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#242426] text-sm flex items-center">
                    {item.generatedOn}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

interface UserProfileCardProps {
  user: UserDetails;
}

const UserProfileCard = ({ user }: UserProfileCardProps) => (
  <Card className="border border-gray-200 rounded-xl h-fit sticky top-4 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
    <div className="relative w-full h-[205px] bg-gradient-to-br from-[#1f1f3f] to-[#2a2a4a] overflow-hidden -mt-6">
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
        {user.avatar ? (
          <Avatar className="w-20 h-20 border-4 border-white/30 shadow-xl">
            <AvatarImage src={user.avatar} />
          </Avatar>
        ) : (
          <Avatar className="w-20 h-20 bg-[#00cccc] border-4 border-white/30 shadow-xl">
            <AvatarFallback className="bg-transparent text-white [font-family:'SF_Pro-Semibold',Helvetica] text-2xl">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>

    <CardContent className="p-5 flex flex-col gap-4 bg-white">
      <div className="flex flex-col gap-1 -mt-7">
        <h3 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.6px] leading-6 text-center">
          {user.name}
        </h3>
        <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-xs text-center">
          User Profile
        </p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      <div className="flex flex-col gap-2.5">
        <InfoRow label="User ID" value={user.id} />
        <InfoRow label="Username" value={user.username} highlight />
        <InfoRow label="Community" value={user.community} />
        <InfoRow
          label="User type"
          value={user.userType}
          badge={true}
          badgeColor={user.userType === "Resident" ? "purple" : "blue"}
        />
        <InfoRow label="Category" value={user.category} />

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-1"></div>

        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Phone number" value={user.phone} />
        <InfoRow label="Address" value={user.address} />
        <InfoRow label="Created on" value={user.createdOn} small />
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      {/* Household members */}
      <div className="flex flex-col gap-2">
        <span className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm">
          Household members
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-2">
            {user.householdMembers.slice(0, 3).map((member, index) => (
              <Avatar key={index} className="w-8 h-8 border-2 border-white">
                {member.avatar ? (
                  <AvatarImage src={member.avatar} />
                ) : (
                  <AvatarFallback className="bg-[#00cccc] text-white [font-family:'SF_Pro-Semibold',Helvetica] text-xs">
                    {member.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            ))}
          </div>
          <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm">
            {user.householdMembers[0].name} and {user.householdMembers.length - 1} others
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  small?: boolean;
  badge?: boolean;
  badgeColor?: "purple" | "blue";
}

const InfoRow = ({ label, value, highlight = false, small = false, badge = false, badgeColor }: InfoRowProps) => (
  <div className="flex items-center justify-between group hover:bg-[#f9f9fb] px-3 py-1.5 rounded-lg transition-colors -mx-3">
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 ${highlight ? 'bg-[#e6f7f7]' : 'bg-[#f4f4f9]'} rounded-md flex items-center justify-center ${highlight ? 'group-hover:bg-[#00cccc]/10' : 'group-hover:bg-white'} transition-colors`}>
        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
      </div>
      <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm">
        {label}
      </span>
    </div>
    {badge ? (
      <Badge
        variant="outline"
        className={`w-fit h-6 px-2.5 rounded-md border ${
          badgeColor === "purple"
            ? "bg-[#e8e0ff] text-[#6b4eff] border-[#6b4eff]/30"
            : "bg-[#d6f0ff] text-[#0088cc] border-[#0088cc]/30"
        }`}
      >
        <span className="[font-family:'SF_Pro-Medium',Helvetica] text-xs">
          {value}
        </span>
      </Badge>
    ) : (
      <span className={`[font-family:'SF_Pro-${small ? 'Medium' : 'Semibold'}',Helvetica] ${small ? 'font-medium' : 'font-semibold'} ${highlight ? 'text-[#00cccc]' : 'text-[#242426]'} text-${small ? 'xs' : 'sm'} ${small ? 'text-right' : ''}`}>
        {value}
      </span>
    )}
  </div>
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

// Main Component
export default function UserDetailsPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [isAddOccupantOpen, setIsAddOccupantOpen] = useState(false);

  const handleDeleteUser = () => {
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteUser = () => {
    // Handle user deletion here
    console.log("Deleting user:", userDetails.id);
    setDeleteConfirmationOpen(false);
    // Optionally redirect after deletion
    router.push("/users");
  };

  const handleDeletePayment = (item: PaymentItem) => {
    // Handle payment deletion here
    console.log("Deleting payment:", item.id);
  };

  const handleDeleteAccessCode = (item: AccessCodeItem) => {
    // Handle access code deletion here
    console.log("Deleting access code:", item.code);
  };

  return (
    <div className="p-3 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-3 w-full max-w-[1400px] mx-auto">
        <PageHeaderWithOccupant
          userName={userDetails.name}
          userId={userDetails.id}
          username={userDetails.username}
          onBack={() => router.back()}
          onDelete={handleDeleteUser}
          onAddOccupant={() => setIsAddOccupantOpen(true)}
        />

        <div className="grid grid-cols-[1fr_320px] gap-3 w-full">
          <div className="flex flex-col gap-3">
            <Tabs defaultValue="payments" className="w-full">
              <TabsList className="inline-flex items-center gap-2 p-0 bg-transparent h-auto border-b border-gray-200 mb-3 w-full justify-start rounded-none">
                <TabsTrigger
                  value="payments"
                  className="px-4 py-2.5 data-[state=active]:bg-transparent data-[state=active]:text-[#1f1f3f] data-[state=active]:border-b-2 data-[state=active]:border-[#1f1f3f] rounded-none border-b-2 border-transparent [font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-all duration-300 hover:text-[#1f1f3f]"
                >
                  Payments
                </TabsTrigger>
                <TabsTrigger
                  value="accessCodes"
                  className="px-4 py-2.5 data-[state=active]:bg-transparent data-[state=active]:text-[#1f1f3f] data-[state=active]:border-b-2 data-[state=active]:border-[#1f1f3f] rounded-none border-b-2 border-transparent [font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-all duration-300 hover:text-[#1f1f3f]"
                >
                  Access codes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="payments" className="mt-0 transition-all duration-300 animate-in fade-in-50">
                <PaymentsTab
                  data={paymentsData}
                  onDeleteItem={handleDeletePayment}
                />
              </TabsContent>

              <TabsContent value="accessCodes" className="mt-0 transition-all duration-300 animate-in fade-in-50">
                <AccessCodesTab
                  data={accessCodesData}
                  onDeleteItem={handleDeleteAccessCode}
                />
              </TabsContent>
            </Tabs>
          </div>

          <UserProfileCard user={userDetails} />
        </div>
      </section>

      <DeleteConfirmationDialog
        open={deleteConfirmationOpen}
        onOpenChange={setDeleteConfirmationOpen}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        description={`Are you sure you want to delete ${userDetails.name}? This action cannot be undone and will remove all associated data.`}
      />

      <AddOccupantDialog
        open={isAddOccupantOpen}
        onOpenChange={setIsAddOccupantOpen}
      />
    </div>
  );
}
