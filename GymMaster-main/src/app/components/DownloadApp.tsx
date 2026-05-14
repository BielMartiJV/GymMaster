import { Smartphone, Download, X } from "lucide-react";
import { useState, useEffect } from "react";

const APK_DISMISSED_KEY = "apk-dismissed";
const MOBILE_QUERY = "(max-width: 767px)";

function canSuggestApk() {
  if (typeof window === "undefined") return false;

  const isNarrowViewport = window.matchMedia(MOBILE_QUERY).matches;
  const hasMobileUserAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);

  return isNarrowViewport || hasMobileUserAgent;
}

export function DownloadApp() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const hasDismissed = window.sessionStorage.getItem(APK_DISMISSED_KEY) === "true";
    setIsDismissed(hasDismissed);

    let timer: number | undefined;

    const updateVisibility = () => {
      window.clearTimeout(timer);

      if (hasDismissed || !canSuggestApk()) {
        setIsVisible(false);
        return;
      }

      timer = window.setTimeout(() => setIsVisible(true), 800);
    };

    updateVisibility();

    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    mediaQuery.addEventListener("change", updateVisibility);
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.clearTimeout(timer);
      mediaQuery.removeEventListener("change", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    window.sessionStorage.setItem(APK_DISMISSED_KEY, "true");
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div
      className="fixed left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-in fade-in slide-in-from-bottom-8 duration-500"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      role="region"
      aria-label="Descàrrega de l'app GymMaster"
    >
      <div
        className="relative overflow-hidden rounded-lg p-4 pr-10 shadow-2xl border border-white/20 backdrop-blur-xl"
        style={{
          background: "linear-gradient(135deg, rgba(27, 38, 59, 0.95) 0%, rgba(65, 90, 119, 0.9) 100%)",
        }}
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gymmaster-accent/20 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gymmaster-accent/10 blur-[60px] rounded-full" />

        <div className="relative flex items-center gap-4">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center shadow-inner"
            style={{ backgroundColor: "rgba(0, 180, 216, 0.15)" }}
          >
            <Smartphone className="w-6 h-6 text-gymmaster-accent" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-sm leading-tight">Porta el gimnàs a la butxaca</h4>
            <p className="text-gray-300 text-xs mt-1">Descarrega l'app oficial de GymMaster</p>
          </div>

          <a
            href="/GymMaster.apk"
            download="GymMaster.apk"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-gymmaster-accent/20"
            style={{
              backgroundColor: "#00B4D8",
              backgroundImage: "linear-gradient(to right, #00B4D8, #0077A8)",
            }}
          >
            <Download className="w-4 h-4" />
            <span>APK</span>
          </a>

          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Tancar avís de descàrrega"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
