"use client";

import { useState, useEffect, useRef } from "react";
import { THEME_PALETTES, GLASS_STYLE } from "@/lib/themes";

// 공통 SVG 아이콘 컴포넌트
const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconHeart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IconGhost = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>;
const IconFileText = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconBox = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconLock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconUnlock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>;
const IconChevronDown = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IconChevronUp = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const IconCamera = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;

export default function GamePlatform() {
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

  const [toast, setToast] = useState(null);
  const triggerToast = (title, message = "", icon = "✨") => {
    setToast({ title, message, icon });
    setTimeout(() => setToast(null), 2500);
  };

  const [activeTab, setActiveTab] = useState("studio");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [selectedMode, setSelectedMode] = useState("추리");
  const [playPreference, setPlayPreference] = useState("");

  const [scenarioTitle, setScenarioTitle] = useState("");
  const [victimName, setVictimName] = useState("");
  const [publicSynopsis, setPublicSynopsis] = useState("");
  const [openingScene, setOpeningScene] = useState("");

  const [suspects, setSuspects] = useState([
    { id: 1, name: "", ageGender: "", job: "", behavior: "", secret: "", portraitUrl: "" }
  ]);
  const [selectedSuspectId, setSelectedSuspectId] = useState(1);
  const [showPortraitModal, setShowPortraitModal] = useState(false);
  const [isEditingPortrait, setIsEditingPortrait] = useState(false);
  const [activePortraitSuspectId, setActivePortraitSuspectId] = useState(null);
  const [customPortraitInput, setCustomPortraitInput] = useState("");

  const [evidenceList, setEvidenceList] = useState([
    { id: 1, name: "", overview: "", contradiction: "", secret: "" }
  ]);

  const [culpritName, setCulpritName] = useState("");
  const [trickDetail, setTrickDetail] = useState("");
  const [hiddenTruth, setHiddenTruth] = useState("");

  // 🌟 토글 상태 관리를 객체/배열 기반으로 일원화
  const [openedSuspectSecretIds, setOpenedSuspectSecretIds] = useState([]);
  const [isEvidenceArchiveOpen, setIsEvidenceArchiveOpen] = useState(false);
  const [openedEvidenceSecretIds, setOpenedEvidenceSecretIds] = useState([]);
  const [isTruthEnvelopeOpen, setIsTruthEnvelopeOpen] = useState(false);

  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSuspect = () => {
    if (suspects.length >= 10) return triggerToast("인원 제한", "용의자는 최대 10명까지만 등록할 수 있습니다.", "⚠️");
    const nextId = Date.now();
    setSuspects([...suspects, { id: nextId, name: "", ageGender: "", job: "", behavior: "", secret: "", portraitUrl: "" }]);
    setSelectedSuspectId(nextId);
    triggerToast("인물 추가", "새로운 수사 카드가 추가되었습니다.", "📌");
  };

  const handleDeleteSuspect = (id) => {
    if (suspects.length <= 1) return triggerToast("삭제 불가", "최소 1명의 용의자 카드는 유지되어야 합니다.", "⚠️");
    const filtered = suspects.filter(s => s.id !== id);
    setSuspects(filtered);
    if (selectedSuspectId === id) setSelectedSuspectId(filtered[0]?.id);
    triggerToast("인물 삭제", "수사망에서 제외되었습니다.", "🗑️");
  };

  const handleUpdateSuspect = (id, field, value) => {
    setSuspects(suspects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handlePortraitFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !activePortraitSuspectId) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleUpdateSuspect(activePortraitSuspectId, "portraitUrl", ev.target.result);
      triggerToast("초상화 등록", "사진이 수사망에 고정되었습니다.", "📷");
      setIsEditingPortrait(false);
      setShowPortraitModal(false);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleApplyPortraitUrl = () => {
    if (!customPortraitInput.trim() || !activePortraitSuspectId) return;
    handleUpdateSuspect(activePortraitSuspectId, "portraitUrl", customPortraitInput.trim());
    triggerToast("초상화 적용", "이미지 링크가 적용되었습니다.", "✨");
    setCustomPortraitInput("");
    setIsEditingPortrait(false);
    setShowPortraitModal(false);
  };

  const handleApplyPastedScenario = () => {
    if (!pastedText.trim()) return;
    const extract = (regex) => (pastedText.match(regex) || [])[1]?.trim() || "";
    setScenarioTitle(extract(/(?:시나리오\s*제목|사건명|제목)\s*[:：]\s*([^\n\r]+)/i));
    setVictimName(extract(/(?:피해자|사망자|타깃|의뢰인)\s*[:：]\s*([^\n\r]+)/i));
    setPublicSynopsis(extract(/(?:\[공개\s*시놉시스\]|사건\s*개요\s*[:：]?)\s*([\s\S]*?)(?=\n\s*(?:\[서막\]|오프닝|#+|\[|$))/i));
    setOpeningScene(extract(/(?:\[서막\]|도입부\s*[:：]?|오프닝\s*[:：]?)\s*([\s\S]*?)(?=\n\s*(?:\[진상|진상\s*[:：]|#+|\[|$))/i));
    setHiddenTruth(extract(/(?:\[사건의\s*진상\]|진상\s*[:：]?)\s*([\s\S]*?)(?=\n\s*(?:###|\[|$))/i));
    setShowPasteModal(false);
    setPastedText("");
    triggerToast("파싱 완료", "작성된 서류철 양식에 자동 배치되었습니다.", "✨");
  };

  const handleStartGame = () => {
    if (!scenarioTitle.trim()) return triggerToast("사건명 미입력", "수사할 사건명을 먼저 입력해주세요.", "⚠️");
    setActiveSession({
      title: scenarioTitle, victim: victimName, synopsis: publicSynopsis, opening: openingScene,
      mode: selectedMode, suspects, evidenceList, culprit: culpritName, trick: trickDetail, truth: hiddenTruth
    });
    setMessages([{ role: "model", text: openingScene || `차가운 정적 속에 현장 테이프가 바람에 나부낍니다.\n\n사건 대상 [${victimName || "신원 미상"}]의 행적을 둘러싸고, 관계자들의 시선이 교차합니다.` }]);
    triggerToast("수사 개시", `《${scenarioTitle}》 사건 현장에 진입합니다.`, "🕵️");
  };

  const handleSendMessage = () => {
    if (!inputMsg.trim() || isLoading) return;
    setMessages([...messages, { role: "user", text: inputMsg.trim() }]);
    setInputMsg("");
    setIsLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "model", text: `“그 질문에 제가 무어라 답해야 할지 모르겠군요.”\n\n상대방은 굳게 입을 다뭅니다.` }]);
      setIsLoading(false);
    }, 800);
  };

  const toggleArrayItem = (arr, item, setArr) => {
    setArr(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  // 공통 Input 컴포넌트
  const InputField = ({ label, value, onChange, placeholder, isTextarea = false, rows = 3 }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
      {label && <label style={{ fontSize: "0.8rem", fontWeight: "700", color: theme.textMuted }}>{label}</label>}
      {isTextarea ? (
        <textarea
          rows={rows} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", resize: "vertical", outline: "none", transition: "border-color 0.2s", fontFamily: "inherit" }}
        />
      ) : (
        <input
          type="text" value={value} onChange={onChange} placeholder={placeholder}
          style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none", transition: "border-color 0.2s" }}
        />
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100dvh", width: "100vw", backgroundColor: theme.bg, color: theme.text, overflow: "hidden", position: "relative", fontFamily: "'Pretendard', sans-serif" }}>
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.accent}; }
        .focus-border:focus-within { border-color: ${theme.accent} !important; }
      `}</style>

      {/* ── 헤더 ── */}
      <header style={{ position: "absolute", top: 0, left: 0, right: 0, height: "60px", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, backgroundColor: isDarkMode ? "rgba(26, 24, 23, 0.85)" : "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(12px)", zIndex: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => setIsDrawerOpen(true)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.4rem", cursor: "pointer", padding: 0 }}>☰</button>
          <span style={{ fontWeight: "800", fontSize: "1rem", letterSpacing: "-0.3px" }}>{activeSession ? activeSession.title : "새로운 서사의 시작"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!activeSession && (
            <button onClick={() => setShowPasteModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.accent}`, borderRadius: "20px", color: theme.accent, fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", transition: "background-color 0.2s" }}>
              <IconFileText /> <span>불러오기</span>
            </button>
          )}
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}>{isDarkMode ? "☀️" : "🌙"}</button>
        </div>
      </header>

      {/* ── 메인 콘텐츠 ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "80px 20px 100px 20px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "860px", margin: "0 auto", width: "100%" }}>
        {!activeSession ? (
          <>
            {/* 1. 룰 시스템 선택 */}
            <section style={{ ...GLASS_STYLE, padding: "24px", backgroundColor: theme.panel, borderRadius: "20px", border: `1px solid ${theme.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: "800", marginBottom: "16px", color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: theme.accent }}>1.</span> 룰 시스템 선택
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "12px" }}>
                {[
                  { key: "추리", icon: <IconSearch />, title: "추리", desc: "단서를 모아 진상 파헤치기" },
                  { key: "연애", icon: <IconHeart />, title: "연애", desc: "감정선 중심의 감성 서사" },
                  { key: "괴담", icon: <IconGhost />, title: "괴담", desc: "이면을 밝히는 서스펜스" }
                ].map(m => {
                  const isSel = selectedMode === m.key;
                  return (
                    <div key={m.key} onClick={() => { setSelectedMode(m.key); triggerToast(`${m.title} 모드`, "선택되었습니다."); }} style={{ padding: "16px", borderRadius: "16px", cursor: "pointer", backgroundColor: isSel ? theme.panelAlt : "transparent", border: `2px solid ${isSel ? theme.accent : theme.border}`, display: "flex", alignItems: "center", gap: "14px", transition: "all 0.2s ease" }}>
                      <div style={{ color: isSel ? theme.accent : theme.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>{m.icon}</div>
                      <div>
                        <div style={{ fontWeight: "800", fontSize: "0.95rem", color: isSel ? theme.accent : theme.text }}>{m.title}</div>
                        <div style={{ fontSize: "0.75rem", color: theme.textMuted, marginTop: "2px" }}>{m.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 2. 장르 톤 태그 */}
            <section style={{ ...GLASS_STYLE, padding: "24px", backgroundColor: theme.panel, borderRadius: "20px", border: `1px solid ${theme.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: "800", marginBottom: "16px", color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}>
                 <span style={{ color: theme.accent }}>2.</span> 장르 톤 (서사 지향 태그)
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                {["#GL", "#BL", "#집착", "#혐관", "#쌍방구원", "#착각", "#오컬트"].map(tag => {
                  const isSelected = playPreference.includes(tag);
                  return (
                    <button key={tag} onClick={() => { const list = playPreference.split(/\s+/).filter(Boolean); setPlayPreference(isSelected ? list.filter(t => t !== tag).join(" ") : [...list, tag].join(" ")); }} style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: isSelected ? "800" : "600", backgroundColor: isSelected ? theme.accent : "transparent", color: isSelected ? "#fff" : theme.textMuted, border: `1px solid ${isSelected ? theme.accent : theme.border}`, cursor: "pointer", transition: "all 0.15s" }}>{tag}</button>
                  );
                })}
              </div>
              <InputField value={playPreference} onChange={e => setPlayPreference(e.target.value)} placeholder="직접 입력 (#밀실살인 #심리전)..." />
            </section>

            {/* ── 🕵️ 추리 모드 ── */}
            {selectedMode === "추리" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* A. 사건 개요서 */}
                <section style={{ ...GLASS_STYLE, padding: "24px", backgroundColor: theme.panel, borderRadius: "20px", border: `1px solid ${theme.border}` }}>
                   <h2 style={{ fontSize: "1.05rem", fontWeight: "800", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                     <IconFileText /> 사건 개요서
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "12px" }}>
                      <InputField label="사건명" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} placeholder="예: 심야 펜트하우스 살인사건" />
                      <InputField label="피해자/의뢰인" value={victimName} onChange={e => setVictimName(e.target.value)} placeholder="예: 한도진 대표" />
                    </div>
                    <InputField label="공개 시놉시스" isTextarea value={publicSynopsis} onChange={e => setPublicSynopsis(e.target.value)} placeholder="현장 상황 및 스포일러 없는 배경..." />
                    <InputField label="서막 (도입부)" isTextarea value={openingScene} onChange={e => setOpeningScene(e.target.value)} placeholder="이야기가 시작되는 첫 지문..." />
                  </div>
                </section>

                {/* B. 용의자 수사망 */}
                <section style={{ ...GLASS_STYLE, padding: "24px", backgroundColor: theme.panel, borderRadius: "20px", border: `1px solid ${theme.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "1.05rem", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                      <IconUsers /> 용의자 수사망 <span style={{ color: theme.accent, fontSize: "0.9rem" }}>({suspects.length})</span>
                    </h2>
                    <button onClick={handleAddSuspect} style={{ padding: "6px 16px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.accent}`, borderRadius: "20px", color: theme.accent, fontSize: "0.8rem", fontWeight: "800", cursor: "pointer" }}>＋ 추가</button>
                  </div>

                  {/* 핀 보드 */}
                  <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px", scrollbarWidth: "none" }}>
                    {suspects.map((s, idx) => {
                      const isSelected = selectedSuspectId === s.id;
                      return (
                        <div key={s.id} onClick={() => setSelectedSuspectId(s.id)} style={{ minWidth: "100px", padding: "12px", borderRadius: "14px", backgroundColor: isSelected ? theme.accent : theme.panelAlt, color: isSelected ? "#fff" : theme.text, border: `1px solid ${isSelected ? theme.accent : theme.border}`, cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: isDarkMode ? "#333" : "#e5e5e5", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                             {s.portraitUrl ? <img src={s.portraitUrl} style={{width:"100%", height:"100%", objectFit:"cover"}}/> : <IconUsers />}
                          </div>
                          <div style={{ fontSize: "0.85rem", fontWeight: "800", whiteSpace: "nowrap" }}>{s.name || `인물 ${idx + 1}`}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 선택된 인물 서류철 */}
                  {(() => {
                    const cur = suspects.find(s => s.id === selectedSuspectId) || suspects[0];
                    if (!cur) return null;
                    const isSecOpen = openedSuspectSecretIds.includes(cur.id);
                    return (
                      <div style={{ marginTop: "12px", padding: "20px", backgroundColor: theme.panelAlt, borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                          <span style={{ fontWeight: "800", color: theme.text }}>📝 {cur.name || "신원 미상"} 조서</span>
                          {suspects.length > 1 && <button onClick={() => handleDeleteSuspect(cur.id)} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", fontSize: "0.8rem", display:"flex", alignItems:"center", gap:"4px" }}><IconTrash/> 삭제</button>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "12px" }}>
                            <InputField label="이름" value={cur.name} onChange={e => handleUpdateSuspect(cur.id, "name", e.target.value)} placeholder="예: 강이솔" />
                            <InputField label="나이/성별" value={cur.ageGender} onChange={e => handleUpdateSuspect(cur.id, "ageGender", e.target.value)} placeholder="예: 26세 여성" />
                            <InputField label="직업" value={cur.job} onChange={e => handleUpdateSuspect(cur.id, "job", e.target.value)} placeholder="예: 연구원" />
                          </div>
                          <InputField label="행적 및 알리바이" isTextarea rows={2} value={cur.behavior} onChange={e => handleUpdateSuspect(cur.id, "behavior", e.target.value)} placeholder="사건 당일의 행적과 이해관계..." />
                          
                          {/* 비밀 토글 */}
                          <div style={{ marginTop: "8px" }}>
                            <button onClick={() => toggleArrayItem(openedSuspectSecretIds, cur.id, setOpenedSuspectSecretIds)} style={{ width: "100%", padding: "12px", backgroundColor: isSecOpen ? "rgba(239, 68, 68, 0.08)" : theme.inputBg, border: `1px solid ${isSecOpen ? theme.danger : theme.border}`, borderRadius: isSecOpen ? "10px 10px 0 0" : "10px", color: isSecOpen ? theme.danger : theme.text, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700", transition: "all 0.2s" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"6px"}}>{isSecOpen ? <IconUnlock/> : <IconLock/>} <span>{isSecOpen ? "비밀 닫기" : "숨겨진 진실 / 모순 열람 (스포일러)"}</span></div>
                              {isSecOpen ? <IconChevronUp/> : <IconChevronDown/>}
                            </button>
                            {isSecOpen && (
                              <div style={{ padding: "16px", border: `1px solid ${theme.danger}`, borderTop: "none", borderRadius: "0 0 10px 10px", backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "#fff" }}>
                                <InputField value={cur.secret} onChange={e => handleUpdateSuspect(cur.id, "secret", e.target.value)} placeholder="거짓말이나 감추고 있는 약점..." />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </section>

                {/* C. 단서 보관소 */}
                <section style={{ ...GLASS_STYLE, padding: "24px", backgroundColor: theme.panel, borderRadius: "20px", border: `1px solid ${theme.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                     <h2 style={{ fontSize: "1.05rem", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                      <IconBox /> 물증 보관소 <span style={{ color: theme.accent, fontSize: "0.9rem" }}>({evidenceList.length})</span>
                    </h2>
                    <button onClick={() => { setEvidenceList([...evidenceList, { id: Date.now(), name: "", overview: "", contradiction: "", secret: "" }]); triggerToast("추가", "단서 슬롯 추가됨"); }} style={{ padding: "6px 16px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.accent}`, borderRadius: "20px", color: theme.accent, fontSize: "0.8rem", fontWeight: "800", cursor: "pointer" }}>＋ 추가</button>
                  </div>

                  <button onClick={() => setIsEvidenceArchiveOpen(!isEvidenceArchiveOpen)} style={{ width: "100%", padding: "14px", backgroundColor: isEvidenceArchiveOpen ? "rgba(239, 68, 68, 0.05)" : theme.panelAlt, border: `1px solid ${isEvidenceArchiveOpen ? theme.danger : theme.border}`, borderRadius: "12px", color: isEvidenceArchiveOpen ? theme.danger : theme.text, fontSize: "0.85rem", fontWeight: "800", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", cursor: "pointer", transition:"all 0.2s" }}>
                    {isEvidenceArchiveOpen ? <IconUnlock/> : <IconLock/>} {isEvidenceArchiveOpen ? "보관소 닫기" : "전체 물증 열람하기 (스포일러)"}
                  </button>

                  {isEvidenceArchiveOpen && (
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                      {evidenceList.map((item, idx) => {
                        const isSecOpen = openedEvidenceSecretIds.includes(item.id);
                        return (
                          <div key={item.id} style={{ backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <InputField value={item.name} onChange={e => setEvidenceList(evidenceList.map(ev => ev.id === item.id ? { ...ev, name: e.target.value } : ev))} placeholder={`물증 ${idx + 1} 명칭`} />
                              {evidenceList.length > 1 && <button onClick={() => setEvidenceList(evidenceList.filter(ev => ev.id !== item.id))} style={{ background:"none", border:"none", color:theme.danger, cursor:"pointer" }}><IconTrash/></button>}
                            </div>
                            <InputField value={item.overview} onChange={e => setEvidenceList(evidenceList.map(ev => ev.id === item.id ? { ...ev, overview: e.target.value } : ev))} placeholder="발견 위치 및 표면적 정보" />
                            
                            <div style={{ marginTop: "4px" }}>
                              <button onClick={() => toggleArrayItem(openedEvidenceSecretIds, item.id, setOpenedEvidenceSecretIds)} style={{ width: "100%", padding: "10px", backgroundColor: isSecOpen ? "rgba(239, 68, 68, 0.08)" : theme.inputBg, border: `1px solid ${isSecOpen ? theme.danger : theme.border}`, borderRadius: isSecOpen ? "8px 8px 0 0" : "8px", color: isSecOpen ? theme.danger : theme.text, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}>
                                <span>{isSecOpen ? "감식 결과 닫기" : "정밀 감식 진상 열람"}</span>
                                {isSecOpen ? <IconChevronUp/> : <IconChevronDown/>}
                              </button>
                              {isSecOpen && (
                                <div style={{ padding: "12px", border: `1px solid ${theme.danger}`, borderTop: "none", borderRadius: "0 0 8px 8px", backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "#fff", display:"flex", flexDirection:"column", gap:"8px" }}>
                                  <InputField value={item.contradiction} onChange={e => setEvidenceList(evidenceList.map(ev => ev.id === item.id ? { ...ev, contradiction: e.target.value } : ev))} placeholder="결정적 모순점..." />
                                  <InputField value={item.secret} onChange={e => setEvidenceList(evidenceList.map(ev => ev.id === item.id ? { ...ev, secret: e.target.value } : ev))} placeholder="숨겨진 이면..." />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* D. 진상 기밀 봉투 */}
                <section style={{ ...GLASS_STYLE, padding: "24px", backgroundColor: theme.panel, borderRadius: "20px", border: `2px solid ${theme.accent}` }}>
                  <h2 style={{ fontSize: "1.05rem", fontWeight: "900", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px", color: theme.accent }}>
                    ✉️ 사건 진상 기밀 봉투
                  </h2>
                  <button onClick={() => setIsTruthEnvelopeOpen(!isTruthEnvelopeOpen)} style={{ width: "100%", padding: "14px", backgroundColor: isTruthEnvelopeOpen ? "rgba(239, 68, 68, 0.05)" : theme.panelAlt, border: `1px solid ${isTruthEnvelopeOpen ? theme.danger : theme.border}`, borderRadius: "12px", color: isTruthEnvelopeOpen ? theme.danger : theme.text, fontSize: "0.85rem", fontWeight: "800", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", cursor: "pointer", transition:"all 0.2s" }}>
                    {isTruthEnvelopeOpen ? <IconUnlock/> : <IconLock/>} {isTruthEnvelopeOpen ? "봉인하기" : "진상 및 트릭 열람 (스포일러)"}
                  </button>

                  {isTruthEnvelopeOpen && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: "12px" }}>
                        <InputField label="진범 지목" value={culpritName} onChange={e => setCulpritName(e.target.value)} placeholder="예: 강이솔" />
                        <InputField label="핵심 트릭" value={trickDetail} onChange={e => setTrickDetail(e.target.value)} placeholder="예: 타이머를 이용한 밀실 조작" />
                      </div>
                      <InputField label="배후 내막 및 엔딩 분기" isTextarea rows={4} value={hiddenTruth} onChange={e => setHiddenTruth(e.target.value)} placeholder="사건의 전말..." />
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* 시작 버튼 */}
            <button onClick={handleStartGame} style={{ width: "100%", padding: "18px", borderRadius: "16px", backgroundColor: theme.text, color: theme.bg, border: "none", fontWeight: "900", fontSize: "1.05rem", cursor: "pointer", marginTop: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
              이야기 시작하기 ➔
            </button>
          </main>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems:"center", justifyContent:"center", color: theme.textMuted }}>
            인게임 화면 렌더링 영역
          </div>
        )}

        {/* ── 하단 내비게이션 바 ── */}
        {!activeSession && (
          <nav style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", width: "calc(100% - 48px)", maxWidth: "400px", height: "64px", backgroundColor: isDarkMode ? "rgba(30, 30, 30, 0.85)" : "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(20px)", border: `1px solid ${theme.border}`, borderRadius: "32px", display: "flex", padding: "0 8px", boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)", zIndex: 50 }}>
            {[
              { key: "lounge", icon: "🧭", label: "탐색" },
              { key: "library", icon: "📚", label: "서재" },
              { key: "studio", icon: "✍️", label: "창작" },
              { key: "profile", icon: "👤", label: "내정보" }
            ].map(tab => {
              const isSelected = activeTab === tab.key;
              return (
                <div key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: isSelected ? theme.accent : theme.textMuted, position: "relative" }}>
                  <span style={{ fontSize: "1.2rem", transform: isSelected ? "translateY(-2px)" : "none", transition: "transform 0.2s" }}>{tab.icon}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: "700", opacity: isSelected ? 1 : 0.7, marginTop:"2px" }}>{tab.label}</span>
                  {isSelected && <div style={{ position: "absolute", bottom: "4px", width: "16px", height: "3px", borderRadius: "2px", backgroundColor: theme.accent }} />}
                </div>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
