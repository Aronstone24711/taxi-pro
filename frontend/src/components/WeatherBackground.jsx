import { useEffect, useState } from "react";

// Gradients (top → bottom). Warmer palettes = better vibe.
const GRADIENTS = {
  clear_dawn:   ["#fde68a", "#fca5a5", "#fbc2eb"],           // sunrise pastel
  clear_day:    ["#bae6fd", "#e0f2fe", "#fef9c3"],           // bright sky
  clear_sunset: ["#fda4af", "#fb923c", "#fbbf24", "#fde68a"],// vivid sunset
  clear_night:  ["#0f172a", "#1e3a8a", "#312e81"],
  cloudy_day:   ["#cbd5e1", "#dbeafe", "#e0e7ff"],
  cloudy_night: ["#1e293b", "#334155", "#475569"],
  rain:         ["#64748b", "#475569", "#1e293b"],
  snow:         ["#e0f2fe", "#f0f9ff", "#f8fafc"],
  thunder:      ["#1e293b", "#4c1d95", "#6b21a8"],
  fog:          ["#cbd5e1", "#e2e8f0", "#f8fafc"],
  default:      ["#dbeafe", "#e0f2fe", "#fef9c3"],
};

const LABELS = {
  clear_dawn: "Sunrise", clear_day: "Clear sky", clear_sunset: "Sunset",
  clear_night: "Clear night", cloudy_day: "Partly cloudy", cloudy_night: "Cloudy night",
  rain: "Rain", snow: "Snow", thunder: "Thunderstorm", fog: "Fog", default: "TaxQuest",
};

function pickGradient(code, isDay, hour) {
  if (code == null) return "default";
  const isDawn   = hour >= 5  && hour <= 7;
  const isSunset = hour >= 17 && hour <= 19;
  if (code === 0) {
    if (isDay && isSunset) return "clear_sunset";
    if (isDay && isDawn)   return "clear_dawn";
    return isDay ? "clear_day" : "clear_night";
  }
  if ([1, 2, 3].includes(code)) return isDay ? "cloudy_day" : "cloudy_night";
  if ([45, 48].includes(code)) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95 && code <= 99) return "thunder";
  return "default";
}

async function fetchWeatherAt(lat, lon) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`
  );
  return res.json();
}

async function ipFallback() {
  try {
    const r = await fetch("https://ipapi.co/json/");
    const d = await r.json();
    if (d?.latitude && d?.longitude) {
      return { lat: d.latitude, lon: d.longitude, city: d.city || d.region || "" };
    }
  } catch (err) {
    console.warn("[taxquest] IP location fallback failed:", err?.message || err);
  }
  return null;
}

export function useWeatherBackground() {
  const [state, setState] = useState({ key: "default", label: "TaxQuest", temp: null, city: "" });

  useEffect(() => {
    let cancelled = false;

    async function run(lat, lon, city = "") {
      try {
        const data = await fetchWeatherAt(lat, lon);
        if (cancelled) return;
        const code = data?.current?.weather_code;
        const isDay = !!data?.current?.is_day;
        const temp = data?.current?.temperature_2m;
        const hour = new Date().getHours();
        const key = pickGradient(code, isDay, hour);
        setState({ key, label: LABELS[key], temp, city });
      } catch (err) {
        console.warn("[taxquest] weather fetch failed:", err?.message || err);
      }
    }

    async function locate() {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => run(pos.coords.latitude, pos.coords.longitude),
          async () => {
            const ip = await ipFallback();
            if (ip && !cancelled) run(ip.lat, ip.lon, ip.city);
          },
          { timeout: 5000, maximumAge: 30 * 60 * 1000 }
        );
      } else {
        const ip = await ipFallback();
        if (ip && !cancelled) run(ip.lat, ip.lon, ip.city);
      }
    }
    locate();
    return () => { cancelled = true; };
  }, []);

  return { ...state, colors: GRADIENTS[state.key] || GRADIENTS.default };
}

export default function WeatherBackground() {
  const { key, label, temp, city, colors } = useWeatherBackground();
  const gradient = `linear-gradient(180deg, ${colors.join(", ")})`;
  const isDark = key === "clear_night" || key === "cloudy_night" || key === "thunder" || key === "rain";

  return (
    <>
      <div
        aria-hidden
        data-testid="weather-bg"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background: gradient,
          transition: "background 900ms ease",
        }}
      />
      {/* Soft translucent overlay for readability */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background: isDark
            ? "linear-gradient(180deg, rgba(15,23,42,0.15), rgba(15,23,42,0.35))"
            : "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.6))",
          pointerEvents: "none",
        }}
      />
      {/* Small chip showing current weather (bottom-left) */}
      <div
        data-testid="weather-chip"
        className={`fixed bottom-4 left-4 z-30 rounded-full px-3 py-1.5 text-[12px] font-medium shadow-sm border ${
          isDark ? "bg-white/20 text-white border-white/30 backdrop-blur" : "bg-white/75 text-slate-800 border-white/60 backdrop-blur"
        }`}
      >
        {label}
        {temp != null && <> · <span className="font-mono">{Math.round(temp)}°</span></>}
        {city && <> · {city}</>}
      </div>
    </>
  );
}
