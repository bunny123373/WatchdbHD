"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { cn } from "@/utils/cn";

interface AppChromeProps {
  children: ReactNode;
}

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isPlayerRoute = pathname.startsWith("/watch/") || pathname.startsWith("/series/watch/");
  const shouldShowNavbar = !isAdminRoute && !isPlayerRoute;

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <main
        className={cn(
          "min-h-screen w-full max-w-full overflow-x-hidden",
          shouldShowNavbar ? "pt-14 lg:pt-16" : "pt-0"
        )}
      >
        {children}
      </main>
    </>
  );
}
