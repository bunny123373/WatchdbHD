"use client";

import { cn } from "@/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "purple" | "green" | "default" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  const variants = {
    gold: "bg-red-600/20 text-red-400 border-red-600/20",
    purple: "bg-purple-600/20 text-purple-400 border-purple-600/20",
    green: "bg-green-600/20 text-green-400 border-green-600/20",
    default: "bg-white/10 text-white/80 border-white/10",
    outline: "bg-transparent text-gray-400 border-white/10",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded font-medium border",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
