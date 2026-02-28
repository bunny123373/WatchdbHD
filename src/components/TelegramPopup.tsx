"use client";

import { useState, useEffect } from "react";
import { X, Send, MessageCircle } from "lucide-react";

interface TelegramPopupProps {
  channelLink?: string;
}

export default function TelegramPopup({ channelLink = "https://t.me/yourchannel" }: TelegramPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const timer = setTimeout(() => {
      const lastClosed = localStorage.getItem("telegram_popup_closed");
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (!lastClosed || (now - parseInt(lastClosed)) > oneDay) {
        setIsVisible(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    localStorage.setItem("telegram_popup_closed", Date.now().toString());
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isMounted) return null;
  
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] touch-manipulation">
      <div className={`relative bg-gradient-to-r from-[#229ED9] to-[#1a8ac4] shadow-lg transform transition-all duration-300 ${isClosing ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
        <button
          onClick={handleClose}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-3 px-4 py-3">
          <MessageCircle className="w-5 h-5 text-white flex-shrink-0" />
          <p className="text-white text-sm font-medium text-center">
            Join our Telegram for latest movies & web series updates
          </p>
          <a
            href={channelLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white text-[#229ED9] font-semibold px-3 py-1.5 rounded-full text-xs transition-colors flex-shrink-0"
          >
            <Send className="w-3 h-3" />
            Join
          </a>
        </div>
      </div>
    </div>
  );
}
