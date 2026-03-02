"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

function CommunityActions({
  community,
  onViewDetails,
  onEdit,
  onDelete,
}: {
  community: Community;
  onViewDetails?: (c: Community) => void;
  onEdit?: (c: Community) => void;
  onDelete?: (c: Community) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); onViewDetails?.(community); }}
          className="cursor-pointer text-sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); onEdit?.(community); }}
          className="cursor-pointer text-sm"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); onDelete?.(community); }}
          className="cursor-pointer text-sm text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const getColumns = (
  onViewDetails?: (c: Community) => void,
  onEdit?: (c: Community) => void,
  onDelete?: (c: Community) => void,
): ColumnDef<Community>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "id",
    header: "Estate ID",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 font-mono">
        {row.getValue("id")}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Community",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 rounded-lg shrink-0">
          <AvatarImage src={row.original.avatar || ""} />
          <AvatarFallback className="rounded-lg bg-teal-500 text-white text-xs font-semibold">
            {row.original.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {row.getValue("name")}
          </p>
          <p className="text-xs text-gray-500 truncate">{row.original.address}</p>
        </div>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <CommunityActions
          community={row.original}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    ),
  },
];

const PAGE_SIZE = 10;

interface CommunityDataTableProps {
  data: Community[];
  onViewDetails?: (c: Community) => void;
  onEdit?: (c: Community) => void;
  onDelete?: (c: Community) => void;
}

export function CommunityDataTable({ data, onViewDetails, onEdit, onDelete }: CommunityDataTableProps) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns: getColumns(onViewDetails, onEdit, onDelete),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    state: { pagination, rowSelection },
  });

  const { pageIndex, pageSize } = pagination;
  const totalRows = data.length;
  const totalPages = table.getPageCount();
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Table */}
      <div className="w-full overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-gray-50 border-b border-gray-200">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider
                      ${header.id === "select" ? "w-10" : ""}
                      ${header.id === "id" ? "w-48" : ""}
                      ${header.id === "actions" ? "w-16" : ""}
                    `}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-gray-100 transition-colors
                  ${i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                  ${row.getIsSelected() ? "bg-blue-50" : ""}
                `}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-500">
          {totalRows === 0
            ? "No results"
            : `Showing ${from}–${to} of ${totalRows} communities`}
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i).map((i) => {
            const page = i + 1;
            const current = pageIndex + 1;
            if (totalPages <= 5 || page === 1 || page === totalPages || (page >= current - 1 && page <= current + 1)) {
              return (
                <Button
                  key={i}
                  variant={current === page ? "default" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 text-sm ${current === page ? "bg-[#1f1f3f] text-white hover:bg-[#1f1f3f]/90" : "text-gray-600"}`}
                  onClick={() => table.setPageIndex(i)}
                >
                  {page}
                </Button>
              );
            }
            if (page === current - 2 || page === current + 2) {
              return <span key={i} className="text-gray-400 text-sm px-1">…</span>;
            }
            return null;
          })}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
