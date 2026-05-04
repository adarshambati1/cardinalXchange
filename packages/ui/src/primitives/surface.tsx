import * as React from "react";

import { cn } from "../utils/cn";

export type SurfaceProps = React.HTMLAttributes<HTMLDivElement>;

export function Surface({ className, ...props }: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-graphite-200 bg-white shadow-sm shadow-graphite-950/[0.03]",
        className,
      )}
      {...props}
    />
  );
}
