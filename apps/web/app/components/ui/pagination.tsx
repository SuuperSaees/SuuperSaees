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
  const renderPageNumbers = () => {
    const pages = [];
    const showPages = 3; // Número de páginas a mostrar antes de la elipsis

    // Siempre mostrar primera página
    pages.push(1);

    if (currentPage > showPages) {
      pages.push('ellipsis');
    }

    // Páginas alrededor de la página actual
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - showPages) {
      pages.push('ellipsis');
    }

    // Siempre mostrar última página
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <>
      {totalPages > 1 && (
        <PaginationProvider className={`mt-auto border-t p-4 ${className}`}>
          <PaginationContent className="flex w-full items-center justify-between">
            <PaginationItem className={`${currentPage > 0 ? 'visible': 'invisible'}`}>
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
              {renderPageNumbers().map((page, index) => (
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      className={`${typeof page === 'number' && currentPage === page - 1 ? 'bg-gray-100' : ''} border-none hover:bg-black hover:text-white`}
                      href="#"
                      isActive={typeof page === 'number' && currentPage === page - 1}
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(typeof page === 'number' ? page - 1 : 0);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}
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
