"use client";

import { useState, useEffect } from "react";
import { THEME_PALETTES, GLASS_STYLE } from "@/lib/themes";

export default function GamePlatform() {
  // ── [1. 테마 & 나이트/라이트 모드 엔진] ──
  const [themeKey] = useState("cloud"); // 기본: 오트 밀크
  const [isDarkMode, setIsDarkMode] = useState(false); // 스크린샷 기준 라이트 모드 기본
  
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
  const [activeTab, setActiveTab] = useState("studio");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [activeSession, setActiveSession] = useState(null);

  // ── [4. 3대 룰 모드 선택 (기본: 추리)] ──
  const [selectedMode, setSelectedMode] = useState("추리");

  // ── [5. 장르 톤 태그] ──
  const [playPreference, setPlayPreference] = useState("");

  // ── [6. 추리 모드 전용 범용 상태] ──
 // A. 사건 개요서
  const [scenarioTitle, setScenarioTitle] = useState("");
  const [victimName, setVictimName] = useState("");
  const [publicSynopsis, setPublicSynopsis] = useState("");
  const [openingScene, setOpeningScene] = useState("");

  // B. 동적 용의자 수사망
  const [suspects, setSuspects] = useState([
    {
      id: 1,
      name: "",
      ageGender: "",
      job: "",
      behavior: "",
      secret: "",
      portraitUrl: "",
      showSecret: false
    }
  ]);
  const [selectedSuspectId, setSelectedSuspectId] = useState(1);

  // 🖼️ 초상화 대형 뷰어 및 이미지 변경 모달 상태
  const [showPortraitModal, setShowPortraitModal] = useState(false);
  const [isEditingPortrait, setIsEditingPortrait] = useState(false);
  const [activePortraitSuspectId, setActivePortraitSuspectId] = useState(null);
  const [customPortraitInput, setCustomPortraitInput] = useState("");

  // C. 단서 & 물증 보관소 (🌟 유연하게 여닫히는 아코디언 상태)
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(true);
  const [evidenceList, setEvidenceList] = useState([
    {
      id: 1,
      name: "",
      overview: "",
      contradiction: "",
      secret: "",
      showSecret: false
    }
  ]);

  // D. 사건 진상 기밀 봉투 (🌟 유연하게 여닫히는 아코디언 상태)
  const [isTruthOpen, setIsTruthOpen] = useState(false);
  const [culpritName, setCulpritName] = useState("");
  const [trickDetail, setTrickDetail] = useState("");
  const [hiddenTruth, setHiddenTruth] = useState("");

  // ── [7. 인게임 소설 리더 메시지 상태] ──
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── [8. 동적 조작 함수들] ──
  // 용의자 추가 (최대 10명 제한)
  const handleAddSuspect = () => {
    if (suspects.length >= 10) {
      triggerToast("인원 제한", "용의자는 최대 10명까지만 등록할 수 있습니다.", "⚠️");
      return;
    }

    const nextId = Date.now();
    setSuspects([
      ...suspects,
      {
        id: nextId,
        name: "",
        ageGender: "",
        job: "",
        behavior: "",
        secret: "",
        portraitUrl: "",
        showSecret: false
      }
    ]);
    setSelectedSuspectId(nextId);
    triggerToast("인물 추가", "새로운 수사 카드가 추가되었습니다.", "📌");
  };

  // 용의자 삭제
  const handleDeleteSuspect = (id) => {
    if (suspects.length <= 1) {
      triggerToast("삭제 불가", "최소 1명의 용의자 카드는 유지되어야 합니다.", "⚠️");
      return;
    }
    const filtered = suspects.filter(s => s.id !== id);
    setSuspects(filtered);
    if (selectedSuspectId === id) setSelectedSuspectId(filtered[0]?.id);
    triggerToast("용의자 삭제", "수사망에서 제외되었습니다.", "🗑️");
  };

  // 용의자 필드 수정
  const handleUpdateSuspect = (id, field, value) => {
    setSuspects(suspects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // 초상화 파일 업로드 처리
  const handlePortraitFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !activePortraitSuspectId) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      handleUpdateSuspect(activePortraitSuspectId, "portraitUrl", ev.target.result);
      const target = suspects.find(s => s.id === activePortraitSuspectId);
      triggerToast("초상화 등록 완료", `[${target?.name || "용의자"}]의 사진이 수사망에 고정되었습니다.`, "📷");
      setIsEditingPortrait(false);
      setShowPortraitModal(false);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  // 초상화 웹 링크 URL 적용 처리
  const handleApplyPortraitUrl = () => {
    if (!customPortraitInput.trim() || !activePortraitSuspectId) return;
    handleUpdateSuspect(activePortraitSuspectId, "portraitUrl", customPortraitInput.trim());
    const target = suspects.find(s => s.id === activePortraitSuspectId);
    triggerToast("초상화 링크 적용", `[${target?.name || "용의자"}]의 사진이 변경되었습니다.`, "✨");
    setCustomPortraitInput("");
    setIsEditingPortrait(false);
    setShowPortraitModal(false);
  };

  // 텍스트/시나리오 붙여넣기 파싱
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
    triggerToast("시나리오 파싱 완료", "작성된 서류철 양식에 자동 배치되었습니다.", "✨");
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
      evidenceList: evidenceList,
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
        text: openingScene || `차가운 정적 속에 현장 테이프가 바람에 나부낍니다.\n\n사건 대상 [${victimName || "신원 미상의 인물"}]의 마지막 행적을 둘러싸고, 모여든 관계자들의 시선이 교차합니다.`
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
    <div style={{ display: "flex", height: "100dvh", width: "100vw", backgroundColor: theme.bg, color: theme.text, overflow: "hidden", position: "relative", fontFamily: "'Pretendard', sans-serif", transition: "background-color 0.25s ease, color 0.25s ease" }}>
      
      {/* 🌟 4px 미니멀 슬림 스크롤바 스타일 */}
      <style>{`
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.18)"};
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.accent};
        }
      `}</style>

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
            backgroundColor: isDarkMode ? "rgba(35, 30, 28, 0.96)" : "rgba(255, 255, 255, 0.96)",
            border: `1.5px solid ${theme.accent}`,
            color: theme.text,
            padding: "10px 18px",
            borderRadius: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: isDarkMode ? "0 10px 32px rgba(0,0,0,0.5)" : "0 10px 30px rgba(0,0,0,0.12)",
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
        <header style={{ height: "54px", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.sidebar, flexShrink: 0, zIndex: 40, transition: "background-color 0.25s ease" }}>
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
            
            {/* ☀️ / 🌙 나이트-라이트 전환 버튼 */}
            <button
              onClick={() => {
                const nextMode = !isDarkMode;
                setIsDarkMode(nextMode);
                triggerToast(
                  "모드 전환",
                  nextMode ? "나이트(다크) 모드로 전환되었습니다." : "라이트 모드로 전환되었습니다.",
                  nextMode ? "🌙" : "☀️"
                );
              }}
              title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.15rem", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* ── [A. 창작 탭 / 세션 생성 로비 뷰] ── */}
        {!activeSession ? (
          <main style={{ flex: 1, overflowY: "auto", padding: "20px 16px 160px 16px", maxWidth: "860px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "18px", boxSizing: "border-box" }}>
            
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
                        boxShadow: isSel ? `0 0 16px ${theme.accentGlow}` : "none",
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
                      }}
                      style={{
                        padding: "5px 11px", borderRadius: "16px", fontSize: "0.76rem",
                        fontWeight: isSelected ? "800" : "500",
                        backgroundColor: isSelected ? theme.accent : "transparent",
                        color: isSelected ? (isDarkMode ? "#ffffff" : "#ffffff") : theme.text,
                        border: `1px solid ${isSelected ? theme.accent : theme.border}`,
                        cursor: "pointer",
                        transition: "all 0.15s"
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
                      placeholder="사건 대상/피해자/의뢰인 (예: 한도진 대표, 45세)"
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

                {/* B. 동적 용의자 및 인물 수사망 (핀보드 + 인물 서류철) */}
                <section style={{ ...GLASS_STYLE, padding: "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1.1rem" }}>📌</span>
                      <span style={{ fontWeight: "900", fontSize: "0.95rem", color: theme.text }}>
                        용의자 및 인물 수사망 ({suspects.length}명)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSuspect}
                      style={{ padding: "6px 14px", backgroundColor: theme.panelAlt, border: `1.5px solid ${theme.accent}`, borderRadius: "16px", color: theme.accent, fontSize: "0.76rem", fontWeight: "800", cursor: "pointer" }}
                    >
                      ＋ 인물 추가
                    </button>
                  </div>

                  {/* 1. 상단: 폴라로이드 핀 보드 (부드러운 크리미 & 빈티지 톤) */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(135px, 1fr))", gap: "12px" }}>
                    {suspects.map((s, idx) => {
                      const isSelected = (selectedSuspectId || suspects[0]?.id) === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSuspectId(s.id)}
                          style={{
                            backgroundColor: theme.polaroidBg || "#ded7cb",
                            borderRadius: "6px",
                            padding: "8px 8px 12px 8px",
                            color: theme.polaroidText || "#292524",
                            boxShadow: isSelected ? `0 0 0 2px ${theme.accent}, 0 8px 24px rgba(0,0,0,0.3)` : "0 3px 10px rgba(0,0,0,0.18)",
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
                          <div style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: theme.danger, boxShadow: "0 2px 4px rgba(0,0,0,0.3)", zIndex: 2 }} />
                          
                          {/* 초상화 사진 슬롯 */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePortraitSuspectId(s.id);
                              setIsEditingPortrait(false);
                              setShowPortraitModal(true);
                            }}
                            title="클릭하여 초상화 크게 보기 및 변경"
                            style={{
                              width: "100%", aspectRatio: "1/1",
                              backgroundColor: isDarkMode ? "#332d2a" : "#eae4db",
                              borderRadius: "3px", overflow: "hidden",
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", position: "relative"
                            }}
                          >
                            {s.portraitUrl ? (
                              <img src={s.portraitUrl} alt="용의자" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: isDarkMode ? "#b3aaa0" : "#8c8278", fontSize: "0.68rem" }}>
                                <span style={{ fontSize: "1.3rem" }}>📷</span>
                                <span style={{ fontWeight: "700" }}>사진 등록</span>
                              </div>
                            )}
                          </div>

                          {/* 인물 이름표 */}
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

                  {/* 2. 하단: 선택된 인물 수사 서류철 (넉넉한 자유 서술형) */}
                  {(() => {
                    const curId = selectedSuspectId || suspects[0]?.id;
                    const cur = suspects.find(s => s.id === curId) || suspects[0];
                    if (!cur) return null;

                    return (
                      <div style={{ padding: "16px", backgroundColor: theme.panelAlt, borderRadius: "12px", border: `1.5px solid ${theme.borderHighlight || theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px dashed ${theme.border}`, paddingBottom: "8px" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: "900", color: theme.accent }}>
                            📂 수사 서류: [{cur.name || "신원 미상"}]
                          </span>
                          {suspects.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSuspect(cur.id)}
                              style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", fontSize: "0.78rem", fontWeight: "700" }}
                            >
                              🗑 이 인물 삭제
                            </button>
                          )}
                        </div>

                        {/* 1행: 이름 / 나이성별 / 직업 */}
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr", gap: "8px" }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>이름</label>
                            <input
                              type="text"
                              value={cur.name}
                              onChange={e => handleUpdateSuspect(cur.id, "name", e.target.value)}
                              placeholder="예: 강이솔"
                              style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>나이/성별</label>
                            <input
                              type="text"
                              value={cur.ageGender}
                              onChange={e => handleUpdateSuspect(cur.id, "ageGender", e.target.value)}
                              placeholder="예: 26세 여성"
                              style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>직업/역할</label>
                            <input
                              type="text"
                              value={cur.job}
                              onChange={e => handleUpdateSuspect(cur.id, "job", e.target.value)}
                              placeholder="예: 선임 연구원"
                              style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }}
                            />
                          </div>
                        </div>

                        {/* 2행: 인물 특징 및 사건 관련 행적 (자유 서술형 통합) */}
                        <div>
                          <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>인물 특징 및 사건 관련 행적 (알리바이 / 이해관계 자유 서술)</label>
                          <textarea
                            rows={3}
                            value={cur.behavior}
                            onChange={e => handleUpdateSuspect(cur.id, "behavior", e.target.value)}
                            placeholder="성격, 피해자와의 관계, 사건 당일 주장하는 행적이나 의심스러운 정황을 자유롭게 기재하세요..."
                            style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", resize: "vertical" }}
                          />
                        </div>

                        {/* 3행: 🔒 숨겨진 비밀 / 모순 (리액트 토글 아코디언) */}
                        <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)", borderRadius: "8px", border: `1px solid ${theme.danger}`, overflow: "hidden", marginTop: "4px" }}>
                          <div
                            onClick={() => handleUpdateSuspect(cur.id, "showSecret", !cur.showSecret)}
                            style={{ padding: "8px 12px", fontSize: "0.76rem", fontWeight: "800", color: theme.danger, cursor: "pointer", userSelect: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                          >
                            <span>🔒 숨겨진 비밀 / 모순 (심문 성공 시 밝혀질 약점)</span>
                            <span>{cur.showSecret ? "접기 ▲" : "열람 / 수정 ▼"}</span>
                          </div>
                          {cur.showSecret && (
                            <div style={{ padding: "8px 12px", borderTop: `1px dashed ${theme.border}` }}>
                              <input
                                type="text"
                                value={cur.secret}
                                onChange={e => handleUpdateSuspect(cur.id, "secret", e.target.value)}
                                placeholder="알리바이의 허점이나 감추고 있는 결정적 진실..."
                                style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.82rem", outline: "none" }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </section>

{/* ── C. 사건 단서 및 물증 보관소 (선 버그 없는 안전한 개폐 토글) ── */}
<div style={{ ...GLASS_STYLE, backgroundColor: theme.panel, borderRadius: "14px", border: `1.5px solid ${theme.border}`, overflow: "hidden", marginBottom: "14px" }}>
  {/* 누르면 부드럽게 열리고 닫히는 헤더 바 */}
  <div
    onClick={() => setIsEvidenceOpen(!isEvidenceOpen)}
    style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", backgroundColor: theme.panelAlt, userSelect: "none" }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span>🔍</span>
      <span style={{ fontWeight: "900", fontSize: "0.9rem", color: theme.text }}>
        사건 단서 및 물증 보관소 ({evidenceList.length}건)
      </span>
      <span style={{ fontSize: "0.72rem", color: theme.danger, fontWeight: "700" }}>[스포일러 주의]</span>
    </div>
    <span style={{ fontSize: "0.78rem", color: theme.accent, fontWeight: "800" }}>
      {isEvidenceOpen ? "보관소 닫기 ▲" : "보관소 열기 ▼"}
    </span>
  </div>

  {/* 열었을 때만 나타나는 단서 목록 */}
  {isEvidenceOpen && (
    <div style={{ padding: "16px", borderTop: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.74rem", color: theme.textMuted }}>
          현장 탐색 및 심문으로 획득할 단서입니다.
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const nextId = Date.now();
            setEvidenceList([
              ...evidenceList,
              { id: nextId, name: "", overview: "", contradiction: "", secret: "", showSecret: false }
            ]);
            triggerToast("단서 추가", "새로운 단서 슬롯이 추가되었습니다.", "📦");
          }}
          style={{ padding: "4px 12px", backgroundColor: theme.panel, border: `1.5px solid ${theme.accent}`, borderRadius: "12px", color: theme.accent, fontSize: "0.74rem", fontWeight: "800", cursor: "pointer" }}
        >
          ＋ 단서 추가
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
        {evidenceList.map((item, idx) => (
          <div key={item.id} style={{ backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
              <input
                type="text"
                value={item.name}
                onChange={e => {
                  const updated = evidenceList.map(ev => ev.id === item.id ? { ...ev, name: e.target.value } : ev);
                  setEvidenceList(updated);
                }}
                placeholder={`단서 ${idx + 1} 명칭 (예: 마호가니 만년필)`}
                style={{ flex: 1, padding: "6px 8px", borderRadius: "4px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", fontWeight: "800", outline: "none" }}
              />
              {evidenceList.length > 1 && (
                <button
                  type="button"
                  onClick={() => setEvidenceList(evidenceList.filter(ev => ev.id !== item.id))}
                  style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", fontSize: "0.8rem" }}
                >
                  🗑
                </button>
              )}
            </div>

            <input
              type="text"
              value={item.overview}
              onChange={e => {
                const updated = evidenceList.map(ev => ev.id === item.id ? { ...ev, overview: e.target.value } : ev);
                setEvidenceList(updated);
              }}
              placeholder="발견 위치 및 겉모습 (조사 시 드러나는 정보)"
              style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", borderRadius: "4px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.75rem", outline: "none" }}
            />

            {/* 감식 비밀 토글 */}
            <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)", borderRadius: "6px", border: `1px solid ${theme.danger}`, overflow: "hidden" }}>
              <div
                onClick={() => {
                  const updated = evidenceList.map(ev => ev.id === item.id ? { ...ev, showSecret: !ev.showSecret } : ev);
                  setEvidenceList(updated);
                }}
                style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "800", color: theme.danger, cursor: "pointer", display: "flex", justifyContent: "space-between" }}
              >
                <span>🔒 감식 진상 & 결정적 모순점</span>
                <span>{item.showSecret ? "접기 ▲" : "열기 ▼"}</span>
              </div>
              {item.showSecret && (
                <div style={{ padding: "8px 10px", borderTop: `1px dashed ${theme.border}`, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <input
                    type="text"
                    value={item.contradiction}
                    onChange={e => {
                      const updated = evidenceList.map(ev => ev.id === item.id ? { ...ev, contradiction: e.target.value } : ev);
                      setEvidenceList(updated);
                    }}
                    placeholder="알리바이나 거짓말을 깰 결정적 모순..."
                    style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", borderRadius: "4px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.75rem", outline: "none" }}
                  />
                  <input
                    type="text"
                    value={item.secret}
                    onChange={e => {
                      const updated = evidenceList.map(ev => ev.id === item.id ? { ...ev, secret: e.target.value } : ev);
                      setEvidenceList(updated);
                    }}
                    placeholder="감식 성공 시 밝혀질 이면..."
                    style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", borderRadius: "4px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.75rem", outline: "none" }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

{/* ── D. 사건 진상 기밀 봉투 (선 버그 없는 안전한 개폐 토글) ── */}
<div style={{ ...GLASS_STYLE, backgroundColor: theme.panel, borderRadius: "14px", border: `1.5px solid ${theme.accent}`, overflow: "hidden", marginBottom: "14px" }}>
  {/* 누르면 부드럽게 열리고 닫히는 헤더 바 */}
  <div
    onClick={() => setIsTruthOpen(!isTruthOpen)}
    style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", backgroundColor: theme.panelAlt, userSelect: "none" }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span>✉️</span>
      <span style={{ fontWeight: "900", fontSize: "0.9rem", color: theme.accent }}>
        사건 진상 기밀 봉투 (진범 및 트릭)
      </span>
    </div>
    <span style={{ fontSize: "0.78rem", color: theme.accent, fontWeight: "800" }}>
      {isTruthOpen ? "기밀 봉투 닫기 ▲" : "기밀 봉투 열기 ▼"}
    </span>
  </div>

  {/* 열었을 때만 나타나는 진범/트릭 입력란 */}
  {isTruthOpen && (
    <div style={{ padding: "16px", borderTop: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: "10px" }}>
        <input
          type="text"
          value={culpritName}
          onChange={e => setCulpritName(e.target.value)}
          placeholder="진범 / 흑막 이름 (용의자 중 1명)"
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
        style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", outline: "none", resize: "vertical" }}
      />
    </div>
  )}
</div>
              </>
            )}

            {/* ── 🌸 [연애 모드 전용 영역 (준비 중)] ── */}
            {selectedMode === "연애" && (
              <div style={{ ...GLASS_STYLE, padding: "40px 20px", textAlign: "center", color: theme.textMuted, borderRadius: "16px", border: `1.5px dashed ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "2rem" }}>🌸</span>
                <span style={{ fontSize: "0.92rem", fontWeight: "800", color: theme.accent }}>연애 모드 서류철 준비 중</span>
                <span style={{ fontSize: "0.76rem" }}>호감도 텐션, 취향 수첩, 스마트폰 메신저 프로필이 이곳에 연결됩니다.</span>
              </div>
            )}

            {/* ── 🕯️ [괴담 모드 전용 영역 (준비 중)] ── */}
            {selectedMode === "괴담" && (
              <div style={{ ...GLASS_STYLE, padding: "40px 20px", textAlign: "center", color: theme.textMuted, borderRadius: "16px", border: `1.5px dashed ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "2rem" }}>🕯️</span>
                <span style={{ fontSize: "0.92rem", fontWeight: "800", color: theme.accent }}>괴담 모드 서류철 준비 중</span>
                <span style={{ fontSize: "0.76rem" }}>재능 3슬롯 장착 칩, 이면 카드(앞/뒷면), 침식도 HUD가 이곳에 연결됩니다.</span>
              </div>
            )}

            {/* 이야기 시작하기 버튼 */}
            <button
              onClick={handleStartGame}
              style={{
                width: "100%", padding: "16px", borderRadius: "14px",
                backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#ffffff", border: "none",
                fontWeight: "900", fontSize: "1rem", cursor: "pointer",
                boxShadow: `0 4px 20px ${theme.accentGlow}`, marginTop: "6px"
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

            <footer style={{ position: "sticky", bottom: 0, padding: "12px 16px max(16px, env(safe-area-inset-bottom))", backgroundColor: theme.sidebar, borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: "600px", display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
                  placeholder="대사나 행동을 입력하세요..."
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "20px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, outline: "none" }}
                />
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

      {/* ── 🖼️ 초상화 대형 뷰어 & 인라인 수정 팝업 ── */}
      {showPortraitModal && (() => {
        const target = suspects.find(s => s.id === activePortraitSuspectId) || suspects[0];
        if (!target) return null;

        return (
          <div
            onClick={() => {
              setIsEditingPortrait(false);
              setShowPortraitModal(false);
            }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
              padding: "16px",
              animation: "fadeIn 0.2s ease-out"
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              className="glass-card"
              style={{
                width: "100%",
                maxWidth: "380px",
                backgroundColor: theme.panel,
                border: `1.5px solid ${theme.border}`,
                borderRadius: "18px",
                padding: "20px",
                color: theme.text,
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
                maxHeight: "90vh",
                overflowY: "auto"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "900", color: theme.accent }}>
                    {target.name || "신원 미상의 인물"}
                  </h3>
                  <div style={{ fontSize: "0.74rem", color: theme.textMuted, marginTop: "2px" }}>
                    {target.job ? `${target.job} · ` : ""}{target.ageGender || "인적사항 미기재"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPortrait(false);
                    setShowPortraitModal(false);
                  }}
                  style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>

              {/* 1. 대형 초상화 뷰어 박스 */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: `1.5px solid ${theme.border}`,
                  backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.25)" : "#f0ece4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {target.portraitUrl ? (
                  <img src={target.portraitUrl} alt="용의자 대형 초상화" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ textAlign: "center", color: theme.textMuted, fontSize: "0.85rem", lineHeight: "1.6" }}>
                    <div style={{ fontSize: "2.4rem", marginBottom: "6px" }}>👤</div>
                    등록된 사진이 없습니다.
                  </div>
                )}
              </div>

              {/* 2. 하단 컨트롤러: 수정하기 버튼 or 업로드 폼 */}
              {!isEditingPortrait ? (
                <button
                  type="button"
                  onClick={() => setIsEditingPortrait(true)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: theme.panelAlt,
                    border: `1.5px solid ${theme.accent}`,
                    color: theme.accent,
                    borderRadius: "10px",
                    fontWeight: "800",
                    fontSize: "0.84rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <span>✏️</span>
                  <span>초상화 이미지 변경 / 업로드</span>
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: `1px dashed ${theme.border}`, paddingTop: "12px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "12px",
                      backgroundColor: theme.panelAlt,
                      border: `1.5px dashed ${theme.accent}`,
                      borderRadius: "10px",
                      textAlign: "center",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: "800",
                      color: theme.accent,
                      boxSizing: "border-box"
                    }}
                  >
                    <span>📁</span>
                    <span>컴퓨터 / 갤러리에서 파일 선택</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePortraitFileUpload}
                      style={{ display: "none" }}
                    />
                  </label>

                  <div style={{ textAlign: "center", fontSize: "0.7rem", color: theme.textMuted }}>
                    또는 이미지 웹 링크 URL 직접 입력
                  </div>

                  <input
                    type="text"
                    value={customPortraitInput}
                    onChange={e => setCustomPortraitInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleApplyPortraitUrl(); }}
                    placeholder="https://... 이미지 링크 주소"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "9px 12px",
                      backgroundColor: theme.inputBg,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      color: theme.text,
                      fontSize: "0.82rem",
                      outline: "none"
                    }}
                  />

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setIsEditingPortrait(false)}
                      style={{
                        flex: 1,
                        padding: "9px",
                        backgroundColor: theme.panelAlt,
                        border: `1px solid ${theme.border}`,
                        color: theme.textMuted,
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.78rem",
                        fontWeight: "700"
                      }}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyPortraitUrl}
                      style={{
                        flex: 2,
                        padding: "9px",
                        backgroundColor: theme.accent,
                        color: isDarkMode ? "#1a1817" : "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "800",
                        fontSize: "0.78rem"
                      }}
                    >
                      URL 적용하기 ➔
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── 📄 시나리오 텍스트 붙여넣기 모달 ── */}
      {showPasteModal && (
        <div
          onClick={() => setShowPasteModal(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: "520px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
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
              <button onClick={handleApplyPastedScenario} style={{ flex: 2, padding: "10px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", border: "none", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "800", cursor: "pointer" }}>서류철에 자동 배치 ➔</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
