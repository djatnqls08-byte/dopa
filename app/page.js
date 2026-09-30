"use client";

import { useState, useEffect, useRef } from "react";
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

  // 하단 탭바 상태 (기본: 라운지 탐색)
  const [activeTab, setActiveTab] = useState("studio");

  // 서랍(사이드바) 열림 상태
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 세션 진행 상태 (null이면 로비, 객체가 있으면 인게임 소설 본문)
  const [activeSession, setActiveSession] = useState(null);

  // 🌟 교체 대상 1: 3대 핵심 모드 선택 상태 (기본값: 추리)
  const [selectedMode, setSelectedMode] = useState("추리");

  // 로비 입력 폼 상태 (기존 폼 100% 보존)
  const [playPreference, setPlayPreference] = useState("#GL #쌍방구원 #달달");
  const [charName, setCharName] = useState("서지언");
  const [charGender, setCharGender] = useState("여성");
  const [charAge, setCharAge] = useState("24");
  const [charJob, setCharJob] = useState("기획실 비서");
  const [charBackground, setCharBackground] = useState("차분하고 눈치가 빠른 성격.");
  const [charSecret, setCharSecret] = useState("");

  const [partnerName, setPartnerName] = useState("백서원");
  const [partnerGender, setPartnerGender] = useState("여성");
  const [partnerAge, setPartnerAge] = useState("28");
  const [partnerJob, setPartnerJob] = useState("기획 1팀 팀장");
  const [partnerDetail, setPartnerDetail] = useState("냉철하지만 내면에 깊은 고뇌를 품고 있다.");

  const [scenarioTitle, setScenarioTitle] = useState("재로 덮인 요람");
  const [publicSynopsis, setPublicSynopsis] = useState("늦은 저녁, 비상등이 점멸하는 지하 주차장에서 시작되는 이야기.");
  const [openingScene, setOpeningScene] = useState("서늘한 주차장 공기 사이로 익숙한 세단의 차창이 내려앉습니다.");

  // 인게임 메시지 및 입력 상태
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 이야기 시작하기 실행 함수 (인게임 진입)
  const handleStartGame = () => {
    if (!charName.trim()) return alert("주인공 이름을 입력해주세요.");
    
    const newSessionData = {
      title: scenarioTitle || "새로운 이야기",
      mode: selectedMode,
      preference: playPreference,
      pc: { name: charName, job: charJob, age: charAge, gender: charGender },
      partner: { name: partnerName, job: partnerJob, age: partnerAge, gender: partnerGender },
      day: 1,
      phase: "저녁"
    };

    setActiveSession(newSessionData);
    setMessages([
      {
        role: "model",
        text: `${openingScene}\n\n차창 너머로 서류를 정리하던 ${partnerName}의 시선이 당신에게 머뭅니다.\n\n“${charName} 씨. 시간 맞춰 내려왔네요. 타요.”`
      }
    ]);
    triggerToast("이야기 개막", `[${selectedMode}] 모드로 본편에 진입합니다.`, "📖");
  };

  // 인게임 대사 전송
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
          text: `서류철을 덮는 손가락 끝이 미세하게 굳어 있습니다.\n\n“글쎄요, ${charName} 씨가 그렇게 생각한다면…… 오늘은 조금 다른 길로 가볼까요.”`
        }
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div style={{ display: "flex", height: "100dvh", width: "100vw", backgroundColor: theme.bg, color: theme.text, overflow: "hidden", position: "relative" }}>
      
      {/* 🍞 토스트 알림 */}
      {toast && (
        <div onClick={() => setToast(null)} style={{ ...GLASS_STYLE, position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 99999, backgroundColor: "rgba(20, 18, 19, 0.95)", border: `1px solid ${theme.accent}`, color: "#fff", padding: "10px 18px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", cursor: "pointer" }}>
          <span>{toast.icon}</span>
          <span style={{ fontSize: "0.84rem", fontWeight: "800" }}>{toast.title}</span>
          {toast.message && <span style={{ fontSize: "0.76rem", opacity: 0.8 }}>{toast.message}</span>}
        </div>
      )}

      {/* ── ☰ 좌측 서랍 (모바일은 100vw 전체화면을 빈틈없이 덮음) ── */}
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
          <button onClick={() => triggerToast("환경 설정", "준비 중입니다.", "⚙️")} style={{ flex: 1, padding: "10px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}>⚙️️ 설정</button>
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
            
            {/* 🌟 교체 포인트 1: 3대 핵심 모드 선택기 */}
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

            {/* 2. 장르 톤 태그 (기존 것 보존) */}
            <section style={{ ...GLASS_STYLE, padding: "18px", backgroundColor: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "8px" }}>2. 장르 톤 (해시태그)</div>
              <input type="text" value={playPreference} onChange={e => setPlayPreference(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem" }} />
            </section>

            {/* 3. 프로필 입력 카드 (기존 것 보존) */}
            <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div style={{ ...GLASS_STYLE, padding: "16px", backgroundColor: theme.panel, borderRadius: "14px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontWeight: "800", fontSize: "0.85rem", color: theme.accent }}>내 프로필</div>
                <input type="text" value={charName} onChange={e => setCharName(e.target.value)} placeholder="이름" style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem" }} />
                <input type="text" value={charJob} onChange={e => setCharJob(e.target.value)} placeholder="직업 / 역할" style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem" }} />
                <textarea rows={2} value={charBackground} onChange={e => setCharBackground(e.target.value)} placeholder="성격 및 특징" style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", resize: "none" }} />
              </div>

              <div style={{ ...GLASS_STYLE, padding: "16px", backgroundColor: theme.panel, borderRadius: "14px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontWeight: "800", fontSize: "0.85rem", color: theme.accent }}>상대방 (등장인물)</div>
                <input type="text" value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="상대 이름" style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem" }} />
                <input type="text" value={partnerJob} onChange={e => setPartnerJob(e.target.value)} placeholder="상대 직업 / 역할" style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem" }} />
                <textarea rows={2} value={partnerDetail} onChange={e => setPartnerDetail(e.target.value)} placeholder="외모 및 나와의 관계성" style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", resize: "none" }} />
              </div>
            </section>

            {/* 4. 시나리오 시작 버튼 (기존 동작 100% 보존) */}
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
          /* ── [B. 인게임 뷰: 소설 리더 본문] ── */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 90px 20px", display: "flex", flexDirection: "column", gap: "18px", maxWidth: "760px", margin: "0 auto", width: "100%", boxSizing: "border-box", fontSize: "0.95rem", lineHeight: 2 }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ color: m.role === "user" ? theme.accent : theme.text, fontWeight: m.role === "user" ? "700" : "400" }}>
                  {m.text}
                </div>
              ))}
              {isLoading && <div style={{ color: theme.textMuted, fontSize: "0.82rem", fontStyle: "italic" }}>서사가 이어지는 중……</div>}
            </div>

            {/* 인게임 입력창 */}
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

        {/* ── 🌟 교체 포인트 2: 하단 세그먼트 글래스 탭바 (스케치 기반) ── */}
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
                    borderRight: isLast ? "none" : "1px solid rgba(255, 255, 255, 0.08)", // 세로 분할선
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
