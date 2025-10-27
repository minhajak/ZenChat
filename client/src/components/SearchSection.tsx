import { Plus, Search, X } from "lucide-react";
import React, { useState } from "react";
import SearchUsers from "./SearchUsers";

export default function SearchSection({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [showSearchUsers, setShowSearchUsers] = useState<boolean>(false);
  
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:border-primary text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowSearchUsers(true)}
          className="p-2 bg-base-200 hover:bg-base-300 border border-base-300 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 text-zinc-400" />
        </button>
      </div>
      
      {showSearchUsers && (
        <SearchUsers 
          className="" 
          onClose={() => setShowSearchUsers(false)} 
        />
      )}
    </>
  );
}