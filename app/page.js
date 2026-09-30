"use client";

import { useState, useEffect } from "react";
import SecretBoard from "@/components/SecretBoard";
import { THEME_PALETTES, GLASS_STYLE } from "@/lib/themes";
// 🌟 세련된 벡터 아이콘 라이브러리 임포트
import { 
  Search, Heart, Flame, LayoutGrid, LibraryBig, PenTool, UserRound, 
  Menu, Moon, Sun, Save, FileUp, HelpCircle, X, ChevronDown, ChevronUp, Image as ImageIcon,
  ClipboardList, Pin, FileSearch, Mailbox, Play,
  FolderOpen, Lock, Settings, Database, ClipboardPaste, LogOut
} from "lucide-react";

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
// 🟢 변경 후 (해결 완료!)
  const [pcName, setPcName] = useState("");
  const [pcAgeGender, setPcAgeGender] = useState("");
  const [pcJob, setPcJob] = useState("");
  const [pcBackground, setPcBackground] = useState("");
  const [pcPortraitUrl, setPcPortraitUrl] = useState(""); 

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
const [showEvidence, setShowEvidence] = useState(false);
  const [culpritName, setCulpritName] = useState("");
  const [trickDetail, setTrickDetail] = useState("");
  const [hiddenTruth, setHiddenTruth] = useState("");
  const [showHiddenTruth, setShowHiddenTruth] = useState(false);

  // 인게임 상태
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── [7. 인게임 UI 토글 상태 관리 (누락된 변수 추가)] ──
  const [isPhoneDrawerOpen, setIsPhoneDrawerOpen] = useState(false); // 메신저 창 열림 상태
  const [isSheetOpen, setIsSheetOpen] = useState(false); // 우측 캐릭터 시트 열림 상태
  const [showEvidenceBoard, setShowEvidenceBoard] = useState(false); // 중앙 증거보드 모달 열림 상태
  const [isTabletopOpen, setIsTabletopOpen] = useState(false); // 테이블탑 핸드아웃 열림 상태
  const [activePhoneContactId, setActivePhoneContactId] = useState(null); // 메신저에서 현재 대화 중인 대상

  // ── [9. 인게임 진행 상태 관리 (원본에서 이식)] ──
  const [sessions, setSessions] = useState([]); // 진행 중인 전체 세션 목록
  const [activeSessionId, setActiveSessionId] = useState(null); // 현재 띄워진 세션 ID
  const [abortController, setAbortController] = useState(null); // AI 통신 강제 중단 컨트롤러
  
  // 현재 활성화된 세션의 전체 데이터를 쉽게 꺼내쓰기 위한 단축 변수
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

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

    // 🌟 AI 백엔드와 통신하는 스마트 파서 엔진으로 교체!
  const handleApplyPastedScenario = async () => {
    if (!pastedText.trim()) return;

    // 파싱하는 동안 버튼을 연타하지 못하게 로딩 알림 띄우기
    triggerToast("파싱 중...", "AI가 서류를 분석하고 있습니다. 잠시만 기다려주세요.", "⏳");

    try {
      // 우리가 만든 백엔드 API로 텍스트를 보냅니다.
      const response = await fetch("/api/parse-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: pastedText,
          ruleMode: selectedMode,
          pcName: pcName || "주인공", // 🌟 주인공 칸에 입력한 이름이 AI에게 전달됩니다!
          kpcName: "파트너"
        })
      });

      if (!response.ok) {
        throw new Error("서버 에러가 발생했습니다.");
      }

      const data = await response.json();

      // 🌟 AI가 예쁘게 정리해 준 JSON 데이터를 화면에 착착 꽂아줍니다.
      if (data.scenarioTitle) setScenarioTitle(data.scenarioTitle);
      if (data.publicSynopsis) setPublicSynopsis(data.publicSynopsis);
      if (data.openingScene) setOpeningScene(data.openingScene);
      if (data.hiddenTruth) setHiddenTruth(data.hiddenTruth);

      // 용의자(NPC) 리스트 자동 생성
      if (data.npcs && data.npcs.length > 0) {
        const newSuspects = data.npcs.map((npc, idx) => ({
          id: Date.now() + idx,
          name: npc.name || "",
          job: npc.job || "",
          behavior: npc.detail || "",
          secret: npc.secret || "",
          ageGender: "",
          portraitUrl: "",
          showSecret: false
        }));
        setSuspects(newSuspects);
      }

      // 단서(Handouts) 리스트 자동 생성
      if (data.handouts && data.handouts.length > 0) {
        const newEvidence = data.handouts.map((h, idx) => ({
          id: Date.now() + idx,
          name: h.title || "",
          overview: h.overview || "",
          secret: h.secret || "",
          contradiction: "",
          showSecret: false
        }));
        setEvidenceList(newEvidence);
      }

      // 창 닫고 성공 알림 띄우기
      setShowPasteModal(false);
      setPastedText("");
      triggerToast("파싱 완료!", "AI가 사건 서류철 배치를 완료했습니다.", "✨");

    } catch (error) {
      console.error(error);
      triggerToast("파싱 실패", "양식을 분석하지 못했습니다. 백엔드 연결을 확인해 주세요.", "⚠️");
    }
  };


  // ── [10. 코어 엔진: 세션 시작 및 통신 (원본에서 이식 및 추리 모드 최적화)] ──
  
  // 🚀 1. 이야기 시작하기 버튼을 눌렀을 때 작동하는 함수
  const startNewSession = async () => {
    // 필수 입력값 검사
    if (!scenarioTitle.trim()) {
      triggerToast("사건명 입력 필요", "이야기를 시작하려면 사건명을 입력해주세요.", "⚠️");
      return;
    }

    const pName = pcName.trim() || "주인공";
    
    // 로비 화면에 흩어져 있던 데이터들을 하나의 시트(Sheet)로 깔끔하게 묶습니다.
    const initialSheet = {
      name: pName,
      job: pcJob || "조사원",
      ageGender: pcAgeGender || "",
      background: pcBackground || "",
      portrait: pcPortraitUrl || "",
      hp: 100, // 추리 모드 신뢰도 (100점 만점 기준)
      maxHp: 100,
      npcs: suspects.map(s => ({ ...s, secretRevealed: false })), // 용의자 데이터
      handouts: evidenceList.map(e => ({ ...e, revealed: false })), // 단서 데이터
      fatigue: 0 // 수사 피로도
    };

    const newId = Date.now();
    const newSession = {
      id: newId,
      title: scenarioTitle,
      ruleMode: selectedMode === "추리" ? "freeform" : selectedMode === "연애" ? "dating" : "insane",
      preference: playPreference.trim(),
      // AI 마스터에게 전달할 시나리오 전체 뼈대
      scenarioText: `[시나리오 제목: ${scenarioTitle}]\n\n[공개 시놉시스]\n${publicSynopsis}\n\n[초기 배경/서막]\n${openingScene}\n\n[키퍼 전용 기밀/진상]\n${hiddenTruth}`,
      sheet: initialSheet,
      messages: [], // 채팅 내역이 쌓일 빈 배열
      suggestedActions: [] // AI가 제안할 3지선다 버튼
    };

    // 화면을 인게임으로 전환하고 로딩을 켭니다.
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
      // 🌟 백엔드(api/chat)로 데이터를 보냅니다.
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
      
      // AI가 보낸 제안(SUGGESTIONS) 태그를 추출하여 버튼으로 만듭니다.
      const suggMatch = cleanText.match(/<!--\s*SUGGESTIONS:\s*(\[[\s\S]*?\])\s*-{1,3}>/i);
      if (suggMatch) {
        try { suggActions = JSON.parse(suggMatch[1]); } catch(e) {}
        cleanText = cleanText.replace(suggMatch[0], "").trim();
      }

      // 받아온 서막 텍스트를 화면에 업데이트합니다.
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

  // 🚀 2. 플레이어가 채팅을 칠 때마다 실행되는 함수
  const executeMessage = async (textToSend) => {
    if (!textToSend.trim() || !activeSession) return;

    // 플레이어가 입력한 텍스트를 먼저 화면에 띄워줍니다.
    const updatedMessages = [
      ...(activeSession.messages || []),
      { role: "user", text: textToSend }
    ];

    setSessions(prev => prev.map(s => s.id === activeSessionId ? { 
      ...s, 
      messages: updatedMessages,
      suggestedActions: [] // 전송하는 순간 기존 제안 버튼 숨김
    } : s));
    
    setIsLoading(true);
    setInputMsg(""); // 입력창 비우기

    const controller = new AbortController();
    setAbortController(controller);

    try {
      // 최근 20개의 대화 내역만 추려서 AI에게 전송합니다.
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

      // AI의 답변을 말풍선 목록에 추가합니다.
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
              onClick={() => { setActiveSessionId(null); setIsDrawerOpen(false); }} 
              style={{ 
                flex: 1, padding: "12px", backgroundColor: theme.danger || "#ef4444", 
                border: "none", borderRadius: "8px", color: "#fff", fontSize: "0.85rem", 
                fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" // 🌟 아이콘 정렬을 위한 설정 추가
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
            {/* ☰ 대신 Menu 아이콘 (두께 1.5로 수정) */}
            <button onClick={() => setIsDrawerOpen(true)} style={{ background: "none", border: "none", color: theme.text, cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
              <Menu size={22} strokeWidth={1.5} />
            </button>
            
            {activeSession && (
              <span style={{ fontWeight: "800", fontSize: "0.85rem", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
                {activeSession.title}
              </span>
            )}
          </div>

          {/* 🌟 우측 액션 아이콘 바 (로비/인게임 상태 전환 및 글씨 없는 깔끔한 아이콘 정렬) */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            
            {/* 1. 로비 상태일 때 (불러오기, 저장) */}
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
            
{/* 2. 인게임 상태일 때 (메신저, 증거보드, 캐릭터 시트) */}
            {activeSession && (
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                
                {/* 📱 스마트폰 메신저 (연애/자유 모드) */}
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
                      style={{ position: "relative", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: isPhoneDrawerOpen ? theme.panelAlt : "transparent", border: `1px solid ${isPhoneDrawerOpen ? theme.accent : theme.border}`, borderRadius: "10px", cursor: "pointer", color: isPhoneDrawerOpen ? theme.accent : theme.text, transition: "all 0.2s" }}
                    >
                      <Smartphone size={20} strokeWidth={2.5} />
                      {unreadCount > 0 && (
                        <span style={{ position: "absolute", top: "-4px", right: "-4px", backgroundColor: theme.danger, color: "#fff", borderRadius: "10px", minWidth: "16px", height: "16px", fontSize: "0.6rem", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${theme.panel}` }}>
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })()}

                {/* 📌 증거보드 (추리 모드 전용 - 팝업 모달) */}
                {activeSession.ruleMode === "freeform" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPhoneDrawerOpen(false);
                      setIsSheetOpen(false);
                      setShowEvidenceBoard(true); // 🌟 팝업창 오픈
                    }}
                    title="수사 본부 증거보드"
                    style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${theme.border}`, borderRadius: "10px", cursor: "pointer", color: theme.danger, transition: "all 0.2s" }}
                  >
                    <Pin size={20} strokeWidth={2.5} style={{ transform: "rotate(45deg)" }} />
                  </button>
                )}

                {/* 🃏 핸드아웃 / 🎲 주사위 (인세인/CoC 전용) */}
                {activeSession.ruleMode === "insane" && (
                  <button type="button" onClick={() => setIsTabletopOpen(!isTabletopOpen)} title="테이블탑 핸드아웃" style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: isTabletopOpen ? "rgba(214, 56, 87, 0.12)" : "transparent", border: `1px solid ${isTabletopOpen ? theme.danger : theme.border}`, borderRadius: "10px", cursor: "pointer", color: isTabletopOpen ? theme.danger : theme.text }}>
                    <BookOpen size={20} strokeWidth={2.5} />
                  </button>
                )}
                {(activeSession.ruleMode === "coc" || activeSession.ruleMode === "insane") && (
                  <button type="button" onClick={() => rollDiceDirectly()} title="주사위 굴리기" style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${theme.border}`, borderRadius: "10px", cursor: "pointer", color: theme.warning }}>
                    <Dices size={20} strokeWidth={2.5} />
                  </button>
                )}

                {/* 📋 캐릭터 시트 (오버레이) */}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPhoneDrawerOpen(false);
                    setShowEvidenceBoard(false);
                    setIsSheetOpen(!isSheetOpen); // 🌟 우측 오버레이 패널 토글
                  }} 
                  title="캐릭터 시트" 
                  style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: isSheetOpen ? theme.panelAlt : "transparent", border: `1px solid ${isSheetOpen ? theme.accent : theme.border}`, borderRadius: "10px", color: isSheetOpen ? theme.accent : theme.text, cursor: "pointer", transition: "all 0.2s" }}
                >
                  {activeSession.ruleMode?.startsWith("dating") ? <UserRound size={20} strokeWidth={2.5} /> : <ClipboardList size={20} strokeWidth={2.5} />}
                </button>
              </div>
            )}
            
            {/* 🌙 다크모드 토글 버튼 (항상 노출) */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", color: theme.text, display: "flex", alignItems: "center" }}
            >
              {isDarkMode ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </header>

        {/* ── [A. 로비 뷰] ── */}
        {!activeSession ? (
          <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 14px 140px 14px" : "20px 16px 160px 16px", maxWidth: "860px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: isMobile ? "14px" : "18px", boxSizing: "border-box" }}>
              
{/* 1. 3대 모드 선택 카드 */}
            <section style={{ ...GLASS_STYLE, padding: isMobile ? "14px" : "18px", backgroundColor: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              
              <div style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "12px", color: theme.text }}>
                1. 룰 시스템 선택
              </div>
              
              {/* 🌟 룰 시스템 3열 가로 배치 (SVG 아이콘 적용 및 여백 최적화) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {[
                  // 🌟 수정됨: strokeWidth를 1.5에서 2.5로 올려 상단 아이콘들과 굵기를 맞췄습니다!
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
                        padding: isMobile ? "20px 8px" : "24px 12px", // 🌟 패딩을 늘려 숨쉴 공간 확보
                        borderRadius: "14px", cursor: "pointer",
                        backgroundColor: isSel ? theme.panelAlt : "transparent",
                        border: `1.5px solid ${isSel ? theme.accent : theme.border}`,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px",
                        boxShadow: isSel ? `0 6px 20px ${theme.accentGlow}` : "none", // 🌟 그림자 부드럽게
                        transition: "all 0.2s ease"
                      }}
                    >
                      {/* 우측 상단 물음표 버튼 */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setRuleHelpModal(m); }}
                        title={`${m.title} 규칙 설명 보기`}
                        style={{
                          position: "absolute", top: "12px", right: "12px",
                          background: "none", border: "none", padding: 0, // 🌟 배경, 테두리 완전 제거
                          color: theme.textMuted,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                          opacity: 0.7, transition: "opacity 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
                      >
                        <HelpCircle size={18} strokeWidth={2} />
                      </button>

                      {/* 🌟 중앙 SVG 아이콘 (크기 고정 및 색상 연동) */}
                      <div style={{ color: isSel ? theme.accent : theme.text, transition: "color 0.2s ease" }}>
                        {m.icon}
                      </div>
                      
                      {/* 하단 텍스트 영역 */}
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
                {/* 🌟 0. 주인공(수사관) 프로필: 폴라로이드 + 서류철 디자인 톤 통일 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "16px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <UserRound size={22} strokeWidth={2} color={theme.accent} />
                    <span style={{ fontWeight: "900", fontSize: "0.95rem", color: theme.text }}>주인공 (수사관) 프로필</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "16px", width: "100%" }}>
                    {/* A. 주인공 사진 (폴라로이드 형태) */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePortraitSuspectId("pc"); // 🌟 주인공을 식별하는 특수 ID "pc" 전달
                        setShowPortraitModal(true); // 🌟 모달 창 열기!
                      }}
                      title="사진 등록 및 확인 (클릭)"
                      style={{
                        flex: isMobile ? "none" : "0 0 135px",
                        width: isMobile ? "100%" : "auto",
                        maxWidth: isMobile ? "180px" : "none",
                        margin: isMobile ? "0 auto" : "0",
                        backgroundColor: theme.polaroidBg || "#ded7cb", borderRadius: "6px", padding: "8px 8px 12px 8px", color: theme.polaroidText || "#292524",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center", position: "relative",
                        cursor: "pointer" // 🌟 마우스 커서를 클릭 모양으로 변경
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

                    {/* B. 주인공 수사 서류철 */}
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
                    </div>
                  </div>
                </section>

                {/* A. 사건 개요서 (이하 기존 코드 유지) */}
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

               {/* B. 용의자 수사망 */}
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
                              cursor: "pointer"
                            }}
                          >
                            {s.portraitUrl ? (
                              <img src={s.portraitUrl} alt="용의자" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              // 🌟 수정됨: 용의자 카드도 주인공과 동일한 ImageIcon을 쓰도록 변경!
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

                  {/* 🌟 선택된 인물 수사 서류철 (리스트 바깥으로 완전히 분리하여 고정) */}
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

               {/* C. 사건 단서 및 물증 보관소 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  
                  {/* 🌟 1. 깔끔해진 아코디언 헤더 (우측 끝에 화살표만 배치) */}
                  <button 
                    type="button" 
                    onClick={() => setShowEvidence(!showEvidence)}
                    style={{ width: "100%", textAlign: "left", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileSearch size={22} strokeWidth={2} color={theme.accent} />
                      <span style={{ fontWeight: "600", fontSize: "0.95rem", color: theme.text }}>사건 단서 및 물증</span>
                    </div>
                    {/* 우측 끝 화살표 */}
                    <span style={{ color: theme.text, fontSize: "0.85rem", fontWeight: "500" }}>
                      {showEvidence ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* 🌟 2. 열렸을 때만 보이는 단서 리스트 및 추가 버튼 */}
                  {showEvidence && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                      
                      {/* 기존 단서 그리드 */}
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

                      {/* 🌟 3. 새로운 위치: 리스트 맨 아래의 '단서 추가' 넓은 버튼 */}
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

               {/* D. 사건 진상 기밀 봉투 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  
                  {/* 🌟 단서 영역과 100% 동일한 버튼 가이드라인 적용 */}
                  <button 
                    type="button" 
                    onClick={() => setShowHiddenTruth(!showHiddenTruth)} 
                    style={{ width: "100%", textAlign: "left", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* 아이콘만 포인트 색상을 유지하고 글씨는 일반 색상으로 뺍니다 */}
                      <Mailbox size={22} strokeWidth={2} color={theme.accent} />
                      <span style={{ fontWeight: "600", fontSize: "0.95rem", color: theme.text }}>사건 진상 봉투</span>
                    </div>
                    {/* 화살표 역시 일반 텍스트 색상으로 변경 */}
                    <span style={{ color: theme.text, fontSize: "0.85rem", fontWeight: "500" }}>
                      {showHiddenTruth ? "▲" : "▼"}
                    </span>
                  </button>
                  
                  {/* 열렸을 때 나오는 내부 내용 (기존 유지) */}
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

            {/* 🌟 1. 누락되었던 이야기 시작하기 버튼 추가! */}
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
          /* ── [B. 인게임 뷰: 소설 리더 본문 및 팝업/오버레이] ── */
          <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", backgroundColor: theme.bg }}>
            
            {/* 📖 중앙: 소설형 텍스트 뷰어 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
              <div className="serif-text" style={{ flex: 1, overflowY: "auto", padding: isMobile ? "24px 16px 120px 16px" : "40px 40px 140px 40px", display: "flex", flexDirection: "column", gap: "28px", maxWidth: "760px", margin: "0 auto", width: "100%", boxSizing: "border-box", fontSize: "1.08rem", lineHeight: 2.1, color: theme.text }}>
                {(activeSession.messages || []).map((m, idx) => {
                  const isUser = m.role === "user";
                  return (
                    <div key={idx} style={{ alignSelf: "stretch", color: isUser ? theme.accent : theme.text, fontWeight: isUser ? "700" : "400", opacity: 0.95, borderLeft: isUser ? `3px solid ${theme.accent}` : "none", paddingLeft: isUser ? "16px" : "0", fontStyle: isUser ? "italic" : "normal", wordBreak: "keep-all" }}>
                      {m.text}
                    </div>
                  );
                })}
                {isLoading && <div style={{ color: theme.textMuted, fontSize: "0.95rem", fontStyle: "italic", paddingTop: "10px", paddingLeft: "16px", borderLeft: `3px solid ${theme.border}` }}>(사건의 이면이 서술되는 중……)</div>}
              </div>

              <footer style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px max(16px, env(safe-area-inset-bottom))", background: `linear-gradient(to top, ${theme.bg} 80%, transparent)`, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                {activeSession?.suggestedActions?.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", overflowX: "auto", width: "100%", maxWidth: "680px", paddingBottom: "4px" }}>
                    {activeSession.suggestedActions.map((sugg, idx) => (
                      <button key={idx} onClick={() => executeMessage(sugg)} style={{ padding: "8px 14px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "20px", color: theme.text, fontSize: "0.85rem", fontWeight: "700", whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>💡 {sugg}</button>
                    ))}
                  </div>
                )}
                <div style={{ width: "100%", maxWidth: "680px", display: "flex", gap: "8px" }}>
                  <input type="text" value={inputMsg} onChange={e => setInputMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }} placeholder="행동을 선언하거나 대사를 입력하세요..." style={{ flex: 1, padding: "14px 18px", borderRadius: "24px", border: `1.5px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.95rem", outline: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }} />
                  {isLoading ? (
                    <button onClick={() => { if(abortController) abortController.abort(); }} style={{ padding: "0 24px", borderRadius: "24px", backgroundColor: theme.danger, color: "#fff", border: "none", fontWeight: "800", cursor: "pointer" }}>중단</button>
                  ) : (
                    <button onClick={handleSendMessage} disabled={!inputMsg.trim()} style={{ padding: "0 24px", borderRadius: "24px", backgroundColor: inputMsg.trim() ? theme.accent : theme.border, color: "#fff", border: "none", fontWeight: "800", cursor: inputMsg.trim() ? "pointer" : "default", transition: "all 0.2s" }}>전송</button>
                  )}
                </div>
              </footer>
            </div>


            {/* ── 📋 우측 캐릭터 시트 오버레이 패널 ── */}
            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: isMobile ? "100%" : "360px", backgroundColor: theme.sidebar, borderLeft: `1px solid ${theme.border}`, zIndex: 90, transform: isSheetOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column", boxShadow: isSheetOpen ? "-10px 0 30px rgba(0,0,0,0.3)" : "none" }}>
              <div style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.panel, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "900", fontSize: "1.05rem", color: theme.text }}>캐릭터 시트</span>
                <button onClick={() => setIsSheetOpen(false)} style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "1.3rem", cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "10px" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "800", color: theme.success || "#22c55e" }}>신뢰도 (HP)</span>
                    <strong style={{ color: theme.success || "#22c55e", fontSize: "0.95rem" }}>{activeSession.sheet?.hp || 100} / 100</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "10px" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "800", color: theme.warning || "#f59e0b" }}>수사 피로도</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "60px", height: "6px", backgroundColor: "rgba(0,0,0,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${activeSession.sheet?.fatigue || 0}%`, height: "100%", backgroundColor: theme.warning || "#f59e0b", transition: "width 0.3s" }} />
                      </div>
                      <strong style={{ color: theme.warning || "#f59e0b", fontSize: "0.9rem" }}>{activeSession.sheet?.fatigue || 0}%</strong>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: "800", color: theme.textMuted, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}><FileSearch size={14} strokeWidth={2.5} /> 사건 파일 & 물증 ({(activeSession.sheet?.handouts || []).length}건)</div>
                  {(!activeSession.sheet?.handouts || activeSession.sheet.handouts.length === 0) ? (
                    <div style={{ textAlign: "center", padding: "20px", fontSize: "0.75rem", color: theme.textMuted, border: `1px dashed ${theme.border}`, borderRadius: "10px" }}>확보된 단서가 없습니다.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {activeSession.sheet.handouts.map((h, idx) => {
                        const isEven = idx % 2 === 0;
                        return (
                          <div key={idx} style={{ backgroundColor: isEven ? (isDarkMode ? "#0c4a6e" : "#e0f2fe") : (isDarkMode ? "#4c1d95" : "#f3e8ff"), padding: "12px 14px", borderRadius: "6px", position: "relative", borderLeft: `4px solid ${isEven ? (isDarkMode ? "#0284c7" : "#0284c7") : (isDarkMode ? "#7c3aed" : "#9333ea")}`, boxShadow: "0 4px 10px rgba(0,0,0,0.1)", color: isDarkMode ? "#e0e7ff" : "#0f172a" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                              <span style={{ fontWeight: "900", fontSize: "0.85rem", color: isEven ? (isDarkMode ? "#38bdf8" : "#0369a1") : (isDarkMode ? "#c084fc" : "#6b21a8") }}>{h.name || h.title}</span>
                              {h.revealed ? <LockOpen size={14} strokeWidth={2.5} style={{ opacity: 0.6 }} /> : <Lock size={14} strokeWidth={2.5} style={{ opacity: 0.4 }} />}
                            </div>
                            <div style={{ fontSize: "0.75rem", lineHeight: "1.5", fontWeight: "500", opacity: 0.9, whiteSpace: "pre-wrap" }}>{h.revealed ? (h.secret || h.overview) : h.overview}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

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
            { key: "lounge", icon: <LayoutGrid size={20} strokeWidth={2.5} />, label: "탐색" },
            { key: "library", icon: <LibraryBig size={20} strokeWidth={2.5} />, label: "서재" },
            { key: "lobby", icon: <PenTool size={20} strokeWidth={2.5} />, label: "창작" },
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
                  cursor: "pointer", gap: "4px", // gap 증가
                  borderRight: isLast ? "none" : `1px solid ${theme.border}`,
                  backgroundColor: isSelected ? (isDarkMode ? "rgba(235, 227, 218, 0.12)" : "rgba(120, 105, 90, 0.12)") : "transparent",
                  color: isSelected ? theme.accent : theme.textMuted,
                  transition: "all 0.2s"
                }}
              >
                {/* SVG 아이콘 적용 */}
                <div style={{ transform: isSelected ? "scale(1.15)" : "scale(1)", transition: "transform 0.2s", display: "flex", alignItems: "center" }}>
                  {tab.icon}
                </div>
                <span style={{ fontSize: "0.65rem", fontWeight: isSelected ? "800" : "600" }}>{tab.label}</span>
              </div>
            );
          })}
        </nav>
      )}

      {/* ── 🖼️ 초상화 모달 (크게 보기 + 연필 아이콘 업로드) ── */}
      {showPortraitModal && (() => {
        // 🌟 클릭한 사람이 주인공(pc)인지 확인합니다.
        const isPc = activePortraitSuspectId === "pc";
        let target;

        // 주인공일 경우와 용의자일 경우 정보를 각각 다르게 불러옵니다.
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
              style={{ ...GLASS_STYLE, width: "100%", maxWidth: "380px", backgroundColor: theme.panel, border: `1.5px solid ${theme.border}`, borderRadius: "18px", padding: "20px", color: theme.text, display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
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
                        // 🌟 누구의 사진을 바꾸는 것인지 판별하여 올바른 곳에 저장합니다.
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

      {/* ── 📄 시나리오 텍스트 붙여넣기 모달 ── */}
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

      {/* 🌟 4. 룰 모드 가이드 모달 */}
      {ruleHelpModal && (
        <div onClick={() => setRuleHelpModal(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 160, padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} className="glass-card" style={{ width: "100%", maxWidth: "440px", padding: "22px", borderRadius: "16px", backgroundColor: theme.panel, color: theme.text, display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
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
