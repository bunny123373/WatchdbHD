"use client";

import { useState, useEffect } from "react";
import { X, Send } from "lucide-react";

interface TelegramPopupProps {
  channelLink?: string;
}

export default function TelegramPopup({ channelLink = "https://t.me/yourchannel" }: TelegramPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("telegram_popup_seen");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    sessionStorage.setItem("telegram_popup_seen", "true");
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60" 
        onClick={handleClose}
      />
      <div className={`relative bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#333] transform transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-[#229ED9] rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Join Our Telegram</h3>
          <p className="text-gray-400 text-sm mb-4">
            Get latest movies, web series updates directly on Telegram
          </p>
          
          <a
            href={channelLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#229ED9] hover:bg-[#1a8ac4] text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
          >
            <Send className="w-4 h-4" />
            Join Channel
          </a>
          
          <p className="text-xs text-gray-500 mt-4">
            Click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}
