import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination as PaginationProvider,
} from 'node_modules/@kit/ui/src/shadcn/pagination';

import { Trans } from '@kit/ui/trans';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  goToPage: (page: number) => void;
  previousPage: () => void;
  nextPage: () => void;
  className?: string;
}
export default function Pagination({
  currentPage,
  goToPage,
  previousPage,
  nextPage,
  totalPages,
  className,
}: PaginationProps) {
  return (
    <>
      {totalPages > 1 && (
        <PaginationProvider className={`mt-auto border-t p-4 ${className}`}>
          <PaginationContent className="flex w-full items-center justify-between">
         
              <PaginationItem className={`${currentPage > 0 ? 'visible': 'invisible'}`} >
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    previousPage();
                  }}
                >
                  <Trans i18nKey={'common:pagination.previous'} />
                </PaginationPrevious>
              </PaginationItem>
     

            <div className="flex flex-1 justify-center w-full">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      className={`${currentPage === page - 1 ? 'bg-gray-100' : ''} border-none hover:bg-black hover:text-white`}
                      href="#"
                      isActive={currentPage === page - 1}
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(page - 1);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              {totalPages > 3 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </div>
  
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    nextPage();
                  }}
                  className={`${currentPage < totalPages - 1 ? 'visible': 'invisible'}`}
                >
                  <Trans i18nKey={'common:pagination.next'} />
                </PaginationNext>
              </PaginationItem>
          
          </PaginationContent>
        </PaginationProvider>
      )}
    </>
  );
}
