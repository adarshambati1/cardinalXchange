import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils/cn";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cardinal-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-cardinal-700 text-white shadow-sm shadow-cardinal-950/10 hover:bg-cardinal-800",
        secondary:
          "border border-graphite-200 bg-white text-graphite-900 hover:border-graphite-300 hover:bg-graphite-50",
        ghost: "text-graphite-700 hover:bg-graphite-100 hover:text-graphite-950",
        quiet:
          "border border-transparent bg-graphite-100 text-graphite-700 hover:bg-graphite-200 hover:text-graphite-950",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  size,
  variant,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ className, size, variant }))}
      type={type}
      {...props}
    />
  );
}
