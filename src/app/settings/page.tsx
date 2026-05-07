"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Globe, 
  Video, 
  Bell, 
  BellOff,
  PlayCircle,
  Info,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
  Subtitles,
  Gauge,
  User,
  LogIn,
  Loader2,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

const languages = [
  { code: "te", name: "Telugu" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "ml", name: "Malayalam" },
  { code: "kn", name: "Kannada" },
  { code: "en", name: "English" },
];

const videoQualities = [
  { value: "auto", label: "Auto" },
  { value: "360p", label: "360p" },
  { value: "720p", label: "720p" },
  { value: "1080p", label: "1080p" },
];

const playbackSpeeds = [
  { value: 0.5, label: "0.5x" },
  { value: 1, label: "1x (Normal)" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
];

const subtitleLanguages = [
  { code: "", name: "None" },
  { code: "te", name: "Telugu" },
  { code: "hi", name: "Hindi" },
  { code: "en", name: "English" },
  { code: "ta", name: "Tamil" },
  { code: "ml", name: "Malayalam" },
  { code: "kn", name: "Kannada" },
];

export default function SettingsPage() {
  const pathname = usePathname();
  const { settings, updateSettings } = useSettings();
  const { user, loading: authLoading, login, register } = useAuth();
  const [clearing, setClearing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const isPlayerRoute = pathname.startsWith("/watch/") || pathname.startsWith("/series/watch/");
  if (isPlayerRoute) return null;

  const handleClearCache = () => {
    setClearing(true);
    localStorage.clear();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);

    const result = authMode === "login"
      ? await login(authEmail, authPassword)
      : await register(authUsername, authEmail, authPassword);

    if (result.success) {
      setShowAuth(false);
      setAuthEmail("");
      setAuthPassword("");
      setAuthUsername("");
    } else {
      setAuthError(result.error || "Something went wrong");
    }
    setAuthSubmitting(false);
  };

  const isDark = settings.theme === "dark";
  const themeBg = isDark ? "bg-red-600" : "bg-gray-600";
  const themeTranslate = isDark ? "translate-x-4" : "translate-x-0.5";

  const autoplayBg = settings.autoplay ? "bg-red-600" : "bg-gray-600";
  const autoplayTranslate = settings.autoplay ? "translate-x-4" : "translate-x-0.5";

  const notifBg = settings.notifications ? "bg-red-600" : "bg-gray-600";
  const notifTranslate = settings.notifications ? "translate-x-4" : "translate-x-0.5";

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {authLoading ? (
          <section className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
          </section>
        ) : !user ? (
          <section>
            <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">Account</h2>
            <div className="bg-[#141414] rounded-lg overflow-hidden">
              <button
                onClick={() => { setShowAuth(true); setAuthMode("login"); }}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                <LogIn className="w-5 h-5 text-gray-400" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => { setShowAuth(true); setAuthMode("register"); }}
                className="w-full flex items-center gap-3 p-4 pt-0 hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-5 text-gray-400" />
                <span>Create Account</span>
              </button>
            </div>
          </section>
        ) : (
          <section>
            <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">Account</h2>
            <div className="bg-[#141414] rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{user.username}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Auth Modal */}
        {showAuth && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
            <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md border border-white/10">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">
                  {authMode === "login" ? "Sign In" : "Create Account"}
                </h2>
                <button onClick={() => setShowAuth(false)} className="p-1 hover:bg-white/10 rounded">
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleAuth} className="p-4 space-y-4">
                {authMode === "register" && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Username</label>
                    <input
                      type="text"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-red-600 text-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-red-600 text-sm"
                  />
                </div>
                {authError && <p className="text-red-500 text-sm">{authError}</p>}
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-medium disabled:opacity-50"
                >
                  {authSubmitting ? "Please wait..." : authMode === "login" ? "Sign In" : "Create Account"}
                </button>
                <p className="text-center text-sm text-gray-500">
                  {authMode === "login" ? "No account?" : "Have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                    className="text-red-500 hover:underline"
                  >
                    {authMode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </form>
            </div>
          </div>
        )}

        {/* Appearance */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">Appearance</h2>
          <div className="bg-[#141414] rounded-lg overflow-hidden">
            <button
              onClick={() => updateSettings("theme", settings.theme === "dark" ? "light" : "dark")}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="w-5 h-5 text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-400" />
                )}
                <span>Dark Mode</span>
              </div>
              <div className={cn("w-10 h-6 rounded-full transition-colors", themeBg)}>
                <div className={cn("w-5 h-5 bg-white rounded-full mt-0.5 transition-transform", themeTranslate)} />
              </div>
            </button>
          </div>
        </section>

        {/* Language */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">Language</h2>
          <div className="bg-[#141414] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <Globe className="w-5 h-5 text-gray-400" />
              <select
                value={settings.language}
                onChange={(e) => updateSettings("language", e.target.value)}
                className="flex-1 bg-transparent text-white focus:outline-none"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[#1a1a1a]">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Subtitle Language */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">Subtitles</h2>
          <div className="bg-[#141414] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <Subtitles className="w-5 h-5 text-gray-400" />
              <select
                value={settings.subtitleLanguage || ""}
                onChange={(e) => updateSettings("subtitleLanguage", e.target.value)}
                className="flex-1 bg-transparent text-white focus:outline-none"
              >
                {subtitleLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[#1a1a1a]">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Video Quality */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">Video Quality</h2>
          <div className="bg-[#141414] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <Video className="w-5 h-5 text-gray-400" />
              <select
                value={settings.videoQuality}
                onChange={(e) => updateSettings("videoQuality", e.target.value)}
                className="flex-1 bg-transparent text-white focus:outline-none"
              >
                {videoQualities.map((q) => (
                  <option key={q.value} value={q.value} className="bg-[#1a1a1a]">
                    {q.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Playback Speed */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">Playback Speed</h2>
          <div className="bg-[#141414] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <Gauge className="w-5 h-5 text-gray-400" />
              <select
                value={settings.playbackSpeed || 1}
                onChange={(e) => updateSettings("playbackSpeed", parseFloat(e.target.value))}
                className="flex-1 bg-transparent text-white focus:outline-none"
              >
                {playbackSpeeds.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#1a1a1a]">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Player URL */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">External Player</h2>
          <div className="bg-[#141414] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <LinkIcon className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={settings.playerUrl || ""}
                onChange={(e) => updateSettings("playerUrl", e.target.value)}
                placeholder="//site.com/playerjs.js"
                className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-gray-600"
              />
            </div>
          </div>
        </section>

        {/* Playback */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">Playback</h2>
          <div className="bg-[#141414] rounded-lg overflow-hidden">
            <button
              onClick={() => updateSettings("autoplay", !settings.autoplay)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <PlayCircle className="w-5 h-5 text-gray-400" />
                <span>Autoplay</span>
              </div>
              <div className={cn("w-10 h-6 rounded-full transition-colors", autoplayBg)}>
                <div className={cn("w-5 h-5 bg-white rounded-full mt-0.5 transition-transform", autoplayTranslate)} />
              </div>
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">Notifications</h2>
          <div className="bg-[#141414] rounded-lg overflow-hidden">
            <button
              onClick={() => updateSettings("notifications", !settings.notifications)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {settings.notifications ? (
                  <Bell className="w-5 h-5 text-gray-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <span>Push Notifications</span>
              </div>
              <div className={cn("w-10 h-6 rounded-full transition-colors", notifBg)}>
                <div className={cn("w-5 h-5 bg-white rounded-full mt-0.5 transition-transform", notifTranslate)} />
              </div>
            </button>
          </div>
        </section>

        {/* Cache */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">Storage</h2>
          <div className="bg-[#141414] rounded-lg overflow-hidden">
            <button
              onClick={handleClearCache}
              className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-red-400"
            >
              <Trash2 className="w-5 h-5" />
              <span>{clearing ? "Clearing..." : "Clear Cache"}</span>
            </button>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">About</h2>
          <div className="bg-[#141414] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <Info className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm">TeluguDB</p>
                <p className="text-xs text-gray-500">Version 1.1.0</p>
              </div>
            </div>
            <a 
              href="https://telugudb.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 pt-0 hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Visit Website</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
