"use client";

import { Globe, Check, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "te", label: "Telugu", flag: "🇮🇳" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", flag: "🇮🇳" },
] as const;

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-white hidden sm:block">{currentLang.label}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 w-44 bg-[#1a1a1a] rounded-lg shadow-2xl border border-white/10 overflow-hidden z-[100]">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as "en" | "te" | "hi" | "ta");
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full px-3 py-2.5 text-sm transition-colors ${
                  language === lang.code
                    ? "bg-red-600/20 text-red-500"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </span>
                {language === lang.code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
