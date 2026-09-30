"use client";

import { useState, useEffect } from "react";
import { THEME_PALETTES, GLASS_STYLE } from "@/lib/themes";

export default function GamePlatform() {
  const [themeKey] = useState("rose"); // 테마 고정
  const theme = THEME_PALETTES[themeKey].dark; // 다크모드 고정

  // 디바이스 감지
  const [deviceType, setDeviceType] = useState("pc");
  const isMobile = deviceType === "mobile";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setDeviceType("mobile");
      else if (window.innerWidth <= 1024) setDeviceType("tablet");
      else setDeviceType("pc");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 상태 관리
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("lounge");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // 좌측 날개

  const triggerToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", width: "100vw", backgroundColor: theme.bg, color: theme.text, overflow: "hidden", position: "relative" }}>
      
      {/* ── 🍞 토스트 알림 ── */}
      {toast && (
        <div style={{ ...GLASS_STYLE, position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 99999, backgroundColor: "rgba(24, 20, 22, 0.94)", border: `1px solid ${theme.accent}`, color: "#fff", padding: "10px 20px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "700" }}>
          {toast}
        </div>
      )}

      {/* ── ☰ 좌측 서랍 (모바일일 때 100vw로 화면 전체 덮기) ── */}
      <aside 
        style={{ 
          position: "fixed", 
          top: 0, bottom: 0, left: 0, 
          zIndex: 110,
          width: isMobile ? "100vw" : "320px", // 모바일은 100% 덮음
          transform: isDrawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out",
          backgroundColor: theme.sidebar || "#1e1e24",
          borderRight: `1px solid ${theme.border}`,
          display: "flex", flexDirection: "column"
        }}
      >
        <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "800", fontSize: "1rem" }}>메뉴 서랍</span>
          <button onClick={() => setIsDrawerOpen(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.5rem", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ flex: 1, padding: "20px", textAlign: "center", color: theme.textMuted }}>
          여기에 시나리오 세션 목록이 들어갑니다.
        </div>
      </aside>

      {/* ── 상단 헤더 ── */}
      <header style={{ height: "56px", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: theme.glassPanel, borderBottom: `1px solid ${theme.border}`, zIndex: 40, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => setIsDrawerOpen(true)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.4rem", cursor: "pointer" }}>☰</button>
          <span style={{ fontWeight: "900", fontSize: "1.1rem" }}>시크릿 노벨</span>
        </div>
        <div>
          <span style={{ fontSize: "0.8rem", color: theme.textMuted }}>💧 120</span>
        </div>
      </header>

      {/* ── 중앙 메인 영역 (빈 공간) ── */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h2 style={{ color: theme.textMuted }}>[{activeTab}] 탭 콘텐츠 영역</h2>
      </main>

      {/* ── 하단 세그먼트 글래스 탭바 (아이콘 + 작은 글씨) ── */}
      <nav style={{ 
        position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)", 
        width: "calc(100% - 32px)", maxWidth: "460px", height: "64px", 
        backgroundColor: "rgba(25, 20, 24, 0.65)", backdropFilter: "blur(16px)", 
        border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "22px", 
        display: "flex", overflow: "hidden", zIndex: 50 
      }}>
        {[
          { key: "lounge", icon: "🧭", label: "탐색" },
          { key: "library", icon: "📚", label: "서재" },
          { key: "studio", icon: "✍️", label: "창작" },
          { key: "profile", icon: "👤", label: "내정보" }
        ].map((tab, idx, arr) => {
          const isSelected = activeTab === tab.key;
          const isLast = idx === arr.length - 1;

          return (
            <div
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); triggerToast(`${tab.label} 탭 이동`); }}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "pointer", gap: "4px",
                borderRight: isLast ? "none" : "1px solid rgba(255, 255, 255, 0.08)", // 세로 분할선
                backgroundColor: isSelected ? "rgba(234, 166, 176, 0.2)" : "transparent", // 하이라이트
                color: isSelected ? "#fff" : "rgba(255, 255, 255, 0.4)",
                transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: "1.2rem", transform: isSelected ? "scale(1.15)" : "scale(1)", transition: "transform 0.2s" }}>{tab.icon}</span>
              <span style={{ fontSize: "0.68rem", fontWeight: isSelected ? "800" : "600" }}>{tab.label}</span>
            </div>
          );
        })}
      </nav>

    </div>
  );
}
