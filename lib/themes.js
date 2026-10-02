// lib/themes.js

export const THEME_PALETTES = {  
  cloud: {
    name: "오트 밀크", // 부드러운 바닐라 & 카페라떼 감성 (기본 테마)
    dark: { 
      bg: "#1a1817", 
      sidebar: "#23201e", 
      panel: "rgba(42, 38, 36, 0.88)", 
      panelAlt: "rgba(54, 50, 47, 0.9)", 
      border: "rgba(235, 227, 218, 0.14)", 
      borderHighlight: "rgba(235, 227, 218, 0.32)",
      text: "#F5F0EB", 
      textMuted: "#A39B92", 
      accent: "#C2B4A3", 
      accentGlow: "rgba(235, 227, 218, 0.2)", 
      danger: "#e06377", 
      warning: "#e8b056", 
      success: "#72d992", 
      inputBg: "#151312",
      polaroidBg: "#ded7cb",
      polaroidText: "#23201e"
    },
    light: { 
      bg: "#F9F7F3", 
      sidebar: "#F0ECE4", 
      panel: "rgba(255, 255, 255, 0.92)", 
      panelAlt: "rgba(247, 243, 237, 0.95)", 
      border: "rgba(120, 105, 90, 0.14)", 
      borderHighlight: "rgba(120, 105, 90, 0.3)",
      text: "#36312E", 
      textMuted: "#8A8179", 
      accent: "#786C60", 
      accentGlow: "rgba(120, 105, 90, 0.15)", 
      danger: "#c84560", 
      warning: "#b07e28", 
      success: "#34824b", 
      inputBg: "#ffffff",
      polaroidBg: "#ffffff",
      polaroidText: "#2d2a26"
    }
  },
  rose: {
    name: "딸기 우유", // 차분한 말린 장미 밀크티 감성
    dark: { 
      bg: "#20181b", 
      sidebar: "#2a1f24", 
      panel: "rgba(56, 42, 48, 0.88)", 
      panelAlt: "rgba(71, 54, 61, 0.9)", 
      border: "rgba(240, 175, 185, 0.18)", 
      borderHighlight: "rgba(240, 175, 185, 0.38)",
      text: "#F8EEF0", 
      textMuted: "#AC969D", 
      accent: "#EAA6B0", 
      accentGlow: "rgba(234, 166, 176, 0.3)", 
      danger: "#f87592", 
      warning: "#E5A475", 
      success: "#72d992", 
      inputBg: "#171214",
      polaroidBg: "#e5dedc",
      polaroidText: "#2a1f24"
    },
    light: { 
      bg: "#FAF4F5", 
      sidebar: "#F3E7EA", 
      panel: "rgba(255, 255, 255, 0.94)", 
      panelAlt: "rgba(252, 246, 247, 0.95)", 
      border: "rgba(190, 130, 140, 0.16)", 
      borderHighlight: "rgba(190, 130, 140, 0.32)",
      text: "#3D2B30", 
      textMuted: "#967E84", 
      accent: "#B87680", 
      accentGlow: "rgba(184, 118, 128, 0.18)", 
      danger: "#c84560", 
      warning: "#b07e28", 
      success: "#34824b", 
      inputBg: "#ffffff",
      polaroidBg: "#ffffff",
      polaroidText: "#3D2B30"
    }
  },
  baltic: {
    name: "블루베리", // 안개 낀 라벤더 & 밀키 페리윙클 감성
    dark: { 
      bg: "#161720", 
      sidebar: "#1d202b", 
      panel: "rgba(38, 42, 58, 0.88)", 
      panelAlt: "rgba(49, 54, 74, 0.9)", 
      border: "rgba(175, 170, 215, 0.18)", 
      borderHighlight: "rgba(175, 170, 215, 0.38)",
      text: "#EFF1F8", 
      textMuted: "#8F94A8", 
      accent: "#ADA8D6", 
      accentGlow: "rgba(173, 168, 214, 0.3)", 
      danger: "#e06377", 
      warning: "#e8b056", 
      success: "#72d992", 
      inputBg: "#111218",
      polaroidBg: "#dddce5",
      polaroidText: "#1d202b"
    },
    light: { 
      bg: "#F3F4F9", 
      sidebar: "#E7E9F3", 
      panel: "rgba(255, 255, 255, 0.94)", 
      panelAlt: "rgba(247, 248, 253, 0.95)", 
      border: "rgba(100, 110, 150, 0.14)", 
      borderHighlight: "rgba(100, 110, 150, 0.3)",
      text: "#262936", 
      textMuted: "#767C92", 
      accent: "#5C6382", 
      accentGlow: "rgba(92, 99, 130, 0.16)", 
      danger: "#c84560", 
      warning: "#b07e28", 
      success: "#34824b", 
      inputBg: "#ffffff",
      polaroidBg: "#ffffff",
      polaroidText: "#262936"
    }
  },
  dopa: {
    name: "도파 네온", // 1020 타겟 딥 다크 & 네온 핑크 감성
    light: {
      bg: "#fcfcfc",
      panel: "#ffffff",
      panelAlt: "#f8f9fa",
      border: "#e5e7eb",
      borderHighlight: "#8B00FF", 
      text: "#0A0A0C",
      textMuted: "#6b7280",
      accent: "#FF0055", 
      accentGlow: "rgba(255, 0, 85, 0.3)",
      danger: "#ef4444",
      success: "#10b981",
      warning: "#f59e0b",
      sidebar: "#ffffff",
      inputBg: "#f3f4f6",
      polaroidBg: "#ffffff",
      polaroidText: "#0A0A0C"
    },
    dark: {
      bg: "#0A0A0C", 
      panel: "#140E1B", 
      panelAlt: "#1F1529",
      border: "#2A1E38",
      borderHighlight: "#8B00FF", 
      text: "#f8fafc",
      textMuted: "#94a3b8",
      accent: "#FF0055", 
      accentGlow: "rgba(255, 0, 85, 0.4)", 
      danger: "#f43f5e",
      success: "#10b981",
      warning: "#fbbf24",
      sidebar: "#0A0A0C",
      inputBg: "#1A1325",
      polaroidBg: "#1F1529",
      polaroidText: "#f8fafc"
    }
  }
};

export const GLASS_STYLE = {
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
  transition: "background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease"
};
