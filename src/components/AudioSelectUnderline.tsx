"use client";

import { Volume2 } from "lucide-react";

interface AudioSelectUnderlineProps {
  languages: string[];
  selected: string;
  onSelect: (lang: string) => void;
}

export default function AudioSelectUnderline({
  languages,
  selected,
  onSelect,
}: AudioSelectUnderlineProps) {
  if (!languages || languages.length === 0) return null;

  return (
    <div className="flex items-center gap-3 min-w-0">
      <Volume2 className="w-4 h-4 text-white/60 shrink-0 mb-0.5" />
      <div className="flex items-center gap-3 flex-1 min-w-0 border-b border-white/10 pb-0.5">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => onSelect(lang)}
            className={`whitespace-nowrap text-sm font-medium transition-colors pb-0.5 -mb-0.5 ${
              selected === lang
                ? "text-white border-b-2 border-red-600"
                : "text-white/50 hover:text-white/80 border-b-2 border-transparent"
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
