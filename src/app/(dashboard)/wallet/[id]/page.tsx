"use client";

import React, { JSX, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Download, Share2, TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletIcon } from "lucide-react";
import { useWallets } from "@/hooks/use-wallets";

interface Transaction {
  id: string;
  userId: string;
  amount: string;
  type: "inflow" | "outflow";
  details: string;
  category: string;
  time: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    userId: "00001A",
    amount: "10,000",
    type: "inflow",
    details: "from: #00001A",
    category: "Collections",
    time: "5:59 pm, Aug 12, 2025",
  },
  {
    id: "2",
    userId: "00001A",
    amount: "10,000",
    type: "outflow",
    details: "to: 0123456789",
    category: "Collections",
    time: "5:59 pm, Aug 12, 2025",
  },
  {
    id: "3",
    userId: "00001A",
    amount: "10,000",
    type: "inflow",
    details: "from: #00001A",
    category: "Collections",
    time: "5:59 pm, Aug 12, 2025",
  },
  {
    id: "4",
    userId: "00001A",
    amount: "10,000",
    type: "inflow",
    details: "from: #00001A",
    category: "Collections",
    time: "5:59 pm, Aug 12, 2025",
  },
  {
    id: "5",
    userId: "00001A",
    amount: "10,000",
    type: "inflow",
    details: "from: #00001A",
    category: "Collections",
    time: "5:59 pm, Aug 12, 2025",
  },
  {
    id: "6",
    userId: "00001A",
    amount: "10,000",
    type: "inflow",
    details: "from: #00001A",
    category: "Collections",
    time: "5:59 pm, Aug 12, 2025",
  },
  {
    id: "7",
    userId: "00001A",
    amount: "10,000",
    type: "outflow",
    details: "to: 0123456789",
    category: "Collections",
    time: "5:59 pm, Aug 12, 2025",
  },
  {
    id: "8",
    userId: "00001A",
    amount: "10,000",
    type: "inflow",
    details: "from: #00001A",
    category: "Collections",
    time: "5:59 pm, Aug 12, 2025",
  },
];

