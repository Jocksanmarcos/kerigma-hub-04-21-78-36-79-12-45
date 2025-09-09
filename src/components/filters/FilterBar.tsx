import React from "react";
import { cn } from "@/lib/utils";

interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "w-full rounded-lg border border-border bg-card p-4 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        {children}
      </div>
    </div>
  );
};

export default FilterBar;
