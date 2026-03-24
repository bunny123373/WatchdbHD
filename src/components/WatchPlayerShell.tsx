"use client";

import { ReactNode } from "react";

interface WatchPlayerShellProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export default function WatchPlayerShell({
  eyebrow,
  title,
  subtitle,
  badges,
  actions,
  children,
}: WatchPlayerShellProps) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[#060606]">
      <div className="border-b border-white/10 bg-[#0c0c0c] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-red-500/90">
                {eyebrow}
              </p>
            )}
            <h1 className="text-2xl font-semibold text-white sm:text-[2.15rem]">{title}</h1>
            {subtitle && <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-400 sm:text-[15px]">{subtitle}</p>}
          </div>

          {badges && <div className="flex flex-wrap items-center gap-2 xl:max-w-[44%] xl:justify-end">{badges}</div>}
        </div>
      </div>

      <div className="w-full">
        {children}
      </div>

      {actions && (
        <div className="border-t border-white/10 bg-[#080808] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-stretch gap-2.5">{actions}</div>
        </div>
      )}
    </section>
  );
}
