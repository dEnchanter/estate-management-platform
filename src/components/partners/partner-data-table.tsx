"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PartnerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  walletBalance: string;
}

interface PartnerActionsProps {
  partner: PartnerRow;
  onEdit?: (p: PartnerRow) => void;
  onDelete?: (p: PartnerRow) => void;
}

function PartnerActions({ partner, onEdit, onDelete }: PartnerActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4 text-[#5b5b66]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white">
        <DropdownMenuItem
          onClick={() => onEdit?.(partner)}
          className="cursor-pointer [font-family:'SF_Pro-Regular',Helvetica] text-sm text-[#242426]"
        >
          <Pencil className="w-4 h-4 mr-2 text-[#5b5b66]" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete?.(partner)}
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
  onEdit?: (p: PartnerRow) => void,
  onDelete?: (p: PartnerRow) => void
): ColumnDef<PartnerRow>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="[font-family:'SF_Pro-Medium',Helvetica] text-[#242426] text-sm tracking-[-0.5px]">
        {row.getValue("name")}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm tracking-[-0.5px]">
        {row.getValue("email")}
      </span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#242426] text-sm tracking-[-0.5px]">
        {row.getValue("phone")}
      </span>
    ),
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#242426] text-sm tracking-[-0.5px]">
        {row.getValue("username")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <PartnerActions partner={row.original} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];

interface PartnerDataTableProps {
  data: PartnerRow[];
  onEdit?: (p: PartnerRow) => void;
  onDelete?: (p: PartnerRow) => void;
}

export function PartnerDataTable({ data, onEdit, onDelete }: PartnerDataTableProps) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 12 });
  const columns = getColumns(onEdit, onDelete);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { pagination },
  });

  const totalPages = table.getPageCount();
  const currentPage = pagination.pageIndex + 1;

  const colWidths: Record<string, string> = {
    name: "flex-1",
    email: "w-[200px]",
    phone: "w-[150px]",
    username: "w-[150px]",
    actions: "w-14",
  };

  return (
    <>
      <div className="flex flex-col gap-3 w-full flex-1">
        <div className="flex items-center gap-4 p-2 w-full bg-[#f4f4f9] rounded-lg">
          {table.getHeaderGroups()[0].headers.map((header, index) => (
            <div
              key={header.id}
              className={`flex items-center ${colWidths[header.id] || "w-20"} ${
                index < table.getHeaderGroups()[0].headers.length - 1 ? "border-r border-[#e5e5ea]" : ""
              }`}
            >
              <span className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-sm tracking-[-0.5px]">
                {flexRender(header.column.columnDef.header, header.getContext())}
              </span>
            </div>
          ))}
        </div>

        <ScrollArea className="w-full h-[450px]">
          <div className="flex flex-col items-start w-full">
            {table.getRowModel().rows.map((row, rowIndex) => (
              <div
                key={row.id}
                className={`flex items-center gap-4 p-2 w-full ${
                  rowIndex % 2 === 1 ? "bg-[#f9f9fb]" : "bg-white"
                } border-b border-[#f4f4f9] hover:bg-[#f4f4f9] transition-colors`}
              >
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <div
                    key={cell.id}
                    className={`flex items-center ${colWidths[cell.column.id] || "w-20"} ${
                      cellIndex < row.getVisibleCells().length - 1 ? "border-r border-[#eaeaef]" : ""
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

      <div className="flex items-center justify-between p-2 w-full bg-[#f4f4f9] rounded-lg mt-auto">
        <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm tracking-[-0.5px]">
          Showing {Math.min(pagination.pageSize * pagination.pageIndex + 1, data.length)}–
          {Math.min(pagination.pageSize * (pagination.pageIndex + 1), data.length)} of {data.length} partners
        </span>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant="ghost"
              className="h-auto w-10 p-2 hover:bg-transparent"
              onClick={() => table.setPageIndex(page - 1)}
            >
              <span className={`${currentPage === page ? "text-[#1f1f3f] font-semibold" : "text-[#5b5b66]"} text-sm`}>
                {page}
              </span>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="w-4 h-4 text-[#5b5b66]" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="w-4 h-4 text-[#5b5b66]" />
          </Button>
        </div>
      </div>
    </>
  );
}
