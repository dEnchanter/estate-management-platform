"use client";

import { MoreHorizontal, Users, Building2, UserCog, Wallet, LucideIcon, Loader2, Plus } from "lucide-react";
import React, { JSX, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/use-auth";
import { useCommunities } from "@/hooks/use-communities";
import { useWallets } from "@/hooks/use-wallets";
import { useServices } from "@/hooks/use-services";
import { useRouter } from "next/navigation";
import type { Service } from "@/types/api.types";
import { useResidentDashboard, useCreateOrUpdateOccupant } from "@/hooks/use-resident";
import { OCCUPANT_RELATIONSHIPS } from "@/lib/constants";
import type { Community } from "@/types/api.types";

// ============================================================================
// SHARED TYPES
// ============================================================================

interface StatData {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  currency?: boolean;
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

const PageHeader = ({ title }: { title: string }) => (
  <nav className="flex flex-col justify-center px-2 py-2 w-full">
    <h1 className="font-semibold text-[#242426] text-xl tracking-[-0.8px] leading-7">
      {title}
    </h1>
    <div className="flex items-center gap-2">
      <span className="text-[#acacbf] text-xs">Dashboard</span>
      <img className="w-px h-3 object-cover" alt="Divider" src="/divider.svg" />
      <span className="font-medium text-[#5b5b66] text-xs">Home</span>
    </div>
  </nav>
);

const StatCard = ({ stat }: { stat: StatData }) => {
  const Icon = stat.icon;
  return (
    <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden relative group">
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className={`${stat.iconBg} p-2.5 rounded-lg`}>
            <Icon className={`w-5 h-5 ${stat.iconColor}`} />
          </div>
        </div>
        <p className="font-medium text-[#5b5b66] text-xs tracking-[-0.3px] leading-4 uppercase">
          {stat.label}
        </p>
        <div className="flex items-baseline gap-1">
          {stat.currency ? (
            <>
              <span className="font-semibold text-[#242426] text-2xl tracking-[-1px] leading-7">
                ₦{stat.value}
              </span>
              <span className="font-medium text-[#acacbf] text-sm">.00</span>
            </>
          ) : (
            <span className="font-semibold text-[#242426] text-3xl tracking-[-1px] leading-8">
              {stat.value}
            </span>
          )}
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </Card>
  );
};


// ============================================================================
// UTILITIES — STATIC CARDS + SMART MAPPING (shared with utilities page)
// ============================================================================

type ServiceWithGroup = Service & { group_type?: string };

const STATIC_UTILITY_CARDS = [
  { title: "Electricity",      groupType: "Electricity",      bgColor: "bg-[#e5c319]", bgImage: "/bg-2.svg", image: "/image.png" },
  { title: "Water",            groupType: "Water",            bgColor: "bg-[#00cccc]", bgImage: "/bg-1.svg", image: "/image-1.png" },
  { title: "Funding",          groupType: "Funding",          bgColor: "bg-[#a789e3]", bgImage: "/bg-4.svg", image: "/icon.png" },
  { title: "Internet",         groupType: "Internet",         bgColor: "bg-[#e9a681]", bgImage: "/bg-3.svg", image: "/icon-1.png" },
  { title: "Security",         groupType: "Security",         bgColor: "bg-[#0088cc]", bgImage: "/bg.svg",   image: "/icon-2.png" },
  { title: "Waste Management", groupType: "Waste Management", bgColor: "bg-[#004466]", bgImage: "/bg-5.svg", image: "/image-2.png" },
];

function findUtilityCardIndex(
  apiGroupType: string,
  cards: typeof STATIC_UTILITY_CARDS,
  usedIndices: Set<number>
): number {
  const a = apiGroupType.toLowerCase().trim();
  let idx = cards.findIndex((c, i) => !usedIndices.has(i) && c.groupType.toLowerCase() === a);
  if (idx !== -1) return idx;
  idx = cards.findIndex((c, i) => !usedIndices.has(i) && (a.includes(c.groupType.toLowerCase()) || c.groupType.toLowerCase().includes(a)));
  if (idx !== -1) return idx;
  const apiWords = a.split(/\s+/);
  return cards.findIndex((c, i) => {
    if (usedIndices.has(i)) return false;
    return apiWords.some((w) => w.length > 2 && c.groupType.toLowerCase().split(/\s+/).includes(w));
  });
}

// ============================================================================
// ADMIN DASHBOARD VIEW
// ============================================================================

function AdminDashboardView() {
  const router = useRouter();
  const { data: communities, isLoading: communitiesLoading } = useCommunities();
  const { data: wallets } = useWallets();
  const { data: services, isLoading: servicesLoading } = useServices();

  const totalBalance = (wallets || []).reduce((sum, w) => sum + parseFloat(w.balance || "0"), 0);

  // Exclude communities without a myCommunityID (same filter as communities page)
  const validCommunities = (communities || []).filter((c) => !!c.myCommunityID);

  const stats: StatData[] = [
    {
      label: "Total users",
      // TODO: Wire to a permitted users endpoint when available
      value: "—",
      icon: Users,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
    },
    {
      label: "Communities",
      value: String(validCommunities.length || "—"),
      icon: Building2,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50",
    },
    {
      label: "Admins",
      // TODO: Wire to GET /admins count when endpoint is available
      value: "—",
      icon: UserCog,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Ledger balance",
      value: totalBalance.toLocaleString(),
      currency: true,
      icon: Wallet,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50",
    },
  ];

  const servicesByGroup = useMemo(() => {
    return (services as ServiceWithGroup[] || []).reduce<Record<string, ServiceWithGroup[]>>((acc, s) => {
      const gt = s.group_type || "";
      if (!acc[gt]) acc[gt] = [];
      acc[gt].push(s);
      return acc;
    }, {});
  }, [services]);

  const displayUtilityCards = useMemo(() => {
    const result = STATIC_UTILITY_CARDS.map((c) => ({ ...c, apiGroupType: "" }));
    const usedIndices = new Set<number>();
    const unmatchedGroups: string[] = [];

    for (const gt of Object.keys(servicesByGroup)) {
      const idx = findUtilityCardIndex(gt, STATIC_UTILITY_CARDS, usedIndices);
      if (idx !== -1) {
        result[idx].apiGroupType = gt;
        usedIndices.add(idx);
      } else {
        unmatchedGroups.push(gt);
      }
    }

    const unusedIndices = result.map((_, i) => i).filter((i) => !usedIndices.has(i));
    unmatchedGroups.forEach((gt, i) => {
      if (i >= unusedIndices.length) return;
      result[unusedIndices[i]].title = gt;
      result[unusedIndices[i]].apiGroupType = gt;
    });

    return result;
  }, [servicesByGroup]);

  const communityRows = validCommunities.map((c: Community) => ({
    estateId: c.myCommunityID || c.id,
    avatar: c.logoUrl || "/avatar.svg",
    name: c.name,
    address: [
      c.address?.street,
      c.address?.city,
      c.address?.state,
    ].filter(Boolean).join(", ") || "—",
  }));

  return (
    <div className="p-4 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
        <PageHeader title="Dashboard" />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 w-full">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Collections Grid */}
        <Card className="w-full bg-white rounded-xl shadow-sm">
          <CardContent className="p-4 flex flex-col items-start gap-3">
            <p className="text-[#5b5b66] text-sm">Collections</p>
            {servicesLoading ? (
              <div className="flex items-center justify-center w-full py-8">
                <Loader2 className="w-6 h-6 text-[#1f1f3f] animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-3 w-full">
                {displayUtilityCards.map((card) => {
                  const isActive = !!card.apiGroupType;
                  return (
                    <div
                      key={card.title}
                      onClick={() => isActive && router.push("/utilities")}
                      className={`aspect-[4/5] p-3 ${card.bgColor} overflow-hidden flex flex-col items-start gap-4 relative rounded-xl transition-transform ${
                        isActive ? "cursor-pointer hover:scale-105" : "opacity-40 grayscale cursor-not-allowed"
                      }`}
                    >
                      <img className="absolute inset-0 w-full h-full" alt="Background" src={card.bgImage} />
                      <img className="absolute inset-0 w-full h-full object-cover" alt={card.title} src={card.image} />
                      <p className="relative self-stretch font-medium text-white text-sm tracking-[-0.4px] leading-5 z-10">
                        {card.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Communities Table */}
        <Card className="w-full bg-white rounded-xl">
          <CardContent className="p-4 flex flex-col items-start gap-3">
            <p className="text-[#5b5b66] text-sm">Communities</p>
            {communitiesLoading ? (
              <div className="flex items-center justify-center w-full py-8">
                <Loader2 className="w-6 h-6 text-[#1f1f3f] animate-spin" />
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5b5b66] uppercase tracking-wide w-48">
                        Estate ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5b5b66] uppercase tracking-wide">
                        Community
                      </th>
                      <th className="px-4 py-3 w-14" />
                    </tr>
                  </thead>
                  <tbody>
                    {communityRows.map((community, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                          index % 2 === 1 ? "bg-[#f9f9fb]" : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-[#242426] font-mono truncate max-w-[192px]">
                          {community.estateId}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 rounded-lg shrink-0">
                              <AvatarImage src={community.avatar} alt={community.name} />
                              <AvatarFallback className="rounded-lg bg-teal-500 text-white text-xs font-semibold">
                                {community.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm text-[#242426] truncate">{community.name}</span>
                              <span className="text-xs text-[#5b5b66] truncate">{community.address}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4 text-[#5b5b66]" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// ============================================================================
// RESIDENT DASHBOARD VIEW
// ============================================================================

const addOccupantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  live_in: z.boolean(),
  is_active: z.boolean(),
});

type AddOccupantFormData = z.infer<typeof addOccupantSchema>;

function ResidentDashboardView() {
  const { data: dashboardData, isLoading, isError, refetch } = useResidentDashboard();
  const addOccupant = useCreateOrUpdateOccupant();
  const [isOccupantDialogOpen, setIsOccupantDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddOccupantFormData>({
    resolver: zodResolver(addOccupantSchema),
    defaultValues: { live_in: true, is_active: true },
  });

  const onAddOccupant = async (data: AddOccupantFormData) => {
    try {
      await addOccupant.mutateAsync({
        name: data.name,
        relationship: data.relationship,
        live_in: data.live_in,
        is_active: data.is_active,
      });
      toast.success("Occupant added successfully");
      reset();
      setIsOccupantDialogOpen(false);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to add occupant");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-full overflow-x-hidden">
        <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
          <PageHeader title="Dashboard" />
          <div className="flex flex-col items-center justify-center gap-4 py-16 w-full">
            <Loader2 className="w-10 h-10 text-[#1f1f3f] animate-spin" />
            <p className="text-[#5b5b66] text-base">Loading your dashboard...</p>
          </div>
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 max-w-full overflow-x-hidden">
        <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
          <PageHeader title="Dashboard" />
          <div className="flex flex-col items-center justify-center gap-4 py-16 w-full">
            <div className="bg-red-50 p-4 rounded-full">
              <img className="w-10 h-10" alt="Error" src="/frame-5.svg" />
            </div>
            <p className="text-[#5b5b66] text-base">Failed to load dashboard.</p>
            <Button onClick={() => refetch()} className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2">
              <span className="font-medium text-white text-sm">Try Again</span>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const balance = dashboardData?.walletBalance?.availableBalance || 0;
  const ledger = dashboardData?.walletBalance?.ledgerBalance || 0;
  const activeOccupants = dashboardData?.occupantStats?.active || 0;
  const totalOccupants = dashboardData?.occupantStats?.total || 0;
  const recentTransactions = dashboardData?.recentTransactions || [];
  const recentAccessCodes = dashboardData?.recentAccessCodes || [];
  const recentOccupants = dashboardData?.recentOccupants || [];

  const residentStats: StatData[] = [
    { label: "Available Balance", value: balance.toLocaleString(), currency: true, icon: Wallet, iconColor: "text-blue-500", iconBg: "bg-blue-50" },
    { label: "Ledger Balance", value: ledger.toLocaleString(), currency: true, icon: Wallet, iconColor: "text-purple-500", iconBg: "bg-purple-50" },
    { label: "Active Occupants", value: String(activeOccupants), icon: Users, iconColor: "text-emerald-500", iconBg: "bg-emerald-50" },
    { label: "Total Occupants", value: String(totalOccupants), icon: Users, iconColor: "text-amber-500", iconBg: "bg-amber-50" },
  ];

  return (
    <div className="p-4 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
        <PageHeader title="My Dashboard" />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 w-full">
          {residentStats.map((stat, i) => <StatCard key={i} stat={stat} />)}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          {/* Recent Transactions */}
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4 flex flex-col gap-3">
              <p className="font-semibold text-[#242426] text-sm">Recent Transactions</p>
              {recentTransactions.length === 0 ? (
                <p className="text-[#5b5b66] text-sm text-center py-8">No recent transactions</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentTransactions.slice(0, 5).map((txn, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#f4f4f9] last:border-0">
                      <div>
                        <p className="text-[#242426] text-sm">{txn.description || "Transaction"}</p>
                        <p className="text-[#5b5b66] text-xs">{txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : "—"}</p>
                      </div>
                      <span className={`font-semibold text-sm ${txn.type === "credit" ? "text-[#00cc66]" : "text-[#ff3333]"}`}>
                        {txn.type === "credit" ? "+" : "-"}₦{txn.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Access Codes */}
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4 flex flex-col gap-3">
              <p className="font-semibold text-[#242426] text-sm">Recent Access Codes</p>
              {recentAccessCodes.length === 0 ? (
                <p className="text-[#5b5b66] text-sm text-center py-8">No recent access codes</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentAccessCodes.slice(0, 5).map((code, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#f4f4f9] last:border-0">
                      <div>
                        <p className="text-[#242426] text-sm">{code.codeCategory}</p>
                        <p className="text-[#00cccc] text-xs font-mono">{code.code}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        code.status === "Open" ? "bg-blue-50 text-blue-600" :
                        code.status === "Used" ? "bg-green-50 text-green-600" :
                        "bg-red-50 text-red-600"
                      }`}>
                        {code.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Occupants */}
        <Card className="w-full bg-white rounded-xl">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#242426] text-sm">Household Members</p>
              <Button
                size="sm"
                onClick={() => setIsOccupantDialogOpen(true)}
                className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-3 py-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span className="text-white text-xs">Add Occupant</span>
              </Button>
            </div>
            {recentOccupants.length === 0 ? (
              <p className="text-[#5b5b66] text-sm text-center py-8">No household members added yet</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {recentOccupants.map((occ, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#f4f4f9] rounded-lg">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-xs font-medium bg-[#e5e5ea] text-[#2f5fbf]">
                        {occ.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-[#242426] text-xs">{occ.name}</p>
                      <p className="text-[#5b5b66] text-xs">{occ.relationship}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Add Occupant Dialog */}
      <Dialog open={isOccupantDialogOpen} onOpenChange={setIsOccupantDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="font-semibold text-[#242426] text-xl tracking-[-0.8px]">
              Add Household Member
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onAddOccupant)} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-[#242426] text-sm">Name</Label>
              <Input {...register("name")} placeholder="Enter full name" className="text-sm" />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-[#242426] text-sm">Relationship</Label>
              <Select onValueChange={(v) => setValue("relationship", v)}>
                <SelectTrigger className="text-sm">
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
            <div className="flex justify-end gap-3 mt-2">
              <Button type="button" variant="outline" onClick={() => { reset(); setIsOccupantDialogOpen(false); }} className="rounded-lg border-gray-200">
                <span className="font-medium text-sm">Cancel</span>
              </Button>
              <Button type="submit" disabled={addOccupant.isPending} className="bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg">
                {addOccupant.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <span className="font-medium text-white text-sm">Add Member</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT — routes to correct view based on profileType
// ============================================================================

export default function Dashboard(): JSX.Element {
  const { data: currentUser } = useCurrentUser();
  const profileType = currentUser?.profileType;

  if (profileType === "Resident" || profileType === "Developer") {
    return <ResidentDashboardView />;
  }

  return <AdminDashboardView />;
}
