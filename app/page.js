"use client";

import { useState, useEffect } from "react";
import SecretBoard from "@/components/SecretBoard";
import CharacterSheet from "@/components/CharacterSheet";
import { createClient } from '@supabase/supabase-js'; 

// 🌟 Vercel 에러 원천 차단! 금고(process.env) 거치지 않고 직접 꽂아넣기
const supabase = createClient(
  "https://qytikqvngyvrszjygbbn.supabase.co",
  "sb_publishable_h-nZS3_gVKpcLxgowjGK_Q_mr4bFXAp"
);

import { 
  Search, Heart, Flame, LayoutGrid, LibraryBig, PenTool, UserRound, 
  Menu, Moon, Sun, Save, FileUp, HelpCircle, X, ChevronDown, ChevronUp, Image as ImageIcon,
  ClipboardList, Pin, FileSearch, Mailbox, Play,
  FolderOpen, Lock, Settings, Database, ClipboardPaste, LogOut,
  ArrowUp, Smartphone, BookOpen, Dices, ChevronLeft, ChevronRight, UploadCloud, AlertTriangle, CheckCircle2,
  Brain, Skull, Eye, Activity, ShieldAlert, ToggleLeft, ToggleRight, Plus, Minus, Ghost, Gift, Video, CreditCard, Headphones,
  Trash2, Clock, Tag, Droplet, MessageCircle, MessageSquare, Bandage, Clapperboard, Lightbulb, 
  Fingerprint, Flower2, Tentacle, Compass, Globe, Key
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
  if (/괴담|호러|인세인/i.test(modeRaw)) mode = "괴담";

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
    likes: Math.floor(Math.random() * 500) + 500 + "K",
    plays: Math.floor(Math.random() * 900) + 100 + "K",
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

 const [banners, setBanners] = useState([
    { id: 1, tag: "이번 주말의 추천 사건", title: "저택의 그림자", desc: "어느 비 오는 밤, 저택에서 울린 한 발의 총성.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80" },
    { id: 2, tag: "NEW 로맨스", title: "어느 세이렌의 결백", desc: "깊은 바닷속, 그녀가 숨기고 있는 슬픈 진실", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80" }
  ]);
  const [showBannerEdit, setShowBannerEdit] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null); // 🌟 (여기에 추가!) 어떤 배너를 수정할지 기억하는 상자
  
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
  const triggerToast = (title, message = "", icon = "✨") => {
    setToast({ title, message, icon });
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
  { id: Date.now(), name: "", ageGender: "", job: "", behavior: "", secret: "", showSecret: false, portraitUrl: "" }
]);

// 🌟 특성 및 트라우마 매트릭스 모달 스위치
const [showTraitModal, setShowTraitModal] = useState(false);

// 🌟 특성 및 트라우마 매트릭스 리스트 (크툴루/인세인 탈피 버전, Max 4글자 20/20)
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
  
  // 기본 텍스트 데이터 복원
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

// ── [탐색 탭 라운지 데이터 (구글 시트 연동)] ──
const [exploreScenarios, setExploreScenarios] = useState([]); // 처음엔 빈 배열

