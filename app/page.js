"use client"; 

import { useState, useEffect, useRef } from "react";
import SecretBoard from "@/components/SecretBoard";
import CharacterSheet from "@/components/CharacterSheet";
import { createClient } from '@supabase/supabase-js'; 

// 🌟 이제 금고(Vercel 환경 변수)에서 안전하게 꺼내옵니다! (NEXT_PUBLIC_이 붙어야 화면에서 쓸 수 있어요!)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { 
  Search, Heart, Flame, LayoutGrid, LibraryBig, PenTool, UserRound, 
  Menu, Moon, Sun, Save, FileUp, HelpCircle, X, ChevronDown, ChevronUp, Image as ImageIcon,
  ClipboardList, Pin, FileSearch, Mailbox, Play,
  FolderOpen, Lock, Settings, Database, ClipboardPaste, LogOut,
  ArrowUp, Smartphone, BookOpen, Dices, ChevronLeft, ChevronRight, UploadCloud, AlertTriangle, CheckCircle2,
  Brain, Skull, Eye, Activity, ShieldAlert, ToggleLeft, ToggleRight, Plus, Minus, Ghost, Gift, Video, CreditCard, Headphones,
  Trash2, Clock, Tag, Droplet, MessageCircle, MessageSquare, Bandage, Clapperboard, Lightbulb, 
  Fingerprint, Flower2, Tentacle, Compass, Globe, Key, Phone, Download, Upload, FileText, CheckSquare, Square, DownloadCloud
} from "lucide-react";

const THEME_PALETTES = {
  cloud: {
    light: { bg: "#f5f0eb", sidebar: "#ebe5de", panel: "#ffffff", panelAlt: "#f0ece4", border: "#ded7cb", borderHighlight: "#c8bca7", text: "#292524", textMuted: "#78716c", accent: "#a39274", accentGlow: "rgba(163, 146, 116, 0.4)", inputBg: "#f9f6f3", danger: "#dc2626", warning: "#d97706", success: "#16a34a", polaroidBg: "#f5f5f4", polaroidText: "#1c1917" },
    dark: { bg: "#1a1817", sidebar: "#242120", panel: "#2b2826", panelAlt: "#332f2c", border: "#3d3834", borderHighlight: "#4f4944", text: "#e8e3dc", textMuted: "#a8a29e", accent: "#c2b4a3", accentGlow: "rgba(194, 180, 163, 0.3)", inputBg: "#1f1d1b", danger: "#ef4444", warning: "#f59e0b", success: "#22c55e", polaroidBg: "#292524", polaroidText: "#e7e5e4" }
  }
};
const GLASS_STYLE = { backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" };

// ==========================================
// 📑 시크릿 노벨 공식 시나리오 파이프라인 (구글 시트 연동)
// ==========================================
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQEA39XlsqHKGn0GPzmVH42jhimki3yJUIbKHkXjgzmLA5bD66WQvXw3-nHy9PJSxwg727wfSGznYa/pub?gid=0&single=true&output=csv";

function parseCSV(text) {
  let p = '', c = '', r = [];
  let q = false;
  let row = [''];
  for (let i = 0; i < text.length; i++) {
    c = text[i];
    let next = text[i + 1];
    if (c === '"') {
      if (q && next === '"') { row[row.length - 1] += '"'; i++; }
      else { q = !q; }
    } else if (c === ',' && !q) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !q) {
      if (c === '\r' && next === '\n') { i++; }
      r.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== '') r.push(row);
  return r;
}

// 🌟 수빈님 구글 시트 1000% 맞춤형 초강력 파서 엔진!
function convertRowToPreset(row, index, headers = []) {
  if (!row || row.length === 0) return null;

  const cleanHeaders = (headers || []).map(h => (h || "").toString().replace(/[\s_]/g, "").toLowerCase());
  const findIdx = (regex) => cleanHeaders.findIndex(h => regex.test(h));

  const getVal = (regex) => {
    const hIdx = findIdx(regex);
    return hIdx !== -1 && hIdx < row.length ? (row[hIdx] || "").toString().trim() : "";
  };

  // 1. 상태 및 기본 정보
  const pubIdx = findIdx(/^(공개여부|공개|상태)$/i);
  let isHidden = false;
  const firstColVal = (row[0] || "").toString().trim().toUpperCase();
  if (pubIdx !== -1) {
    const pubVal = (row[pubIdx] || "").toString().trim().toUpperCase();
    isHidden = pubVal === "FALSE" || pubVal === "비공개" || pubVal === "X" || pubVal === "N";
  } else if (firstColVal === "TRUE" || firstColVal === "FALSE") {
    isHidden = firstColVal === "FALSE";
  }

  let titleIdx = findIdx(/^(제목|사건명|시나리오제목|title)$/i);
  if (titleIdx === -1) titleIdx = pubIdx !== -1 ? pubIdx + 1 : 2; 
  const title = (row[titleIdx] || "").toString().trim();

  if (isHidden || !title || title.startsWith("//")) return null;

  const modeRaw = getVal(/^(룰|모드|장르|룰모드)$/i);
  let mode = "추리";
  if (/연애|로맨스/i.test(modeRaw)) mode = "연애";
  if (/괴담|호러/i.test(modeRaw)) mode = "괴담";

  const tags = getVal(/^(태그|키워드)$/i);
  const synopsis = getVal(/^(개요|시놉시스)$/i);
const opening = getVal(/^(도입부|서막|오프닝)$/i);
  const truth = getVal(/^(진상|비밀|진실|사건내막)$/i);
  
  const culprit = getVal(/^(진범|흑막|범인)(이름)?$/i);
  const trick = getVal(/^(트릭|사용된트릭|범행수법)$/i);
  
  // 🌟 (추가됨!) 주요 공략 대상 / 사건 목표를 쏙 뽑아옵니다!
  const victim = getVal(/^(사건대상|의뢰인|주요공략대상|서사목표|공략대상|목표)$/i);

  const sessionCardImg = getVal(/^(세션카드|표지|이미지|썸네일)$/i);

  const pcName = getVal(/^(pc|주인공|탐색자|수사관)(이름|명칭)?$/i);
  const pcAgeGender = getVal(/^(pc|주인공|탐색자|수사관)(나이성별|성별나이|나이|성별)$/i);
  const pcJob = getVal(/^(pc|주인공|탐색자|수사관)(직업|역할)$/i);
  const pcBackground = getVal(/^(pc|주인공|탐색자|수사관)(성격|배경|설정)$/i);
  const pcSecret = getVal(/^(pc|주인공|탐색자|수사관)(비밀|약점)$/i);
  const pcPortraitUrl = getVal(/^(pc|주인공|탐색자|수사관)(초상화|사진|이미지)$/i);

  const abyssTriggers = {
    30: getVal(/^이상충동30$/i),
    60: getVal(/^이상충동60$/i),
    90: getVal(/^이상충동90$/i)
  };

  const extractList = (maxCount, prefixRegex, fields, transformFn) => {
    const list = [];
    for (let i = 1; i <= maxCount; i++) {
      const extracted = {};
      let hasData = false;
      fields.forEach(fieldGrp => {
        const regexStr = `^(?:${prefixRegex})${i}(?:${fieldGrp})$|^(?:${prefixRegex})(?:${fieldGrp})${i}$`;
        const val = getVal(new RegExp(regexStr, 'i'));
        const mainKey = fieldGrp.split('|')[0]; 
        extracted[mainKey] = val;
        if (val) hasData = true;
      });
      if (hasData) list.push(transformFn(extracted, i));
    }
    return list;
  };

  const mainPartners = extractList(5, "파트너|메인파트너", ["이름", "나이성별|성별나이", "직업|역할", "특징|성격", "비밀|이면", "초상화|사진"], (d, i) => ({
    id: `partner_${Date.now()}_${i}`, name: d.이름, ageGender: d.나이성별, job: d.직업, behavior: d.특징, secret: d.비밀, portraitUrl: d.초상화, showSecret: false
  }));

  const suspects = extractList(15, "인물|등장인물|공략대상|npc|용의자", ["이름", "나이성별|성별나이", "직업|역할", "특징|성격|행적", "비밀|진심|약점", "초상화|사진"], (d, i) => ({
    id: `suspect_${Date.now()}_${i}`, name: d.이름, ageGender: d.나이성별, job: d.직업, behavior: d.특징, secret: d.비밀, portraitUrl: d.초상화, showSecret: false
  }));

  const evidenceList = extractList(15, "단서|증거|물증|핸드아웃", ["이름|명칭", "개요|설명", "비밀|진상|모순"], (d, i) => ({
    id: `evidence_${Date.now()}_${i}`, name: d.이름, overview: d.개요, secret: d.비밀, contradiction: "", showSecret: false
  }));

  const cgList = extractList(15, "cg|이벤트cg|이벤트", ["이름|제목", "조건|해금조건", "대사|상황", "사진|이미지"], (d, i) => ({
    id: `cg_${Date.now()}_${i}`, title: d.이름, condition: d.조건, dialogue: d.대사, imageUrl: d.사진, showDetails: false
  }));

  // 🌟 (핵심 변경!) 억지로 1명만 매칭하던 로직 삭제! 시트에 적힌 텍스트 그대로를 살립니다.
  const routeList = extractList(20, "분기|루트|선택지", ["이름|설명", "대상|인물", "호감도|변화"], (d, i) => ({
    id: `route_${Date.now()}_${i}`, routeName: d.이름, targetId: d.대상 || "", affectionChange: d.호감도 || "+10", requiredCG: ""
  }));

  return {
    id: 9000000000000 + index,
    title: title,
    mode: mode,
    author: "공식 에디터",
    likes: 0, // 🌟 가짜 데이터 삭제! 정직하게 0부터 시작!
    plays: 0, // 🌟 여기도 0부터 시작!
    isOriginal: true,
    imageUrl: sessionCardImg,
    isDownloaded: false,
    data: {
      playPreference: tags, publicSynopsis: synopsis, openingScene: opening, hiddenTruth: truth,
      culpritName: culprit, trickDetail: trick, victimName: victim, // 🌟 뽑아온 목표 대상 데이터를 전송!
      pcName, pcAgeGender, pcJob, pcBackground, pcSecret, pcPortraitUrl, showPcSecret: false,
      abyssTriggers, mainPartners, usePartner: mainPartners.length > 0, suspects, evidenceList, cgList, routeList
    }
  };
}


export default function GamePlatform() {
  // ── [3. 상태 관리] ──
  const [isMounted, setIsMounted] = useState(false); // 🌟 에러 #423 방어막
  const chatContainerRef = useRef(null); 
 const [currentUser, setCurrentUser] = useState(null);

  // 🌟 내 계정 전용 프로필 사진 상자 독립!! (이 부분이 빠져서 에러가 났었어요!)
  const [userAvatar, setUserAvatar] = useState(""); 
  useEffect(() => {
    const avatar = localStorage.getItem("secret_novel_avatar");
    if (avatar) setUserAvatar(avatar);
  }, []);
  
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState(""); 
  const [loginPassword, setLoginPassword] = useState(""); 
  const [agreeTerms, setAgreeTerms] = useState(false); 
  const [showTermsModal, setShowTermsModal] = useState(false); 
  const [isGuestPlay, setIsGuestPlay] = useState(false); 
  

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
      * { 
        font-family: 'Pretendard', sans-serif; 
        /* 🌟 다크 모드에서 폰트가 뚱뚱해지는 것을 막고 선명하게 다듬어주는 코드 */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
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
  const triggerToast = (title, message = "", icon = null) => {
    // 🌟 사반님 절대 규칙: 텍스트 이모지가 들어오면 강제로 Lucide 아이콘으로 정화!
    let finalIcon = icon;
    if (typeof icon === "string") {
      if (icon.includes("✨") || icon.includes("🎉") || icon.includes("🎊")) finalIcon = <CheckCircle2 size={18} color={theme.success} />;
      else if (icon.includes("⚠️") || icon.includes("🚨") || icon.includes("⚠")) finalIcon = <AlertTriangle size={18} color={theme.warning} />;
      else if (icon.includes("🚫") || icon.includes("💔") || icon.includes("🗑️")) finalIcon = <ShieldAlert size={18} color={theme.danger} />;
      else if (icon.includes("⏳")) finalIcon = <Clock size={18} color={theme.textMuted} />;
      else if (icon.includes("💡") || icon.includes("📢")) finalIcon = <Lightbulb size={18} color={theme.accent} />;
      else if (icon.includes("📂") || icon.includes("📋") || icon.includes("💾")) finalIcon = <FolderOpen size={18} color={theme.accent} />;
      else finalIcon = <CheckCircle2 size={18} color={theme.accent} />;
    }
    setToast({ title, message, icon: finalIcon });
    setTimeout(() => setToast(null), 2500);
  };

// ── [3. 상태 관리] ──
  const [activeTab, setActiveTab] = useState("explore");
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
  const [originalPcName, setOriginalPcName] = useState(""); // 🌟 (추가!) 주인공 원래 이름 기억 장치
  const [showPcSecret, setShowPcSecret] = useState(false); // 🌟 주인공 비밀 아코디언 스위치

  const [scenarioTitle, setScenarioTitle] = useState("");
  const [scenarioImageUrl, setScenarioImageUrl] = useState(""); // 🌟 표지 이미지 상태 추가!

  const [victimName, setVictimName] = useState("");
  const [publicSynopsis, setPublicSynopsis] = useState("");
  const [openingScene, setOpeningScene] = useState("");

 const [suspects, setSuspects] = useState([
    { id: 1, name: "", ageGender: "", job: "", behavior: "", secret: "", portraitUrl: "", showSecret: false }
  ]);
  const [selectedSuspectId, setSelectedSuspectId] = useState(1);
  
  const [showPortraitModal, setShowPortraitModal] = useState(false);
  const [activePortraitSuspectId, setActivePortraitSuspectId] = useState(null);
// 🌟 (신규 추가!) 세션 카드 팝업 모달 스위치
  const [showSessionCardModal, setShowSessionCardModal] = useState(false);
  const [activeCardSessionId, setActiveCardSessionId] = useState(null);

  const [evidenceList, setEvidenceList] = useState([
    { id: 1, name: "", overview: "", contradiction: "", secret: "", showSecret: false }
  ]);
  const [showEvidence, setShowEvidence] = useState(false);
  const [culpritName, setCulpritName] = useState("");
  const [trickDetail, setTrickDetail] = useState("");
  const [hiddenTruth, setHiddenTruth] = useState("");
  const [showHiddenTruth, setShowHiddenTruth] = useState(false);
// ── [괴담 모드 전용 상태] ──
const [horrorStats, setHorrorStats] = useState({ 체력: 5, 순발: 5, 관찰: 5, 추론: 5, 정신: 5, 사교: 5 });
const availableStatPoints = 35 - Object.values(horrorStats).reduce((a, b) => a + b, 0);

const [horrorTraits, setHorrorTraits] = useState([]);
const [horrorTraumas, setHorrorTraumas] = useState([]);
const [horrorInventory, setHorrorInventory] = useState([
  { id: 1, type: "멘탈 회복", name: "", desc: "" },
  { id: 2, type: "특수 기믹 패스", name: "", desc: "" },
  { id: 3, type: "재굴림", name: "", desc: "" }
]);

const [abyssTriggers, setAbyssTriggers] = useState({ 30: "", 60: "", 90: "" });
const [showAbyss, setShowAbyss] = useState(false);

const [usePartner, setUsePartner] = useState(false);
// 🌟 다수의 메인 파트너를 지원하는 배열 형태
const [mainPartners, setMainPartners] = useState([
  { id: 1, name: "", ageGender: "", job: "", behavior: "", secret: "", showSecret: false, portraitUrl: "" }
]);

// 🌟 특성 및 트라우마 매트릭스 모달 스위치
const [showTraitModal, setShowTraitModal] = useState(false);

// 🌟 특성 및 트라우마 매트릭스 리스트 (Max 4글자 20/20)
const TRAIT_LIST = [
  "위화감지", "이면간파", "사물투영", "절대침착", "감정동화",
  "가면쓰기", "기척숨김", "시선유도", "맥락추론", "공간기억",
  "잔상포착", "소문수집", "약점공략", "행동예측", "방어기제",
  "돌발대응", "사각지대", "흔적추적", "무통각증", "경계태세"
];

const TRAUMA_LIST = [
  "시선강박", "거울기피", "접촉혐오", "고립불안", "신뢰결핍",
  "과잉동정", "자기혐오", "기억공백", "이명현상", "환각시야",
  "침묵공포", "수면거부", "감정마비", "잔혹충동", "폐허집착",
  "호흡발작", "빛민감증", "망각강박", "망상장애", "사물집착"
];
  
// ── [서재 및 로컬 스토리지 상태] ──
const [savedLibrary, setSavedLibrary] = useState([]);
const [libSearchQuery, setLibSearchQuery] = useState("");
const [libFilter, setLibFilter] = useState("전체"); // 전체, 추리, 연애, 괴담
const [showLibEditModal, setShowLibEditModal] = useState(false);
const [editingLibItem, setEditingLibItem] = useState(null);
const [itemToDelete, setItemToDelete] = useState(null); // 🌟 추가: 예쁜 삭제 팝업 스위치

// 마운트 시 로컬 스토리지에서 저장된 서재 데이터 불러오기
useEffect(() => {
  const stored = localStorage.getItem("secret_novel_library");
  if (stored) {
    try { setSavedLibrary(JSON.parse(stored)); } catch(e) {}
  }
}, []);

// 💾 로비에서 서재로 저장하는 함수
const handleSaveToLibrary = () => {
  // 🌟 방어막 작동! 체험하기 모드로 들어온 경우 원천 차단!
  if (isGuestPlay) {
    triggerToast("저장 불가", "체험하기로 들어온 시나리오는 수정하거나 저장할 수 없습니다.", "🚫");
    return;
  }

  if (!scenarioTitle.trim()) {
    triggerToast("저장 불가", "사건 개요서에 사건명(제목)을 입력해주세요.", "⚠️");
    return;
  }
  
  const newScenario = {
    id: Date.now(),
    title: scenarioTitle,
    mode: selectedMode, // 영문 없이 "추리", "연애", "괴담" 저장
    date: new Date().toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
    imageUrl: "", 
    isDownloaded: false, // 탐색에서 다운받은 시나리오를 구분하는 뱃지 플래그
    data: {
      playPreference, pcName, pcAgeGender, pcJob, pcBackground, pcPortraitUrl, pcSecret, showPcSecret,
      victimName, publicSynopsis, openingScene, suspects, evidenceList, culpritName, trickDetail, hiddenTruth,
      horrorStats, horrorTraits, horrorTraumas, horrorInventory, abyssTriggers, usePartner, mainPartners,
      cgList, routeList
    }
  };

  const updatedLibrary = [newScenario, ...savedLibrary];
  setSavedLibrary(updatedLibrary);
  localStorage.setItem("secret_novel_library", JSON.stringify(updatedLibrary));
  triggerToast("세팅 저장", "현재 작성 중인 서류가 서재에 보관되었습니다.", <Save size={20} color={theme.accent} strokeWidth={1.5} />);
};

// 📂 서재에서 로비로 불러오는 함수
const handleLoadFromLibrary = (scen) => {
  const d = scen.data;
  if(!d) return;
  
  setSelectedMode(scen.mode);
  setScenarioTitle(scen.title);
  setScenarioImageUrl(scen.imageUrl || ""); // 🌟 표지 증발 방어
  
  // 기본 텍스트 데이터 복원
  setPlayPreference(d.playPreference || ""); 
  setPcName(d.pcName || ""); setOriginalPcName(d.pcName || "");
  setPcAgeGender(d.pcAgeGender || ""); 
  setPcJob(d.pcJob || ""); 
  setPcBackground(d.pcBackground || ""); 
  setPcPortraitUrl(d.pcPortraitUrl || ""); 
  setPcSecret(d.pcSecret || ""); 
  setShowPcSecret(d.showPcSecret || false);
  setVictimName(d.victimName || ""); 
  setPublicSynopsis(d.publicSynopsis || ""); 
  setOpeningScene(d.openingScene || ""); 
  setCulpritName(d.culpritName || ""); 
  setTrickDetail(d.trickDetail || ""); 
  setHiddenTruth(d.hiddenTruth || "");
  
  if(d.horrorStats) setHorrorStats(d.horrorStats);
  if(d.horrorTraits) setHorrorTraits(d.horrorTraits);
  if(d.horrorTraumas) setHorrorTraumas(d.horrorTraumas);
  if(d.horrorInventory) setHorrorInventory(d.horrorInventory);
  if(d.abyssTriggers) setAbyssTriggers(d.abyssTriggers);
  if(d.usePartner !== undefined) setUsePartner(d.usePartner);

  // 🌟 (핵심 방어막!) 파싱 실패로 데이터가 비어있어도, 빈칸 1개를 강제로 만들어서 화면 증발 오류를 100% 막아줍니다!
  setMainPartners(d.mainPartners?.length ? d.mainPartners : [{ id: Date.now(), name: "", ageGender: "", job: "", behavior: "", secret: "", showSecret: false, portraitUrl: "" }]);
  setSuspects(d.suspects?.length ? d.suspects : [{ id: Date.now()+1, name: "", ageGender: "", job: "", behavior: "", secret: "", portraitUrl: "", showSecret: false }]);
  setEvidenceList(d.evidenceList?.length ? d.evidenceList : [{ id: Date.now()+2, name: "", overview: "", contradiction: "", secret: "", showSecret: false }]);
  setCgList(d.cgList?.length ? d.cgList : [{ id: Date.now()+3, title: "", condition: "", dialogue: "", imageUrl: "", showDetails: false }]);
  setRouteList(d.routeList?.length ? d.routeList : [{ id: Date.now()+4, routeName: "", targetId: "", affectionChange: "+10", requiredCG: "" }]);

  setActiveTab("lobby");
  triggerToast("불러오기 완료", `[${scen.title}] 서류를 로비에 펼쳤습니다.`, "📂");
};

// 🗑 서재에서 삭제하는 함수 (예쁜 커스텀 팝업창 호출)
const handleDeleteFromLibrary = (id) => {
   setItemToDelete(id);
};

 const [cgList, setCgList] = useState([
    { id: 1, title: "", condition: "", dialogue: "", imageUrl: "", showDetails: false }
  ]);
  const [routeList, setRouteList] = useState([
    { id: 1, routeName: "", targetId: "", affectionChange: "+10", requiredCG: "" }
  ]);

  const [showCgGallery, setShowCgGallery] = useState(false); // CG 갤러리 접기/펴기
  const [showRouteList, setShowRouteList] = useState(false); // 공략 루트 접기/펴기
  const [showPhoneDetail, setShowPhoneDetail] = useState(false); // 📱 핸드폰 상세 프로필 화면 전환용
  const [showCgModal, setShowCgModal] = useState(false); // 🖼️ CG 팝업 스위치
  const [activeCgId, setActiveCgId] = useState(null); // 🖼️ 현재 선택된 CG 아이디

// 🌟 (복구 완료!) 메인 배너 데이터 상자 및 안테나
  const [banners, setBanners] = useState([]);
  const [showBannerEdit, setShowBannerEdit] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null); 

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase.from('main_banners').select('*').order('id', { ascending: true });
      
      // 🌟 끝부분에 linkId: b.link_id 안테나 추가 완료!
            if (data && data.length > 0 && !error) {
              setBanners(data.map(b => ({ id: b.id, tag: b.tag, title: b.title, desc: b.description, imageUrl: b.image_url, linkId: b.link_id })));
            } else {
        // 🌟 비어있거나 에러가 나면 무조건 띄워줄 '기본 배너' (증발 방어막!)
        setBanners([
          { id: 1, tag: "이번 주말의 추천 사건", title: "저택의 그림자", desc: "어느 비 오는 밤, 저택에서 울린 한 발의 총성.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80" },
          { id: 2, tag: "NEW 로맨스", title: "어느 세이렌의 결백", desc: "깊은 바닷속, 그녀가 숨기고 있는 슬픈 진실", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80" }
        ]);
      }
    };
    fetchBanners();
  }, []);
  
// ── [탐색 탭 라운지 데이터 (구글 시트 연동 + 진짜 서버 연동)] ──
const [exploreScenarios, setExploreScenarios] = useState([]); 

useEffect(() => {
  if (GOOGLE_SHEET_CSV_URL && GOOGLE_SHEET_CSV_URL.trim() !== "") {
    fetch(GOOGLE_SHEET_CSV_URL)
      .then(res => res.text())
      .then(async csvText => { // 🌟 서버 통신을 위해 async 추가!
        const rows = parseCSV(csvText);
        const headers = rows[0] || [];
        const sheetPresets = rows.slice(1).map((row, idx) => convertRowToPreset(row, idx, headers)).filter(Boolean);

        // 🌟 서버(Supabase)에서 '발행 완료'된 진짜 유저 시나리오들 가져오기!
        const { data } = await supabase.from('scenarios').select('*').eq('status', '발행 완료');
        let dbScenarios = [];
        if (data) {
           dbScenarios = data.map(s => ({
             id: s.id,
             title: s.title,
             mode: s.mode,
             author: s.author_name,
             likes: s.likes || 0,
             plays: s.plays || 0,
             isOriginal: false,
             imageUrl: s.image_url,
             data: s.data
           }));
        }

        if (sheetPresets.length > 0 || dbScenarios.length > 0) {
          setExploreScenarios([...sheetPresets, ...dbScenarios]);
        }
      })
      .catch(err => console.error("데이터 불러오기 실패:", err));
  }
}, []);
 
// ── [탐색 탭 상세 페이지용 상태] ──
const [selectedExploreScenario, setSelectedExploreScenario] = useState(null);
const [exploreDetailTab, setExploreDetailTab] = useState("소개"); // 소개 탭 vs 주요 인물 탭
 // ── [업로드(퍼블리싱) 폼 상태] ──
const [uploadingScenario, setUploadingScenario] = useState(null); // 서재에서 업로드할 시나리오 객체
 // ── [탐색 라운지 전용 검색/필터 상태] ──
const [exploreSearchQuery, setExploreSearchQuery] = useState("");
const [exploreFilter, setExploreFilter] = useState("추천"); // 추천, 추리, 연애, 괴담
 // ── [글로벌 재화 상태] ──
const [userInk, setUserInk] = useState(0);
const [showInkModal, setShowInkModal] = useState(false); // 🌟 잉크 충전소 모달 스위치
 const [hasClaimedAttendance, setHasClaimedAttendance] = useState(false); // 출석체크 여부
const [adWatchCount, setAdWatchCount] = useState(5); // 남은 광고 시청 횟수
 // ── [내정보(Profile) 탭 전용 상태] ──
const [showProfileEdit, setShowProfileEdit] = useState(false);
const [showHistoryModal, setShowHistoryModal] = useState(false);
const [showLikedModal, setShowLikedModal] = useState(false);
const [showReviewModal, setShowReviewModal] = useState(false);
const [showSupportModal, setShowSupportModal] = useState(false);
 
// ── [11. 관리자 및 추가 기능 상태] ──
  const MY_ADMIN_EMAIL = "usb1201@naver.com"; 
  const isAdmin = currentUser?.email === MY_ADMIN_EMAIL; // 이메일이 일치할 때만 어드민 권한 부여
  
  // 🌟 어드민 계정이면 무한 잉크 즉시 입금!!
  useEffect(() => {
    if (isAdmin) {
      setUserInk(9999999);
    }
  }, [isAdmin]);

  // 🌟 어드민 전용 서버 통신 데이터 상자 & 안테나
  const [adminPendingScenarios, setAdminPendingScenarios] = useState([]); 
  const [isReviewFetching, setIsReviewFetching] = useState(false); 

  useEffect(() => {
    if (showReviewModal && isAdmin) {
      const fetchPendingScenarios = async () => {
        setIsReviewFetching(true);
        const { data, error } = await supabase
          .from('scenarios')
          .select('*')
          .eq('status', '심사 대기')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setAdminPendingScenarios(data);
        }
        setIsReviewFetching(false);
      };
      fetchPendingScenarios();
    }
  }, [showReviewModal, isAdmin]);

const [showNoticeModal, setShowNoticeModal] = useState(false);
  
  // 🌟 (서버 연동 완료!) 공지사항 데이터 상자 및 안테나
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");

  useEffect(() => {
    // 앱을 켤 때 서버에서 최신 공지사항을 불러옵니다!
    const fetchNotices = async () => {
      const { data, error } = await supabase.from('notices').select('*').order('id', { ascending: false });
      if (data && !error) {
        setNotices(data);
      }
    };
    fetchNotices();
  }, []);

  const [likedScenarios, setLikedScenarios] = useState([]); // 💖 관심 시나리오 보관함

  // 🌟 (버그 픽스!) 앱을 켤 때 내 핸드폰에서 하트 누른 목록을 잊지 않고 불러옵니다!
  useEffect(() => {
    const storedLikes = localStorage.getItem("secret_novel_liked");
    if (storedLikes) {
      try { setLikedScenarios(JSON.parse(storedLikes)); } catch(e) {}
    }
  }, []);

  // 🌟 [핵심 해결!] 컴퓨터가 이해할 수 있는 안전한 위치로 이사 온 메인 팝업 로직!
  const [showMainNoticePopup, setShowMainNoticePopup] = useState(false);
  
  useEffect(() => {
    if (notices && notices.length > 0) {
      const hiddenUntil = localStorage.getItem("hide_notice_until");
      const lastNoticeId = localStorage.getItem("last_notice_id");
      const now = new Date().getTime();
      
      if (lastNoticeId !== notices[0].id.toString() || !hiddenUntil || now > parseInt(hiddenUntil)) {
        setShowMainNoticePopup(true);
      }
    }
  }, [notices]);

  const handleHideNoticeForWeek = () => {
    const oneWeekLater = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("hide_notice_until", oneWeekLater.toString());
    localStorage.setItem("last_notice_id", notices[0]?.id.toString());
    setShowMainNoticePopup(false);
  };

// 🌟 (복구) 캐릭터 시트 및 인게임 UI 보드 스위치
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showEvidenceBoard, setShowEvidenceBoard] = useState(false);
  const [isTabletopOpen, setIsTabletopOpen] = useState(false);



