"use client";

import { Users, Edit, UserPlus } from "lucide-react";
import Image from "next/image";
import { CommitteeWithMembers } from "./types";

type CommitteeListProps = {
  committees: CommitteeWithMembers[];
  onViewCommittee: (committee: CommitteeWithMembers) => void;
  onEditCommittee: (committee: CommitteeWithMembers) => void;
  onAddMember: (committee: CommitteeWithMembers) => void;
  searchQuery: string;
};

export function CommitteeList({
  committees,
  onViewCommittee,
  onEditCommittee,
  onAddMember,
  searchQuery,
}: CommitteeListProps) {
  if (committees.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center bg-white rounded-lg border border-dashed border-gray-200">
        <Users className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-gray-500 text-base font-medium">
          {searchQuery
            ? "No committees match your search"
            : "No committees available"}
        </p>
        <p className="text-gray-400 mt-1 text-sm text-center max-w-md">
          {searchQuery
            ? "Try using different keywords or clear your search"
            : "Click the 'New Committee' button to create one"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {committees.map((committee) => (
        <div
          key={committee.id}
          className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
        >
          <div className="relative h-40 w-full overflow-hidden">
            <Image
              src={committee.image}
              alt={committee.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=300";
              }}
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCommittee(committee);
                }}
                className="bg-white p-1.5 rounded-full shadow-md hover:bg-orange-50 transition-colors"
              >
                <Edit className="h-3.5 w-3.5 text-orange-500" />
              </button>
            </div>
          </div>
          <div className="p-3 flex-1">
            <h3 className="text-gray-800 font-medium text-sm line-clamp-1">
              {committee.name}
            </h3>
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <Users className="h-3 w-3 mr-1" />
              {committee.totalMembers} members
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x border-t border-gray-100">
            <button
              onClick={() => onViewCommittee(committee)}
              className="py-2 text-xs font-medium text-orange-500 hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
            >
              <Users className="h-3 w-3" />
              View
            </button>
            <button
              onClick={() => onAddMember(committee)}
              className="py-2 text-xs font-medium text-green-500 hover:bg-green-50 transition-colors flex items-center justify-center gap-1"
            >
              <UserPlus className="h-3 w-3" />
              Add
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