// 마운트 시 구글 시트에서 공식 시나리오 불러오기
useEffect(() => {
  if (GOOGLE_SHEET_CSV_URL && GOOGLE_SHEET_CSV_URL.trim() !== "" && !GOOGLE_SHEET_CSV_URL.includes("여기에")) {
    fetch(GOOGLE_SHEET_CSV_URL)
      .then(res => res.text())
      .then(csvText => {
        const rows = parseCSV(csvText);
        const headers = rows[0] || [];
        
        // 시트 데이터를 순회하며 프론트엔드 포맷으로 변환
        const sheetPresets = rows.slice(1)
          .map((row, idx) => convertRowToPreset(row, idx, headers))
          .filter(Boolean); // null(비공개/에러) 제거

// 🌟 다른 유저들이 올린 가짜 시나리오 데이터 추가!
        const dummyUserScenarios = [
          {
            id: Date.now() - 10000, title: "기억 상실증에 걸린 악녀", mode: "연애", author: "로맨스장인",
            likes: "942K", plays: "1.2M", isOriginal: false, imageUrl: "https://images.unsplash.com/photo-1621644265166-417122dfb428?auto=format&fit=crop&w=800&q=80",
            data: { publicSynopsis: "눈을 떠보니 소설 속 악녀가 되어 있었다. 게다가 기억까지 잃었다고?" }
          },
          {
            id: Date.now() - 20000, title: "폐교의 13번째 계단", mode: "괴담", author: "공포매니아",
            likes: "856K", plays: "990K", isOriginal: false, imageUrl: "https://images.unsplash.com/photo-1519098901909-b1553a1190fa?auto=format&fit=crop&w=800&q=80",
            data: { publicSynopsis: "자정이 되면 나타난다는 13번째 계단. 그곳에 발을 디딘 순간..." }
          }
        ];
   
        if (sheetPresets.length > 0) {
          setExploreScenarios(sheetPresets);
        }
      })
      .catch(err => console.error("구글 시트 불러오기 실패:", err));
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

  // 🌟 (추가!) 어드민 전용 서버 통신 데이터 상자 & 안테나
  const [adminPendingScenarios, setAdminPendingScenarios] = useState([]); 
  const [isReviewFetching, setIsReviewFetching] = useState(false); 

  useEffect(() => {
    // 어드민이 '심사 내역' 창을 열 때만 서버에서 데이터를 긁어옵니다!
    if (showReviewModal && isAdmin) {
      const fetchPendingScenarios = async () => {
        setIsReviewFetching(true);
        // Supabase의 scenarios 방에서 '심사 대기' 중인 것만 최신순으로 가져오기
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
  
const [showSupportModal, setShowSupportModal] = useState(false);
 
// ── [11. 관리자 및 추가 기능 상태] ──
  const MY_ADMIN_EMAIL = "usb1201@naver.com"; 
  const isAdmin = currentUser?.email === MY_ADMIN_EMAIL; // 이메일이 일치할 때만 어드민 권한 부여
  
  // 🌟 [제자리로 이사 옴!] 어드민 계정이면 무한 잉크 즉시 입금!!
  useEffect(() => {
    if (isAdmin) {
      setUserInk(9999999);
    }
  }, [isAdmin]);

  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [notices, setNotices] = useState([
    { id: 1, text: "시크릿 노벨 클로즈 베타 테스트에 오신 것을 환영합니다! 🎉\n버그 제보 및 피드백은 고객센터를 이용해 주세요.", date: "2026-10-01" }
  ]);
  const [newNotice, setNewNotice] = useState("");
  const [likedScenarios, setLikedScenarios] = useState([]); // 💖 관심 시나리오 보관함

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
    triggerToast("인물 삭제", "수사망에서 제외되었습니다.", <Trash2 size="{16}" strokeWidth="{2}"/>);
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

  // ── [10. 코어 엔진: 세션 시작 및 통신] ──
  const startNewSession = async () => {
    if (!scenarioTitle.trim()) {
      triggerToast("제목 입력", "이야기를 시작하려면 제목을 입력해주세요.", "⚠️");
      return;
    }

    const pName = pcName.trim() || "주인공";
    const initialSheet = {
      name: pName,
      job: pcJob || "조사원",
      ageGender: pcAgeGender || "",
      background: pcBackground || "",
      secret: pcSecret || "", // 🌟 주인공의 비밀 추가
      portrait: pcPortraitUrl || "",
      hp: 100, 
      maxHp: 100,
      npcs: suspects.map(s => ({ ...s, secretRevealed: false })), 
      handouts: evidenceList.map(e => ({ ...e, revealed: false })), 
      fatigue: 0,
      // 🌟 [추가됨] 시크릿 노벨 괴담 모드 독자 시스템 데이터 연동
      horrorStats: horrorStats,
      horrorTraits: horrorTraits,
      horrorTraumas: horrorTraumas,
      abyssTriggers: abyssTriggers,
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
                fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
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
                        <span style={{ position: "absolute", top: "-2px", right: "-2px", backgroundColor: theme.danger, color: "#fff", borderRadius: "10px", minWidth: "16px", height: "16px", fontSize: "0.6rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                          <div key={banner.id} style={{ ...GLASS_STYLE, flex: "0 0 100%", snapAlign: "center", aspectRatio: "16/9", backgroundColor: theme.panel, borderRadius: "20px", overflow: "hidden", position: "relative", border: `1px solid ${theme.borderHighlight}` }}>
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)", zIndex: 1 }} />
                            <img src={banner.imageUrl} alt="배너" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", padding: "24px 20px", zIndex: 2, display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ color: theme.accent, fontSize: "0.75rem", fontWeight: "900", letterSpacing: "1px" }}>{banner.tag}</span>
                              <h2 style={{ margin: 0, color: "#fff", fontSize: "1.6rem", fontWeight: "800" }}>{banner.title}</h2>
                              <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>{banner.desc}</p>
                            </div>
                            
                            {/* 👑 어드민 전용 배너 편집 버튼 */}
                            {isAdmin && (
                              <button onClick={() => { setEditingBanner({ ...banner }); setShowBannerEdit(true); }} style={{ position: "absolute", top: "16px", right: "16px", zIndex: 10, padding: "6px 12px", backgroundColor: theme.danger, color: "#fff", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "0.75rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
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
                            <span style={{ fontSize: "1.1rem", fontWeight: "800", color: theme.text }}>👑 공식 대표 작품! 오리지널</span>
                            <span onClick={() => setExploreFilter("전체")} style={{ fontSize: "0.8rem", fontWeight: "700", color: theme.textMuted, cursor: "pointer" }}>전체보기 〉</span>
                          </div>
                          <div style={{ display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "10px", WebkitOverflowScrolling: "touch" }}>
                            {originalScenarios.map(scen => (
                              <div key={scen.id} onClick={() => setSelectedExploreScenario(scen)} style={{ width: "140px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "8px", cursor: "pointer" }}>
                                <div style={{ width: "100%", aspectRatio: "3/4", backgroundColor: theme.panelAlt, borderRadius: "12px", overflow: "hidden", border: `1.5px solid ${theme.accent}`, position: "relative" }}>
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
                          <span style={{ fontSize: "1.1rem", fontWeight: "800", color: theme.text }}>🔥 지금 뜨는 인기 사건</span>
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

                            {/* 심사 대기 중 뱃지 */}
                            {scen.status === "심사 대기" && (
                              <div style={{ position: "absolute", top: "12px", left: "12px", padding: "4px 8px", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", borderRadius: "8px", color: theme.warning, fontSize: "0.7rem", fontWeight: "700", border: `1px solid rgba(245, 158, 11, 0.4)`, display: "flex", alignItems: "center", gap: "4px", zIndex: 5 }}>
                                <Clock size={12} strokeWidth={2.5} /> 심사 대기 중
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
                        <button type="button" onClick={() => setShowPcSecret(!showPcSecret)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", fontSize: "0.76rem", color: theme.danger, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}>
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
                      <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>사건 개요서</span>
                    </div>
                    <button type="button" onClick={() => handleAIGenerateSynopsis(false)} disabled={isGeneratingSynopsis} style={{ padding: "6px 12px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.borderHighlight}`, borderRadius: "10px", color: theme.accent, fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                      {isGeneratingSynopsis ? "작성 중..." : "✨ AI 자동 작성"}
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "10px", width: "100%", boxSizing: "border-box" }}>
                    <input type="text" autoComplete="off" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} placeholder="사건명 (예: 심야 펜트하우스 살인사건)" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                    <input type="text" autoComplete="off" value={victimName} onChange={e => setVictimName(e.target.value)} placeholder="사건 대상/의뢰인" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
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
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>

{/* 🌟 0. 추가된 사건 개요서 (연애 모드용) */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ClipboardList size={22} strokeWidth={2} color={theme.accent} />
                    <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>사건 개요서</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "10px" }}>
                    <input type="text" autoComplete="off" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} placeholder="시나리오 제목 (예: 어느 세이렌의 결백)" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                    <input type="text" autoComplete="off" value={victimName} onChange={e => setVictimName(e.target.value)} placeholder="주요 공략 대상 / 서사 목표" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                  </div>
                  <textarea rows={2} value={publicSynopsis} onChange={e => setPublicSynopsis(e.target.value)} placeholder="시놉시스 및 초기 배경 설명..." style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
                  <textarea rows={2} value={openingScene} onChange={e => setOpeningScene(e.target.value)} placeholder="첫 오프닝 지문..." style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
                </section>

                {/* 📱 1. 스마트폰 메신저 UI (추리 모드 가이드라인 100% 맞춤 복구!) */}
{/* 📱 스마트폰 메신저 UI (완벽 복구 & 줄바꿈/삐져나옴 해결!) */}
                <div style={{
                  width: "100%", maxWidth: "380px", margin: "0 auto", backgroundColor: theme.panel,
                  border: isDarkMode ? "12px solid #3f3f46" : "12px solid #e2e8f0", 
                  borderRadius: "40px", overflow: "hidden", display: "flex", flexDirection: "column",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", position: "relative",
                  height: "700px", flexShrink: 0, boxSizing: "border-box"
                }}>
                  {/* 핸드폰 상단바 */}
                  <div style={{ height: "24px", backgroundColor: isDarkMode ? "#3f3f46" : "#e2e8f0", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: "60px", height: "6px", backgroundColor: isDarkMode ? "#52525b" : "#cbd5e1", borderRadius: "10px" }} />
                  </div>

                  {!showPhoneDetail ? (
                    /* 📱 화면 A: 메신저 친구 목록 뷰 */
                    <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "24px", backgroundColor: theme.bg, boxSizing: "border-box" }}>
                      
                      {/* 내 프로필 */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: theme.textMuted }}>내 프로필</span>
                        <div 
                          onClick={() => { setSelectedSuspectId("pc"); setShowPhoneDetail(true); }}
                          style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", padding: "8px", borderRadius: "12px", transition: "background 0.2s", boxSizing: "border-box" }}
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
                            style={{ width: "64px", height: "64px", borderRadius: "40%", overflow: "hidden", border: `1px solid ${theme.borderHighlight}`, flexShrink: 0 }}
                          >
                            {pcPortraitUrl ? <img src={pcPortraitUrl} alt="주인공" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", backgroundColor: isDarkMode ? "#333" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}><UserRound size={24} color={theme.textMuted} /></div>}
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", overflow: "hidden" }}>
                            <span style={{ fontWeight: "700", fontSize: "1.05rem", color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pcName || "내 이름"}</span>
                            {/* 🌟 2줄까지만 예쁘게 보여주고 줄바꿈(pre-wrap) 유지! */}
                            <span style={{ fontSize: "0.8rem", color: theme.textMuted, whiteSpace: "pre-wrap", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{pcBackground || "상태 메시지가 없습니다."}</span>
                          </div>
                        </div>
                      </div>

                      <hr style={{ border: "none", borderTop: `1px solid ${theme.border}`, margin: 0 }} />

                      {/* 공략 대상 리스트 */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "4px" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: theme.textMuted }}>공략 대상 ({suspects.length})</span>
                          <button onClick={handleAddSuspect} style={{ background: "none", border: "none", color: "#ec4899", fontWeight: "600", fontSize: "0.8rem", cursor: "pointer" }}>＋ 추가</button>
                        </div>
                        
                        {suspects.map(s => (
                          <div 
                            key={s.id} 
                            onClick={() => { setSelectedSuspectId(s.id); setShowPhoneDetail(true); }}
                            style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", padding: "8px", borderRadius: "12px", transition: "background 0.2s", boxSizing: "border-box" }}
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
                              style={{ width: "54px", height: "54px", borderRadius: "40%", overflow: "hidden", border: `1px solid ${theme.borderHighlight}`, flexShrink: 0 }}
                            >
                              {s.portraitUrl ? <img src={s.portraitUrl} alt="공략대상" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", backgroundColor: isDarkMode ? "#333" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}><UserRound size={20} color={theme.textMuted} /></div>}
                            </div>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", overflow: "hidden" }}>
                              <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name || "이름 미상"}</span>
                              {/* 🌟 2줄까지만 예쁘게 보여주고 줄바꿈 유지! */}
                              <span style={{ fontSize: "0.75rem", color: theme.textMuted, whiteSpace: "pre-wrap", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.behavior || "상태 메시지가 없습니다."}</span>
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
                        width: "100%", boxSizing: "border-box", padding: "10px", border: "none", borderBottom: `1.5px solid ${theme.borderHighlight}`,
                        backgroundColor: "transparent", color: theme.text, fontSize: "0.95rem", outline: "none"
                      };

                      return (
                        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", backgroundColor: theme.panel, boxSizing: "border-box" }}>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: `1px solid ${theme.border}` }}>
                            <button onClick={() => setShowPhoneDetail(false)} style={{ background: "none", border: "none", color: theme.text, cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                              <X size={24} strokeWidth={2.5} />
                            </button>
                            <span style={{ fontWeight: "800", fontSize: "0.95rem" }}>{isPcDetail ? "내 프로필 편집" : "프로필 편집"}</span>
                            {!isPcDetail && suspects.length > 1 ? (
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteSuspect(e, cur.id); setShowPhoneDetail(false); }} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", fontWeight: "600", fontSize: "0.8rem" }}>삭제</button>
                            ) : <div style={{ width: "24px" }}/>}
                          </div>

                          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px", boxSizing: "border-box" }}>
                            
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
                                  backgroundColor: isDarkMode ? "#333" : "#f1f5f9", flexShrink: 0
                                }}
                              >
                                {cur.portraitUrl ? <img src={cur.portraitUrl} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={40} color={theme.textMuted} />}
                                <div style={{ position: "absolute", bottom: "8px", right: "8px", backgroundColor: "rgba(0,0,0,0.6)", padding: "6px", borderRadius: "50%" }}>
                                  <PenTool size={16} color="#fff" strokeWidth={2.5}/>
                                </div>
                              </div>

                              <button onClick={goNext} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textMuted, padding: "10px", display: "flex", alignItems: "center", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = theme.accent} onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}>
                                <ChevronRight size={36} strokeWidth={1.5} />
                              </button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "10px", width: "100%", boxSizing: "border-box" }}>
                              
                              <div>
                                <label style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "600", paddingLeft: "4px" }}>이름 (닉네임)</label>
                                <input type="text" autoComplete="off" value={cur.name} onChange={e => updateCur("name", e.target.value)} placeholder="이름을 입력하세요" style={{ ...thinInputStyle, fontSize: "1.2rem", fontWeight: "800", textAlign: "center", borderBottom: `2px solid ${theme.borderHighlight}` }} />
                              </div>
                              
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", width: "100%", boxSizing: "border-box" }}>
                                <div>
                                  <label style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "700", paddingLeft: "4px" }}>나이/성별</label>
                                  <input type="text" autoComplete="off" value={cur.ageGender} onChange={e => updateCur("ageGender", e.target.value)} placeholder="예: 28세 여성" style={thinInputStyle} />
                                </div>
                                <div>
                                  <label style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "700", paddingLeft: "4px" }}>직업/접점</label>
                                  <input type="text" autoComplete="off" value={cur.job} onChange={e => updateCur("job", e.target.value)} placeholder="예: 같은 팀 선임" style={thinInputStyle} />
                                </div>
                              </div>

                              <div>
                                <label style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "700", paddingLeft: "4px" }}>성격 및 상태 메시지 (관계성)</label>
                                {/* 🌟 textarea로 변경하여 줄바꿈 완벽 유지!! */}
                                <textarea rows={4} value={cur.behavior} onChange={e => updateCur("behavior", e.target.value)} placeholder="상태 메시지나 성격을 입력하세요..." style={{ ...thinInputStyle, resize: "vertical", whiteSpace: "pre-wrap", lineHeight: 1.6 }} />
                              </div>

                              <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "#fdf2f8", borderRadius: "12px", border: `1px solid #f9a8d4`, padding: "14px", marginTop: "8px", width: "100%", boxSizing: "border-box" }}>
                                <button type="button" onClick={() => {
                                  if (isPcDetail) setShowPcSecret(!showPcSecret);
                                  else handleUpdateSuspect(cur.id, "showSecret", !cur.showSecret);
                                }} style={{ width: "100%", textAlign: "left", background: "none", border: "none", fontSize: "0.85rem", color: isDarkMode ? "#f472b6" : "#db2777", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}>
                                  <span style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Lock size={16} strokeWidth={2.5} /> 남모르는 비밀 / 진심
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center" }}>
                                    {(isPcDetail ? showPcSecret : cur.showSecret) ? <ChevronUp size={20} strokeWidth={2.5} /> : <ChevronDown size={20} strokeWidth={2.5} />}
                                  </span>
                                </button>
                                
                                {(isPcDetail ? showPcSecret : cur.showSecret) && (
                                  <textarea rows={3} value={isPcDetail ? pcSecret : cur.secret} onChange={e => {
                                    if (isPcDetail) setPcSecret(e.target.value);
                                    else handleUpdateSuspect(cur.id, "secret", e.target.value);
                                  }} placeholder="예: 사실 오래전부터 마음에 두고 있었다." style={{ width: "100%", boxSizing: "border-box", padding: "12px", marginTop: "14px", borderRadius: "8px", border: `1px dashed #f9a8d4`, backgroundColor: theme.inputBg, color: isDarkMode ? "#f9a8d4" : "#be185d", fontSize: "0.9rem", outline: "none", resize: "vertical", lineHeight: 1.6 }} />
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

            {selectedMode === "괴담" && (
              <>
                {/* 1. 사건 개요서 */}
                <section style={{ ...GLASS_STYLE, padding: isMobile ? "16px" : "20px", backgroundColor: theme.panel, borderRadius: "18px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ClipboardList size={22} strokeWidth={2} color={theme.accent} />
                    <span style={{ fontWeight: "700", fontSize: "0.95rem", color: theme.text }}>사건 개요서</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "10px" }}>
                    <input type="text" autoComplete="off" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} placeholder="사건명" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                    <input type="text" autoComplete="off" value={victimName} onChange={e => setVictimName(e.target.value)} placeholder="사건 대상 / 조사 목표" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none" }} />
                  </div>
                  <textarea rows={2} value={publicSynopsis} onChange={e => setPublicSynopsis(e.target.value)} placeholder="현장 상황 및 초기 배경 설명..." style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
                  <textarea rows={2} value={openingScene} onChange={e => setOpeningScene(e.target.value)} placeholder="첫 오프닝 지문..." style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.83rem", resize: "none", outline: "none" }} />
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
                        <span>🏷️ 특성 및 트라우마</span>
                        <span style={{ fontSize: "0.75rem", color: theme.textMuted }}>선택 완료: 특성 {horrorTraits.length} | 트라우마 {horrorTraumas.length}</span>
                      </button>

                      <div style={{ backgroundColor: theme.panelAlt, borderRadius: "10px", padding: "12px", border: `1px solid ${theme.borderHighlight || theme.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: "700", color: theme.text }}>1D10 스탯 분배</span>
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
                    onClick={() => setShowCgModal(false)}
                    style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}
                  >
                    ✕
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

              {/* 텍스트 변경 구역 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                 <input type="text" value={editingBanner.tag} onChange={e => setEditingBanner({...editingBanner, tag: e.target.value})} placeholder="태그 (예: 추천 사건)" style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none", fontWeight: "700" }} />
                 <input type="text" value={editingBanner.title} onChange={e => setEditingBanner({...editingBanner, title: e.target.value})} placeholder="배너 제목" style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "1rem", outline: "none", fontWeight: "800" }} />
                 <textarea rows={2} value={editingBanner.desc} onChange={e => setEditingBanner({...editingBanner, desc: e.target.value})} placeholder="배너 설명" style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "0.85rem", outline: "none", resize: "none" }} />
              </div>

              {/* 완료 버튼 */}
              <button 
                onClick={() => {
                  setBanners(banners.map(b => b.id === editingBanner.id ? editingBanner : b));
                  setShowBannerEdit(false);
                  triggerToast("교체 완료", "메인 배너가 성공적으로 업데이트되었습니다.", <CheckCircle2 color={theme.success} size={18}/>);
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
                        <span>모드: {s.ruleMode === "dating" ? "연애" : s.ruleMode === "insane" ? "괴담" : "추리"}</span>
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
                  <button onClick={() => { 
                    if(!newNotice.trim()) return; 
                    setNotices([{ id: Date.now(), text: newNotice, date: new Date().toISOString().split("T")[0] }, ...notices]);
                    setNewNotice("");
                    triggerToast("공지 등록", "새 공지가 등록되었습니다.", "✅");
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

        {/* ☁️️ 라운지 심사 및 발행 내역 팝업 */}
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
                  savedLibrary.filter(s => s.status === "심사 대기").length === 0 ? (
                     <div style={{ padding: "40px", textAlign: "center", color: theme.textMuted, fontSize: "0.9rem" }}>현재 심사 중인 서류철이 없습니다.</div>
                  ) : (
                     savedLibrary.filter(s => s.status === "심사 대기").map(s => (
                       <div key={s.id} style={{ padding: "16px", backgroundColor: theme.inputBg, borderRadius: "12px", border: `1px solid ${theme.warning}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                         <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                           <span style={{ fontWeight: "800", color: theme.text, fontSize: "1.05rem" }}>{s.title}</span>
                           <span style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "600" }}>{s.date} 신청</span>
                         </div>
                         <span style={{ backgroundColor: theme.warning, color: "#fff", padding: "6px 10px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "800", boxShadow: "0 2px 8px rgba(245, 158, 11, 0.4)" }}>심사 대기 중</span>
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

              {/* 💳 잉크 상점 구역 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "800", color: theme.text }}>스토어 충전</span>
                {[
                  { amount: 100, price: "₩ 1,200", bonus: "" },
                  { amount: 500, price: "₩ 5,500", bonus: "+50 방울 보너스" },
                  { amount: 1200, price: "₩ 12,000", bonus: "+200 방울 보너스" }
                ].map((item, i) => (
                  <div key={i} onClick={() => triggerToast("결제 준비 중", "스토어 결제 모듈이 아직 연결되지 않았습니다.", <CreditCard size={18}/>)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: theme.inputBg, borderRadius: "14px", border: `1px solid ${theme.border}`, cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = theme.accent} onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "1.05rem", fontWeight: "800", color: theme.text, display: "flex", alignItems: "center", gap: "6px" }}>
                        <Droplet size={16} strokeWidth={3} color={theme.accent} /> {item.amount}
                      </span>
                      {item.bonus && <span style={{ fontSize: "0.75rem", color: theme.accent, fontWeight: "700" }}>{item.bonus}</span>}
                    </div>
                    <div style={{ padding: "8px 14px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", color: theme.text }}>
                      {item.price}
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
              {/* 🌟 메인 커버 이미지 (잘림 방지) */}
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
                    
                    {/* 🌟 (고침) 가짜 텍스트 싹 빼고! 진짜 publicSynopsis 불러옵니다! 줄바꿈 유지! */}
                    <div style={{ fontSize: "0.95rem", color: theme.text, lineHeight: 1.8, fontWeight: "500", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {selectedExploreScenario.data?.publicSynopsis || "등록된 소개글이 없습니다."}
                    </div>

                    {/* 트리거 워닝이 있을 때만 경고창 띄우기! */}
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
                    {/* 🌟 주요 인물 썸네일 크기 대폭 확대 (70px -> 110px) */}
                    {[
                      { name: "세라", job: "미스터리 동아리 부장", desc: "언제나 완벽을 추구하지만, 무언가 큰 실수를 숨기고 있는 듯하다." },
                      { name: "진우", job: "아카데미 학생회장", desc: "사건의 중심에 서 있는 의문의 소년. 속을 알 수 없는 미소로 일관한다." }
                    ].map((npc, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "16px", padding: "16px", backgroundColor: theme.panelAlt, borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                        <div style={{ width: "110px", height: "110px", borderRadius: "14px", backgroundColor: theme.inputBg, border: `1px solid ${theme.borderHighlight}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                           <ImageIcon size={32} color={theme.textMuted} />
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontWeight: "800", fontSize: "1.1rem", color: theme.text }}>{npc.name}</span>
                            <span style={{ fontSize: "0.8rem", color: theme.accent, fontWeight: "800" }}>{npc.job}</span>
                          </div>
                          <div style={{ fontSize: "0.85rem", color: theme.text, lineHeight: 1.5, opacity: 0.9 }}>
                            {npc.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 🌟 하단 플로팅 액션 바 */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 20px max(16px, env(safe-area-inset-bottom))", background: `linear-gradient(to top, ${theme.panel} 70%, transparent 100%)`, display: "flex", gap: "12px", zIndex: 20 }}>
               
               {/* 💖 하트(좋아요) 버튼 추가 */}
               <button 
                 onClick={() => {
                   const isLiked = likedScenarios.some(s => s.id === selectedExploreScenario.id);
                   if (isLiked) {
                     setLikedScenarios(likedScenarios.filter(s => s.id !== selectedExploreScenario.id));
                     triggerToast("관심 해제", "관심 시나리오에서 제외되었습니다.", "💔");
                   } else {
                     setLikedScenarios([{ ...selectedExploreScenario, likedAt: Date.now() }, ...likedScenarios]);
                     triggerToast("관심 등록", "관심 시나리오에 추가되었습니다!", <Heart fill={theme.danger} color={theme.danger} size={18}/>);
                   }
                 }}
                 title="관심 시나리오 등록" 
                 style={{ width: "56px", height: "56px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: theme.panelAlt, border: `1.5px solid ${theme.borderHighlight}`, borderRadius: "16px", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}
               >
                 <Heart size={24} color={likedScenarios.some(s => s.id === selectedExploreScenario.id) ? theme.danger : theme.textMuted} fill={likedScenarios.some(s => s.id === selectedExploreScenario.id) ? theme.danger : "none"} strokeWidth={2} />
               </button>

               {/* 서재 다운로드 버튼 (기존) */}
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
                     data: selectedExploreScenario.data // 🌟 (핵심!) 가짜 텍스트 대신 구글 시트에서 파싱한 진짜 데이터를 그대로 넘겨줍니다!!
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
               
               {/* 바로 플레이 버튼 (수정완료!) */}
               <button 
                 onClick={() => {
                   setIsGuestPlay(true);
                   if (userInk < 10) { triggerToast("잉크 부족", "보유한 잉크가 부족합니다.", "💧"); return; }
                   setUserInk(prev => prev - 10);
                   
                   // 🌟 (핵심 고침!) 로비로 모든 데이터를 쫙 뿌려주는 로직을 가져옵니다.
                   const d = selectedExploreScenario.data;
                   if (d) {
                     setSelectedMode(selectedExploreScenario.mode);
                     setScenarioTitle(selectedExploreScenario.title);
                     setPlayPreference(d.playPreference || ""); setPcName(d.pcName || ""); setPcAgeGender(d.pcAgeGender || ""); setPcJob(d.pcJob || ""); setPcBackground(d.pcBackground || ""); setPcPortraitUrl(d.pcPortraitUrl || ""); setPcSecret(d.pcSecret || ""); setShowPcSecret(d.showPcSecret || false);
                     setVictimName(d.victimName || ""); setPublicSynopsis(d.publicSynopsis || ""); setOpeningScene(d.openingScene || ""); setCulpritName(d.culpritName || ""); setTrickDetail(d.trickDetail || ""); setHiddenTruth(d.hiddenTruth || "");
                     
                     if(d.horrorStats) setHorrorStats(d.horrorStats);
                     if(d.horrorTraits) setHorrorTraits(d.horrorTraits);
                     if(d.horrorTraumas) setHorrorTraumas(d.horrorTraumas);
                     if(d.horrorInventory) setHorrorInventory(d.horrorInventory);
                     if(d.abyssTriggers) setAbyssTriggers(d.abyssTriggers);
                     if(d.usePartner !== undefined) setUsePartner(d.usePartner);
             
                     setMainPartners(d.mainPartners?.length ? d.mainPartners : [{ id: Date.now(), name: "", ageGender: "", job: "", behavior: "", secret: "", showSecret: false, portraitUrl: "" }]);
                     setSuspects(d.suspects?.length ? d.suspects : [{ id: Date.now()+1, name: "", ageGender: "", job: "", behavior: "", secret: "", portraitUrl: "", showSecret: false }]);
                     setEvidenceList(d.evidenceList?.length ? d.evidenceList : [{ id: Date.now()+2, name: "", overview: "", contradiction: "", secret: "", showSecret: false }]);
                     setCgList(d.cgList?.length ? d.cgList : [{ id: Date.now()+3, title: "", condition: "", dialogue: "", imageUrl: "", showDetails: false }]);
                     setRouteList(d.routeList?.length ? d.routeList : [{ id: Date.now()+4, routeName: "", targetId: "", affectionChange: "+10", requiredCG: "" }]);
                   }

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

                  const { error } = await supabase
                    .from('scenarios')
                    .insert([
                      {
                        title: uploadingScenario.title,
                        mode: uploadingScenario.mode,
                        author_email: currentUser?.email || "unknown@test.com",
                        author_name: currentUser?.name || "익명 작가",
                        image_url: uploadingScenario.imageUrl || "",
                        data: {
                          ...uploadingScenario.data,
                          publicSynopsis: uploadingScenario.uploadSynopsis,
                          triggerWarning: uploadingScenario.uploadWarning
                        },
                        status: '심사 대기'
                      }
                    ]);

                  if (error) {
                    triggerToast("업로드 실패", "서버 연결에 문제가 발생했습니다.", "⚠️");
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
