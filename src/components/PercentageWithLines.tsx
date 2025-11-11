import { getLineLevel } from '@/lib/utils';
import React from 'react'

const PercentageWithLines = ({ label, percentage }) => {
  const level = getLineLevel(label, percentage);
  const absLevel = Math.abs(level);
  const isUnder = level < 0;

  return (
    <div className="flex flex-col items-start">
      {/* Render lines above */}
      {!isUnder &&
        Array.from({ length: absLevel }).map((_, i) => (
          <div key={`top-${i}`} className="w-1/2 h-[1px] bg-foreground my-[1px]" />
        ))}

      <span className="font-semibold">
        ,{label}%={percentage}
      </span>

      {/* Render lines below */}
      {isUnder &&
        Array.from({ length: absLevel }).map((_, i) => (
          <div key={`bottom-${i}`} className="w-1/2 h-[1px] bg-foreground my-[1px]" />
        ))}
    </div>
  );
}

export default PercentageWithLines