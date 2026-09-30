"use client";

import { useState, useEffect } from "react";
// 🚨 테마와 스타일은 별도 파일(lib/themes.js)에서 가져온다고 가정합니다.
import { THEME_PALETTES, GLASS_STYLE } from "@/lib/themes";

export default function GamePlatform() {
  // ── [0. 폰트 강제 로드] ──
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
      @font-face {
        font-family: 'RIDIBatang';
        src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.0/RIDIBatang.woff') format('woff');
        font-weight: 400;
        font-style: normal;
      }
      * { font-family: 'Pretendard', sans-serif; }
      .serif-text { font-family: 'RIDIBatang', serif !important; }
      ::-webkit-scrollbar { width: 5px; height: 5px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(120, 120, 120, 0.4); border-radius: 10px; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ── [1. 테마 & 반응형 엔진] ──
  const [themeKey] = useState("cloud");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const currentPalette = THEME_PALETTES[themeKey] || THEME_PALETTES.cloud;
  const theme = isDarkMode ? currentPalette.dark : currentPalette.light;

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

  // ── [2. 시스템 토스트 알림] ──
  const [toast, setToast] = useState(null);
  const triggerToast = (title, message = "", icon = "✨") => {
    setToast({ title, message, icon });
    setTimeout(() => setToast(null), 2500);
  };

  // ── [3. 상태 관리] ──
  const [activeTab, setActiveTab] = useState("lobby");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [ruleHelpModal, setRuleHelpModal] = useState(null);

  // ── [4. 룰 모드 & 태그] ──
  const [selectedMode, setSelectedMode] = useState("추리");
  const [playPreference, setPlayPreference] = useState("");

  const ALL_TAGS = [
    "#GL", "#BL", "#HL", "#논로맨스", "#집착", "#혐관", "#쌍방구원", "#우정", "#R19", "#피폐", 
    "#애증", "#신분차", "#배틀", "#계약", "#착각", "#구원", "#짝사랑", "#달달", "#일상", "#오컬트", 
    "#이능력", "#현대판타지", "#SF", "#사이버펑크", "#아포칼립스", "#역키잡", "#후회", "#회귀", "#빙의", "#환생"
  ];

  // ── [6. 추리 모드 로비 데이터] ──
  const [scenarioTitle, setScenarioTitle] = useState("");
  const [victimName, setVictimName] = useState("");
  const [publicSynopsis, setPublicSynopsis] = useState("");
  const [openingScene, setOpeningScene] = useState("");

  const [suspects, setSuspects] = useState([
    { id: 1, name: "", ageGender: "", job: "", behavior: "", secret: "", portraitUrl: "", showSecret: false }
  ]);
  const [selectedSuspectId, setSelectedSuspectId] = useState(1);
  
// 🌟 초상화 모달 스위치 복구 완료!
  const [showPortraitModal, setShowPortraitModal] = useState(false);
  const [activePortraitSuspectId, setActivePortraitSuspectId] = useState(null);

  const [evidenceList, setEvidenceList] = useState([
    { id: 1, name: "", overview: "", contradiction: "", secret: "", showSecret: false }
  ]);

  const [culpritName, setCulpritName] = useState("");
  const [trickDetail, setTrickDetail] = useState("");
  const [hiddenTruth, setHiddenTruth] = useState("");
  const [showHiddenTruth, setShowHiddenTruth] = useState(false);

  // 인게임 상태
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── [8. 동적 조작 함수들] ──
  
  const handleAddSuspect = () => {
    if (suspects.length >= 15) {
      triggerToast("인원 제한", "용의자는 최대 15명까지만 등록할 수 있습니다.", "⚠️");
      return;
    }
    const nextId = Date.now();
    setSuspects([...suspects, { id: nextId, name: "", ageGender: "", job: "", behavior: "", secret: "", portraitUrl: "", showSecret: false }]);
    // 추가 후 자동으로 포커스 이동
    setSelectedSuspectId(nextId);
  };

  // 🌟 [핵심 개선] 모바일에서 화면이 튀지 않고 연속 삭제 가능하게 변경
  const handleDeleteSuspect = (e, id) => {
    e.stopPropagation(); // 👈 카드가 클릭되는 것을 방지
    
    if (suspects.length <= 1) {
      triggerToast("삭제 불가", "최소 1명의 인물 카드는 유지되어야 합니다.", "⚠️");
      return;
    }
    
    const filtered = suspects.filter(s => s.id !== id);
    setSuspects(filtered);
    
    // 만약 현재 보고 있던 카드를 지웠다면, 바로 앞의 카드를 보여줌
    if (selectedSuspectId === id) {
      const deletedIndex = suspects.findIndex(s => s.id === id);
      const prevTarget = filtered[deletedIndex - 1] || filtered[0];
      setSelectedSuspectId(prevTarget.id);
    }
    triggerToast("인물 삭제", "수사망에서 제외되었습니다.", "🗑️");
  };

  const handleUpdateSuspect = (id, field, value) => {
    setSuspects(suspects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddEvidence = () => {
    if (evidenceList.length >= 15) {
      triggerToast("단서 제한", "단서는 최대 15개까지만 등록할 수 있습니다.", "⚠️");
      return;
    }
    setEvidenceList([...evidenceList, { id: Date.now(), name: "", overview: "", contradiction: "", secret: "", showSecret: false }]);
  };

  const handleDeleteEvidence = (e, id) => {
    e.stopPropagation(); 
    setEvidenceList(evidenceList.filter(ev => ev.id !== id));
  };

  const handleUpdateEvidence = (id, field, value) => {
    setEvidenceList(evidenceList.map(ev => ev.id === id ? { ...ev, [field]: value } : ev));
  };

  const handleApplyPastedScenario = () => {
    if (!pastedText.trim()) return;
    const titleMatch = pastedText.match(/(?:시나리오\s*제목|사건명|사건\s*제목|제목)\s*[:：]\s*([^\n\r]+)/i);
    if (titleMatch) setScenarioTitle(titleMatch[1].trim());
    const victimMatch = pastedText.match(/(?:피해자|사망자|타깃|의뢰인)\s*[:：]\s*([^\n\r]+)/i);
    if (victimMatch) setVictimName(victimMatch[1].trim());
    const synMatch = pastedText.match(/(?:\[공개\s*시놉시스\]|공개\s*시놉시스\s*[:：]?|사건\s*개요\s*[:：]?)\s*([\s\S]*?)(?=\n\s*(?:\[서막\]|서막\s*[:：]|\[도입부\]|도입부\s*[:：]|#+|\[|$))/i);
    if (synMatch) setPublicSynopsis(synMatch[1].trim());
    const opMatch = pastedText.match(/(?:\[서막\]|서막\s*[:：]?|\[도입부\]|도입부\s*[:：]?|오프닝\s*[:：]?)\s*([\s\S]*?)(?=\n\s*(?:\[진상|진상\s*[:：]|#+|\[|$))/i);
    if (opMatch) setOpeningScene(opMatch[opMatch.length > 1 ? 1 : 0].trim());
    const trMatch = pastedText.match(/(?:\[사건의\s*진상\]|사건의\s*진상\s*[:：]?|진상\s*[:：]?)\s*([\s\S]*?)(?=\n\s*(?:###|\[|$))/i);
    if (trMatch) setHiddenTruth(trMatch[1].trim());
    setShowPasteModal(false);
    setPastedText("");
    triggerToast("파싱 완료", "작성된 양식에 자동 배치되었습니다.", "✨");
  };

  const handleStartGame = () => {
    if (!scenarioTitle.trim()) {
      triggerToast("사건명 입력 필요", "이야기를 시작하려면 사건명을 입력해주세요.", "⚠️");
      return;
    }
    setActiveSession({ title: scenarioTitle });
  };

  return (
    <div style={{ display: "flex", height: "100dvh", width: "100vw", backgroundColor: theme.bg, color: theme.text, overflow: "hidden", position: "relative" }}>
      
      {/* 🍞 글로벌 토스트 */}
      {toast && (
        <div onClick={() => setToast(null)} style={{ ...GLASS_STYLE, position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 99999, backgroundColor: isDarkMode ? "rgba(35, 30, 28, 0.96)" : "rgba(255, 255, 255, 0.96)", border: `1.5px solid ${theme.accent}`, color: theme.text, padding: "10px 18px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", cursor: "pointer", animation: "fadeIn 0.2s ease-out" }}>
          <span style={{ fontSize: "1.15rem" }}>{toast.icon}</span>
          <span style={{ fontSize: "0.84rem", fontWeight: "800", color: theme.accent }}>{toast.title}</span>
          {toast.message && <span style={{ fontSize: "0.76rem", opacity: 0.85 }}>{toast.message}</span>}
        </div>
      )}

      {/* ── ☰ 좌측 세션 서랍 ── */}
      {isDrawerOpen && <div onClick={() => setIsDrawerOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", zIndex: 100 }} />}
      
      <aside style={{ position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 110, width: isMobile ? "100vw" : "320px", transform: isDrawerOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)", backgroundColor: theme.sidebar, borderRight: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", boxShadow: isDrawerOpen ? "10px 0 40px rgba(0,0,0,0.5)" : "none" }}>
        <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "900", fontSize: "1rem" }}>세션 보관함</span>
          <button onClick={() => setIsDrawerOpen(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.3rem", cursor: "pointer" }}>✕</button>
        </div>
        
        <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
          <div style={{ padding: "24px 12px", textAlign: "center", color: theme.textMuted, fontSize: "0.78rem", border: `1px dashed ${theme.border}`, borderRadius: "10px" }}>
            진행 중인 세션 기록이 없습니다.
          </div>
        </div>

        <div style={{ padding: "14px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: "8px" }}>
          {activeSession ? (
            <button 
              onClick={() => { setActiveSession(null); setIsDrawerOpen(false); }} 
              style={{ flex: 1, padding: "12px", backgroundColor: theme.danger || "#ef4444", border: "none", borderRadius: "8px", color: "#fff", fontSize: "0.85rem", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }}
            >
              🚪 게임 종료하고 로비로 나가기
            </button>
          ) : (
            <>
              <button onClick={() => triggerToast("환경 설정", "준비 중입니다.", "⚙")} style={{ flex: 1, padding: "10px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}>⚙ 설정</button>
              <button onClick={() => triggerToast("데이터 관리", "준비 중입니다.", "💾")} style={{ flex: 1, padding: "10px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}>💾 데이터</button>
            </>
          )}
        </div>
      </aside>

      {/* ── 메인 콘텐츠 뷰 ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        
        {/* 상단 툴바 헤더 */}
        <header style={{ height: "54px", padding: isMobile ? "0 10px" : "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.sidebar, flexShrink: 0, zIndex: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "6px" : "10px", flexShrink: 0 }}>
            <button onClick={() => setIsDrawerOpen(true)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.3rem", cursor: "pointer", padding: "4px" }}>☰</button>
            
            {activeSession ? (
              <span style={{ fontWeight: "800", fontSize: "0.85rem", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
                {activeSession.title}
              </span>
            ) : (
              !isMobile && <span style={{ fontWeight: "900", fontSize: "0.95rem" }}>새로운 서사의 시작</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {!activeSession && (
              <>
                {/* 🌟 불러오기 버튼 디자인 및 아이콘 변경 (글씨 없이 깔끔하게 통일) */}
                <button 
                  onClick={() => setShowPasteModal(true)} 
                  title="시나리오 불러오기"
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "8px", color: theme.text }}
                >
                  📄
                </button>
                <button 
                  onClick={() => triggerToast("세팅 저장", "현재 작성 중인 서류가 로컬에 저장되었습니다.", "💾")} 
                  title="세팅 저장"
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "8px" }}
                >
                  💾
                </button>
              </>
            )}
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "8px" }}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* ── [A. 로비 뷰 (이전 '창작' 탭)] ── */}
        {!activeSession ? (
          <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 14px 140px 14px" : "20px 16px 160px 16px", maxWidth: "860px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: isMobile ? "14px" : "18px", boxSizing: "border-box" }}>
              
{/* 1. 3대 모드 선택 카드 */}
            <section style={{ ...GLASS_STYLE, padding: isMobile ? "14px" : "18px", backgroundColor: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              
              <div style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "12px", color: theme.text }}>
                1. 룰 시스템 선택
              </div>
              
              {/* 🌟 룰 시스템 3열 가로 배치 (모바일/PC 공통) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {[
                  { key: "추리", icon: "🕵️‍♂️", title: "추리", desc: "진상을 파헤치는 수사" },
                  { key: "연애", icon: "🌸", title: "연애", desc: "선택지와 감정선 중심의 서사" },
                  { key: "괴담", icon: "🕯️", title: "괴담", desc: "이면을 밝히는 호러" }
                ].map(m => {
                  const isSel = selectedMode === m.key;
                  return (
                    <div
                      key={m.key}
                      onClick={() => setSelectedMode(m.key)}
                      style={{
                        position: "relative",
                        padding: isMobile ? "16px 8px" : "18px 12px", 
                        borderRadius: "14px", cursor: "pointer",
                        backgroundColor: isSel ? theme.panelAlt : "transparent",
                        border: `1.5px solid ${isSel ? theme.accent : theme.border}`,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px",
                        boxShadow: isSel ? `0 0 16px ${theme.accentGlow}` : "none",
                        transition: "all 0.2s"
                      }}
                    >
                      {/* 우측 상단 물음표 버튼 */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setRuleHelpModal(m); }}
                        title={`${m.title} 규칙 설명 보기`}
                        style={{
                          position: "absolute", top: "8px", right: "8px",
                          width: "22px", height: "22px", borderRadius: "50%",
                          border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg,
                          color: theme.textMuted, fontSize: "0.75rem", fontWeight: "800",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer"
                        }}
                      >
                        ?
                      </button>

                      {/* 중앙 아이콘 */}
                      <span style={{ fontSize: isMobile ? "2rem" : "2.2rem" }}>{m.icon}</span>
                      
                      {/* 하단 텍스트 영역 */}
                      <div style={{ textAlign: "center", width: "100%" }}>
                        <div style={{ fontWeight: "900", fontSize: "0.95rem", color: isSel ? theme.accent : theme.text }}>{m.title}</div>
                        {!isMobile && (
                          <div style={{ fontSize: "0.72rem", color: theme.textMuted, marginTop: "4px", wordBreak: "keep-all" }}>
                            {m.desc}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 2. 장르 톤 태그 */}
            <section style={{ ...GLASS_STYLE, padding: isMobile ? "14px" : "18px", backgroundColor: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "800", color: theme.text }}>2. 장르 톤 (서사 태그)</span>
              </div>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", minHeight: isMobile ? "110px" : "80px", alignContent: "flex-start" }}>
                {ALL_TAGS.map(tag => {
                  const isSelected = playPreference.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const list = playPreference.split(/\s+/).filter(Boolean);
                        const next = isSelected ? list.filter(t => t !== tag).join(" ") : [...list, tag].join(" ");
                        setPlayPreference(next);
                      }}
                      style={{
                        padding: "5px 11px", borderRadius: "16px", fontSize: "0.76rem",
                        fontWeight: isSelected ? "800" : "500",
                        backgroundColor: isSelected ? theme.accent : theme.inputBg,
                        color: isSelected ? "#ffffff" : theme.text,
                        border: `1px solid ${isSelected ? theme.accent : theme.border}`,
                        cursor: "pointer", transition: "background-color 0.15s, color 0.15s"
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
                placeholder="태그 직접 입력 (예: #밀실살인)..."
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.84rem", outline: "none" }}
              />
            </section>

            {/* ── 🕵 [추리 모드 전용 수사본부 서류철] ── */}
            {selectedMode === "추리" && (
              <>
                {/* A. 사건 개요서 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.1rem" }}>📋</span>
                    <span style={{ fontWeight: "900", fontSize: "0.95rem", color: theme.text }}>사건 개요서</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "10px" }}>
                    <input type="text" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} placeholder="사건명 (예: 심야 펜트하우스 살인사건)" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                    <input type="text" value={victimName} onChange={e => setVictimName(e.target.value)} placeholder="사건 대상/의뢰인" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                  </div>
                  <textarea rows={2} value={publicSynopsis} onChange={e => setPublicSynopsis(e.target.value)} placeholder="현장 상황 및 사건 발생 개요..." style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
                  <textarea rows={2} value={openingScene} onChange={e => setOpeningScene(e.target.value)} placeholder="첫 오프닝/서막 지문..." style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
                </section>

               {/* B. 용의자 수사망 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1.1rem" }}>📌</span>
<span style={{ fontSize: "0.95rem", color: theme.text }}>
  <strong style={{ fontWeight: "900" }}>용의자 수사망</strong>
  <span style={{ fontWeight: "500", color: theme.textMuted, marginLeft: "4px" }}>({suspects.length}명 / 최대 15명)</span>
</span>
                    </div>
<button type="button" onClick={handleAddSuspect} style={{ padding: "6px 14px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.accent}`, borderRadius: "16px", color: theme.accent, fontSize: "0.76rem", fontWeight: "600", cursor: "pointer" }}>
  ＋ 인물 추가
</button>
                  </div>

                 {/* 폴라로이드 핀 보드 */}
                  <div style={{ 
                    display: isMobile ? "flex" : "grid", 
                    gridTemplateColumns: isMobile ? "none" : "repeat(auto-fill, minmax(135px, 1fr))", 
                    gap: "12px", 
                    overflowX: isMobile ? "auto" : "visible", 
                    padding: "14px 10px 14px 4px", /* 🌟 핵심 1: 위(14px), 오른쪽(10px) 여백을 주어 핀과 X 버튼이 잘리지 않게 방어! */
                    WebkitOverflowScrolling: "touch" 
                  }}>
                    {suspects.map((s, idx) => {
                      const isSelected = (selectedSuspectId || suspects[0]?.id) === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSuspectId(s.id)}
                          style={{
                            flex: isMobile ? "0 0 125px" : "auto", /* 🌟 핵심 2: 모바일에서 카드가 찌그러지지 않고 나란히 가로 스크롤되도록 고정 */
                            backgroundColor: theme.polaroidBg || "#ded7cb", borderRadius: "6px", padding: "8px 8px 12px 8px", color: theme.polaroidText || "#292524",
                            boxShadow: isSelected ? `0 0 0 2px ${theme.accent}, 0 8px 24px rgba(0,0,0,0.3)` : "0 3px 10px rgba(0,0,0,0.18)",
                            position: "relative", cursor: "pointer", transform: isSelected ? "scale(1.03)" : "scale(1)", transition: "all 0.15s ease", display: "flex", flexDirection: "column", alignItems: "center"
                          }}
                        >
                          {/* 붉은 압정 핀 */}
                          <div style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: theme.danger, boxShadow: "0 2px 4px rgba(0,0,0,0.3)", zIndex: 2 }} />
                          
                          {/* 카드 삭제 [X] 버튼 */}
                          {suspects.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSuspect(e, s.id)}
                              title="인물 삭제"
                              style={{
                                position: "absolute", top: "-8px", right: "-8px", width: "22px", height: "22px", borderRadius: "50%",
                                backgroundColor: theme.danger || "#ef4444", color: "#fff", border: "none", cursor: "pointer", 
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold", zIndex: 10,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
                              }}
                            >✕</button>
                          )}

                          {/* 사진 영역 */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePortraitSuspectId(s.id);
                              setShowPortraitModal(true);
                            }}
                            title="사진 등록 및 확인"
                            style={{
                              width: "100%", aspectRatio: "1/1", backgroundColor: isDarkMode ? "#332d2a" : "#eae4db",
                              borderRadius: "3px", overflow: "hidden",
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative",
                              cursor: "pointer" // 🌟 돋보기 대신 일반 클릭 커서로 변경
                            }}
                          >
                            {s.portraitUrl ? (
                              <img src={s.portraitUrl} alt="용의자" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: isDarkMode ? "#b3aaa0" : "#8c8278", fontSize: "0.68rem" }}>
                                <span style={{ fontSize: "1.3rem" }}>📷</span>
                                <span style={{ fontWeight: "700" }}>사진 없음</span>
                              </div>
                            )}
                          </div>

                          <div style={{ marginTop: "6px", textAlign: "center", width: "100%" }}>
                            <div style={{ fontWeight: "900", fontSize: "0.82rem", color: theme.polaroidText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {s.name || `인물 ${idx + 1}`}
                            </div>
                            <div style={{ fontSize: "0.66rem", opacity: 0.75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "1px" }}>
                              {s.job || "신분 미상"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 🌟 선택된 인물 수사 서류철 (리스트 바깥으로 완전히 분리하여 고정) */}
                  {(() => {
                    const curId = selectedSuspectId || suspects[0]?.id;
                    const cur = suspects.find(s => s.id === curId) || suspects[0];
                    if (!cur) return null;

                    return (
                      <div style={{ padding: isMobile ? "14px" : "16px", backgroundColor: theme.panelAlt, borderRadius: "12px", border: `1.5px solid ${theme.borderHighlight || theme.border}`, display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px dashed ${theme.border}`, paddingBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: "900", color: theme.accent }}>
                            📂 수사 서류: [{cur.name || "신원 미상"}]
                          </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr", gap: "8px" }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>이름</label>
                            <input type="text" value={cur.name} onChange={e => handleUpdateSuspect(cur.id, "name", e.target.value)} placeholder="예: 강이솔" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>나이/성별</label>
                            <input type="text" value={cur.ageGender} onChange={e => handleUpdateSuspect(cur.id, "ageGender", e.target.value)} placeholder="예: 26세 여성" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>직업/역할</label>
                            <input type="text" value={cur.job} onChange={e => handleUpdateSuspect(cur.id, "job", e.target.value)} placeholder="예: 선임 연구원" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>인물 특징 및 사건 행적</label>
                          <textarea rows={3} value={cur.behavior} onChange={e => handleUpdateSuspect(cur.id, "behavior", e.target.value)} placeholder="성격, 피해자와의 관계, 사건 당일 주장하는 행적..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", resize: "vertical" }} />
                        </div>

                        <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)", borderRadius: "8px", border: `1px solid ${theme.danger}`, padding: "10px 12px", marginTop: "4px" }}>
<button type="button" onClick={() => handleUpdateSuspect(cur.id, "showSecret", !cur.showSecret)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", fontSize: "0.76rem", color: theme.danger, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <span style={{ fontWeight: "800" }}>🔒 숨겨진 비밀 / 약점</span>
  <span style={{ fontWeight: "500", fontSize: "0.85rem" }}>{cur.showSecret ? "▲" : "▼"}</span>
</button>
                          
                          {cur.showSecret && (
                            <input type="text" value={cur.secret} onChange={e => handleUpdateSuspect(cur.id, "secret", e.target.value)} placeholder="결정적 진실 또는 알리바이 허점..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", marginTop: "8px", borderRadius: "6px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.82rem", outline: "none" }} />
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </section>

                {/* C. 사건 단서 및 물증 보관소 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1.1rem" }}>🔍</span>
                      <span style={{ fontSize: "0.95rem", color: theme.text }}>
  <strong style={{ fontWeight: "900" }}>사건 단서 및 물증</strong>
  <span style={{ fontWeight: "500", color: theme.textMuted, marginLeft: "4px" }}>({evidenceList.length}건 / 최대 15개)</span>
</span>
                    </div>
                    <button type="button" onClick={handleAddEvidence} style={{ padding: "6px 14px", backgroundColor: theme.panelAlt, border: `1.5px solid ${theme.accent}`, borderRadius: "16px", color: theme.accent, fontSize: "0.76rem", fontWeight: "600", cursor: "pointer" }}>＋ 단서 추가</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
                    {evidenceList.map((item, idx) => (
                      <div key={item.id} style={{ backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                          <input type="text" value={item.name} onChange={e => handleUpdateEvidence(item.id, "name", e.target.value)} placeholder={`단서 ${idx + 1} 명칭`} style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", fontWeight: "800", outline: "none" }} />
                          {evidenceList.length > 1 && (
                            <button type="button" onClick={(e) => handleDeleteEvidence(e, item.id)} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", padding: "2px", fontSize: "0.8rem" }}>🗑</button>
                          )}
                        </div>
                        <input type="text" value={item.overview} onChange={e => handleUpdateEvidence(item.id, "overview", e.target.value)} placeholder="발견 위치 및 겉모습..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.78rem", outline: "none" }} />
                        <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)", borderRadius: "8px", border: `1px solid ${theme.danger}`, padding: "10px 12px" }}>
<button type="button" onClick={() => handleUpdateEvidence(item.id, "showSecret", !item.showSecret)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", fontSize: "0.72rem", color: theme.danger, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <span style={{ fontWeight: "800" }}>🔒 감식 진상 / 모순</span>
  <span style={{ fontWeight: "500", fontSize: "0.85rem" }}>{item.showSecret ? "▲" : "▼"}</span>
</button>
                          {item.showSecret && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                              <input type="text" value={item.contradiction} onChange={e => handleUpdateEvidence(item.id, "contradiction", e.target.value)} placeholder="알리바이를 깰 모순점..." style={{ width: "100%", boxSizing: "border-box", padding: "6px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.78rem", outline: "none" }} />
                              <input type="text" value={item.secret} onChange={e => handleUpdateEvidence(item.id, "secret", e.target.value)} placeholder="감식 성공 시 밝혀질 이면..." style={{ width: "100%", boxSizing: "border-box", padding: "6px 10px", borderRadius: "6px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.78rem", outline: "none" }} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* D. 사건 진상 기밀 봉투 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.accent}`, display: "flex", flexDirection: "column", gap: "12px" }}>
<button type="button" onClick={() => setShowHiddenTruth(!showHiddenTruth)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "1.1rem" }}>✉️</span><span style={{ fontWeight: "900", fontSize: "0.95rem", color: theme.accent }}>사건 진상 봉투</span></div>
  <span style={{ color: theme.accent, fontSize: "0.85rem", fontWeight: "500" }}>{showHiddenTruth ? "▲" : "▼"}</span>
</button>
                  {showHiddenTruth && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: "10px" }}>
                        <input type="text" value={culpritName} onChange={e => setCulpritName(e.target.value)} placeholder="진범 / 흑막 이름" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                        <input type="text" value={trickDetail} onChange={e => setTrickDetail(e.target.value)} placeholder="사용된 트릭 (예: 타이머 조작)" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                      </div>
                      <textarea rows={3} value={hiddenTruth} onChange={e => setHiddenTruth(e.target.value)} placeholder="사건의 내막 및 엔딩 조건..." style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", outline: "none", resize: "vertical" }} />
                    </div>
                  )}
                </section>
              </>
            )}

            {/* 연애 모드 */}
            {selectedMode === "연애" && (
              <div style={{ ...GLASS_STYLE, padding: "40px 20px", textAlign: "center", color: theme.textMuted, borderRadius: "16px", border: `1.5px dashed ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "2rem" }}>🌸</span><span style={{ fontSize: "0.92rem", fontWeight: "800", color: theme.accent }}>연애 모드 서류철 준비 중</span>
                <span style={{ fontSize: "0.76rem" }}>호감도 텐션, 취향 수첩, 스마트폰 메신저 프로필이 이곳에 연결됩니다.</span>
              </div>
            )}

            {/* 괴담 모드 */}
            {selectedMode === "괴담" && (
              <div style={{ ...GLASS_STYLE, padding: "40px 20px", textAlign: "center", color: theme.textMuted, borderRadius: "16px", border: `1.5px dashed ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "2rem" }}>🕯️</span><span style={{ fontSize: "0.92rem", fontWeight: "800", color: theme.accent }}>괴담 모드 서류철 준비 중</span>
                <span style={{ fontSize: "0.76rem" }}>재능 3슬롯 장착 칩, 이면 카드, 침식도 HUD가 이곳에 연결됩니다.</span>
              </div>
            )}

            {/* 🌟 이야기 시작하기 버튼 */}
            <button
              onClick={handleStartGame}
              style={{
                width: "100%", padding: "16px", borderRadius: "14px",
                backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#ffffff", border: "none",
                fontWeight: "900", fontSize: "1.05rem", cursor: "pointer",
                boxShadow: `0 4px 20px ${theme.accentGlow}`, marginTop: "6px"
              }}
            >
              ▶ 이야기 시작하기
            </button>
              <div style={{ height: "60px", flexShrink: 0 }} />
          </main>
        ) : (

          /* ── [B. 인게임 뷰: 소설 리더 본문] ── */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 90px 20px", display: "flex", flexDirection: "column", gap: "18px", maxWidth: "760px", margin: "0 auto", width: "100%", boxSizing: "border-box", fontSize: "0.95rem", lineHeight: 2 }}>
              {messages.map((m, idx) => (
                <div key={idx} className="serif-text" style={{ color: m.role === "user" ? theme.accent : theme.text, fontWeight: m.role === "user" ? "700" : "400" }}>
                  {m.text}
                </div>
              ))}
              {isLoading && <div style={{ color: theme.textMuted, fontSize: "0.82rem", fontStyle: "italic" }}>서사가 이어지는 중……</div>}
            </div>

            <footer style={{ position: "sticky", bottom: 0, padding: "12px 16px max(16px, env(safe-area-inset-bottom))", backgroundColor: theme.sidebar, borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: "600px", display: "flex", gap: "8px" }}>
                <input type="text" value={inputMsg} onChange={e => setInputMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }} placeholder="대사나 행동을 입력하세요..." style={{ flex: 1, padding: "10px 14px", borderRadius: "20px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, outline: "none" }} />
                <button onClick={handleSendMessage} style={{ padding: "0 18px", borderRadius: "20px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", border: "none", fontWeight: "800", cursor: "pointer" }}>전송</button>
              </div>
            </footer>
          </div>
        )}

        {/* ── 📱 하단 세그먼트 글래스 탭바 ── */}
        {!activeSession && (
          <nav
            style={{
              position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)",
              width: "calc(100% - 32px)", maxWidth: "440px", height: "62px",
              backgroundColor: isDarkMode ? "rgba(35, 30, 28, 0.75)" : "rgba(240, 236, 228, 0.85)",
              backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
              border: `1px solid ${theme.border}`, borderRadius: "20px",
              display: "flex", overflow: "hidden", zIndex: 50,
              boxShadow: isDarkMode ? "0 12px 36px rgba(0, 0, 0, 0.45)" : "0 10px 30px rgba(0, 0, 0, 0.08)",
              transition: "background-color 0.25s ease, border-color 0.25s ease"
            }}
          >
            {[
              { key: "lounge", icon: "🧭", label: "탐색" },
              { key: "library", icon: "📚", label: "서재" },
              { key: "lobby", icon: "🏠", label: "로비" },
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
                    borderRight: isLast ? "none" : `1px solid ${theme.border}`,
                    backgroundColor: isSelected ? (isDarkMode ? "rgba(235, 227, 218, 0.12)" : "rgba(120, 105, 90, 0.12)") : "transparent",
                    color: isSelected ? theme.accent : theme.textMuted,
                    transition: "all 0.2s"
                  }}
                >
                  <span style={{ fontSize: "1.15rem", transform: isSelected ? "scale(1.12)" : "scale(1)", transition: "transform 0.2s" }}>{tab.icon}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: isSelected ? "800" : "600" }}>{tab.label}</span>
                </div>
              );
            })}
          </nav>
        )}
      </div>

{/* ── 🖼️ 초상화 모달 (크게 보기 + 연필 아이콘 업로드) ── */}
      {showPortraitModal && (() => {
        const target = suspects.find(s => s.id === activePortraitSuspectId) || suspects[0];
        if (!target) return null;

        return (
          <div
            onClick={() => setShowPortraitModal(false)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "16px", animation: "fadeIn 0.2s ease-out" }}
          >
            <div
              onClick={e => e.stopPropagation()}
              className="glass-card"
              style={{ width: "100%", maxWidth: "380px", backgroundColor: theme.panel, border: `1.5px solid ${theme.border}`, borderRadius: "18px", padding: "20px", color: theme.text, display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
            >
              {/* 상단 이름 및 닫기 버튼 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "900", color: theme.accent }}>
                    {target.name || "신원 미상"}
                  </h3>
                  <div style={{ fontSize: "0.74rem", color: theme.textMuted, marginTop: "2px" }}>
                    {target.job ? `${target.job} · ` : ""}{target.ageGender || "인적사항 미기재"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPortraitModal(false)}
                  style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>

              {/* 사진 영역 & 연필 아이콘 (하단 버튼 없음) */}
              <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: "14px", overflow: "hidden", border: `1.5px solid ${theme.border}`, backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.25)" : "#f0ece4", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {target.portraitUrl ? (
                  <img src={target.portraitUrl} alt="용의자 초상화" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ textAlign: "center", color: theme.textMuted, fontSize: "0.85rem", lineHeight: "1.6" }}>
                    <div style={{ fontSize: "2.4rem", marginBottom: "6px" }}>👤</div>
                    등록된 사진이 없습니다.
                  </div>
                )}

                {/* ✏️ 우측 하단 연필 아이콘 (클릭 시 갤러리 오픈) */}
                <label
                  title="사진 변경/등록"
                  style={{
                    position: "absolute", bottom: "12px", right: "12px", width: "38px", height: "38px", borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.7)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", 
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", zIndex: 5,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.5)"
                  }}
                >
                  ✏️
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: "none" }} 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => handleUpdateSuspect(target.id, "portraitUrl", ev.target.result);
                      reader.readAsDataURL(file);
                      e.target.value = null; // 같은 파일도 다시 선택 가능하게 초기화
                    }} 
                  />
                </label>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 📄 시나리오 텍스트 붙여넣기 모달 ── */}
      {showPasteModal && (
        <div onClick={() => setShowPasteModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "520px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "800", fontSize: "0.95rem" }}>📄 시나리오 텍스트 붙여넣기</span>
              <button onClick={() => setShowPasteModal(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
            </div>
            <textarea rows={8} value={pastedText} onChange={e => setPastedText(e.target.value)} placeholder="스튜디오에서 작성된 시나리오 전체 글을 여기에 붙여넣으세요..." style={{ width: "100%", boxSizing: "border-box", padding: "12px", backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.82rem", outline: "none", resize: "none" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setShowPasteModal(false)} style={{ flex: 1, padding: "10px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.8rem", cursor: "pointer" }}>취소</button>
              <button onClick={handleApplyPastedScenario} style={{ flex: 2, padding: "10px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", border: "none", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "800", cursor: "pointer" }}>서류철에 자동 배치 ➔</button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 4. 룰 모드 가이드 모달 */}
      {ruleHelpModal && (
        <div onClick={() => setRuleHelpModal(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 160, padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} className="glass-card" style={{ width: "100%", maxWidth: "440px", padding: "22px", borderRadius: "16px", backgroundColor: theme.panel, color: theme.text, display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.2rem" }}>{ruleHelpModal.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800" }}>{ruleHelpModal.title}</h3>
                  <div style={{ fontSize: "0.72rem", color: theme.textMuted }}>{ruleHelpModal.desc}</div>
                </div>
              </div>
              <button type="button" onClick={() => setRuleHelpModal(null)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", paddingRight: "4px" }}>
              <div style={{ backgroundColor: theme.panelAlt, padding: "12px", borderRadius: "10px", border: `1px solid ${theme.border}` }}>
                <div style={{ fontWeight: "800", fontSize: "0.82rem", color: theme.accent, marginBottom: "4px" }}>• 게임 진행 방식</div>
                <div style={{ fontSize: "0.76rem", color: theme.text, lineHeight: "1.6" }}>
                  {ruleHelpModal.key === "추리" ? "단서를 모으고 인물들을 심문하여 사건의 진상을 밝혀냅니다." :
                   ruleHelpModal.key === "연애" ? "상대방의 호감도를 관리하며 다양한 엔딩을 향해 나아갑니다." :
                   "숨겨진 이면을 밝히고, 침식을 견디며 서스펜스 호러의 끝을 봅니다."}
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setRuleHelpModal(null)} style={{ width: "100%", padding: "10px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", border: "none", borderRadius: "10px", fontWeight: "800", fontSize: "0.82rem", cursor: "pointer", marginTop: "4px" }}>
              확인
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
