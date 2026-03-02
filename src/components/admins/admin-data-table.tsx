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
import { AlertTriangle, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Admin {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
  type: string;
  username: string;
  phone: string;
}

function AdminActions({
  admin,
  onEdit,
  onDelete,
}: {
  admin: Admin;
  onEdit?: (admin: Admin) => void;
  onDelete?: (admin: Admin) => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
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
            onClick={(e) => { e.stopPropagation(); onEdit?.(admin); }}
            className="cursor-pointer text-sm"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
            className="cursor-pointer text-sm text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="font-semibold text-[#242426] text-xl">
                  Delete Admin
                </DialogTitle>
                <DialogDescription className="text-[#5b5b66] text-sm">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-4 p-4 bg-[#f4f4f9] rounded-lg">
              <Avatar className="w-12 h-12 rounded-lg">
                {admin.avatar ? (
                  <AvatarImage src={admin.avatar} />
                ) : null}
                <AvatarFallback className="bg-[#e5e5ea] font-semibold text-[#2f5fbf] text-base rounded-lg">
                  {admin.initials || admin.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-[#242426] text-base">
                  {admin.name}
                </p>
                <p className="text-[#5b5b66] text-sm">
                  {admin.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="h-auto px-2 py-0.5 rounded-md text-xs bg-[#e8e8fc] text-[#0000ff] hover:bg-[#e8e8fc]">
                    {admin.type}
                  </Badge>
                  <span className="text-[#5b5b66] text-xs">ID: {admin.id}</span>
                </div>
              </div>
            </div>

            <p className="text-[#5b5b66] text-sm mt-4">
              Are you sure you want to delete this admin account? All associated data will be permanently removed from the system.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="text-sm rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => { onDelete?.(admin); setShowDeleteDialog(false); }}
              className="bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
            >
              Delete Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const getColumns = (
  onEdit?: (admin: Admin) => void,
  onDelete?: (admin: Admin) => void,
): ColumnDef<Admin>[] => [
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
    header: "Name & Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 rounded-lg shrink-0">
          {row.original.avatar ? <AvatarImage src={row.original.avatar} /> : null}
          <AvatarFallback className="rounded-lg bg-[#e5e5ea] text-[#2f5fbf] text-xs font-semibold">
            {row.original.initials || row.original.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{row.getValue("name")}</p>
          <p className="text-xs text-gray-500 truncate">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Role",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge
          className={`h-auto px-2 py-0.5 rounded-md text-xs font-medium border-0 ${
            type === "Operations"
              ? "bg-[#e8e8fc] text-[#0000ff] hover:bg-[#e8e8fc]"
              : type === "Security"
              ? "bg-[#e8f5fc] text-[#006699] hover:bg-[#e8f5fc]"
              : "bg-[#e8fce8] text-[#006600] hover:bg-[#e8fce8]"
          }`}
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 font-mono">{row.getValue("username")}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">{row.getValue("phone")}</span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <AdminActions admin={row.original} onEdit={onEdit} onDelete={onDelete} />
      </div>
    ),
  },
];

const PAGE_SIZE = 10;

interface AdminDataTableProps {
  data: Admin[];
  onEdit?: (admin: Admin) => void;
  onDelete?: (admin: Admin) => void;
}

export function AdminDataTable({ data, onEdit, onDelete }: AdminDataTableProps) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns: getColumns(onEdit, onDelete),
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
            : `Showing ${from}–${to} of ${totalRows} admin${totalRows !== 1 ? "s" : ""}`}
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
