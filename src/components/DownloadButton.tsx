"use client";

import { Download } from "lucide-react";
import { isDirectFileUrl, downloadFile } from "@/utils/url";

interface DownloadButtonProps {
  url: string;
  title: string;
  className?: string;
}

export default function DownloadButton({ url, title, className = "" }: DownloadButtonProps) {
  const handleDownload = () => {
    if (isDirectFileUrl(url)) {
      downloadFile(url, `${title}.mp4`);
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <button
      onClick={handleDownload}
      className={className}
    >
      <Download className="w-4 h-4" />
      <span>Download</span>
    </button>
  );
}
