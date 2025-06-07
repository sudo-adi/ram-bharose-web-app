"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Member, SortDirection, SortField } from "./types";
import { JSX } from "react";

interface MembersTableProps {
  members: Member[];
  selected: string[];
  sortField: SortField;
  sortDirection: SortDirection;
  toggleSelectAll: () => void;
  toggleSelect: (id: string) => void;
  handleSort: (field: keyof Member) => void;
  getSortIcon: (field: keyof Member) => JSX.Element;
  onView: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

export function MembersTable({
  members,
  selected,
  sortField,
  sortDirection,
  toggleSelectAll,
  toggleSelect,
  handleSort,
  getSortIcon,
  onView,
  onEdit,
  onDelete,
}: MembersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  members.length > 0 && selected.length === members.length
                }
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center">
                Name
                {getSortIcon("name")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("email")}
            >
              <div className="flex items-center">
                Email
                {getSortIcon("email")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("mobile_no1")}
            >
              <div className="flex items-center">
                Phone
                {getSortIcon("mobile_no1")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("updated_at")}
            >
              <div className="flex items-center">
                Join Date
                {getSortIcon("updated_at")}
              </div>
            </TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No members found
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(member.id)}
                    onCheckedChange={() => toggleSelect(member.id)}
                    aria-label={`Select ${member.name}`}
                  />
                </TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.mobile_no1}</TableCell>
                <TableCell>{member.updated_at}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(member)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(member)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(member.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
