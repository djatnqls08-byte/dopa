// lib/themes.js
export const THEME_PALETTES = {
  rose: {
    name: "딸기 우유",
    dark: {
      bg: "linear-gradient(135deg, #181214 0%, #24161b 50%, #151013 100%)",
      glassPanel: "rgba(45, 30, 36, 0.65)",
      glassPanelAlt: "rgba(60, 40, 48, 0.75)",
      border: "rgba(240, 175, 185, 0.22)",
      borderHighlight: "rgba(240, 175, 185, 0.45)",
      text: "#F8EEF0",
      textMuted: "#B8A2A8",
      accent: "#EAA6B0",
      accentGlow: "0 0 20px rgba(234, 166, 176, 0.4)",
      danger: "#f87592",
      success: "#72d992"
    },
    light: {
      bg: "linear-gradient(135deg, #FAF4F5 0%, #F5EAEF 50%, #F0E3E8 100%)",
      glassPanel: "rgba(255, 255, 255, 0.75)",
      glassPanelAlt: "rgba(255, 245, 247, 0.85)",
      border: "rgba(184, 118, 128, 0.2)",
      borderHighlight: "rgba(184, 118, 128, 0.4)",
      text: "#3D2B30",
      textMuted: "#8F787E",
      accent: "#B87680",
      accentGlow: "0 0 16px rgba(184, 118, 128, 0.25)",
      danger: "#c84560",
      success: "#34824b"
    }
  },
  cloud: {
    name: "오트 밀크",
    dark: {
      bg: "linear-gradient(135deg, #171615 0%, #201e1c 50%, #141312 100%)",
      glassPanel: "rgba(38, 35, 33, 0.68)",
      glassPanelAlt: "rgba(50, 46, 43, 0.8)",
      border: "rgba(235, 227, 218, 0.18)",
      borderHighlight: "rgba(235, 227, 218, 0.35)",
      text: "#F5F0EB",
      textMuted: "#A39B92",
      accent: "#C2B4A3",
      accentGlow: "0 0 20px rgba(194, 180, 163, 0.35)",
      danger: "#e06377",
      success: "#72d992"
    },
    light: {
      bg: "linear-gradient(135deg, #F9F7F3 0%, #F3EFE8 50%, #ECE6DC 100%)",
      glassPanel: "rgba(255, 255, 255, 0.78)",
      glassPanelAlt: "rgba(247, 243, 237, 0.88)",
      border: "rgba(120, 108, 96, 0.18)",
      borderHighlight: "rgba(120, 108, 96, 0.35)",
      text: "#36312E",
      textMuted: "#8A8179",
      accent: "#786C60",
      accentGlow: "0 0 16px rgba(120, 108, 96, 0.2)",
      danger: "#c84560",
      success: "#34824b"
    }
  }
};

export const GLASS_STYLE = {
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.18)",
  transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)"
};
