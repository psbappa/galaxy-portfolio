"use client";

import { useEffect, useState } from "react";
import RealGalaxy from "@/components/RealGalaxy";
import { getExperienceContext } from "@/lib/experience";

export default function Page() {
  const [text, setText] = useState<string | null>(null);
  const [showGalaxy, setShowGalaxy] = useState(false);

  useEffect(() => {
    const ctx = getExperienceContext();

    // timeline orchestration
    setTimeout(() => {
      setText(ctx.introText);
    }, 1500);

    setTimeout(() => {
      setText(null);
      setShowGalaxy(true);
    }, 2000);
  }, []);

  const shareOnWhatsApp = () => {
    const name = localStorage.getItem("galaxy_user") || "Explorer";
    const url = `${window.location.origin}?from=whatsapp&name=${encodeURIComponent(
      name
    )}`;

    const message = `🌌 Check this insane galaxy experience 🔥\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  return (
    <>
      <main className="fixed inset-0" style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        {text && (
          <div className="intro-text">
            {text}
          </div>
        )}
        {showGalaxy && <RealGalaxy />}

        {showGalaxy && (
          <button className="share-btn" onClick={shareOnWhatsApp}>
            🚀 Send your galaxy
          </button>
        )}

      </main>
    </>
  );
}
