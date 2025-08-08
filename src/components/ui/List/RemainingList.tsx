import React from "react";

type RemainingListProps<T> = {
  title: string;
  items: T[];
  getKey: (item: T) => string;
  getName: (item: T) => string;
  getId: (item: T) => string;
  getStatusLabel: (item: T) => React.ReactNode;
  onItemClick: (item: T) => void;
  icon?: React.ReactNode;
  colorClass?: string;
};

export function RemainingList<T>({
  title,
  items,
  getKey,
  getName,
  getId,
  getStatusLabel,
  onItemClick,
  icon,
  colorClass = "red"
}: RemainingListProps<T>) {
  return (
    <div className={`bg-${colorClass}-50 rounded-xl p-3 border border-${colorClass}-100`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 text-${colorClass}-700`}>
        {icon}
        {title} ({items.length})
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={getKey(item)}
            className="bg-white p-2 rounded-lg shadow-sm cursor-pointer hover:bg-red-50 transition-colors"
            onClick={() => onItemClick(item)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">{getName(item)}</p>
                <p className="text-sm text-gray-600">ID: {getId(item)}</p>
              </div>
              {getStatusLabel(item)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}