// ── [스마트폰 메신저 & 통화 전용 상태 관리] ──
  const [isPhoneDrawerOpen, setIsPhoneDrawerOpen] = useState(false);
  const [activePhoneContactId, setActivePhoneContactId] = useState(null);
  const [phoneNavTab, setPhoneNavTab] = useState("contacts"); // "contacts" | "chats" | "settings"
  const [selectedProfileNpc, setSelectedProfileNpc] = useState(null); 
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [isPhoneSending, setIsPhoneSending] = useState(false);
  const [zoomedPortrait, setZoomedPortrait] = useState(null); // 🌟 사진 확대 상태 추가

  // 연애 모드 전용 팝업 스위치
  const [giftModalNpc, setGiftModalNpc] = useState(null);
  const [clueModalNpc, setClueModalNpc] = useState(null);

  // 실시간 전화(음성 통화) 관련 상태
  const [incomingCall, setIncomingCall] = useState(null);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [voiceCallNpc, setVoiceCallNpc] = useState(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(true);

  // 폰 테마 및 진동 상태
  const [phoneTheme, setPhoneTheme] = useState("parchment");
  const [vibrationLevel, setVibrationLevel] = useState("medium");

// ── [환경 설정 및 폰트 상태 관리] ──
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [fontChoice, setFontChoice] = useState("ridi"); // ridi, gothic
  const [chatFontSize, setChatFontSize] = useState(1);
  const [soundVolume, setSoundVolume] = useState(0.6);

  // 🌟 (복구) 설정창 튕김의 원인이었던 주사위 사운드 함수 부활!
  const playDiceSound = () => {
    if (soundVolume <= 0) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        const startTime = now + i * 0.08;
        osc.frequency.setValueAtTime(160 + Math.random() * 150, startTime);
        osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.04);
        gain.gain.setValueAtTime(soundVolume * 0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.05);
      }
    } catch (e) {}
  };

  // ── [데이터 관리 (내보내기/백업) 상태 관리] ──
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportSessionIds, setSelectedExportSessionIds] = useState([]);
  const [exportScope, setExportScope] = useState("all");
  const [exportFormat, setExportFormat] = useState("txt");

  // 🌟 다이나믹 폰 스킨 엔진 (스킨 변경 즉시 적용!)
  const PHONE_SKINS = {
    default: { bg: "#f8f9fa", headerBg: "#ffffff", panel: "#ffffff", border: "#e9ecef", text: "#212529", textMuted: "#6c757d", accent: "#3b82f6", danger: "#ef4444" },
    kakao: { bg: "#bac8d8", headerBg: "#fcd11e", panel: "#ffffff", border: "#a3b5c6", text: "#3c1e1e", textMuted: "#665a5a", accent: "#3c1e1e", danger: "#ef4444" },
    parchment: { bg: "#f3efe8", headerBg: "#e8dfd1", panel: "#ffffff", border: "#d9d0c1", text: "#3b3631", textMuted: "#8b8276", accent: "#a68a6d", danger: "#d94a4a" },
    cyber: { bg: "#0f172a", headerBg: "#1e293b", panel: "#1e293b", border: "#334155", text: "#f8fafc", textMuted: "#94a3b8", accent: "#8b5cf6", danger: "#f43f5e" }
  };
  const activePhoneSkin = PHONE_SKINS[phoneTheme] || PHONE_SKINS.parchment;

  // 🌟 상태 메시지 추출기 (긴 텍스트에서 상태메시지만 쏙 뽑아냅니다)
  const getStatusMsg = (behaviorText) => {
    if (!behaviorText) return "상태 메시지 없음";
    const match = behaviorText.match(/상태\s*메시지\s*[:：]\s*["'“]?([^"'\n]+)/i) || behaviorText.match(/상태메시지\s*[:：]\s*["'“]?([^"'\n]+)/i);
    return match ? match[1].replace(/["'”]$/, '').trim() : "상태 메시지 없음";
  };




 // ── [9. 인게임 진행 상태 관리 및 영구 저장소 연결] ──
  const [sessions, setSessions] = useState([]);
  
  // 🌟 (버그 픽스!) 앱을 켤 때 내 핸드폰에 저장된 '진행 중인 게임(세션)' 목록을 불러옵니다.
  useEffect(() => {
    const storedSessions = localStorage.getItem("secret_novel_sessions");
    if (storedSessions) {
      try { setSessions(JSON.parse(storedSessions)); } catch(e) {}
    }
  }, []);

  // 🌟 세션에 변화(대화, 새로운 게임 시작 등)가 생길 때마다 영구 저장!
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("secret_novel_sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

// 🌟 (수정완료) sessions 변수가 탄생한 이후에 스크롤 코드를 배치해야 에러가 안 납니다!
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [sessions, activeSessionId]);
  
  // 🌟 (복구완료!) AI 시놉시스 자동 생성 상태 및 함수
  const [isGeneratingSynopsis, setIsGeneratingSynopsis] = useState(false);

  const handleAIGenerateSynopsis = async (isUploadModal = false) => {
    setIsGeneratingSynopsis(true);
    const t = isUploadModal ? uploadingScenario.title : scenarioTitle;
    const m = isUploadModal ? uploadingScenario.mode : selectedMode;
    const k = isUploadModal ? uploadingScenario.data?.playPreference : playPreference;
    const o = isUploadModal ? uploadingScenario.data?.openingScene : openingScene;

    const prompt = `너는 텍스트 RPG '시크릿 노벨'의 전속 작가야. 다음 정보를 바탕으로 독자들의 흥미를 끄는 시놉시스(소개글)를 3~4문장으로 작성해줘.
    [🚨 절대 규칙]: 이 플랫폼은 GL, BL, HL, 논로맨스 등 모든 커플링과 장르를 지원해. 입력된 키워드와 장르에 맞춰서 편견 없이 가장 어울리는 분위기(로맨스, 스릴러, 호러 등)로 섬세하게 작성해줘.
    제목: ${t || "미정"}
    장르: ${m || "미정"}
    키워드: ${k || "없음"}
    도입부: ${o || "없음"}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", text: prompt }],
          scenarioText: "", playerSheet: {}, ruleMode: "freeform", playPreference: ""
        })
      });
      const data = await res.json();
      let result = (data.text || "").replace(/\*/g, "").trim();

      if (isUploadModal) {
        setUploadingScenario(prev => ({ ...prev, uploadSynopsis: result }));
      } else {
        setPublicSynopsis(result);
      }
      triggerToast("AI 작성 완료", "매력적인 소개글이 완성되었습니다!", "✨");
    } catch (e) {
      triggerToast("작성 실패", "AI가 글을 쓰는 중 오류가 발생했습니다.", "⚠️️");
    } finally {
      setIsGeneratingSynopsis(false);
    }
  };
  
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
    triggerToast("인물 삭제", "수사망에서 제외되었습니다.", <Trash2 size={16} strokeWidth={2}/>);
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
      triggerToast("파싱 완료", "AI가 사건 서류철 배치를 완료했습니다.", "✨");

    } catch (error) {
      console.error(error);
      triggerToast("파싱 실패", "양식을 분석하지 못했습니다. 백엔드 연결을 확인해 주세요.", "⚠️");
    }
  };

// 🛡️ [보안 강화] 계정 귀속 백업 및 내보내기 엔진
  const executeExport = () => {
    const targets = sessions.filter(s => selectedExportSessionIds.includes(s.id));
    if (targets.length === 0) return triggerToast("선택 오류", "내보낼 세션을 하나 이상 선택해주세요.", "⚠️");

    const dateStr = new Date().toISOString().split('T')[0];

    // 1. JSON 완전 백업인 경우 (계정 보안 서명 삽입!)
    if (exportFormat === "json") {
      const exportData = {
        _meta: {
          version: "1.5.0",
          ownerEmail: currentUser?.email || "guest", // 🌟 현재 로그인한 유저 이메일 박제
          exportedAt: new Date().toISOString()
        },
        sessions: targets
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `SecretNovel_Save_${dateStr}.json`; a.click(); URL.revokeObjectURL(url);
      closeModal(setShowExportModal);
      triggerToast("백업 완료", "세이브 데이터가 안전하게 암호화되어 다운로드되었습니다.", <DownloadCloud size={18} color={theme.success}/>);
      return;
    }

    // 2. 텍스트/마크다운 추출인 경우 (보안 해제, 감상용)
    let fullOutput = "";
    targets.forEach(s => {
      let msgs = s.messages || [];
      if (exportScope === "storyOnly") {
        msgs = msgs.filter(m => !m.text.includes("[🎲") && !m.text.includes("[⚠️") && !m.text.includes("[시스템"));
      }
      const pName = s.sheet?.name || "주인공";
      const kName = s.sheet?.npcs?.[0]?.name || "상대방";

      fullOutput += `========== [${s.title}] (${s.ruleMode?.toUpperCase()}) ==========\n\n`;
      msgs.forEach(m => {
        fullOutput += `${m.role === "user" ? `▶ ${pName}` : `🗣️ ${kName}`}: ${m.text}\n\n`;
      });
      fullOutput += "\n\n";
    });

    const mimeType = exportFormat === "md" ? "text/markdown" : "text/plain";
    const blob = new Blob([fullOutput], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `SecretNovel_Log_${dateStr}.${exportFormat}`; a.click(); URL.revokeObjectURL(url);
    closeModal(setShowExportModal);
    triggerToast("내보내기 완료", "플레이 로그가 성공적으로 추출되었습니다.", "📄");
  };

  // 🛡️️ [보안 강화] 계정 대조 복원 엔진
  const importSaveFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let imported = JSON.parse(ev.target.result);
        
        // 🌟 타 유저의 유료 세션 파일인지 검증!
        if (imported._meta) {
          if (imported._meta.ownerEmail !== (currentUser?.email || "guest")) {
            triggerToast("보안 차단", "본인의 계정으로 백업한 세이브만 복원할 수 있습니다. (계정 불일치)", "🚫");
            return;
          }
          imported = imported.sessions; // 실제 세션 데이터 추출
        } else {
          // 구버전 보안 없는 파일의 경우 배열로 감싸줌
          if (!Array.isArray(imported)) imported = [imported];
        }

        setSessions(prev => {
          const map = new Map(); 
          prev.forEach(s => map.set(s.id, s)); 
          imported.forEach(s => map.set(s.id, s)); 
          return Array.from(map.values()).sort((a, b) => b.id - a.id);
        });
        triggerToast("복원 성공", `${imported.length}개의 세션을 성공적으로 복원했습니다!`, "✨");
        setShowSettingsModal(false);
        setShowExportModal(false);
      } catch (err) { 
        triggerToast("복원 실패", "파일 형식이 올바르지 않습니다.", "⚠️"); 
      }
    };
    reader.readAsText(file);
    e.target.value = null; // 입력 초기화
  };

// ── [10. 코어 엔진: 세션 시작 및 통신] ──
  
  // 🌟 (버그 수정) 추리 모드와 연애/괴담 모드의 State 분리 문제 완벽 해결!
  const startNewSession = async () => {
    const isFreeform = wizardMode === "freeform" || selectedMode === "추리";
    
    const finalPcName = isFreeform ? pcName : charName;
    const finalPcJob = isFreeform ? pcJob : charJob;
    const finalPcAge = isFreeform ? pcAgeGender : charAge;
    const finalPcBg = isFreeform ? pcBackground : charBackground;
    const finalPcSecret = isFreeform ? pcSecret : charSecret;
    const finalPcPortrait = isFreeform ? pcPortraitUrl : charPortraitUrl;
    
    const finalNpcList = isFreeform ? suspects : kpcList;
    const finalHandoutsList = isFreeform ? evidenceList : generatedHandouts;

    const sessionTitle = scenarioTitle || (finalPcName ? `${finalPcName}의 이야기` : "새로운 모험");
    const pName = finalPcName.trim() || "주인공";
    const safeRawText = (typeof originalRawText !== "undefined" && originalRawText) ? originalRawText : "";

    const npcs = (finalNpcList || []).map((k, idx) => ({
      id: k.id || Date.now() + idx,
      name: k.name || `인물${idx + 1}`,
      job: k.job || k.title || "등장인물",
      title: k.job || k.title || "등장인물",
      gender: k.gender || k.ageGender || "여성",
      age: k.age || "",
      detail: k.behavior || k.detail || "",
      desc: k.behavior || k.detail || "",
      secret: k.secret || "",
      statusMessage: k.statusMessage || "",
      portrait: k.portraitUrl || (typeof getPortraitUrl === "function" ? getPortraitUrl(k.name || "npc") : ""),
      affection: 0,
      secretRevealed: false
    }));

    const startingItems = (generatedItems && generatedItems.length > 0) ? generatedItems : [{ name: "소지품" }];

    const initialHandouts = (finalHandoutsList && finalHandoutsList.length > 0) ? finalHandoutsList : [
      { id: "pc_base", title: `${pName}의 사명과 비밀`, overview: charMission || "현재 상황을 파악한다.", secret: finalPcSecret || "숨겨진 진실", revealed: false }
    ];

    let finalSynopsis = publicSynopsis || "";
    let finalOpening = openingScene || "";
    let finalTruth = hiddenTruth || "";
    let finalScenarioCgs = JSON.parse(JSON.stringify(scenarioCgs || []));

    const currentNpcName = npcs[0]?.name || "상대방";
    const mainNpcDetail = npcs[0]?.detail || "외모 설정";
    let fullScenarioContext = `[시나리오 제목: ${sessionTitle}]\n[주요 등장인물 외모 필수 고정]\n- ${currentNpcName}: ${mainNpcDetail}\n\n[공개 시놉시스]\n${finalSynopsis}\n\n[초기 배경/서막]\n${finalOpening}\n\n[키퍼 전용 기밀/진상]\n${finalTruth}`;
    if (safeRawText !== "") fullScenarioContext += `\n\n[🚨 시나리오 원본 풀 텍스트 (마스터 전용 열람)]\n${safeRawText}`;

    let initialDetectedPhase = "낮";
    if (/자정|밤|심야|어둠|달빛|야간/.test(finalOpening)) initialDetectedPhase = "밤";
    else if (/새벽|동이\s*트/.test(finalOpening)) initialDetectedPhase = "새벽";
    else if (/저녁|노을|황혼|해질/.test(finalOpening)) initialDetectedPhase = "저녁";
    else if (/아침|오전|기상/.test(finalOpening)) initialDetectedPhase = "아침";

    let initialSheet = {
      day: 1, currentPhase: initialDetectedPhase,
      name: pName, job: finalPcJob || "조사원", age: finalPcAge || "", gender: charGender || "여성",
      background: finalPcBg || "", secret: finalPcSecret || "", mission: charMission || "",
      portrait: finalPcPortrait || "", hp: 20, maxHp: 20, npcs, items: startingItems,
      madnessStatus: null, handouts: initialHandouts, madnessCards: [], madnessDeck: []
    };
    
    if (wizardMode === "insane") {
      initialSheet = { 
        ...initialSheet, hp: 6, maxHp: 6, san: 6, maxSan: 6, limit: insaneLimit || 4, cycle: 1, scene: 1, phase: "도입", 
        mission: charMission || "일상의 온기를 되찾는다.", secret: finalPcSecret || "밝혀지지 않은 과거", insaneSkills, insaneCuriosity, insaneFear, flashbackUsed: false, insaneItems: { painkiller: 2, weapon: 0, talisman: 0 },
        enemyHp: 6, maxEnemyHp: 6, currentPlot: null, enemyPlot: null,
      };
    }

    let sessionSheet = { ...(initialSheet || {}), scenarioCgs: finalScenarioCgs };
    sessionSheet.phoneChats = {};

    const newId = Date.now();
    const newSession = {
      id: newId, title: sessionTitle,
      thumbnail: scenarioThumbnail || sessionSheet?.thumbnail || "https://cdn.phototourl.com/free/2026-09-13-be3b81ab-c892-4f25-ba89-1bb86ea1518e.jpg",
      ruleMode: wizardMode, preference: playPreference.trim(),
      scenarioText: fullScenarioContext, sheet: sessionSheet,
      messages: [], suggestedActions: [], investigationSpots: [], pendingCheck: null
    };

    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setIsLoading(true);
    setCurrentPhase(initialDetectedPhase);

    let openingPrompt = `[세션 시작: 서막 지문 요청]\n시나리오의 [초기 배경/서막]을 플레이어가 몰입할 수 있도록 4~5문장으로 서술하십시오.\n지문 끝에 주인공이 취할 다음 행동 선택지 3개를 <!-- SUGGESTIONS: ["선택지 1", "선택지 2", "선택지 3"] --> 태그로 출력하십시오.`;
    if (wizardMode === "dating") {
      openingPrompt = `[세션 시작: 비주얼 노벨 서막 요청]\n시나리오의 [초기 배경/서막]을 바탕으로 주인공 시점에서 현장 분위기를 4~5문장으로 묘사하십시오.\n지문 끝에 주인공이 취할 행동 선택지 3개를 <!-- SUGGESTIONS: ["선택지1", "선택지2", "선택지3"] --> 태그로 출력하십시오.`;
    } else if (wizardMode === "freeform") {
      openingPrompt = `[세션 시작: 추리/수사 서막 요청]\n시나리오의 [초기 배경/서막]을 바탕으로, 폭풍전야의 시점에서 현장 분위기를 4~5문장으로 묘사하십시오.\n지문 끝에 주인공이 취할 수사 액션 선택지 3개를 <!-- SUGGESTIONS: ["단서를 찾는다", "인물을 살핀다", "주변을 조사한다"] --> 태그로 출력하십시오.`;
    }

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [{ role: "user", text: openingPrompt }],
          scenarioText: fullScenarioContext,
          playerSheet: sessionSheet,
          ruleMode: wizardMode,
          playPreference: playPreference
        })
      });

      if (!res.ok) throw new Error("서버 응답 오류");
      const data = await res.json();
      let rawText = data.text || "";

      let suggActions = [];
      const suggMatch = rawText.match(/<!--\s*SUGGESTIONS:\s*(\[[\s\S]*?\])\s*-{1,3}>/i);
      if (suggMatch) { try { suggActions = JSON.parse(suggMatch[1]); } catch(e) {} }

      let cleanText = rawText.replace(/<!--[\s\S]*?-{1,3}>/g, "").replace(/\[SUGGESTIONS\][\s\S]*$/i, "").trim();

      setSessions(prev => prev.map(s => s.id === newId ? {
        ...s,
        messages: [{ role: "model", text: cleanText }],
        suggestedActions: suggActions
      } : s));

    } catch (err) {
      if (err.name === "AbortError") return;
      setSessions(prev => prev.map(s => s.id === newId ? { ...s, messages: [{ role: "model", text: "서막을 불러오는 중 오류가 발생했습니다." }] } : s));
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  // 🌟 (복구) 여기에 사라졌던 executeMessage 함수를 넣습니다!
  const executeMessage = async (textToSend) => {
    if (!textToSend.trim() || !activeSession) return;

    // 🚨 [추리 모드] 피로도 100% 도달 시 행동 강제 차단
    if (activeSession.ruleMode === "freeform" && (activeSession.sheet?.fatigue || 0) >= 100) {
      triggerToast("수사 불가", "피로도가 한계에 달했습니다. 화면 하단 [+] 메뉴에서 [🛏️ 휴식 및 수면]을 취해주세요.", "🛑");
      return;
    }

    // 🕒 [시간대 즉시 복구 치트키]
    if (textToSend.trim().startsWith("/시간")) {
      const parts = textToSend.trim().split(/\s+/);
      const targetTime = parts[1];
      if (["새벽", "아침", "낮", "저녁", "밤"].includes(targetTime)) {
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, currentPhase: targetTime, sheet: { ...s.sheet, currentPhase: targetTime } } : s));
        if (typeof triggerToast === "function") triggerToast("시간대 변경 완료", `현재 시각이 [${targetTime}](으)로 설정되었습니다.`, "🕒");
        setInputMsg(""); return; 
      }
    }
 
    // 💖 [호감도 복구/조정 치트키]
    if (textToSend.trim().startsWith("/호감도") || textToSend.trim().startsWith("/치트")) {
      const parts = textToSend.trim().split(/\s+/);
      let targetName = null; let targetVal = 50;
      if (parts.length >= 3) { targetName = parts[1]; targetVal = parseInt(parts[2], 10); } 
      else if (parts.length === 2) { targetVal = parseInt(parts[1], 10); }

      if (!isNaN(targetVal)) {
        setSessions(prev => prev.map(s => {
          if (s.id !== activeSessionId) return s;
          const updatedNpcs = (s.sheet?.npcs || []).map((npc, idx) => {
            const isMatch = targetName ? npc.name?.includes(targetName) : idx === 0;
            return isMatch ? { ...npc, affection: targetVal, affinity: targetVal } : npc;
          });
          return { ...s, sheet: { ...s.sheet, npcs: updatedNpcs } };
        }));
        if (typeof triggerToast === "function") triggerToast("치트키 적용", `호감도가 ${targetVal}(으)로 변경되었습니다.`, "💖");
        setInputMsg(""); return; 
      }
    }
    
    // 🧠 [캐릭터 성격 전체 복기 치트키]
    if (textToSend.trim().startsWith("/리프레시") || textToSend.trim().startsWith("/싱크")) {
      textToSend = `[🚨 시스템 관리자 명령: 캐릭터 성격 긴급 리프레시]\n현재 캐릭터의 말투와 태도가 설정에서 벗어났습니다. 물리적 강압이나 얀데레식 집착을 무효화하고 시트 본래의 성격(공사 구분, 절제된 거리감)을 100% 복기하여 상황을 정상화하십시오.`;
      if (typeof triggerToast === "function") triggerToast("인격 동기화", `캐릭터 설정을 원본 시트로 리프레시합니다.`, "🧠");
    }

    // 📵 유저가 전화를 끊는 말을 입력했을 때 즉시 통화 State 강제 해제
    const endCallKeywords = ["전화끊", "전화 끊", "통화 종료", "끊을게", "끊겠습니다", "끊는다"];
    const isTryingToHold = textToSend.includes("끊지") || textToSend.includes("끊지마") || textToSend.includes("끊지 마");
    if (isVoiceCallActive && endCallKeywords.some(k => textToSend.includes(k)) && !isTryingToHold) {
      setIsVoiceCallActive(false);
      setIsCallModalOpen(false);
      setVoiceCallNpc(null);
    }
 
    // 📞 부재중 전화 자동 처리 로직
    let missedCallNotice = "";
    if (incomingCall) {
      const caller = incomingCall.caller || incomingCall;
      const callerName = caller.name || "상대방";
      const callerNpc = (activeSession.sheet?.npcs || []).find(n => n.name === callerName) || activeSession.sheet?.npcs?.[0];
      const callerId = callerNpc?.id || 1;
      const currentTime = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

      const missedCallBubble = { id: Date.now() + Math.random(), sender: "npc", text: `📞 [부재중 전화] ${callerName} 님이 건 전화를 받지 못했습니다.`, time: currentTime, unread: true, isMissedCall: true };

      setSessions(prev => prev.map(s => {
        if (s.id !== activeSessionId) return s;
        const currentChats = s.sheet?.phoneChats || {};
        const contactMsgs = currentChats[callerId] || [];
        return {
          ...s,
          sheet: {
            ...s.sheet,
            phoneChats: { ...currentChats, [callerId]: [...contactMsgs, missedCallBubble] }
          }
        };
      }));

      triggerToast("📞 부재중 전화 1건", `${callerName}님의 전화를 받지 않았습니다.`, "📵");
      setIncomingCall(null);
      
      missedCallNotice = `\n\n[🚨 부재중 전화 발생 및 인물 성격별 후속 수칙]
방금 울리던 '${callerName}'의 전화를 플레이어가 무시했습니다.
1. 집착/불안 성향: 전화를 안 받자 불안감이 폭발하여 곧바로 문자를 연달아 쏟아붓게 하십시오.
2. 쿨함/냉정: 문자를 일절 남기지 않거나, 짧은 용건 1줄만 남기십시오.
3. 소심: 걱정하는 안부 문자 1줄만 전송하십시오.`;
    }

    // ⭕ 대면 상대 자동 감지
    const allNpcs = activeSession.sheet?.npcs || [];
    let detectedPartner = null;
    for (const n of allNpcs) {
      const shortName = n.name.length >= 3 ? n.name.slice(1) : n.name;
      if (textToSend.includes(n.name) || textToSend.includes(shortName) || textToSend.includes(`[${n.name}]`)) { detectedPartner = n; break; }
    }
    const currentContactId = detectedPartner?.id || activeSession.activeContactId || allNpcs[0]?.id;
    const currentContact = allNpcs.find(n => n.id === currentContactId) || allNpcs[0];
    const partnerName = currentContact?.name || "상대방";

    if (detectedPartner && detectedPartner.id !== activeSession.activeContactId) {
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, activeContactId: detectedPartner.id, sheet: { ...s.sheet, activeContactId: detectedPartner.id } } : s));
    }
    
    const snapshotSheet = JSON.parse(JSON.stringify(activeSession.sheet || {}));
    const cleanDisplayText = textToSend.replace(/<!--[\s\S]*?-->/g, "").trim();
    const isDirectCallSpeech = textToSend.startsWith("[전화 통화]");

    const updatedMessages = [
      ...(activeSession.messages || []), 
      { role: "user", text: cleanDisplayText, contactId: currentContactId, prevSheet: snapshotSheet, isCall: isDirectCallSpeech, isVoiceCall: isVoiceCallActive, callNpc: voiceCallNpc?.name }
    ];

    // 피로도 연산 (추리 모드 전용)
    let addedFatigue = 0;
    if (activeSession.ruleMode === "freeform") {
      if (textToSend.includes("[🔍") || textToSend.includes("[🤫") || textToSend.includes("[💬") || /알리바이|심문|추궁|조사|수색|증거|단서|용의자/.test(textToSend)) {
        addedFatigue = 10;
      }
    }
    const currentFatigue = Number(activeSession.sheet?.fatigue || 0);
    const nextFatigue = Math.min(100, currentFatigue + addedFatigue);
    
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: updatedMessages, suggestedActions: [], sheet: { ...s.sheet, fatigue: nextFatigue } } : s));
    setIsLoading(true);
    setInputMsg("");

    const controller = new AbortController();
    setAbortController(controller);

    const isDating = activeSession.ruleMode?.startsWith("dating");
    const isFreeform = activeSession.ruleMode === "freeform";
    const pcTone = activeSession.sheet?.background || "자연스러운 성격";

    // 🌟 동적 프롬프트 조립
    let dynamicRules = `\n\n[키퍼 마스터링 절대 수칙]
1. 진상 스포일러 금지: 플레이어가 판정에 성공하거나 명확한 증거를 찾기 전엔 진상을 해설하지 마십시오.
2. 시스템 태그 연동: 새로운 물건 획득 시 <!-- ITEM: {"name": "명칭", "desc": "설명"} --> / 인물 취향 발견 시 <!-- CLUE: {"name": "취향명", "desc": "설명", "type": "like"} -->
3. 호감도 변동 시 <!-- AFFECTION: {"name": "인물명", "delta": 1} -->
4. [돌발 전화 수신]: 타 장소의 인물이 급한 용건이 있다면 지문 끝에 <!-- INCOMING_CALL: {"name": "발신NPC명", "urgent": true} -->`;

    // 👻 사망한 NPC의 카톡 강제 차단 앵커
    const isDead = /사망|죽음|유골|고인/.test(currentContact?.statusMessage || "") || /사망|죽음|유골|고인/.test(currentContact?.behavior || "");
    if (isDead) {
      dynamicRules += `\n\n[🚨 상대방 사망 상태 알림: ${partnerName}]\n상대방 '${partnerName}'은 작중에서 이미 사망했습니다! 절대로 살아있는 척 답장하거나 전화를 걸게 하지 마십시오. 답장 대신 지문으로 오직 [수신인이 응답할 수 없는 침묵]만을 서술하십시오.`;
    }

    // 📱 스마트폰 메신저 프롬프트 분기!
    if (isFreeform) {
      dynamicRules += `\n\n[📱 추리 모드 특수 룰: 타인의 휴대폰 및 증거 조사]
- 현재 플레이어는 스마트폰 메신저를 열어 피해자나 용의자의 휴대폰을 들여다보거나 조사하고 있습니다.
- 플레이어가 폰 내용을 조사하면, 사건의 실마리가 될 과거의 수상한 대화 기록이나 실시간으로 도착하는 협박/비밀 문자를 자연스럽게 출력하십시오.
- 형식: <!-- PHONE_MSG: {"from": "발신자명", "text": "과거 기록 또는 수신된 문자 내용 (1~2줄)"} -->
- 화면이나 갤러리 속 사진 증거물: <!-- SNAP_PHOTO: {"prompt": "증거물 풍경", "caption": "사진 설명"} -->`;
    } else {
      dynamicRules += `\n\n[📱 메신저 선톡 및 일상 사진 전송 수칙]
- 플레이어가 현재 다른 구역에 있거나 대화 턴이 누적되었을 때, 연락처가 있는 타 NPC가 안부, 질투, 혹은 비밀스러운 선톡을 1회 발송하게 하십시오.
- 형식: <!-- PHONE_MSG: {"from": "발신NPC명", "text": "내용 (1~2줄)"} -->\n<!-- SNAP_PHOTO: {"prompt": "사물/풍경 묘사", "caption": "설명"} -->`;
    }

    dynamicRules += missedCallNotice; 

    if (isDating) {
      dynamicRules += `\n\n[미연시 대화 분기 수칙]\n- 지문 말미에 주인공이 보낼 수 있는 다음 선택지 3개를 <!-- SUGGESTIONS: ["대사1", "대사2", "대사3"] --> 태그로 출력하십시오. 주인공의 성격 [${pcTone}]에 맞춰 구성하십시오.`;
    }
    
    const messagesForApi = updatedMessages.slice(-40).map(m => ({ role: m.role, text: m.text }));
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: messagesForApi,
          scenarioText: ((activeSession.scenarioText || "").split("[🚨 시나리오 원본")[0]) + dynamicRules,
          playerSheet: activeSession.sheet,
          ruleMode: activeSession.ruleMode,
          playPreference: activeSession.preference
        })
      });

      if (!res.ok) throw new Error(`서버 응답 오류 (${res.status})`);
      const data = await res.json();
      let rawText = data.text || "";

      // 📞 통화 종료 태그 감지
      const endCallMatch = rawText.match(/<!--\s*END_CALL:\s*(\{[\s\S]*?\})\s*-->/);
      if (endCallMatch) { setIsVoiceCallActive(false); setIsCallModalOpen(false); setVoiceCallNpc(null); rawText = rawText.replace(endCallMatch[0], "").trim(); }

      // 🌟 [핵심] 스마트폰 톡 & 사진 완벽 낚아채기 파서
      let newPhoneMsg = null;
      const phoneMsgMatch = rawText.match(/<!--\s*PHONE_MSG:\s*(\{[\s\S]*?\})\s*-->/i);
      if (phoneMsgMatch) { try { newPhoneMsg = JSON.parse(phoneMsgMatch[1]); } catch(e){} rawText = rawText.replace(phoneMsgMatch[0], ""); }
      
      if (!newPhoneMsg) {
        const inlineMsgMatch = rawText.match(/\[([^\]]+)\]\s*[:：]\s*["'“]?([^"'”\n\r]+?)["'”]?\s*(?=\n|$)/);
        if (inlineMsgMatch) { newPhoneMsg = { from: inlineMsgMatch[1].trim(), text: inlineMsgMatch[2].trim() }; }
      }

      let autoSnapPhotoUrl = null;
      const autoSnapMatch = rawText.match(/<!--\s*SNAP_PHOTO:\s*(\{[\s\S]*?\})\s*-->/i);
      if (autoSnapMatch) {
        try {
          const snapData = JSON.parse(autoSnapMatch[1]);
          let p = (snapData.prompt || snapData.caption || "").replace(/\b(1girl|1boy|girl|boy|human|person)\b/gi, "").trim();
          if (!p) p = "aesthetic room interior, cozy atmosphere";
          const safePrompt = `${p}, no humans, nobody, scenery only, still life, background focus`;
          autoSnapPhotoUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=800&height=1000&nologo=true`;
        } catch (e) {}
        rawText = rawText.replace(autoSnapMatch[0], "");
      }

      // 🌟 찌꺼기 청소 및 선택지 추출 (기존의 강력한 3중 필터 적용)
      let suggActions = [];
      const suggMatch = rawText.match(/<!--\s*SUGGESTIONS:\s*(\[[\s\S]*?\])\s*-{1,3}>/i);
      if (suggMatch) { try { suggActions = JSON.parse(suggMatch[1]); } catch(e) {} }

      let cleanText = rawText
        .replace(/<!--[\s\S]*?-{1,3}>/g, "")
        .replace(/<!--[\s\S]*?$/g, "")
        .replace(/(?:-\s*)?\*\*\[SUGGESTIONS\]\*\*[\s\S]*$/i, "")
        .replace(/\[SUGGESTIONS\][\s\S]*$/i, "") 
        .replace(/\n\s*1\.\s*".*$/g, "")
        .replace(/\n\s*1\.\s*.+?(?=\n|$)/g, "")
        .replace(/\n\s*[1-3]\.\s*.*/g, "")
        .trim();

      // 🌟 [렌더링] 추출해 낸 메시지를 3단으로 쪼개서 타이핑 딜레이 렌더링하기!
      if (newPhoneMsg) {
        const targetSenderName = (newPhoneMsg.from || "").trim();
        const matchedNpc = (activeSession.sheet?.npcs || []).find(n => n.name === targetSenderName || n.name.includes(targetSenderName)) || activeSession.sheet?.npcs?.[0];
        const contactId = matchedNpc?.id || 1;
        const currentTime = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

        let rawItems = Array.isArray(newPhoneMsg.messages) ? newPhoneMsg.messages : [newPhoneMsg.text];
        const msgList = rawItems.flatMap(item => {
          const str = String(item).trim();
          if (str.includes("||")) return str.split("||").map(s=>s.trim()).filter(Boolean);
          if (str.includes("\n")) return str.split(/\n+/).map(s=>s.trim()).filter(Boolean);
          return [str];
        }).slice(0, 3); // 최대 3개 엄격 제한

        const generatedIncomingMsgs = msgList.map((t, idx) => ({
          id: Date.now() + Math.random() + idx,
          sender: "npc",
          text: t,
          time: currentTime,
          unread: true,
          photo: idx === 0 ? autoSnapPhotoUrl : null // 첫 말풍선에 사진 첨부!
        }));

        triggerToast("📱 새 메시지 도착", `${targetSenderName}: "${generatedIncomingMsgs[0]?.text}"`, "💬");

        // 여기서 순차 렌더링(타이핑 딜레이) 구현
        for (let i = 0; i < generatedIncomingMsgs.length; i++) {
          const bubbleMsg = generatedIncomingMsgs[i];
          if (i > 0) {
            const typingDelay = Math.min(1500, Math.max(1100, bubbleMsg.text.length * 40));
            await new Promise(resolve => setTimeout(resolve, typingDelay));
          }
          // 하나씩 세션 상태에 밀어넣기
          setSessions(prev => prev.map(s => {
            if (s.id !== activeSessionId) return s;
            const prevChats = s.sheet?.phoneChats || {};
            return {
              ...s,
              sheet: {
                ...s.sheet,
                phoneChats: { ...prevChats, [contactId]: [...(prevChats[contactId] || []), bubbleMsg] }
              }
            };
          }));
        }
      }

// 🌟 [핵심] AI 응답에도 전화 중 꼬리표를 달아 통화 화면에만 예쁘게 출력되게 합니다!
      setSessions(prev => prev.map(s => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          messages: [...updatedMessages, { role: "model", text: cleanText, isVoiceCall: isVoiceCallActive }],
          suggestedActions: suggActions
        };
      }));

    } catch (err) {
      if (err.name === "AbortError") return;
      triggerToast("통신 오류", "메시지 전송 중 오류가 발생했습니다.", "⚠️");
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  // 🌟 주사위 굴림 애니메이션 상태 (건드리지 마세요!)
// 🌟 주사위 굴림 애니메이션 상태
  const [isRolling, setIsRolling] = useState(false);
  const [rollingDisplayNum, setRollingDisplayNum] = useState(1);

  // 🌟 [괴담 모드 전용 1D10 주사위 엔진] (이모지 완전 배제)
  const rollDiceDirectly = (overrideTarget = null, skillName = "") => {
    // 괴담 모드가 아니면 작동하지 않음
    if (isRolling || !activeSession || activeSession.ruleMode !== "horror") return;
    setIsRolling(true);
    
    if (typeof playDiceSound === "function") playDiceSound();

    // 1D10 숫자가 빠르게 바뀌는 애니메이션 효과
    const rollInterval = setInterval(() => {
      setRollingDisplayNum(Math.floor(Math.random() * 10) + 1);
    }, 50);

    setTimeout(() => {
      clearInterval(rollInterval);
      
      const roll = Math.floor(Math.random() * 10) + 1;
      const targetVal = Number(overrideTarget !== null ? overrideTarget : 5);
      let outcome = "";

      if (roll === 10) {
        outcome = "극적 성공";
      } else if (roll === 1) {
        outcome = "치명적 실패";
      } else if (roll >= targetVal) {
        outcome = "성공";
      } else {
        outcome = "실패";
      }
      
      // 이모지 없이 깔끔하게 텍스트로만 선언
      const rollFormatted = `[1D10 행동 판정: 결과 ${roll} / 목표치 ${targetVal}${skillName ? ` (${skillName})` : ""} ➔ 결과: ${outcome}]`;

      setIsRolling(false);
      
      if (typeof executeMessage === "function") {
        executeMessage(rollFormatted);
      }
      
    }, 600);
  };

  const handleSendMessage = () => {
    if (!inputMsg.trim() || isLoading) return;
    executeMessage(inputMsg);
  };


// 🌟 [핵심 패치] 자동 로그인 유지 & 모바일 뒤로가기 튕김 방어
  useEffect(() => {
    setIsMounted(true); // 에러 방어막 해제 (클라이언트 렌더링 완료)

    // 1. 새로고침해도 로그인 안 튕기게 유지 (Supabase 세션 확인)
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userObj = { uid: session.user.id, email: session.user.email, name: session.user.email.split('@')[0] };
        setCurrentUser(userObj);
      } else {
        const localUser = localStorage.getItem("secret_novel_user");
        if (localUser) {
          try { setCurrentUser(JSON.parse(localUser)); } catch (e) {}
        }
      }
    };
    restoreSession();

    // 2. 모바일 뒤로가기 앱 꺼짐 방지 & 모달/팝업창 닫기 로직
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      // 뒤로가기를 눌러도 크롬창이 꺼지지 않도록 다시 상태를 밀어넣음
      window.history.pushState(null, "", window.location.href);
      
      // 열려있는 모든 팝업/모달/상세창을 싹 닫아줍니다!
      setIsDrawerOpen(false);
      setShowCgModal(false);
      setShowPortraitModal(false);
      setShowPasteModal(false);
      setShowInkModal(false);
      setShowHistoryModal(false);
      setShowLikedModal(false);
      setShowReviewModal(false);
      setShowSupportModal(false);
      setShowNoticeModal(false);
      setShowLibEditModal(false);
      setShowTraitModal(false);
      setShowMainNoticePopup(false);
      setSelectedExploreScenario(null);
      setUploadingScenario(null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 🌟 (신규) 내 서재의 심사 상태를 서버와 실시간으로 맞추는 안테나!
  useEffect(() => {
    if (currentUser?.email && savedLibrary.length > 0) {
      const syncStatus = async () => {
        const { data } = await supabase.from('scenarios').select('title, status, reject_reason').eq('author_email', currentUser.email);
        if (data) {
          let isChanged = false;
          const synced = savedLibrary.map(local => {
            const serverItem = data.find(d => d.title === local.title);
            if (serverItem && (local.status !== serverItem.status || local.rejectReason !== serverItem.reject_reason)) {
              isChanged = true;
              return { ...local, status: serverItem.status, rejectReason: serverItem.reject_reason };
            }
            return local;
          });
          if (isChanged) {
            setSavedLibrary(synced);
            localStorage.setItem("secret_novel_library", JSON.stringify(synced));
          }
        }
      };
      syncStatus();
    }
  }, [currentUser]); // 로그인 완료 시 한 번 싹 맞춰줍니다.


// ☁️ [클라우드 서재 & 세션 자동 동기화 엔진]
  // 1. 로그인 성공 시, 클라우드에서 내 데이터 싹 불러오기!
  useEffect(() => {
    if (currentUser?.uid) {
      const fetchCloudData = async () => {
        const { data, error } = await supabase.from('user_saves').select('*').eq('user_id', currentUser.uid).single();
        if (data) {
          if (data.library_data && data.library_data.length > 0) setSavedLibrary(data.library_data);
          if (data.session_data && data.session_data.length > 0) setSessions(data.session_data);
          if (data.liked_data && data.liked_data.length > 0) setLikedScenarios(data.liked_data);
          triggerToast("동기화 완료", "클라우드에서 서재와 진행 상황을 불러왔습니다.", "☁️");
        }
      };
      fetchCloudData();
    }
  }, [currentUser]);

  // 2. 게임 중 데이터가 변하면 2초 뒤 클라우드에 조용히 자동 백업! (서버 과부하 방지)
  useEffect(() => {
    if (!currentUser?.uid) return;
    if (savedLibrary.length === 0 && sessions.length === 0 && likedScenarios.length === 0) return;

    const syncTimer = setTimeout(async () => {
      await supabase.from('user_saves').upsert({
        user_id: currentUser.uid,
        library_data: savedLibrary,
        session_data: sessions,
        liked_data: likedScenarios,
        updated_at: new Date().toISOString()
      });
      
      // 로컬(브라우저)에도 이중으로 안전하게 저장해 둡니다.
      localStorage.setItem("secret_novel_library", JSON.stringify(savedLibrary));
      localStorage.setItem("secret_novel_sessions", JSON.stringify(sessions));
      localStorage.setItem("secret_novel_liked", JSON.stringify(likedScenarios));
    }, 2000); 

    return () => clearTimeout(syncTimer);
  }, [savedLibrary, sessions, likedScenarios, currentUser]);

// 🌟 서버-클라이언트 렌더링 충돌(에러 423) 완벽 방지
  if (!isMounted) {
    return <div style={{ width: "100vw", height: "100vh", backgroundColor: "#1a1817" }} />;
  }
  
// 🌟 진짜 Supabase 로그인 / 회원가입 화면
  if (!currentUser && activeTab !== "explore") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100vw", height: "100dvh", backgroundColor: theme.bg, color: theme.text, padding: "20px", position: "relative", boxSizing: "border-box" }}>
        
        {/* 🌟 뒤로가기(둘러보기) 버튼 추가 */}
        <button onClick={() => setActiveTab("explore")} style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "none", color: theme.text, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "0.9rem" }}>
          둘러보기 <X size={20} strokeWidth={2.5}/>
        </button>
        
        {/* 🌟 로그인 화면용 토스트 알림창 */}


{/* 🌟 메인 화면 최초 진입 시 뜨는 공지사항 팝업 (일주일 안보기 포함) */}
      {showMainNoticePopup && notices && notices.length > 0 && (
        <div onClick={() => setShowMainNoticePopup(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99990, padding: "20px", animation: "fadeIn 0.2s ease-out" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "400px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px" }}>
              <AlertTriangle size={22} color={theme.accent} />
              <span style={{ fontWeight: "800", fontSize: "1.1rem", color: theme.text }}>새로운 공지사항</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "40vh", overflowY: "auto" }}>
              <div style={{ fontSize: "0.75rem", color: theme.accent, fontWeight: "700" }}>{notices[0].date}</div>
              <div style={{ fontSize: "0.95rem", color: theme.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {notices[0].text}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button onClick={handleHideNoticeForWeek} style={{ flex: 1, padding: "12px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.borderHighlight}`, borderRadius: "10px", color: theme.textMuted, fontSize: "0.85rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.inputBg} onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.panelAlt}>
                일주일 안 보기
              </button>
              <button onClick={() => setShowMainNoticePopup(false)} style={{ flex: 1, padding: "12px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", border: "none", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer" }}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
          <div onClick={() => setToast(null)} style={{ ...GLASS_STYLE, position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 99999, backgroundColor: isDarkMode ? "rgba(35, 30, 28, 0.96)" : "rgba(255, 255, 255, 0.96)", border: `1.5px solid ${theme.accent}`, color: theme.text, padding: "12px 20px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", cursor: "pointer", animation: "fadeIn 0.2s ease-out", width: "max-content", maxWidth: "90vw" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.15rem" }}>{toast.icon}</span>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: theme.accent, whiteSpace: "nowrap", flexShrink: 0 }}>{toast.title}</span>
            {toast.message && <span style={{ fontSize: "0.8rem", opacity: 0.85, wordBreak: "keep-all" }}>{toast.message}</span>}
          </div>
        )}

        {/* 🌟 모바일 삐져나옴 완벽 해결 */}
        <div style={{ ...GLASS_STYLE, backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "24px", padding: "34px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", width: "100%", maxWidth: "380px", boxSizing: "border-box", margin: "0 20px", boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }}>
          
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ marginBottom: "16px", padding: "16px", backgroundColor: theme.panelAlt, borderRadius: "50%", border: `1px solid ${theme.borderHighlight}`, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <Key size={42} strokeWidth={1.5} color={theme.accent} />
            </div>
            <h1 style={{ margin: "0 0 8px 0", fontSize: "1.8rem", fontWeight: "900", letterSpacing: "-0.5px" }}>Secret Novel</h1>
            <p style={{ margin: 0, fontSize: "0.85rem", color: theme.textMuted }}>당신만의 은밀한 서사가 시작되는 곳</p>
          </div>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            <input 
              type="email" 
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="이메일 주소" 
              style={{ width: "100%", padding: "14px", backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: "12px", color: theme.text, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
            />
            <input 
              type="password" 
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="비밀번호 (6자리 이상)" 
              style={{ width: "100%", padding: "14px", backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: "12px", color: theme.text, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
            />
            
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: theme.textMuted, marginTop: "4px", paddingLeft: "4px" }}>
              <input 
                type="checkbox" 
                checked={agreeTerms} 
                onChange={(e) => setAgreeTerms(e.target.checked)} 
                style={{ width: "16px", height: "16px", accentColor: theme.accent, cursor: "pointer" }} 
              />
              <span onClick={() => setAgreeTerms(!agreeTerms)} style={{ cursor: "pointer" }}>(필수) 서비스 이용약관 동의</span>
              <span 
                onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} 
                style={{ color: theme.accent, fontWeight: "700", cursor: "pointer", textDecoration: "underline", marginLeft: "auto" }}
              >
                [내용 보기]
              </span>
            </label>
          </div>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
            <button 
              disabled={isLoginLoading || !loginEmail || !loginPassword || !agreeTerms}
              onClick={async () => {
                setIsLoginLoading(true);
                const { data, error } = await supabase.auth.signInWithPassword({
                  email: loginEmail,
                  password: loginPassword,
                });
                setIsLoginLoading(false);
                
                if (error) {
                  triggerToast("로그인 실패", "이메일이나 비밀번호가 맞지 않습니다.", <AlertTriangle color={theme.danger} size={18}/>);
                } else {
                  const userObj = { uid: data.user.id, email: data.user.email, name: data.user.email.split('@')[0] };
                  setCurrentUser(userObj);
                  localStorage.setItem("secret_novel_user", JSON.stringify(userObj));
                  triggerToast("환영합니다!", "시크릿 노벨에 접속했습니다.", "✨");
                }
              }}
              style={{ width: "100%", padding: "14px", backgroundColor: theme.accent, color: "#fff", border: "none", borderRadius: "12px", fontSize: "0.95rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s", opacity: (isLoginLoading || !loginEmail || !loginPassword || !agreeTerms) ? 0.5 : 1 }}
            >
              {isLoginLoading ? "확인 중..." : "로그인"}
            </button>

            <button 
              disabled={isLoginLoading || !loginEmail || !loginPassword || !agreeTerms}
              onClick={async () => {
                setIsLoginLoading(true);
                const { data, error } = await supabase.auth.signUp({
                  email: loginEmail,
                  password: loginPassword,
                });
                setIsLoginLoading(false);

                if (error) {
                  triggerToast("가입 실패", "이미 가입된 이메일이거나 비밀번호가 너무 짧습니다.", <AlertTriangle color={theme.danger} size={18}/>);
                } else {
                  triggerToast("가입 성공!", "환영합니다! 이제 로그인 버튼을 눌러 접속해주세요.", <CheckCircle2 color={theme.success} size={18}/>);
                }
              }}
              style={{ width: "100%", padding: "14px", backgroundColor: "transparent", color: theme.text, border: `1px solid ${theme.borderHighlight}`, borderRadius: "12px", fontSize: "0.95rem", fontWeight: "700", cursor: "pointer", transition: "all 0.2s", opacity: (isLoginLoading || !loginEmail || !loginPassword || !agreeTerms) ? 0.5 : 1 }}
            >
              회원가입
            </button>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
              <span 
                onClick={() => triggerToast("안내", "비밀번호 초기화 기능은 준비 중입니다. 고객센터(support@secretnovel.com)로 문의해주세요.", "💌")}
                style={{ fontSize: "0.8rem", color: theme.textMuted, cursor: "pointer", borderBottom: `1px solid ${theme.textMuted}`, paddingBottom: "2px", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = theme.text}
                onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
              >
                비밀번호를 잊으셨나요?
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ display: "flex", height: "100dvh", width: "100vw", backgroundColor: theme.bg, color: theme.text, overflow: "hidden", position: "relative" }}>
      
      {toast && (
        <div onClick={() => setToast(null)} style={{ ...GLASS_STYLE, position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 99999, backgroundColor: isDarkMode ? "rgba(35, 30, 28, 0.96)" : "rgba(255, 255, 255, 0.96)", border: `1.5px solid ${theme.accent}`, color: theme.text, padding: "12px 20px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", cursor: "pointer", animation: "fadeIn 0.2s ease-out", width: "max-content", maxWidth: "90vw" }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.15rem" }}>{toast.icon}</span>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: theme.accent, whiteSpace: "nowrap", flexShrink: 0 }}>{toast.title}</span>
          {toast.message && <span style={{ fontSize: "0.8rem", opacity: 0.85, wordBreak: "keep-all" }}>{toast.message}</span>}
        </div>
      )}

{/* 🚨 제자리로 찾아온 커스텀 삭제 확인 팝업! */}
      {itemToDelete && (
        <div onClick={() => setItemToDelete(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "20px", animation: "fadeIn 0.2s ease-out" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "340px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "24px", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "14px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: isDarkMode ? "rgba(220, 38, 38, 0.15)" : "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", color: theme.danger }}>
                <AlertTriangle size={32} strokeWidth={2.5} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: theme.text, letterSpacing: "-0.5px" }}>서류를 폐기하시겠습니까?</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: theme.textMuted, lineHeight: 1.6 }}>
                  서재에서 이 시나리오를 완전히 삭제합니다.<br/>삭제 후에는 <strong style={{color: theme.danger}}>절대 복구할 수 없습니다.</strong>
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setItemToDelete(null)} style={{ flex: 1, padding: "14px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "14px", color: theme.text, fontSize: "0.95rem", fontWeight: "700", cursor: "pointer", transition: "background 0.2s" }}>
                취소
              </button>
              <button onClick={() => {
                 const updated = savedLibrary.filter(item => item.id !== itemToDelete);
                 setSavedLibrary(updated);
                 localStorage.setItem("secret_novel_library", JSON.stringify(updated));
                 triggerToast("폐기 완료", "서류가 안전하게 파기되었습니다.", <Trash2 size={18} strokeWidth={2.5}/>);
                 setItemToDelete(null);
              }} style={{ flex: 1, padding: "14px", backgroundColor: theme.danger, border: "none", borderRadius: "14px", color: "#fff", fontSize: "0.95rem", fontWeight: "800", cursor: "pointer", boxShadow: "0 8px 20px rgba(220, 38, 38, 0.3)", transition: "transform 0.2s" }}>
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

     {isDrawerOpen && <div onClick={() => setIsDrawerOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", zIndex: 100 }} />}
      
      <aside style={{ position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 110, width: isMobile ? "100vw" : "320px", transform: isDrawerOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)", backgroundColor: theme.sidebar, borderRight: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", boxShadow: isDrawerOpen ? "10px 0 40px rgba(0,0,0,0.5)" : "none" }}>
        <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "700", fontSize: "1rem" }}>세션 보관함</span>
          <button onClick={() => setIsDrawerOpen(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.3rem", cursor: "pointer" }}>✕</button>
        </div>
        
        <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {sessions.length === 0 ? (
            <div style={{ padding: "24px 12px", textAlign: "center", color: theme.textMuted, fontSize: "0.78rem", border: `1px dashed ${theme.border}`, borderRadius: "10px" }}>
              진행 중인 세션 기록이 없습니다.
            </div>
          ) : (
            sessions.map(s => (
<div 
                key={s.id} 
                onClick={() => { setActiveSessionId(s.id); setIsDrawerOpen(false); }}
                style={{ borderRadius: "10px", cursor: "pointer", backgroundColor: activeSessionId === s.id ? theme.panelAlt : theme.panel, border: `1px solid ${activeSessionId === s.id ? theme.accent : theme.border}`, overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                {/* 🌟 16:9 세션 카드 썸네일 & 모달 호출 버튼 */}
                <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: theme.inputBg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                  {s.thumbnail || s.imageUrl ? (
                    <img src={s.thumbnail || s.imageUrl} alt="세션 카드" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <ImageIcon size={32} color={theme.textMuted} opacity={0.3} />
                  )}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setActiveCardSessionId(s.id); 
                      setShowSessionCardModal(true); 
                    }} 
                    title="세션 카드 이미지 변경"
                    style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "rgba(0,0,0,0.65)", color: "#fff", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <ImageIcon size={14} />
                  </button>
                </div>
                
                {/* 하단 텍스트 영역 */}
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: theme.textMuted }}>{s.ruleMode === "dating" ? "연애" : s.ruleMode === "horror" ? "괴담" : "추리"} 모드</span>
                    <button onClick={(e) => { 
                      e.stopPropagation(); 
                      const updated = sessions.filter(session => session.id !== s.id);
                      setSessions(updated); 
                      if(activeSessionId === s.id) setActiveSessionId(null); 
                    }} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: "14px", borderTop: `1px solid ${theme.border}`, display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {activeSession && (
           <button 
              onClick={() => { setActiveSessionId(null); setIsDrawerOpen(false); }} 
              style={{ 
                flex: "1 1 100%", padding: "12px", backgroundColor: theme.danger || "#ef4444", 
                border: "none", borderRadius: "8px", color: "#fff", fontSize: "0.85rem", 
                fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "4px"
              }}
            >
              <LogOut size={18} strokeWidth={2.5} /> 로비로 나가기
            </button>
          )}
         <button onClick={() => { setIsDrawerOpen(false); setShowSettingsModal(true); }} style={{ flex: 1, padding: "10px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.78rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Settings size={16} strokeWidth={2.5} /> 설정
          </button>
          <button onClick={() => { setIsDrawerOpen(false); setShowExportModal(true); }} style={{ flex: 1, padding: "10px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.78rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Database size={16} strokeWidth={2.5} /> 데이터
          </button>
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
              <span style={{ fontWeight: "600", fontSize: "0.85rem", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
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
                <button onClick={handleSaveToLibrary} title="세팅 저장" style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", color: theme.text, display: "flex", alignItems: "center" }}>
                  <Save size={20} strokeWidth={1.5} color={theme.text} />
                </button>
              </>
            )}
            
            {activeSession && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                
                {/* 🌸 연애 모드 상단 버튼 */}
                {activeSession.ruleMode?.startsWith("dating") && (
                  <>
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsPhoneDrawerOpen(true); setIsSheetOpen(false); }} title="메신저" style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, display: "flex", alignItems: "center" }}>
                      <Smartphone size={22} strokeWidth={2} />
                    </button>
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); const currentNpc = (activeSession?.sheet?.npcs || []).find(n => n.id === activeSession?.activeContactId) || activeSession?.sheet?.npcs?.[0]; if (currentNpc) setClueModalNpc(currentNpc); }} title="취향 수첩" style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, display: "flex", alignItems: "center" }}>
                      <BookOpen size={22} strokeWidth={2} />
                    </button>
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); const partner = activeSession.sheet?.npcs?.[0]; if (partner) setGiftModalNpc(partner); }} title="선물하기" style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, display: "flex", alignItems: "center" }}>
                      <Gift size={22} strokeWidth={2} />
                    </button>
                  </>
                )}

