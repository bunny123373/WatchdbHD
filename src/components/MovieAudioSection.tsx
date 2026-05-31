"use client";

import { useState } from "react";
import AudioSelectUnderline from "./AudioSelectUnderline";

interface MovieAudioSectionProps {
  audioLanguages: string[];
  defaultLanguage?: string;
}

export default function MovieAudioSection({
  audioLanguages,
  defaultLanguage,
}: MovieAudioSectionProps) {
  const [selectedAudio, setSelectedAudio] = useState(
    () => typeof window !== "undefined"
      ? localStorage.getItem("preferredAudio") || defaultLanguage || audioLanguages[0] || ""
      : defaultLanguage || audioLanguages[0] || ""
  );

  const handleAudioChange = (lang: string) => {
    setSelectedAudio(lang);
    localStorage.setItem("preferredAudio", lang);
  };

  if (!audioLanguages || audioLanguages.length === 0) return null;

  return (
    <div className="min-w-0">
      <p className="text-gray-500 text-xs uppercase mb-1">Audio</p>
      <AudioSelectUnderline
        languages={audioLanguages}
        selected={selectedAudio}
        onSelect={handleAudioChange}
      />
    </div>
  );
}
