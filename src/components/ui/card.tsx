import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Wrapper component providing rounded corners and a subtle border/shadow.
 */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl bg-white shadow-sm border border-gray-100", className)} {...props} />
  );
}

/**
 * Standard padding for card content. Meant to be nested inside Card.
 */
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}