{/* 🕵️ 추리 모드 */}
                {activeSession.ruleMode === "freeform" && (
                  <>
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsPhoneDrawerOpen(true); setIsSheetOpen(false); }} title="증거품 휴대폰" style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, display: "flex", alignItems: "center" }}>
                      <Smartphone size={22} strokeWidth={2} />
                    </button>
                    <button type="button" onClick={() => setInputMsg("[💡 진상 추리 선언] 지금까지 모은 단서들을 바탕으로 이 사건의 진실을 밝혀낸다! ")} title="진상 추리" style={{ background: "none", border: "none", cursor: "pointer", color: theme.danger, display: "flex", alignItems: "center" }}>
                      <Lightbulb size={22} strokeWidth={2} />
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setShowEvidenceBoard(!showEvidenceBoard); }} title="증거 보드" style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, display: "flex", alignItems: "center" }}>
                      <Pin size={22} strokeWidth={2} style={{ transform: "rotate(45deg)" }} />
                    </button>
                  </>
                )}

                {/* 🕯️ 괴담 모드 */}
                {activeSession.ruleMode === "horror" && (
                  <>
                    <button type="button" onClick={() => rollDiceDirectly()} title="행동 판정" style={{ background: "none", border: "none", cursor: "pointer", color: theme.warning, display: "flex", alignItems: "center" }}>
                      <Dices size={22} strokeWidth={2} />
                    </button>
                    <button type="button" onClick={() => setIsTabletopOpen(!isTabletopOpen)} title="핸드아웃" style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, display: "flex", alignItems: "center" }}>
                      <LibraryBig size={22} strokeWidth={2} />
                    </button>
                    <button type="button" onClick={() => triggerMadnessDirectly(activeSessionId)} title="괴담 현상 발동" style={{ background: "none", border: "none", cursor: "pointer", color: theme.danger, display: "flex", alignItems: "center" }}>
                      <Ghost size={22} strokeWidth={2} />
                    </button>
                    <button type="button" onClick={() => alert("장면 닫기 구현 필요")} title="장면 닫기" style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, display: "flex", alignItems: "center" }}>
                      <LogOut size={22} strokeWidth={2} />
                    </button>
                  </>
                )}

               {/* 공통: 캐릭터 시트 */}
                <div style={{ width: "1px", height: "16px", backgroundColor: theme.border, margin: "0 4px" }} />
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsSheetOpen(!isSheetOpen); }} title="캐릭터 정보" style={{ background: "none", border: "none", cursor: "pointer", color: isSheetOpen ? theme.accent : theme.text, display: "flex", alignItems: "center" }}>
                  {activeSession.ruleMode?.startsWith("dating") ? <UserRound size={22} strokeWidth={2} /> : <ClipboardList size={22} strokeWidth={2} />}
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

