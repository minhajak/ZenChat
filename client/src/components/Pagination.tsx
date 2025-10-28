import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  return (
    <div className="p-4 border-t border-base-300 bg-base-100 sticky bottom-0">
      <div className="flex items-center justify-between">
        <span className="text-sm text-base-content/60">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="btn btn-outline btn-sm gap-1 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="btn btn-outline btn-sm gap-1 disabled:opacity-50"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
