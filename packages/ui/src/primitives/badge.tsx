import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils/cn";

const badgeVariants = cva(
  "inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        topic:
          "border-graphite-200 bg-graphite-50 text-graphite-700 hover:border-graphite-300",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300",
      },
    },
    defaultVariants: {
      variant: "topic",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ className, variant }))} {...props} />;
}
