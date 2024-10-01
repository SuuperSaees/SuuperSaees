import { useEffect, useState } from 'react';

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  pageSize?: number;
}

export function usePagination({
  totalItems,
  initialPage = 0,
  pageSize = 10,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const totalPages = Math.ceil(totalItems / pageSize);

  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;

  // Move to the previous page if current page becomes empty after deletion
  useEffect(() => {
    if (currentPage > 0 && startIndex >= totalItems) {
      setCurrentPage(currentPage - 1);
    }
  }, [totalItems, currentPage, pageSize, startIndex]);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    nextPage,
    previousPage,
    goToPage,
  };
}
