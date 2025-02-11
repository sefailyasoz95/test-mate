import React from "react";

export const LoadingSkeleton = () => {
  return (
    <div className="w-full animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded-md animate-shimmer" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded-md w-5/6" />
        <div className="h-4 bg-muted rounded-md w-4/6" />
      </div>
    </div>
  );
};
