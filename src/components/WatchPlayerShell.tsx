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
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(229,9,20,0.18),_transparent_36%),linear-gradient(180deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0))]" />
      <div className="relative">
        <div className="border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              {eyebrow && (
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-red-400/90">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-2 max-w-3xl text-sm text-gray-400 sm:text-base">{subtitle}</p>}
            </div>

            {badges && <div className="flex flex-wrap items-center gap-2 lg:justify-end">{badges}</div>}
          </div>
        </div>

        <div className="p-2 sm:p-3 lg:p-4">
          {children}
        </div>

        {actions && (
          <div className="border-t border-white/10 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3">{actions}</div>
          </div>
        )}
      </div>
    </section>
  );
}
