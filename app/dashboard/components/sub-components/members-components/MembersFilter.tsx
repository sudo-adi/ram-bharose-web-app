"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { FilterOption } from "./types";

interface MembersFilterProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterCount: number;
  activeFilters: Record<string, any>;
  filterOptions: FilterOption[];
  applyFilter: (filterId: string, value: any) => void;
  clearAllFilters: () => void;
  clearFilter: (filterId: string) => void;
}

export function MembersFilter({
  showFilters,
  setShowFilters,
  filterCount,
  activeFilters,
  filterOptions,
  applyFilter,
  clearAllFilters,
  clearFilter,
}: MembersFilterProps) {
  return (
    <>
      <Popover open={showFilters} onOpenChange={setShowFilters}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filters
            {filterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {filterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 px-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {filterOptions.map((filter) => (
                <div key={filter.id} className="grid gap-2">
                  <label className="text-sm font-medium">{filter.label}</label>

                  {filter.type === "select" && filter.options && (
                    <Select
                      value={activeFilters[filter.id] || ""}
                      onValueChange={(value) => applyFilter(filter.id, value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {filter.type === "text" && (
                    <Input
                      placeholder={`Enter ${filter.label.toLowerCase()}`}
                      value={activeFilters[filter.id] || ""}
                      onChange={(e) => applyFilter(filter.id, e.target.value)}
                      className="h-8"
                    />
                  )}

                  {filter.type === "date" && (
                    <div className="grid gap-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs">From</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-left font-normal h-8"
                              >
                                {activeFilters[`${filter.id}_from`]
                                  ? new Date(
                                      activeFilters[`${filter.id}_from`]
                                    ).toLocaleDateString()
                                  : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  activeFilters[`${filter.id}_from`]
                                    ? new Date(
                                        activeFilters[`${filter.id}_from`]
                                      )
                                    : undefined
                                }
                                onSelect={(date) => {
                                  applyFilter(`${filter.id}_from`, date);
                                  // Update the dateRange filter for the API
                                  applyFilter("dateRange", {
                                    ...activeFilters.dateRange,
                                    from: date,
                                    field: filter.field,
                                  });
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs">To</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-left font-normal h-8"
                              >
                                {activeFilters[`${filter.id}_to`]
                                  ? new Date(
                                      activeFilters[`${filter.id}_to`]
                                    ).toLocaleDateString()
                                  : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  activeFilters[`${filter.id}_to`]
                                    ? new Date(activeFilters[`${filter.id}_to`])
                                    : undefined
                                }
                                onSelect={(date) => {
                                  applyFilter(`${filter.id}_to`, date);
                                  // Update the dateRange filter for the API
                                  applyFilter("dateRange", {
                                    ...activeFilters.dateRange,
                                    to: date,
                                    field: filter.field,
                                  });
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={() => setShowFilters(false)}>
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {filterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            // Skip the dateRange object as we display from/to separately
            if (key === "dateRange") return null;

            // Find the filter option
            const filterOption = filterOptions.find(
              (f) =>
                f.id === key || `${f.id}_from` === key || `${f.id}_to` === key
            );

            if (!filterOption) return null;

            // Format the display value
            let displayValue = value;
            let displayKey = filterOption.label;

            // Handle date ranges
            if (key.endsWith("_from")) {
              displayKey = `${filterOption.label} From`;
              displayValue = new Date(value).toLocaleDateString();
            } else if (key.endsWith("_to")) {
              displayKey = `${filterOption.label} To`;
              displayValue = new Date(value).toLocaleDateString();
            } else if (filterOption.type === "select") {
              // For select options, show the label instead of the value
              const option = filterOption.options?.find(
                (o) => o.value === value
              );
              if (option) displayValue = option.label;
            }

            return (
              <Badge
                key={key}
                variant="outline"
                className="flex items-center gap-1 px-3 py-1"
              >
                <span>
                  {displayKey}: {displayValue}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter(key)}
                  className="h-4 w-4 p-0 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </>
  );
}
