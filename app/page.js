"use client";

import { useState, useEffect } from "react";
import { THEME_PALETTES, GLASS_STYLE } from "@/lib/themes";

export default function GameLobby() {
  // ── [1. 테마 & 반응형 디바이스 감지] ──
  const [themeKey] = useState("cloud"); // 기본 오트밀크(다크) 테마
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const currentPalette = THEME_PALETTES[themeKey] || THEME_PALETTES.cloud;
  const theme = isDarkMode ? currentPalette.dark : currentPalette.light;

  const [deviceType, setDeviceType] = useState("pc");
  const isMobile = deviceType === "mobile";

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setDeviceType("mobile");
      else if (width <= 1024) setDeviceType("tablet");
      else setDeviceType("pc");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── [2. 시스템 토스트 알림 상태] ──
  const [toast, setToast] = useState(null);
  const triggerToast = (title, message = "", icon = "✨") => {
    setToast({ title, message, icon });
    setTimeout(() => setToast(null), 2500);
  };

  // ── [3. 네비게이션 & 서랍 상태] ──
  const [activeTab, setActiveTab] = useState("lounge");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState("추리");

  // ── [4. 더미 데이터] ──
  const [sessions, setSessions] = useState([
    { id: "s1", title: "재로 덮인 요람", mode: "추리", date: "09. 30. 오전 02:13", thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80" },
    { id: "s2", title: "시간의 톱니바퀴", mode: "괴담", date: "09. 29. 오후 08:24", thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80" },
    { id: "s3", title: "달그림자 경매장의 밤과 세 개의 시선", mode: "연애", date: "09. 29. 오후 08:20", thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80" }
  ]);

  const OFFICIAL_SCENARIOS = [
    { id: "o1", title: "재로 덮인 요람", mode: "추리", tags: ["#수사극", "#고립된저택"], bg: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80" },
    { id: "o2", title: "달그림자 경매장의 밤", mode: "연애", tags: ["#혐관", "#쌍방구원"], bg: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80" },
    { id: "o3", title: "시간의 톱니바퀴", mode: "괴담", tags: ["#오컬트", "#시간루프"], bg: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80" }
  ];

  return (
    <div style={{ display: "flex", height: "100dvh", width: "100vw", backgroundColor: theme?.bg || "#111827", color: theme?.text || "#fff", overflow: "hidden", position: "relative", fontFamily: "'Pretendard', sans-serif" }}>
      
      {/* 🍞 글로벌 토스트 알림 */}
      {toast && (
        <div onClick={() => setToast(null)} style={{ ...GLASS_STYLE, position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 99999, backgroundColor: "rgba(24, 20, 22, 0.94)", border: `1.5px solid ${theme.accent}`, color: "#ffffff", padding: "10px 18px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 12px 36px rgba(0, 0, 0, 0.45)", cursor: "pointer", maxWidth: "min(420px, 92vw)", animation: "fadeIn 0.2s ease-out" }}>
          <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{toast.icon}</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.84rem", fontWeight: "800", color: theme.accent }}>{toast.title}</span>
            {toast.message && <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", marginTop: "2px" }}>{toast.message}</span>}
          </div>
        </div>
      )}

      {/* ── ☰ [좌측 시나리오 세션 목록 서랍] ── */}
      {isMobile && isDrawerOpen && (
        <div onClick={() => setIsDrawerOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(4px)", zIndex: 100 }} />
      )}

      <aside style={{ position: isMobile ? "fixed" : "relative", zIndex: isMobile ? 110 : 1, left: 0, top: 0, bottom: 0, width: isMobile ? "86vw" : isDrawerOpen ? "280px" : "0px", minWidth: isMobile ? "auto" : isDrawerOpen ? "280px" : "0px", maxWidth: "340px", transform: isMobile ? (isDrawerOpen ? "translateX(0)" : "translateX(-100%)") : "none", transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)", backgroundColor: theme.sidebar || theme.glassPanelAlt, borderRight: isDrawerOpen ? `1.5px solid ${theme.border}` : "none", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden", boxShadow: isDrawerOpen ? "6px 0 30px rgba(0, 0, 0, 0.2)" : "none" }}>
        <div style={{ padding: "14px", borderBottom: `1px solid ${theme.border}`, display: "flex", gap: "8px" }}>
          <button type="button" onClick={() => { triggerToast("새 시나리오", "새로운 서사 입력창이 활성화되었습니다.", "✨"); if (isMobile) setIsDrawerOpen(false); }} style={{ flex: 1, padding: "10px", backgroundColor: theme.accent, color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "800", fontSize: "0.85rem", boxShadow: theme.accentGlow }}>
            ＋ 새 시나리오
          </button>
          {isMobile && <button type="button" onClick={() => setIsDrawerOpen(false)} style={{ padding: "8px 12px", backgroundColor: "transparent", border: `1px solid ${theme.border}`, color: theme.text, borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>✕</button>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {sessions.map((s) => (
            <div key={s.id} onClick={() => { triggerToast("시나리오 선택", `《${s.title}》 서사를 불러옵니다.`, "📖"); if (isMobile) setIsDrawerOpen(false); }} style={{ ...GLASS_STYLE, borderRadius: "12px", backgroundColor: theme.glassPanel, border: `1px solid ${theme.border}`, cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column", transition: "border-color 0.15s ease" }}>
              <div style={{ width: "100%", height: "90px", backgroundColor: "#000", position: "relative" }}>
                <img src={s.thumbnail} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
                <span style={{ position: "absolute", top: "6px", right: "6px", padding: "2px 7px", backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", borderRadius: "6px", fontSize: "0.65rem", fontWeight: "800", color: theme.accent }}>{s.mode}</span>
              </div>
              <div style={{ padding: "8px 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4px" }}>
                  <div style={{ fontWeight: "800", fontSize: "0.82rem", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); if (confirm(`'${s.title}' 시나리오를 삭제하시겠습니까?`)) setSessions(sessions.filter((item) => item.id !== s.id)); }} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", padding: "0 2px", fontSize: "0.78rem" }}>🗑️</button>
                </div>
                <div style={{ fontSize: "0.68rem", color: theme.textMuted, marginTop: "4px" }}>🕒 {s.date}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 12px", borderTop: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "6px", backgroundColor: theme.sidebar || theme.glassPanelAlt }}>
          <button type="button" onClick={() => triggerToast("환경 설정", "설정창 준비 중입니다.", "⚙️")} style={{ width: "100%", padding: "8px 12px", backgroundColor: theme.glassPanel, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.78rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><span>⚙️</span><span>환경 설정</span></button>
          <button type="button" onClick={() => triggerToast("데이터 관리", "백업 메뉴 준비 중입니다.", "💾")} style={{ width: "100%", padding: "8px 12px", backgroundColor: theme.glassPanel, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.78rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><span>💾</span><span>데이터 관리</span></button>
        </div>
      </aside>

      {/* ── [중앙 메인 영역: 반응형 본문] ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        
        {/* 상단 툴바 헤더 */}
        <header style={{ ...GLASS_STYLE, height: "54px", padding: isMobile ? "0 12px" : "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.glassPanel, position: "sticky", top: 0, zIndex: 40, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button type="button" onClick={() => setIsDrawerOpen(!isDrawerOpen)} title="시나리오 서랍" style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: isDrawerOpen ? theme.accent : theme.text, padding: "4px" }}>☰</button>
            <span style={{ fontWeight: "900", fontSize: isMobile ? "0.88rem" : "0.96rem", color: theme.text }}>로비 (세션 생성)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "4px" : "8px" }}>
            <button type="button" onClick={() => triggerToast("공식 시나리오", "공식 추천 시나리오 목록입니다.", "⭐")} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: isMobile ? "4px 8px" : "5px 12px", backgroundColor: theme.glassPanelAlt, border: `1.5px solid ${theme.accent}`, borderRadius: "20px", cursor: "pointer" }}>
              <span style={{ fontSize: "0.85rem" }}>⭐</span>
              {!isMobile && <span style={{ fontSize: "0.78rem", fontWeight: "800", color: theme.text }}>공식 시나리오</span>}
              <span style={{ backgroundColor: theme.danger || "#ef4444", color: "#fff", fontSize: "0.58rem", fontWeight: "900", padding: "1px 5px", borderRadius: "8px" }}>HOT</span>
            </button>
            <button type="button" onClick={() => triggerToast("세팅 불러오기", "세팅을 선택해주세요.", "📁")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", padding: "4px" }}>📁</button>
            <button type="button" onClick={() => triggerToast("세팅 저장", "세팅이 저장되었습니다.", "💾")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", padding: "4px" }}>💾</button>
            <button type="button" onClick={() => triggerToast("공지사항", "업데이트 노트", "📢")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.15rem", padding: "4px" }}>📢</button>
            <button type="button" onClick={() => { setIsDarkMode(!isDarkMode); triggerToast("모드 전환", "테마가 변경되었습니다.", isDarkMode ? "☀️" : "🌙"); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.15rem", padding: "4px" }}>{isDarkMode ? "☀️" : "🌙"}</button>
          </div>
        </header>

        {/* ── 콘텐츠 뷰포트 (탭 전환) ── */}
        <main style={{ flex: 1, overflowY: "auto", position: "relative", paddingBottom: "100px" }}>
          
          {/* 🧭 [탭 1: 탐색 (라운지)] */}
          {activeTab === "lounge" && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* 히어로 배너 */}
              <div style={{ position: "relative", width: "100%", height: isMobile ? "320px" : "440px", backgroundColor: "#000", display: "flex", alignItems: "flex-end", padding: isMobile ? "24px 20px" : "40px", overflow: "hidden" }}>
                <img src={OFFICIAL_SCENARIOS[0].bg} alt="메인 배너" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15, 12, 14, 0.95) 0%, transparent 100%)" }} />
                
                <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "8px", maxWidth: "860px", margin: "0 auto", width: "100%" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: "900", color: "#fff", backgroundColor: theme.danger || "#ef4444", padding: "2px 8px", borderRadius: "4px" }}>HOT</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: "800", color: theme.accent, border: `1px solid ${theme.accent}`, padding: "2px 8px", borderRadius: "4px" }}>{OFFICIAL_SCENARIOS[0].mode}</span>
                  </div>
                  <h1 style={{ margin: 0, fontSize: isMobile ? "1.8rem" : "2.6rem", fontWeight: "900", color: "#fff", letterSpacing: "-0.03em" }}>{OFFICIAL_SCENARIOS[0].title}</h1>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>차갑게 식어버린 진실의 파편을 맞춰라.</p>
                  <button onClick={() => triggerToast("플레이 준비", "내 이름을 설정하고 본편으로 진입합니다.", "▶️")} style={{ marginTop: "12px", alignSelf: "flex-start", padding: "12px 24px", borderRadius: "30px", backgroundColor: "#fff", color: "#000", border: "none", fontSize: "0.9rem", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>▶</span> 지금 바로 시작하기
                  </button>
                </div>
              </div>

              {/* 쇼케이스 리스트 */}
              <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", padding: "24px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
                  <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: theme.text }}>⭐ 추천 시나리오</h2>
                  <button style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "0.85rem", fontWeight: "700", cursor: "pointer" }}>전체보기</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {OFFICIAL_SCENARIOS.slice(1).map(s => (
                    <div key={s.id} onClick={() => triggerToast("상세 보기", `${s.title}의 상세 정보를 확인합니다.`, "📖")} style={{ ...GLASS_STYLE, backgroundColor: theme.glassPanel, borderRadius: "16px", overflow: "hidden", border: `1px solid ${theme.border}`, cursor: "pointer", display: "flex", flexDirection: "column" }}>
                      <div style={{ width: "100%", height: "160px", backgroundColor: "#000", position: "relative" }}>
                        <img src={s.bg} alt="bg" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                        <div style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "8px", fontSize: "0.68rem", fontWeight: "800", color: "#fff", backdropFilter: "blur(4px)" }}>{s.mode}</div>
                      </div>
                      <div style={{ padding: "16px" }}>
                        <div style={{ fontSize: "1.05rem", fontWeight: "800", marginBottom: "6px", color: theme.text }}>{s.title}</div>
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

          {/* ✍️ [탭 3: 창작 (스튜디오 콘솔)] */}
          {activeTab === "studio" && (
            <div style={{ maxWidth: "860px", margin: "0 auto", width: "100%", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h1 style={{ margin: "0 0 6px 0", fontSize: "1.6rem", fontWeight: "900", letterSpacing: "-0.5px" }}>서류철 제작 콘솔</h1>
                <p style={{ margin: 0, fontSize: "0.85rem", color: theme.textMuted }}>나만의 시나리오와 등장인물을 설정하여 새로운 세계를 엽니다.</p>
              </div>

              <div style={{ ...GLASS_STYLE, padding: "20px", backgroundColor: theme.glassPanel, borderRadius: "20px", border: `1.5px solid ${theme.borderHighlight || theme.border}` }}>
                <h3 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", color: theme.accent, fontWeight: "800" }}>1. 이야기 무대 (모드) 선택</h3>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "10px" }}>
                  {[
                    { key: "추리", icon: "🕵️", label: "추리", desc: "사건과 물증" },
                    { key: "연애", icon: "🌸", label: "연애", desc: "관계와 유대" },
                    { key: "괴담", icon: "🕯️", label: "괴담", desc: "이면과 침식" }
                  ].map(m => (
                    <div 
                      key={m.key} 
                      onClick={() => { setSelectedRule(m.key); triggerToast(`[${m.label}] 모드`, "규칙이 변경되었습니다.", m.icon); }}
                      style={{ padding: "16px", borderRadius: "14px", backgroundColor: selectedRule === m.key ? theme.glassPanelAlt : "transparent", border: `1.5px solid ${selectedRule === m.key ? theme.accent : theme.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}
                    >
                      <span style={{ fontSize: "1.8rem" }}>{m.icon}</span>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: "900", color: selectedRule === m.key ? theme.accent : theme.text }}>{m.label}</span>
                        <span style={{ fontSize: "0.72rem", color: theme.textMuted }}>{m.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 인덱스 서류철 캐비닛 (Step 2 뼈대) */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: "4px", paddingLeft: "12px" }}>
                  <div style={{ padding: "10px 20px", backgroundColor: theme.glassPanelAlt, border: `1.5px solid ${theme.borderHighlight || theme.border}`, borderBottom: "none", borderRadius: "12px 12px 0 0", fontSize: "0.85rem", fontWeight: "800", color: theme.accent, zIndex: 2, position: "relative" }}>📁 내 프로필</div>
                  <div style={{ padding: "10px 20px", backgroundColor: "rgba(0,0,0,0.1)", border: `1px solid ${theme.border}`, borderBottom: "none", borderRadius: "12px 12px 0 0", fontSize: "0.85rem", fontWeight: "600", color: theme.textMuted, cursor: "pointer" }}>📁 파트너</div>
                  <div style={{ padding: "10px 14px", backgroundColor: "transparent", border: "none", fontSize: "0.85rem", fontWeight: "800", color: theme.textMuted, cursor: "pointer" }}>＋ 추가</div>
                </div>
                <div style={{ ...GLASS_STYLE, padding: "24px", backgroundColor: theme.glassPanelAlt, border: `1.5px solid ${theme.borderHighlight || theme.border}`, borderRadius: "16px", marginTop: "-1px", position: "relative", zIndex: 1, minHeight: "300px" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexDirection: isMobile ? "column" : "row" }}>
                    <div style={{ width: "90px", height: "90px", borderRadius: "50%", border: `2px dashed ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.2)", flexShrink: 0 }}>
                      <span style={{ fontSize: "0.75rem", color: theme.textMuted }}>초상화</span>
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div><label style={{ fontSize: "0.75rem", color: theme.accent, fontWeight: "800" }}>이름</label><input type="text" placeholder="서지언" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg || "rgba(0,0,0,0.3)", color: theme.text, marginTop: "4px", outline: "none" }} /></div>
                        <div><label style={{ fontSize: "0.75rem", color: theme.accent, fontWeight: "800" }}>나이</label><input type="text" placeholder="24" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg || "rgba(0,0,0,0.3)", color: theme.text, marginTop: "4px", outline: "none" }} /></div>
                      </div>
                      <div><label style={{ fontSize: "0.75rem", color: theme.accent, fontWeight: "800" }}>신분 / 직업</label><input type="text" placeholder="기획실 비서" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg || "rgba(0,0,0,0.3)", color: theme.text, marginTop: "4px", outline: "none" }} /></div>
                      
                      {selectedRule === "괴담" && (
                        <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "10px", border: `1px dashed ${theme.border}` }}>
                          <div style={{ fontSize: "0.75rem", color: theme.warning || "#f59e0b", fontWeight: "800", marginBottom: "8px" }}>💎 장착한 재능 (최대 3개)</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            <span style={{ padding: "4px 10px", borderRadius: "12px", backgroundColor: theme.warning || "#f59e0b", color: "#000", fontSize: "0.75rem", fontWeight: "800" }}>#예리한_관찰</span>
                            <span style={{ padding: "4px 10px", borderRadius: "12px", backgroundColor: theme.warning || "#f59e0b", color: "#000", fontSize: "0.75rem", fontWeight: "800" }}>#은밀한_행동</span>
                            <span style={{ padding: "4px 10px", borderRadius: "12px", border: `1px dashed ${theme.warning || "#f59e0b"}`, color: theme.warning || "#f59e0b", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}>+ 슬롯 추가</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={() => triggerToast("로딩 중", "시나리오 환경을 구성하고 있습니다.", "⏳")} style={{ width: "100%", padding: "18px", borderRadius: "16px", backgroundColor: theme.accent, color: "#fff", border: "none", fontSize: "1.05rem", fontWeight: "900", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.2)", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                <span>▶</span> 게임 콘솔 부팅 및 시작
              </button>
            </div>
          )}

          {/* 📚 서재 / 👤 내정보 탭 */}
          {(activeTab === "library" || activeTab === "profile") && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: theme.textMuted }}>
              아직 {activeTab === "library" ? "서류가 비어있습니다." : "정보가 없습니다."}
            </div>
          )}
        </main>
      </div>

      {/* ── 📱 하단 세그먼트 글래스 탭바 ── */}
      <nav style={{ position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: "460px", height: "64px", backgroundColor: "rgba(25, 20, 24, 0.65)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.14)", borderRadius: "22px", display: "flex", alignItems: "stretch", overflow: "hidden", boxShadow: "0 14px 40px rgba(0, 0, 0, 0.45)", zIndex: 50 }}>
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
              onClick={() => { setActiveTab(tab.key); triggerToast(`[${tab.label}]`, "탭으로 전환되었습니다.", tab.icon); }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRight: isLast ? "none" : "1px solid rgba(255, 255, 255, 0.08)", backgroundColor: isSelected ? "rgba(234, 166, 176, 0.18)" : "transparent", color: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.4)", transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)", gap: "3px" }}
            >
              <span style={{ fontSize: "1.2rem", transform: isSelected ? "scale(1.15)" : "scale(1)", transition: "transform 0.2s" }}>{tab.icon}</span>
              <span style={{ fontSize: "0.68rem", fontWeight: isSelected ? "800" : "600", opacity: isSelected ? 1 : 0.8 }}>{tab.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
