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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Community {
  id: string;
  name: string;
  address: string;
  avatar?: string;
}

interface CommunityActionsProps {
  community: Community;
  onEdit?: (community: Community) => void;
  onDelete?: (community: Community) => void;
}

function CommunityActions({ community, onEdit, onDelete }: CommunityActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4 text-[#5b5b66]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white">
        <DropdownMenuItem
          onClick={() => onEdit && onEdit(community)}
          className="cursor-pointer [font-family:'SF_Pro-Regular',Helvetica] text-sm text-[#242426]"
        >
          <Pencil className="w-4 h-4 mr-2 text-[#5b5b66]" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete && onDelete(community)}
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
  onEdit?: (community: Community) => void,
  onDelete?: (community: Community) => void
): ColumnDef<Community>[] => [
  {
    accessorKey: "id",
    header: "Estate ID",
    cell: ({ row }) => (
      <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
        {row.getValue("id")}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Community",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8 rounded-lg bg-[#00cccc]">
          <AvatarImage src={row.original.avatar || ""} />
          <AvatarFallback className="bg-[#00cccc] text-white rounded-lg [font-family:'SF_Pro-Semibold',Helvetica] text-sm tracking-[-0.5px]">
            {row.original.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
            {row.getValue("name")}
          </span>
          <span className="[font-family:'SF_Pro-Light',Helvetica] font-light text-[#5b5b66] text-xs tracking-[-0.4px] leading-4">
            {row.original.address}
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <CommunityActions
        community={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];

interface CommunityDataTableProps {
  data: Community[];
  onEdit?: (community: Community) => void;
  onDelete?: (community: Community) => void;
  onRowClick?: (community: Community) => void;
}

export function CommunityDataTable({ data, onEdit, onDelete, onRowClick }: CommunityDataTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 12,
  });

  const columns = getColumns(onEdit, onDelete);

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
              header.id === "id"
                ? "w-[150px]"
                : header.id === "name"
                ? "flex-1"
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
              onClick={() => onRowClick && onRowClick(row.original)}
              className={`flex items-center gap-4 p-2 w-full ${
                rowIndex % 2 === 1 ? "bg-[#f9f9fb]" : "bg-white"
              } ${
                rowIndex < table.getRowModel().rows.length - 1
                  ? "border-b border-[#f4f4f9]"
                  : ""
              } hover:bg-[#f4f4f9] transition-colors cursor-pointer`}
            >
              {row.getVisibleCells().map((cell, cellIndex) => (
                <div
                  key={cell.id}
                  className={`flex flex-col items-start justify-center ${
                    cell.column.id === "id"
                      ? "w-[150px]"
                      : cell.column.id === "name"
                      ? "flex-1"
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
            of {data.length} communities
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
