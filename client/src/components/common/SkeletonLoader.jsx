import React from 'react';

export const SkeletonLoader = ({ count = 3, height = 'h-16' }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`w-full ${height} bg-slate-200/80 rounded-xl`}
        />
      ))}
    </div>
  );
};
