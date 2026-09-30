"use client";

import { useState, useEffect } from "react";
import { THEME_PALETTES, GLASS_STYLE } from "@/lib/themes";

export default function GamePlatform() {
  const [themeKey] = useState("rose");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? THEME_PALETTES[themeKey].dark : THEME_PALETTES[themeKey].light;

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

  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("lounge");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const triggerToast = (title, message = "", icon = "✨") => {
    setToast({ title, message, icon });
    setTimeout(() => setToast(null), 2500);
  };

  // ── [더미 데이터] ──
  const SESSIONS = [
    { id: "s1", title: "재로 덮인 요람", mode: "FREEFORM", date: "09. 30. 오전 02:13", bg: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
    { id: "s2", title: "시간의 톱니바퀴", mode: "FREEFORM", date: "09. 29. 오후 08:24", bg: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80" },
    { id: "s3", title: "달그림자 경매장의 밤", mode: "DATING", date: "09. 29. 오후 08:20", bg: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80" }
  ];

  const OFFICIALS = [
    { id: "o1", title: "눈 내리는 산장", mode: "추리", tags: ["#밀실", "#수사극"], bg: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
    { id: "o2", title: "거짓말의 온도", mode: "연애", tags: ["#혐관", "#오피스"], bg: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80" },
    { id: "o3", title: "심연의 부름", mode: "괴담", tags: ["#오컬트", "#광기"], bg: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", width: "100vw", backgroundColor: theme.bg, color: theme.text, overflow: "hidden", position: "relative" }}>
      
      {/* 🍞 토스트 알림 */}
      {toast && (
        <div onClick={() => setToast(null)} style={{ ...GLASS_STYLE, position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 99999, backgroundColor: "rgba(20, 18, 19, 0.95)", border: `1px solid ${theme.accent}`, color: "#fff", padding: "12px 20px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", cursor: "pointer", animation: "fadeIn 0.2s" }}>
          <span style={{ fontSize: "1.3rem" }}>{toast.icon}</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.accent }}>{toast.title}</span>
            {toast.message && <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)" }}>{toast.message}</span>}
          </div>
        </div>
      )}

      {/* ── ☰ 좌측 시나리오 서랍 (모바일은 100vw 풀스크린) ── */}
      {isDrawerOpen && !isMobile && (
        <div onClick={() => setIsDrawerOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100 }} />
      )}
      
      <aside style={{ position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 110, width: isMobile ? "100vw" : "360px", transform: isDrawerOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)", backgroundColor: theme.sidebar || "#1e1e24", borderRight: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", boxShadow: isDrawerOpen ? "10px 0 40px rgba(0,0,0,0.4)" : "none" }}>
        
        {/* 서랍 헤더: 새 시나리오 & 닫기 */}
        <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => { setIsDrawerOpen(false); triggerToast("새 시나리오", "새로운 서사 작성을 시작합니다.", "✨"); }} style={{ flex: 1, padding: "12px", backgroundColor: theme.accent, color: "#fff", border: "none", borderRadius: "12px", fontWeight: "800", fontSize: "0.9rem", cursor: "pointer" }}>
            ＋ 새 시나리오
          </button>
          <button onClick={() => setIsDrawerOpen(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer", padding: "8px" }}>✕</button>
        </div>

        {/* 세션 리스트 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {SESSIONS.map(s => (
            <div key={s.id} onClick={() => { setIsDrawerOpen(false); triggerToast("세션 로드", `[${s.title}] 불러오는 중...`, "📖"); }} style={{ ...GLASS_STYLE, backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "14px", overflow: "hidden", cursor: "pointer" }}>
              <div style={{ width: "100%", height: "110px", position: "relative" }}>
                <img src={s.bg} alt="bg" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                <button style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "6px", padding: "4px 6px", cursor: "pointer", backdropFilter: "blur(4px)" }}>🗑️</button>
              </div>
              <div style={{ padding: "12px" }}>
                <div style={{ fontWeight: "800", fontSize: "0.9rem", marginBottom: "4px", color: theme.text }}>{s.title}</div>
                <div style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", marginBottom: "4px" }}>{s.mode}</div>
                <div style={{ fontSize: "0.68rem", color: theme.textMuted, display: "flex", justifyContent: "space-between" }}>
                  <span>🕒 {s.date}</span>
                  <span style={{ color: theme.accent }}>🔄</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 설정/데이터 관리 */}
        <div style={{ padding: "16px", borderTop: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "8px", backgroundColor: theme.panelAlt }}>
          <button onClick={() => triggerToast("환경 설정", "설정 모달 오픈", "⚙️")} style={{ width: "100%", padding: "10px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "10px", color: theme.text, fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><span>⚙️</span> 환경 설정</button>
          <button onClick={() => triggerToast("데이터 관리", "백업/내보내기 모달 오픈", "💾")} style={{ width: "100%", padding: "10px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "10px", color: theme.text, fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><span>💾</span> 데이터 관리</button>
        </div>
      </aside>

      {/* ── 상단 헤더 ── */}
      <header style={{ height: "56px", padding: isMobile ? "0 12px" : "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: theme.glassPanel, borderBottom: `1px solid ${theme.border}`, zIndex: 40, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => setIsDrawerOpen(true)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.4rem", cursor: "pointer", padding: "4px" }}>☰</button>
          <span style={{ fontWeight: "900", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>시크릿 노벨</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => triggerToast("공식 시나리오", "추천 시나리오 목록입니다.", "⭐")} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.accent}`, borderRadius: "16px", cursor: "pointer" }}>
            <span style={{ fontSize: "0.85rem" }}>⭐</span>
            {!isMobile && <span style={{ fontSize: "0.75rem", fontWeight: "800", color: theme.text }}>공식 시나리오</span>}
            <span style={{ backgroundColor: "#ef4444", color: "#fff", fontSize: "0.6rem", fontWeight: "900", padding: "1px 4px", borderRadius: "6px" }}>HOT</span>
          </button>
          <button onClick={() => triggerToast("불러오기", "세팅 불러오기", "📁")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: theme.textMuted }}>📁</button>
          <button onClick={() => triggerToast("저장", "현재 세팅 저장", "💾")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: theme.textMuted }}>💾</button>
          <button onClick={() => triggerToast("공지사항", "업데이트 노트", "📢")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.15rem", color: theme.textMuted }}>📢</button>
          <button onClick={() => { setIsDarkMode(!isDarkMode); triggerToast("테마 변경", isDarkMode ? "라이트 모드" : "다크 모드", isDarkMode ? "☀️" : "🌙"); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.15rem", color: theme.textMuted }}>{isDarkMode ? "☀️" : "🌙"}</button>
        </div>
      </header>

      {/* ── 중앙 메인 영역 ── */}
      <main style={{ flex: 1, overflowY: "auto", position: "relative", paddingBottom: "100px" }}>
        
        {/* 🧭 [탐색 (라운지) 탭] */}
        {activeTab === "lounge" && (
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            
            {/* 1. 히어로 배너 (공식 추천작) */}
            <div style={{ position: "relative", width: "100%", height: isMobile ? "320px" : "420px", backgroundColor: "#000", display: "flex", alignItems: "flex-end", padding: isMobile ? "24px 20px" : "40px 60px", overflow: "hidden" }}>
              <img src={OFFICIALS[0].bg} alt="hero" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,12,14,0.95) 0%, transparent 100%)" }} />
              
              <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: "900", color: "#fff", backgroundColor: "#ef4444", padding: "2px 8px", borderRadius: "4px" }}>HOT</span>
                  <span style={{ fontSize: "0.7rem", fontWeight: "800", color: theme.accent, border: `1px solid ${theme.accent}`, padding: "2px 8px", borderRadius: "4px" }}>{OFFICIALS[0].mode}</span>
                </div>
                <h1 style={{ margin: 0, fontSize: isMobile ? "1.8rem" : "2.6rem", fontWeight: "900", color: "#fff", letterSpacing: "-0.03em" }}>{OFFICIALS[0].title}</h1>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>차갑게 식어버린 진실의 파편을 맞춰라.</p>
                <button onClick={() => triggerToast("시작", "본편으로 진입합니다.", "▶️")} style={{ marginTop: "12px", alignSelf: "flex-start", padding: "12px 24px", borderRadius: "30px", backgroundColor: "#fff", color: "#000", border: "none", fontSize: "0.9rem", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 24px rgba(255,255,255,0.2)" }}>
                  <span>▶</span> 지금 바로 시작하기
                </button>
              </div>
            </div>

            {/* 2. 시나리오 리스트 그리드 */}
            <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", padding: "32px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900" }}>새로운 서사의 시작</h2>
                  {/* 🔰 튜토리얼 버튼 복구 */}
                  <button onClick={() => triggerToast("튜토리얼", "가이드를 엽니다.", "🔰")} style={{ padding: "4px 10px", backgroundColor: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)", borderRadius: "12px", color: "#f59e0b", fontSize: "0.75rem", fontWeight: "800", cursor: "pointer" }}>🔰 3분 튜토리얼</button>
                </div>
                <button style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "0.85rem", fontWeight: "700", cursor: "pointer" }}>전체보기</button>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                {OFFICIALS.slice(1).map(s => (
                  <div key={s.id} onClick={() => triggerToast("상세 보기", `${s.title} 정보를 엽니다.`, "📖")} style={{ ...GLASS_STYLE, backgroundColor: theme.panel, borderRadius: "16px", overflow: "hidden", border: `1px solid ${theme.border}`, cursor: "pointer", display: "flex", flexDirection: "column" }}>
                    <div style={{ width: "100%", height: "150px", position: "relative" }}>
                      <img src={s.bg} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                      <div style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "8px", fontSize: "0.65rem", fontWeight: "800", color: "#fff", backdropFilter: "blur(4px)" }}>{s.mode}</div>
                    </div>
                    <div style={{ padding: "16px" }}>
                      <div style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "6px" }}>{s.title}</div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {s.tags.map(t => <span key={t} style={{ fontSize: "0.72rem", color: theme.accent, fontWeight: "700" }}>{t}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 다른 탭 임시 뷰 */}
        {activeTab !== "lounge" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: theme.textMuted, fontWeight: "700" }}>
            [{activeTab}] 화면은 다음 스텝에서 연결됩니다.
          </div>
        )}
      </main>

      {/* ── 하단 세그먼트 글래스 탭바 ── */}
      <nav style={{ position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: "460px", height: "64px", backgroundColor: "rgba(25, 20, 24, 0.65)", backdropFilter: "blur(16px)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "22px", display: "flex", overflow: "hidden", zIndex: 50, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
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
              onClick={() => { setActiveTab(tab.key); triggerToast(`${tab.label} 이동`, "", tab.icon); }}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "pointer", gap: "4px",
                borderRight: isLast ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                backgroundColor: isSelected ? "rgba(234, 166, 176, 0.2)" : "transparent",
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
