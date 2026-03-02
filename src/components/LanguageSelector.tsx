"use client";

import { Globe, Check } from "lucide-react";
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
        className="flex items-center gap-2 px-3 py-1.5 bg-[#1F232D] hover:bg-[#2a2f3d] rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-white">{currentLang.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-[#1F232D] rounded-lg shadow-xl border border-[#2a2f3d] overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as "en" | "te" | "hi" | "ta");
                setIsOpen(false);
              }}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm transition-colors ${
                language === lang.code
                  ? "bg-yellow-500/20 text-yellow-500"
                  : "text-gray-300 hover:bg-[#2a2f3d]"
              }`}
            >
              <span>{lang.flag} {lang.label}</span>
              {language === lang.code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
