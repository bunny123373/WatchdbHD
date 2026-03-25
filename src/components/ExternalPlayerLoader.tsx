"use client";

import { useEffect } from "react";

const EXTERNAL_PLAYER_URL = process.env.NEXT_PUBLIC_EXTERNAL_PLAYER_URL || "//site.com/playerjs.js";

export default function ExternalPlayerLoader() {
  useEffect(() => {
    const existingScript = document.querySelector(`script[src="${EXTERNAL_PLAYER_URL}"]`);
    
    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = EXTERNAL_PLAYER_URL;
    script.async = true;
    script.type = "text/javascript";
    script.setAttribute("data-loaded", "true");
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}