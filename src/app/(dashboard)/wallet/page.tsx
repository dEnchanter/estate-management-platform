"use client";

import React, { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Wallet as WalletIcon, TrendingUp } from "lucide-react";
import { CreateWalletDialog } from "@/components/wallet/create-wallet-dialog";
import { WalletDataTable, Wallet } from "@/components/wallet/wallet-data-table";
import { useWallets } from "@/hooks/use-wallets";

export default function WalletPage(): JSX.Element {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: apiWallets, isLoading, isError, refetch } = useWallets();

  const wallets: Wallet[] = (apiWallets || []).map((w) => ({
    id: w.id,
    name: w.name,
    balance: parseFloat(w.balance || "0").toLocaleString(),
    isActive: w.isActive,
  }));

  const totalBalance =
    (apiWallets || []).reduce((sum, w) => sum + parseFloat(w.balance || "0"), 0).toLocaleString();

  const handleCreateWallet = () => {
    setIsCreateDialogOpen(true);
  };

  const handleDownloadReport = () => {
    // TODO: Implement download report functionality
    console.log("Download report");
  };

  const handleViewWallet = (wallet: Wallet) => {
    router.push(`/wallet/${wallet.id}`);
  };

  const handleEditWallet = (wallet: Wallet) => {
    // TODO: Open edit dialog when PUT /wallets/:id endpoint is available
    console.log("Edit wallet:", wallet);
  };

  const handleDeleteWallet = (wallet: Wallet) => {
    // TODO: Call DELETE /wallets/:id endpoint when available
    console.log("Delete wallet:", wallet);
  };

  return (
    <div className="p-4 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-4 px-2 py-2 w-full">
          <div className="flex flex-col items-start px-3 py-0 flex-1">
            <h1 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.8px] leading-7 font-normal">
              Wallet
            </h1>
            <div className="flex items-center gap-2">
              <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#acacbf] text-xs tracking-[-0.5px] leading-4 font-normal">
                Dashboard
              </span>
              <img className="w-px h-3 object-cover" alt="Divider" src="/divider.svg" />
              <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.5px] leading-4">
                Wallet
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownloadReport}
              variant="outline"
              className="h-auto border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2 transition-colors"
            >
              <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#242426] text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
                Download Report
              </span>
            </Button>

            <Button
              onClick={handleCreateWallet}
              className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors"
            >
              <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
                Create Wallet
              </span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden relative group">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="bg-blue-50 p-2.5 rounded-lg">
                  <WalletIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-md">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-green-600 text-xs">
                    Active
                  </span>
                </div>
              </div>
              <p className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.3px] leading-4 uppercase">
                Total Balance
              </p>
              <div className="flex items-baseline gap-1">
                <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-[#242426] text-2xl tracking-[-1px] leading-7">
                  {isLoading ? "—" : `₦${totalBalance}`}
                </span>
              </div>
              <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#acacbf] text-xs tracking-[-0.3px] leading-4">
                Across {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden relative group">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="bg-emerald-50 p-2.5 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 rounded-md">
                  <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-purple-600 text-xs">
                    +12.5%
                  </span>
                </div>
              </div>
              <p className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.3px] leading-4 uppercase">
                Total revenue generated
              </p>
              <div className="flex items-baseline gap-1">
                <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-[#242426] text-2xl tracking-[-1px] leading-7">
                  {/* TODO: Wire to revenue endpoint when available */}—
                </span>
              </div>
              <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#acacbf] text-xs tracking-[-0.3px] leading-4">
                From all transactions
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Card>
        </div>

        {/* Loading / Error / Empty / Data */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 flex-1 w-full">
            <Loader2 className="w-10 h-10 text-[#1f1f3f] animate-spin" />
            <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-base tracking-[-0.5px]">
              Loading wallets...
            </p>
          </div>
        ) : isError ? (
          <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 w-full">
                <div className="bg-red-50 p-4 rounded-full">
                  <img className="w-10 h-10" alt="Error icon" src="/frame-9.svg" />
                </div>
                <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6 max-w-md">
                  Failed to load wallets. Please try again.
                </p>
                <Button
                  onClick={() => refetch()}
                  className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors"
                >
                  <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm tracking-[-0.5px] leading-5">
                    Try Again
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : wallets.length === 0 ? (
          <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center gap-4 px-0 py-16 w-full">
                <div className="bg-[#f4f4f9] p-4 rounded-full">
                  <WalletIcon className="w-10 h-10 text-[#5b5b66]" />
                </div>
                <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-base text-center tracking-[-0.5px] leading-6 max-w-md">
                  No wallets have been created yet.
                  <br />
                  Click the button to create your first wallet.
                </p>
                <Button
                  onClick={handleCreateWallet}
                  className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors"
                >
                  <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
                    Create Wallet
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <CardContent className="flex flex-col items-start gap-4 p-6 flex-1">
              <WalletDataTable
                data={wallets}
                onView={handleViewWallet}
                onEdit={handleEditWallet}
                onDelete={handleDeleteWallet}
              />
            </CardContent>
          </Card>
        )}
      </section>

      <CreateWalletDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
