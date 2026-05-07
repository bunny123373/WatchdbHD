"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Settings {
  theme: "dark" | "light";
  language: string;
  videoQuality: "auto" | "360p" | "720p" | "1080p";
  autoplay: boolean;
  notifications: boolean;
  playerUrl?: string;
  subtitleLanguage?: string;
  playbackSpeed?: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (key: keyof Settings, value: string | boolean | number) => void;
}

const defaultSettings: Settings = {
  theme: "dark",
  language: "te",
  videoQuality: "auto",
  autoplay: true,
  notifications: true,
  playerUrl: "//site.com/playerjs.js",
  subtitleLanguage: "",
  playbackSpeed: 1,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("app-settings");
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("app-settings", JSON.stringify(settings));
    }
  }, [settings, mounted]);

  const updateSettings = (key: keyof Settings, value: string | boolean | number) => {
    setSettings((prev) => ({ ...prev, [key]: value as never }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
