"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Wallet {
  id: string;
  name: string;
  balance: string;
  isActive?: boolean;
}

interface WalletActionsProps {
  wallet: Wallet;
  onView?: (wallet: Wallet) => void;
  onEdit?: (wallet: Wallet) => void;
  onDelete?: (wallet: Wallet) => void;
}

function WalletActions({ wallet, onView, onEdit, onDelete }: WalletActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4 text-[#5b5b66]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white">
        <DropdownMenuItem
          onClick={() => onView?.(wallet)}
          className="cursor-pointer [font-family:'SF_Pro-Regular',Helvetica] text-sm text-[#242426]"
        >
          <Eye className="w-4 h-4 mr-2 text-[#5b5b66]" />
          View Detail
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onEdit?.(wallet)}
          className="cursor-pointer [font-family:'SF_Pro-Regular',Helvetica] text-sm text-[#242426]"
        >
          <Pencil className="w-4 h-4 mr-2 text-[#5b5b66]" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete?.(wallet)}
          className="cursor-pointer [font-family:'SF_Pro-Regular',Helvetica] text-sm text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const getColumns = (
  onView?: (wallet: Wallet) => void,
  onEdit?: (wallet: Wallet) => void,
  onDelete?: (wallet: Wallet) => void
): ColumnDef<Wallet>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#242426] text-sm tracking-[-0.5px] leading-5">
        {row.getValue("name")}
      </span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => (
      <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
        ₦{row.getValue("balance")}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const active = row.getValue("isActive") as boolean | undefined;
      return (
        <Badge
          variant="outline"
          className={`w-fit h-6 px-2.5 rounded-md border ${
            active
              ? "bg-[#e6f7ef] text-[#00a854] border-[#00cc66]/30"
              : "bg-[#f9f9fb] text-[#5b5b66] border-gray-200"
          }`}
        >
          <span className="[font-family:'SF_Pro-Medium',Helvetica] text-xs">
            {active ? "Active" : "Inactive"}
          </span>
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <WalletActions
        wallet={row.original}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];

interface WalletDataTableProps {
  data: Wallet[];
  onView?: (wallet: Wallet) => void;
  onEdit?: (wallet: Wallet) => void;
  onDelete?: (wallet: Wallet) => void;
}

export function WalletDataTable({ data, onView, onEdit, onDelete }: WalletDataTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 12,
  });

  const columns = getColumns(onView, onEdit, onDelete);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  const totalPages = table.getPageCount();
  const currentPage = pagination.pageIndex + 1;

  return (
    <>
      {/* Table Section */}
      <div className="flex flex-col gap-3 w-full flex-1">
        {/* Table Header */}
        <div className="flex items-center gap-4 p-2 w-full bg-[#f4f4f9] rounded-lg">
        {table.getHeaderGroups()[0].headers.map((header, index) => (
          <div
            key={header.id}
            className={`flex flex-col items-start justify-center ${
              header.id === "name"
                ? "flex-1"
                : header.id === "balance"
                ? "w-[180px]"
                : header.id === "isActive"
                ? "w-[120px]"
                : "w-14"
            } ${
              index < table.getHeaderGroups()[0].headers.length - 1
                ? "border-r border-[#e5e5ea]"
                : ""
            }`}
          >
            <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
              {flexRender(header.column.columnDef.header, header.getContext())}
            </span>
          </div>
        ))}
      </div>

      {/* Table Body */}
      <ScrollArea className="w-full h-[450px]">
        <div className="flex flex-col items-start w-full">
          {table.getRowModel().rows.map((row, rowIndex) => (
            <div
              key={row.id}
              className={`flex items-center gap-4 p-2 w-full ${
                rowIndex % 2 === 1 ? "bg-[#f9f9fb]" : "bg-white"
              } ${
                rowIndex < table.getRowModel().rows.length - 1
                  ? "border-b border-[#f4f4f9]"
                  : ""
              } hover:bg-[#f4f4f9] transition-colors`}
            >
              {row.getVisibleCells().map((cell, cellIndex) => (
                <div
                  key={cell.id}
                  className={`flex flex-col items-start justify-center ${
                    cell.column.id === "name"
                      ? "flex-1"
                      : cell.column.id === "balance"
                      ? "w-[180px]"
                      : cell.column.id === "isActive"
                      ? "w-[120px]"
                      : "w-14"
                  } ${
                    cellIndex < row.getVisibleCells().length - 1
                      ? "border-r border-[#eaeaef]"
                      : ""
                  }`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between p-2 w-full bg-[#f4f4f9] rounded-lg mt-auto">
        <div className="inline-flex items-center gap-2 px-0 py-3">
          <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-4">
            Showing {pagination.pageSize * pagination.pageIndex + 1}-
            {Math.min(
              pagination.pageSize * (pagination.pageIndex + 1),
              data.length
            )}{" "}
            of {data.length} wallets
          </span>
        </div>

        <div className="flex items-center justify-center gap-1">
          {/* First page */}
          <Button
            variant="ghost"
            className={`h-auto w-10 p-2 hover:bg-transparent ${
              currentPage === 1 ? "" : ""
            }`}
            onClick={() => table.setPageIndex(0)}
          >
            <span
              className={`${
                currentPage === 1
                  ? "[font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#1f1f3f]"
                  : "[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66]"
              } text-sm tracking-[-0.5px] leading-4 text-center`}
            >
              1
            </span>
          </Button>

          {/* Show ellipsis if needed */}
          {currentPage > 3 && (
            <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm">
              ...
            </span>
          )}

          {/* Middle pages */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page > 1 &&
                page < totalPages &&
                page >= currentPage - 1 &&
                page <= currentPage + 1
            )
            .map((page) => (
              <Button
                key={page}
                variant="ghost"
                className="h-auto w-10 p-2 hover:bg-transparent"
                onClick={() => table.setPageIndex(page - 1)}
              >
                <span
                  className={`${
                    currentPage === page
                      ? "[font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#1f1f3f]"
                      : "[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66]"
                  } text-sm tracking-[-0.5px] leading-4 text-center`}
                >
                  {page}
                </span>
              </Button>
            ))}

          {/* Show ellipsis if needed */}
          {currentPage < totalPages - 2 && totalPages > 3 && (
            <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm">
              ...
            </span>
          )}

          {/* Last page */}
          {totalPages > 1 && (
            <Button
              variant="ghost"
              className={`h-auto w-10 p-2 hover:bg-transparent ${
                currentPage === totalPages ? "" : ""
              }`}
              onClick={() => table.setPageIndex(totalPages - 1)}
            >
              <span
                className={`${
                  currentPage === totalPages
                    ? "[font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#1f1f3f]"
                    : "[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66]"
                } text-sm tracking-[-0.5px] leading-4 text-center`}
              >
                {totalPages}
              </span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4 text-[#5b5b66]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4 text-[#5b5b66]" />
          </Button>
        </div>
      </div>
    </>
  );
}
