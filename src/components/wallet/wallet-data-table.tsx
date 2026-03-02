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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

function WalletActions({
  wallet,
  onView,
  onEdit,
  onDelete,
}: {
  wallet: Wallet;
  onView?: (w: Wallet) => void;
  onEdit?: (w: Wallet) => void;
  onDelete?: (w: Wallet) => void;
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
          onClick={(e) => { e.stopPropagation(); onView?.(wallet); }}
          className="cursor-pointer text-sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); onEdit?.(wallet); }}
          className="cursor-pointer text-sm"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); onDelete?.(wallet); }}
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
  onView?: (w: Wallet) => void,
  onEdit?: (w: Wallet) => void,
  onDelete?: (w: Wallet) => void,
): ColumnDef<Wallet>[] => [
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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-900">
        {row.getValue("name")}
      </span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">
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
          className={`w-fit h-6 px-2.5 rounded-md border text-xs font-medium ${
            active
              ? "bg-[#e6f7ef] text-[#00a854] border-[#00cc66]/30"
              : "bg-gray-50 text-gray-500 border-gray-200"
          }`}
        >
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <WalletActions
          wallet={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    ),
  },
];

const PAGE_SIZE = 10;

interface WalletDataTableProps {
  data: Wallet[];
  onView?: (wallet: Wallet) => void;
  onEdit?: (wallet: Wallet) => void;
  onDelete?: (wallet: Wallet) => void;
}

export function WalletDataTable({ data, onView, onEdit, onDelete }: WalletDataTableProps) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns: getColumns(onView, onEdit, onDelete),
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
            : `Showing ${from}–${to} of ${totalRows} wallet${totalRows !== 1 ? "s" : ""}`}
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
