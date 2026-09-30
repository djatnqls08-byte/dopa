"use client";

import { useState, useEffect } from "react";
import { THEME_PALETTES, GLASS_STYLE } from "@/lib/themes";

export default function GameApp() {
  // 테마 상태
  const [themeKey] = useState("cloud");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const currentPalette = THEME_PALETTES[themeKey] || THEME_PALETTES.cloud;
  const theme = isDarkMode ? currentPalette.dark : currentPalette.light;

  // 디바이스 반응형 감지
  const [deviceType, setDeviceType] = useState("pc");
  const isMobile = deviceType === "mobile";

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) setDeviceType("mobile");
      else if (w <= 1024) setDeviceType("tablet");
      else setDeviceType("pc");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 토스트 알림 상태
  const [toast, setToast] = useState(null);
  const triggerToast = (title, message = "", icon = "✨") => {
    setToast({ title, message, icon });
    setTimeout(() => setToast(null), 2500);
  };

  // 하단 탭바 상태
  const [activeTab, setActiveTab] = useState("studio");

  // 서랍(사이드바) 열림 상태
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 세션 진행 상태
  const [activeSession, setActiveSession] = useState(null);

  // 3대 모드 선택
  const [selectedMode, setSelectedMode] = useState("추리");

  // 입력 데이터
  const [playPreference, setPlayPreference] = useState("#GL #쌍방구원 #달달");
  const [scenarioTitle, setScenarioTitle] = useState("재로 덮인 요람");
  const [victimName, setVictimName] = useState("고진태 대표 (52세)");
  const [publicSynopsis, setPublicSynopsis] = useState("늦은 저녁, 비상등이 점멸하는 지하 주차장에서 시작되는 이야기.");
  
  // 인게임 메시지
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = () => {
    setActiveSession({
      title: scenarioTitle || "새로운 서사",
      mode: selectedMode,
      preference: playPreference
    });
    setMessages([
      {
        role: "model",
        text: `서늘한 지하 주차장, 빗물 젖은 세단의 비상등이 깜빡입니다.\n\n“조사관님, 현장에 도착하셨습니까? 피해자 ${victimName}의 차량 주변은 이미 통제되었습니다.”`
      }
    ]);
    triggerToast("이야기 개막", `[${selectedMode}] 모드로 본편에 진입합니다.`, "📖");
  };

  const handleSendMessage = () => {
    if (!inputMsg.trim() || isLoading) return;
    const userText = inputMsg.trim();
    setInputMsg("");

    const updated = [...messages, { role: "user", text: `“${userText}”` }];
    setMessages(updated);
    setIsLoading(true);

    setTimeout(() => {
      setMessages([
        ...updated,
        {
          role: "model",
          text: `서류철을 넘기는 손가락 끝이 미세하게 떨립니다.\n\n“그 단서가 가리키는 방향이 맞다면…… 용의자 중 한 명은 거짓을 말하고 있군요.”`
        }
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div style={{ display: "flex", height: "100dvh", width: "100vw", backgroundColor: theme?.bg || "#111", color: theme?.text || "#fff", overflow: "hidden", position: "relative", fontFamily: "'Pretendard', sans-serif" }}>
      
      {/* 🍞 토스트 알림 */}
      {toast && (
        <div onClick={() => setToast(null)} style={{ ...GLASS_STYLE, position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 99999, backgroundColor: "rgba(20, 18, 19, 0.95)", border: `1px solid ${theme.accent}`, color: "#fff", padding: "10px 18px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", cursor: "pointer" }}>
          <span>{toast.icon}</span>
          <span style={{ fontSize: "0.84rem", fontWeight: "800" }}>{toast.title}</span>
          {toast.message && <span style={{ fontSize: "0.76rem", opacity: 0.8 }}>{toast.message}</span>}
        </div>
      )}

      {/* ── ☰ 좌측 서랍 ── */}
      {isDrawerOpen && (
        <div 
          onClick={() => setIsDrawerOpen(false)} 
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", zIndex: 100 }} 
        />
      )}

      <aside style={{
        position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 110,
        width: isMobile ? "100vw" : "340px",
        transform: isDrawerOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
        backgroundColor: theme.sidebar || "#181716",
        borderRight: `1px solid ${theme.border}`,
        display: "flex", flexDirection: "column",
        boxShadow: isDrawerOpen ? "8px 0 32px rgba(0,0,0,0.4)" : "none"
      }}>
        <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "900", fontSize: "1rem" }}>시나리오 서랍</span>
          <button onClick={() => setIsDrawerOpen(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.4rem", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ padding: "14px", backgroundColor: theme.panel, borderRadius: "10px", border: `1px solid ${theme.border}` }}>
            <div style={{ fontWeight: "800", fontSize: "0.9rem" }}>재로 덮인 요람</div>
            <div style={{ fontSize: "0.72rem", color: theme.textMuted, marginTop: "4px" }}>추리 · 09. 30. 오전 02:13</div>
          </div>
        </div>
        <div style={{ padding: "14px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: "8px" }}>
          <button onClick={() => triggerToast("환경 설정", "준비 중입니다.", "⚙️")} style={{ flex: 1, padding: "10px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}>⚙ 설정</button>
          <button onClick={() => triggerToast("데이터 관리", "준비 중입니다.", "💾")} style={{ flex: 1, padding: "10px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}>💾 백업</button>
        </div>
      </aside>

      {/* ── 메인 콘텐츠 뷰 ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        
        {/* 상단 툴바 헤더 */}
        <header style={{ height: "54px", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.glassPanel, flexShrink: 0, zIndex: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={() => setIsDrawerOpen(true)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.3rem", cursor: "pointer", padding: "4px" }}>☰</button>
            <span style={{ fontWeight: "900", fontSize: "0.95rem" }}>
              {activeSession ? activeSession.title : "새로운 서사의 시작"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {!activeSession ? (
              <>
                <button onClick={() => triggerToast("공식 시나리오", "목록을 엽니다.", "⭐")} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.accent}`, borderRadius: "14px", cursor: "pointer" }}>
                  <span>⭐</span>
                  <span style={{ fontSize: "0.72rem", fontWeight: "800", color: theme.text }}>공식</span>
                </button>
                <button onClick={() => triggerToast("저장", "세팅이 저장되었습니다.", "💾")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>💾</button>
              </>
            ) : (
              <button onClick={() => setActiveSession(null)} style={{ padding: "4px 10px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}>로비로 나가기</button>
            )}
            <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>{isDarkMode ? "☀️" : "🌙"}</button>
          </div>
        </header>

        {/* ── [A. 로비 뷰: 세션 세팅 화면] ── */}
        {!activeSession ? (
          <main style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px 16px", maxWidth: "860px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "18px", boxSizing: "border-box" }}>
            
            {/* 1. 룰 시스템 선택 */}
            <section style={{ ...GLASS_STYLE, padding: "18px", backgroundColor: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "12px", color: theme.text }}>
                1. 룰 시스템 선택
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "10px" }}>
                {[
                  { key: "추리", icon: "🕵️", title: "추리", desc: "단서를 모아 진상을 파헤치는 두뇌 수사" },
                  { key: "연애", icon: "🌸", title: "연애", desc: "선택지와 관계성 중심의 감성 서사" },
                  { key: "괴담", icon: "🕯️", title: "괴담", desc: "이면을 밝히고 침식을 견디는 종막 결전" }
                ].map(m => {
                  const isSel = selectedMode === m.key;
                  return (
                    <div
                      key={m.key}
                      onClick={() => { setSelectedMode(m.key); triggerToast(`[${m.title}] 모드 선택`, m.desc, m.icon); }}
                      style={{
                        padding: "14px", borderRadius: "12px", cursor: "pointer",
                        backgroundColor: isSel ? theme.panelAlt : "transparent",
                        border: `1.5px solid ${isSel ? theme.accent : theme.border}`,
                        display: "flex", alignItems: "center", gap: "10px",
                        boxShadow: isSel ? theme.accentGlow : "none"
                      }}
                    >
                      <span style={{ fontSize: "1.6rem" }}>{m.icon}</span>
                      <div>
                        <div style={{ fontWeight: "900", fontSize: "0.9rem", color: isSel ? theme.accent : theme.text }}>{m.title}</div>
                        <div style={{ fontSize: "0.7rem", color: theme.textMuted, marginTop: "2px" }}>{m.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 2. 장르 톤 태그 */}
            <section style={{ ...GLASS_STYLE, padding: "18px", backgroundColor: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "800", color: theme.text }}>2. 장르 톤 (서사 지향 태그)</span>
                <span style={{ fontSize: "0.72rem", color: theme.textMuted }}>터치하여 켜고 끄기</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {["#GL", "#BL", "#HL", "#논로맨스", "#집착", "#혐관", "#쌍방구원", "#우정", "#R19", "#피폐", "#애증", "#신분차", "#배틀", "#계약", "#착각", "#구원", "#짝사랑", "#달달", "#일상", "#오컬트", "#이능력"].map(tag => {
                  const isSelected = playPreference.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const list = playPreference.split(/\s+/).filter(Boolean);
                        const next = isSelected ? list.filter(t => t !== tag).join(" ") : [...list, tag].join(" ");
                        setPlayPreference(next);
                        triggerToast("태그 변경", isSelected ? `[${tag}] 해제` : `[${tag}] 추가`, "🏷️");
                      }}
                      style={{
                        padding: "5px 11px", borderRadius: "16px", fontSize: "0.76rem",
                        fontWeight: isSelected ? "800" : "500",
                        backgroundColor: isSelected ? theme.accent : (isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                        color: isSelected ? "#ffffff" : theme.text,
                        border: `1px solid ${isSelected ? theme.accent : theme.border}`,
                        cursor: "pointer"
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <input 
                type="text" 
                value={playPreference} 
                onChange={e => setPlayPreference(e.target.value)} 
                placeholder="직접 태그 입력..." 
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.84rem", outline: "none" }} 
              />
            </section>

            {/* 3. 사건 기본 개요서 */}
            <section style={{ ...GLASS_STYLE, padding: "18px", backgroundColor: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📋</span>
                <span style={{ fontWeight: "900", fontSize: "0.92rem", color: theme.text }}>사건 개요서</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "10px" }}>
                <input 
                  type="text" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} 
                  placeholder="사건명 (예: 지하 주차장의 밀실 살인)" 
                  style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} 
                />
                <input 
                  type="text" value={victimName} onChange={e => setVictimName(e.target.value)} 
                  placeholder="피해자 (예: 고진태 대표, 52세)" 
                  style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} 
                />
              </div>
              <textarea 
                rows={2} value={publicSynopsis} onChange={e => setPublicSynopsis(e.target.value)} 
                placeholder="사건 발생 개요 및 고립된 현장 상황..." 
                style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} 
              />
            </section>

            {/* 4. 용의자 및 인물 수사망 (폴라로이드 핀 보드) */}
            <section style={{ ...GLASS_STYLE, padding: "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ef4444", fontSize: "1rem" }}>📌</span>
                  <span style={{ fontWeight: "900", fontSize: "0.95rem", color: theme.text }}>용의자 및 인물 수사망</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => triggerToast("용의자 추가", "새로운 수사 카드를 핀으로 고정합니다.", "📌")} 
                  style={{ padding: "5px 12px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.accent}`, borderRadius: "14px", color: theme.accent, fontSize: "0.75rem", fontWeight: "800", cursor: "pointer" }}
                >
                  ＋ 인물 추가
                </button>
              </div>

              {/* 폴라로이드 카드 그리드 */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "14px" }}>
                {/* 카드 1 */}
                <div style={{ backgroundColor: "#ffffff", borderRadius: "6px", padding: "10px 10px 14px 10px", color: "#1a1a1a", boxShadow: "0 8px 20px rgba(0,0,0,0.35)", position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444", zIndex: 2 }} />
                  <div style={{ width: "100%", height: "160px", backgroundColor: "#222", overflow: "hidden", borderRadius: "2px" }}>
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80" alt="베아트리스" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ marginTop: "10px", textAlign: "center", width: "100%" }}>
                    <div style={{ fontWeight: "900", fontSize: "0.92rem", color: "#111" }}>베아트리스 크로포드</div>
                    <div style={{ fontSize: "0.7rem", color: "#666", fontWeight: "600", marginTop: "2px" }}>가문 전속 주치의</div>
                    <div style={{ fontSize: "0.72rem", color: "#888", fontStyle: "italic", marginTop: "6px", borderTop: "1px dashed #ddd", paddingTop: "6px" }}>
                      “진료 기록 검토 중”
                    </div>
                  </div>
                </div>

                {/* 카드 2 */}
                <div style={{ backgroundColor: "#ffffff", borderRadius: "6px", padding: "10px 10px 14px 10px", color: "#1a1a1a", boxShadow: "0 8px 20px rgba(0,0,0,0.35)", position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444", zIndex: 2 }} />
                  <div style={{ width: "100%", height: "160px", backgroundColor: "#222", overflow: "hidden", borderRadius: "2px" }}>
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80" alt="아가사" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ marginTop: "10px", textAlign: "center", width: "100%" }}>
                    <div style={{ fontWeight: "900", fontSize: "0.92rem", color: "#111" }}>아가사 애쉬우드</div>
                    <div style={{ fontSize: "0.7rem", color: "#666", fontWeight: "600", marginTop: "2px" }}>귀족 (엘리너의 여동생)</div>
                    <div style={{ fontSize: "0.72rem", color: "#888", fontStyle: "italic", marginTop: "6px", borderTop: "1px dashed #ddd", paddingTop: "6px" }}>
                      “언니는 저주받은 거야!”
                    </div>
                  </div>
                </div>

                {/* 카드 3 */}
                <div style={{ backgroundColor: "#ffffff", borderRadius: "6px", padding: "10px 10px 14px 10px", color: "#1a1a1a", boxShadow: "0 8px 20px rgba(0,0,0,0.35)", position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444", zIndex: 2 }} />
                  <div style={{ width: "100%", height: "160px", backgroundColor: "#222", overflow: "hidden", borderRadius: "2px" }}>
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80" alt="엘리자베스" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ marginTop: "10px", textAlign: "center", width: "100%" }}>
                    <div style={{ fontWeight: "900", fontSize: "0.92rem", color: "#111" }}>엘리자베스 페어팩스</div>
                    <div style={{ fontSize: "0.7rem", color: "#666", fontWeight: "600", marginTop: "2px" }}>저택 메이드장</div>
                    <div style={{ fontSize: "0.72rem", color: "#888", fontStyle: "italic", marginTop: "6px", borderTop: "1px dashed #ddd", paddingTop: "6px" }}>
                      “제가 조금만 일찍 문을……”
                    </div>
                  </div>
                </div>
              </div>

              {/* 🔒 [스포일러 방지 접기] */}
              <details style={{ marginTop: "6px", backgroundColor: isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)", borderRadius: "10px", border: `1px dashed ${theme.border}`, overflow: "hidden" }}>
                <summary style={{ padding: "12px 14px", fontSize: "0.82rem", fontWeight: "800", color: theme.accent, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", userSelect: "none" }}>
                  <span>🔒</span> 용의자별 상세 알리바이 및 숨겨진 비밀 수정 (스포일러 방지 블록)
                </summary>
                <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px", borderTop: `1px solid ${theme.border}` }}>
                  <input type="text" placeholder="선택된 인물 알리바이" style={{ padding: "8px 12px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem" }} />
                  <input type="text" placeholder="🔒 심문 성공 시 밝혀질 숨겨진 치부/비밀" style={{ padding: "8px 12px", borderRadius: "6px", border: `1px solid ${theme.accent}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem" }} />
                </div>
              </details>
            </section>

            {/* 5. 확보된 증거 및 물증 쪽지 */}
            <section style={{ ...GLASS_STYLE, padding: "18px", backgroundColor: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📰</span>
                  <span style={{ fontWeight: "900", fontSize: "0.92rem", color: theme.text }}>확보된 증거 및 사건 파일</span>
                </div>
                <button type="button" onClick={() => triggerToast("물증 쪽지 추가", "새로운 단서 쪽지를 붙입니다.", "📌")} style={{ padding: "4px 10px", backgroundColor: "transparent", border: `1px dashed ${theme.accent}`, borderRadius: "12px", color: theme.accent, fontSize: "0.74rem", fontWeight: "800", cursor: "pointer" }}>
                  ＋ 단서 추가
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ padding: "10px 14px", backgroundColor: isDarkMode ? "rgba(56, 189, 248, 0.12)" : "#e0f2fe", borderLeft: "3px solid #38bdf8", borderRadius: "4px", minWidth: "220px" }}>
                  <div style={{ fontWeight: "800", fontSize: "0.82rem", color: "#38bdf8" }}>블랙 커피</div>
                  <div style={{ fontSize: "0.74rem", color: theme.textMuted, marginTop: "2px" }}>베아트리스가 즐겨 마시는 쌉싸름한 음료</div>
                </div>
              </div>
            </section>

            {/* 6. 진상 기밀 봉투 */}
            <details style={{ ...GLASS_STYLE, backgroundColor: isDarkMode ? "rgba(25, 15, 18, 0.7)" : "rgba(254, 242, 242, 0.8)", borderRadius: "16px", border: `1.5px solid ${theme.accent}`, overflow: "hidden" }}>
              <summary style={{ padding: "16px 18px", fontSize: "0.88rem", fontWeight: "900", color: theme.accent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", userSelect: "none" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>✉️</span> 사건 진상 기밀 봉투 (스포일러 주의 · 터치하여 열람)
                </span>
                <span style={{ fontSize: "0.72rem", color: theme.textMuted }}>[기밀 잠금]</span>
              </summary>
              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px", borderTop: `1px solid ${theme.border}` }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: "10px" }}>
                  <input type="text" placeholder="진범 지목 (예: 베아트리스 크로포드)" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                  <input type="text" placeholder="결정적 트릭 (예: 커피잔에 바른 수면제와 사망 추정 시각 조작)" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                </div>
              </div>
            </details>

            {/* 7. 시나리오 시작 버튼 */}
            <button
              onClick={handleStartGame}
              style={{
                width: "100%", padding: "16px", borderRadius: "14px",
                backgroundColor: theme.accent, color: "#fff", border: "none",
                fontWeight: "900", fontSize: "1rem", cursor: "pointer",
                boxShadow: theme.accentGlow, marginTop: "6px"
              }}
            >
              이야기 시작하기 (본편 입장) ➔
            </button>
          </main>
        ) : (
          /* ── [B. 인게임 뷰: 소설 본문] ── */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 90px 20px", display: "flex", flexDirection: "column", gap: "18px", maxWidth: "760px", margin: "0 auto", width: "100%", boxSizing: "border-box", fontSize: "0.95rem", lineHeight: 2 }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ color: m.role === "user" ? theme.accent : theme.text, fontWeight: m.role === "user" ? "700" : "400" }}>
                  {m.text}
                </div>
              ))}
              {isLoading && <div style={{ color: theme.textMuted, fontSize: "0.82rem", fontStyle: "italic" }}>서사가 이어지는 중……</div>}
            </div>

            <footer style={{ position: "sticky", bottom: 0, padding: "12px 16px max(16px, env(safe-area-inset-bottom))", backgroundColor: theme.glassPanel, borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: "600px", display: "flex", gap: "8px" }}>
                <input
                  type="text" value={inputMsg} onChange={e => setInputMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
                  placeholder="대사나 행동을 입력하세요..."
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "20px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, outline: "none" }}
                />
                <button onClick={handleSendMessage} style={{ padding: "0 18px", borderRadius: "20px", backgroundColor: theme.accent, color: "#fff", border: "none", fontWeight: "800", cursor: "pointer" }}>전송</button>
              </div>
            </footer>
          </div>
        )}

        {/* ── 하단 세그먼트 글래스 탭바 ── */}
        {!activeSession && (
          <nav style={{
            position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)",
            width: "calc(100% - 32px)", maxWidth: "440px", height: "62px",
            backgroundColor: "rgba(22, 19, 21, 0.65)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "20px",
            display: "flex", overflow: "hidden", zIndex: 50,
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.45)"
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
                  onClick={() => { setActiveTab(tab.key); triggerToast(`[${tab.label}] 탭 전환`, "", tab.icon); }}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", gap: "2px",
                    borderRight: isLast ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                    backgroundColor: isSelected ? "rgba(234, 166, 176, 0.2)" : "transparent",
                    color: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                    transition: "all 0.2s"
                  }}
                >
                  <span style={{ fontSize: "1.15rem", transform: isSelected ? "scale(1.12)" : "scale(1)" }}>{tab.icon}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: isSelected ? "800" : "600" }}>{tab.label}</span>
                </div>
              );
            })}
          </nav>
        )}

      </div>
    </div>
  );
}
