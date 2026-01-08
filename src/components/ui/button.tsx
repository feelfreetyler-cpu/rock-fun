import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * A simple button component styled with Tailwind. Accepts all native
 * button attributes and merges additional classes using the cn helper.
 */
export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sm",
        "bg-blue-600 text-white active:scale-[0.99] disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
