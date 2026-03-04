"use client";

import { Share2, Facebook, Twitter, Linkedin, Link2, Check, Mail } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ShareButtonProps {
  title: string;
  url?: string;
  description?: string;
}

export default function ShareButton({ title, url, description }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [nativeShare, setNativeShare] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = `Watch ${title}`;

  useEffect(() => {
    if (typeof window !== "undefined" && "canShare" in navigator) {
      setNativeShare(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: title,
        text: shareText,
        url: currentUrl,
      });
    } catch (err) {
      console.error("Share failed");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy");
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + currentUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(currentUrl)}`,
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowShareMenu(!showShareMenu);
        }}
        type="button"
        className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 hover:bg-gray-600 text-white rounded-lg transition-colors cursor-pointer"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {showShareMenu && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-[#1F232D] rounded-lg shadow-xl z-50 min-w-[240px] border border-[#2a2f3d]">
          {nativeShare && (
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 w-full py-2 mb-3 bg-[#1877F2] hover:bg-[#1867d4] rounded-lg transition-colors text-white font-medium"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via...</span>
            </button>
          )}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 bg-[#1877F2] hover:bg-[#1867d4] rounded-lg transition-colors"
            >
              <Facebook className="w-5 h-5 text-white" />
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 bg-[#1DA1F2] hover:bg-[#1a91da] rounded-lg transition-colors"
            >
              <Twitter className="w-5 h-5 text-white" />
            </a>
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 bg-[#25D366] hover:bg-[#22c25e] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            <a
              href={shareLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 bg-[#0088cc] hover:bg-[#0077b3] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.696.064-1.225-.46-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.477-1.635.099-.003.321.023.465.141.121.1.154.232.17.325.015.094.034.31.019.478z"/>
              </svg>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 bg-[#0A66C2] hover:bg-[#0958a8] rounded-lg transition-colors text-white text-sm"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
            <a
              href={shareLinks.email}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 bg-[#EA4335] hover:bg-[#d33828] rounded-lg transition-colors text-white text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>
          </div>
          
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 w-full py-2 mt-3 bg-[#2a2f3d] hover:bg-[#353b4a] rounded-lg transition-colors text-white"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
