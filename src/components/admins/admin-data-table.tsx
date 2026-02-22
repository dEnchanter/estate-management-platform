"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, MoreVertical, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface Admin {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
  type: "Operations" | "Security" | "Super Admin";
  username: string;
  phone: string;
}

interface AdminActionsProps {
  admin: Admin;
  onEdit?: (admin: Admin) => void;
  onDelete?: (admin: Admin) => void;
}

function AdminActions({ admin, onEdit, onDelete }: AdminActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(admin);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <MoreVertical className="w-4 h-4 text-[#5b5b66]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-white">
          <DropdownMenuItem
            onClick={() => onEdit && onEdit(admin)}
            className="cursor-pointer [font-family:'SF_Pro-Regular',Helvetica] text-sm text-[#242426]"
          >
            <Pencil className="w-4 h-4 mr-2 text-[#5b5b66]" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="cursor-pointer [font-family:'SF_Pro-Regular',Helvetica] text-sm text-red-600 focus:text-red-600"
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
                <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.8px]">
                  Delete Admin
                </DialogTitle>
                <DialogDescription className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm tracking-[-0.5px]">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-4 p-4 bg-[#f4f4f9] rounded-lg">
              {admin.avatar ? (
                <Avatar className="w-12 h-12 rounded-lg">
                  <AvatarImage src={admin.avatar} />
                </Avatar>
              ) : (
                <Avatar className="w-12 h-12 bg-[#e5e5ea] rounded-lg">
                  <AvatarFallback className="bg-transparent [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#2f5fbf] text-base tracking-[-0.5px]">
                    {admin.initials}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1">
                <p className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-base tracking-[-0.5px] leading-5">
                  {admin.name}
                </p>
                <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm tracking-[-0.4px] leading-4">
                  {admin.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={`h-auto px-2 py-0.5 rounded-md text-xs ${
                      admin.type === "Operations"
                        ? "bg-[#e8e8fc] text-[#0000ff] hover:bg-[#e8e8fc]"
                        : admin.type === "Security"
                        ? "bg-[#e8f5fc] text-[#006699] hover:bg-[#e8f5fc]"
                        : "bg-[#e8fce8] text-[#006600] hover:bg-[#e8fce8]"
                    }`}
                  >
                    {admin.type}
                  </Badge>
                  <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-xs">
                    ID: {admin.id}
                  </span>
                </div>
              </div>
            </div>

            <p className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm tracking-[-0.5px] leading-6 mt-4">
              Are you sure you want to delete this admin account? All associated data will be permanently removed from the system.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="[font-family:'SF_Pro-Medium',Helvetica] text-sm rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 [font-family:'SF_Pro-Medium',Helvetica] text-white text-sm rounded-lg"
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
  onDelete?: (admin: Admin) => void
): ColumnDef<Admin>[] => [
  {
    accessorKey: "id",
    header: "Admin ID",
    cell: ({ row }) => (
      <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
        {row.getValue("id")}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name and email",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.avatar ? (
          <Avatar className="w-8 h-8 rounded-lg">
            <AvatarImage src={row.original.avatar} />
          </Avatar>
        ) : (
          <Avatar className="w-8 h-8 bg-[#e5e5ea] rounded-lg">
            <AvatarFallback className="bg-transparent [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#2f5fbf] text-sm tracking-[-0.5px] leading-5">
              {row.original.initials}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col items-start">
          <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
            {row.getValue("name")}
          </span>
          <span className="[font-family:'SF_Pro-Light',Helvetica] font-light text-[#5b5b66] text-xs tracking-[-0.4px] leading-4">
            {row.original.email}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Admin type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge
          className={`h-auto px-2 py-1 rounded-lg ${
            type === "Operations"
              ? "bg-[#e8e8fc] text-[#0000ff] hover:bg-[#e8e8fc]"
              : type === "Security"
              ? "bg-[#e8f5fc] text-[#006699] hover:bg-[#e8f5fc]"
              : "bg-[#e8fce8] text-[#006600] hover:bg-[#e8fce8]"
          }`}
        >
          <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-xs tracking-[-0.4px] leading-4">
            {type}
          </span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
        {row.getValue("username")}
      </span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone no.",
    cell: ({ row }) => (
      <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-sm tracking-[-0.5px] leading-5">
        {row.getValue("phone")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <AdminActions
        admin={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];

interface AdminDataTableProps {
  data: Admin[];
  onEdit?: (admin: Admin) => void;
  onDelete?: (admin: Admin) => void;
}

export function AdminDataTable({ data, onEdit, onDelete }: AdminDataTableProps) {
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
    <div className="flex flex-col gap-3 w-full">
      {/* Table Header */}
      <div className="flex items-center gap-4 p-2 w-full bg-[#f4f4f9] rounded-lg">
        {table.getHeaderGroups()[0].headers.map((header, index) => (
          <div
            key={header.id}
            className={`flex flex-col items-start justify-center ${
              header.id === "id"
                ? "w-[90px]"
                : header.id === "name"
                ? "flex-1"
                : header.id === "type"
                ? "w-[100px]"
                : header.id === "username"
                ? "w-[110px]"
                : header.id === "phone"
                ? "w-[140px]"
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
                      ? "w-[90px]"
                      : cell.column.id === "name"
                      ? "flex-1"
                      : cell.column.id === "type"
                      ? "w-[100px]"
                      : cell.column.id === "username"
                      ? "w-[110px]"
                      : cell.column.id === "phone"
                      ? "w-[140px]"
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

      {/* Pagination Footer */}
      <div className="flex items-center justify-between p-2 w-full bg-[#f4f4f9] rounded-lg">
        <div className="inline-flex items-center gap-2 px-0 py-3">
          <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-4">
            Showing {pagination.pageSize * pagination.pageIndex + 1}-
            {Math.min(
              pagination.pageSize * (pagination.pageIndex + 1),
              data.length
            )}{" "}
            of {data.length} admins
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
    </div>
  );
}
