"use client";

import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const sizes = {
    sm: "max-w-xs",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full",
  };

  if (!mounted) return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-[#1f1f1f] border border-[#333] shadow-2xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col",
          size === "full" ? "sm:rounded-lg" : "sm:rounded-xl",
          sizes[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#333] flex-shrink-0">
            <h3 className="text-base sm:text-lg font-semibold text-white truncate">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#333] transition-colors text-[#808080] hover:text-white flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}
