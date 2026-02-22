"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, MoreVertical, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AccessCode } from "@/types/api.types";

interface AccessCodeActionsProps {
  accessCode: AccessCode;
  onCancel?: (accessCode: AccessCode) => void;
  onValidate?: (accessCode: AccessCode) => void;
}

function AccessCodeActions({ accessCode, onCancel, onValidate }: AccessCodeActionsProps) {
  const canCancel = accessCode.status === "Open";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4 text-[#5b5b66]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white">
        {onValidate && (
          <>
            <DropdownMenuItem
              onClick={() => onValidate(accessCode)}
              className="cursor-pointer [font-family:'SF_Pro-Regular',Helvetica] text-sm text-[#242426]"
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Validate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {onCancel && canCancel && (
          <DropdownMenuItem
            onClick={() => onCancel(accessCode)}
            className="cursor-pointer [font-family:'SF_Pro-Regular',Helvetica] text-sm text-red-600 focus:text-red-600"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const getColumns = (
  onCancel?: (accessCode: AccessCode) => void,
  onValidate?: (accessCode: AccessCode) => void
): ColumnDef<AccessCode>[] => [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-semibold text-[#1f1f3f] text-base tracking-[-0.5px] leading-5">
        {row.getValue("code")}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
        {row.getValue("category") || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const isOpen = status === "Open";
      const isUsed = status === "Used";
      const isCancelled = status === "Cancelled";

      return (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs [font-family:'SF_Pro-Medium',Helvetica] font-medium tracking-[-0.4px] ${
            isOpen
              ? "bg-[#d6f0ff] text-[#0088cc]"
              : isUsed
              ? "bg-[#d4edda] text-[#28a745]"
              : isCancelled
              ? "bg-[#f8d7da] text-[#dc3545]"
              : "bg-[#e5e5ea] text-[#5b5b66]"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "generatedAt",
    header: "Generated",
    cell: ({ row }) => {
      const date = row.getValue("generatedAt") as string;
      return (
        <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5">
          {date ? new Date(date).toLocaleDateString() : "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) => {
      const date = row.getValue("expiresAt") as string;
      return (
        <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5">
          {date ? new Date(date).toLocaleDateString() : "N/A"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <AccessCodeActions
        accessCode={row.original}
        onCancel={onCancel}
        onValidate={onValidate}
      />
    ),
  },
];

interface AccessCodeDataTableProps {
  data: AccessCode[];
  onCancel?: (accessCode: AccessCode) => void;
  onValidate?: (accessCode: AccessCode) => void;
}

export function AccessCodeDataTable({ data, onCancel, onValidate }: AccessCodeDataTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 12,
  });

  const columns = getColumns(onCancel, onValidate);

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
                header.id === "code"
                  ? "w-[120px]"
                  : header.id === "category"
                  ? "w-[150px]"
                  : header.id === "status"
                  ? "w-[110px]"
                  : header.id === "generatedAt"
                  ? "w-[130px]"
                  : header.id === "expiresAt"
                  ? "w-[130px]"
                  : "w-20"
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
                      cell.column.id === "code"
                        ? "w-[120px]"
                        : cell.column.id === "category"
                        ? "w-[150px]"
                        : cell.column.id === "status"
                        ? "w-[110px]"
                        : cell.column.id === "generatedAt"
                        ? "w-[130px]"
                        : cell.column.id === "expiresAt"
                        ? "w-[130px]"
                        : "w-20"
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
            of {data.length} access codes
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
