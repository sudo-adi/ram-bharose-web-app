"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface MembersSearchBarProps {
  search: string;
  setSearch: (value: string) => void;
  selected: string[];
  openDeleteDialog: () => void;
  openAddDialog: () => void;
}

export function MembersSearchBar({
  search,
  setSearch,
  selected,
  openDeleteDialog,
  openAddDialog,
}: MembersSearchBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        {selected.length > 0 && (
          <Button variant="destructive" size="sm" onClick={openDeleteDialog}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({selected.length})
          </Button>
        )}
        <Button size="sm" onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>
    </div>
  );
}
