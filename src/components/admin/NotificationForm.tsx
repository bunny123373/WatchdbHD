"use client";

import { useState } from "react";
import { Bell, Send } from "lucide-react";

export default function NotificationForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;

    setSending(true);

    const notification = {
      id: Date.now().toString(),
      title,
      body,
      time: "Just now",
    };

    const saved = localStorage.getItem("notifications");
    let notifications = saved ? JSON.parse(saved) : [];
    notifications.unshift(notification);
    notifications = notifications.slice(0, 50);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    
    window.dispatchEvent(new CustomEvent("watchdb-notification", { detail: notification }));

    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTitle("");
      setBody("");
      setTimeout(() => setSent(false), 3000);
    }, 1000);
  };

  const presets = [
    { title: "New Movie Added", body: "Check out the latest movies!" },
    { title: "New Episode Released", body: "New episode is now available!" },
    { title: "App Update", body: "We've updated the app with new features!" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter notification title"
          className="w-full bg-white/5 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter notification message"
          rows={3}
          className="w-full bg-white/5 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Quick Templates</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, i) => (
            <button
              key={i}
              onClick={() => {
                setTitle(preset.title);
                setBody(preset.body);
              }}
              className="px-3 py-1.5 bg-white/5 hover:bg-[#3a3a3a] rounded-full text-sm text-gray-300 transition-colors"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={sending || !title.trim() || !body.trim()}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
          sending || !title.trim() || !body.trim()
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : sent
            ? "bg-green-600 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
      >
        {sending ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </>
        ) : sent ? (
          <>
            <Bell className="w-5 h-5" />
            Notification Sent!
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Notification
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        This will notify all app users when they open the app
      </p>
    </div>
  );
}
