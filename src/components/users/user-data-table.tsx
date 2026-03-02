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
import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  username: string;
  community: string;
  userType: "Resident" | "Builder";
  category: string;
}

interface UserActionsProps {
  user: User;
  editLabel?: string;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

function UserActions({ user, editLabel = "Edit", onEdit, onDelete }: UserActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreHorizontal className="w-4 h-4 text-[#5b5b66]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white">
        {onEdit && (
          <DropdownMenuItem
            onClick={() => onEdit(user)}
            className="cursor-pointer text-sm text-[#242426]"
          >
            <Pencil className="w-4 h-4 mr-2 text-[#5b5b66]" />
            {editLabel}
          </DropdownMenuItem>
        )}
        {onEdit && onDelete && <DropdownMenuSeparator />}
        {onDelete && (
          <DropdownMenuItem
            onClick={() => onDelete(user)}
            className="cursor-pointer text-sm text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const getColumns = (
  onEdit?: (user: User) => void,
  onDelete?: (user: User) => void,
  editLabel?: string
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-gray-400"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-gray-400"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "User ID",
    cell: ({ row }) => (
      <span className="text-sm text-[#242426]">{row.getValue("id")}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name and email",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8 rounded-lg">
          {row.original.avatar ? (
            <AvatarImage src={row.original.avatar} />
          ) : null}
          <AvatarFallback className="bg-[#00cccc] text-white text-sm font-medium rounded-lg">
            {row.original.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm text-[#242426]">{row.getValue("name")}</span>
          <span className="text-xs text-[#5b5b66]">{row.original.email}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <span className="text-sm text-[#242426]">{row.getValue("username")}</span>
    ),
  },
  {
    accessorKey: "community",
    header: "Community",
    cell: ({ row }) => (
      <span className="text-sm text-[#242426]">{row.getValue("community")}</span>
    ),
  },
  {
    accessorKey: "userType",
    header: "User type",
    cell: ({ row }) => {
      const userType = row.getValue("userType") as string;
      const isResident = userType === "Resident";
      return (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            isResident
              ? "bg-[#e8e0ff] text-[#6b4eff]"
              : "bg-[#d6f0ff] text-[#0088cc]"
          }`}
        >
          {userType}
        </span>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-sm text-[#242426]">{row.getValue("category")}</span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <UserActions
        user={row.original}
        editLabel={editLabel}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];

interface UserDataTableProps {
  data: User[];
  editLabel?: string;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onRowClick?: (user: User) => void;
}

export function UserDataTable({ data, editLabel, onEdit, onDelete, onRowClick }: UserDataTableProps) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 12 });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = getColumns(onEdit, onDelete, editLabel);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    state: { pagination, rowSelection },
  });

  const totalPages = table.getPageCount();
  const currentPage = pagination.pageIndex + 1;

  return (
    <>
      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-50 border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#5b5b66] uppercase tracking-wide whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row.original)}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                } ${rowIndex % 2 === 1 ? "bg-[#f9f9fb]" : "bg-white"}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-2 py-3 w-full bg-[#f4f4f9] rounded-lg mt-auto">
        <span className="text-sm text-[#5b5b66]">
          Showing {pagination.pageSize * pagination.pageIndex + 1}–
          {Math.min(pagination.pageSize * (pagination.pageIndex + 1), data.length)} of {data.length} users
        </span>

        <div className="flex items-center gap-1">
          {/* First page */}
          <Button
            variant="ghost"
            className="h-auto w-10 p-2 hover:bg-transparent"
            onClick={() => table.setPageIndex(0)}
          >
            <span className={`text-sm ${currentPage === 1 ? "font-semibold text-[#1f1f3f]" : "text-[#5b5b66]"}`}>1</span>
          </Button>

          {currentPage > 3 && <span className="text-sm text-[#5b5b66]">...</span>}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => page > 1 && page < totalPages && page >= currentPage - 1 && page <= currentPage + 1)
            .map((page) => (
              <Button
                key={page}
                variant="ghost"
                className="h-auto w-10 p-2 hover:bg-transparent"
                onClick={() => table.setPageIndex(page - 1)}
              >
                <span className={`text-sm ${currentPage === page ? "font-semibold text-[#1f1f3f]" : "text-[#5b5b66]"}`}>
                  {page}
                </span>
              </Button>
            ))}

          {currentPage < totalPages - 2 && totalPages > 3 && (
            <span className="text-sm text-[#5b5b66]">...</span>
          )}

          {totalPages > 1 && (
            <Button
              variant="ghost"
              className="h-auto w-10 p-2 hover:bg-transparent"
              onClick={() => table.setPageIndex(totalPages - 1)}
            >
              <span className={`text-sm ${currentPage === totalPages ? "font-semibold text-[#1f1f3f]" : "text-[#5b5b66]"}`}>
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
