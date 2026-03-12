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
    <section className="relative overflow-hidden rounded-[24px] border border-white/8 bg-[#0b0b0b] shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(229,9,20,0.12),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.02),_rgba(255,255,255,0))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/45 to-transparent" />
      <div className="relative">
        <div className="border-b border-white/8 px-4 py-4 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              {eyebrow && (
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-red-500/90">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-2xl font-semibold text-white sm:text-[2rem]">{title}</h1>
              {subtitle && <p className="mt-2 max-w-3xl text-sm text-gray-400">{subtitle}</p>}
            </div>

            {badges && <div className="flex flex-wrap items-center gap-2 lg:max-w-[42%] lg:justify-end">{badges}</div>}
          </div>
        </div>

        <div className="p-2 sm:p-2.5 lg:p-3">
          {children}
        </div>

        {actions && (
          <div className="border-t border-white/8 bg-[#090909] px-4 py-3.5 sm:px-5 lg:px-6">
            <div className="flex flex-wrap items-stretch gap-2.5">{actions}</div>
          </div>
        )}
      </div>
    </section>
  );
}
