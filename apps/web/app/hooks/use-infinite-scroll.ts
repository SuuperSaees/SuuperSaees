'use client';

import { InfiniteQueryObserverResult, FetchNextPageOptions } from '@tanstack/react-query';
import { InfiniteData } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { useInView } from 'react-intersection-observer';

/**
 * Props for the useInfiniteScroll hook
 */
interface UseInfiniteScrollProps<TData = unknown, TError = Error> {
  /** Whether there is a next page to fetch */
  hasNextPage: boolean;
  /** Whether the next page is currently being fetched */
  isFetchingNextPage: boolean;
  /** Whether any data is currently being fetched */
  isFetching: boolean;
  /** Function to fetch the next page of data */
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<InfiniteQueryObserverResult<InfiniteData<TData>, TError>>;
  /** Ref to the scrollable container element */
  containerRef: React.RefObject<HTMLElement>;
  /** The ID of the item to use as the anchor for the scroll position */
  anchorSelector: string;
}

/**
 * Custom hook for implementing infinite scroll functionality with scroll position preservation
 * @param props - Configuration object containing pagination state and callbacks
 * @returns Object containing the ref to attach to the loading trigger element
 */
const useInfiniteScroll = <TData = unknown, TError = Error>({
  hasNextPage,
  isFetchingNextPage,
  isFetching,
  fetchNextPage,
  containerRef,
  anchorSelector,
}: UseInfiniteScrollProps<TData, TError>) => {
  const [scrollAnchorPosition, setScrollAnchorPosition] = useState<{
    element: HTMLElement | null;
    top: number;
  }>({ element: null, top: 0 });
  // Configure separate intersection observer for loading more data
  // with a larger threshold to start loading earlier
  const { ref: loadMoreRef } = useInView({
    rootMargin: '800px 0px 0px 0px', // Increased to start fetching earlier
    threshold: 0.1,
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage && !isFetching) {
        // Save scroll position before fetching
        if (containerRef.current) {
          const firstVisibleElement = findFirstVisibleElement(
            containerRef.current,
          );
          if (firstVisibleElement) {
            setScrollAnchorPosition({
              element: firstVisibleElement,
              top: firstVisibleElement.getBoundingClientRect().top,
            });
          }
        }
        void fetchNextPage();
      }
    },
  });

  /**
   * Finds the first visible element within the scrollable container
   * @param container - The scrollable container element
   * @returns The first visible element or null if none found
   */
  const findFirstVisibleElement = useCallback(
    (container: HTMLElement) => {
      // Get all message elements
      const elements = container.querySelectorAll(anchorSelector);
      const containerRect = container.getBoundingClientRect();

      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        // Check if this element is visible in the viewport
        if (
          rect.top >= containerRect.top &&
          rect.bottom <= containerRect.bottom
        ) {
          return element as HTMLElement;
        }
        // If we've passed the visible area, return the previous element
        if (rect.top > containerRect.bottom) {
          return element.previousElementSibling as HTMLElement;
        }
      }
      return null;
    },
    [anchorSelector],
  );

  // Restore scroll position after new content is loaded
  useEffect(() => {
    /**
     * Restores the scroll position to maintain the user's view after new content is loaded
     */
    const restoreScrollPosition = () => {
      if (
        !isFetchingNextPage &&
        scrollAnchorPosition.element &&
        containerRef.current
      ) {
        // Get the current position of the anchor element
        const newPosition =
          scrollAnchorPosition.element.getBoundingClientRect().top;
        const difference = newPosition - scrollAnchorPosition.top;

        // Adjust the scroll position to keep the anchor element in the same position
        containerRef.current.scrollTop += difference;
      }
    };

    if (!isFetchingNextPage && scrollAnchorPosition.element) {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        restoreScrollPosition();
        // Sometimes a second adjustment is needed after everything is fully rendered
        setTimeout(restoreScrollPosition, 50);
      });
    }
  }, [isFetchingNextPage, scrollAnchorPosition, containerRef]);

  // 1️⃣ Background prefetch of the next page, so improve UX and the user can see the new messages and scroll faster
  // Pending to implement

  return {
    loadMoreRef,
  };
};

export default useInfiniteScroll;
