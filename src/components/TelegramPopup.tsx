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
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 touch-manipulation">
      <div 
        className="absolute inset-0 bg-black/60" 
        onClick={handleClose}
      />
      <div className={`relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-1 max-w-md w-full shadow-2xl border border-[#229ED9]/30 transform transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] rounded-xl p-4 sm:p-6">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#229ED9] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Join Our Telegram</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
              Get latest movies, web series updates directly on Telegram
            </p>
            
            <a
              href={channelLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#229ED9] hover:bg-[#1a8ac4] text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-colors text-sm"
            >
              <Send className="w-4 h-4" />
              Join Channel
            </a>
            
            <p className="text-xs text-gray-500 mt-3 sm:mt-4">
              Click outside to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