export default function WalletDetailsPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const walletId = params.id as string;
  const [activeTab, setActiveTab] = useState("all");
  const [transactions] = useState<Transaction[]>(mockTransactions);

  // Wire wallet header from real API
  const { data: wallets, isLoading: walletLoading } = useWallets();
  const wallet = (wallets || []).find((w) => w.id === walletId);

  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === "all") return true;
    return transaction.type === activeTab;
  });

  return (
    <div className="p-4 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-4 px-2 py-2 w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4 text-[#5b5b66]" />
          </Button>

          <div className="flex flex-col items-start flex-1">
            <h1 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.8px] leading-7 font-normal">
              {walletLoading ? "Loading..." : (wallet?.name || "Wallet")}
            </h1>
            <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#acacbf] text-xs tracking-[-0.5px] leading-4 font-normal">
              {wallet ? `ID: ${wallet.id.slice(0, 8)}...` : `Wallet ID: ${walletId}`}
            </span>
          </div>

          <Button className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-lg px-4 py-2 transition-colors">
            <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[-0.5px] leading-5 whitespace-nowrap">
              Send to Bank
            </span>
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4 w-full">
          {/* Wallet Balance */}
          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="bg-blue-50 p-2.5 rounded-lg w-fit">
                <WalletIcon className="w-5 h-5 text-blue-500" />
              </div>
              <p className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.3px] leading-4 uppercase">
                Wallet balance
              </p>
              <div className="flex items-baseline gap-1">
                <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-[#242426] text-2xl tracking-[-1px] leading-7">
                  {walletLoading ? <Loader2 className="w-5 h-5 animate-spin inline" /> : wallet ? `₦${parseFloat(wallet.balance || "0").toLocaleString()}` : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Inflow */}
          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="bg-emerald-50 p-2.5 rounded-lg w-fit">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.3px] leading-4 uppercase">
                Total inflow
              </p>
              <div className="flex items-baseline gap-1">
                {/* TODO: Wire to transactions endpoint when available */}
                <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-[#242426] text-2xl tracking-[-1px] leading-7">
                  —
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Outflow */}
          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="bg-red-50 p-2.5 rounded-lg w-fit">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <p className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.3px] leading-4 uppercase">
                Total outflow
              </p>
              <div className="flex items-baseline gap-1">
                {/* TODO: Wire to transactions endpoint when available */}
                <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-[#242426] text-2xl tracking-[-1px] leading-7">
                  —
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Type */}
          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-5 flex flex-col gap-3">
              <p className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.3px] leading-4 uppercase">
                Wallet Type
              </p>
              <div className="flex flex-col gap-1">
                <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-[#242426] text-lg">
                  {walletLoading ? "—" : (wallet?.profileType || "—")}
                </span>
                <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#acacbf] text-xs">
                  {wallet?.isActive ? "Active" : wallet ? "Inactive" : ""}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Section */}
        <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <CardContent className="flex flex-col items-start gap-4 p-6 flex-1">
            {/* Tabs */}
            <div className="flex items-center gap-6 w-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="inline-flex items-center gap-1 p-1 bg-[#f4f4f9] rounded-xl h-auto">
                  <TabsTrigger
                    value="all"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
                  >
                    All transactions
                  </TabsTrigger>
                  <TabsTrigger
                    value="inflow"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
                  >
                    Inflow
                  </TabsTrigger>
                  <TabsTrigger
                    value="outflow"
                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5 transition-colors"
                  >
                    Outflow
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Transaction Table */}
            <div className="w-full">
              {/* Table Header */}
              <div className="flex items-center gap-4 p-2 w-full bg-[#f4f4f9] rounded-lg">
                <div className="flex flex-col items-start justify-center w-[100px] border-r border-[#e5e5ea]">
                  <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
                    User ID
                  </span>
                </div>
                <div className="flex flex-col items-start justify-center flex-1 border-r border-[#e5e5ea]">
                  <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
                    Details
                  </span>
                </div>
                <div className="flex flex-col items-start justify-center w-[140px] border-r border-[#e5e5ea]">
                  <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
                    Type
                  </span>
                </div>
                <div className="flex flex-col items-start justify-center w-[180px] border-r border-[#e5e5ea]">
                  <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
                    Time
                  </span>
                </div>
                <div className="flex flex-col items-start justify-center w-[100px]">
                  <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
                    Actions
                  </span>
                </div>
              </div>

              {/* Table Body */}
              <div className="flex flex-col items-start w-full max-h-[450px] overflow-y-auto">
                {filteredTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className={`flex items-center gap-4 p-2 w-full ${
                      index % 2 === 1 ? "bg-[#f9f9fb]" : "bg-white"
                    } ${
                      index < filteredTransactions.length - 1
                        ? "border-b border-[#f4f4f9]"
                        : ""
                    } hover:bg-[#f4f4f9] transition-colors`}
                  >
                    <div className="flex flex-col items-start justify-center w-[100px] border-r border-[#eaeaef]">
                      <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
                        {transaction.userId}
                      </span>
                    </div>
                    <div className="flex flex-col items-start justify-center flex-1 border-r border-[#eaeaef]">
                      <span
                        className={`[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-sm tracking-[-0.5px] leading-5 ${
                          transaction.type === "inflow"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        ₦{transaction.amount}
                      </span>
                      <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-xs tracking-[-0.4px] leading-4">
                        {transaction.details}
                      </span>
                    </div>
                    <div className="flex flex-col items-start justify-center w-[140px] border-r border-[#eaeaef]">
                      <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
                        {transaction.category}
                      </span>
                    </div>
                    <div className="flex flex-col items-start justify-center w-[180px] border-r border-[#eaeaef]">
                      <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
                        {transaction.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 w-[100px]">
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <Download className="w-4 h-4 text-[#5b5b66]" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <Share2 className="w-4 h-4 text-[#5b5b66]" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-2 w-full bg-[#f4f4f9] rounded-lg mt-3">
                <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-4">
                  Showing {filteredTransactions.length} of 480 transactions
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" className="h-auto w-10 p-2 hover:bg-transparent">
                    <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#1f1f3f] text-sm tracking-[-0.5px] leading-4">
                      1
                    </span>
                  </Button>
                  <Button variant="ghost" className="h-auto w-10 p-2 hover:bg-transparent">
                    <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-4">
                      2
                    </span>
                  </Button>
                  <Button variant="ghost" className="h-auto w-10 p-2 hover:bg-transparent">
                    <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-4">
                      3
                    </span>
                  </Button>
                  <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm">
                    ...
                  </span>
                  <Button variant="ghost" className="h-auto w-10 p-2 hover:bg-transparent">
                    <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-4">
                      40
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
