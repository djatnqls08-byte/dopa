"use client";
 
import { useState, useEffect } from "react";
import SecretBoard from "@/components/SecretBoard";
import CharacterSheet from "@/components/CharacterSheet";
// 🌟 ArrowUp 중복 제거 완료!

import { 
  Search, Heart, Flame, LayoutGrid, LibraryBig, PenTool, UserRound, 
  Menu, Moon, Sun, Save, FileUp, HelpCircle, X, ChevronDown, ChevronUp, Image as ImageIcon,
  ClipboardList, Pin, FileSearch, Mailbox, Play,
  FolderOpen, Lock, Settings, Database, ClipboardPaste, LogOut,
  ArrowUp, Smartphone, BookOpen, Dices, ChevronLeft, ChevronRight
} from "lucide-react";

const THEME_PALETTES = {
  cloud: {
    light: { bg: "#f5f0eb", sidebar: "#ebe5de", panel: "#ffffff", panelAlt: "#f0ece4", border: "#ded7cb", borderHighlight: "#c8bca7", text: "#292524", textMuted: "#78716c", accent: "#a39274", accentGlow: "rgba(163, 146, 116, 0.4)", inputBg: "#f9f6f3", danger: "#dc2626", warning: "#d97706", success: "#16a34a", polaroidBg: "#f5f5f4", polaroidText: "#1c1917" },
    dark: { bg: "#1a1817", sidebar: "#242120", panel: "#2b2826", panelAlt: "#332f2c", border: "#3d3834", borderHighlight: "#4f4944", text: "#e8e3dc", textMuted: "#a8a29e", accent: "#c2b4a3", accentGlow: "rgba(194, 180, 163, 0.3)", inputBg: "#1f1d1b", danger: "#ef4444", warning: "#f59e0b", success: "#22c55e", polaroidBg: "#292524", polaroidText: "#e7e5e4" }
  }
};
const GLASS_STYLE = { backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" };

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
      textarea::-webkit-scrollbar { width: 4px; }
      textarea::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.4); border-radius: 4px; }
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
  const [pcName, setPcName] = useState("");
  const [pcAgeGender, setPcAgeGender] = useState("");
  const [pcJob, setPcJob] = useState("");
  const [pcBackground, setPcBackground] = useState("");
  const [pcPortraitUrl, setPcPortraitUrl] = useState(""); 
  const [pcSecret, setPcSecret] = useState(""); // 🌟 주인공 비밀 내용 저장
  const [showPcSecret, setShowPcSecret] = useState(false); // 🌟 주인공 비밀 아코디언 스위치

  const [scenarioTitle, setScenarioTitle] = useState("");
  const [victimName, setVictimName] = useState("");
  const [publicSynopsis, setPublicSynopsis] = useState("");
  const [openingScene, setOpeningScene] = useState("");

  const [suspects, setSuspects] = useState([
    { id: 1, name: "", ageGender: "", job: "", behavior: "", secret: "", portraitUrl: "", showSecret: false }
  ]);
  const [selectedSuspectId, setSelectedSuspectId] = useState(1);
  
  const [showPortraitModal, setShowPortraitModal] = useState(false);
  const [activePortraitSuspectId, setActivePortraitSuspectId] = useState(null);

  const [evidenceList, setEvidenceList] = useState([
    { id: 1, name: "", overview: "", contradiction: "", secret: "", showSecret: false }
  ]);
  const [showEvidence, setShowEvidence] = useState(false);
  const [culpritName, setCulpritName] = useState("");
  const [trickDetail, setTrickDetail] = useState("");
  const [hiddenTruth, setHiddenTruth] = useState("");
  const [showHiddenTruth, setShowHiddenTruth] = useState(false);
  // 🌟 연애 모드 전용 데이터 상태
  const [cgList, setCgList] = useState([
    { id: 1, title: "", condition: "", imageUrl: "", showDetails: false }
  ]);
  const [routeList, setRouteList] = useState([
    { id: 1, routeName: "", targetId: "", affectionChange: "+10", requiredCG: "" }
  ]);

  const [showCgGallery, setShowCgGallery] = useState(false); // CG 갤러리 접기/펴기
  const [showRouteList, setShowRouteList] = useState(false); // 공략 루트 접기/펴기
  const [showPhoneDetail, setShowPhoneDetail] = useState(false); // 📱 핸드폰 상세 프로필 화면 전환용

  // ── [7. 인게임 UI 토글 상태 관리 (누락된 변수 추가)] ──
  const [isPhoneDrawerOpen, setIsPhoneDrawerOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showEvidenceBoard, setShowEvidenceBoard] = useState(false);
  const [isTabletopOpen, setIsTabletopOpen] = useState(false);
  const [activePhoneContactId, setActivePhoneContactId] = useState(null);

  // ── [9. 인게임 진행 상태 관리] ──
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // ── [8. 동적 조작 함수들] ──
  const handleAddSuspect = () => {
    if (suspects.length >= 15) {
      triggerToast("인원 제한", "용의자는 최대 15명까지만 등록할 수 있습니다.", "⚠️");
      return;
    }
    const nextId = Date.now();
    setSuspects([...suspects, { id: nextId, name: "", ageGender: "", job: "", behavior: "", secret: "", portraitUrl: "", showSecret: false }]);
    setSelectedSuspectId(nextId);
  };

  const handleDeleteSuspect = (e, id) => {
    e.stopPropagation();
    if (suspects.length <= 1) {
      triggerToast("삭제 불가", "최소 1명의 인물 카드는 유지되어야 합니다.", "⚠️");
      return;
    }
    const filtered = suspects.filter(s => s.id !== id);
    setSuspects(filtered);
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

 // 🌟 AI 백엔드와 통신하는 스마트 파서 엔진 (연애 모드 CG, 루트 연동 완료!)
  const handleApplyPastedScenario = async () => {
    if (!pastedText.trim()) return;

    triggerToast("파싱 중...", "AI가 서류를 분석하고 있습니다. 잠시만 기다려주세요.", "⏳");

    try {
      const response = await fetch("/api/parse-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: pastedText,
          ruleMode: selectedMode,
          pcName: pcName || "주인공",
          kpcName: "파트너"
        })
      });

      if (!response.ok) {
        throw new Error("서버 에러가 발생했습니다.");
      }

      const data = await response.json();

      // 1. 기본 정보 맵핑
      if (data.scenarioTitle) setScenarioTitle(data.scenarioTitle);
      if (data.publicSynopsis) setPublicSynopsis(data.publicSynopsis);
      if (data.openingScene) setOpeningScene(data.openingScene);
      if (data.hiddenTruth) setHiddenTruth(data.hiddenTruth);

      // 2. 용의자/공략대상(NPC) 리스트 자동 생성
      let generatedSuspects = [];
      if (data.npcs && data.npcs.length > 0) {
        generatedSuspects = data.npcs.map((npc, idx) => ({
          id: Date.now() + idx,
          name: npc.name || "",
          job: npc.job || "",
          behavior: npc.detail || "",
          secret: npc.secret || "",
          ageGender: "",
          portraitUrl: "",
          showSecret: false
        }));
        setSuspects(generatedSuspects);
      }

      // 3. 단서(Handouts) 리스트 자동 생성
      if (data.handouts && data.handouts.length > 0) {
        const newEvidence = data.handouts.map((h, idx) => ({
          id: Date.now() + idx + 1000,
          name: h.title || "",
          overview: h.overview || "",
          secret: h.secret || "",
          contradiction: "",
          showSecret: false
        }));
        setEvidenceList(newEvidence);
      }

      // 🌟 4. [연애 모드 추가] 이벤트 CG 갤러리 맵핑
      if (data.cgList && data.cgList.length > 0) {
        const newCgs = data.cgList.map((cg, idx) => ({
          id: Date.now() + idx + 2000,
          title: cg.title || "",
          condition: cg.condition || "",
          imageUrl: "",
          showDetails: false
        }));
        setCgList(newCgs);
      }

      // 🌟 5. [연애 모드 추가] 분기점/루트 맵핑
      if (data.routeList && data.routeList.length > 0) {
        const newRoutes = data.routeList.map((rt, idx) => {
          // AI가 뽑아준 targetName과 일치하는 NPC의 ID를 찾아 연결해줍니다.
          const matchedNpc = generatedSuspects.find(s => s.name === rt.targetName);
          return {
            id: Date.now() + idx + 3000,
            routeName: rt.routeName || "",
            targetId: matchedNpc ? matchedNpc.id : "",
            affectionChange: rt.affectionChange || "+10",
            requiredCG: ""
          };
        });
        setRouteList(newRoutes);
      }

      setShowPasteModal(false);
      setPastedText("");
      triggerToast("파싱 완료!", "AI가 사건 서류철 배치를 완료했습니다.", "✨");

    } catch (error) {
      console.error(error);
      triggerToast("파싱 실패", "양식을 분석하지 못했습니다. 백엔드 연결을 확인해 주세요.", "⚠️");
    }
  };

  // ── [10. 코어 엔진: 세션 시작 및 통신] ──
  const startNewSession = async () => {
    if (!scenarioTitle.trim()) {
      triggerToast("사건명 입력 필요", "이야기를 시작하려면 사건명을 입력해주세요.", "⚠️");
      return;
    }

    const pName = pcName.trim() || "주인공";
    const initialSheet = {
      name: pName,
      job: pcJob || "조사원",
      ageGender: pcAgeGender || "",
      background: pcBackground || "",
      portrait: pcPortraitUrl || "",
      hp: 100, 
      maxHp: 100,
      npcs: suspects.map(s => ({ ...s, secretRevealed: false })), 
      handouts: evidenceList.map(e => ({ ...e, revealed: false })), 
      fatigue: 0 
    };

    const newId = Date.now();
    const newSession = {
      id: newId,
      title: scenarioTitle,
      ruleMode: selectedMode === "추리" ? "freeform" : selectedMode === "연애" ? "dating" : "insane",
      preference: playPreference.trim(),
      scenarioText: `[시나리오 제목: ${scenarioTitle}]\n\n[공개 시놉시스]\n${publicSynopsis}\n\n[초기 배경/서막]\n${openingScene}\n\n[키퍼 전용 기밀/진상]\n${hiddenTruth}`,
      sheet: initialSheet,
      messages: [], 
      suggestedActions: [] 
    };

    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setIsLoading(true);

    const openingPrompt = `[세션 시작: 추리/수사 모드 사전 교류 서막 요청]
시나리오의 [초기 배경/서막]에 참혹한 사건이나 본격적인 갈등이 적혀 있더라도, 1턴부터 바로 사건을 터뜨리지 마십시오.
대신 사건이 발생하기 전, 인물들이 한 공간에 모여 일상적인 대화를 나누거나 묘한 긴장감이 흐르는 '폭풍전야'의 시점(명탐정 코난, 소년탐정 김전일의 에피소드 초반부처럼)으로 서막을 시작하십시오.

[🚨 도입부 연출 수칙]
1. [사건 발생 전 상황 조성]:
- 본격적인 사건이 터지기 전, 인물들의 성격과 관계성을 엿볼 수 있는 상황을 4~5문장으로 서술하십시오.
2. [인물과의 첫 대면 기회 제공]:
- 주인공 '${pName}'이 자리에 합류하여 주변 용의자 중 한 명과 가볍게 눈인사를 나누거나 첫마디를 건넬 수 있는 타이밍에서 지문을 멈추십시오.
3. [자연스러운 대화 유도 선택지]:
<!-- SUGGESTIONS: ["가까이 있는 인물에게 다가가 가볍게 인사를 건넨다", "자리에 모인 인물들의 낯빛과 기류를 살핀다", "조용히 주변을 둘러보며 자리를 잡는다"] -->`;

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [{ role: "user", text: openingPrompt }],
          scenarioText: newSession.scenarioText,
          playerSheet: initialSheet,
          ruleMode: newSession.ruleMode,
          playPreference: playPreference
        })
      });

      if (!res.ok) throw new Error("서버 응답 오류");
      const data = await res.json();
      
      let cleanText = data.text || "";
      let suggActions = [];
      const suggMatch = cleanText.match(/<!--\s*SUGGESTIONS:\s*(\[[\s\S]*?\])\s*-{1,3}>/i);
      if (suggMatch) {
        try { suggActions = JSON.parse(suggMatch[1]); } catch(e) {}
        cleanText = cleanText.replace(suggMatch[0], "").trim();
      }

      setSessions(prev => prev.map(s => s.id === newId ? {
        ...s,
        messages: [{ role: "model", text: cleanText }],
        suggestedActions: suggActions
      } : s));

    } catch (err) {
      if (err.name === "AbortError") return;
      triggerToast("시작 오류", "서막을 불러오는 중 문제가 발생했습니다.", "⚠️");
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const executeMessage = async (textToSend) => {
    if (!textToSend.trim() || !activeSession) return;

    const updatedMessages = [
      ...(activeSession.messages || []),
      { role: "user", text: textToSend }
    ];

    setSessions(prev => prev.map(s => s.id === activeSessionId ? { 
      ...s, 
      messages: updatedMessages,
      suggestedActions: [] 
    } : s));
    
    setIsLoading(true);
    setInputMsg("");

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const messagesForApi = updatedMessages.slice(-20).map(m => ({ role: m.role, text: m.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: messagesForApi,
          scenarioText: activeSession.scenarioText,
          playerSheet: activeSession.sheet,
          ruleMode: activeSession.ruleMode,
          playPreference: activeSession.preference
        })
      });

      if (!res.ok) throw new Error("서버 응답 오류");
      const data = await res.json();
      
      let cleanText = data.text || "";
      let suggActions = [];
      const suggMatch = cleanText.match(/<!--\s*SUGGESTIONS:\s*(\[[\s\S]*?\])\s*-{1,3}>/i);
      if (suggMatch) {
        try { suggActions = JSON.parse(suggMatch[1]); } catch(e) {}
        cleanText = cleanText.replace(suggMatch[0], "").trim();
      }

      setSessions(prev => prev.map(s => s.id === activeSessionId ? {
        ...s,
        messages: [...updatedMessages, { role: "model", text: cleanText }],
        suggestedActions: suggActions
      } : s));

    } catch (err) {
      if (err.name === "AbortError") return;
      triggerToast("통신 오류", "메시지 전송 중 오류가 발생했습니다.", "⚠️");
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleSendMessage = () => {
    if (!inputMsg.trim() || isLoading) return;
    executeMessage(inputMsg);
  };
  
  return (
    <div style={{ display: "flex", height: "100dvh", width: "100vw", backgroundColor: theme.bg, color: theme.text, overflow: "hidden", position: "relative" }}>
      
      {toast && (
        <div onClick={() => setToast(null)} style={{ ...GLASS_STYLE, position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 99999, backgroundColor: isDarkMode ? "rgba(35, 30, 28, 0.96)" : "rgba(255, 255, 255, 0.96)", border: `1.5px solid ${theme.accent}`, color: theme.text, padding: "10px 18px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", cursor: "pointer", animation: "fadeIn 0.2s ease-out" }}>
          <span style={{ fontSize: "1.15rem" }}>{toast.icon}</span>
          <span style={{ fontSize: "0.84rem", fontWeight: "800", color: theme.accent }}>{toast.title}</span>
          {toast.message && <span style={{ fontSize: "0.76rem", opacity: 0.85 }}>{toast.message}</span>}
        </div>
      )}

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
              onClick={() => { setActiveSessionId(null); setIsDrawerOpen(false); }} 
              style={{ 
                flex: 1, padding: "12px", backgroundColor: theme.danger || "#ef4444", 
                border: "none", borderRadius: "8px", color: "#fff", fontSize: "0.85rem", 
                fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" 
              }}
            >
              <LogOut size={18} strokeWidth={2.5} /> 로비로 나가기
            </button>
          ) : (
            <>
              <button onClick={() => triggerToast("환경 설정", "준비 중입니다.", <Settings size={18} color={theme.accent} />)} style={{ flex: 1, padding: "10px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.78rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
  <Settings size={16} strokeWidth={2.5} /> 설정
</button>
<button onClick={() => triggerToast("데이터 관리", "준비 중입니다.", <Database size={18} color={theme.accent} />)} style={{ flex: 1, padding: "10px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.78rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
  <Database size={16} strokeWidth={2.5} /> 데이터
</button>
            </>
          )}
        </div>
      </aside>

      {/* ── 메인 콘텐츠 뷰 ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        
        {/* 상단 툴바 헤더 */}
        <header style={{ height: "54px", padding: isMobile ? "0 10px" : "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.sidebar, flexShrink: 0, zIndex: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "6px" : "10px", flexShrink: 0 }}>
            <button onClick={() => setIsDrawerOpen(true)} style={{ background: "none", border: "none", color: theme.text, cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
              <Menu size={22} strokeWidth={1.5} />
            </button>
            
            {activeSession && (
              <span style={{ fontWeight: "800", fontSize: "0.85rem", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
                {activeSession.title}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            
            {!activeSession && (
              <>
                <button onClick={() => setShowPasteModal(true)} title="시나리오 불러오기" style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", color: theme.text, display: "flex", alignItems: "center" }}>
                  <FileUp size={20} strokeWidth={1.5} />
                </button>
                <button onClick={() => triggerToast("세팅 저장", "현재 작성 중인 서류가 로컬에 저장되었습니다.", <Save size={20} color={theme.accent} strokeWidth={1.5} />)} title="세팅 저장" style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", color: theme.text, display: "flex", alignItems: "center" }}>
                  <Save size={20} strokeWidth={1.5} color={theme.text} />
                </button>
              </>
            )}
            
            {activeSession && (
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                
                {(activeSession.ruleMode?.startsWith("dating") || activeSession.ruleMode?.includes("free")) && (() => {
                  const phoneChats = activeSession.sheet?.phoneChats || {};
                  let unreadCount = 0;
                  Object.values(phoneChats).forEach(msgs => { unreadCount += (msgs || []).filter(m => m.unread).length; });
                  
                  return (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSheetOpen(false);
                        setShowEvidenceBoard(false);
                        setActivePhoneContactId(null);
                        setIsPhoneDrawerOpen(!isPhoneDrawerOpen);
                      }}
                      title="스마트폰 메신저"
                      style={{ position: "relative", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: isPhoneDrawerOpen ? theme.panelAlt : "transparent", border: `1px solid ${isPhoneDrawerOpen ? theme.accent : "transparent"}`, borderRadius: "10px", cursor: "pointer", color: isPhoneDrawerOpen ? theme.accent : theme.text, transition: "all 0.2s" }}
                    >
                      <Smartphone size={20} strokeWidth={1.5} />
                      {unreadCount > 0 && (
                        <span style={{ position: "absolute", top: "-2px", right: "-2px", backgroundColor: theme.danger, color: "#fff", borderRadius: "10px", minWidth: "16px", height: "16px", fontSize: "0.6rem", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })()}

                {activeSession.ruleMode === "freeform" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPhoneDrawerOpen(false);
                      setIsSheetOpen(false);
                      setShowEvidenceBoard(true); 
                    }}
                    title="수사 본부 증거보드"
                    style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${showEvidenceBoard ? theme.accent : "transparent"}`, borderRadius: "10px", cursor: "pointer", color: theme.danger, transition: "all 0.2s" }}
                  >
                    <Pin size={20} strokeWidth={1.5} style={{ transform: "rotate(45deg)" }} />
                  </button>
                )}

                <button 
                  type="button"
                  onClick={() => {
                    const lastUserMsgIndex = (activeSession.messages || []).map(x => x.role).lastIndexOf("user");
                    if(lastUserMsgIndex !== -1) {
                        const targetMsg = activeSession.messages[lastUserMsgIndex];
                        setInputMsg(targetMsg.text);
                        setSessions(prev => prev.map(s => {
                            if (s.id !== activeSessionId) return s;
                            const newMsgs = s.messages.slice(0, lastUserMsgIndex);
                            return {
                                ...s,
                                sheet: targetMsg.prevSheet ? targetMsg.prevSheet : s.sheet,
                                messages: newMsgs,
                                suggestedActions: [],
                                pendingCheck: null
                            };
                        }));
                        triggerToast("롤백 완료", "마지막 대화가 취소되었습니다.", "⎌");
                    } else {
                        triggerToast("알림", "되돌릴 수 있는 유저의 대화가 없습니다.", "💡");
                    }
                  }}
                  title="마지막 대화 취소"
                  style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: theme.textMuted }}
                >
                   <span style={{fontSize: "1.2rem", fontWeight: "bold"}}>⎌</span>
                </button>

                {activeSession.ruleMode === "insane" && (
                  <button type="button" onClick={() => setIsTabletopOpen(!isTabletopOpen)} title="테이블탑 핸드아웃" style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: isTabletopOpen ? "rgba(214, 56, 87, 0.12)" : "transparent", border: `1px solid ${isTabletopOpen ? theme.danger : "transparent"}`, borderRadius: "10px", cursor: "pointer", color: isTabletopOpen ? theme.danger : theme.text }}>
                    <BookOpen size={20} strokeWidth={1.5} />
                  </button>
                )}
                {(activeSession.ruleMode === "coc" || activeSession.ruleMode === "insane") && (
                  <button type="button" onClick={() => rollDiceDirectly()} title="주사위 굴리기" style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid transparent`, borderRadius: "10px", cursor: "pointer", color: theme.warning }}>
                    <Dices size={20} strokeWidth={1.5} />
                  </button>
                )}

                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPhoneDrawerOpen(false);
                    setShowEvidenceBoard(false);
                    setIsSheetOpen(!isSheetOpen);
                  }} 
                  title="캐릭터 시트" 
                  style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: isSheetOpen ? theme.panelAlt : "transparent", border: `1px solid ${isSheetOpen ? theme.accent : "transparent"}`, borderRadius: "10px", color: isSheetOpen ? theme.accent : theme.text, cursor: "pointer", transition: "all 0.2s" }}
                >
                  {activeSession.ruleMode?.startsWith("dating") ? <UserRound size={20} strokeWidth={1.5} /> : <ClipboardList size={20} strokeWidth={1.5} />}
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", color: theme.text, display: "flex", alignItems: "center" }}
            >
              {isDarkMode ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </header>

        {!activeSession ? (
          <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 14px 140px 14px" : "20px 16px 160px 16px", maxWidth: "860px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: isMobile ? "14px" : "18px", boxSizing: "border-box" }}>
              
            <section style={{ ...GLASS_STYLE, padding: isMobile ? "14px" : "18px", backgroundColor: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "12px", color: theme.text }}>
                1. 룰 시스템 선택
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {[
                  { key: "추리", icon: <Search size={32} strokeWidth={2.5} />, title: "추리", desc: "진상을 파헤치는 수사" },
                  { key: "연애", icon: <Heart size={32} strokeWidth={2.5} />, title: "연애", desc: "선택지와 감정선 중심의 서사" },
                  { key: "괴담", icon: <Flame size={32} strokeWidth={2.5} />, title: "괴담", desc: "이면을 밝히는 호러" }
                ].map(m => {
                  const isSel = selectedMode === m.key;
                  return (
                    <div
                      key={m.key}
                      onClick={() => setSelectedMode(m.key)}
                      style={{
                        position: "relative",
                        padding: isMobile ? "20px 8px" : "24px 12px",
                        borderRadius: "14px", cursor: "pointer",
                        backgroundColor: isSel ? theme.panelAlt : "transparent",
                        border: `1.5px solid ${isSel ? theme.accent : theme.border}`,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px",
                        boxShadow: isSel ? `0 6px 20px rgba(0,0,0,0.12)` : "none",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); setRuleHelpModal(m); }}
                        title={`${m.title} 규칙 설명 보기`}
                        style={{
                          position: "absolute", top: "12px", right: "12px",
                          background: "none", border: "none", padding: 0,
                          color: theme.textMuted,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                          opacity: 0.7, transition: "opacity 0.2s"
                        }}
                      >
                        <HelpCircle size={18} strokeWidth={2} />
                      </button>

                      <div style={{ color: isSel ? theme.accent : theme.text, transition: "color 0.2s ease" }}>
                        {m.icon}
                      </div>
                      
                      <div style={{ textAlign: "center", width: "100%" }}>
                        <div style={{ fontWeight: "900", fontSize: "0.95rem", color: isSel ? theme.accent : theme.text }}>{m.title}</div>
                        {!isMobile && (
                          <div style={{ fontSize: "0.72rem", color: theme.textMuted, marginTop: "6px", wordBreak: "keep-all" }}>
                            {m.desc}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

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

            {selectedMode === "추리" && (
              <>
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "16px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <UserRound size={22} strokeWidth={2} color={theme.accent} />
                    <span style={{ fontWeight: "900", fontSize: "0.95rem", color: theme.text }}>주인공 (수사관) 프로필</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "16px", width: "100%" }}>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePortraitSuspectId("pc");
                        setShowPortraitModal(true);
                      }}
                      title="사진 등록 및 확인 (클릭)"
                      style={{
                        flex: isMobile ? "none" : "0 0 135px",
                        width: isMobile ? "100%" : "auto",
                        maxWidth: isMobile ? "180px" : "none",
                        margin: isMobile ? "0 auto" : "0",
                        backgroundColor: theme.polaroidBg || "#ded7cb", borderRadius: "6px", padding: "8px 8px 12px 8px", color: theme.polaroidText || "#292524",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center", position: "relative",
                        cursor: "pointer"
                      }}
                    >
                      <div
                        style={{
                          width: "100%", aspectRatio: "1/1", backgroundColor: isDarkMode ? "#332d2a" : "#eae4db", borderRadius: "3px", overflow: "hidden",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative"
                        }}
                      >
                        {pcPortraitUrl ? (
                          <img src={pcPortraitUrl} alt="주인공" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: isDarkMode ? "#b3aaa0" : "#8c8278", fontSize: "0.68rem" }}>
                            <ImageIcon size={24} strokeWidth={1} />
                            <span style={{ fontWeight: "700" }}>수사관 사진</span>
                          </div>
                        )}
                      </div>
                      <div style={{ marginTop: "6px", textAlign: "center", width: "100%" }}>
                        <div style={{ fontWeight: "900", fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pcName || "이름 미상"}</div>
                      </div>
                    </div>

                    <div style={{ flex: 1, padding: "14px", backgroundColor: theme.panelAlt, borderRadius: "12px", border: `1.5px solid ${theme.borderHighlight || theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>이름</label>
                          <input type="text" value={pcName} onChange={e => setPcName(e.target.value)} placeholder="예: 엄수빈" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>나이/성별</label>
                          <input type="text" value={pcAgeGender} onChange={e => setPcAgeGender(e.target.value)} placeholder="예: 26세 여성" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>직업/역할</label>
                          <input type="text" value={pcJob} onChange={e => setPcJob(e.target.value)} placeholder="예: 탐정, 프리랜서" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>수사관의 배경 및 특징 (성격, 약점 등)</label>
                        <textarea rows={2} value={pcBackground} onChange={e => setPcBackground(e.target.value)} placeholder="사건에 휘말리게 된 계기나 평소 성격..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", resize: "vertical" }} />
                      </div>

                      {/* 🌟 주인공 전용 남모르는 비밀 (추리 모드용 빨간색 테마 적용) */}
                      <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)", borderRadius: "8px", border: `1px solid ${theme.danger}`, padding: "10px 12px", marginTop: "4px" }}>
                        <button type="button" onClick={() => setShowPcSecret(!showPcSecret)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", fontSize: "0.76rem", color: theme.danger, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}>
                          <span style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                            <Lock size={15} strokeWidth={2.5} /> 수사관의 숨겨진 비밀 / 약점
                          </span>
                          <span style={{ fontWeight: "500", fontSize: "0.85rem" }}>{showPcSecret ? "▲" : "▼"}</span>
                        </button>
                        
                        {showPcSecret && (
                          <input type="text" value={pcSecret} onChange={e => setPcSecret(e.target.value)} placeholder="예: 사실 과거의 사건과 깊은 연관이 있다..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", marginTop: "8px", borderRadius: "6px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.82rem", outline: "none" }} />
                        )}
                      </div>

                    </div>
                  </div>
                </section>

                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ClipboardList size={22} strokeWidth={2} color={theme.accent} />
                    <span style={{ fontWeight: "900", fontSize: "0.95rem", color: theme.text }}>사건 개요서</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "10px" }}>
                    <input type="text" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} placeholder="사건명 (예: 심야 펜트하우스 살인사건)" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                    <input type="text" value={victimName} onChange={e => setVictimName(e.target.value)} placeholder="사건 대상/의뢰인" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                  </div>
                  <textarea rows={2} value={publicSynopsis} onChange={e => setPublicSynopsis(e.target.value)} placeholder="현장 상황 및 사건 발생 개요..." style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
                  <textarea rows={2} value={openingScene} onChange={e => setOpeningScene(e.target.value)} placeholder="첫 오프닝/서막 지문..." style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
                </section>

                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Pin size={22} strokeWidth={2} color={theme.danger} style={{ transform: "rotate(45deg)" }} />
                      <span style={{ fontSize: "0.95rem", color: theme.text }}>
                        <strong style={{ fontWeight: "900" }}>용의자 수사망</strong>
                        <span style={{ fontWeight: "500", color: theme.textMuted, marginLeft: "4px" }}>({suspects.length}명 / 최대 15명)</span>
                      </span>
                    </div>
                    <button type="button" onClick={handleAddSuspect} style={{ padding: "6px 14px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.accent}`, borderRadius: "16px", color: theme.accent, fontSize: "0.76rem", fontWeight: "600", cursor: "pointer" }}>
                      ＋ 인물 추가
                    </button>
                  </div>

                  <div style={{ 
                    display: isMobile ? "flex" : "grid", 
                    gridTemplateColumns: isMobile ? "none" : "repeat(auto-fill, minmax(135px, 1fr))", 
                    gap: "12px", 
                    overflowX: isMobile ? "auto" : "visible", 
                    padding: "14px 10px 14px 4px",
                    WebkitOverflowScrolling: "touch" 
                  }}>
                    {suspects.map((s, idx) => {
                      const isSelected = (selectedSuspectId || suspects[0]?.id) === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSuspectId(s.id)}
                          style={{
                            flex: isMobile ? "0 0 125px" : "auto",
                            backgroundColor: theme.polaroidBg || "#ded7cb", borderRadius: "6px", padding: "8px 8px 12px 8px", color: theme.polaroidText || "#292524",
                            boxShadow: isSelected ? `0 0 0 2px ${theme.accent}, 0 8px 24px rgba(0,0,0,0.3)` : "0 3px 10px rgba(0,0,0,0.18)",
                            position: "relative", cursor: "pointer", transform: isSelected ? "scale(1.03)" : "scale(1)", transition: "all 0.15s ease", display: "flex", flexDirection: "column", alignItems: "center"
                          }}
                        >
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
                              cursor: "pointer"
                            }}
                          >
                            {s.portraitUrl ? (
                              <img src={s.portraitUrl} alt="용의자" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: isDarkMode ? "#b3aaa0" : "#8c8278", fontSize: "0.68rem" }}>
                                <ImageIcon size={24} strokeWidth={1} />
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

                  {(() => {
                    const curId = selectedSuspectId || suspects[0]?.id;
                    const cur = suspects.find(s => s.id === curId) || suspects[0];
                    if (!cur) return null;

                    return (
                      <div style={{ padding: isMobile ? "14px" : "16px", backgroundColor: theme.panelAlt, borderRadius: "12px", border: `1.5px solid ${theme.borderHighlight || theme.border}`, display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px dashed ${theme.border}`, paddingBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: "900", color: theme.accent, display: "flex", alignItems: "center", gap: "6px" }}>
                            <FolderOpen size={18} strokeWidth={2.5} /> 수사 서류: [{cur.name || "신원 미상"}]
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
                            <span style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Lock size={15} strokeWidth={2.5} /> 숨겨진 비밀 / 약점
                            </span>
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

                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button 
                    type="button" 
                    onClick={() => setShowEvidence(!showEvidence)}
                    style={{ width: "100%", textAlign: "left", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileSearch size={22} strokeWidth={2} color={theme.accent} />
                      <span style={{ fontWeight: "600", fontSize: "0.95rem", color: theme.text }}>사건 단서 및 물증</span>
                    </div>
                    <span style={{ color: theme.text, fontSize: "0.85rem", fontWeight: "500" }}>
                      {showEvidence ? "▲" : "▼"}
                    </span>
                  </button>

                  {showEvidence && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
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
                                <span style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <Lock size={15} strokeWidth={2.5} /> 감식 진상 / 모순
                                </span>
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

                      <button 
                        type="button" 
                        onClick={handleAddEvidence} 
                        style={{ 
                          width: "100%", padding: "12px", 
                          backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", 
                          border: `1.5px dashed ${theme.borderHighlight || theme.border}`, 
                          borderRadius: "12px", color: theme.accent, fontSize: "0.82rem", fontWeight: "800", 
                          cursor: "pointer", transition: "all 0.2s"
                        }}
                      >
                        ＋ 새로운 단서 추가 ({evidenceList.length} / 15)
                      </button>

                    </div>
                  )}
                </section>

                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button 
                    type="button" 
                    onClick={() => setShowHiddenTruth(!showHiddenTruth)} 
                    style={{ width: "100%", textAlign: "left", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mailbox size={22} strokeWidth={2} color={theme.accent} />
                      <span style={{ fontWeight: "600", fontSize: "0.95rem", color: theme.text }}>사건 진상 봉투</span>
                    </div>
                    <span style={{ color: theme.text, fontSize: "0.85rem", fontWeight: "500" }}>
                      {showHiddenTruth ? "▲" : "▼"}
                    </span>
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

{/* 🌸 연애 모드 전체 구역 */}
            {selectedMode === "연애" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>

                {/* 📱 1. 스마트폰 메신저 UI (로비에 박제된 핸드폰) */}
                <div style={{
                  width: "100%", maxWidth: "380px", margin: "0 auto", backgroundColor: theme.panel,
                  border: isDarkMode ? "12px solid #3f3f46" : "12px solid #e2e8f0", 
                  borderRadius: "40px", overflow: "hidden", display: "flex", flexDirection: "column",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", position: "relative",
                  height: "700px", flexShrink: 0
                }}>
                  {/* 핸드폰 상단바 */}
                  <div style={{ height: "24px", backgroundColor: isDarkMode ? "#3f3f46" : "#e2e8f0", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ width: "60px", height: "6px", backgroundColor: isDarkMode ? "#52525b" : "#cbd5e1", borderRadius: "10px" }} />
                  </div>

                  {!showPhoneDetail ? (
                    /* 📱 화면 A: 메신저 친구 목록 뷰 */
                    <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "24px", backgroundColor: theme.bg }}>
                      
                      {/* 내 프로필 */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "900", color: theme.textMuted }}>내 프로필</span>
                        <div 
                          onClick={() => { setSelectedSuspectId("pc"); setShowPhoneDetail(true); }}
                          style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", padding: "8px", borderRadius: "12px", transition: "background 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.panelAlt}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePortraitSuspectId("pc");
                              setShowPortraitModal(true);
                            }}
                            title="프로필 사진 확대/변경"
                            style={{ width: "64px", height: "64px", borderRadius: "20px", overflow: "hidden", border: `1px solid ${theme.borderHighlight}` }}
                          >
                            {pcPortraitUrl ? <img src={pcPortraitUrl} alt="주인공" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", backgroundColor: isDarkMode ? "#333" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}><UserRound size={24} color={theme.textMuted} /></div>}
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontWeight: "900", fontSize: "1.05rem", color: theme.text }}>{pcName || "내 이름"}</span>
                            <span style={{ fontSize: "0.8rem", color: theme.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pcBackground || "상태 메시지가 없습니다."}</span>
                          </div>
                        </div>
                      </div>

                      <hr style={{ border: "none", borderTop: `1px solid ${theme.border}`, margin: 0 }} />

                      {/* 공략 대상 리스트 */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "4px" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "900", color: theme.textMuted }}>공략 대상 ({suspects.length})</span>
                          <button onClick={handleAddSuspect} style={{ background: "none", border: "none", color: "#ec4899", fontWeight: "800", fontSize: "0.8rem", cursor: "pointer" }}>＋ 추가</button>
                        </div>
                        
                        {suspects.map(s => (
                          <div 
                            key={s.id} 
                            onClick={() => { setSelectedSuspectId(s.id); setShowPhoneDetail(true); }}
                            style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", padding: "8px", borderRadius: "12px", transition: "background 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.panelAlt}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePortraitSuspectId(s.id);
                                setShowPortraitModal(true);
                              }}
                              title="사진 확대/변경"
                              style={{ width: "54px", height: "54px", borderRadius: "18px", overflow: "hidden", border: `1px solid ${theme.borderHighlight}` }}
                            >
                              {s.portraitUrl ? <img src={s.portraitUrl} alt="공략대상" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", backgroundColor: isDarkMode ? "#333" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}><UserRound size={20} color={theme.textMuted} /></div>}
                            </div>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ fontWeight: "900", fontSize: "0.95rem", color: theme.text }}>{s.name || "이름 미상"}</span>
                              <span style={{ fontSize: "0.75rem", color: theme.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.behavior || "상태 메시지가 없습니다."}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* 📱 화면 B: 상세 프로필 및 수정 뷰 */
                    (() => {
                      const isPcDetail = selectedSuspectId === "pc";
                      const cur = isPcDetail 
                        ? { id: "pc", name: pcName, ageGender: pcAgeGender, job: pcJob, behavior: pcBackground, portraitUrl: pcPortraitUrl, showSecret: false, secret: "" } 
                        : suspects.find(s => s.id === selectedSuspectId) || suspects[0];
                      
                      const rotationList = ["pc", ...suspects.map(s => s.id)];
                      const curIdx = rotationList.indexOf(selectedSuspectId);
                      const goPrev = (e) => { e.stopPropagation(); setSelectedSuspectId(rotationList[(curIdx - 1 + rotationList.length) % rotationList.length]); };
                      const goNext = (e) => { e.stopPropagation(); setSelectedSuspectId(rotationList[(curIdx + 1) % rotationList.length]); };

                      const updateCur = (field, val) => {
                        if (isPcDetail) {
                          if (field === 'name') setPcName(val);
                          if (field === 'ageGender') setPcAgeGender(val);
                          if (field === 'job') setPcJob(val);
                          if (field === 'behavior') setPcBackground(val);
                          // 🌟 주인공의 비밀 칸 업데이트 (새로운 변수 pcSecret이 없어서 추후 관리가 필요하지만 우선은 임시로 처리)
                        } else {
                          handleUpdateSuspect(cur.id, field, val);
                        }
                      };

                      const thinInputStyle = {
                        width: "100%", boxSizing: "border-box", padding: "8px 4px", border: "none", borderBottom: `1.5px solid ${theme.borderHighlight}`,
                        backgroundColor: "transparent", color: theme.text, fontSize: "0.9rem", outline: "none"
                      };

                      return (
                        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", backgroundColor: theme.panel }}>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: `1px solid ${theme.border}` }}>
                            <button onClick={() => setShowPhoneDetail(false)} style={{ background: "none", border: "none", color: theme.text, cursor: "pointer", display: "flex", alignItems: "center" }}>
                              <X size={24} strokeWidth={2.5} />
                            </button>
                            <span style={{ fontWeight: "900", fontSize: "0.95rem" }}>{isPcDetail ? "내 프로필 편집" : "프로필 편집"}</span>
                            {!isPcDetail && suspects.length > 1 ? (
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteSuspect(e, cur.id); setShowPhoneDetail(false); }} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", fontWeight: "800", fontSize: "0.8rem" }}>삭제</button>
                            ) : <div style={{ width: "24px" }}/>}
                          </div>

                          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <button onClick={goPrev} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textMuted, padding: "10px", display: "flex", alignItems: "center", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = theme.accent} onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}>
                                <ChevronLeft size={36} strokeWidth={1.5} />
                              </button>
                              
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePortraitSuspectId(cur.id);
                                  setShowPortraitModal(true);
                                }}
                                title="프로필 사진 확대 및 등록"
                                style={{ 
                                  width: "140px", height: "140px", borderRadius: "32px", overflow: "hidden", 
                                  border: `1px solid ${theme.border}`, cursor: "pointer", position: "relative", 
                                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
                                  backgroundColor: isDarkMode ? "#333" : "#f1f5f9"
                                }}
                              >
                                {cur.portraitUrl ? <img src={cur.portraitUrl} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={40} color={theme.textMuted} />}
                              </div>

                              <button onClick={goNext} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textMuted, padding: "10px", display: "flex", alignItems: "center", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = theme.accent} onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}>
                                <ChevronRight size={36} strokeWidth={1.5} />
                              </button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "10px" }}>
                              
                              <div>
                                <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "800", paddingLeft: "4px" }}>이름 (닉네임)</label>
                                <input type="text" value={cur.name} onChange={e => updateCur("name", e.target.value)} placeholder="이름을 입력하세요" style={{ ...thinInputStyle, fontSize: "1.1rem", fontWeight: "900", textAlign: "center" }} />
                              </div>
                              
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                  <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "800", paddingLeft: "4px" }}>나이/성별</label>
                                  <input type="text" value={cur.ageGender} onChange={e => updateCur("ageGender", e.target.value)} placeholder="예: 28세 여성" style={thinInputStyle} />
                                </div>
                                <div>
                                  <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "800", paddingLeft: "4px" }}>직업/접점</label>
                                  <input type="text" value={cur.job} onChange={e => updateCur("job", e.target.value)} placeholder="예: 같은 팀 선임" style={thinInputStyle} />
                                </div>
                              </div>

                              <div>
                                <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "800", paddingLeft: "4px" }}>성격 및 상태 메시지 (관계성)</label>
                                <textarea rows={2} value={cur.behavior} onChange={e => updateCur("behavior", e.target.value)} placeholder="상태 메시지나 성격을 입력하세요..." style={{ ...thinInputStyle, resize: "none" }} />
                              </div>

                              {/* 🌟 수정사항 1: 주인공(PC)일 때도 비밀 칸이 뜨도록 제한 삭제 */}
                              <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "#fdf2f8", borderRadius: "12px", border: `1px solid #f9a8d4`, padding: "14px", marginTop: "8px" }}>
                                <button type="button" onClick={() => {
                                  // 주인공 전용 비밀 토글 로직 추가가 필요하지만 임시 우회
                                  if(!isPcDetail) handleUpdateSuspect(cur.id, "showSecret", !cur.showSecret);
                                }} style={{ width: "100%", textAlign: "left", background: "none", border: "none", fontSize: "0.8rem", color: "#db2777", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}>
                                  <span style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}><Lock size={15} strokeWidth={2.5} /> 남모르는 비밀 / 진심</span>
                                  <span style={{ fontWeight: "500", fontSize: "0.85rem" }}>{cur.showSecret ? "▲" : "▼"}</span>
                                </button>
                                {/* 무조건 펼쳐지도록 임시 처리 (주인공 상태 관리를 위해) */}
                                <input type="text" value={cur.secret} onChange={e => {
                                  if(!isPcDetail) handleUpdateSuspect(cur.id, "secret", e.target.value);
                                }} placeholder="예: 사실 오래전부터 주인공을 마음에 두고 있었다." style={{ width: "100%", boxSizing: "border-box", padding: "10px", marginTop: "12px", borderRadius: "8px", border: `1px solid #f9a8d4`, backgroundColor: theme.inputBg, color: "#be185d", fontSize: "0.85rem", outline: "none" }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* 🌟 수정사항 2: 추리 모드 디자인(둥근 모서리, 배경, 마진) 완벽 복붙 통일 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button type="button" onClick={() => setShowCgGallery(!showCgGallery)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ImageIcon size={22} strokeWidth={2} color="#ec4899" />
                      <span style={{ fontWeight: "900", fontSize: "0.95rem", color: theme.text }}>이벤트 CG 갤러리</span>
                    </div>
                    <span style={{ color: theme.text, fontSize: "0.85rem", fontWeight: "500" }}>{showCgGallery ? "▲" : "▼"}</span>
                  </button>

                  {showCgGallery && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
                        {cgList.map((item, idx) => (
                          <div key={item.id} style={{ backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                              <input type="text" value={item.title} onChange={e => setCgList(cgList.map(c => c.id === item.id ? { ...c, title: e.target.value } : c))} placeholder={`CG ${idx + 1} 명칭`} style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", fontWeight: "800", outline: "none" }} />
                              {cgList.length > 1 && <button type="button" onClick={() => setCgList(cgList.filter(c => c.id !== item.id))} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer" }}>🗑</button>}
                            </div>
                            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                              <label title="CG 이미지 등록" style={{ flex: "0 0 80px", height: "80px", backgroundColor: theme.inputBg, border: `1px dashed ${theme.border}`, borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                                {item.imageUrl ? <img src={item.imageUrl} alt="CG" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ color: theme.textMuted, fontSize: "0.65rem", display: "flex", flexDirection: "column", alignItems: "center" }}><ImageIcon size={18} /><span>이미지</span></div>}
                                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const r = new FileReader();
                                    r.onload = (ev) => setCgList(cgList.map(c => c.id === item.id ? { ...c, imageUrl: ev.target.result } : c));
                                    r.readAsDataURL(file);
                                  }
                                }} />
                              </label>
                              <textarea rows={3} value={item.condition} onChange={e => setCgList(cgList.map(c => c.id === item.id ? { ...c, condition: e.target.value } : c))} placeholder="해금 조건 (예: 옥상 이벤트 성공)" style={{ flex: 1, padding: "8px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.78rem", outline: "none", resize: "none" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button type="button" onClick={() => setCgList([...cgList, { id: Date.now(), title: "", condition: "", imageUrl: "", showDetails: true }])} style={{ width: "100%", padding: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1.5px dashed ${theme.borderHighlight || theme.border}`, borderRadius: "12px", color: "#ec4899", fontSize: "0.82rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s" }}>
                        ＋ 새로운 CG 추가 ({cgList.length})
                      </button>
                    </div>
                  )}
                </section>

                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button type="button" onClick={() => setShowRouteList(!showRouteList)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FolderOpen size={22} strokeWidth={2} color="#ec4899" />
                      <span style={{ fontWeight: "900", fontSize: "0.95rem", color: theme.text }}>선택지 분기 및 루트 설계</span>
                    </div>
                    <span style={{ color: theme.text, fontSize: "0.85rem", fontWeight: "500" }}>{showRouteList ? "▲" : "▼"}</span>
                  </button>

                  {showRouteList && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                      {routeList.map((route, idx) => (
                        <div key={route.id} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "8px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "14px", alignItems: isMobile ? "stretch" : "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 2 }}>
                            <span style={{ backgroundColor: "#fbcfe8", color: "#be185d", padding: "4px 8px", borderRadius: "8px", fontSize: "0.7rem", fontWeight: "900", whiteSpace: "nowrap" }}>분기 {idx + 1}</span>
                            <input type="text" value={route.routeName} onChange={e => setRouteList(routeList.map(r => r.id === route.id ? { ...r, routeName: e.target.value } : r))} placeholder="분기 설명 (예: 옥상에서 위로한다)" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.8rem", outline: "none" }} />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                            <select value={route.targetId} onChange={e => setRouteList(routeList.map(r => r.id === route.id ? { ...r, targetId: e.target.value } : r))} style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.78rem", outline: "none", cursor: "pointer" }}>
                              <option value="">영향받는 인물</option>
                              {suspects.map(s => <option key={s.id} value={s.id}>{s.name || "이름 미상"}</option>)}
                            </select>
                            <input type="text" value={route.affectionChange} onChange={e => setRouteList(routeList.map(r => r.id === route.id ? { ...r, affectionChange: e.target.value } : r))} placeholder="호감도 (예: +10)" style={{ width: "75px", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.accent, fontWeight: "800", fontSize: "0.78rem", outline: "none", textAlign: "center" }} />
                            {routeList.length > 1 && <button type="button" onClick={() => setRouteList(routeList.filter(r => r.id !== route.id))} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", fontSize: "0.8rem" }}>🗑</button>}
                          </div>
                        </div>
                      ))}
                      
                      <button type="button" onClick={() => setRouteList([...routeList, { id: Date.now(), routeName: "", targetId: "", affectionChange: "+10", requiredCG: "" }])} style={{ width: "100%", padding: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1.5px dashed ${theme.borderHighlight || theme.border}`, borderRadius: "12px", color: "#ec4899", fontSize: "0.82rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s" }}>
                        ＋ 새로운 루트/분기 추가 ({routeList.length})
                      </button>
                    </div>
                  )}
                </section>
              </div>
            )}

            {selectedMode === "괴담" && (
              <div style={{ ...GLASS_STYLE, padding: "40px 20px", textAlign: "center", color: theme.textMuted, borderRadius: "16px", border: `1.5px dashed ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "2rem" }}>🕯️</span><span style={{ fontSize: "0.92rem", fontWeight: "800", color: theme.accent }}>괴담 모드 서류철 준비 중</span>
                <span style={{ fontSize: "0.76rem" }}>재능 3슬롯 장착 칩, 이면 카드, 침식도 HUD가 이곳에 연결됩니다.</span>
              </div>
            )}

            <button 
              onClick={startNewSession} 
              disabled={isLoading}
              style={{ 
                width: "100%", padding: "16px", borderRadius: "14px", marginTop: "12px",
                backgroundColor: isLoading ? theme.panelAlt : theme.accent, 
                color: isLoading ? theme.textMuted : (isDarkMode ? "#1a1817" : "#ffffff"), 
                border: isLoading ? `1px solid ${theme.border}` : "none",
                fontWeight: "900", fontSize: "1.05rem", cursor: isLoading ? "default" : "pointer",
                boxShadow: isLoading ? "none" : `0 4px 20px rgba(0,0,0,0.2)`, 
                transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" 
              }}
            >
              {isLoading ? "서막을 여는 중..." : "▶ 이야기 시작하기"}
            </button>
            <div style={{ height: "60px", flexShrink: 0 }} />
          </main>

        ) : (
          <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", backgroundColor: theme.bg }}>
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
              <div 
                className="serif-text" 
                style={{ 
                  flex: 1, overflowY: "auto", 
                  padding: isMobile ? "24px 20px 140px 20px" : "50px 60px 160px 60px", 
                  display: "flex", flexDirection: "column", gap: "28px", 
                  maxWidth: "760px", margin: "0 auto", width: "100%", boxSizing: "border-box", 
                  fontSize: "1.12rem", lineHeight: 2.1, color: theme.text, letterSpacing: "-0.02em",
                  fontWeight: 400
                }}
              >
                {(activeSession.messages || []).map((m, idx) => {
                  const isUser = m.role === "user";
                  return (
                    <div key={idx} style={{ 
                      alignSelf: "stretch",
                      color: isUser ? theme.accent : theme.text,
                      fontWeight: "400",
                      opacity: 0.95,
                      textAlign: isUser ? "center" : "left",
                      fontStyle: isUser ? "italic" : "normal",
                      wordBreak: "keep-all",
                      padding: isUser ? "16px 0" : "0",
                      borderTop: isUser ? `1px dashed ${theme.border}` : "none",
                      borderBottom: isUser ? `1px dashed ${theme.border}` : "none",
                      margin: isUser ? "10px 0" : "0"
                    }}>
                      {m.text}
                    </div>
                  );
                })}
                {isLoading && (
                  <div style={{ color: theme.textMuted, fontSize: "0.95rem", fontStyle: "italic", textAlign: "center", padding: "20px 0", animation: "pulse 1.5s infinite" }}>
                    (사건의 이면이 서술되는 중……)
                  </div>
                )}
              </div>

              <footer style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "20px max(20px, env(safe-area-inset-bottom))",
                background: `linear-gradient(to top, ${theme.bg} 85%, transparent)`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: "12px"
              }}>
                {activeSession?.suggestedActions?.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", overflowX: "auto", width: "100%", maxWidth: "680px", paddingBottom: "4px" }}>
                    {activeSession.suggestedActions.map((sugg, idx) => (
                      <button
                        key={idx} onClick={() => executeMessage(sugg)}
                        style={{ padding: "10px 16px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "20px", color: theme.text, fontSize: "0.85rem", fontWeight: "700", whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: "all 0.2s" }}
                      >
                        💡 {sugg}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{
                  width: "100%", maxWidth: "680px", display: "flex", alignItems: "flex-end", gap: "8px",
                  backgroundColor: theme.inputBg, border: `1.5px solid ${theme.border}`, borderRadius: "28px",
                  padding: "6px 8px 6px 20px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
                }}>
                  <textarea
                    value={inputMsg}
                    onChange={e => {
                      setInputMsg(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        if (e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                          e.target.style.height = "auto";
                        } else {
                          e.preventDefault();
                        }
                      }
                    }}
                    placeholder="행동을 선언하거나 대사를 입력하세요... (Shift+Enter 전송)"
                    rows={1}
                    style={{
                      flex: 1, border: "none", backgroundColor: "transparent", color: theme.text,
                      fontSize: "0.95rem", outline: "none", resize: "none", overflowY: "auto",
                      maxHeight: "120px", padding: "10px 0", margin: 0, fontFamily: "inherit", lineHeight: "1.5"
                    }}
                  />
                  {isLoading ? (
                    <button onClick={() => { if(abortController) abortController.abort(); }} title="중단" style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: theme.danger, color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginBottom: "2px" }}>
                      <X size={20} strokeWidth={2.5} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleSendMessage();
                        const el = document.querySelector('textarea[placeholder*="행동을 선언"]');
                        if(el) el.style.height = "auto";
                      }}
                      disabled={!inputMsg.trim()}
                      title="전송"
                      style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        backgroundColor: inputMsg.trim() ? theme.accent : theme.panelAlt,
                        color: inputMsg.trim() ? "#fff" : theme.textMuted,
                        border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: inputMsg.trim() ? "pointer" : "default", transition: "all 0.2s",
                        flexShrink: 0, marginBottom: "2px"
                      }}
                    >
                      <ArrowUp size={20} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </footer>
            </div>

            {showEvidenceBoard && activeSession && activeSession.ruleMode === "freeform" && (
              <SecretBoard
                activeSession={activeSession}
                theme={theme}
                isMobile={isMobile}
                onClose={() => setShowEvidenceBoard(false)}
                onDeclareMystery={() => {
                  setShowEvidenceBoard(false);
                  setInputMsg(prev => prev.trim() ? prev : "[💡 진상 추리] ");
                }}
              />
            )}

            <CharacterSheet 
              activeSession={activeSession}
              theme={theme}
              isMobile={isMobile}
              isSheetOpen={isSheetOpen}
              setIsSheetOpen={setIsSheetOpen}
              isDarkMode={isDarkMode}
              setActivePortraitTarget={setActivePortraitTarget}
              setShowPortraitEditModal={setShowPortraitEditModal}
              handleSaveCurrentAsPreset={handleSaveCurrentAsPreset}
              handleSaveSessionAsLobbyPreset={handleSaveSessionAsLobbyPreset}
            />

          </div>
        )}

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
              { key: "explore", icon: <Search size={20} strokeWidth={2.5} />, label: "시나리오 탐색" },
              { key: "library", icon: <LibraryBig size={20} strokeWidth={2.5} />, label: "서재" },
              { key: "lobby", icon: <PenTool size={20} strokeWidth={2.5} />, label: "로비" },
              { key: "profile", icon: <UserRound size={20} strokeWidth={2.5} />, label: "내정보" }
            ].map((tab, idx, arr) => {
              const isSelected = activeTab === tab.key;
              const isLast = idx === arr.length - 1;

              return (
                <div
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", gap: "4px",
                    borderRight: isLast ? "none" : `1px solid ${theme.border}`,
                    backgroundColor: isSelected ? (isDarkMode ? "rgba(235, 227, 218, 0.12)" : "rgba(120, 105, 90, 0.12)") : "transparent",
                    color: isSelected ? theme.accent : theme.textMuted,
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ transform: isSelected ? "scale(1.15)" : "scale(1)", transition: "transform 0.2s", display: "flex", alignItems: "center" }}>
                    {tab.icon}
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: isSelected ? "800" : "600" }}>{tab.label}</span>
                </div>
              );
            })}
          </nav>
        )}

        {showPortraitModal && (() => {
          const isPc = activePortraitSuspectId === "pc";
          let target;

          if (isPc) {
            target = {
              id: "pc",
              name: pcName || "주인공 (수사관)",
              job: pcJob,
              ageGender: pcAgeGender,
              portraitUrl: pcPortraitUrl
            };
          } else {
            target = suspects.find(s => s.id === activePortraitSuspectId) || suspects[0];
          }

          if (!target) return null;

          return (
            <div
              onClick={() => setShowPortraitModal(false)}
              style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "16px", animation: "fadeIn 0.2s ease-out" }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{ backgroundColor: theme.panel, border: `1.5px solid ${theme.border}`, width: "100%", maxWidth: "380px", borderRadius: "18px", padding: "20px", color: theme.text, display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
              >
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

                <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: "14px", overflow: "hidden", border: `1.5px solid ${theme.border}`, backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.25)" : "#f0ece4", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {target.portraitUrl ? (
                    <img src={target.portraitUrl} alt="초상화" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ textAlign: "center", color: theme.textMuted, fontSize: "0.85rem", lineHeight: "1.6" }}>
                      <div style={{ fontSize: "2.4rem", marginBottom: "6px", display: "flex", justifyContent: "center" }}>
                        <ImageIcon size={48} strokeWidth={1} color={theme.textMuted} />
                      </div>
                      등록된 사진이 없습니다.
                    </div>
                  )}

                  <label
                    title="사진 변경/등록"
                    style={{
                      position: "absolute", bottom: "12px", right: "12px", width: "38px", height: "38px", borderRadius: "50%",
                      backgroundColor: "rgba(0,0,0,0.7)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", 
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5,
                      boxShadow: "0 4px 10px rgba(0,0,0,0.5)"
                    }}
                  >
                    <PenTool size={18} strokeWidth={2.5} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: "none" }} 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (isPc) {
                            setPcPortraitUrl(ev.target.result);
                          } else {
                            handleUpdateSuspect(target.id, "portraitUrl", ev.target.result);
                          }
                        };
                        reader.readAsDataURL(file);
                        e.target.value = null; 
                      }} 
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })()}

        {showPasteModal && (
          <div onClick={() => setShowPasteModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "520px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "800", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ClipboardPaste size={20} strokeWidth={2.5} color={theme.accent} /> 시나리오 텍스트 붙여넣기
                </span>
                <button onClick={() => setShowPasteModal(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer" }}><X size={20}/></button>
              </div>
              <textarea rows={8} value={pastedText} onChange={e => setPastedText(e.target.value)} placeholder="스튜디오에서 작성된 시나리오 전체 글을 여기에 붙여넣으세요..." style={{ width: "100%", boxSizing: "border-box", padding: "12px", backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.82rem", outline: "none", resize: "none" }} />
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setShowPasteModal(false)} style={{ flex: 1, padding: "10px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.8rem", cursor: "pointer" }}>취소</button>
                <button onClick={handleApplyPastedScenario} style={{ flex: 2, padding: "10px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", border: "none", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "800", cursor: "pointer" }}>서류철에 자동 배치 ➔</button>
              </div>
            </div>
          </div>
        )}

        {ruleHelpModal && (
          <div onClick={() => setRuleHelpModal(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 160, padding: "20px" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "440px", padding: "22px", borderRadius: "16px", backgroundColor: theme.panel, color: theme.text, display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.2rem", color: theme.accent }}>{ruleHelpModal.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800" }}>{ruleHelpModal.title}</h3>
                    <div style={{ fontSize: "0.72rem", color: theme.textMuted }}>{ruleHelpModal.desc}</div>
                  </div>
                </div>
                <button type="button" onClick={() => setRuleHelpModal(null)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}><X size={20}/></button>
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
    </div>
  );
}
