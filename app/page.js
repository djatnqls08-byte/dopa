// app/page.js
"use client";

import { useState } from "react";
import { THEME_PALETTES, GLASS_STYLE } from "@/lib/themes";

export default function GameLobby() {
  // 테마 상태
  const [themeKey] = useState("rose");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? THEME_PALETTES[themeKey].dark : THEME_PALETTES[themeKey].light;

  // 1. 토스트 알림 상태
  const [toast, setToast] = useState(null); // { message, icon }

  const triggerToast = (message, icon = "✨") => {
    setToast({ message, icon });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // 2. 3대 모드 선택 상태 (기본값: 추리)
  const [selectedMode, setSelectedMode] = useState("추리");

  const MODES = [
    {
      key: "추리",
      icon: "🕵️",
      title: "추리",
      desc: "현장 조사와 알리바이 심문, 물증 조합으로 진상을 밝혀내는 두뇌 수사극"
    },
    {
      key: "연애",
      icon: "🌸",
      title: "연애",
      desc: "인물과의 절제된 거리감, 대화와 교감을 통해 쌓아가는 감성 서사"
    },
    {
      key: "괴담",
      icon: "🕯️",
      title: "괴담",
      desc: "인물과 장소의 숨겨진 이면을 들추고, 침식되는 정신을 지키며 맞는 종막"
    }
  ];

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: theme.bg,
        color: theme.text,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxSizing: "border-box"
      }}
    >
      {/* 🍞 최상단 플로팅 토스트 알림 */}
      {toast && (
        <div
          onClick={() => setToast(null)}
          style={{
            ...GLASS_STYLE,
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            backgroundColor: "rgba(25, 23, 24, 0.94)",
            border: `1.5px solid ${theme.accent}`,
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.84rem",
            fontWeight: "700",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
            cursor: "pointer"
          }}
        >
          <span>{toast.icon}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* 상단 시스템 헤더 */}
      <header
        style={{
          ...GLASS_STYLE,
          height: "54px",
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.border}`,
          backgroundColor: theme.glassPanel,
          position: "sticky",
          top: 0,
          zIndex: 40
        }}
      >
        <span style={{ fontWeight: "900", fontSize: "1rem", letterSpacing: "-0.5px" }}>
          시크릿 노벨
        </span>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.1rem",
            padding: "4px"
          }}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </header>

      {/* 로비 메인 컨테이너 */}
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          margin: "0 auto",
          padding: "20px 16px 80px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxSizing: "border-box"
        }}
      >
        {/* 타이틀 안내 */}
        <div>
          <h1
            style={{
              margin: "0 0 6px 0",
              fontSize: "1.45rem",
              fontWeight: "900",
              color: theme.text,
              letterSpacing: "-0.5px"
            }}
          >
            새로운 이야기의 무대
          </h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: theme.textMuted }}>
            원하는 장르를 선택하면 규칙과 도구가 맞춤 설정됩니다.
          </p>
        </div>

        {/* 1. 3대 모드 비주얼 카드 선택기 */}
        <section style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: "800", color: theme.accent }}>
            1. 무대 모드 선택
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            {MODES.map((mode) => {
              const isSelected = selectedMode === mode.key;
              return (
                <div
                  key={mode.key}
                  onClick={() => {
                    setSelectedMode(mode.key);
                    triggerToast(`[${mode.title}] 모드가 선택되었습니다.`, mode.icon);
                  }}
                  style={{
                    ...GLASS_STYLE,
                    padding: "16px 10px",
                    borderRadius: "16px",
                    backgroundColor: isSelected ? theme.glassPanelAlt : "transparent",
                    border: `1.5px solid ${isSelected ? theme.accent : theme.border}`,
                    cursor: "pointer",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: isSelected ? theme.accentGlow : "none"
                  }}
                >
                  <span style={{ fontSize: "1.6rem" }}>{mode.icon}</span>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "900",
                      color: isSelected ? theme.accent : theme.text
                    }}
                  >
                    {mode.title}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: theme.textMuted,
                      lineHeight: "1.3",
                      wordBreak: "keep-all"
                    }}
                  >
                    {mode.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 다음 단계(Step 2): 인덱스 서류철 캐비닛이 연결될 자리 ── */}
        <div
          style={{
            ...GLASS_STYLE,
            padding: "24px",
            borderRadius: "18px",
            border: `1.5px dashed ${theme.border}`,
            textAlign: "center",
            color: theme.textMuted,
            fontSize: "0.82rem"
          }}
        >
          📁 Step 2: 다인원 서류철 캐비닛(내 프로필 + 등장인물 탭 + 재능 슬롯) 연결 대기 중
        </div>
      </div>
    </main>
  );
}