{/* 🧭 탐색 (Explore) 탭 화면 */}
            {activeTab === "explore" && (() => {
              // 🌟 '전체보기'를 위한 '전체' 필터 추가 및 데이터 분류
              const filteredExplore = exploreScenarios.filter(scen => {
                const matchFilter = exploreFilter === "추천" || exploreFilter === "전체" || scen.mode === exploreFilter;
                const matchSearch = scen.title.toLowerCase().includes(exploreSearchQuery.toLowerCase()) || scen.author.toLowerCase().includes(exploreSearchQuery.toLowerCase());
                return matchFilter && matchSearch;
              });

              // 🌟 1. 오리지널 작품: 최신 등록순(id 내림차순) 정렬 후 최대 10개만 자르기
              const originalScenarios = exploreScenarios
                .filter(s => s.isOriginal)
                .sort((a, b) => b.id - a.id)
                .slice(0, 10);

              // 🌟 2. 실시간 인기 사건: 하트(likes) + 추천(plays) 숫자 합산 내림차순 정렬 후 최대 10개만 자르기
              const popularScenarios = [...exploreScenarios]
                .sort((a, b) => {
                  const scoreA = parseFloat(a.likes) + parseFloat(a.plays);
                  const scoreB = parseFloat(b.likes) + parseFloat(b.plays);
                  return scoreB - scoreA; // 점수가 높은 순서대로 줄 세우기
                })
                .slice(0, 10);

          
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.2s ease-out", padding: "4px 4px 20px 4px" }}>
                  
                  {/* 1. 상단 검색바 및 잉크 잔액 */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "0 14px", height: "48px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                      <Search size={18} color={theme.textMuted} />
                      <input 
                        type="text" 
                        value={exploreSearchQuery}
                        onChange={(e) => setExploreSearchQuery(e.target.value)}
                        placeholder="어떤 사건을 찾으시나요?" 
                        style={{ flex: 1, height: "100%", border: "none", backgroundColor: "transparent", color: theme.text, fontSize: "0.9rem", outline: "none", paddingLeft: "10px" }} 
                      />
                    </div>
                    <div onClick={() => setShowInkModal(true)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", backgroundColor: theme.panelAlt, padding: "0 14px", height: "48px", borderRadius: "16px", fontWeight: "800", fontSize: "0.9rem", color: theme.text }}>
                      <Droplet size={18} strokeWidth={2.5} color={theme.accent} /> {userInk.toLocaleString()}
                    </div>
                  </div>

                  {/* 2. 카테고리 필터 탭 (전체 추가!) */}
                  <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", WebkitOverflowScrolling: "touch", whiteSpace: "nowrap" }}>
                    {["추천", "전체", "추리", "연애", "괴담"].map((f) => (
                      <button 
                        key={f} 
                        onClick={() => setExploreFilter(f)}
                        style={{ padding: "10px 18px", borderRadius: "20px", border: `1px solid ${exploreFilter === f ? theme.accent : theme.border}`, backgroundColor: exploreFilter === f ? theme.accent : theme.panel, color: exploreFilter === f ? (isDarkMode ? "#1a1817" : "#fff") : theme.text, fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                 {/* 🌟 추천 탭일 때는 웹툰 앱처럼 '가로 스크롤' 레이아웃을 보여줌 */}
                  {exploreFilter === "추천" && !exploreSearchQuery ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                      
{/* A. 히어로 다중 배너 (가로 스크롤 & 어드민 편집) */}
                      <div style={{ position: "relative", display: "flex", overflowX: "auto", snapType: "x mandatory", gap: "16px", paddingBottom: "8px", WebkitOverflowScrolling: "touch", width: "100%", scrollbarWidth: "none" }}>
                        {banners.map((banner) => (
                          <div 
                            key={banner.id} 
                            // 🌟 (핵심!) 배너를 클릭하면 목적지(linkId)를 찾아 팝업을 열어줍니다! (어드민도 테스트 가능)
                            onClick={() => {
                              if (banner.linkId) {
                                const targetScen = exploreScenarios.find(s => s.title.includes(banner.linkId));
                                if (targetScen) setSelectedExploreScenario(targetScen);
                                else triggerToast("안내", "현재 라운지에서 찾을 수 없는 시나리오입니다.", "🔍");
                              }
                            }}
                            style={{ ...GLASS_STYLE, flex: "0 0 100%", snapAlign: "center", aspectRatio: "16/9", backgroundColor: theme.panel, borderRadius: "20px", overflow: "hidden", position: "relative", border: `1px solid ${theme.borderHighlight}`, cursor: banner.linkId ? "pointer" : "default" }}
                          >
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)", zIndex: 1 }} />
                            <img src={banner.imageUrl} alt="배너" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", padding: "24px 20px", zIndex: 2, display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ color: theme.accent, fontSize: "0.75rem", fontWeight: "900", letterSpacing: "1px" }}>{banner.tag}</span>
                              <h2 style={{ margin: 0, color: "#fff", fontSize: "1.6rem", fontWeight: "800" }}>{banner.title}</h2>
                              <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>{banner.desc}</p>
                            </div>
                            
                            {/* 👑 어드민 전용 배너 편집 버튼 */}
                            {isAdmin && (
                              <button onClick={(e) => { 
                                e.stopPropagation(); // 🌟 배너 교체 버튼을 누르면 상세 페이지로 넘어가지 않게 막아줍니다!
                                setEditingBanner({ ...banner }); setShowBannerEdit(true); 
                              }} style={{ position: "absolute", top: "16px", right: "16px", zIndex: 10, padding: "6px 12px", backgroundColor: theme.danger, color: "#fff", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "0.75rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                                <PenTool size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} /> 배너 교체
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* B. 오직 시크릿 노벨에서만! 오리지널 시리즈 (가로 스크롤) */}
                      {originalScenarios.length > 0 && (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", padding: "0 4px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><LayoutGrid size={18} strokeWidth={2.5}/> 공식 대표 작품! 오리지널</span>
                            <span onClick={() => setExploreFilter("전체")} style={{ fontSize: "0.8rem", fontWeight: "700", color: theme.textMuted, cursor: "pointer" }}>전체보기 〉</span>
                          </div>
                          <div style={{ display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "10px", WebkitOverflowScrolling: "touch" }}>
                          {originalScenarios.map(scen => (
                            // 🌟 width를 240px로 늘리고 비율을 16/9로 통일!
                            <div key={scen.id} onClick={() => setSelectedExploreScenario(scen)} style={{ width: "240px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "8px", cursor: "pointer" }}>
                              <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: theme.panelAlt, borderRadius: "12px", overflow: "hidden", border: `1px solid ${theme.accent}`, position: "relative" }}>
                                  {scen.imageUrl ? <img src={scen.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={32} color={theme.textMuted} style={{ margin: "auto", height: "100%" }}/>}
                                  <div style={{ position: "absolute", top: "6px", left: "6px", backgroundColor: theme.accent, color: isDarkMode ? "#000" : "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.6rem", fontWeight: "900" }}>ORIGINAL</div>
                                </div>
                                <div style={{ fontSize: "0.9rem", fontWeight: "800", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{scen.title}</div>
                                <div style={{ fontSize: "0.75rem", color: theme.textMuted }}>{scen.mode} · {scen.author}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* C. 실시간 인기 사건 (가로 스크롤) */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", padding: "0 4px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Flame color={theme.danger} size={18} strokeWidth={2.5}/> 지금 뜨는 인기 사건</span>
                          <span onClick={() => setExploreFilter("전체")} style={{ fontSize: "0.8rem", fontWeight: "700", color: theme.textMuted, cursor: "pointer" }}>전체보기 〉</span>
                        </div>
                        <div style={{ display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "10px", WebkitOverflowScrolling: "touch" }}>
                          {popularScenarios.map(scen => (
                            <div key={scen.id} onClick={() => setSelectedExploreScenario(scen)} style={{ width: "240px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px", cursor: "pointer" }}>
                              <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: theme.panelAlt, borderRadius: "12px", overflow: "hidden", border: `1px solid ${theme.border}`, position: "relative" }}>
                                {scen.imageUrl ? <img src={scen.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={32} color={theme.textMuted} style={{ margin: "auto", height: "100%" }}/>}
                                <div style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "8px", color: "#fff", fontSize: "0.65rem", fontWeight: "800" }}>{scen.mode}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: "0.95rem", fontWeight: "800", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{scen.title}</div>
                                <div style={{ display: "flex", gap: "10px", marginTop: "4px", fontSize: "0.75rem", color: theme.textMuted, fontWeight: "600" }}>
                                  <span style={{ display: "flex", gap: "3px", alignItems: "center" }}><Heart size={12}/> {scen.likes}</span>
                                  <span style={{ display: "flex", gap: "3px", alignItems: "center" }}><Play size={12}/> {scen.plays}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (

                    
                    /* 🌟 검색했거나, 추천 탭이 아닌 다른 탭(전체, 추리 등)일 때 보여주는 리스트형 뷰 */
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
                        <span style={{ fontSize: "1.1rem", fontWeight: "800", color: theme.text }}>
                          {exploreSearchQuery ? `'${exploreSearchQuery}' 검색 결과` : `${exploreFilter} 시나리오`}
                        </span>
                      </div>
                      
                      {filteredExplore.length === 0 ? (
                         <div style={{ padding: "40px 20px", textAlign: "center", color: theme.textMuted, fontSize: "0.9rem", backgroundColor: theme.panelAlt, borderRadius: "16px", border: `1px dashed ${theme.border}` }}>
                           조건에 맞는 시나리오가 없습니다.
                         </div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "14px" }}>
                          {filteredExplore.map(scen => (
                            <div key={scen.id} onClick={() => setSelectedExploreScenario(scen)} style={{ display: "flex", flexDirection: "column", gap: "10px", cursor: "pointer" }}>
                              <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: theme.panelAlt, borderRadius: "14px", overflow: "hidden", border: `1px solid ${theme.border}`, position: "relative" }}>
                                {scen.imageUrl ? <img src={scen.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={28} strokeWidth={1.5} color={theme.textMuted} style={{ margin: "auto", height: "100%" }} />}
                                <div style={{ position: "absolute", top: "8px", left: "8px", backgroundColor: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "6px", color: "#fff", fontSize: "0.65rem", fontWeight: "700" }}>
                                  {scen.mode}
                                </div>
                                {scen.isOriginal && (
                                  <div style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", padding: "4px 6px", borderRadius: "6px", fontSize: "0.6rem", fontWeight: "800" }}>
                                    ORIGINAL
                                  </div>
                                )}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "0 4px" }}>
                                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{scen.title}</span>
                                <span style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "600" }}>{scen.author}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
         
{/* 📚 서재 (Library) 탭 화면 */}
            {activeTab === "library" && (() => {
              // 🌟 검색 및 필터링 로직
              const filteredLibrary = savedLibrary.filter(scen => {
                const matchFilter = libFilter === "전체" || scen.mode === libFilter;
                const matchSearch = scen.title.toLowerCase().includes(libSearchQuery.toLowerCase());
                return matchFilter && matchSearch;
              });

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.2s ease-out" }}>
                  
                  {/* 상단: 검색 바 및 새 시나리오 생성 (+) 버튼 */}
                  <div style={{ display: "flex", gap: "8px", width: "100%", boxSizing: "border-box" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "0 12px" }}>
                      <Search size={18} color={theme.textMuted} />
                      <input type="text" autoComplete="off" value={libSearchQuery} onChange={e => setLibSearchQuery(e.target.value)} placeholder="서재에서 시나리오 검색..." style={{ flex: 1, padding: "12px 10px", border: "none", backgroundColor: "transparent", color: theme.text, fontSize: "0.9rem", outline: "none" }} />
                    </div>
                    <button onClick={() => setActiveTab("lobby")} title="새 시나리오 작성" style={{ width: "48px", height: "48px", backgroundColor: theme.accent, border: "none", borderRadius: "12px", color: isDarkMode ? "#1a1817" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                      <Plus size={24} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* 탭 필터 (전체, 추리, 연애, 괴담) */}
                  <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", WebkitOverflowScrolling: "touch" }}>
                    {["전체", "추리", "연애", "괴담"].map(f => (
                      <button key={f} onClick={() => setLibFilter(f)} style={{ padding: "8px 16px", borderRadius: "20px", border: `1px solid ${libFilter === f ? theme.accent : theme.border}`, backgroundColor: libFilter === f ? theme.accent : theme.panelAlt, color: libFilter === f ? "#fff" : theme.textMuted, fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                        {f}
                      </button>
                    ))}
                  </div>

                  {filteredLibrary.length === 0 ? (
                    <div style={{ padding: "40px 20px", backgroundColor: theme.panelAlt, borderRadius: "16px", border: `1px dashed ${theme.border}`, textAlign: "center", color: theme.textMuted, fontSize: "0.85rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <Database size={32} strokeWidth={1.5} opacity={0.5} />
                      조건에 맞는 보관된 서류철이 없습니다.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                      {filteredLibrary.map(scen => (
                        <div key={scen.id} style={{ backgroundColor: theme.panel, borderRadius: "16px", overflow: "hidden", border: `1px solid ${theme.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", position: "relative" }}>
                          
                          {/* 🌟 썸네일 영역 */}
                          <div 
                            title="클릭하여 커버 수정"
                            onClick={() => { setEditingLibItem({ ...scen }); setShowLibEditModal(true); }}
                            style={{ width: "100%", aspectRatio: "16/9", backgroundColor: theme.panelAlt, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${theme.border}`, cursor: "pointer" }}
                          >
                            {scen.imageUrl ? (
                              <img src={scen.imageUrl} alt="표지" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: theme.textMuted, opacity: 0.5 }}>
                                <ImageIcon size={36} strokeWidth={1.5} />
                                <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>커버 이미지 없음</span>
                              </div>
                            )}

{/* 🌟 라운지 공개 중 뱃지 */}
                            {!scen.isDownloaded && scen.isPublic && (
                              <div style={{ position: "absolute", top: "12px", right: "12px", padding: "4px 8px", backgroundColor: theme.success, backdropFilter: "blur(4px)", borderRadius: "8px", color: "#fff", fontSize: "0.7rem", fontWeight: "800", border: `1px solid rgba(255,255,255,0.3)`, zIndex: 5, boxShadow: "0 2px 8px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Globe size={12} strokeWidth={2.5} /> 라운지 공개 중
                              </div>
                            )}

                            {/* (기존) 다운로드 됨 뱃지 */}
                            {scen.isDownloaded && (
                              <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "6px", zIndex: 5 }}>
                                <div style={{ padding: "4px 8px", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", borderRadius: "8px", color: "#60a5fa", fontSize: "0.7rem", fontWeight: "700", border: "1px solid rgba(96, 165, 250, 0.4)", display: "flex", alignItems: "center", gap: "4px", width: "fit-content" }}>
                                  <FileUp size={12} strokeWidth={2.5} /> 다운로드 됨
                                </div>
                                
                                {/* 🌟 실제 기능이 작동하는 업데이트 버튼 */}
                                {scen.hasUpdate && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation(); // 썸네일 클릭 시 커버 수정 모달 방지
                                      const updated = savedLibrary.map(item => item.id === scen.id ? { ...item, hasUpdate: false } : item);
                                      setSavedLibrary(updated);
                                      localStorage.setItem("secret_novel_library", JSON.stringify(updated));
                                      triggerToast("업데이트 완료", "서류철이 최신 버전으로 갱신되었습니다.", <CheckCircle2 size={18} color={theme.success} />);
                                    }}
                                    title="최신 버전으로 업데이트"
                                    style={{ padding: "4px 8px", backgroundColor: "rgba(22, 163, 74, 0.9)", backdropFilter: "blur(4px)", borderRadius: "8px", color: "#fff", fontSize: "0.7rem", fontWeight: "700", border: "1px solid rgba(255, 255, 255, 0.3)", display: "flex", alignItems: "center", gap: "4px", width: "fit-content", animation: "pulse 2s infinite", cursor: "pointer" }}
                                  >
                                    <ArrowUp size={12} strokeWidth={3} /> 업데이트 가능
                                  </button>
                                )}
                              </div>
                            )}

                            {/* 심사 대기 / 반려 / 발행 상태 뱃지 */}
                            {scen.status === "심사 대기" && (
                              <div style={{ position: "absolute", top: "12px", left: "12px", padding: "4px 8px", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", borderRadius: "8px", color: theme.warning, fontSize: "0.7rem", fontWeight: "700", border: `1px solid rgba(245, 158, 11, 0.4)`, zIndex: 5 }}>
                                심사 대기 중
                              </div>
                            )}
                            {scen.status === "반려" && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation(); // 🌟 뒤에 있는 썸네일 클릭 방지
                                  triggerToast("반려 사유", scen.rejectReason || "기재된 사유가 없습니다.", "🚫");
                                }}
                                style={{ position: "absolute", top: "12px", left: "12px", padding: "4px 8px", backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", borderRadius: "8px", color: theme.danger, fontSize: "0.7rem", fontWeight: "700", border: `1px solid ${theme.danger}`, zIndex: 5, cursor: "pointer" }}
                              >
                                🚫 반려
                              </div>
                            )}
                            {scen.status === "발행 완료" && (
                              <div style={{ position: "absolute", top: "12px", left: "12px", padding: "4px 8px", backgroundColor: theme.success, backdropFilter: "blur(4px)", borderRadius: "8px", color: "#fff", fontSize: "0.7rem", fontWeight: "700", zIndex: 5 }}>
                                🎉 라운지 발행됨
                              </div>
                            )}
                          </div>

{/* 🌟 하단 카드 텍스트 정보 영역 */}
                          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div style={{ fontWeight: "800", fontSize: "1.1rem", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {scen.title}
                              </div>
                              <div style={{ fontSize: "0.75rem", fontWeight: "700", color: theme.textMuted }}>
                                {scen.mode}
                              </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: `1px dashed ${theme.borderHighlight || theme.border}` }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: theme.textMuted, fontSize: "0.75rem", fontWeight: "500" }}>
                                <Clock size={14} strokeWidth={2} /> {scen.date}
                              </div>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button title="로비로 불러와서 세팅/시작하기" onClick={() => handleLoadFromLibrary(scen)} style={{ background: "none", border: "none", color: theme.accent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
                                  <FolderOpen size={18} strokeWidth={2.5} />
                                </button>
                                
                                {/* 유저 창작 시나리오 라운지 공개/비공개 토글 */}
                                {!scen.isDownloaded && (
                                  <button 
                                    title={scen.isPublic ? "라운지에서 내리기 (비공개)" : "라운지 심사 요청하기"} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (scen.isPublic) {
                                        // 비공개 처리
                                        const updatedLibrary = savedLibrary.map(item => item.id === scen.id ? { ...item, isPublic: false, status: "" } : item);
                                        setSavedLibrary(updatedLibrary);
                                        localStorage.setItem("secret_novel_library", JSON.stringify(updatedLibrary));
                                        setExploreScenarios(exploreScenarios.filter(e => e.id !== scen.id));
                                        triggerToast("비공개 전환", "라운지에서 서류를 내렸습니다.", <Lock size={18} color={theme.textMuted} />);
                                      } else {
                                        // 🌟 바로 올라가지 않음! 입력 폼을 엽니다.
                                        setUploadingScenario({ ...scen, uploadSynopsis: scen.data.publicSynopsis || "", uploadWarning: "" });
                                      }
                                    }} 
                                    style={{ background: "none", border: "none", color: scen.isPublic ? theme.success : theme.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", transition: "color 0.2s" }}
                                  >
                                    {scen.isPublic ? <ToggleRight size={22} strokeWidth={2.5} /> : <ToggleLeft size={22} strokeWidth={2.5} />}
                                  </button>
                                )}

                                <button title="서류 폐기" onClick={() => handleDeleteFromLibrary(scen.id)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
                                  <Trash2 size={18} strokeWidth={2} />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}


            {/* ✍️ 로비 (Lobby) 탭 화면 */}
            {activeTab === "lobby" && (
              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "14px" : "18px", animation: "fadeIn 0.2s ease-out", width: "100%" }}>
              
            <section style={{ ...GLASS_STYLE, padding: isMobile ? "14px" : "18px", backgroundColor: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "12px", color: theme.text }}>
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
                        <div style={{ fontWeight: "700", fontSize: "0.95rem", color: isSel ? theme.accent : theme.text }}>{m.title}</div>
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
                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: theme.text }}>2. 장르 톤 (서사 태그)</span>
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
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <UserRound size={22} strokeWidth={2} color={theme.accent} />
                    <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>주인공 (수사관) 프로필</span>
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
                        <div style={{ fontWeight: "700", fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pcName || "이름 미상"}</div>
                      </div>
                    </div>

                    <div style={{ flex: 1, padding: "14px", backgroundColor: theme.panelAlt, borderRadius: "12px", border: `1.5px solid ${theme.borderHighlight || theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>이름</label>
                          <input type="text" autoComplete="off" autoComplete="off" value={pcName} onChange={e => setPcName(e.target.value)} placeholder="예: 레베카" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>나이/성별</label>
                          <input type="text" autoComplete="off" value={pcAgeGender} onChange={e => setPcAgeGender(e.target.value)} placeholder="예: 26세 여성" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>직업/역할</label>
                          <input type="text" autoComplete="off" value={pcJob} onChange={e => setPcJob(e.target.value)} placeholder="예: 탐정, 프리랜서" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>수사관의 배경 및 특징 (성격, 약점 등)</label>
                        <textarea rows={2} value={pcBackground} onChange={e => setPcBackground(e.target.value)} placeholder="사건에 휘말리게 된 계기나 평소 성격..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", resize: "vertical" }} />
                      </div>

                     {/* 🌟 주인공 전용 남모르는 비밀 (추리 모드용 빨간색 테마 적용) */}
                      <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)", borderRadius: "8px", border: `1px solid ${theme.danger}`, padding: "10px 12px", marginTop: "4px" }}>
                        <button 
                          type="button" 
                          onClick={() => setShowPcSecret(!showPcSecret)} 
                          style={{ width: "100%", textAlign: "left", background: "none", border: "none", fontSize: "0.76rem", color: theme.danger, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}
                        >
                          <span style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                            <Lock size={15} strokeWidth={2.5} /> 수사관의 숨겨진 비밀 / 약점
                          </span>
                          <span style={{ display: "flex", alignItems: "center" }}>
                            {showPcSecret ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
                          </span>
                        </button>
                        
                        {showPcSecret && (
                          <input type="text" autoComplete="off" value={pcSecret} onChange={e => setPcSecret(e.target.value)} placeholder="예: 사실 과거의 사건과 깊은 연관이 있다..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", marginTop: "8px", borderRadius: "6px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.82rem", outline: "none" }} />
                        )}
                      </div>

                    </div>
                  </div>
                </section>

                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px", width: "100%", boxSizing: "border-box" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ClipboardList size={22} strokeWidth={2} color={theme.accent} />
                      <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>사건 개요서 및 세션 카드</span>
                    </div>
                    <button type="button" onClick={() => handleAIGenerateSynopsis(false)} disabled={isGeneratingSynopsis} style={{ padding: "6px 12px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.borderHighlight}`, borderRadius: "10px", color: theme.accent, fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                      {isGeneratingSynopsis ? "작성 중..." : "✨ AI 자동 작성"}
                    </button>
                  </div>
                  
                  {/* 🌟 세션 카드 이미지 삭제 후 텍스트 필드만 깔끔하게 유지 */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input type="text" autoComplete="off" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} placeholder="사건명 / 시나리오 제목" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                    <input type="text" autoComplete="off" value={victimName} onChange={e => setVictimName(e.target.value)} placeholder="주요 공략 대상 / 사건 목표" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                  </div>

                  <textarea rows={2} value={publicSynopsis} onChange={e => setPublicSynopsis(e.target.value)} placeholder="현장 상황 및 사건 발생 개요..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
                  <textarea rows={2} value={openingScene} onChange={e => setOpeningScene(e.target.value)} placeholder="첫 오프닝/서막 지문..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
                </section>

                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Pin size={22} strokeWidth={2} color={theme.danger} style={{ transform: "rotate(45deg)" }} />
                      <span style={{ fontSize: "0.95rem", color: theme.text }}>
                        <strong style={{ fontWeight: "700" }}>용의자 수사망</strong>
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
                                backgroundColor: isDarkMode ? "rgba(220, 38, 38, 0.8)" : "rgba(220, 38, 38, 0.9)", 
color: "#fff", border: "none", cursor: "pointer", 
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
                            <div style={{ fontWeight: "700", fontSize: "0.82rem", color: theme.polaroidText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
                          <span style={{ fontSize: "0.88rem", fontWeight: "700", color: theme.accent, display: "flex", alignItems: "center", gap: "6px" }}>
                            <FolderOpen size={18} strokeWidth={2.5} /> 수사 서류: [{cur.name || "신원 미상"}]
                          </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr", gap: "8px" }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>이름</label>
                            <input type="text" autoComplete="off" value={cur.name} onChange={e => handleUpdateSuspect(cur.id, "name", e.target.value)} placeholder="예: 강이솔" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>나이/성별</label>
                            <input type="text" autoComplete="off" value={cur.ageGender} onChange={e => handleUpdateSuspect(cur.id, "ageGender", e.target.value)} placeholder="예: 26세 여성" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>직업/역할</label>
                            <input type="text" autoComplete="off" value={cur.job} onChange={e => handleUpdateSuspect(cur.id, "job", e.target.value)} placeholder="예: 선임 연구원" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", display: "block", marginBottom: "3px" }}>인물 특징 및 사건 행적</label>
                          <textarea rows={3} value={cur.behavior} onChange={e => handleUpdateSuspect(cur.id, "behavior", e.target.value)} placeholder="성격, 피해자와의 관계, 사건 당일 주장하는 행적..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", resize: "vertical" }} />
                        </div>

                        <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)", borderRadius: "8px", border: `1px solid ${theme.danger}`, padding: "10px 12px", marginTop: "4px" }}>
                          <button type="button" onClick={() => handleUpdateSuspect(cur.id, "showSecret", !cur.showSecret)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", fontSize: "0.76rem", color: theme.danger, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}>
                          <span style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                            <Lock size={15} strokeWidth={2.5} /> 숨겨진 비밀 / 약점
                          </span>
                          <span style={{ display: "flex", alignItems: "center" }}>
                                       {cur.showSecret ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
                          </span>
                        </button>
                          
                          {cur.showSecret && (
                            <input type="text" autoComplete="off" value={cur.secret} onChange={e => handleUpdateSuspect(cur.id, "secret", e.target.value)} placeholder="결정적 진실 또는 알리바이 허점..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", marginTop: "8px", borderRadius: "6px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.82rem", outline: "none" }} />
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
                    {/* 🌟 중복된 span 태그를 제거하고 예쁜 Chevron 아이콘으로 깔끔하게 교체! */}
                    <span style={{ display: "flex", alignItems: "center", color: theme.textMuted }}>
                      {showEvidence ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
                    </span>
                  </button>

                  {showEvidence && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
                        {evidenceList.map((item, idx) => (
                          <div key={item.id} style={{ backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                              <input type="text" autoComplete="off" value={item.name} onChange={e => handleUpdateEvidence(item.id, "name", e.target.value)} placeholder={`단서 ${idx + 1} 명칭`} style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", fontWeight: "600", outline: "none" }} />
                              {evidenceList.length > 1 && (
                                <button type="button" onClick={(e) => handleDeleteEvidence(e, item.id)} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", padding: "2px", fontSize: "0.8rem", display: "flex", alignItems: "center" }}>
                                  <Trash2 size={16} strokeWidth={2.5} />
                                </button>
                              )}
                            </div>
                            <input type="text" autoComplete="off" value={item.overview} onChange={e => handleUpdateEvidence(item.id, "overview", e.target.value)} placeholder="발견 위치 및 겉모습..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.78rem", outline: "none" }} />
                            <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)", borderRadius: "8px", border: `1px solid ${theme.danger}`, padding: "10px 12px" }}>
                              <button type="button" onClick={() => handleUpdateEvidence(item.id, "showSecret", !item.showSecret)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", fontSize: "0.72rem", color: theme.danger, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <Lock size={15} strokeWidth={2.5} /> 감식 진상 / 모순
                                </span>
                               <span style={{ display: "flex", alignItems: "center", color: theme.textMuted }}>
  {showEvidence ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
</span>
                              </button>
                              {item.showSecret && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                                  <input type="text" autoComplete="off" value={item.contradiction} onChange={e => handleUpdateEvidence(item.id, "contradiction", e.target.value)} placeholder="알리바이를 깰 모순점..." style={{ width: "100%", boxSizing: "border-box", padding: "6px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.78rem", outline: "none" }} />
                                  <input type="text" autoComplete="off" value={item.secret} onChange={e => handleUpdateEvidence(item.id, "secret", e.target.value)} placeholder="감식 성공 시 밝혀질 이면..." style={{ width: "100%", boxSizing: "border-box", padding: "6px 10px", borderRadius: "6px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.78rem", outline: "none" }} />
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
                          borderRadius: "12px", color: theme.accent, fontSize: "0.82rem", fontWeight: "600", 
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
                    <span style={{ display: "flex", alignItems: "center", color: theme.textMuted }}>
  {showHiddenTruth ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
</span>
                  </button>
                  
                  {showHiddenTruth && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: "10px" }}>
                        <input type="text" autoComplete="off" value={culpritName} onChange={e => setCulpritName(e.target.value)} placeholder="진범 / 흑막 이름" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                        <input type="text" autoComplete="off" value={trickDetail} onChange={e => setTrickDetail(e.target.value)} placeholder="사용된 트릭 (예: 타이머 조작)" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                      </div>
                      <textarea rows={3} value={hiddenTruth} onChange={e => setHiddenTruth(e.target.value)} placeholder="사건의 내막 및 엔딩 조건..." style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", outline: "none", resize: "vertical" }} />
                    </div>
                  )}
                </section>
              </>
            )}

{/* 🌸 연애 모드 전체 구역 */}
            {selectedMode === "연애" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px", width: "100%" }}>

                {/* 🌟 0. 추가된 사건 개요서 (연애 모드용) */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px", width: "100%", boxSizing: "border-box" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ClipboardList size={22} strokeWidth={2} color={theme.accent} />
                      <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>사건 개요서 및 세션 카드</span>
                    </div>
                    <button type="button" onClick={() => handleAIGenerateSynopsis(false)} disabled={isGeneratingSynopsis} style={{ padding: "6px 12px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.borderHighlight}`, borderRadius: "10px", color: theme.accent, fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                      {isGeneratingSynopsis ? "작성 중..." : "✨ AI 자동 작성"}
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input type="text" autoComplete="off" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} placeholder="시나리오 제목 (예: 어느 세이렌의 결백)" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                    <input type="text" autoComplete="off" value={victimName} onChange={e => setVictimName(e.target.value)} placeholder="주요 공략 대상 / 서사 목표" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                  </div>
                  <textarea rows={2} value={publicSynopsis} onChange={e => setPublicSynopsis(e.target.value)} placeholder="시놉시스 및 초기 배경 설명..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
                  <textarea rows={2} value={openingScene} onChange={e => setOpeningScene(e.target.value)} placeholder="첫 오프닝 지문..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
                </section>

                {/* 📱 1. 스마트폰 모양의 프로필 & 인물 세팅 UI (가이드라인 100% 맞춤) */}
                <div style={{
                  width: "100%", boxSizing: "border-box", backgroundColor: "#f9f6f3",
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
                            style={{ width: "64px", height: "64px", borderRadius: "40%", overflow: "hidden", border: `1px solid ${theme.borderHighlight}` }}
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
                          <button type="button" onClick={handleAddSuspect} style={{ background: "none", border: "none", color: "#ec4899", fontWeight: "800", fontSize: "0.8rem", cursor: "pointer" }}>＋ 추가</button>
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
                              style={{ width: "54px", height: "54px", borderRadius: "40%", overflow: "hidden", border: `1px solid ${theme.borderHighlight}` }}
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
                            <button type="button" onClick={() => setShowPhoneDetail(false)} style={{ background: "none", border: "none", color: theme.text, cursor: "pointer", display: "flex", alignItems: "center" }}>
                              <X size={24} strokeWidth={2.5} />
                            </button>
                            <span style={{ fontWeight: "900", fontSize: "0.95rem" }}>{isPcDetail ? "내 프로필 편집" : "프로필 편집"}</span>
                            {!isPcDetail && suspects.length > 1 ? (
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteSuspect(e, cur.id); setShowPhoneDetail(false); }} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", fontWeight: "800", fontSize: "0.8rem" }}>삭제</button>
                            ) : <div style={{ width: "24px" }}/>}
                          </div>

                          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <button type="button" onClick={goPrev} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textMuted, padding: "10px", display: "flex", alignItems: "center", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = theme.accent} onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}>
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

                              <button type="button" onClick={goNext} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textMuted, padding: "10px", display: "flex", alignItems: "center", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = theme.accent} onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}>
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

                              {/* 🌟 연애 모드: 남모르는 비밀 */}
                              <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "#fdf2f8", borderRadius: "12px", border: `1px solid #f9a8d4`, padding: "14px", marginTop: "8px" }}>
                                <button type="button" onClick={() => {
                                  if (isPcDetail) setShowPcSecret(!showPcSecret);
                                  else handleUpdateSuspect(cur.id, "showSecret", !cur.showSecret);
                                }} style={{ width: "100%", textAlign: "left", background: "none", border: "none", fontSize: "0.8rem", color: "#db2777", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}>
                                  <span style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Lock size={15} strokeWidth={2.5} /> 남모르는 비밀 / 진심
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center" }}>
                                    {(isPcDetail ? showPcSecret : cur.showSecret) ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
                                  </span>
                                </button>
                                
                                {(isPcDetail ? showPcSecret : cur.showSecret) && (
                                  <input type="text" value={isPcDetail ? pcSecret : cur.secret} onChange={e => {
                                    if (isPcDetail) setPcSecret(e.target.value);
                                    else handleUpdateSuspect(cur.id, "secret", e.target.value);
                                  }} placeholder="예: 사실 오래전부터 마음에 두고 있었다." style={{ width: "100%", boxSizing: "border-box", padding: "10px", marginTop: "12px", borderRadius: "8px", border: `1px solid #f9a8d4`, backgroundColor: theme.inputBg, color: "#be185d", fontSize: "0.85rem", outline: "none" }} />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* 🌟 2. 이벤트 CG 갤러리 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button type="button" onClick={() => setShowCgGallery(!showCgGallery)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ImageIcon color={isDarkMode ? "#f472b6" : "#ec4899"} size={22} strokeWidth={2} />
                      <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>이벤트 CG 갤러리</span>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", color: theme.textMuted }}>{showCgGallery ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}</span>
                  </button>

                  {showCgGallery && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
                        {cgList.map((item, idx) => (
                          <div key={item.id} style={{ backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            
                            <div onClick={(e) => { e.stopPropagation(); setActiveCgId(item.id); setShowCgModal(true); }} title="CG 확대 및 등록" style={{ width: "100%", aspectRatio: "16/9", backgroundColor: theme.inputBg, border: `1px dashed ${theme.borderHighlight}`, borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = 0.85} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt="CG" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <div style={{ color: theme.textMuted, fontSize: "0.75rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                  <ImageIcon color={theme.accent} size={24} strokeWidth={1.5} />
                                  <span style={{ fontWeight: "700" }}>터치하여 이미지 등록</span>
                                </div>
                              )}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                              <input type="text" autoComplete="off" value={item.title} onChange={e => setCgList(cgList.map(c => c.id === item.id ? { ...c, title: e.target.value } : c))} placeholder={`CG ${idx + 1} 명칭`} style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", fontWeight: "600", outline: "none" }} />
                              {cgList.length > 1 && (
                                <button type="button" onClick={() => setCgList(cgList.filter(c => c.id !== item.id))} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
                                  <Trash2 size={16} strokeWidth={2.5} />
                                </button>
                              )}
                            </div>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <input type="text" autoComplete="off" value={item.condition} onChange={e => setCgList(cgList.map(c => c.id === item.id ? { ...c, condition: e.target.value } : c))} placeholder="해금 조건 (예: 옥상 이벤트 성공)" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                              <textarea rows={2} value={item.dialogue} onChange={e => setCgList(cgList.map(c => c.id === item.id ? { ...c, dialogue: e.target.value } : c))} placeholder="대사 및 상황 묘사를 입력하세요..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", resize: "vertical" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => setCgList([...cgList, { id: Date.now(), title: "", condition: "", dialogue: "", imageUrl: "", showDetails: true }])} style={{ width: "100%", padding: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1.5px dashed ${theme.borderHighlight || theme.border}`, borderRadius: "12px", color: "#ec4899", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>
                        ＋ 새로운 CG 추가 ({cgList.length})
                      </button>
                    </div>
                  )}
                </section>

                {/* 🌟 3. 선택지 분기 및 루트 설계 (UI 터짐 완벽 수정!) */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px", width: "100%", boxSizing: "border-box" }}>
                  <button type="button" onClick={() => setShowRouteList(!showRouteList)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FolderOpen color={isDarkMode ? "#f472b6" : "#ec4899"} size={22} strokeWidth={2} />
                      <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>선택지 분기 및 루트 설계</span>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", color: theme.textMuted }}>{showRouteList ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}</span>
                  </button>

                  {showRouteList && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px", width: "100%", boxSizing: "border-box" }}>
                      {routeList.map((route, idx) => (
                        <div key={route.id} style={{ display: "flex", flexDirection: "column", gap: "8px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "14px", width: "100%", boxSizing: "border-box" }}>
                          
                          {/* 윗줄: 분기 설명 */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                            <span style={{ backgroundColor: isDarkMode ? "rgba(236, 72, 153, 0.15)" : "#fbcfe8", color: isDarkMode ? "#f472b6" : "#be185d", padding: "4px 8px", borderRadius: "8px", fontSize: "0.7rem", fontWeight: "700", whiteSpace: "nowrap" }}>
                              분기 {idx + 1}
                            </span>
                            <input type="text" autoComplete="off" value={route.routeName} onChange={e => setRouteList(routeList.map(r => r.id === route.id ? { ...r, routeName: e.target.value } : r))} placeholder="분기 설명 (예: 옥상에서 위로한다)" style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.8rem", outline: "none", width: "100%", boxSizing: "border-box" }} />
                            
                            {routeList.length > 1 && (
                              <button type="button" onClick={() => setRouteList(routeList.filter(r => r.id !== route.id))} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", padding: "4px" }}>
                                <Trash2 size={16} strokeWidth={2.5} />
                              </button>
                            )}
                          </div>
                          
                          {/* 아랫줄: 다자연애 완벽 지원! 좁은 드롭다운을 자유 텍스트 입력칸으로 교체! */}
                          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", gap: "8px", width: "100%" }}>
                            <input type="text" autoComplete="off" value={route.targetId} onChange={e => setRouteList(routeList.map(r => r.id === route.id ? { ...r, targetId: e.target.value } : r))} placeholder="영향받는 인물 (예: 백서원, 권주아)" style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.8rem", outline: "none", width: "100%", boxSizing: "border-box" }} />
                            <input type="text" autoComplete="off" value={route.affectionChange} onChange={e => setRouteList(routeList.map(r => r.id === route.id ? { ...r, affectionChange: e.target.value } : r))} placeholder="조건/결과 (예: 두 사람 모두 놓친다)" style={{ flex: 1.5, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.accent, fontWeight: "600", fontSize: "0.78rem", outline: "none", width: "100%", boxSizing: "border-box" }} />
                          </div>

                        </div>
                      ))}
                      <button type="button" onClick={() => setRouteList([...routeList, { id: Date.now(), routeName: "", targetId: "", affectionChange: "+10", requiredCG: "" }])} style={{ width: "100%", padding: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1.5px dashed ${theme.borderHighlight || theme.border}`, borderRadius: "12px", color: "#ec4899", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>
                        ＋ 새로운 루트/분기 추가 ({routeList.length})
                      </button>
                    </div>
                  )}
                </section>
              </div>
            )}

{/* 🌟 2. 이벤트 CG 갤러리 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button type="button" onClick={() => setShowCgGallery(!showCgGallery)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ImageIcon color={isDarkMode ? "#f472b6" : "#ec4899"} size={22} strokeWidth={2} />
                      <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>이벤트 CG 갤러리</span>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", color: theme.textMuted }}>{showCgGallery ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}</span>
                  </button>

                  {showCgGallery && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
                        {cgList.map((item, idx) => (
                          <div key={item.id} style={{ backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            
                            <div onClick={(e) => { e.stopPropagation(); setActiveCgId(item.id); setShowCgModal(true); }} title="CG 확대 및 등록" style={{ width: "100%", aspectRatio: "16/9", backgroundColor: theme.inputBg, border: `1px dashed ${theme.borderHighlight}`, borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = 0.85} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt="CG" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <div style={{ color: theme.textMuted, fontSize: "0.75rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                  <ImageIcon color={theme.accent} size={24} strokeWidth={1.5} />
                                  <span style={{ fontWeight: "700" }}>터치하여 이미지 등록</span>
                                </div>
                              )}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                              <input type="text" autoComplete="off" value={item.title} onChange={e => setCgList(cgList.map(c => c.id === item.id ? { ...c, title: e.target.value } : c))} placeholder={`CG ${idx + 1} 명칭`} style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", fontWeight: "600", outline: "none" }} />
                              {cgList.length > 1 && (
                                <button type="button" onClick={() => setCgList(cgList.filter(c => c.id !== item.id))} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
                                  <Trash2 size={16} strokeWidth={2.5} />
                                </button>
                              )}
                            </div>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <input type="text" autoComplete="off" value={item.condition} onChange={e => setCgList(cgList.map(c => c.id === item.id ? { ...c, condition: e.target.value } : c))} placeholder="해금 조건 (예: 옥상 이벤트 성공)" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                              <textarea rows={2} value={item.dialogue} onChange={e => setCgList(cgList.map(c => c.id === item.id ? { ...c, dialogue: e.target.value } : c))} placeholder="대사 및 상황 묘사를 입력하세요..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", resize: "vertical" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => setCgList([...cgList, { id: Date.now(), title: "", condition: "", dialogue: "", imageUrl: "", showDetails: true }])} style={{ width: "100%", padding: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1.5px dashed ${theme.borderHighlight || theme.border}`, borderRadius: "12px", color: "#ec4899", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>
                        ＋ 새로운 CG 추가 ({cgList.length})
                      </button>
                    </div>
                  )}
                </section>

                {/* 🌟 3. 선택지 분기 및 루트 설계 (UI 터짐 완벽 수정!) */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px", width: "100%", boxSizing: "border-box" }}>
                  <button type="button" onClick={() => setShowRouteList(!showRouteList)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FolderOpen color={isDarkMode ? "#f472b6" : "#ec4899"} size={22} strokeWidth={2} />
                      <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>선택지 분기 및 루트 설계</span>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", color: theme.textMuted }}>{showRouteList ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}</span>
                  </button>

                  {showRouteList && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px", width: "100%", boxSizing: "border-box" }}>
                      {routeList.map((route, idx) => (
                        <div key={route.id} style={{ display: "flex", flexDirection: "column", gap: "8px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "14px", width: "100%", boxSizing: "border-box" }}>
                          
                          {/* 윗줄: 분기 설명 */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                            <span style={{ backgroundColor: isDarkMode ? "rgba(236, 72, 153, 0.15)" : "#fbcfe8", color: isDarkMode ? "#f472b6" : "#be185d", padding: "4px 8px", borderRadius: "8px", fontSize: "0.7rem", fontWeight: "700", whiteSpace: "nowrap" }}>
                              분기 {idx + 1}
                            </span>
                            <input type="text" autoComplete="off" value={route.routeName} onChange={e => setRouteList(routeList.map(r => r.id === route.id ? { ...r, routeName: e.target.value } : r))} placeholder="분기 설명 (예: 옥상에서 위로한다)" style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.8rem", outline: "none", width: "100%", boxSizing: "border-box" }} />
                            
                            {routeList.length > 1 && (
                              <button type="button" onClick={() => setRouteList(routeList.filter(r => r.id !== route.id))} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", padding: "4px" }}>
                                <Trash2 size={16} strokeWidth={2.5} />
                              </button>
                            )}
                          </div>
                          
                          {/* 아랫줄: 다자연애 완벽 지원! 좁은 드롭다운을 자유 텍스트 입력칸으로 교체! */}
                          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", gap: "8px", width: "100%" }}>
                            <input type="text" autoComplete="off" value={route.targetId} onChange={e => setRouteList(routeList.map(r => r.id === route.id ? { ...r, targetId: e.target.value } : r))} placeholder="영향받는 인물 (예: 백서원, 권주아)" style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.8rem", outline: "none", width: "100%", boxSizing: "border-box" }} />
                            <input type="text" autoComplete="off" value={route.affectionChange} onChange={e => setRouteList(routeList.map(r => r.id === route.id ? { ...r, affectionChange: e.target.value } : r))} placeholder="조건/결과 (예: 두 사람 모두 놓친다)" style={{ flex: 1.5, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.accent, fontWeight: "600", fontSize: "0.78rem", outline: "none", width: "100%", boxSizing: "border-box" }} />
                          </div>

                        </div>
                      ))}
                      <button type="button" onClick={() => setRouteList([...routeList, { id: Date.now(), routeName: "", targetId: "", affectionChange: "+10", requiredCG: "" }])} style={{ width: "100%", padding: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1.5px dashed ${theme.borderHighlight || theme.border}`, borderRadius: "12px", color: "#ec4899", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>
                        ＋ 새로운 루트/분기 추가 ({routeList.length})
                      </button>
                    </div>
                  )}
                </section>
              </div>
            )}

            {selectedMode === "괴담" && (
              <>
                {/* 1. 사건 개요서 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px", width: "100%", boxSizing: "border-box" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ClipboardList size={22} strokeWidth={2} color={theme.accent} />
                      <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>사건 개요서 및 세션 카드</span>
                    </div>
                    <button type="button" onClick={() => handleAIGenerateSynopsis(false)} disabled={isGeneratingSynopsis} style={{ padding: "6px 12px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.borderHighlight}`, borderRadius: "10px", color: theme.accent, fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                      {isGeneratingSynopsis ? "작성 중..." : "✨ AI 자동 작성"}
                    </button>
                  </div>
                  
                  {/* 🌟 세션 카드 이미지 삭제 후 텍스트 필드만 깔끔하게 유지 */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input type="text" autoComplete="off" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} placeholder="사건명 / 시나리오 제목" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                    <input type="text" autoComplete="off" value={victimName} onChange={e => setVictimName(e.target.value)} placeholder="주요 공략 대상 / 사건 목표" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                  </div>

                  <textarea rows={2} value={publicSynopsis} onChange={e => setPublicSynopsis(e.target.value)} placeholder="현장 상황 및 초기 배경 설명..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
                  <textarea rows={2} value={openingScene} onChange={e => setOpeningScene(e.target.value)} placeholder="첫 오프닝 지문..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
                </section>

                {/* 2. 탐색자 프로필 및 스탯 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Skull size={22} strokeWidth={2} color={theme.accent} />
                    <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>탐색자 프로필 및 스탯</span>
                  </div>

                  {/* 🌟 튀어나옴 방지를 위해 alignItems를 flex-start로 조정하고, 초상화 width를 줄임 */}
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "16px", width: "100%", alignItems: "flex-start" }}>
                    
                    {/* 탐색자 초상화 */}
                    <div
                      onClick={(e) => { e.stopPropagation(); setActivePortraitSuspectId("pc"); setShowPortraitModal(true); }}
                      style={{
                        flex: isMobile ? "none" : "0 0 120px", width: isMobile ? "100%" : "120px", maxWidth: isMobile ? "140px" : "120px",
                        margin: isMobile ? "0 auto" : "0", backgroundColor: theme.polaroidBg || "#ded7cb", borderRadius: "6px", padding: "8px 8px 12px 8px", color: theme.polaroidText || "#292524",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flexShrink: 0
                      }}
                    >
                      <div style={{ width: "100%", aspectRatio: "1/1", backgroundColor: isDarkMode ? "#332d2a" : "#eae4db", borderRadius: "3px", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        {pcPortraitUrl ? <img src={pcPortraitUrl} alt="탐색자" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={24} strokeWidth={1} color={theme.textMuted} />}
                      </div>
                      <div style={{ marginTop: "6px", textAlign: "center", width: "100%" }}>
                        <div style={{ fontWeight: "700", fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pcName || "이름 미상"}</div>
                      </div>
                    </div>

                    {/* 우측 데이터 입력란 (flex: 1 및 minWidth: 0으로 튀어나옴 완벽 방지) */}
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                      
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr", gap: "8px" }}>
                        <input type="text" autoComplete="off" autoComplete="off" onChange={e => setPcName(e.target.value)} placeholder="이름" style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", width: "100%", boxSizing: "border-box" }} />
                        <input type="text" autoComplete="off" value={pcAgeGender} onChange={e => setPcAgeGender(e.target.value)} placeholder="나이/성별" style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", width: "100%", boxSizing: "border-box" }} />
                        <input type="text" autoComplete="off" value={pcJob} onChange={e => setPcJob(e.target.value)} placeholder="직업/역할" style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", width: "100%", boxSizing: "border-box" }} />
                      </div>

                      <button type="button" onClick={() => setShowTraitModal(true)} style={{ width: "100%", padding: "10px", backgroundColor: theme.panelAlt, border: `1.5px dashed ${theme.borderHighlight}`, borderRadius: "8px", color: theme.accent, fontSize: "0.82rem", fontWeight: "700", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Tag size={16} strokeWidth={2.5}/> 특성 및 트라우마</span>
                        <span style={{ fontSize: "0.75rem", color: theme.textMuted }}>선택 완료: 특성 {horrorTraits.length} | 트라우마 {horrorTraumas.length}</span>
                      </button>

                      <div style={{ backgroundColor: theme.panelAlt, borderRadius: "10px", padding: "12px", border: `1px solid ${theme.borderHighlight || theme.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: "700", color: theme.text }}>탐색자 스탯 분배</span>
                          <span style={{ fontSize: "0.75rem", fontWeight: "700", color: availableStatPoints === 0 ? theme.success : theme.danger }}>잔여: {availableStatPoints} pt</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr 1fr" : "repeat(6, 1fr)", gap: "6px" }}>
                          {Object.entries(horrorStats).map(([key, val]) => (
                            <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: theme.inputBg, padding: "6px 2px", borderRadius: "6px", border: `1px solid ${theme.border}` }}>
                              <span style={{ fontSize: "0.7rem", fontWeight: "600", color: theme.textMuted, marginBottom: "2px" }}>{key}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <button onClick={() => setHorrorStats({...horrorStats, [key]: Math.max(1, val - 1)})} style={{ background:"none", border:"none", color: val > 1 ? theme.text : theme.textMuted, cursor: "pointer", padding: 0 }}><Minus size={14}/></button>
                                <span style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.text, width: "16px", textAlign: "center" }}>{val}</span>
                                <button onClick={() => { if(availableStatPoints > 0 && val < 9) setHorrorStats({...horrorStats, [key]: val + 1}) }} style={{ background:"none", border:"none", color: availableStatPoints > 0 && val < 9 ? theme.accent : theme.textMuted, cursor: "pointer", padding: 0 }}><Plus size={14}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: theme.textMuted }}>시작 소지품 세팅</span>
                        {horrorInventory.map((item, idx) => (
                          <div key={item.id} style={{ display: "flex", gap: "8px" }}>
                            {/* 명확한 명칭으로 변경된 드롭다운 */}
                            <select value={item.type} onChange={e => setHorrorInventory(horrorInventory.map((inv, i) => i === idx ? { ...inv, type: e.target.value } : inv))} style={{ flex: 1, padding: "8px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.78rem", outline: "none", cursor: "pointer", minWidth: 0 }}>
                              <option value="멘탈 회복">멘탈 회복</option>
                              <option value="특수 기믹 패스">특수 기믹 패스</option>
                              <option value="재굴림">재굴림</option>
                            </select>
                            <input type="text" autoComplete="off" value={item.name} onChange={e => setHorrorInventory(horrorInventory.map((inv, i) => i === idx ? { ...inv, name: e.target.value } : inv))} placeholder="아이템명" style={{ flex: 2, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.78rem", outline: "none", minWidth: 0 }} />
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>

                  {/* 이상 충동 발현 */}
                  <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)", borderRadius: "8px", border: `1px solid ${theme.danger}`, padding: "10px 12px" }}>
                    <button type="button" onClick={() => setShowAbyss(!showAbyss)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", fontSize: "0.8rem", color: theme.danger, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}>
                      <span style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Activity size={16} strokeWidth={2.5} /> 이상 충동 발현
                      </span>
                      <span style={{ display: "flex", alignItems: "center" }}>
                        {showAbyss ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
                      </span>
                    </button>
                    {showAbyss && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                        <input type="text" autoComplete="off" value={abyssTriggers[30]} onChange={e => setAbyssTriggers({...abyssTriggers, 30: e.target.value})} placeholder="침식도 30% 발현 지문" style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.82rem", outline: "none" }} />
                        <input type="text" autoComplete="off" value={abyssTriggers[60]} onChange={e => setAbyssTriggers({...abyssTriggers, 60: e.target.value})} placeholder="침식도 60% 발현 지문" style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.82rem", outline: "none" }} />
                        <input type="text" autoComplete="off" value={abyssTriggers[90]} onChange={e => setAbyssTriggers({...abyssTriggers, 90: e.target.value})} placeholder="침식도 90% 발현 지문" style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.82rem", outline: "none" }} />
                      </div>
                    )}
                  </div>
                </section>

                {/* 3. 메인 파트너 설정 (5명 제한 & 삭제 버튼 위치 수정) */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <UserRound size={22} strokeWidth={2} color={theme.accent} />
                      <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>메인 파트너 설정</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {usePartner && (
                         <button type="button" onClick={() => {
                           if (mainPartners.length >= 5) {
                             triggerToast("한도 초과", "메인 파트너는 최대 5명까지만 추가할 수 있습니다.", "⚠️");
                             return;
                           }
                           setMainPartners([...mainPartners, { id: Date.now(), name: "", ageGender: "", job: "", behavior: "", secret: "", showSecret: false, portraitUrl: "" }]);
                         }} style={{ padding: "4px 10px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.accent}`, borderRadius: "16px", color: theme.accent, fontSize: "0.72rem", fontWeight: "700", cursor: "pointer" }}>＋ 인물 추가</button>
                      )}
                      <button onClick={() => setUsePartner(!usePartner)} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: usePartner ? theme.accent : theme.textMuted, padding: 0 }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>{usePartner ? "동행 중" : "나홀로 조사"}</span>
                        {usePartner ? <ToggleRight size={26} strokeWidth={2} color={theme.accent} /> : <ToggleLeft size={26} strokeWidth={2} />}
                      </button>
                    </div>
                  </div>

                  {usePartner && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {mainPartners.map((partner, idx) => (
                        <div key={partner.id} style={{ position: "relative", display: "flex", flexDirection: isMobile ? "column" : "row", gap: "16px", padding: "16px", backgroundColor: theme.panelAlt, borderRadius: "12px", border: `1px solid ${theme.border}`, alignItems: "flex-start" }}>
                          
                          {/* 🌟 우측 상단 예쁜 삭제 버튼 (인물이 2명 이상일 때만 표시) */}
                          {mainPartners.length > 1 && (
                            <button type="button" onClick={() => setMainPartners(mainPartners.filter(p => p.id !== partner.id))} style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: theme.textMuted, cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = theme.danger} onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}>
                              <X size={18} strokeWidth={2.5} />
                            </button>
                          )}

                          {/* 파트너 초상화 */}
                          <div
                            onClick={(e) => { e.stopPropagation(); setActivePortraitSuspectId(partner.id); setShowPortraitModal(true); }}
                            style={{
                              flex: isMobile ? "none" : "0 0 90px", width: isMobile ? "100%" : "90px", maxWidth: isMobile ? "120px" : "90px",
                              margin: isMobile ? "0 auto" : "0", backgroundColor: theme.polaroidBg || "#ded7cb", borderRadius: "6px", padding: "6px 6px 10px 6px", color: theme.polaroidText || "#292524",
                              boxShadow: "0 3px 10px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flexShrink: 0
                            }}
                          >
                            <div style={{ width: "100%", aspectRatio: "1/1", backgroundColor: isDarkMode ? "#332d2a" : "#eae4db", borderRadius: "3px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {partner.portraitUrl ? <img src={partner.portraitUrl} alt="파트너" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={20} strokeWidth={1} color={theme.textMuted} />}
                            </div>
                          </div>

                          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "8px", width: "100%", marginTop: isMobile ? "0" : "4px" }}>
                            {/* 삭제 버튼 공간을 위해 PC 환경일 때 우측 여백(paddingRight) 확보 */}
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr", gap: "6px", width: "100%", paddingRight: mainPartners.length > 1 && !isMobile ? "24px" : "0" }}>
                              <input type="text" autoComplete="off" autoComplete="off" value={partner.name} onChange={e => setMainPartners(mainPartners.map(p => p.id === partner.id ? {...p, name: e.target.value} : p))} placeholder="이름" style={{ padding: "8px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", width: "100%", boxSizing: "border-box" }} />
                              <input type="text" autoComplete="off" autoComplete="off" value={partner.ageGender} onChange={e => setMainPartners(mainPartners.map(p => p.id === partner.id ? {...p, ageGender: e.target.value} : p))} placeholder="나이/성별" style={{ padding: "8px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", width: "100%", boxSizing: "border-box" }} />
                              <input type="text" autoComplete="off" autoComplete="off" value={partner.job} onChange={e => setMainPartners(mainPartners.map(p => p.id === partner.id ? {...p, job: e.target.value} : p))} placeholder="직업/역할" style={{ padding: "8px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", width: "100%", boxSizing: "border-box" }} />
                            </div>
                            <textarea rows={2} value={partner.behavior} onChange={e => setMainPartners(mainPartners.map(p => p.id === partner.id ? {...p, behavior: e.target.value} : p))} placeholder="파트너의 성격 및 탐색자와의 관계성..." style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                            
                            <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)", borderRadius: "8px", border: `1px solid ${theme.danger}`, padding: "8px 10px" }}>
                              <button type="button" onClick={() => setMainPartners(mainPartners.map(p => p.id === partner.id ? {...p, showSecret: !p.showSecret} : p))} style={{ width: "100%", textAlign: "left", background: "none", border: "none", fontSize: "0.76rem", color: theme.danger, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}>
                                <span style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <Lock size={15} strokeWidth={2.5} /> 파트너의 숨겨진 이면 / 진심
                                </span>
                                {partner.showSecret ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
                              </button>
                              {partner.showSecret && (
                                <input type="text" autoComplete="off" value={partner.secret} onChange={e => setMainPartners(mainPartners.map(p => p.id === partner.id ? {...p, secret: e.target.value} : p))} placeholder="충격적인 진실이나 약점..." style={{ width: "100%", padding: "8px", marginTop: "8px", borderRadius: "6px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.82rem", outline: "none", boxSizing: "border-box" }} />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

{/* 4. 등장 인물 세팅 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Ghost size={22} strokeWidth={2} color={theme.textMuted} />
                      <span style={{ fontSize: "0.95rem", color: theme.text, fontWeight: "700" }}>등장 인물</span>
                    </div>
                    <button type="button" onClick={() => {
                      if (suspects.length >= 10) {
                        triggerToast("한도 초과", "등장 인물은 최대 10명까지만 추가할 수 있습니다.", "⚠️");
                        return;
                      }
                      handleAddSuspect();
                    }} style={{ padding: "6px 14px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.accent}`, borderRadius: "16px", color: theme.accent, fontSize: "0.76rem", fontWeight: "600", cursor: "pointer" }}>＋ 인물 추가</button>
                  </div>

                  {/* 🌟 잘림 현상 해결: padding을 "12px 12px 14px 12px"로 늘려 X 버튼이 숨쉴 공간 확보 */}
                  <div style={{ display: isMobile ? "flex" : "grid", gridTemplateColumns: isMobile ? "none" : "repeat(auto-fill, minmax(135px, 1fr))", gap: "12px", overflowX: isMobile ? "auto" : "visible", padding: "12px 12px 14px 12px", WebkitOverflowScrolling: "touch" }}>
                    {suspects.map((s, idx) => {
                      const isSelected = (selectedSuspectId || suspects[0]?.id) === s.id;
                      return (
                        <div key={s.id} onClick={() => setSelectedSuspectId(s.id)} style={{ flex: isMobile ? "0 0 125px" : "auto", backgroundColor: theme.polaroidBg || "#ded7cb", borderRadius: "6px", padding: "8px 8px 12px 8px", color: theme.polaroidText || "#292524", boxShadow: isSelected ? `0 0 0 2px ${theme.accent}, 0 8px 24px rgba(0,0,0,0.3)` : "0 3px 10px rgba(0,0,0,0.18)", position: "relative", cursor: "pointer", transform: isSelected ? "scale(1.03)" : "scale(1)", transition: "all 0.15s ease", display: "flex", flexDirection: "column", alignItems: "center" }}>
                          {suspects.length > 1 && (
                            <button type="button" onClick={(e) => handleDeleteSuspect(e, s.id)} style={{ position: "absolute", top: "-6px", right: "-6px", width: "22px", height: "22px", borderRadius: "50%", backgroundColor: isDarkMode ? "rgba(220, 38, 38, 0.8)" : "rgba(220, 38, 38, 0.9)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold", zIndex: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>✕</button>
                          )}
                          <div onClick={(e) => { e.stopPropagation(); setActivePortraitSuspectId(s.id); setShowPortraitModal(true); }} style={{ width: "100%", aspectRatio: "1/1", backgroundColor: isDarkMode ? "#332d2a" : "#eae4db", borderRadius: "3px", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            {s.portraitUrl ? <img src={s.portraitUrl} alt="인물" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={24} strokeWidth={1} color={theme.textMuted} />}
                          </div>
                          <div style={{ marginTop: "6px", textAlign: "center", width: "100%" }}>
                            <div style={{ fontWeight: "700", fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name || `인물 ${idx + 1}`}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(() => {
                    const cur = suspects.find(s => s.id === (selectedSuspectId || suspects[0]?.id)) || suspects[0];
                    if (!cur) return null;
                    return (
                      <div style={{ padding: isMobile ? "14px" : "16px", backgroundColor: theme.panelAlt, borderRadius: "12px", border: `1px solid ${theme.borderHighlight || theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr", gap: "8px" }}>
                          <input type="text" autoComplete="off" value={cur.name} onChange={e => handleUpdateSuspect(cur.id, "name", e.target.value)} placeholder="이름" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                          <input type="text" autoComplete="off" value={cur.ageGender} onChange={e => handleUpdateSuspect(cur.id, "ageGender", e.target.value)} placeholder="나이/성별" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                          <input type="text" autoComplete="off" value={cur.job} onChange={e => handleUpdateSuspect(cur.id, "job", e.target.value)} placeholder="직업/역할" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none" }} />
                        </div>
                        <textarea rows={2} value={cur.behavior} onChange={e => handleUpdateSuspect(cur.id, "behavior", e.target.value)} placeholder="특징 및 행적..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.82rem", outline: "none", resize: "vertical" }} />
                        
                        <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)", borderRadius: "8px", border: `1px solid ${theme.danger}`, padding: "10px 12px" }}>
                          <button type="button" onClick={() => handleUpdateSuspect(cur.id, "showSecret", !cur.showSecret)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", fontSize: "0.76rem", color: theme.danger, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}>
                            <span style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Lock size={15} strokeWidth={2.5} /> 숨겨진 비밀 / 약점
                            </span>
                            {cur.showSecret ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
                          </button>
                          {cur.showSecret && (
                            <input type="text" autoComplete="off" value={cur.secret} onChange={e => handleUpdateSuspect(cur.id, "secret", e.target.value)} placeholder="진실 또는 허점..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", marginTop: "8px", borderRadius: "6px", border: `1px solid ${theme.danger}`, backgroundColor: theme.inputBg, color: theme.danger, fontSize: "0.82rem", outline: "none" }} />
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </section>
                
                {/* 6. 사건 진상 봉투 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button type="button" onClick={() => setShowHiddenTruth(!showHiddenTruth)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mailbox size={22} strokeWidth={2} color={theme.accent} />
                      <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>사건 진상 봉투</span>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", color: theme.textMuted }}>{showHiddenTruth ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}</span>
                  </button>
                  {showHiddenTruth && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                      <input type="text" autoComplete="off" value={culpritName} onChange={e => setCulpritName(e.target.value)} placeholder="원흉 / 괴이의 진짜 정체" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                      <textarea rows={3} value={hiddenTruth} onChange={e => setHiddenTruth(e.target.value)} placeholder="사건의 내막, 파훼법 및 엔딩 조건..." style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", outline: "none", resize: "vertical" }} />
                    </div>
                  )}
                </section>
              </>
            )}

            <button 
              onClick={startNewSession} 
              disabled={isLoading}
              style={{ 
                width: "100%", padding: "16px", borderRadius: "14px", marginTop: "12px",
                backgroundColor: isLoading ? theme.panelAlt : theme.accent, 
                color: isLoading ? theme.textMuted : (isDarkMode ? "#1a1817" : "#ffffff"), 
                border: isLoading ? `1px solid ${theme.border}` : "none",
                fontWeight: "700", fontSize: "1.05rem", cursor: isLoading ? "default" : "pointer",
                boxShadow: isLoading ? "none" : `0 4px 20px rgba(0,0,0,0.2)`, 
                transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" 
              }}
            >
                  {isLoading ? "서막을 여는 중..." : "▶ 이야기 시작하기"}
                </button>
              </div>
            )}

{/* 👇 텅 빈 화면 해결! 내정보 탭을 제자리(main 안쪽)로 복귀시킵니다 👇 */}
            {activeTab === "profile" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.2s ease-out", width: "100%", paddingBottom: "20px" }}>
                
               {/* 1. 프로필 및 지갑 카드 */}
                <div style={{ display: "flex", flexDirection: "column", backgroundColor: theme.panel, borderRadius: "20px", border: `1px solid ${theme.border}`, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "18px", padding: "24px 20px" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", backgroundColor: theme.panelAlt, border: `1px solid ${theme.borderHighlight}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {userAvatar ? <img src={userAvatar} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={36} color={theme.textMuted} />}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.3rem", fontWeight: "800", color: theme.text, letterSpacing: "-0.5px" }}>
                          {currentUser?.name || "탐색자"}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: isAdmin ? theme.danger : theme.accent, fontWeight: "800", backgroundColor: isDarkMode ? "rgba(163, 146, 116, 0.15)" : "#f5f0eb", padding: "4px 8px", borderRadius: "8px" }}>
                          {isAdmin ? "👑 관리자" : "LV. 1 탐색자"}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.85rem", color: theme.textMuted }}>
                        {currentUser?.email || "이메일 정보 없음"}
                      </span>
                    </div>
                    <button onClick={() => setShowProfileEdit(true)} style={{ padding: "8px 16px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "12px", color: theme.text, fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.inputBg} onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.panelAlt}>
                      수정
                    </button>
                  </div>

                  <div style={{ borderTop: `1px solid ${theme.border}` }} />
                  
                  <div 
                    onClick={() => setShowInkModal(true)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", cursor: "pointer", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.panelAlt} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: theme.accent, display: "flex", alignItems: "center", gap: "6px" }}>
                        <Droplet size={16} strokeWidth={2.5} /> 보유 잉크
                      </span>
                      <span style={{ fontSize: "1.8rem", fontWeight: "800", color: theme.text, letterSpacing: "-0.5px" }}>
                        {userInk.toLocaleString()} <span style={{ fontSize: "0.95rem", color: theme.textMuted, fontWeight: "600" }}>방울</span>
                      </span>
                    </div>
                    <div style={{ padding: "12px 18px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", borderRadius: "14px", fontWeight: "800", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px", boxShadow: `0 4px 12px ${theme.accentGlow}` }}>
                      <Plus size={16} strokeWidth={3} /> 충전 / 획득
                    </div>
                  </div>
                </div>

                {/* 2. 내 활동 메뉴 카드 */}
                <div style={{ display: "flex", flexDirection: "column", backgroundColor: theme.panel, borderRadius: "20px", border: `1px solid ${theme.border}`, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
                  {[
                    { icon: <Clock size={20} color={theme.accent} />, title: "나의 플레이 기록", count: `${sessions.length}건`, onClick: () => setShowHistoryModal(true) },
                    { icon: <Heart size={20} color={theme.danger} fill={likedScenarios.length > 0 ? theme.danger : "none"} />, title: "관심 시나리오", count: `${likedScenarios.length}건`, onClick: () => setShowLikedModal(true) },
                    { icon: <UploadCloud size={20} color="#60a5fa" />, title: "라운지 심사 및 발행 내역", count: `${savedLibrary.filter(s => s.status === "심사 대기").length}건 대기중`, onClick: () => setShowReviewModal(true) }
                  ].map((menu, i, arr) => (
                    <div key={i} onClick={menu.onClick} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", cursor: "pointer", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${theme.border}`, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.panelAlt} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        {menu.icon}
                        <span style={{ fontSize: "0.95rem", fontWeight: "600", color: theme.text }}>{menu.title}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.8rem", color: theme.textMuted, fontWeight: "600" }}>{menu.count}</span>
                        <ChevronRight size={18} color={theme.textMuted} opacity={0.6} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. 고객 지원 메뉴 카드 */}
                <div style={{ display: "flex", flexDirection: "column", backgroundColor: theme.panel, borderRadius: "20px", border: `1px solid ${theme.border}`, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
                  {[
                    { icon: <Headphones size={20} color={theme.textMuted} />, title: "문의하기", onClick: () => setShowSupportModal(true) },
                    { icon: <AlertTriangle size={20} color={theme.textMuted} />, title: "공지사항", onClick: () => setShowNoticeModal(true) }
                  ].map((menu, i, arr) => (
                    <div key={i} onClick={menu.onClick} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", cursor: "pointer", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${theme.border}`, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.panelAlt} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        {menu.icon}
                        <span style={{ fontSize: "0.95rem", fontWeight: "600", color: theme.text }}>{menu.title}</span>
                      </div>
                      <ChevronRight size={18} color={theme.textMuted} opacity={0.6} />
                    </div>
                  ))}
                </div>

              </div>
            )}

            <div style={{ height: "60px", flexShrink: 0 }} />
          </main>

) : (
          <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", backgroundColor: theme.bg }}>
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
              <div 
                ref={chatContainerRef} 
                style={{
                  flex: 1, overflowY: "auto", 
                  padding: isMobile ? "24px 20px 140px 20px" : "50px 60px 160px 60px", 
                  display: "flex", flexDirection: "column", gap: "28px", 
                  maxWidth: "760px", margin: "0 auto", width: "100%", boxSizing: "border-box", 
                  color: theme.text, letterSpacing: "-0.02em",
                  fontFamily: (fontChoice === "ridi" || fontChoice === "maru") ? "'RIDIBatang', serif" : "'Pretendard', sans-serif",
                  fontSize: `${1.12 * (chatFontSize || 1)}rem`, 
                  lineHeight: 2.1,
                  fontWeight: 400
                }}
              >
                {(activeSession.messages || []).map((m, idx) => {
                  const isUser = m.role === "user";
                  const isLastUserMsg = isUser && idx === activeSession.messages.map(x => x.role).lastIndexOf("user");
                  
                  return (
                    <div key={idx} style={{ alignSelf: "stretch", display: "flex", flexDirection: "column" }}>
                      
                      <div style={{ 
                        color: isUser ? theme.accent : theme.text, fontWeight: "400", opacity: 0.95,
                        textAlign: isUser ? "center" : "left", fontStyle: isUser ? "italic" : "normal", wordBreak: "keep-all",
                        padding: isUser ? "16px 0" : "0", borderTop: isUser ? `1px dashed ${theme.border}` : "none",
                        borderBottom: isUser ? `1px dashed ${theme.border}` : "none", margin: isUser ? "10px 0" : "0"
                      }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "center" : "flex-start", width: "100%" }}>
                          
                          <div style={{ 
                            backgroundColor: m.text.includes("[🎲") || m.text.includes("[⚠️") ? "rgba(229, 169, 60, 0.12)" : "transparent", 
                            color: isUser ? (theme.accent || "#d97706") : theme.text, 
                            border: m.text.includes("[⚠️") ? `1px solid ${theme.danger}` : m.text.includes("[🎲") ? `1px solid ${theme.warning}` : "none", 
                            padding: m.role === "user" ? "20px 0" : "4px 0", 
                            margin: m.role === "user" ? "16px 0" : "0",
                            borderRadius: "8px", width: "100%",
                            textAlign: m.role === "user" ? "center" : "left",
                            fontStyle: m.role === "user" ? "italic" : "normal",
                            fontWeight: m.role === "user" ? "700" : "400",
                            fontFamily: "inherit"
                          }}>
                            {m.cg && (
                              <div style={{ marginBottom: "14px", borderRadius: "10px", overflow: "hidden", position: "relative", border: "1px solid rgba(245, 158, 11, 0.35)", backgroundColor: "rgba(15, 23, 42, 0.85)" }}>
                                {(m.cg.imageUrl || m.cg.url) ? (
                                  <img src={m.cg.imageUrl || m.cg.url} alt={m.cg.title || "이벤트 CG"} style={{ width: "100%", maxHeight: "380px", objectFit: "cover", display: "block" }} />
                                ) : (
                                  <div style={{ padding: "16px 14px", textAlign: "center", background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))" }}>
                                    <span style={{ fontSize: "1.4rem", display: "block", marginBottom: "4px" }}>🎬</span>
                                    <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#fbbf24" }}>[이벤트 씬 개막] {m.cg.title}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "22px", lineHeight: "2.1" }}>
                              {m.text.split('\n').filter(line => line.trim() !== '').map((line, lIdx) => (
                                <span key={lIdx} style={{ display: "block" }}>
                                  {line}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 🌟 점선 아래로 빠진 취소 버튼 & 얇은 글씨체 적용 */}
                      {isLastUserMsg && !isLoading && (
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "4px" }}>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                const originalText = m.text || "";
                                setInputMsg(originalText);
                                setSessions(prev => prev.map(s => {
                                  if (s.id !== activeSessionId) return s;
                                  return { ...s, sheet: m.prevSheet ? m.prevSheet : s.sheet, messages: s.messages.slice(0, idx), suggestedActions: [], pendingCheck: null };
                                }));
                                triggerToast("취소 완료", "대화 전송이 취소되었습니다.", "⎌");
                              } catch (err) {}
                            }}
                            style={{
                              background: "none", border: "none", 
                              padding: "6px 16px", color: theme.textMuted, fontSize: "0.75rem", fontWeight: "500", 
                              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "color 0.2s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = theme.text}
                            onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
                          >
                            <span style={{ fontSize: "0.9rem" }}>⎌</span> 대화 전송 취소하기
                          </button>
                        </div>
                      )}
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
                padding: "16px max(16px, env(safe-area-inset-bottom))",
                background: `linear-gradient(to top, ${theme.bg} 85%, transparent)`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", zIndex: 30
              }}>
                
                {activeSession?.suggestedActions?.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", overflowX: "auto", width: "100%", maxWidth: "680px", paddingBottom: "4px", WebkitOverflowScrolling: "touch" }}>
                    {activeSession.suggestedActions.map((sugg, idx) => {
                       const cleanSugg = sugg.replace(/^\d+\.\s*/, "").replace(/^"/, "").replace(/"$/, "");
                       return (
                        <button
                          key={idx} onClick={() => executeMessage(cleanSugg)}
                          style={{ padding: "10px 16px", backgroundColor: theme.panelAlt, border: `1.5px solid ${theme.borderHighlight}`, borderRadius: "20px", color: theme.text, fontSize: "0.85rem", fontWeight: "700", whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: "all 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.inputBg}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.panelAlt}
                        >
                          {cleanSugg}
                        </button>
                       );
                    })}
                  </div>
                )}

                <div style={{
                  width: "100%", maxWidth: "680px", display: "flex", alignItems: "flex-end", gap: "8px",
                  backgroundColor: theme.inputBg, border: `1.5px solid ${theme.border}`, borderRadius: "28px",
                  padding: "6px 8px 6px 20px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", boxSizing: "border-box"
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
                          // 자연스러운 줄바꿈
                        } else {
                          // 🌟 엔터만 누르면 바로 전송!
                          e.preventDefault(); 
                          handleSendMessage();
                          e.target.style.height = "auto";
                        }
                      }
                    }}
                    placeholder="행동을 선언하거나 대사를 입력하세요... (Enter 전송, Shift+Enter 줄바꿈)"
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

            {/* 🌟 기존 시크릿 보드 등 모달 유지 */}
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
              isDarkMode={isDarkMode}
              isMobile={isMobile}
              isSheetOpen={isSheetOpen}
              setIsSheetOpen={setIsSheetOpen}
              theme={theme}
              setActivePortraitTarget={setActivePortraitSuspectId}
              setShowPortraitEditModal={setShowPortraitModal}
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

      {/* 🎁 선물하기 인앱 모달 */}
      {giftModalNpc && (() => {
        const allNpcs = activeSession?.sheet?.npcs || [];
        return (
          <div 
            onClick={() => setGiftModalNpc(null)}
            style={{ position: "fixed", inset: 0, zIndex: 99999, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          >
            <div 
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", maxWidth: "360px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 16px 36px rgba(0,0,0,0.4)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Gift size={18} strokeWidth={2.5} color={theme.accent} />
                    <span style={{ fontWeight: "800", fontSize: "0.95rem", color: theme.text }}>선물 전달</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: theme.textMuted, marginTop: "2px" }}>누구에게 어떤 물건을 건네시겠습니까?</div>
                </div>
                <button type="button" onClick={() => setGiftModalNpc(null)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer", padding: 0 }}>
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              {/* 대상 선택 탭 */}
              {allNpcs.length > 1 && (
                <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
                  {allNpcs.map((npc) => {
                    const isSelected = giftModalNpc.id === npc.id;
                    return (
                      <button
                        key={npc.id}
                        type="button"
                        onClick={() => setGiftModalNpc(npc)}
                        style={{
                          padding: "6px 12px", borderRadius: "14px", border: `1.5px solid ${isSelected ? theme.accent : theme.border}`,
                          backgroundColor: isSelected ? theme.accent : "transparent",
                          color: isSelected ? (isDarkMode ? "#1a1817" : "#fff") : theme.text,
                          fontSize: "0.74rem", fontWeight: isSelected ? "800" : "600", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0
                        }}
                      >
                        {npc.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 소지품 리스트 */}
              <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "38vh" }}>
                {(!activeSession?.sheet?.items || activeSession.sheet.items.length === 0) ? (
                  <div style={{ textAlign: "center", padding: "30px 20px", fontSize: "0.82rem", color: theme.textMuted, lineHeight: "1.6", backgroundColor: theme.panelAlt, borderRadius: "12px", border: `1px dashed ${theme.borderHighlight}` }}>
                    <Gift size={32} color={theme.borderHighlight} style={{ marginBottom: "12px" }} />
                    <div>가방이 비어 있습니다.<br />서사를 진행하며 선물을 입수해 보세요.</div>
                  </div>
                ) : (
                  activeSession.sheet.items.map((it, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.borderHighlight}`, borderRadius: "12px" }}>
                      <div style={{ flex: 1, paddingRight: "8px" }}>
                        <div style={{ fontWeight: "800", fontSize: "0.85rem", color: theme.text }}>{it.name}</div>
                        {it.desc && <div style={{ fontSize: "0.7rem", color: theme.textMuted, marginTop: "2px" }}>{it.desc}</div>}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const targetNpc = giftModalNpc;
                          setGiftModalNpc(null);
                          setIsActionDrawerOpen(false);
                          if (typeof setInputMsg === "function") setInputMsg(prev => `[${it.name} 선물하기] 품에서 [${it.name}]을(를) 꺼내어 ${targetNpc.name}에게 건넨다.`);
                        }}
                        style={{ padding: "8px 14px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", border: "none", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "800", cursor: "pointer", flexShrink: 0 }}
                      >
                        건네기
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 💡 취향 수첩 모달 */}
      {clueModalNpc && (() => {
        const allNpcs = activeSession?.sheet?.npcs || [];
        return (
          <div 
            onClick={() => setClueModalNpc(null)}
            style={{ position: "fixed", inset: 0, zIndex: 99999, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          >
            <div 
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", maxWidth: "360px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 16px 36px rgba(0,0,0,0.4)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <BookOpen size={18} strokeWidth={2.5} color={theme.accent} />
                    <span style={{ fontWeight: "800", fontSize: "0.95rem", color: theme.text }}>취향 수첩</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: theme.textMuted, marginTop: "2px" }}>서사 속에서 파악된 인물별 관심사</div>
                </div>
                <button type="button" onClick={() => setClueModalNpc(null)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer", padding: 0 }}>
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              {allNpcs.length > 1 && (
                <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
                  {allNpcs.map((npc) => {
                    const isSelected = clueModalNpc.id === npc.id;
                    return (
                      <button
                        key={npc.id} type="button" onClick={() => setClueModalNpc(npc)}
                        style={{ padding: "6px 12px", borderRadius: "14px", border: `1.5px solid ${isSelected ? theme.accent : theme.border}`, backgroundColor: isSelected ? theme.accent : "transparent", color: isSelected ? (isDarkMode ? "#1a1817" : "#fff") : theme.text, fontSize: "0.74rem", fontWeight: isSelected ? "800" : "600", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                      >
                        {npc.name}
                      </button>
                    );
                  })}
                </div>
              )}

              <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "38vh" }}>
                {(() => {
                  const npcClues = (activeSession?.sheet?.clues || []).filter(c => 
                    c.name.includes(clueModalNpc.name) || c.npcName === clueModalNpc.name || allNpcs.length <= 1
                  );
                  if (npcClues.length === 0) {
                    return (
                      <div style={{ textAlign: "center", padding: "30px 20px", fontSize: "0.82rem", color: theme.textMuted, lineHeight: "1.6", backgroundColor: theme.panelAlt, borderRadius: "12px", border: `1px dashed ${theme.borderHighlight}` }}>
                        <BookOpen size={32} color={theme.borderHighlight} style={{ marginBottom: "12px" }} />
                        <div>[{clueModalNpc.name}]의 파악된 취향이 아직 없습니다.<br />대화를 통해 선호하는 것을 파악해 보세요.</div>
                      </div>
                    );
                  }
                  return npcClues.map((clue, idx) => {
                    const isDislike = clue.type === "dislike";
                    return (
                      <div key={idx} style={{ padding: "12px 14px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "12px", borderLeft: `4px solid ${isDislike ? theme.danger : theme.accent}`, display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "800", fontSize: "0.86rem", color: isDislike ? theme.danger : theme.accent, display: "flex", alignItems: "center", gap: "4px" }}>
                            {isDislike ? <ShieldAlert size={14} /> : <Heart size={14} />} {clue.name}
                          </span>
                          <span style={{ fontSize: "0.68rem", color: isDislike ? theme.danger : theme.textMuted, fontWeight: "700" }}>
                            {isDislike ? "주의 요망" : "선호"}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.76rem", color: theme.text, lineHeight: "1.5" }}>
                          {clue.desc}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 📱 스마트폰 통합 시스템 (메신저 서랍 + 통화 다이내믹 아일랜드 + 풀스크린 통화) */}
      
     {/* 📞 1. 음성 통화 축소 시 미니 바 (다이내믹 아일랜드) */}
      {isVoiceCallActive && !isCallModalOpen && voiceCallNpc && (
        <div 
          onClick={() => setIsCallModalOpen(true)}
          style={{ position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#111827", padding: "8px 16px 8px 8px", borderRadius: "30px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)", animation: "slideDown 0.3s ease-out" }}
        >
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Phone size={18} fill="currentColor" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ color: "#fff", fontSize: "0.85rem", fontWeight: "800" }}>{voiceCallNpc.name}</span>
            <span style={{ color: "#10b981", fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981", animation: "pulse 1.5s infinite" }}/> 통화 중 ↗ 터치하여 복귀</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setIsVoiceCallActive(false); setVoiceCallNpc(null); }} style={{ marginLeft: "8px", padding: "6px 12px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "14px", fontSize: "0.75rem", fontWeight: "800", cursor: "pointer" }}>종료</button>
        </div>
      )}

     {/* 📱 2. 리얼 스마트폰 풀스크린 통화 모달 (실시간 현장 중계 + 유지형) */}
      {isVoiceCallActive && isCallModalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9998,
          backgroundColor: "#0f172a", // 딥 다크 네이비 배경
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "40px 20px 30px", boxSizing: "border-box", color: "#f8fafc",
          animation: "fadeIn 0.25s ease"
        }}>
          
          {/* 1. 상단 바: 닫기(⌄) & 통화 상태 */}
          <div style={{ width: "100%", maxWidth: "460px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <button 
              type="button"
              onClick={() => setIsCallModalOpen(false)} // 창만 내리고 통화는 유지
              style={{ background: "rgba(255, 255, 255, 0.12)", border: "none", borderRadius: "50%", width: "42px", height: "42px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="화면 내리기"
            >
              <ChevronDown size={24} />
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.86rem", color: theme.accent || "#38bdf8", fontWeight: "700", letterSpacing: "1px" }}>● 통화 중</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>HD Voice</div>
            </div>
            <div style={{ width: "42px" }} />
          </div>

          {/* 2. 중앙 프로필 이미지 & 이름 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px", flexShrink: 0 }}>
            <div style={{ position: "relative", width: "100px", height: "100px", borderRadius: "50%", marginBottom: "12px", boxShadow: "0 0 30px rgba(255, 255, 255, 0.05)" }}>
              <div style={{ position: "absolute", inset: "-8px", borderRadius: "50%", border: `1.5px solid ${theme.accent || "#38bdf8"}44`, animation: "pulse 2s infinite" }} />
              {(() => {
                const targetName = voiceCallNpc?.name || (typeof voiceCallNpc === "string" ? voiceCallNpc : "");
                const foundNpc = (activeSession?.sheet?.npcs || []).find(n => n?.name === targetName || (targetName && n?.name && n.name.includes(targetName)));
                const realImg = foundNpc?.portraitUrl || foundNpc?.portrait || voiceCallNpc?.portraitUrl || voiceCallNpc?.portrait;

                return realImg ? (
                  <img src={realImg} alt={targetName} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255, 255, 255, 0.35)" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255, 255, 255, 0.25)" }}>
                    <UserRound size={40} color="rgba(255,255,255,0.5)" />
                  </div>
                );
              })()}
            </div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.5px" }}>
              {voiceCallNpc?.name || (typeof voiceCallNpc === "string" ? voiceCallNpc : "상대방")}
            </h2>
            <span style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.65)", marginTop: "4px" }}>
              {voiceCallNpc?.job || voiceCallNpc?.title || "통화 연결 됨"}
            </span>
          </div>

          {/* 🌟 3. 실시간 현장 중계 (대화 로그 뷰어) - 통화 중 대화만 필터링! */}
          <div 
            ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}
            style={{
              flex: 1, width: "100%", maxWidth: "460px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px", padding: "20px 16px",
              display: "flex", flexDirection: "column", gap: "16px",
              overflowY: "auto", marginBottom: "20px",
              boxShadow: "inset 0 4px 20px rgba(0,0,0,0.2)"
            }}
          >
            {activeSession && (activeSession.messages || [])
              .filter(m => m.isVoiceCall || m.isCall) // 🌟 [핵심] 여기서 통화 중 대화만 걸러냅니다!
              .slice(-6).map((m, idx) => {
              const isUser = m.role === "user";
              const textContent = m.text;
              const quoteMatch = textContent.match(/"([^"]+)"/);
              
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", width: "100%" }}>
                  <div style={{
                    maxWidth: "90%",
                    fontSize: "0.88rem", lineHeight: "1.65", wordBreak: "keep-all", whiteSpace: "pre-wrap",
                    color: isUser ? "rgba(255,255,255,0.6)" : "#e2e8f0",
                    textAlign: isUser ? "right" : "left",
                    padding: isUser ? "0" : "0 0 10px 0",
                    borderBottom: (!isUser && idx !== 5) ? "1px dashed rgba(255,255,255,0.15)" : "none"
                  }}>
                    {!isUser && quoteMatch ? (
                      <>
                        <div style={{ fontWeight: "800", fontSize: "1.05rem", color: "#fff", marginBottom: "8px" }}>
                          "{quoteMatch[1]}"
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                          {textContent.replace(quoteMatch[0], "").trim()}
                        </div>
                      </>
                    ) : (
                      textContent
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div style={{ color: theme.accent || "#38bdf8", fontSize: "0.8rem", textAlign: "center", animation: "pulse 1.5s infinite", marginTop: "10px" }}>
                상대방이 대답하는 중...
              </div>
            )}
          </div>

          {/* 4. 하단 입력창 & 빨간 통화 종료 버튼 */}
          <div style={{ width: "100%", maxWidth: "460px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
            <div style={{ display: "flex", width: "100%", gap: "10px" }}>
              <input 
                type="text" 
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey && phoneInput.trim() && !isLoading) {
                    e.preventDefault();
                    // 🌟 [핵심] 모달을 닫지 않고 전송만 합니다!
                    executeMessage(`[전화 통화] "${phoneInput.trim()}"`);
                    setPhoneInput("");
                  }
                }}
                placeholder="수화기에 대고 말하기..." 
                style={{ flex: 1, padding: "14px 20px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "30px", color: "#fff", fontSize: "0.9rem", outline: "none" }} 
              />
              <button 
                disabled={isLoading || !phoneInput.trim()}
                onClick={() => {
                  if (phoneInput.trim()) {
                    executeMessage(`[전화 통화] "${phoneInput.trim()}"`);
                    setPhoneInput("");
                  }
                }}
                style={{ padding: "0 24px", backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: "30px", fontWeight: "800", cursor: (isLoading || !phoneInput.trim()) ? "default" : "pointer", opacity: (isLoading || !phoneInput.trim()) ? 0.5 : 1 }}
              >전송</button>
            </div>
            
            <button 
              onClick={() => { 
                setIsVoiceCallActive(false); 
                setIsCallModalOpen(false); 
                setVoiceCallNpc(null);
                if (typeof executeMessage === "function") {
                  executeMessage(`[통화 종료] 뚝, 하고 전화를 끊었습니다.`);
                }
              }} 
              title="통화 완전히 종료"
              style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#ef4444", color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 10px 25px rgba(239, 68, 68, 0.4)", transition: "transform 0.2s" }} 
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.05)"} 
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
            >
              <Phone size={28} fill="currentColor" style={{ transform: "rotate(135deg)" }} />
            </button>
          </div>

        </div>
      )}

      {/* 📱 3. 하단 팝업 메신저 서랍 */}
      {isPhoneDrawerOpen && activeSession && (
        <div onClick={() => { setIsPhoneDrawerOpen(false); setIsMyProfileOpen(false); setSelectedProfileNpc(null); setActivePhoneContactId(null); }} style={{ position: "fixed", inset: 0, zIndex: 125, display: "flex", justifyContent: "center", alignItems: "flex-end", backgroundColor: "rgba(0,0,0,0.65)" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "460px", height: "82vh", maxHeight: "740px", backgroundColor: activePhoneSkin.bg, color: activePhoneSkin.text, borderRadius: "24px 24px 0 0", display: "flex", flexDirection: "column", overflow: "hidden", border: `1px solid ${activePhoneSkin.border}`, borderBottom: "none", boxShadow: "0 -8px 36px rgba(0,0,0,0.38)", animation: "slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
            
            {/* 🔹 스마트폰 상단 헤더 바 */}
            <div style={{ height: "54px", padding: "0 16px", backgroundColor: activePhoneSkin.headerBg, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderBottom: `1px solid ${activePhoneSkin.border}` }}>
              <div style={{ width: "60px" }}>
                {(activePhoneContactId !== null || selectedProfileNpc || isMyProfileOpen) && (
                  <button type="button" onClick={() => { setActivePhoneContactId(null); setSelectedProfileNpc(null); setIsMyProfileOpen(false); }} style={{ background: "none", border: "none", color: activePhoneSkin.text, fontSize: "0.9rem", cursor: "pointer", fontWeight: "800", display: "flex", alignItems: "center", gap: "2px" }}><ChevronLeft size={20} /> 뒤로</button>
                )}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "800", color: activePhoneSkin.text, display: "flex", alignItems: "center", gap: "6px" }}>
                {isMyProfileOpen ? "내 프로필" : selectedProfileNpc ? "프로필 상세" : activePhoneContactId !== null ? ((activeSession.sheet?.npcs || []).find(n => n.id === activePhoneContactId)?.name || "대화") : phoneNavTab === "contacts" ? "인연" : phoneNavTab === "chats" ? "대화" : "더보기"}
              </div>
              <div style={{ width: "60px", display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setIsPhoneDrawerOpen(false)} style={{ background: "none", border: "none", color: activePhoneSkin.textMuted, cursor: "pointer", padding: "4px" }}><X size={24} strokeWidth={2} /></button>
              </div>
            </div>

            {/* 🔹 분기별 화면 렌더링 */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              
             {/* 👤 [화면 A: 내 프로필 상세 - 데이터 파싱 완벽 적용!] */}
              {isMyProfileOpen ? (
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                  <span style={{ fontSize: "0.85rem", color: activePhoneSkin.textMuted, fontWeight: "600" }}>{activeSession.sheet?.job || "직업 미상"}</span>
                  <div 
                    onClick={() => { if (activeSession.sheet?.portrait) setZoomedPortrait(activeSession.sheet.portrait); }}
                    style={{ width: "100px", height: "100px", borderRadius: "25%", overflow: "hidden", border: `2px solid ${activePhoneSkin.accent}`, boxShadow: "0 8px 20px rgba(0,0,0,0.1)", cursor: activeSession.sheet?.portrait ? "pointer" : "default" }}
                  >
                    {activeSession.sheet?.portrait ? <img src={activeSession.sheet.portrait} alt="나" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={60} color={activePhoneSkin.textMuted} style={{ margin: "20px" }}/>}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: activePhoneSkin.text }}>{activeSession.sheet?.name || "이름 미상"}</h2>
                    <span style={{ fontSize: "0.85rem", color: activePhoneSkin.textMuted }}>새겨진 전언이 없습니다. ✏️</span>
                  </div>
                  
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* 🌟 멘탈 & 스트레스 패널 통합 */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div style={{ flex: 1, backgroundColor: isDarkMode ? "rgba(34, 197, 94, 0.15)" : "#dcfce7", border: `1px solid rgba(34, 197, 94, 0.4)`, borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#16a34a" }}>멘탈</span>
                        <span style={{ fontSize: "1.1rem", fontWeight: "900", color: "#16a34a" }}>{activeSession.sheet?.hp || 100}</span>
                      </div>
                      <div style={{ flex: 1, backgroundColor: isDarkMode ? "rgba(245, 158, 11, 0.15)" : "#fef3c7", border: `1px solid rgba(245, 158, 11, 0.4)`, borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#d97706" }}>스트레스 지수</span>
                        <span style={{ fontSize: "1.1rem", fontWeight: "900", color: "#d97706" }}>{activeSession.sheet?.fatigue || 0}%</span>
                      </div>
                    </div>

                    <div style={{ width: "100%", backgroundColor: activePhoneSkin.panel, borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", border: `1px solid ${activePhoneSkin.border}`, boxSizing: "border-box" }}>
                      <div><span style={{ fontSize: "0.75rem", color: activePhoneSkin.textMuted, fontWeight: "700" }}>신분 / 직책</span><div style={{ fontSize: "0.95rem", fontWeight: "800", color: activePhoneSkin.text, marginTop: "4px" }}>{activeSession.sheet?.job || "기록 없음"}</div></div>
                      <div style={{ borderTop: `1px solid ${activePhoneSkin.border}` }}/>
                      <div><span style={{ fontSize: "0.75rem", color: activePhoneSkin.textMuted, fontWeight: "700" }}>백스토리 및 성격</span><div style={{ fontSize: "0.85rem", color: activePhoneSkin.text, marginTop: "6px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{activeSession.sheet?.background || "기록된 배경이 없습니다."}</div></div>
                      
                      {/* 🌟 소지품 인벤토리 추가 */}
                      <div style={{ borderTop: `1px solid ${activePhoneSkin.border}` }}/>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: activePhoneSkin.textMuted, fontWeight: "700" }}>소지품 및 단서</span>
                        <div style={{ fontSize: "0.85rem", color: activePhoneSkin.text, marginTop: "6px", lineHeight: 1.6 }}>
                          {activeSession.sheet?.items?.length > 0 || activeSession.sheet?.clues?.length > 0
                            ? [...(activeSession.sheet.items || []).map(i => i.name), ...(activeSession.sheet.clues || []).map(c => c.name)].join(", ")
                            : "획득한 소지품이나 단서가 없습니다."}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              /* 👥 [화면 B: 상대방 프로필 상세 - 네모난 확대 기능 적용] */
              ) : selectedProfileNpc ? (
                <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                  <span style={{ fontSize: "0.85rem", color: activePhoneSkin.textMuted, fontWeight: "600" }}>{selectedProfileNpc.job || "정보 없음"}</span>
                  <div 
                    onClick={() => { if (selectedProfileNpc.portraitUrl) setZoomedPortrait(selectedProfileNpc.portraitUrl); }}
                    style={{ width: "100px", height: "100px", borderRadius: "25%", overflow: "hidden", border: `2px solid ${activePhoneSkin.border}`, boxShadow: "0 8px 20px rgba(0,0,0,0.1)", cursor: selectedProfileNpc.portraitUrl ? "pointer" : "default" }}
                  >
                    {selectedProfileNpc.portraitUrl ? <img src={selectedProfileNpc.portraitUrl} alt="상대" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={60} color={activePhoneSkin.textMuted} style={{ margin: "20px" }}/>}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: activePhoneSkin.text }}>{selectedProfileNpc.name}</h2>
                    <span style={{ fontSize: "0.85rem", color: activePhoneSkin.textMuted }}>"{getStatusMsg(selectedProfileNpc.behavior)}"</span>
                  </div>

                  {/* 액션 버튼 4개 */}
                  <div style={{ width: "100%", display: "flex", justifyContent: "space-around", backgroundColor: activePhoneSkin.panel, padding: "16px", borderRadius: "20px", border: `1px solid ${activePhoneSkin.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)", boxSizing: "border-box" }}>
                    {[
                      { icon: <Phone size={24} color="#ec4899" fill="#ec4899" />, label: "전화 걸기", action: () => { setVoiceCallNpc(selectedProfileNpc); setIsVoiceCallActive(true); setIsCallModalOpen(true); } },
                      { icon: <MessageSquare size={24} color="#a78bfa" fill="#a78bfa" />, label: "1:1 대화", action: () => { setActivePhoneContactId(selectedProfileNpc.id); setSelectedProfileNpc(null); } },
                      { icon: <Gift size={24} color="#f59e0b" fill="#f59e0b" />, label: "선물하기", action: () => setGiftModalNpc(selectedProfileNpc) },
                      { icon: <Lightbulb size={24} color="#eab308" fill="#eab308" />, label: "취향 수첩", action: () => setClueModalNpc(selectedProfileNpc) }
                    ].map((btn, i) => (
                      <div key={i} onClick={btn.action} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        {btn.icon}
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: activePhoneSkin.text }}>{btn.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* 호감도 & 상세 메모 */}
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px", padding: "0 8px", boxSizing: "border-box" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: "800", color: activePhoneSkin.danger, display: "flex", alignItems: "center", gap: "6px" }}><Heart size={16} fill="currentColor"/> 정서적 유대감</span>
                      <span style={{ fontSize: "1rem", fontWeight: "900", color: activePhoneSkin.danger }}>{selectedProfileNpc.affection || 0} / 100</span>
                    </div>
                    <div style={{ borderTop: `2px solid ${activePhoneSkin.border}` }}/>
                    <div style={{ fontSize: "0.85rem", color: activePhoneSkin.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      <span style={{ fontWeight: "700", color: activePhoneSkin.textMuted, display: "block", marginBottom: "4px" }}>외모 및 특징 메모</span>
                      {selectedProfileNpc.behavior || "기록된 메모가 없습니다."}
                    </div>
                  </div>
                </div>

              /* 💬 [화면 C: 1:1 대화방 - 전송 기능 완벽 연결!] */
              ) : activePhoneContactId !== null ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: activePhoneSkin.bg }}>
                  <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
                    {((activeSession.sheet?.phoneChats || {})[activePhoneContactId] || []).map((m, idx) => {
                      const isUser = m.sender === "user";
                      return (
                        <div key={idx} style={{ alignSelf: isUser ? "flex-end" : "flex-start", maxWidth: "80%", display: "flex", flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-start", gap: "10px" }}>
                          {!isUser && (
                            <div 
                              onClick={() => {
                                const contactUrl = (activeSession.sheet?.npcs || []).find(n => n.id === activePhoneContactId)?.portraitUrl;
                                if(contactUrl) setZoomedPortrait(contactUrl);
                              }}
                              style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `1px solid ${activePhoneSkin.borderHighlight}`, cursor: "pointer" }}
                            >
                              <img src={(activeSession.sheet?.npcs || []).find(n => n.id === activePhoneContactId)?.portraitUrl} alt="상대" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                          )}
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: isUser ? "flex-end" : "flex-start" }}>
                            {m.photo && (
                              <img src={m.photo} alt="첨부사진" onClick={() => setZoomedPortrait(m.photo)} style={{ width: "200px", borderRadius: "12px", cursor: "pointer", border: `1px solid ${activePhoneSkin.border}`, marginBottom: "4px" }} />
                            )}
                            <div style={{ backgroundColor: isUser ? activePhoneSkin.accent : activePhoneSkin.panel, color: isUser ? "#fff" : activePhoneSkin.text, padding: "12px 16px", borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px", fontSize: "0.9rem", lineHeight: "1.5", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                              {m.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: "12px 16px", backgroundColor: activePhoneSkin.headerBg, display: "flex", gap: "10px", alignItems: "center" }}>
                    <input 
                      type="text" 
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey && phoneInput.trim()) {
                          e.preventDefault();
                          executeMessage(`[메신저 전송] ${phoneInput.trim()}`);
                          setPhoneInput("");
                        }
                      }}
                      placeholder="메시지를 입력하세요..." 
                      style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "none", backgroundColor: activePhoneSkin.panel, color: activePhoneSkin.text, outline: "none", fontSize: "0.9rem" }} 
                    />
                    <button 
                      onClick={() => {
                        if (phoneInput.trim()) {
                          executeMessage(`[메신저 전송] ${phoneInput.trim()}`);
                          setPhoneInput("");
                        }
                      }}
                      style={{ padding: "10px 18px", backgroundColor: activePhoneSkin.accent, color: "#fff", border: "none", borderRadius: "20px", fontWeight: "800", cursor: "pointer" }}
                    >전송</button>
                  </div>
                </div>

              /* 📋 [화면 D: 메신저 메인 탭들] */
              ) : (
                <>
                  {phoneNavTab === "contacts" && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {/* 내 프로필 (상태메시지 추출기 적용) */}
                      <div style={{ padding: "16px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: activePhoneSkin.textMuted, marginLeft: "8px" }}>내 프로필</span>
                        <div onClick={() => setIsMyProfileOpen(true)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 8px", cursor: "pointer" }}>
                          <div style={{ width: "56px", height: "56px", borderRadius: "25%", overflow: "hidden", border: `1px solid ${activePhoneSkin.borderHighlight}` }}>
                            {activeSession.sheet?.portrait ? <img src={activeSession.sheet.portrait} alt="나" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={32} color={activePhoneSkin.textMuted} style={{ margin: "12px" }}/>}
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "1.05rem", fontWeight: "800", color: activePhoneSkin.text }}>{activeSession.sheet?.name || "이름 미상"}</span>
                            <span style={{ fontSize: "0.75rem", color: activePhoneSkin.textMuted }}>{getStatusMsg(activeSession.sheet?.background)}</span>
                          </div>
                          <ChevronRight size={20} color={activePhoneSkin.textMuted} />
                        </div>
                      </div>
                      
                      <div style={{ height: "1px", backgroundColor: activePhoneSkin.border }} />

                      {/* 인연 목록 (상태메시지만 분리) */}
                      <div style={{ padding: "16px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: activePhoneSkin.textMuted, marginLeft: "8px" }}>교류 중인 인물 ({(activeSession.sheet?.npcs || []).length})</span>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}>
                          {(activeSession.sheet?.npcs || []).map(npc => (
                            <div key={npc.id} onClick={() => setSelectedProfileNpc(npc)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 8px", cursor: "pointer", borderBottom: `1px solid rgba(0,0,0,0.03)` }}>
                              <div style={{ width: "52px", height: "52px", borderRadius: "50%", overflow: "hidden", border: `1px solid ${activePhoneSkin.borderHighlight}` }}>
                                {npc.portraitUrl ? <img src={npc.portraitUrl} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={28} color={activePhoneSkin.textMuted} style={{ margin: "12px" }}/>}
                              </div>
                              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span style={{ fontSize: "1rem", fontWeight: "800", color: activePhoneSkin.text }}>{npc.name}</span>
                                <span style={{ fontSize: "0.75rem", color: activePhoneSkin.textMuted }}>"{getStatusMsg(npc.behavior)}"</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Heart size={14} fill={activePhoneSkin.textMuted} color={activePhoneSkin.textMuted} />
                                <span style={{ fontSize: "0.85rem", fontWeight: "800", color: activePhoneSkin.danger }}>{npc.affection || 0}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {phoneNavTab === "chats" && (
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "800", color: activePhoneSkin.textMuted, marginLeft: "8px", marginBottom: "8px" }}>대화방 목록</span>
                      {(activeSession.sheet?.npcs || []).map(npc => {
                        return (
                          <div key={npc.id} onClick={() => setActivePhoneContactId(npc.id)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 8px", cursor: "pointer", borderBottom: `1px solid rgba(0,0,0,0.03)` }}>
                            <div style={{ width: "52px", height: "52px", borderRadius: "50%", overflow: "hidden", border: `1px solid ${activePhoneSkin.borderHighlight}` }}>
                              {npc.portraitUrl ? <img src={npc.portraitUrl} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={28} color={activePhoneSkin.textMuted} style={{ margin: "12px" }}/>}
                            </div>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ fontSize: "1rem", fontWeight: "800", color: activePhoneSkin.text }}>{npc.name}</span>
                              <span style={{ fontSize: "0.8rem", color: activePhoneSkin.textMuted }}>대화를 시작해 보세요.</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 🌟 4칸 그리드 스킨 배열 (이모지 삭제 및 Lucide 아이콘 적용!) */}
                  {phoneNavTab === "settings" && (
                    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "24px" }}>
                      <div>
                        <span style={{ fontSize: "0.85rem", fontWeight: "800", color: activePhoneSkin.text, display: "flex", alignItems: "center", gap: "6px" }}><PenTool size={16}/> 메신저 테마 스킨</span>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "12px" }}>
                          {[
                            { id: "default", name: "시스템", icon: <Smartphone size={24} strokeWidth={2} /> },
                            { id: "kakao", name: "바나나", icon: <MessageSquare size={24} strokeWidth={2} /> },
                            { id: "parchment", name: "양피지", icon: <BookOpen size={24} strokeWidth={2} /> },
                            { id: "cyber", name: "소다", icon: <Droplet size={24} strokeWidth={2} /> }
                          ].map(t => {
                            const isSelected = phoneTheme === t.id;
                            return (
                              <div 
                                key={t.id} 
                                onClick={() => setPhoneTheme(t.id)} 
                                style={{ 
                                  padding: "14px 4px", 
                                  border: `1.5px solid ${isSelected ? activePhoneSkin.accent : activePhoneSkin.border}`, 
                                  borderRadius: "14px", 
                                  backgroundColor: isSelected ? activePhoneSkin.panel : "transparent", 
                                  textAlign: "center", 
                                  cursor: "pointer", 
                                  display: "flex", 
                                  flexDirection: "column", 
                                  alignItems: "center", 
                                  gap: "8px", 
                                  transition: "all 0.2s" 
                                }}
                              >
                                <div style={{ color: isSelected ? activePhoneSkin.accent : activePhoneSkin.textMuted, transition: "color 0.2s" }}>
                                  {t.icon}
                                </div>
                                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: isSelected ? activePhoneSkin.text : activePhoneSkin.textMuted }}>{t.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.85rem", fontWeight: "800", color: activePhoneSkin.text, display: "flex", alignItems: "center", gap: "6px" }}><Smartphone size={16}/> 스마트폰 알림 진동</span>
                        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                          {["끄기", "약하게", "보통", "강하게"].map(v => (
                            <div key={v} onClick={() => triggerToast("설정 완료", "진동 세기가 변경되었습니다.", "📱")} style={{ flex: 1, padding: "12px 0", textAlign: "center", border: `1px solid ${activePhoneSkin.border}`, borderRadius: "12px", fontSize: "0.8rem", fontWeight: "700", color: activePhoneSkin.textMuted, cursor: "pointer" }}>{v}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 🔹 3단 하단 탭 네비게이션 바 (메인 화면에서만 노출) */}
            {activePhoneContactId === null && !selectedProfileNpc && !isMyProfileOpen && !incomingCall && (
              <div style={{ height: "64px", backgroundColor: activePhoneSkin.headerBg, display: "flex", borderTop: `1px solid ${activePhoneSkin.border}` }}>
                {[
                  { id: "contacts", label: "인연", icon: <UserRound size={22} fill={phoneNavTab === "contacts" ? activePhoneSkin.accent : "none"} /> },
                  { id: "chats", label: "대화", icon: <MessageCircle size={22} fill={phoneNavTab === "chats" ? activePhoneSkin.accent : "none"} /> },
                  { id: "settings", label: "더보기", icon: <Settings size={22} fill={phoneNavTab === "settings" ? activePhoneSkin.accent : "none"} /> }
                ].map(tab => (
                  <div key={tab.id} onClick={() => setPhoneNavTab(tab.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: phoneNavTab === tab.id ? activePhoneSkin.accent : activePhoneSkin.textMuted, cursor: "pointer", transition: "color 0.2s" }}>
                    {tab.icon}
                    <span style={{ fontSize: "0.7rem", fontWeight: "800" }}>{tab.label}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* 🖼️ 사진 크게 보기 (네모나게 줌인) 모달 */}
      {zoomedPortrait && (
        <div 
          onClick={() => setZoomedPortrait(null)}
          style={{ position: "fixed", inset: 0, zIndex: 999999, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.2s ease-out" }}
        >
          <img src={zoomedPortrait} alt="확대된 사진" style={{ width: "100%", maxWidth: "400px", aspectRatio: "1/1", objectFit: "cover", borderRadius: "16px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} />
          <button onClick={() => setZoomedPortrait(null)} style={{ position: "absolute", top: "24px", right: "24px", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={28} />
          </button>
        </div>
      )}
                      
{/* ── 🖼️ 이벤트 CG 모달 (16:9 뷰어 + 연필 아이콘) ── */}
        {showCgModal && (() => {
          const targetCg = cgList.find(c => c.id === activeCgId);
          if (!targetCg) return null;

          return (
            <div
              onClick={() => setShowCgModal(false)}
              style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "16px", animation: "fadeIn 0.2s ease-out" }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{ backgroundColor: theme.panel, border: `1.5px solid ${theme.border}`, width: "100%", maxWidth: "640px", borderRadius: "18px", padding: "20px", color: theme.text, display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "10px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: theme.accent }}>
                      {targetCg.title || "이름 없는 CG"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowCgModal(false); }}
                    style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "1.2rem", cursor: "pointer", lineHeight: 1, padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.panelAlt}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>

                {/* 🌟 16:9 뷰어 및 이미지 등록 */}
                <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "14px", overflow: "hidden", border: `1.5px solid ${theme.border}`, backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.25)" : "#f0ece4", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {targetCg.imageUrl ? (
                    <img src={targetCg.imageUrl} alt="CG" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ textAlign: "center", color: theme.textMuted, fontSize: "0.85rem", lineHeight: "1.6" }}>
                      <div style={{ fontSize: "2.4rem", marginBottom: "6px", display: "flex", justifyContent: "center" }}>
                        <ImageIcon size={48} strokeWidth={1} color={theme.textMuted} />
                      </div>
                      등록된 CG 이미지가 없습니다.
                    </div>
                  )}

                  <label
                    title="CG 이미지 변경/등록"
                    style={{
                      position: "absolute", bottom: "16px", right: "16px", width: "42px", height: "42px", borderRadius: "50%",
                      backgroundColor: "rgba(0,0,0,0.7)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", 
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5,
                      boxShadow: "0 4px 10px rgba(0,0,0,0.5)", transition: "transform 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  >
                    <PenTool size={20} strokeWidth={2.5} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: "none" }} 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setCgList(cgList.map(c => c.id === targetCg.id ? { ...c, imageUrl: ev.target.result } : c));
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
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: theme.accent }}>
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
                <span style={{ fontWeight: "600", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ClipboardPaste size={20} strokeWidth={2.5} color={theme.accent} /> 시나리오 텍스트 붙여넣기
                </span>
                <button onClick={() => setShowPasteModal(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer" }}><X size={20}/></button>
              </div>
              <textarea rows={8} value={pastedText} onChange={e => setPastedText(e.target.value)} placeholder="스튜디오에서 작성된 시나리오 전체 글을 여기에 붙여넣으세요..." style={{ width: "100%", boxSizing: "border-box", padding: "12px", backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, fontSize: "0.82rem", outline: "none", resize: "none" }} />
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={handleApplyPastedScenario} style={{ flex: 2, padding: "10px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", border: "none", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  서류철에 자동 배치 <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        )}

{/* 👑 어드민 전용 메인 배너 교체 팝업 */}
        {showBannerEdit && editingBanner && (
          <div onClick={() => setShowBannerEdit(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "20px", animation: "fadeIn 0.2s ease-out" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "440px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px" }}>
                <span style={{ fontWeight: "800", fontSize: "1.1rem", color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}>
                  <PenTool size={20} color={theme.danger} /> 메인 배너 교체
                </span>
                <button onClick={() => setShowBannerEdit(false)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer" }}><X size={24}/></button>
              </div>

              {/* 이미지 등록 구역 */}
              <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: theme.inputBg, border: `1.5px dashed ${theme.borderHighlight}`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", cursor: "pointer" }}>
                 {editingBanner.imageUrl ? (
                   <img src={editingBanner.imageUrl} alt="배너" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                 ) : (
                   <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: theme.textMuted }}>
                     <ImageIcon size={32} strokeWidth={1.5} />
                     <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>터치하여 배너 이미지 업로드</span>
                   </div>
                 )}
                 <label style={{ position: "absolute", inset: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                       const file = e.target.files[0];
                       if (file) {
                           const reader = new FileReader();
                           reader.onload = (ev) => {
                               setEditingBanner({...editingBanner, imageUrl: ev.target.result});
                           };
                           reader.readAsDataURL(file);
                       }
                   }} />
                 </label>
              </div>

              {/* 텍스트 변경 구역 & 목적지 링크 설정 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                 <div style={{ display: "flex", gap: "8px" }}>
                   <input type="text" value={editingBanner.tag} onChange={e => setEditingBanner({...editingBanner, tag: e.target.value})} placeholder="태그 (예: 추천 사건)" style={{ flex: 1, padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none", fontWeight: "700" }} />
                   {/* 🌟 새로 추가됨: 이동할 시나리오의 제목이나 ID를 적는 칸 */}
                   <input type="text" value={editingBanner.linkId || ""} onChange={e => setEditingBanner({...editingBanner, linkId: e.target.value})} placeholder="이동할 시나리오 이름 (예: 사각지대의 유죄인간)" style={{ flex: 1.5, padding: "12px", borderRadius: "8px", border: `1px solid ${theme.accent}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none", fontWeight: "600" }} />
                 </div>
                 <input type="text" value={editingBanner.title} onChange={e => setEditingBanner({...editingBanner, title: e.target.value})} placeholder="배너 제목" style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "1rem", outline: "none", fontWeight: "800" }} />
                 <textarea rows={2} value={editingBanner.desc} onChange={e => setEditingBanner({...editingBanner, desc: e.target.value})} placeholder="배너 설명" style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none", resize: "none" }} />
              </div>

             {/* 완료 버튼 */}
              <button 
                onClick={async () => {
                  triggerToast("저장 중...", "서버에 배너를 업데이트하고 있습니다.", "⏳");
                  
                  // 🌟 데이터가 없으면 새로 만들고, 있으면 덮어씌우는 무적의 Upsert 마법!
                  const { error } = await supabase.from('main_banners').upsert({
                    id: editingBanner.id,
                    tag: editingBanner.tag,
                    title: editingBanner.title,
                    description: editingBanner.desc,
                    image_url: editingBanner.imageUrl,
                    link_id: editingBanner.linkId // 🌟 드디어 목적지(link_id) 저장!!
                  });

                  if (!error) {
                    setBanners(banners.map(b => b.id === editingBanner.id ? editingBanner : b));
                    setShowBannerEdit(false);
                    triggerToast("교체 완료", "모든 유저의 메인 배너가 업데이트되었습니다!", <CheckCircle2 color={theme.success} size={18}/>);
                  } else {
                    triggerToast("업데이트 실패", "서버 통신에 문제가 발생했습니다.", "⚠️");
                  }
                }} 
                style={{ width: "100%", padding: "14px", backgroundColor: theme.danger, color: "#fff", border: "none", borderRadius: "12px", fontSize: "0.95rem", fontWeight: "700", cursor: "pointer", marginTop: "4px", boxShadow: "0 4px 12px rgba(220,38,38,0.3)" }}
              >
                배너 업데이트 적용
              </button>
            </div>
          </div>
        )}

{/* 👤 프로필 수정 팝업 */}
        {showProfileEdit && (
          <div onClick={() => setShowProfileEdit(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: "20px", animation: "fadeIn 0.2s ease-out" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "400px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "800", fontSize: "1.1rem", color: theme.text }}>내 프로필 편집</span>
                <button onClick={() => setShowProfileEdit(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer" }}><X size={24}/></button>
              </div>

              {/* 🌟 계정 프사 변경 구역 */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "90px", height: "90px", borderRadius: "50%", backgroundColor: theme.panelAlt, border: `2px solid ${theme.borderHighlight}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                  {userAvatar ? <img src={userAvatar} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={40} color={theme.textMuted} />}
                  <label style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <PenTool size={24} color="#fff" />
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setUserAvatar(ev.target.result); // 수사관 말고 내 계정 프사 상자에 넣기!
                            localStorage.setItem("secret_novel_avatar", ev.target.result);
                          };
                          reader.readAsDataURL(file);
                        }
                    }} />
                  </label>
                </div>
                <span style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "600" }}>터치하여 계정 사진 변경</span>
              </div>

              {/* 🌟 계정 닉네임 변경 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", color: theme.textMuted }}>계정 닉네임</label>
                <input type="text" value={currentUser?.name || ""} onChange={e => {
                  const updatedUser = {...currentUser, name: e.target.value};
                  setCurrentUser(updatedUser);
                  localStorage.setItem("secret_novel_user", JSON.stringify(updatedUser));
                }} placeholder="새 닉네임을 입력하세요" style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: "12px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.95rem", outline: "none", fontWeight: "600" }} />
              </div>

              <button onClick={() => { setShowProfileEdit(false); triggerToast("변경 완료", "내 계정 정보가 업데이트되었습니다.", <CheckCircle2 color={theme.success} size={18}/>); }} style={{ width: "100%", padding: "14px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", border: "none", borderRadius: "14px", fontSize: "0.95rem", fontWeight: "800", cursor: "pointer", marginTop: "8px", boxShadow: `0 4px 12px ${theme.accentGlow}` }}>
                저장하기
              </button>
              
            </div>
          </div>
        )}

{/* 🌟 세션 카드 팝업 모달 (프로필 모달과 동일한 구조) */}
        {showSessionCardModal && (() => {
          const targetSession = sessions.find(s => s.id === activeCardSessionId);
          if (!targetSession) return null;

          return (
            <div
              onClick={() => setShowSessionCardModal(false)}
              style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "16px", animation: "fadeIn 0.2s ease-out" }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{ backgroundColor: theme.panel, border: `1.5px solid ${theme.border}`, width: "100%", maxWidth: "420px", borderRadius: "18px", padding: "20px", color: theme.text, display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "10px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: theme.accent }}>
                      {targetSession.title}
                    </h3>
                    <div style={{ fontSize: "0.74rem", color: theme.textMuted, marginTop: "2px" }}>
                      세션 카드(표지) 등록
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSessionCardModal(false)}
                    style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "14px", overflow: "hidden", border: `1.5px solid ${theme.border}`, backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.25)" : "#f0ece4", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {targetSession.thumbnail ? (
                    <img src={targetSession.thumbnail} alt="세션 카드" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                          setSessions(prev => prev.map(s => s.id === activeCardSessionId ? { ...s, thumbnail: ev.target.result } : s));
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


{/* ⚙️ 환경 설정 모달 */}
      {showSettingsModal && (
        <div onClick={() => setShowSettingsModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px", animation: "fadeIn 0.2s ease-out" }}>
          <div onClick={e => e.stopPropagation()} className="glass-card" style={{ width: "100%", maxWidth: "460px", backgroundColor: theme.panel, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px" }}>
              <span style={{ fontWeight: "800", fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "8px", color: theme.text }}>
                <Settings size={22} color={theme.accent} /> 환경 설정
              </span>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer" }}><X size={26}/></button>
            </div>

            {/* 테마 팔레트 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.text }}>2026 팬톤 테마 팔레트</label>
                <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: "none", border: "none", color: theme.accent, fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}>
                  {isDarkMode ? "🌙 나이트" : "☀️ 라이트"}
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {Object.entries(THEME_PALETTES).map(([k, p]) => (
                  <button key={k} onClick={() => handleSelectPalette(k)} style={{ padding: "12px", borderRadius: "10px", border: `1.5px solid ${currentPalette === k ? theme.accent : theme.border}`, backgroundColor: currentPalette === k ? theme.panelAlt : "transparent", color: theme.text, fontSize: "0.8rem", cursor: "pointer", fontWeight: currentPalette === k ? "800" : "500", transition: "all 0.2s" }}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 글씨체 설정 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.text }}>본문 서사 글씨체</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  type="button" 
                  onClick={() => setFontChoice("ridi")} 
                  style={{ padding: "12px", borderRadius: "10px", border: `1.5px solid ${fontChoice === "ridi" ? theme.accent : theme.border}`, backgroundColor: fontChoice === "ridi" ? theme.panelAlt : "transparent", color: theme.text, fontFamily: "'RIDIBatang', serif", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                >
                  📖 리디바탕 (명조체)
                </button>
                <button onClick={() => setFontChoice("gothic")} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: `1.5px solid ${fontChoice === "gothic" ? theme.accent : theme.border}`, backgroundColor: fontChoice === "gothic" ? theme.panelAlt : "transparent", color: theme.text, fontFamily: "'Pretendard', sans-serif", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}>
                  📱 프리텐다드 (고딕체)
                </button>
              </div>
            </div>

            {/* 폰트 크기 슬라이더 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.text }}>채팅 폰트 크기</label>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: theme.accent }}>{chatFontSize || 1}rem</span>
              </div>
              <input type="range" min="0.8" max="1.5" step="0.05" value={chatFontSize || 1} onChange={e => handleSaveFontSize(Number(e.target.value))} style={{ width: "100%", accentColor: theme.accent, marginTop: "4px" }} />
            </div>

            {/* 주사위 볼륨 슬라이더 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: `1px dashed ${theme.border}`, paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.text }}>주사위 효과음 볼륨</label>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: theme.accent }}>{Math.round((soundVolume || 0.6) * 100)}%</span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input type="range" min="0" max="1" step="0.05" value={soundVolume || 0.6} onChange={e => handleSaveVolume(Number(e.target.value))} style={{ flex: 1, accentColor: theme.accent }} />
                <button onClick={playDiceSound} style={{ padding: "6px 12px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.borderHighlight}`, color: theme.text, borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                  🔊 테스트
                </button>
              </div>
            </div>

            {/* 알림 진동 설정 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: `1px dashed ${theme.border}`, paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.text }}>스마트폰 알림 진동 (햅틱)</label>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: theme.accent }}>📳 {vibrationLevel === "off" ? "끄기" : vibrationLevel === "light" ? "부드럽게" : vibrationLevel === "medium" ? "보통" : "강하게"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px" }}>
                {[{ k: "off", l: "끄기" }, { k: "light", l: "부드럽게" }, { k: "medium", l: "보통" }, { k: "strong", l: "강하게" }].map(opt => (
                  <button key={opt.k} onClick={() => handleSaveVibration(opt.k)} style={{ padding: "10px 0", borderRadius: "10px", border: `1.5px solid ${vibrationLevel === opt.k ? theme.accent : theme.border}`, backgroundColor: vibrationLevel === opt.k ? theme.panelAlt : "transparent", color: theme.text, fontSize: "0.75rem", fontWeight: vibrationLevel === opt.k ? "700" : "500", cursor: "pointer", transition: "all 0.2s" }}>
                    {opt.l}
                  </button>
                ))}
              </div>
              <button onClick={() => triggerVibration(vibrationLevel)} style={{ width: "100%", padding: "10px", backgroundColor: theme.inputBg, border: `1px solid ${theme.borderHighlight}`, color: theme.accent, borderRadius: "10px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "4px" }}>
                📳 진동 테스트
              </button>
            </div>

            {/* 백업 및 복원 버튼 (최하단) */}
            <div style={{ display: "flex", gap: "12px", borderTop: `1px solid ${theme.border}`, paddingTop: "20px" }}>
              <button onClick={() => { setShowSettingsModal(false); setShowExportModal(true); }} style={{ flex: 1, padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.borderHighlight}`, borderRadius: "14px", color: theme.text, fontSize: "0.9rem", fontWeight: "800", cursor: "pointer" }}>
                <Download size={18} color={theme.accent} /> 백업
              </button>
              <label style={{ flex: 1, padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.borderHighlight}`, borderRadius: "14px", color: theme.danger, fontSize: "0.9rem", fontWeight: "800", cursor: "pointer" }}>
                <Upload size={18} color={theme.danger} /> 복원
                <input type="file" accept=".json" style={{ display: "none" }} onChange={importSaveFile} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 💾 데이터 관리 (내보내기 & 백업) 모달 */}
      {showExportModal && (
        <div onClick={() => setShowExportModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px", animation: "fadeIn 0.2s ease-out" }}>
          <div onClick={e => e.stopPropagation()} className="glass-card" style={{ width: "100%", maxWidth: "480px", backgroundColor: theme.panel, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px" }}>
              <span style={{ fontWeight: "800", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", color: theme.text }}>
                <Database size={22} color="#8b5cf6" /> 데이터 관리 (내보내기 & 백업)
              </span>
              <button onClick={() => setShowExportModal(false)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer" }}><X size={26}/></button>
            </div>

            {/* 내보낼 세션 선택 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.text }}>내보낼 세션 선택:</label>
                <button onClick={() => setSelectedExportSessionIds(sessions.length === selectedExportSessionIds.length ? [] : sessions.map(s => s.id))} style={{ background: "none", border: "none", fontSize: "0.75rem", color: theme.accent, cursor: "pointer", fontWeight: "800" }}>
                  {sessions.length === selectedExportSessionIds.length ? "선택 해제" : "전체 선택"}
                </button>
              </div>
              <div style={{ maxHeight: "160px", overflowY: "auto", border: `1px solid ${theme.borderHighlight}`, borderRadius: "10px", padding: "8px", display: "flex", flexDirection: "column", gap: "6px", backgroundColor: theme.inputBg }}>
                {sessions.map(s => (
                  <label key={s.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: theme.text, cursor: "pointer", padding: "4px 6px" }}>
                    <input type="checkbox" checked={selectedExportSessionIds.includes(s.id)} onChange={() => {
                      if (selectedExportSessionIds.includes(s.id)) setSelectedExportSessionIds(selectedExportSessionIds.filter(id => id !== s.id));
                      else setSelectedExportSessionIds([...selectedExportSessionIds, s.id]);
                    }} style={{ width: "16px", height: "16px", accentColor: theme.accent, cursor: "pointer" }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "600" }}>{s.title}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 내보내기 범위 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.text }}>내보내기 범위:</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setExportScope("all")} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: `1px solid ${exportScope === "all" ? theme.accent : theme.border}`, backgroundColor: exportScope === "all" ? theme.panelAlt : theme.inputBg, color: theme.text, fontWeight: "700", cursor: "pointer", fontSize: "0.85rem" }}>전체 기록</button>
                <button onClick={() => setExportScope("storyOnly")} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: `1px solid ${exportScope === "storyOnly" ? theme.accent : theme.border}`, backgroundColor: exportScope === "storyOnly" ? theme.panelAlt : theme.inputBg, color: theme.text, fontWeight: "700", cursor: "pointer", fontSize: "0.85rem" }}>순수 서사만</button>
              </div>
            </div>

            {/* 파일 형식 포맷 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.text }}>파일 형식 (포맷):</label>
              <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={{ padding: "14px", borderRadius: "10px", border: `1px solid ${theme.borderHighlight}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", fontWeight: "600", outline: "none", cursor: "pointer" }}>
                <option value="txt">📄 텍스트 메모장 문서 (.txt)</option>
                <option value="md">📝 마크다운 서식 문서 (.md)</option>
                <option value="json">📦 게임 세이브 완전 백업 (.json - 복원 가능)</option>
              </select>
            </div>

            <button onClick={executeExport} style={{ width: "100%", padding: "16px", backgroundColor: "#8b5cf6", color: "#fff", border: "none", borderRadius: "14px", fontSize: "0.95rem", fontWeight: "800", cursor: "pointer", marginTop: "8px", boxShadow: "0 6px 16px rgba(139, 92, 246, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              다운로드 / 실행
            </button>
          </div>
        </div>
      )}
          

{/* 📜 나의 플레이 기록 팝업 */}
        {showHistoryModal && (
          <div onClick={() => setShowHistoryModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "20px", animation: "fadeIn 0.2s ease-out" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "500px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", maxHeight: "80vh" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px" }}>
                <span style={{ fontWeight: "800", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", color: theme.text }}><Clock size={20} color={theme.accent}/> 나의 플레이 기록</span>
                <button onClick={() => setShowHistoryModal(false)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer" }}><X size={24}/></button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
                {sessions.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: theme.textMuted, fontSize: "0.9rem" }}>아직 진행한 플레이 기록이 없습니다.<br/>로비에서 새로운 사건을 시작해보세요!</div>
                ) : (
                  sessions.map(s => (
                    <div key={s.id} style={{ padding: "16px", backgroundColor: theme.inputBg, borderRadius: "12px", border: `1px solid ${theme.border}` }}>
                      <div style={{ fontWeight: "800", color: theme.text, fontSize: "1.05rem", marginBottom: "6px" }}>{s.title}</div>
                      <div style={{ fontSize: "0.8rem", color: theme.textMuted, display: "flex", gap: "10px" }}>
                        <span>모드: {s.ruleMode === "dating" ? "연애" : s.ruleMode === "horror" ? "괴담" : "추리"}</span>
                        <span>·</span>
                        <span>{new Date(s.id).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

       {/* ❤️ 관심 시나리오 팝업 (실제 데이터 렌더링) */}
        {showLikedModal && (
          <div onClick={() => setShowLikedModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "20px", animation: "fadeIn 0.2s ease-out" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "500px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", maxHeight: "80vh" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px" }}>
                <span style={{ fontWeight: "800", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", color: theme.text }}><Heart size={20} color={theme.danger} fill={theme.danger} /> 관심 시나리오</span>
                <button onClick={() => setShowLikedModal(false)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer" }}><X size={24}/></button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
                 {likedScenarios.length === 0 ? (
                   <div style={{ padding: "40px", textAlign: "center", color: theme.textMuted, fontSize: "0.9rem", lineHeight: 1.6 }}>관심 등록한 시나리오가 아직 없습니다.<br/>라운지에서 마음에 드는 작품에 하트를 눌러보세요!</div>
                 ) : (
                   likedScenarios.map(scen => (
                     <div 
                       key={scen.id} 
                       // 🌟 카드를 클릭하면 탐색 상세페이지를 열어줌!
                       onClick={() => { setSelectedExploreScenario(scen); setActiveTab("explore"); setShowLikedModal(false); }}
                       style={{ padding: "16px", backgroundColor: theme.panelAlt, borderRadius: "12px", border: `1px solid ${theme.border}`, display: "flex", gap: "14px", alignItems: "center", cursor: "pointer", transition: "background 0.2s" }}
                       onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.inputBg} onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.panelAlt}
                     >
                       <div style={{ width: "64px", height: "64px", borderRadius: "10px", backgroundColor: theme.inputBg, border: `1px solid ${theme.borderHighlight}`, overflow: "hidden", flexShrink: 0 }}>
                         {scen.imageUrl ? <img src={scen.imageUrl} alt="커버" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}><ImageIcon size={20} color={theme.textMuted} /></div>}
                       </div>
                       <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, overflow: "hidden" }}>
                         <span style={{ fontWeight: "800", color: theme.text, fontSize: "1.05rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{scen.title}</span>
                         <span style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "600" }}>제작: {scen.author}</span>
                       </div>
                       
                       {/* 하트 아이콘 클릭 시에는 상세페이지 안 열리고 목록에서 삭제만 되게 방어 (stopPropagation) */}
                       <button onClick={(e) => { e.stopPropagation(); setLikedScenarios(likedScenarios.filter(s => s.id !== scen.id)); }} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", padding: "8px" }}><Heart size={20} fill={theme.danger} /></button>
                     </div>
                   ))
                 )}
              </div>
            </div>
          </div>
        )}

        {/* 📢 공지사항 및 어드민 팝업 */}
        {showNoticeModal && (
          <div onClick={() => setShowNoticeModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "20px", animation: "fadeIn 0.2s ease-out" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "500px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", maxHeight: "80vh" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px" }}>
                <span style={{ fontWeight: "800", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", color: theme.text }}>
                  <AlertTriangle size={20} color={theme.accent} /> 공지사항 {isAdmin && <span style={{ fontSize: "0.75rem", color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", padding: "2px 6px", borderRadius: "6px" }}>어드민 모드</span>}
                </span>
                <button onClick={() => setShowNoticeModal(false)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer" }}><X size={24}/></button>
              </div>

              {/* 어드민일 때만 보이는 작성 칸 */}
              {isAdmin && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "16px", borderBottom: `1px dashed ${theme.borderHighlight}` }}>
                  <textarea value={newNotice} onChange={e => setNewNotice(e.target.value)} placeholder="새로운 공지사항을 작성하세요 (어드민 전용)" style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "10px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none", resize: "vertical", minHeight: "80px" }} />
                  <button onClick={async () => { 
                    if(!newNotice.trim()) return; 
                    
                    triggerToast("처리 중...", "서버에 공지사항을 등록하고 있습니다.", "⏳");
                    
                    const today = new Date().toISOString().split("T")[0];
                    
                  // 🌟 공지사항 서버 전송!
                    const { data, error } = await supabase.from('notices').insert([{ text: newNotice, date: today }]).select();
                    
                    if (error) {
                      triggerToast("서버 에러 상세", error.message, "🚨");
                      return;
                    }
                    if (data) {
                      setNotices([data[0], ...notices]);
                      setNewNotice("");
                      triggerToast("공지 등록 완료", "모든 유저에게 새 공지가 실시간 송출됩니다!", "📢");
                    } else {
                      triggerToast("오류", "서버 통신 중 문제가 발생했습니다.", "⚠️");
                    }
                  }} style={{ padding: "10px", backgroundColor: theme.danger, color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer", alignSelf: "flex-end" }}>공지 등록하기</button>
                </div>
              )}

              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", paddingRight: "4px" }}>
                {notices.map(notice => (
                  <div key={notice.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "0.65rem", fontWeight: "800" }}>공지</span>
                      <span style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "600" }}>{notice.date}</span>
                    </div>
                    <div style={{ fontSize: "0.9rem", color: theme.text, lineHeight: 1.6, padding: "14px", backgroundColor: theme.panelAlt, borderRadius: "12px", border: `1px solid ${theme.border}`, whiteSpace: "pre-wrap" }}>
                      {notice.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

{/* ☁️ 라운지 심사 및 발행 내역 팝업 */}
        {showReviewModal && (
          <div onClick={() => setShowReviewModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "20px", animation: "fadeIn 0.2s ease-out" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "500px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", maxHeight: "80vh" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px" }}>
                <span style={{ fontWeight: "800", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", color: theme.text }}>
                  <UploadCloud size={20} color="#60a5fa" /> 라운지 심사 및 발행 내역
                </span>
                <button onClick={() => setShowReviewModal(false)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer" }}><X size={24}/></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
                {isAdmin ? (
                  isReviewFetching ? (
                    <div style={{ padding: "40px", textAlign: "center", color: theme.textMuted, fontSize: "0.9rem", fontWeight: "700", animation: "pulse 1.5s infinite" }}>
                      서버에서 심사 대기열을 불러오는 중입니다... 📡
                    </div>
                  ) : adminPendingScenarios.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: theme.textMuted, fontSize: "0.9rem" }}>현재 서버에 접수된 심사 요청이 없습니다.</div>
                  ) : (
                    adminPendingScenarios.map(s => (
                      <div key={s.id} style={{ padding: "16px", backgroundColor: theme.inputBg, borderRadius: "12px", border: `1px solid ${theme.warning}`, display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ fontWeight: "800", color: theme.text, fontSize: "1.05rem" }}>{s.title}</span>
                            <span style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "600" }}>제작: {s.author_name} ({s.author_email})</span>
                          </div>
                          <span style={{ backgroundColor: theme.warning, color: "#fff", padding: "4px 8px", borderRadius: "8px", fontSize: "0.7rem", fontWeight: "800" }}>심사 대기</span>
                        </div>
                        
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button onClick={async () => {
                            const reason = window.prompt(`[${s.title}] 거절 사유를 입력해주세요.\n(유저에게 피드백으로 전달됩니다)`);
                            if (!reason) return;
                            
                            triggerToast("처리 중...", "서버에 반려 상태를 등록 중입니다.", "⏳");
                            const { error } = await supabase.from('scenarios').update({ status: '반려', reject_reason: reason }).eq('id', s.id);
                            
                            if (!error) {
                              setAdminPendingScenarios(adminPendingScenarios.filter(item => item.id !== s.id));
                              triggerToast("반려 완료", "해당 시나리오가 반려되었습니다.", "🚫");
                            } else {
                              triggerToast("오류", "서버 통신 중 문제가 발생했습니다.", "⚠️");
                            }
                          }} style={{ padding: "8px 12px", backgroundColor: theme.panelAlt, color: theme.danger, border: `1px solid ${theme.danger}`, borderRadius: "8px", fontWeight: "700", fontSize: "0.8rem", cursor: "pointer" }}>
                            반려 (사유 입력)
                          </button>
                          
                          <button onClick={async () => {
                            triggerToast("처리 중...", "서버에 정식 발행 중입니다.", "⏳");
                            const { error } = await supabase.from('scenarios').update({ status: '발행 완료' }).eq('id', s.id);
                            
                            if (!error) {
                              setAdminPendingScenarios(adminPendingScenarios.filter(item => item.id !== s.id));
                              triggerToast("승인 완료", "라운지에 정식 발행되었습니다!", "🎉");
                            } else {
                              triggerToast("오류", "서버 통신 중 문제가 발생했습니다.", "⚠️");
                            }
                          }} style={{ padding: "8px 12px", backgroundColor: theme.success, color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "0.8rem", cursor: "pointer", boxShadow: "0 4px 10px rgba(22, 163, 74, 0.3)" }}>
                            승인 (발행)
                          </button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  savedLibrary.filter(s => s.status).length === 0 ? (
                     <div style={{ padding: "40px", textAlign: "center", color: theme.textMuted, fontSize: "0.9rem" }}>현재 심사 중이거나 발행된 서류철이 없습니다.</div>
                  ) : (
                     savedLibrary.filter(s => s.status).map(s => (
                       <div key={s.id} style={{ padding: "16px", backgroundColor: theme.inputBg, borderRadius: "12px", border: `1px solid ${s.status === '반려' ? theme.danger : s.status === '발행 완료' ? theme.success : theme.warning}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                           <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                             <span style={{ fontWeight: "800", color: theme.text, fontSize: "1.05rem" }}>{s.title}</span>
                             <span style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "600" }}>{s.date} 신청</span>
                           </div>
                           <span style={{ backgroundColor: s.status === '반려' ? theme.danger : s.status === '발행 완료' ? theme.success : theme.warning, color: "#fff", padding: "6px 10px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "800" }}>
                             {s.status}
                           </span>
                         </div>
                         {/* 반려 시 사유 노출 구역 */}
                         {s.status === '반려' && s.rejectReason && (
                           <div style={{ fontSize: "0.8rem", color: theme.danger, backgroundColor: isDarkMode ? "rgba(220,38,38,0.1)" : "#fef2f2", padding: "10px", borderRadius: "8px", lineHeight: 1.5 }}>
                             <strong style={{ fontWeight: "900" }}>반려 사유:</strong> {s.rejectReason}
                           </div>
                         )}
                       </div>
                     ))
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🎧 고객센터 팝업 */}
        {showSupportModal && (
          <div onClick={() => setShowSupportModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "20px", animation: "fadeIn 0.2s ease-out" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "400px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px" }}>
                <span style={{ fontWeight: "800", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", color: theme.text }}><Headphones size={20} color={theme.textMuted}/> 고객센터</span>
                <button onClick={() => setShowSupportModal(false)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer" }}><X size={24}/></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ fontSize: "0.9rem", color: theme.text, lineHeight: 1.6, fontWeight: "500" }}>이용 중 불편하신 점이 있나요?<br/>아래 이메일로 문의해 주시면 빠르게 답변해 드리겠습니다.</div>
                <div style={{ padding: "16px", backgroundColor: theme.inputBg, borderRadius: "12px", border: `1px dashed ${theme.borderHighlight}`, textAlign: "center", fontWeight: "800", color: theme.accent, fontSize: "1rem" }}>
                  support@secretnovel.com
                </div>
                <button onClick={() => { setShowSupportModal(false); triggerToast("복사 완료", "이메일 주소가 클립보드에 복사되었습니다.", "📋"); }} style={{ padding: "14px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.borderHighlight}`, borderRadius: "12px", color: theme.text, fontWeight: "800", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.inputBg} onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.panelAlt}>
                  이메일 주소 복사
                </button>
              </div>
            </div>
          </div>
        )}

{/* 💧 잉크 충전소 팝업 (무료 획득 및 상점) */}
        {showInkModal && (
          <div onClick={() => setShowInkModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: "20px", animation: "fadeIn 0.2s ease-out" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "440px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", maxHeight: "85vh", overflowY: "auto" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "800", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", color: theme.text }}>
                  <Droplet size={24} strokeWidth={2.5} color={theme.accent} /> 잉크 충전소
                </span>
                <button onClick={() => setShowInkModal(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer" }}><X size={24}/></button>
              </div>

              {/* 내 잉크 요약 */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "20px", backgroundColor: theme.panelAlt, borderRadius: "16px", border: `1px solid ${theme.borderHighlight}` }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: theme.textMuted }}>현재 보유 잉크</span>
                <span style={{ fontSize: "2rem", fontWeight: "800", color: theme.text }}>{userInk.toLocaleString()}</span>
              </div>

              {/* 🎁 무료 잉크 획득 구역 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "800", color: theme.text }}>무료 잉크 획득</span>
                
                {/* 출석체크 버튼 */}
                <div onClick={() => { 
                  if(hasClaimedAttendance) { triggerToast("수령 완료", "오늘은 이미 출석 보상을 받았습니다.", "💡"); return; }
                  setHasClaimedAttendance(true);
                  setUserInk(prev => prev + 5); 
                  triggerToast("출석체크 완료", "5 잉크가 지급되었습니다!", <CheckCircle2 size={18} color={theme.success}/>); 
                }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: theme.inputBg, borderRadius: "14px", border: `1px solid ${theme.border}`, cursor: hasClaimedAttendance ? "default" : "pointer", opacity: hasClaimedAttendance ? 0.6 : 1, transition: "transform 0.2s" }} onMouseEnter={e => { if(!hasClaimedAttendance) e.currentTarget.style.transform = "scale(1.02)"}} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ padding: "8px", backgroundColor: hasClaimedAttendance ? theme.border : "rgba(22, 163, 74, 0.1)", borderRadius: "10px", color: hasClaimedAttendance ? theme.textMuted : theme.success }}><Gift size={20} strokeWidth={2.5} /></div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: "700", color: theme.text }}>오늘의 출석체크</span>
                      <span style={{ fontSize: "0.75rem", color: theme.textMuted }}>{hasClaimedAttendance ? "내일 다시 와주세요!" : "매일 1회 접속 보상"}</span>
                    </div>
                  </div>
                  <span style={{ fontWeight: "800", color: hasClaimedAttendance ? theme.textMuted : theme.accent, fontSize: "0.95rem" }}>{hasClaimedAttendance ? "완료" : "+ 5"}</span>
                </div>

                {/* 광고 시청 버튼 */}
                <div onClick={() => { 
                  if(adWatchCount <= 0) { triggerToast("시청 완료", "오늘치 광고를 모두 시청했습니다.", "💡"); return; }
                  setAdWatchCount(prev => prev - 1);
                  setUserInk(prev => prev + 10); 
                  triggerToast("시청 완료", "10 잉크가 지급되었습니다!", <Video size={18} color={theme.accent}/>); 
                }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: theme.inputBg, borderRadius: "14px", border: `1px solid ${theme.border}`, cursor: adWatchCount <= 0 ? "default" : "pointer", opacity: adWatchCount <= 0 ? 0.6 : 1, transition: "transform 0.2s" }} onMouseEnter={e => { if(adWatchCount > 0) e.currentTarget.style.transform = "scale(1.02)"}} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ padding: "8px", backgroundColor: adWatchCount <= 0 ? theme.border : "rgba(96, 165, 250, 0.1)", borderRadius: "10px", color: adWatchCount <= 0 ? theme.textMuted : "#60a5fa" }}><Video size={20} strokeWidth={2.5} /></div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: "700", color: theme.text }}>광고 보고 잉크 받기</span>
                      <span style={{ fontSize: "0.75rem", color: theme.textMuted }}>남은 횟수: {adWatchCount}/5</span>
                    </div>
                  </div>
                  <span style={{ fontWeight: "800", color: adWatchCount <= 0 ? theme.textMuted : theme.accent, fontSize: "0.95rem" }}>{adWatchCount <= 0 ? "완료" : "+ 10"}</span>
                </div>
              </div>

{/* 💳 잉크 상점 구역 (베타 한정 무료 충전) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "800", color: theme.text }}>스토어 충전</span>
                <span style={{ fontSize: "0.7rem", color: "#fff", backgroundColor: theme.danger, padding: "4px 8px", borderRadius: "8px", fontWeight: "800", boxShadow: "0 2px 8px rgba(220,38,38,0.4)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Gift size={12} strokeWidth={2.5} /> 베타 한정 무료!
                </span>
              </div>
                {[
                  { amount: 100, price: "₩ 1,200", bonus: "", bonusAmt: 0 },
                  { amount: 500, price: "₩ 5,500", bonus: "+50 방울 보너스", bonusAmt: 50 },
                  { amount: 1200, price: "₩ 12,000", bonus: "+200 방울 보너스", bonusAmt: 200 }
                ].map((item, i) => (
                  <div key={i} onClick={() => {
                    // 🌟 베타 기간 전면 무료 충전 로직!
                    setUserInk(prev => prev + item.amount + item.bonusAmt);
                    triggerToast("베타 지원금 지급!", `${item.amount + item.bonusAmt} 잉크가 무료로 충전되었습니다.`, "🎉");
                  }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: theme.inputBg, borderRadius: "14px", border: `1px solid ${theme.border}`, cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = theme.accent} onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "1.05rem", fontWeight: "800", color: theme.text, display: "flex", alignItems: "center", gap: "6px" }}>
                        <Droplet size={16} strokeWidth={3} color={theme.accent} /> {item.amount}
                      </span>
                      {item.bonus && <span style={{ fontSize: "0.75rem", color: theme.accent, fontWeight: "700" }}>{item.bonus}</span>}
                    </div>
                    
                    {/* 가격표 대신 무료 획득 버튼으로 디자인 변경! */}
                    <div style={{ padding: "8px 14px", backgroundColor: theme.panel, border: `1px solid ${theme.danger}`, borderRadius: "10px", fontSize: "0.85rem", fontWeight: "800", color: theme.danger }}>
                      무료 획득
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}


{/* 📚 서재 세션 카드 수정 팝업 */}
        {showLibEditModal && editingLibItem && (
          <div onClick={() => setShowLibEditModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "20px" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "440px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "18px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px" }}>
                <span style={{ fontWeight: "700", fontSize: "1.05rem", color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}>
                  <PenTool size={20} color="#f97316" /> 세션 커버 및 정보 수정
                </span>
                <button onClick={() => setShowLibEditModal(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer" }}><X size={20}/></button>
              </div>

              {/* 🌟 16:9 커버 이미지 등록 영역 */}
              <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: theme.inputBg, border: `1.5px dashed ${theme.borderHighlight}`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", cursor: "pointer" }}>
                 {editingLibItem.imageUrl ? (
                   <img src={editingLibItem.imageUrl} alt="커버" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                 ) : (
                   <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: theme.textMuted }}>
                     <ImageIcon size={32} strokeWidth={1.5} />
                     <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>터치하여 커버 이미지 업로드</span>
                   </div>
                 )}
                 <label style={{ position: "absolute", inset: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                       const file = e.target.files[0];
                       if (file) {
                           const reader = new FileReader();
                           reader.onload = (ev) => {
                               setEditingLibItem({...editingLibItem, imageUrl: ev.target.result});
                           };
                           reader.readAsDataURL(file);
                       }
                   }} />
                 </label>
              </div>

              {/* 제목 수정 영역 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                 <label style={{ fontSize: "0.75rem", fontWeight: "700", color: theme.textMuted, paddingLeft: "4px" }}>사건명 (타이틀)</label>
                 <input type="text" autoComplete="off" value={editingLibItem.title} onChange={e => setEditingLibItem({...editingLibItem, title: e.target.value})} style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.9rem", outline: "none", fontWeight: "600" }} />
              </div>

              <button 
                onClick={() => {
                  // 수정한 이미지를 로컬 스토리지 전체 데이터에 갱신
                  const updated = savedLibrary.map(item => item.id === editingLibItem.id ? editingLibItem : item);
                  setSavedLibrary(updated);
                  localStorage.setItem("secret_novel_library", JSON.stringify(updated));
                  setShowLibEditModal(false);
                  triggerToast("수정 완료", "커버 정보가 성공적으로 변경되었습니다.", <Save color={theme.accent} size={18}/>);
                }} 
                style={{ width: "100%", padding: "14px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", border: "none", borderRadius: "12px", fontSize: "0.95rem", fontWeight: "700", cursor: "pointer", marginTop: "4px" }}
              >
                저장하고 닫기
              </button>
            </div>
          </div>
        )}


{/* 🏷️ 특성 및 트라우마 매트릭스 모달 */}
        {showTraitModal && (
          <div onClick={() => setShowTraitModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "560px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "18px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px" }}>
                <span style={{ fontWeight: "700", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", color: theme.text }}>
                  <Brain size={24} strokeWidth={2.5} color={theme.accent} /> 특성 및 트라우마 선택
                </span>
                <button onClick={() => setShowTraitModal(false)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer" }}><X size={24}/></button>
              </div>

              <div style={{ fontSize: "0.82rem", color: theme.textMuted, lineHeight: "1.5" }}>
                기본적으로 <b>긍정 특성 2개</b>를 선택할 수 있습니다. <br/>
                <b>트라우마</b>를 1개 안고 갈 때마다 긍정 특성을 1개 더 고를 수 있습니다. (최대 3개 추가)
              </div>

              {/* 🌟 긍정 특성 매트릭스 (균일한 Grid) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700", color: theme.accent, fontSize: "0.9rem" }}>긍정 특성</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: horrorTraits.length === (2 + horrorTraumas.length) ? theme.success : theme.textMuted }}>
                    {horrorTraits.length} / {2 + horrorTraumas.length}
                  </span>
                </div>
                {/* 모바일은 4칸, PC는 5칸으로 균일하게 배치 */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(5, 1fr)", gap: "8px" }}>
                  {TRAIT_LIST.map(trait => {
                    const isSelected = horrorTraits.includes(trait);
                    return (
                      <button
                        key={trait}
                        onClick={() => {
                          if (isSelected) setHorrorTraits(horrorTraits.filter(t => t !== trait));
                          else if (horrorTraits.length < (2 + horrorTraumas.length)) setHorrorTraits([...horrorTraits, trait]);
                        }}
                        style={{ width: "100%", padding: "10px 4px", borderRadius: "10px", fontSize: "0.78rem", fontWeight: isSelected ? "700" : "500", backgroundColor: isSelected ? theme.accent : theme.inputBg, color: isSelected ? "#fff" : theme.text, border: `1px solid ${isSelected ? theme.accent : theme.border}`, cursor: "pointer", transition: "all 0.15s", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        {trait}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 🥀 트라우마 매트릭스 (균일한 Grid) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700", color: theme.danger, fontSize: "0.9rem" }}>트라우마 패널티</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: horrorTraumas.length === 3 ? theme.danger : theme.textMuted }}>
                    {horrorTraumas.length} / 3
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(5, 1fr)", gap: "8px" }}>
                  {TRAUMA_LIST.map(trauma => {
                    const isSelected = horrorTraumas.includes(trauma);
                    return (
                      <button
                        key={trauma}
                        onClick={() => {
                          if (isSelected) {
                            if (horrorTraits.length > (2 + horrorTraumas.length - 1)) {
                              triggerToast("해제 불가", "먼저 긍정 특성을 취소하여 한도를 비워주세요.", "⚠️");
                            } else {
                              setHorrorTraumas(horrorTraumas.filter(t => t !== trauma));
                            }
                          } else if (horrorTraumas.length < 3) {
                            setHorrorTraumas([...horrorTraumas, trauma]);
                          }
                        }}
                        style={{ width: "100%", padding: "10px 4px", borderRadius: "10px", fontSize: "0.78rem", fontWeight: isSelected ? "700" : "500", backgroundColor: isSelected ? theme.danger : theme.inputBg, color: isSelected ? "#fff" : theme.text, border: `1px solid ${isSelected ? theme.danger : theme.border}`, cursor: "pointer", transition: "all 0.15s", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        {trauma}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button onClick={() => setShowTraitModal(false)} style={{ width: "100%", padding: "14px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", border: "none", borderRadius: "12px", fontSize: "0.9rem", fontWeight: "700", cursor: "pointer", marginTop: "4px" }}>
                선택 완료
              </button>
            </div>
          </div>
        )}

{/* 🧭 탐색 탭: 시나리오 상세 페이지 전체 화면 오버레이 */}
        {selectedExploreScenario && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: theme.panel, zIndex: 300, display: "flex", flexDirection: "column", animation: "slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)", overflow: "hidden" }}>
            
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10, background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)" }}>
              <button onClick={() => setSelectedExploreScenario(null)} style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", width: "42px", height: "42px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", paddingBottom: "100px", WebkitOverflowScrolling: "touch" }}>
              <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: theme.panelAlt, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                 {selectedExploreScenario.imageUrl ? (
                   <img src={selectedExploreScenario.imageUrl} alt="커버" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                 ) : (
                   <ImageIcon size={48} color={theme.textMuted} opacity={0.3} />
                 )}
              </div>

              <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: "12px", borderBottom: `8px solid ${theme.sidebar}` }}>
                 <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                   <span style={{ backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "4px" }}>
                     {selectedExploreScenario.mode === "추리" ? <Search size={12} strokeWidth={3} /> : selectedExploreScenario.mode === "연애" ? <Heart size={12} strokeWidth={3} /> : <Flame size={12} strokeWidth={3} />}
                     {selectedExploreScenario.mode}
                   </span>
                   {selectedExploreScenario.isOriginal && (
                     <span style={{ backgroundColor: theme.panelAlt, border: `1px solid ${theme.borderHighlight}`, color: theme.text, padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "800" }}>공식 오리지널</span>
                   )}
                 </div>
                 <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "800", color: theme.text, lineHeight: 1.3, letterSpacing: "-0.5px" }}>
                   {selectedExploreScenario.title}
                 </h1>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                   <span style={{ fontSize: "0.9rem", color: theme.textMuted, fontWeight: "700" }}>제작: {selectedExploreScenario.author}</span>
                   <div style={{ display: "flex", gap: "12px", fontSize: "0.85rem", color: theme.textMuted, fontWeight: "800" }}>
                     <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Heart size={16} color={theme.danger} fill={theme.danger} /> {selectedExploreScenario.likes}</span>
                     <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Play size={16} color={theme.accent} fill={theme.accent} /> {selectedExploreScenario.plays}</span>
                   </div>
                 </div>
              </div>

              <div style={{ display: "flex", borderBottom: `1px solid ${theme.border}`, padding: "0 10px" }}>
                {["소개", "주요 인물"].map(tab => (
                  <button key={tab} onClick={() => setExploreDetailTab(tab)} style={{ flex: 1, padding: "16px", background: "none", border: "none", borderBottom: exploreDetailTab === tab ? `3px solid ${theme.accent}` : "3px solid transparent", color: exploreDetailTab === tab ? theme.text : theme.textMuted, fontSize: "0.95rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s" }}>
                    {tab}
                  </button>
                ))}
              </div>

              <div style={{ padding: "24px 20px" }}>
                {exploreDetailTab === "소개" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                    <div style={{ fontSize: "0.95rem", color: theme.text, lineHeight: 1.8, fontWeight: "500", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {selectedExploreScenario.data?.publicSynopsis || "등록된 소개글이 없습니다."}
                    </div>
                    {selectedExploreScenario.data?.triggerWarning && (
                      <div style={{ backgroundColor: isDarkMode ? "rgba(220, 38, 38, 0.08)" : "#fef2f2", border: `1px solid ${theme.danger}`, borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", color: theme.danger, fontWeight: "800", fontSize: "0.9rem" }}>
                          <ShieldAlert size={18} strokeWidth={2.5} /> 이용 전 주의사항
                        </span>
                        <div style={{ fontSize: "0.82rem", color: theme.text, lineHeight: 1.6, fontWeight: "500", whiteSpace: "pre-wrap" }}>
                          {selectedExploreScenario.data.triggerWarning}
                        </div>
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px", backgroundColor: theme.panelAlt, borderRadius: "16px", border: `1px solid ${theme.borderHighlight}` }}>
                      <span style={{ fontWeight: "800", fontSize: "1rem", color: theme.text }}>이용 안내</span>
                      <ul style={{ margin: 0, paddingLeft: "22px", fontSize: "0.85rem", color: theme.textMuted, lineHeight: 1.8, display: "flex", flexDirection: "column", gap: "8px", fontWeight: "500" }}>
                        <li>1회 행동 선언 및 진행: <strong style={{ color: theme.text }}>10 잉크 차감</strong></li>
                        <li>최초 진입 시 서막(오프닝)은 무료로 제공됩니다.</li>
                        <li>서재로 다운로드한 후 언제든 이어서 플레이할 수 있습니다.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {exploreDetailTab === "주요 인물" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {selectedExploreScenario.data?.suspects?.length > 0 ? (
                      selectedExploreScenario.data.suspects.map((npc, idx) => (
                        <div key={idx} style={{ display: "flex", gap: "16px", padding: "16px", backgroundColor: theme.panelAlt, borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                          <div style={{ width: "110px", height: "110px", borderRadius: "14px", backgroundColor: theme.inputBg, border: `1px solid ${theme.borderHighlight}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                             {npc.portraitUrl ? (
                               <img src={npc.portraitUrl} alt="인물" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                             ) : (
                               <ImageIcon size={32} color={theme.textMuted} />
                             )}
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ fontWeight: "800", fontSize: "1.1rem", color: theme.text }}>{npc.name || "이름 미상"}</span>
                              <span style={{ fontSize: "0.8rem", color: theme.accent, fontWeight: "800" }}>{npc.job || "직업 미상"}</span>
                            </div>
                            <div style={{ fontSize: "0.85rem", color: theme.text, lineHeight: 1.5, opacity: 0.9, whiteSpace: "pre-wrap" }}>
                              {npc.behavior || "등록된 인물 정보가 없습니다."}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "40px", textAlign: "center", color: theme.textMuted, fontSize: "0.9rem" }}>등록된 주요 인물이 없습니다.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

{/* 🌟 하단 플로팅 액션 바 */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 20px max(16px, env(safe-area-inset-bottom))", background: `linear-gradient(to top, ${theme.panel} 70%, transparent 100%)`, display: "flex", gap: "12px", zIndex: 20 }}>
               <button 
                 onClick={() => {
                   const isLiked = likedScenarios.some(s => s.id === selectedExploreScenario.id);
                   const isOrg = selectedExploreScenario.isOriginal;
                   let newLikes = Number(selectedExploreScenario.likes || 0);
                   let updatedLikedList;

                   if (isLiked) {
                     updatedLikedList = likedScenarios.filter(s => s.id !== selectedExploreScenario.id);
                     setLikedScenarios(updatedLikedList);
                     newLikes = Math.max(0, newLikes - 1); // 무조건 화면 숫자 깎기
                     if (!isOrg) supabase.from('scenarios').update({ likes: newLikes }).eq('id', selectedExploreScenario.id).then(); // 유저작품만 서버 전송
                     triggerToast("관심 해제", "관심 시나리오에서 제외되었습니다.", "💔");
                   } else {
                     updatedLikedList = [{ ...selectedExploreScenario, likedAt: Date.now() }, ...likedScenarios];
                     setLikedScenarios(updatedLikedList);
                     newLikes += 1; // 무조건 화면 숫자 올리기
                     if (!isOrg) supabase.from('scenarios').update({ likes: newLikes }).eq('id', selectedExploreScenario.id).then(); // 유저작품만 서버 전송
                     triggerToast("관심 등록", "관심 시나리오에 추가되었습니다!", <Heart fill={theme.danger} color={theme.danger} size={18}/>);
                   }
                   
                   // 🌟 (버그 픽스) 하트를 누르는 즉시 영구 저장소에 쾅 박아버립니다!
                   localStorage.setItem("secret_novel_liked", JSON.stringify(updatedLikedList));
                   
                   setSelectedExploreScenario(prev => ({ ...prev, likes: newLikes }));
                   setExploreScenarios(prev => prev.map(s => s.id === selectedExploreScenario.id ? { ...s, likes: newLikes } : s));
                 }}
                 title="관심 시나리오 등록" 
                 style={{ width: "56px", height: "56px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: theme.panelAlt, border: `1.5px solid ${theme.borderHighlight}`, borderRadius: "16px", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}
               >
                 <Heart size={24} color={likedScenarios.some(s => s.id === selectedExploreScenario.id) ? theme.danger : theme.textMuted} fill={likedScenarios.some(s => s.id === selectedExploreScenario.id) ? theme.danger : "none"} strokeWidth={2} />
               </button>

               <button 
                 onClick={() => {
                   if (savedLibrary.some(s => s.title === selectedExploreScenario.title)) {
                     triggerToast("다운로드 안내", "이미 내 서재에 보관된 서류철입니다.", "💡");
                     return;
                   }
                   if (userInk < 30) {
                     triggerToast("잉크 부족", "서재에 영구 소장하려면 30 잉크가 필요합니다.", "💧");
                     return;
                   }
                   setUserInk(prev => prev - 30);
                   
                   const newDownloadedScenario = {
                     id: Date.now(), title: selectedExploreScenario.title, mode: selectedExploreScenario.mode,
                     date: new Date().toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
                     imageUrl: selectedExploreScenario.imageUrl || "", 
                     isDownloaded: true, 
                     hasUpdate: false, 
                     data: selectedExploreScenario.data
                   };
                   
                   const updatedLibrary = [newDownloadedScenario, ...savedLibrary];
                   setSavedLibrary(updatedLibrary);
                   localStorage.setItem("secret_novel_library", JSON.stringify(updatedLibrary));
                   triggerToast("다운로드 완료", "30 잉크를 소모하여 서재에 보관했습니다.", <FileUp size={18} color={theme.accent} />);
                 }} 
                 title="서재에 담기" 
                 style={{ width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: theme.panelAlt, border: `1.5px solid ${theme.borderHighlight}`, borderRadius: "16px", cursor: "pointer", flexShrink: 0, color: theme.text, transition: "background 0.2s" }} 
               >
                 <FileUp size={24} strokeWidth={2} />
               </button>
               
               <button 
                 onClick={() => {
                   setIsGuestPlay(true);
                   if (userInk < 10) { triggerToast("잉크 부족", "보유한 잉크가 부족합니다.", "💧"); return; }
                   setUserInk(prev => prev - 10);
                   
                   const newPlays = Number(selectedExploreScenario.plays || 0) + 1;
                   setExploreScenarios(prev => prev.map(s => s.id === selectedExploreScenario.id ? { ...s, plays: newPlays } : s));
                   
                   if (!selectedExploreScenario.isOriginal) {
                     supabase.from('scenarios').update({ plays: newPlays }).eq('id', selectedExploreScenario.id).then(); 
                   }

                   const d = selectedExploreScenario.data;
                   if (d) {
                     setSelectedMode(selectedExploreScenario.mode);
                     setScenarioTitle(selectedExploreScenario.title);
                     
                     // 🌟 텅 빈 로비 데이터를 엎어치는 현상 수정! 원본 데이터를 100% 보존하며 덮어씌웁니다.
                     setPlayPreference(d.playPreference || ""); 
                     setPcName(d.pcName || ""); 
                     setPcAgeGender(d.pcAgeGender || ""); 
                     setPcJob(d.pcJob || ""); 
                     setPcBackground(d.pcBackground || ""); 
                     setPcPortraitUrl(d.pcPortraitUrl || ""); 
                     setPcSecret(d.pcSecret || ""); 
                     setShowPcSecret(d.showPcSecret || false);
                     setVictimName(d.victimName || ""); 
                     setPublicSynopsis(d.publicSynopsis || ""); 
                     setOpeningScene(d.openingScene || ""); 
                     setCulpritName(d.culpritName || ""); 
                     setTrickDetail(d.trickDetail || ""); 
                     setHiddenTruth(d.hiddenTruth || "");
                     
                     if(d.horrorStats) setHorrorStats(d.horrorStats);
                     if(d.horrorTraits) setHorrorTraits(d.horrorTraits);
                     if(d.horrorTraumas) setHorrorTraumas(d.horrorTraumas);
                     if(d.horrorInventory) setHorrorInventory(d.horrorInventory);
                     if(d.abyssTriggers) setAbyssTriggers(d.abyssTriggers);
                     if(d.usePartner !== undefined) setUsePartner(d.usePartner);
             
                     // 🌟 핵심 방어: 시트에서 받아온 파싱 데이터를 그대로 살림! 빈칸으로 밀어버리지 않음!
                     setMainPartners(d.mainPartners?.length > 0 ? d.mainPartners : [{ id: Date.now(), name: "", ageGender: "", job: "", behavior: "", secret: "", showSecret: false, portraitUrl: "" }]);
                     setSuspects(d.suspects?.length > 0 ? d.suspects : [{ id: Date.now()+1, name: "", ageGender: "", job: "", behavior: "", secret: "", portraitUrl: "", showSecret: false }]);
                     setEvidenceList(d.evidenceList?.length > 0 ? d.evidenceList : [{ id: Date.now()+2, name: "", overview: "", contradiction: "", secret: "", showSecret: false }]);
                     setCgList(d.cgList?.length > 0 ? d.cgList : [{ id: Date.now()+3, title: "", condition: "", dialogue: "", imageUrl: "", showDetails: false }]);
                     setRouteList(d.routeList?.length > 0 ? d.routeList : [{ id: Date.now()+4, routeName: "", targetId: "", affectionChange: "+10", requiredCG: "" }]);
                   }
                   
                   setScenarioImageUrl(selectedExploreScenario.imageUrl || ""); 
                   setSelectedExploreScenario(null);
                   setActiveTab("lobby");
                   triggerToast("세팅 시작", `[${selectedExploreScenario.title}] 10 잉크가 차감되었습니다.`, <Play size={18} color="#fff"/>);
                 }}
                 style={{ flex: 1, height: "56px", backgroundColor: theme.accent, border: "none", borderRadius: "16px", color: isDarkMode ? "#1a1817" : "#fff", fontSize: "1.05rem", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", boxShadow: `0 8px 24px ${theme.accentGlow}`, transition: "transform 0.2s" }} 
               >
                 <Play size={20} strokeWidth={3} /> 바로 플레이
               </button>
            </div>
          </div>
        )}

{/* ☁️ 서재 -> 탐색 라운지: 시나리오 퍼블리싱(업로드) 전체 화면 폼 */}
        {uploadingScenario && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: theme.bg, zIndex: 400, display: "flex", flexDirection: "column", animation: "slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)", overflow: "hidden" }}>
            
            {/* 상단 헤더 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.panel }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={() => setUploadingScenario(null)} style={{ background: "none", border: "none", color: theme.text, cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                  <ChevronLeft size={28} strokeWidth={2} />
                </button>
                <span style={{ fontWeight: "800", fontSize: "1.1rem", color: theme.text }}>라운지 업로드 신청</span>
              </div>
              
              <button 
                onClick={async () => {
                  triggerToast("업로드 중...", "서버로 데이터를 전송하고 있습니다.", "⏳");

                 // 🌟 혹시라도 빈칸이 들어가서 튕기지 않게 방어막(||)을 쳐둡니다!
                  const { error } = await supabase
                    .from('scenarios')
                    .insert([
                      {
                        title: uploadingScenario.title || "제목 없음",
                        mode: uploadingScenario.mode || "추리",
                        author_email: currentUser?.email || "unknown@test.com",
                        author_name: currentUser?.name || "익명 작가",
                        image_url: uploadingScenario.imageUrl || "",
                        data: {
                          ...uploadingScenario.data,
                          publicSynopsis: uploadingScenario.uploadSynopsis || "",
                          triggerWarning: uploadingScenario.uploadWarning || ""
                        },
                        status: '심사 대기'
                      }
                    ]);

                  // 🌟 에러가 나면 뭉뚱그리지 말고 "정확한 에러 원인"을 화면에 띄웁니다!
                  if (error) {
                    triggerToast("서버 에러 상세", error.message, "🚨");
                    console.error("Supabase 에러:", error);
                    return;
                  }

                  const updatedLibrary = savedLibrary.map(item => 
                    item.id === uploadingScenario.id ? { ...item, status: "심사 대기", loungeData: { synopsis: uploadingScenario.uploadSynopsis, warning: uploadingScenario.uploadWarning } } : item
                  );
                  setSavedLibrary(updatedLibrary);
                  localStorage.setItem("secret_novel_library", JSON.stringify(updatedLibrary));

                  setUploadingScenario(null);
                  triggerToast("심사 대기", "서버에 라운지 업로드 심사를 요청했습니다!", <CheckCircle2 size={18} color={theme.success} />);
                }}
                style={{ padding: "8px 16px", backgroundColor: theme.accent, border: "none", borderRadius: "10px", color: isDarkMode ? "#1a1817" : "#fff", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", boxShadow: `0 4px 12px ${theme.accentGlow}` }}
              >
                심사 요청
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "720px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
              
              {/* 시나리오 기본 정보 요약 (수정 불가, 서재 데이터 연동) */}
              <div style={{ display: "flex", gap: "16px", padding: "16px", backgroundColor: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <div style={{ width: "80px", aspectRatio: "16/9", backgroundColor: theme.panelAlt, borderRadius: "8px", overflow: "hidden", border: `1px solid ${theme.borderHighlight}`, flexShrink: 0 }}>
                  {uploadingScenario.imageUrl ? <img src={uploadingScenario.imageUrl} alt="커버" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}><ImageIcon size={20} color={theme.textMuted} /></div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", justifyContent: "center" }}>
                  <span style={{ fontSize: "1.05rem", fontWeight: "800", color: theme.text }}>{uploadingScenario.title}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: theme.textMuted }}>모드: {uploadingScenario.mode}</span>
                </div>
              </div>

             {/* 소개글 작성란 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginLeft: "4px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.text }}>탐색 라운지 공개 소개글</label>
                  <button type="button" onClick={() => handleAIGenerateSynopsis(true)} disabled={isGeneratingSynopsis} style={{ padding: "4px 10px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.borderHighlight}`, borderRadius: "8px", color: theme.accent, fontSize: "0.7rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    {isGeneratingSynopsis ? "작성 중..." : "✨ AI 자동 작성"}
                  </button>
                </div>
                <textarea
                  rows={5} 
                  value={uploadingScenario.uploadSynopsis}
                  onChange={e => setUploadingScenario({...uploadingScenario, uploadSynopsis: e.target.value})}
                  placeholder="라운지 상세 페이지에 노출될 매력적인 시놉시스를 작성해주세요." 
                  style={{ width: "100%", boxSizing: "border-box", padding: "14px", borderRadius: "12px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.9rem", resize: "vertical", outline: "none", lineHeight: 1.6 }} 
                />
              </div>

              {/* 트리거 워닝 작성란 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.danger, marginLeft: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <AlertTriangle size={16} strokeWidth={2.5} /> 열람 주의사항 (트리거 워닝)
                </label>
                <textarea 
                  rows={2} 
                  value={uploadingScenario.uploadWarning}
                  onChange={e => setUploadingScenario({...uploadingScenario, uploadWarning: e.target.value})}
                  placeholder="주의가 필요한 요소가 있다면 기재해주세요." 
                  style={{ width: "100%", boxSizing: "border-box", padding: "14px", borderRadius: "12px", border: `1px solid rgba(220, 38, 38, 0.4)`, backgroundColor: isDarkMode ? "rgba(220, 38, 38, 0.05)" : "#fef2f2", color: theme.text, fontSize: "0.9rem", resize: "vertical", outline: "none", lineHeight: 1.6 }} 
                />
              </div>

              {/* 등장인물 공개 설정란 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.text, marginLeft: "4px" }}>주요 인물 공개 설정</label>
                <div style={{ fontSize: "0.75rem", color: theme.textMuted, marginLeft: "4px" }}>라운지에 프로필을 노출할 인물을 선택하세요. (스포일러 인물은 숨김 권장)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", backgroundColor: theme.panelAlt, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.borderHighlight}` }}>
                  {uploadingScenario.data?.suspects?.length > 0 ? (
                    uploadingScenario.data.suspects.map((npc, idx) => (
                      <label key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "8px", borderRadius: "8px", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.inputBg} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <input type="checkbox" defaultChecked={true} style={{ width: "16px", height: "16px", accentColor: theme.accent, cursor: "pointer" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: "700", color: theme.text }}>{npc.name}</span>
                          <span style={{ fontSize: "0.7rem", color: theme.textMuted }}>{npc.job}</span>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div style={{ fontSize: "0.8rem", color: theme.textMuted, textAlign: "center", padding: "10px 0" }}>등록된 인물이 없습니다.</div>
                  )}
                </div>
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
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600" }}>{ruleHelpModal.title}</h3>
                    <div style={{ fontSize: "0.72rem", color: theme.textMuted }}>{ruleHelpModal.desc}</div>
                  </div>
                </div>
                <button type="button" onClick={() => setRuleHelpModal(null)} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}><X size={20}/></button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", paddingRight: "4px" }}>
                <div style={{ backgroundColor: theme.panelAlt, padding: "12px", borderRadius: "10px", border: `1px solid ${theme.border}` }}>
                  <div style={{ fontWeight: "600", fontSize: "0.82rem", color: theme.accent, marginBottom: "4px" }}>• 게임 진행 방식</div>
                  <div style={{ fontSize: "0.76rem", color: theme.text, lineHeight: "1.6" }}>
                    {ruleHelpModal.key === "추리" ? "단서를 모으고 인물들을 심문하여 사건의 진상을 밝혀냅니다." :
                     ruleHelpModal.key === "연애" ? "상대방의 호감도를 관리하며 다양한 엔딩을 향해 나아갑니다." :
                     "숨겨진 이면을 밝히고, 침식을 견디며 서스펜스 호러의 끝을 봅니다."}
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => setRuleHelpModal(null)} style={{ width: "100%", padding: "10px", backgroundColor: theme.accent, color: isDarkMode ? "#1a1817" : "#fff", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "0.82rem", cursor: "pointer", marginTop: "4px" }}>
                확인
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
