"use client";

import { useState, useEffect, useRef } from "react";
import { THEME_PALETTES, GLASS_STYLE } from "@/lib/themes";

export default function GamePlatform() {
  // ── [1. 테마 & 반응형 디바이스 감지] ──
  const [themeKey] = useState("cloud");
  const [isDarkMode, setIsDarkMode] = useState(true);
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

  // ── [3. 네비게이션 & 모달 상태] ──
  const [activeTab, setActiveTab] = useState("studio"); // lounge, library, studio, profile
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [activeSession, setActiveSession] = useState(null);

  // ── [4. 3대 룰 모드 선택 (기본: 추리)] ──
  const [selectedMode, setSelectedMode] = useState("추리");

  // ── [5. 장르 톤 태그 (전 모드 공용)] ──
  const [playPreference, setPlayPreference] = useState("");

  // ── [6. 추리 모드 전용 범용 상태 (모두 빈칸으로 초기화)] ──
  // A. 사건 개요서
  const [scenarioTitle, setScenarioTitle] = useState("");
  const [victimName, setVictimName] = useState("");
  const [publicSynopsis, setPublicSynopsis] = useState("");
  const [openingScene, setOpeningScene] = useState("");

  // B. 동적 용의자 수사망 (초기 빈 용의자 1명 슬롯 또는 빈 배열)
  const [suspects, setSuspects] = useState([
    {
      id: 1,
      name: "",
      ageGender: "",
      job: "",
      motive: "",
      alibi: "",
      secret: "",
      portraitUrl: "",
      quote: ""
    }
  ]);

  const [selectedSuspectId, setSelectedSuspectId] = useState(null);

  // C. 결정적 물증 후보함 (복수 등록 태그)
  const [smokingGuns, setSmokingGuns] = useState([]);
  const [gunInput, setGunInput] = useState("");

  // D. 사건 진상 기밀 봉투
  const [culpritName, setCulpritName] = useState("");
  const [trickDetail, setTrickDetail] = useState("");
  const [hiddenTruth, setHiddenTruth] = useState("");

  // ── [7. 인게임 소설 리더 메시지 상태] ──
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── [8. 동적 조작 함수들] ──
  // 용의자 추가
  const handleAddSuspect = () => {
    const nextId = Date.now();
    setSuspects([
      ...suspects,
      {
        id: nextId,
        name: "",
        ageGender: "",
        job: "",
        motive: "",
        alibi: "",
        secret: "",
        portraitUrl: "",
        quote: ""
      }
    ]);
    triggerToast("용의자 서류 추가", "새로운 수사 카드가 증거보드에 배치되었습니다.", "📌");
  };

  // 용의자 삭제
  const handleDeleteSuspect = (id) => {
    if (suspects.length <= 1) {
      triggerToast("삭제 불가", "최소 1명의 용의자 카드는 유지되어야 합니다.", "⚠️");
      return;
    }
    setSuspects(suspects.filter(s => s.id !== id));
    triggerToast("용의자 삭제", "수사망에서 제외되었습니다.", "🗑️");
  };

  // 용의자 필드 수정
  const handleUpdateSuspect = (id, field, value) => {
    setSuspects(suspects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // 결정적 물증 태그 추가
  const handleAddSmokingGun = () => {
    const trimmed = gunInput.trim().replace(/^#/, "");
    if (!trimmed) return;
    if (smokingGuns.includes(trimmed)) {
      triggerToast("중복 물증", "이미 등록된 물증 단서입니다.", "⚠️");
      return;
    }
    setSmokingGuns([...smokingGuns, trimmed]);
    setGunInput("");
    triggerToast("결정적 물증 등록", `#${trimmed} 단서가 확보함에 추가되었습니다.`, "🔍");
  };

  // 결정적 물증 태그 삭제
  const handleRemoveSmokingGun = (target) => {
    setSmokingGuns(smokingGuns.filter(g => g !== target));
  };

  // 텍스트/시나리오 붙여넣기 파싱
  const handleApplyPastedScenario = () => {
    if (!pastedText.trim()) return;

    // 제목
    const titleMatch = pastedText.match(/(?:시나리오\s*제목|사건명|사건\s*제목|제목)\s*[:：]\s*([^\n\r]+)/i);
    if (titleMatch) setScenarioTitle(titleMatch[1].trim());

    // 피해자
    const victimMatch = pastedText.match(/(?:피해자|사망자|타깃)\s*[:：]\s*([^\n\r]+)/i);
    if (victimMatch) setVictimName(victimMatch[1].trim());

    // 개요 / 시놉시스
    const synMatch = pastedText.match(/(?:\[공개\s*시놉시스\]|공개\s*시놉시스\s*[:：]?|사건\s*개요\s*[:：]?)\s*([\s\S]*?)(?=\n\s*(?:\[서막\]|서막\s*[:：]|\[도입부\]|도입부\s*[:：]|#+|\[|$))/i);
    if (synMatch) setPublicSynopsis(synMatch[1].trim());

    // 서막 / 오프닝
    const opMatch = pastedText.match(/(?:\[서막\]|서막\s*[:：]?|\[도입부\]|도입부\s*[:：]?|오프닝\s*[:：]?)\s*([\s\S]*?)(?=\n\s*(?:\[진상|진상\s*[:：]|#+|\[|$))/i);
    if (opMatch) setOpeningScene(opMatch[ opMatch.length > 1 ? 1 : 0 ].trim());

    // 진상
    const trMatch = pastedText.match(/(?:\[사건의\s*진상\]|사건의\s*진상\s*[:：]?|진상\s*[:：]?)\s*([\s\S]*?)(?=\n\s*(?:###|\[|$))/i);
    if (trMatch) setHiddenTruth(trMatch[1].trim());

    setShowPasteModal(false);
    setPastedText("");
    triggerToast("시나리오 데이터 파싱 완료", "작성된 서류철 양식에 맞춰 자동 배치되었습니다.", "✨");
  };

  // 인게임 진입 (본편 입장)
  const handleStartGame = () => {
    if (!scenarioTitle.trim()) {
      triggerToast("사건명 미입력", "수사할 사건명을 먼저 입력해주세요.", "⚠️");
      return;
    }

    const sessionData = {
      title: scenarioTitle,
      victim: victimName,
      synopsis: publicSynopsis,
      opening: openingScene,
      mode: selectedMode,
      suspects: suspects,
      smokingGuns: smokingGuns,
      culprit: culpritName,
      trick: trickDetail,
      truth: hiddenTruth,
      day: 1,
      phase: "저녁",
      trustHp: 20,
      fatigue: 0
    };

    setActiveSession(sessionData);
    setMessages([
      {
        role: "model",
        text: openingScene || `차가운 정적 속에 현장 테이프가 바람에 나부낍니다.\n\n피해자 [${victimName || "신원 미상의 인물"}]의 마지막 행적을 둘러싸고, 모여든 관계자들의 시선이 교차합니다.`
      }
    ]);
    triggerToast("수사 개시", `《${scenarioTitle}》 사건 현장에 진입합니다.`, "🕵️");
  };

  // 대사/행동 전송
  const handleSendMessage = () => {
    if (!inputMsg.trim() || isLoading) return;
    const userText = inputMsg.trim();
    setInputMsg("");

    const updated = [...messages, { role: "user", text: userText }];
    setMessages(updated);
    setIsLoading(true);

    setTimeout(() => {
      setMessages([
        ...updated,
        {
          role: "model",
          text: `“그 질문에 제가 무어라 답해야 할지 모르겠군요.”\n\n서류를 넘기던 손끝이 미세하게 굳어집니다. 상대방은 시선을 창밖으로 돌리며 굳게 입을 다뭅니다.`
        }
      ]);
      setIsLoading(false);
    }, 900);
  };

  return (
    <div style={{ display: "flex", height: "100dvh", width: "100vw", backgroundColor: theme.bg, color: theme.text, overflow: "hidden", position: "relative", fontFamily: "'Pretendard', sans-serif" }}>
      
      {/* 🍞 글로벌 플로팅 토스트 */}
      {toast && (
        <div
          onClick={() => setToast(null)}
          style={{
            ...GLASS_STYLE,
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99999,
            backgroundColor: "rgba(22, 19, 21, 0.95)",
            border: `1.5px solid ${theme.accent}`,
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 10px 32px rgba(0,0,0,0.5)",
            cursor: "pointer",
            maxWidth: "min(440px, 92vw)",
            animation: "fadeIn 0.2s ease-out"
          }}
        >
          <span style={{ fontSize: "1.15rem" }}>{toast.icon}</span>
          <span style={{ fontSize: "0.84rem", fontWeight: "800", color: theme.accent }}>{toast.title}</span>
          {toast.message && <span style={{ fontSize: "0.76rem", opacity: 0.85 }}>{toast.message}</span>}
        </div>
      )}

      {/* ── ☰ 좌측 세션 서랍 (모바일 100vw 풀스크린) ── */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", zIndex: 100 }}
        />
      )}

      <aside
        style={{
          position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 110,
          width: isMobile ? "100vw" : "320px",
          transform: isDrawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
          backgroundColor: theme.sidebar,
          borderRight: `1px solid ${theme.border}`,
          display: "flex", flexDirection: "column",
          boxShadow: isDrawerOpen ? "10px 0 40px rgba(0,0,0,0.5)" : "none"
        }}
      >
        <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "900", fontSize: "1rem" }}>사건 및 세션 보관함</span>
          <button onClick={() => setIsDrawerOpen(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.3rem", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ padding: "24px 12px", textAlign: "center", color: theme.textMuted, fontSize: "0.78rem", border: `1px dashed ${theme.border}`, borderRadius: "10px" }}>
            진행 중인 세션 기록이 없습니다.
          </div>
        </div>
        <div style={{ padding: "14px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: "8px" }}>
          <button onClick={() => triggerToast("환경 설정", "준비 중입니다.", "⚙️")} style={{ flex: 1, padding: "9px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}>⚙ 설정</button>
          <button onClick={() => triggerToast("데이터 관리", "준비 중입니다.", "💾")} style={{ flex: 1, padding: "9px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}>💾 데이터</button>
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
                <button onClick={() => setShowPasteModal(true)} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", backgroundColor: theme.panelAlt, border: `1.5px solid ${theme.accent}`, borderRadius: "14px", color: theme.accent, fontSize: "0.75rem", fontWeight: "800", cursor: "pointer" }}>
                  <span>📄</span>
                  <span>시나리오 불러오기</span>
                </button>
                <button onClick={() => triggerToast("세팅 저장", "현재 작성 중인 서류가 로컬에 저장되었습니다.", "💾")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>💾</button>
              </>
            ) : (
              <button onClick={() => setActiveSession(null)} style={{ padding: "4px 10px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}>로비로 나가기</button>
            )}
            <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>{isDarkMode ? "☀️" : "🌙"}</button>
          </div>
        </header>

        {/* ── [A. 창작 탭 / 세션 생성 로비 뷰] ── */}
        {!activeSession ? (
          <main style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px 16px", maxWidth: "860px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "18px", boxSizing: "border-box" }}>
            
            {/* 1. 3대 모드 선택 카드 */}
            <section style={{ ...GLASS_STYLE, padding: "18px", backgroundColor: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "12px", color: theme.text }}>
                1. 룰 시스템 선택
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "10px" }}>
                {[
                  { key: "추리", icon: "🕵️", title: "추리", desc: "단서를 모아 진상을 파헤치는 두뇌 수사극" },
                  { key: "연애", icon: "🌸", title: "연애", desc: "선택지와 감정선 중심의 감성 서사극" },
                  { key: "괴담", icon: "🕯️", title: "괴담", desc: "이면을 밝히고 침식을 견디는 서스펜스 종막" }
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
                        boxShadow: isSel ? theme.accentGlow : "none",
                        transition: "all 0.2s"
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

            {/* 2. 장르 톤 태그 (선택 칩 + 직접 입력) */}
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
                      }}
                      style={{
                        padding: "5px 11px", borderRadius: "16px", fontSize: "0.76rem",
                        fontWeight: isSelected ? "800" : "500",
                        backgroundColor: isSelected ? theme.accent : "transparent",
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
                placeholder="태그를 직접 입력할 수도 있습니다 (예: #밀실살인 #심리전)..."
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.84rem", outline: "none" }}
              />
            </section>

            {/* ── 🕵️ [추리 모드 전용 범용 수사본부 서류철] ── */}
            {selectedMode === "추리" && (
              <>
                {/* A. 사건 기본 개요서 */}
                <section style={{ ...GLASS_STYLE, padding: "18px", backgroundColor: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>📋</span>
                    <span style={{ fontWeight: "900", fontSize: "0.92rem", color: theme.text }}>사건 개요서</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "10px" }}>
                    <input
                      type="text"
                      value={scenarioTitle}
                      onChange={e => setScenarioTitle(e.target.value)}
                      placeholder="사건명을 입력하세요 (예: 심야 펜트하우스 살인사건)"
                      style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }}
                    />
                    <input
                      type="text"
                      value={victimName}
                      onChange={e => setVictimName(e.target.value)}
                      placeholder="피해자 신원 (예: 한도진 대표, 45세)"
                      style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={publicSynopsis}
                    onChange={e => setPublicSynopsis(e.target.value)}
                    placeholder="현장 상황 및 사건 발생 개요를 입력하세요..."
                    style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }}
                  />
                  <textarea
                    rows={2}
                    value={openingScene}
                    onChange={e => setOpeningScene(e.target.value)}
                    placeholder="이야기가 시작되는 첫 서막/오프닝 지문을 입력하세요..."
                    style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }}
                  />
                </section>

{/* B. 동적 용의자 및 인물 수사망 (핀 보드 + 하단 서류철 에디터) */}
<section style={{ ...GLASS_STYLE, padding: "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
  
  {/* 상단 툴바: 타이틀 & 추가 버튼 */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ color: "#ef4444", fontSize: "1.1rem" }}>📌</span>
      <span style={{ fontWeight: "900", fontSize: "0.95rem", color: theme.text }}>
        용의자 수사망 ({suspects.length}명)
      </span>
    </div>
    <button
      type="button"
      onClick={() => {
        const nextId = Date.now();
        const newSuspect = {
          id: nextId,
          name: "",
          ageGender: "",
          job: "",
          motive: "",
          alibi: "",
          secret: "",
          portraitUrl: ""
        };
        setSuspects([...suspects, newSuspect]);
        setSelectedSuspectId(nextId);
        triggerToast("용의자 카드 추가", "새로운 수사 카드가 핀으로 고정되었습니다.", "📌");
      }}
      style={{ padding: "6px 14px", backgroundColor: theme.panelAlt, border: `1.5px solid ${theme.accent}`, borderRadius: "16px", color: theme.accent, fontSize: "0.76rem", fontWeight: "800", cursor: "pointer" }}
    >
      ＋ 용의자 추가
    </button>
  </div>

  {/* 1. 상단: 폴라로이드 핀 보드 (가로 진열) */}
  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" }}>
    {suspects.map((s, idx) => {
      const isSelected = (selectedSuspectId || suspects[0]?.id) === s.id;
      return (
        <div
          key={s.id}
          onClick={() => setSelectedSuspectId(s.id)}
          style={{
            backgroundColor: "#f5f5f4",
            borderRadius: "6px",
            padding: "8px 8px 12px 8px",
            color: "#1c1917",
            boxShadow: isSelected ? `0 0 0 2px ${theme.accent}, 0 8px 24px rgba(0,0,0,0.45)` : "0 4px 12px rgba(0,0,0,0.25)",
            position: "relative",
            cursor: "pointer",
            transform: isSelected ? "scale(1.03)" : "scale(1)",
            transition: "all 0.15s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {/* 붉은 압정 핀 */}
          <div style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444", boxShadow: "0 2px 4px rgba(0,0,0,0.4)", zIndex: 2 }} />
          
          {/* 사진 슬롯 */}
          <div style={{ width: "100%", aspectRatio: "1/1", backgroundColor: "#292524", borderRadius: "3px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {s.portraitUrl ? (
              <img src={s.portraitUrl} alt="용의자" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "1.3rem", opacity: 0.6 }}>👤</span>
            )}
          </div>

          {/* 인물 이름표 */}
          <div style={{ marginTop: "6px", textAlign: "center", width: "100%" }}>
            <div style={{ fontWeight: "900", fontSize: "0.8rem", color: "#1c1917", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {s.name || `용의자 ${idx + 1}`}
            </div>
            <div style={{ fontSize: "0.66rem", color: "#78716c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "1px" }}>
              {s.job || "신분 미상"}
            </div>
          </div>
        </div>
      );
    })}
  </div>

  {/* 2. 하단: 선택된 용의자 상세 수사 서류철 (편안한 에디터 카드) */}
  {(() => {
    const curId = selectedSuspectId || suspects[0]?.id;
    const cur = suspects.find(s => s.id === curId) || suspects[0];
    if (!cur) return null;

    return (
      <div style={{ padding: "16px", backgroundColor: isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)", borderRadius: "12px", border: `1.5px solid ${theme.borderHighlight || theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
        
        {/* 서류철 상단 바 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px dashed ${theme.border}`, paddingBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.88rem", fontWeight: "900", color: theme.accent }}>
              📂 수사 서류: [{cur.name || "신원 미상"}]
            </span>
          </div>
          {suspects.length > 1 && (
            <button
              type="button"
              onClick={() => {
                const nextSuspects = suspects.filter(s => s.id !== cur.id);
                setSuspects(nextSuspects);
                setSelectedSuspectId(nextSuspects[0]?.id);
                triggerToast("용의자 삭제", "수사망에서 제거되었습니다.", "🗑️");
              }}
              style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", fontSize: "0.78rem", fontWeight: "700" }}
            >
              🗑️ 이 용의자 삭제
            </button>
          )}
        </div>

        {/* 1행: 이름 / 나이성별 / 직업 */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr", gap: "8px" }}>
          <input
            type="text"
            value={cur.name}
            onChange={e => handleUpdateSuspect(cur.id, "name", e.target.value)}
            placeholder="용의자 이름"
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }}
          />
          <input
            type="text"
            value={cur.ageGender}
            onChange={e => handleUpdateSuspect(cur.id, "ageGender", e.target.value)}
            placeholder="나이/성별 (예: 28세 여성)"
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }}
          />
          <input
            type="text"
            value={cur.job}
            onChange={e => handleUpdateSuspect(cur.id, "job", e.target.value)}
            placeholder="직업 / 신분 (예: 전속 주치의)"
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }}
          />
        </div>

        {/* 2행: 범행 동기 & 알리바이 */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px" }}>
          <input
            type="text"
            value={cur.motive}
            onChange={e => handleUpdateSuspect(cur.id, "motive", e.target.value)}
            placeholder="범행 동기 / 피해자와의 이해관계"
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }}
          />
          <input
            type="text"
            value={cur.alibi}
            onChange={e => handleUpdateSuspect(cur.id, "alibi", e.target.value)}
            placeholder="사건 당시 주장하는 알리바이"
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }}
          />
        </div>

        {/* 3행: 사진 링크 입력창 */}
        <input
          type="text"
          value={cur.portraitUrl}
          onChange={e => handleUpdateSuspect(cur.id, "portraitUrl", e.target.value)}
          placeholder="초상화 이미지 웹 링크 URL (선택 사항)"
          style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.78rem", outline: "none" }}
        />

        {/* 4행: 🔒 숨겨진 비밀 / 치부 (스포일러 방지 접기) */}
        <details style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.7)", borderRadius: "8px", border: `1px solid ${theme.danger}`, overflow: "hidden" }}>
          <summary style={{ padding: "8px 12px", fontSize: "0.78rem", fontWeight: "800", color: theme.danger, cursor: "pointer", userSelect: "none" }}>
            🔒 숨겨진 비밀 / 치부 (심문 성공 시 밝혀질 약점 · 클릭하여 작성)
          </summary>
          <div style={{ padding: "8px 12px", borderTop: `1px dashed ${theme.border}` }}>
            <input
              type="text"
              value={cur.secret}
              onChange={e => handleUpdateSuspect(cur.id, "secret", e.target.value)}
              placeholder="알리바이의 허점이나 감추고 있는 결정적 진실..."
              style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.82rem", outline: "none" }}
            />
          </div>
        </details>
      </div>
    );
  })()}
</section>

               {/* C. 확보된 물증 및 사건 파일 (표면 특징 + 모순점 + 🔒감식 비밀) */}
<section style={{ ...GLASS_STYLE, padding: "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span>🔍</span>
      <span style={{ fontWeight: "900", fontSize: "0.95rem", color: theme.text }}>
        확보된 물증 및 사건 파일 ({evidenceList.length}건)
      </span>
    </div>
    <button
      type="button"
      onClick={() => {
        const nextId = Date.now();
        setEvidenceList([
          ...evidenceList,
          { id: nextId, name: "", overview: "", contradiction: "", secret: "" }
        ]);
        triggerToast("물증 슬롯 추가", "새로운 증거품 서류가 생성되었습니다.", "📦");
      }}
      style={{ padding: "5px 12px", backgroundColor: theme.panelAlt, border: `1.5px solid ${theme.accent}`, borderRadius: "14px", color: theme.accent, fontSize: "0.75rem", fontWeight: "800", cursor: "pointer" }}
    >
      ＋ 물증 추가
    </button>
  </div>

  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
    {evidenceList.map((item, idx) => (
      <div
        key={item.id}
        style={{
          backgroundColor: isDarkMode ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.6)",
          border: `1px solid ${theme.border}`,
          borderRadius: "10px",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          position: "relative"
        }}
      >
        {/* 상단: 물증 이름 & 삭제 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
          <input
            type="text"
            value={item.name}
            onChange={e => {
              const updated = evidenceList.map(ev => ev.id === item.id ? { ...ev, name: e.target.value } : ev);
              setEvidenceList(updated);
            }}
            placeholder={`물증 ${idx + 1} 이름 (예: 마호가니 만년필)`}
            style={{ flex: 1, padding: "6px 8px", borderRadius: "4px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", fontWeight: "800", outline: "none" }}
          />
          {evidenceList.length > 1 && (
            <button
              type="button"
              onClick={() => setEvidenceList(evidenceList.filter(ev => ev.id !== item.id))}
              style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", padding: "2px", fontSize: "0.8rem" }}
            >
              🗑️
            </button>
          )}
        </div>

        {/* 표면 특징 */}
        <input
          type="text"
          value={item.overview}
          onChange={e => {
            const updated = evidenceList.map(ev => ev.id === item.id ? { ...ev, overview: e.target.value } : ev);
            setEvidenceList(updated);
          }}
          placeholder="표면적 특징 및 발견 위치 (예: 서재 바닥에서 발견된 잉크 펜)"
          style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", borderRadius: "4px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.75rem", outline: "none" }}
        />

        {/* 결정적 모순 / 증거인 이유 */}
        <textarea
          rows={2}
          value={item.contradiction}
          onChange={e => {
            const updated = evidenceList.map(ev => ev.id === item.id ? { ...ev, contradiction: e.target.value } : ev);
            setEvidenceList(updated);
          }}
          placeholder="결정적 물증인 이유 (예: 피해자는 왼손잡이이나 펜촉 마모는 오른손잡이 기준)"
          style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", borderRadius: "4px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.75rem", outline: "none", resize: "none" }}
        />

        {/* 🔒 감식 결과 / 숨겨진 비밀 (스포일러 방지 접기) */}
        <details style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)", borderRadius: "6px", border: `1px solid ${theme.accent}`, overflow: "hidden" }}>
          <summary style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "800", color: theme.accent, cursor: "pointer", userSelect: "none" }}>
            🔒 숨겨진 감식 결과 / 진실 (클릭하여 열람)
          </summary>
          <div style={{ padding: "6px 10px", borderTop: `1px dashed ${theme.border}` }}>
            <input
              type="text"
              value={item.secret}
              onChange={e => {
                const updated = evidenceList.map(ev => ev.id === item.id ? { ...ev, secret: e.target.value } : ev);
                setEvidenceList(updated);
              }}
              placeholder="조사/감식 성공 시 드러날 결정적 진실..."
              style={{ width: "100%", boxSizing: "border-box", padding: "5px 6px", borderRadius: "4px", border: `1px solid ${theme.accent}`, backgroundColor: theme.inputBg, color: theme.accent, fontSize: "0.75rem", outline: "none" }}
            />
          </div>
        </details>
      </div>
    ))}
  </div>
</section>

                {/* D. 진상 기밀 봉투 (스포일러 완전 차단 details) */}
                <details style={{ ...GLASS_STYLE, backgroundColor: isDarkMode ? "rgba(25, 15, 18, 0.7)" : "rgba(254, 242, 242, 0.8)", borderRadius: "16px", border: `1.5px solid ${theme.accent}`, overflow: "hidden" }}>
                  <summary style={{ padding: "16px 18px", fontSize: "0.88rem", fontWeight: "900", color: theme.accent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", userSelect: "none" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>✉️</span> 사건 진상 기밀 봉투 (스포일러 주의 · 터치하여 열람)
                    </span>
                    <span style={{ fontSize: "0.72rem", color: theme.textMuted }}>[기밀 잠금]</span>
                  </summary>
                  <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px", borderTop: `1px solid ${theme.border}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: "10px" }}>
                      <input
                        type="text"
                        value={culpritName}
                        onChange={e => setCulpritName(e.target.value)}
                        placeholder="진범 이름 (용의자 중 1명)"
                        style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }}
                      />
                      <input
                        type="text"
                        value={trickDetail}
                        onChange={e => setTrickDetail(e.target.value)}
                        placeholder="사용된 트릭 (예: 타이머와 에어컨을 이용한 사망 추정 시각 조작)"
                        style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }}
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={hiddenTruth}
                      onChange={e => setHiddenTruth(e.target.value)}
                      placeholder="사건의 전체 배후 내막 및 엔딩 분기 조건..."
                      style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", outline: "none", resize: "none" }}
                    />
                  </div>
                </details>
              </>
            )}

            {/* ── 🌸 [연애 모드 전용 영역 (준비 중 안내)] ── */}
            {selectedMode === "연애" && (
              <div style={{ ...GLASS_STYLE, padding: "40px 20px", textAlign: "center", color: theme.textMuted, borderRadius: "16px", border: `1.5px dashed ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "2rem" }}>🌸</span>
                <span style={{ fontSize: "0.92rem", fontWeight: "800", color: theme.accent }}>연애 모드 서류철 준비 중</span>
                <span style={{ fontSize: "0.76rem" }}>호감도 텐션, 취향 수첩, 스마트폰 메신저 프로필이 이곳에 연결됩니다.</span>
              </div>
            )}

            {/* ── 🕯️ [괴담 모드 전용 영역 (준비 중 안내)] ── */}
            {selectedMode === "괴담" && (
              <div style={{ ...GLASS_STYLE, padding: "40px 20px", textAlign: "center", color: theme.textMuted, borderRadius: "16px", border: `1.5px dashed ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "2rem" }}>🕯️</span>
                <span style={{ fontSize: "0.92rem", fontWeight: "800", color: theme.accent }}>괴담 모드 서류철 준비 중</span>
                <span style={{ fontSize: "0.76rem" }}>재능 3슬롯 장착 칩, 이면 카드(앞/뒷면), 침식도 HUD가 이곳에 연결됩니다.</span>
              </div>
            )}

            {/* 본편 이야기 시작하기 버튼 */}
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
          /* ── [B. 인게임 뷰: 소설 본문 리더] ── */
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
                  type="text"
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
                  placeholder="대사나 행동을 입력하세요..."
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "20px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, outline: "none" }}
                />
                <button onClick={handleSendMessage} style={{ padding: "0 18px", borderRadius: "20px", backgroundColor: theme.accent, color: "#fff", border: "none", fontWeight: "800", cursor: "pointer" }}>전송</button>
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
              backgroundColor: "rgba(22, 19, 21, 0.65)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "20px",
              display: "flex", overflow: "hidden", zIndex: 50,
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.45)"
            }}
          >
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

      {/* ── 📄 시나리오 텍스트 붙여넣기 모달 ── */}
      {showPasteModal && (
        <div
          onClick={() => setShowPasteModal(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: "520px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "800", fontSize: "0.95rem" }}>📄 시나리오 텍스트 붙여넣기</span>
              <button onClick={() => setShowPasteModal(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
            </div>
            <textarea
              rows={8}
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder="스튜디오에서 작성된 시나리오 전체 글을 여기에 붙여넣으세요..."
              style={{ width: "100%", boxSizing: "border-box", padding: "12px", backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.82rem", outline: "none", resize: "none" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setShowPasteModal(false)} style={{ flex: 1, padding: "10px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.8rem", cursor: "pointer" }}>취소</button>
              <button onClick={handleApplyPastedScenario} style={{ flex: 2, padding: "10px", backgroundColor: theme.accent, color: "#fff", border: "none", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "800", cursor: "pointer" }}>서류철에 자동 배치 ➔</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
