import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { getRangeSet } from "@/lib/rangeSets";

import { cn } from "@/lib/utils";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  keyName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, keyName, ...props }, ref) => {

  const { min, max } = getRangeSet(keyName);
  // Determine the color based on value relative to min/max range
  const getIndicatorColor = () => {
    // If min/max are not provided, use default primary color
    if (min === undefined && max === undefined) {
      return "bg-primary";
    }

    const currentValue = value || 0;

    // If value is below min, use red
    if (min !== undefined && currentValue < min) {
      return "bg-red-500";
    }

    // If value is above max, use orange
    if (max !== undefined && currentValue > max) {
      return "bg-orange-400";
    }

    // If value is within range (or only one boundary is set and it's satisfied), use primary
    return "bg-primary";
  };

  // console.log("min, max", min, max);
  // console.log("value", value);
  // console.log("Key", keyName);
  // console.log("=====================================")

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-gray-200",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          getIndicatorColor()
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
