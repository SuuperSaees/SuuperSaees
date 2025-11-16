import { cn } from '@kit/ui/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from 'node_modules/@kit/ui/src/shadcn/pagination';

interface FilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const FilePagination: React.FC<FilePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className
}) => {
  if (totalPages <= 1) return null;
  return (
    <div className={cn("flex items-center justify-center h-10 my-auto", className)}>
      <Pagination>
        <PaginationContent>
          <PaginationPrevious 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="cursor-pointer"
          />
          
          {totalPages <= 4 ? (
            Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink 
                  onClick={() => onPageChange(pageNum)}
                  isActive={currentPage === pageNum}
                  className={cn(
                    "cursor-pointer",
                    currentPage === pageNum ? "text-gray-900" : "text-gray-400"
                  )}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))
          ) : (
            <>
              {currentPage > 2 && (
                <>
                  <PaginationItem>
                    <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                </>
              )}
              
              {Array.from(
                { length: 3 },
                (_, i) => Math.max(1, Math.min(currentPage - 1 + i, totalPages))
              )
              .filter((pageNum, index, arr) => arr.indexOf(pageNum) === index)
              .map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink 
                    onClick={() => onPageChange(pageNum)}
                    isActive={currentPage === pageNum}
                    className={cn(
                      "cursor-pointer",
                      currentPage === pageNum ? "text-gray-900" : "text-gray-400"
                    )}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              {currentPage < totalPages - 1 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink onClick={() => onPageChange(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
            </>
          )}
          
          <PaginationNext 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="cursor-pointer"
          />
        </PaginationContent>
      </Pagination>
    </div>
  );
};
