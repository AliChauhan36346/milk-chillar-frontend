// src/components/ui/List/InfiniteRemainingList.tsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Loader2 } from 'lucide-react';
import { type RemainingSupplier, getRemainingSuppliers, type PaginatedResult } from '@/lib/api/purchases';

// Define the shape of the data item based on your PaginatedResult<RemainingSupplier>
type ListItem = RemainingSupplier & {
  rate: number;
  timeOfDay: 'morning' | 'evening';
};

type InfiniteRemainingListProps = {
  title: string;
  dodhiId: number | null;
  date: string;
  timeFilter: 'morning' | 'evening' | 'both';
  searchCode: string;
  isAdmin: boolean;
  onItemClick: (item: ListItem) => void;
  icon?: React.ReactNode;
  colorClass?: string;
};

// Component to handle the infinite scrolling list for Remaining Suppliers
export function InfiniteRemainingList({
  title,
  dodhiId,
  date,
  timeFilter,
  searchCode,
  isAdmin,
  onItemClick,
  icon,
  colorClass = "red"
}: InfiniteRemainingListProps) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset state when filters change
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [dodhiId, date, timeFilter, searchCode]);

  const fetchItems = useCallback(async (pageNumber: number) => {
    if (loading || !dodhiId || !hasMore) return;
    setLoading(true);

    try {
      const result: PaginatedResult<RemainingSupplier> = await getRemainingSuppliers(
        date,
        timeFilter,
        dodhiId,
        searchCode,
        pageNumber,
        20 // pageSize
      );
      
      const newItems: ListItem[] = result.items.map(item => ({
        ...item,
        rate: item.rate, // Already present in RemainingSupplier
        timeOfDay: item.timeOfDay // Already present in RemainingSupplier
      }));

      setItems(prevItems => (pageNumber === 1 ? newItems : [...prevItems, ...newItems]));
      setHasMore(result.pageNumber < result.totalPages);
      setPage(pageNumber);
    } catch (error) {
      console.error(`Failed to load ${title} (page ${pageNumber}):`, error);
      // Optional: Show an error message to the user
    } finally {
      setLoading(false);
    }
  }, [dodhiId, date, timeFilter, searchCode, loading, hasMore, title]);

  // Initial load or when filters change to trigger page 1 fetch
  useEffect(() => {
    if (dodhiId) {
        fetchItems(1);
    }
  }, [dodhiId, date, timeFilter, searchCode]);


  // Infinite Scroll Handler (Intersection Observer recommended for production, but using scroll event for simplicity here)
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = listElement;

      // Check if user is near the bottom (e.g., 200px from the bottom)
      if (scrollHeight - scrollTop - clientHeight < 200 && !loading && hasMore) {
        fetchItems(page + 1);
      }
    };

    listElement.addEventListener('scroll', handleScroll);
    return () => listElement.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, page, fetchItems]);


  return (
    <div className={`bg-${colorClass}-50 rounded-xl p-3 border border-${colorClass}-100`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 text-${colorClass}-700`}>
        {icon}
        {title} ({items.length} {hasMore ? '+' : ''})
      </h3>
      <div 
        ref={listRef} 
        className="space-y-2 overflow-y-auto"
        // Fixed height for mobile screens (e.g., up to 70vh)
        style={{ maxHeight: '70vh' }} 
      >
        {items.map((item) => (
          <div
            key={`remaining-${item.accountId}-${item.timeOfDay}`}
            className="bg-white p-2 rounded-lg shadow-sm cursor-pointer hover:bg-red-50 transition-colors"
            onClick={() => onItemClick(item)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">{item.accountName}</p>
                <p className="text-sm text-gray-600">ID: {item.accountCode}</p>
              </div>
              {/* Status Label (Copied from old RemainingList logic) */}
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Rs{item.rate}/L
                  </span>
                )}
                <span className={`${item.timeOfDay === 'morning' ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'} px-2 py-1 rounded-full text-xs flex items-center gap-1`}>
                  {item.timeOfDay === 'morning' ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"></path></svg> // Sun icon
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg> // Moon icon
                  )}
                  {item.timeOfDay}
                </span>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          </div>
        )}
        {!loading && !hasMore && items.length > 0 && (
            <p className="text-center text-sm text-gray-500 p-2">End of list.</p>
        )}
        {!loading && items.length === 0 && dodhiId && (
          <p className="text-center text-sm text-gray-500 p-2">No remaining suppliers found.</p>
        )}
      </div>
    </div>
  );
}

// Export the component using the new file name
// export { InfiniteRemainingList };