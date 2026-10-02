// components/ScenarioStudioModal.js
"use client";

import React, { useState } from "react";
import { 
  X, Sparkles, Copy, Check, ExternalLink, 
  UserRound, Tag, Users, Ghost, Search, Heart, PenTool, Image as ImageIcon, GitFork
} from "lucide-react";

// DOPA 전속 시나리오 작가 AI 스튜디오 링크
const DOPA_AI_STUDIO_URL = "https://gemini.google.com/gem/1laNhRvl9HlbyfErFfxUIs05pOrxSh_Sx?usp=sharing";

export default function ScenarioStudioModal({
  isOpen,
  onClose,
  theme,
  isDarkMode = true,
  isMobile = false,
  triggerToast
}) {
  if (!isOpen) return null;

  // 1. 룰 선택
  const [selectedRule, setSelectedRule] = useState("괴담");

  // 2. 키워드 태그
  const RELATION_TAGS = [
    "#쌍방구원", "#혐관", "#애증", "#신분차", "#비밀계약", 
    "#착각계", "#짝사랑", "#달달일상", "#후회/피폐", "#배틀로맨스", 
    "#운명적유대", "#스폰서", "#사제지간", "#소꿉친구", "#다각관계"
  ];

  const BACKGROUND_TAGS = [
    "#오컬트", "#폐쇄병동", "#고립된저택", "#도시괴담", "#코스믹호러", 
    "#밀실살인", "#시간루프", "#기억상실", "#시한부", "#가면무도회", 
    "#아포칼립스", "#동양풍/사극", "#사이버펑크", "#황실/로판", "#학원물"
  ];

  const [selectedTags, setSelectedTags] = useState([""]);
  const [customTagInput, setCustomTagInput] = useState("");

  // 3. 도파미너(주인공)
  const [pcGenderAge, setPcGenderAge] = useState("");
  const [pcJob, setPcJob] = useState("");
  const [pcPersonality, setPcPersonality] = useState("");
  const [pcSecret, setPcSecret] = useState("");

  // 4. 룰별 맞춤 인물 설정
  // [연애]
  const [datingTargetCount, setDatingTargetCount] = useState("");
  const [datingTargetJob, setDatingTargetJob] = useState("");
  const [datingTargetCharm, setDatingTargetCharm] = useState("");

  // [추리]
  const [mysteryVictim, setMysteryVictim] = useState("");
  const [mysterySuspectCount, setMysterySuspectCount] = useState("");
  const [mysterySuspects, setMysterySuspects] = useState("");

  // [괴담] 🌟 파트너(0~5명) vs 추가인물(0~15명) 완벽 분리
  const [ghostPartnerCount, setGhostPartnerCount] = useState("");
  const [ghostPartnerDesc, setGhostPartnerDesc] = useState("");
  const [ghostExtraNpcCount, setGhostExtraNpcCount] = useState("");
  const [ghostExtraNpcDesc, setGhostExtraNpcDesc] = useState("");
  const [ghostEntityIdea, setGhostEntityIdea] = useState("");

  // 5. 공통 CG, 루트, 단서 희망사항 및 추가 아이디어
  const [desiredCgAndRoutes, setDesiredCgAndRoutes] = useState("");
  const [additionalIdea, setAdditionalIdea] = useState("");

  const [isCopied, setIsCopied] = useState(false);

  // 텍스트에어리어 자동 높이 조절
  const handleAutoResize = (e, setter) => {
    setter(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getMergedTags = () => {
    const customList = customTagInput
      .split(/[\s,]+/)
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => t.startsWith("#") ? t : `#${t}`);
    return Array.from(new Set([...selectedTags, ...customList]));
  };

  // 📋 DOPA 공식 파서 규격 100% 일치 프롬프트 빌더
  const buildPromptText = () => {
    const finalTags = getMergedTags().join(" ") || "#자유 서사";
    let modeSpecificInstructions = "";
    let modeSpecificSchema = "";

    // 💖 1. 연애 모드
    if (selectedRule === "연애") {
      modeSpecificInstructions = `
[💖 DOPA 연애 모드 집필 원칙]
1. 인원 규격: 공략 대상은 최소 1명에서 최대 15명까지 유저 요청에 따라 유연하게 생성하십시오. (현재 희망: ${datingTargetCount || "1명"})
2. 행동 자유도 100%: 억지 호감도 잠금 없이 도파미너의 돌발 행동(초면 고백, 스킨십 등)에 인물이 성격대로 즉각 반응해야 합니다.
3. 안티-예스맨: 맹목적 동조 금지. 인물별 역린, 감정 침식(서운->피로->체념->단절), 처절한 후회 서사를 포함하십시오.
4. 다각관계 지원: 복수 공략 대상 시 알리바이 줄타기 복선 노출(향수 냄새, 머리카락 등), 3자 대면 서스펜스를 설계하십시오.
5. 영구 호흡권: AI 자의적 시간 스킵/암전을 절대 금지하고 공감각 슬로우 모션 서술을 유지하십시오.
6. CG 및 루트: 감정선에 맞춘 [이벤트 CG (최대 15개)]와 호감도 변화를 담은 [공략 분기점 (최대 20개)]을 반드시 작성하십시오.`;

      modeSpecificSchema = `
[시나리오 제목]
(작품 제목)

[공개 시놉시스]
(라운지와 서재용 소개글 3~4문장)

[초기 배경/서막]
(도파미너 시점 첫 대면 오프닝 지문 4~5문장)

[AI 디렉터 전용 비공개 진상 (진실)]
(상대방 속마음, 관계의 숨겨진 비밀, 최종 결말 조건)

[주요 공략 대상 / 서사 목표]
(메인 공략 대상 이름)

[등장인물 목록]
- 인물1 이름: (이름)
  나이/성별: (예: 28세 남성)
  직업/신분: (직업)
  외모 및 성격: (외모 묘사 및 행동 특징)
  상태메시지: "(메신저 프로필 한 줄 문구)"
  취향: (좋아하는 것) 좋아함 / (싫어하는 것) 싫어함
  남모르는 비밀: (결핍, 약점, 숨겨진 사연)

(필요 시 인물2 ~ 인물15 추가)

[핵심 단서 및 물증 (Handouts)]
- 단서1 명칭: (단서명)
  발견 위치 및 겉모습: (상세 묘사)
  이면의 진실/모순: (밝혀질 취향 또는 인물 비밀)

[이벤트 CG 갤러리]
- CG1 제목: (CG 명칭)
  해금 조건: (해금 조건)
  상황 및 대사: (결정적 대사와 비주얼 상황 묘사)

(필요 시 CG2 ~ CG15 추가)

[공략 분기점 및 루트]
- 분기1: (선택지 설명) / 대상: (인물명) / 조건: (+10 호감도)
- 분기2: (선택지 설명) / 대상: (인물명) / 조건: (-15 호감도 또는 결별)

(필요 시 분기3 ~ 분기20 추가)

[소지품 및 선물]
- (가방에 지니고 시작할 선물/소지품 목록)`;

    // 🕵️ 2. 추리 모드
    } else if (selectedRule === "추리") {
      modeSpecificInstructions = `
[🕵️ DOPA 추리 모드 집필 원칙]
1. 인원 규격: 용의자 수사망은 최소 1명부터 최대 15명까지 유연하게 배정하십시오. (현재 희망: ${mysterySuspectCount || "3~4명"})
2. 페어 플레이: 진범, 트릭, 스모킹 건을 도중에 바꾸지 마십시오.
3. 동조 차단: 엉뚱한 반증 시 용의자가 비웃으며 신뢰도(HP) 데미지를 입히게 하십시오.
4. 거짓말 복선: 용의자 진술 중 최소 1개는 미세 신체 반응(Tells)과 함께 모순을 품게 하십시오.
5. 완전범죄 분기: 도파미너('${pcJob || "수사관"}')가 진범일 때 위장 공작이 가능하도록 알리바이 공백을 설계하십시오.
6. CG 및 루트: 결정적 현장 [사건 CG (최대 15개)]와 진범 지목/은폐를 가르는 [수사 분기 루트 (최대 20개)]를 반드시 포함하십시오.`;

      modeSpecificSchema = `
[시나리오 제목]
(사건명)

[공개 시놉시스]
(사건 현장 및 발생 개요 3~4문장)

[초기 배경/서막]
(현장 도착 첫 오프닝 지문 4~5문장)

[AI 디렉터 전용 비공개 진상 (진실)]
(배후 내막, 살해 동기, 트릭 파훼법)

[진범 / 흑막 이름]
(진범 이름)

[사용된 트릭]
(핵심 트릭 수법)

[사건 목표 / 피해자]
${mysteryVictim || "(피해자/의뢰인)"}

[용의자 수사망]
- 인물1 이름: (이름)
  나이/성별: (나이/성별)
  직업/역할: (직업)
  인물 특징 및 사건 행적: (성격, 피해자와의 관계, 사건 당일 행적)
  상태메시지: "(메신저 프로필 문구)"
  숨겨진 비밀: (알리바이 모순 또는 사생활)

(필요 시 인물2 ~ 인물15 추가)

[사건 단서 및 물증 (Handouts)]
- 단서1 명칭: (물증 이름)
  발견 위치 및 겉모습: (상세 묘사)
  감식 진상 / 모순: (스모킹 건 및 반증 포인트)

(필요 시 단서2 ~ 단서15 추가)

[이벤트 CG 갤러리]
- CG1 제목: (CG 명칭)
  해금 조건: (해금 조건)
  상황 및 대사: (상황 및 결정적 대사)

[공략 분기점 및 루트]
- 분기1: (선택지 설명) / 대상: (인물명) / 조건: (수사 진척)
- 분기2: (선택지 설명) / 대상: (인물명) / 조건: (체포 또는 누명 은폐)

(필요 시 분기3 ~ 분기20 추가)`;

    // 🕯️ 3. 괴담 모드 (풀스펙 반영!)
    } else {
      modeSpecificInstructions = `
[🕯️ DOPA 괴담 모드 집필 원칙]
1. 🚨 인원수 엄격 규격:
   - [동행 파트너]: 0명(나홀로 조사) ~ 최대 5명까지 지원. (현재 희망: ${ghostPartnerCount || "1명"}) 없는 경우 반드시 '없음'으로 명시하십시오.
   - [추가 등장인물]: 0명(단둘이 고립) ~ 최대 15명까지 지원. (현재 희망: ${ghostExtraNpcCount || "0명"}) 없는 경우 반드시 '없음'으로 명시하십시오.
2. 1D10 행동 굴림 & 6대 스탯: 도파미너 스탯 6종(체력, 순발, 관찰, 추론, 정신, 사교)의 합계는 반드시 정확히 35pt가 되도록 배분하십시오.
3. 3중 감각 침식 & 이상 충동: 침식도 30%(경미한 위화감), 60%(착란/환각), 90%(자제력 붕괴 폭주)에 발현될 이상 충동 지문을 구체적으로 설계하십시오.
4. 시작 소지품 3종: 멘탈 회복, 특수 기믹 패스, 재굴림 3대 아이템을 콘셉트에 맞게 명명하십시오.
5. 🚨 괴담 전용 CG & 루트 필수 작성:
   - [이벤트 CG 갤러리 (최대 15개)]: 괴이 조우 씬, 공포의 결정적 순간, 희생 씬 등의 비주얼 CG를 2~4개 이상 필수로 작성하십시오.
   - [공략 분기점 및 루트 (최대 20개)]: '정면 돌파', '파트너 희생', '금기 파기' 등 생존과 파멸을 가르는 루트를 2~4개 이상 필수로 작성하십시오.
6. 3단계 결착 의식: 괴이를 제압하거나 탈출할 수 있는 구체적 3단계 의식 수칙을 진상에 명시하십시오.`;

      modeSpecificSchema = `
[시나리오 제목]
(괴담 제목)

[공개 시놉시스]
(괴담 소문 및 고립 공간 개요 3~4문장)

[초기 배경/서막]
(폐쇄 공간에 발을 들이는 서막 오프닝 지문 4~5문장)

[AI 디렉터 전용 비공개 진상 (진실)]
(괴이의 원흉, 저주의 규칙, 3단계 파훼 결착 의식 수칙)

[원흉 / 괴이의 진짜 정체]
${ghostEntityIdea || "(괴이의 실체 및 약점)"}

[사건 목표 / 봉인 대상]
(생환 목표 또는 탈출/봉인 조건)

[동행 파트너 (메인 파트너)]
(파트너가 없는 나홀로 탐색 시 '없음'으로 표기. 있을 경우 파트너1부터 최대 파트너5까지 작성)
- 파트너1 이름: (이름)
  나이/성별: (나이/성별)
  직업/신분: (직업)
  외모 및 성격: (외모 및 도파미너와의 관계성)
  숨겨진 이면 / 진심: (파트너가 숨기고 있는 충격적인 비밀이나 트라우마)

[추가 등장인물 (선택 사항)]
(추가 인물이 없을 시 '없음'으로 표기. 있을 경우 인물1부터 최대 인물15까지 작성)
- 인물1 이름: (이름)
  특징 및 행적: (현장에 함께 갇힌 생존자/목격자)
  숨겨진 비밀: (비밀)

[사건 단서 및 물증 (Handouts)]
- 단서1 명칭: (단서/조사록 이름)
  발견 위치 및 겉모습: (상세 묘사)
  감식 진상 / 모순: (괴이의 약점 또는 과거 희생자의 기록)

- 단서2 명칭: (단서 이름)
  발견 위치 및 겉모습: (묘사)
  감식 진상 / 모순: (숨겨진 진실)

(필요 시 단서3 ~ 단서15 추가)

[이벤트 CG 갤러리]
- CG1 제목: (공포 이벤트 CG 명칭)
  해금 조건: (해금 조건, 예: 4층 복도 끝 거울을 들여다본다)
  상황 및 대사: (숨막히는 공포 묘사 및 결정적 대사)

- CG2 제목: (CG 명칭)
  해금 조건: (해금 조건)
  상황 및 대사: (상황 묘사)

(필요 시 CG3 ~ CG15 추가)

[공략 분기점 및 루트]
- 분기1: (선택지 설명) / 대상: (파트너 또는 괴이) / 조건: (생존 판정 또는 멘탈 회복)
- 분기2: (선택지 설명) / 대상: (인물명) / 조건: (침식도 폭증 또는 탈출구 발견)

(필요 시 분기3 ~ 분기20 추가)

[도파미너 6대 스탯 분배 (합계 정확히 35pt)]
- 체력: 6
- 순발: 6
- 관찰: 7
- 추론: 6
- 정신: 5
- 사교: 5

[도파미너 특성 및 트라우마]
- 긍정 특성: (위화감지, 이면간파 등 콘셉트에 맞는 2개)
- 트라우마: (시선강박, 거울기피 등 콘셉트에 맞는 1개)

[도파미너 이상 충동 발현 지문]
- 이상충동30: (침식도 30% 도달 시 발현될 기이한 신체/감각 증상)
- 이상충동60: (침식도 60% 도달 시 발현될 착란/환각 증상)
- 이상충동90: (침식도 90% 도달 시 자제력을 잃고 폭주하는 충동 증상)

[시작 소지품 세팅]
- 멘탈 회복 아이템: (명칭 및 효과)
- 특수 기믹 패스 아이템: (명칭 및 효과)
- 재굴림 아이템: (명칭 및 효과)`;
    }

    return `[DOPA 공식 시나리오 생성 요청서]
당신은 AI 텍스트 RPG 플랫폼 'DOPA'의 전속 시나리오 작가입니다.
아래 기획 설정을 바탕으로, DOPA 파서가 100% 인식할 수 있는 공식 마크다운 서식에 맞춰 시나리오 1편을 집필하십시오.

──────────────────────────────────────────────────────────
[기획 설정 요구사항]
1. 룰 시스템: [${selectedRule === "연애" ? "연애" : selectedRule === "추리" ? "추리" : "괴담"}]
2. 서사 및 분위기 키워드: ${finalTags}
3. 주인공(도파미너):
   - 나이/성별: ${pcGenderAge || "미상"}
   - 직업/신분: ${pcJob || "자유"}
   - 성격/외모: ${pcPersonality || "시나리오 맞춤 성격"}
   - 비밀/약점: ${pcSecret || "극적 반전용 비밀"}
${modeSpecificInstructions}
${desiredCgAndRoutes ? `7. 희망하는 CG 씬 및 엔딩 분기 아이디어: ${desiredCgAndRoutes}` : ""}
${additionalIdea ? `8. 추가 줄거리 / 특별한 설정: ${additionalIdea}` : ""}

──────────────────────────────────────────────────────────
[🚨 필수 출력 서식 - 대괄호 헤더를 그대로 유지하며 작성하십시오]
${modeSpecificSchema}`;
  };

  const handleCopyAndOpenStudio = () => {
    const text = buildPromptText();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    if (triggerToast) {
      triggerToast("프롬프트 복사 완료!", "AI 스튜디오로 이동합니다. 붙여넣기(Ctrl+V)하세요!", "🚀");
    }
    window.open(DOPA_AI_STUDIO_URL, "_blank");
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleCopyOnly = () => {
    const text = buildPromptText();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    if (triggerToast) {
      triggerToast("클립보드 복사", "프롬프트가 복사되었습니다.", "📋");
    }
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 공통 텍스트에어리어 스타일 (시원시원한 크기로 확장)
  const textareaStyle = {
    width: "100%",
    minHeight: isMobile ? "44px" : "48px",
    maxHeight: "180px",
    padding: isMobile ? "10px 12px" : "12px 14px",
    borderRadius: "10px",
    backgroundColor: isDarkMode ? "#1f1b19" : "#f4f1ea",
    border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e2dcd2"}`,
    color: isDarkMode ? "#f5f5f4" : "#292524",
    fontSize: isMobile ? "0.85rem" : "0.93rem",
    lineHeight: "1.6",
    outline: "none",
    resize: "none",
    overflowY: "auto",
    boxSizing: "border-box",
    fontFamily: "inherit"
  };

  const labelStyle = {
    fontSize: isMobile ? "0.78rem" : "0.86rem",
    fontWeight: "700",
    color: isDarkMode ? "#b8b2aa" : "#6e665d",
    display: "flex",
    alignItems: "center",
    gap: "5px"
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        backgroundColor: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "8px" : "20px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        className="dopa-studio-scaleup"
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: isMobile ? "100%" : "760px", height: isMobile ? "94vh" : "88vh",
          backgroundColor: isDarkMode ? "#141211" : "#faf8f5",
          border: `1.5px solid ${isDarkMode ? "rgba(255, 255, 255, 0.12)" : "#e6e0d6"}`,
          borderRadius: "22px", display: "flex", flexDirection: "column",
          boxShadow: isDarkMode ? "0 25px 60px rgba(0,0,0,0.85)" : "0 20px 45px rgba(0,0,0,0.12)",
          overflow: "hidden", color: isDarkMode ? "#f5f5f4" : "#292524"
        }}
      >
        {/* 🌟 [PC 폰트 스케일업] 모달 내부의 작았던 칩, 제목, 인풋 글자를 일괄 확대 */}
        <style>{`
          /* 모든 인풋/텍스트에어리어 폰트 15px로 확대 */
          .dopa-studio-scaleup input, 
          .dopa-studio-scaleup textarea { 
            font-size: ${isMobile ? "0.85rem" : "0.93rem"} !important; 
          }
          /* 서사 칩 알약 크기 및 글자 넉넉하게 확대 */
          .dopa-studio-scaleup div[style*="flex-wrap"] button {
            padding: ${isMobile ? "5px 10px" : "7px 13px"} !important;
            font-size: ${isMobile ? "0.75rem" : "0.84rem"} !important;
            border-radius: 14px !important;
          }
          /* 1, 2, 3, 4 섹션 제목 큼직하게 (16px) */
          .dopa-studio-scaleup span[style*="800"] {
            font-size: ${isMobile ? "0.88rem" : "0.98rem"} !important;
          }
          /* 라벨 글자 가독성 개선 */
          .dopa-studio-scaleup span[style*="700"] {
            font-size: ${isMobile ? "0.78rem" : "0.86rem"} !important;
          }
        `}</style>
          
        {/* 상단 헤더 */}
        <div style={{
          padding: "14px 18px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e6e0d6"}`,
          backgroundColor: isDarkMode ? "#181513" : "#ffffff",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px",
              backgroundColor: isDarkMode ? "rgba(244, 63, 94, 0.15)" : "#fdf2f4",
              border: `1px solid ${theme?.accent || "#f43f5e"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: theme?.accent || "#f43f5e"
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontWeight: "800", fontSize: "1.05rem" }}>
                나만의 시나리오 만들기
              </div>
              <div style={{ fontSize: "0.72rem", color: isDarkMode ? "#a8a29e" : "#78716c", marginTop: "1px" }}>
                DOPA 엔진에 맞춰 지시문을 조립합니다.
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "#f0ece4", border: "none", color: "#a8a29e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 본문 폼 스크롤 */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: isMobile ? "14px" : "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* 1. 룰 선택 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: "800" }}>1. 시나리오 룰 선택</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {[
                { id: "괴담", name: "🕯️ 괴담", desc: "오컬트 · 1D10 침식" },
                { id: "추리", name: "🕵️ 추리", desc: "수사 · 완전범죄" },
                { id: "연애", name: "💖 연애", desc: "샌드박스 로맨스" }
              ].map(r => {
                const isSel = selectedRule === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRule(r.id)}
                    style={{
                      padding: "10px 4px", borderRadius: "10px",
                      border: `1.5px solid ${isSel ? (theme?.accent || "#f43f5e") : (isDarkMode ? "rgba(255,255,255,0.08)" : "#e2dcd2")}`,
                      backgroundColor: isSel ? (isDarkMode ? "rgba(244, 63, 94, 0.15)" : "#fdf2f4") : (isDarkMode ? "#1b1816" : "#ffffff"),
                      color: isSel ? (theme?.accent || "#f43f5e") : "inherit",
                      cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px"
                    }}
                  >
                    <span style={{ fontWeight: isSel ? "800" : "600", fontSize: "0.88rem" }}>{r.name}</span>
                    <span style={{ fontSize: "0.68rem", opacity: 0.8 }}>{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 키워드 태그 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: isDarkMode ? "#1a1716" : "#ffffff", padding: "14px", borderRadius: "14px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#e6e0d6"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "5px" }}>
                <Tag size={14} color={theme?.accent || "#f43f5e"} /> 2. 분위기 키워드 (칩 선택 / 직접 입력)
              </span>
              <span style={{ fontSize: "0.7rem", color: theme?.accent || "#f43f5e", fontWeight: "700" }}>
                {getMergedTags().length}개 선택
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {[...BACKGROUND_TAGS, ...RELATION_TAGS].map(t => {
                const isSel = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    style={{
                      padding: "4px 9px", borderRadius: "12px", fontSize: "0.72rem",
                      fontWeight: isSel ? "700" : "500",
                      backgroundColor: isSel ? (theme?.accent || "#f43f5e") : (isDarkMode ? "#221e1c" : "#f4f1ea"),
                      color: isSel ? "#ffffff" : "inherit",
                      border: `1px solid ${isSel ? (theme?.accent || "#f43f5e") : (isDarkMode ? "rgba(255,255,255,0.08)" : "#e2dcd2")}`,
                      cursor: "pointer"
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "2px" }}>
              <span style={labelStyle}><PenTool size={12} /> 추가 태그 직접 입력 (공백/쉼표 구분)</span>
              <input
                type="text"
                value={customTagInput}
                onChange={e => setCustomTagInput(e.target.value)}
                placeholder="예: #비오는폐교 #괴담동아리 #생존게임"
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: "8px",
                  border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "#e2dcd2"}`,
                  backgroundColor: isDarkMode ? "#1f1b19" : "#f4f1ea",
                  color: "inherit", fontSize: "0.8rem", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          {/* 3. 도파미너 설정 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", backgroundColor: isDarkMode ? "#1a1716" : "#ffffff", padding: "14px", borderRadius: "14px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#e6e0d6"}` }}>
            <span style={{ fontSize: "0.82rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "5px" }}>
              <UserRound size={14} color={theme?.accent || "#f43f5e"} /> 3. 도파미너(주인공) 설정
            </span>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={labelStyle}>나이 / 성별</span>
                <input 
                  type="text" 
                  value={pcGenderAge} 
                  onChange={e => setPcGenderAge(e.target.value)} 
                  placeholder="예: 24세 여성" 
                  style={{ ...textareaStyle, minHeight: "38px", height: "38px" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={labelStyle}>직업 / 신분</span>
                <input 
                  type="text" 
                  value={pcJob} 
                  onChange={e => setPcJob(e.target.value)} 
                  placeholder="예: 오컬트 방송 스트리머, 학생" 
                  style={{ ...textareaStyle, minHeight: "38px", height: "38px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={labelStyle}>성격 및 외모</span>
              <textarea 
                rows={1}
                value={pcPersonality} 
                onChange={e => handleAutoResize(e, setPcPersonality)} 
                placeholder="성격, 외모, 행동 특징을 자유롭게 작성하세요 (Enter로 줄바꿈 가능)" 
                style={textareaStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={labelStyle}>숨겨진 비밀 / 트라우마 (선택)</span>
              <textarea 
                rows={1}
                value={pcSecret} 
                onChange={e => handleAutoResize(e, setPcSecret)} 
                placeholder="도파미너의 과거 사연이나 약점 (선택)" 
                style={textareaStyle}
              />
            </div>
          </div>

          {/* 4. 룰별 맞춤형 인물 & 파트너 분기 (인원수 완벽 대응!) */}
          
          {/* 4-A. [괴담 모드]: 파트너(0~5명) vs 추가인물(0~15명) */}
          {selectedRule === "괴담" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: isDarkMode ? "#1a1716" : "#ffffff", padding: "14px", borderRadius: "14px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#e6e0d6"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Ghost size={14} color={theme?.accent || "#f43f5e"} /> 4. 괴담 인물 및 파트너 (분리 설정)
                </span>
                <span style={{ fontSize: "0.68rem", color: theme?.textMuted }}>파트너 0~5명 / 추가인물 0~15명</span>
              </div>

              {/* 1. 동행 파트너 */}
              <div style={{ padding: "10px", backgroundColor: isDarkMode ? "#1f1b19" : "#f4f1ea", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.76rem", fontWeight: "800", color: isDarkMode ? "#fb923c" : "#ea580c" }}>
                    동행 파트너 (0명 ~ 최대 5명)
                  </span>
                  <input
                    type="text"
                    value={ghostPartnerCount}
                    onChange={e => setGhostPartnerCount(e.target.value)}
                    placeholder="인원수 (예: 1명 / 0명이면 나홀로)"
                    style={{ width: "130px", padding: "3px 8px", borderRadius: "6px", backgroundColor: isDarkMode ? "#141211" : "#fff", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "#e2dcd2"}`, color: "inherit", fontSize: "0.72rem", textAlign: "center" }}
                  />
                </div>
                <textarea 
                  rows={2}
                  value={ghostPartnerDesc} 
                  onChange={e => handleAutoResize(e, setGhostPartnerDesc)} 
                  placeholder="파트너 이름, 직업, 성격, 숨겨진 비밀을 적으세요 (나홀로 조사면 '없음')" 
                  style={{ ...textareaStyle, backgroundColor: isDarkMode ? "#141211" : "#ffffff" }}
                />
              </div>

              {/* 2. 추가 등장인물 */}
              <div style={{ padding: "10px", backgroundColor: isDarkMode ? "#1f1b19" : "#f4f1ea", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.76rem", fontWeight: "800", color: isDarkMode ? "#94a3b8" : "#64748b" }}>
                    추가 등장인물 (0명 ~ 최대 15명)
                  </span>
                  <input
                    type="text"
                    value={ghostExtraNpcCount}
                    onChange={e => setGhostExtraNpcCount(e.target.value)}
                    placeholder="인원수 (예: 2명 / 없으면 0명)"
                    style={{ width: "130px", padding: "3px 8px", borderRadius: "6px", backgroundColor: isDarkMode ? "#141211" : "#fff", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "#e2dcd2"}`, color: "inherit", fontSize: "0.72rem", textAlign: "center" }}
                  />
                </div>
                <textarea 
                  rows={1}
                  value={ghostExtraNpcDesc} 
                  onChange={e => handleAutoResize(e, setGhostExtraNpcDesc)} 
                  placeholder="함께 말려든 생존자/목격자들의 특징 (없으면 '없음' 또는 비워두기)" 
                  style={{ ...textareaStyle, backgroundColor: isDarkMode ? "#141211" : "#ffffff" }}
                />
              </div>

              {/* 3. 괴이 / 원흉 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={labelStyle}>괴이 / 저주의 정체 (원흉)</span>
                <textarea 
                  rows={1}
                  value={ghostEntityIdea} 
                  onChange={e => handleAutoResize(e, setGhostEntityIdea)} 
                  placeholder="예: 4시 44분에 엘리베이터를 탄 사람을 데려가는 붉은 옷의 망령" 
                  style={textareaStyle}
                />
              </div>
            </div>
          )}

          {/* 4-B. [추리 모드]: 피해자 vs 용의자(1~15명) */}
          {selectedRule === "추리" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: isDarkMode ? "#1a1716" : "#ffffff", padding: "14px", borderRadius: "14px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#e6e0d6"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Search size={14} color={theme?.accent || "#f43f5e"} /> 4. 피해자 및 용의자 수사망
                </span>
                <span style={{ fontSize: "0.68rem", color: theme?.textMuted }}>용의자 최대 15명</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={labelStyle}>사건 목표 / 피해자 (또는 의뢰인)</span>
                <textarea 
                  rows={1}
                  value={mysteryVictim} 
                  onChange={e => handleAutoResize(e, setMysteryVictim)} 
                  placeholder="피해자 이름, 신분, 사망/피해 정황" 
                  style={textareaStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={labelStyle}>용의자 수사망 구성</span>
                  <input
                    type="text"
                    value={mysterySuspectCount}
                    onChange={e => setMysterySuspectCount(e.target.value)}
                    placeholder="인원 (예: 3~4명)"
                    style={{ width: "90px", padding: "3px 6px", borderRadius: "6px", backgroundColor: isDarkMode ? "#1f1b19" : "#f4f1ea", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "#e2dcd2"}`, color: "inherit", fontSize: "0.72rem", textAlign: "center" }}
                  />
                </div>
                <textarea 
                  rows={2}
                  value={mysterySuspects} 
                  onChange={e => handleAutoResize(e, setMysterySuspects)} 
                  placeholder="용의자들의 이름, 직업, 알리바이 특징 (최대 15명까지 자유 지정 가능)" 
                  style={textareaStyle}
                />
              </div>
            </div>
          )}

          {/* 4-C. [연애 모드]: 공략 대상(1~15명) */}
          {selectedRule === "연애" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: isDarkMode ? "#1a1716" : "#ffffff", padding: "14px", borderRadius: "14px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#e6e0d6"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Heart size={14} color={theme?.accent || "#f43f5e"} /> 4. 공략 대상(상대방)
                </span>
                <span style={{ fontSize: "0.68rem", color: theme?.textMuted }}>공략 대상 최대 15명</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span style={labelStyle}>공략 인원 (최대 15명)</span>
                  <input 
                    type="text" 
                    value={datingTargetCount} 
                    onChange={e => setDatingTargetCount(e.target.value)} 
                    placeholder="예: 1명 (단독) / 2명 (삼각관계)" 
                    style={{ ...textareaStyle, minHeight: "38px", height: "38px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span style={labelStyle}>신분 / 직업</span>
                  <input 
                    type="text" 
                    value={datingTargetJob} 
                    onChange={e => setDatingTargetJob(e.target.value)} 
                    placeholder="예: 직속 팀장, 황실 기사단장" 
                    style={{ ...textareaStyle, minHeight: "38px", height: "38px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={labelStyle}>외모 및 매력 포인트</span>
                <textarea 
                  rows={2}
                  value={datingTargetCharm} 
                  onChange={e => handleAutoResize(e, setDatingTargetCharm)} 
                  placeholder="외모 묘사, 성격, 츤데레/퇴폐미 등 원하는 분위기" 
                  style={textareaStyle}
                />
              </div>
            </div>
          )}

          {/* 5. 🌟 [신규 복구!] CG 갤러리 & 분기 루트 희망사항 (모든 모드 최대 15개/20개 지원!) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={labelStyle}>
              <ImageIcon size={13} color={theme?.accent || "#f43f5e"} /> 5. (선택) 이벤트 CG 씬 & 엔딩 분기 루트 희망사항
            </span>
            <textarea 
              rows={2} 
              value={desiredCgAndRoutes} 
              onChange={e => handleAutoResize(e, setDesiredCgAndRoutes)} 
              placeholder={
                selectedRule === "괴담"
                  ? "예: 파트너 구출 트루엔딩과 나홀로 탈출 새드엔딩"
                  : selectedRule === "추리"
                  ? "예: 루트는 진범 체포와 누명 은폐 분기"
                  : "예: 루트는 집착 엔딩과 쌍방 구원 엔딩"
              } 
              style={textareaStyle}
            />
          </div>

          {/* 6. 추가 아이디어 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={labelStyle}>6. (선택) 추가 줄거리 / 특별한 설정</span>
            <textarea 
              rows={2} 
              value={additionalIdea} 
              onChange={e => handleAutoResize(e, setAdditionalIdea)} 
              placeholder="꼭 들어갔으면 하는 전개나 장소, 첫 만남 상황 등 자유롭게 입력" 
              style={textareaStyle}
            />
          </div>

        </div>

        {/* 하단 버튼 */}
        <div style={{
          padding: "12px 18px",
          borderTop: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e6e0d6"}`,
          backgroundColor: isDarkMode ? "#181513" : "#ffffff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: "8px", flexShrink: 0
        }}>
          <button
            type="button"
            onClick={handleCopyOnly}
            style={{
              padding: "11px 14px", borderRadius: "10px",
              backgroundColor: isDarkMode ? "#221e1c" : "#f4f1ea",
              border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e2dcd2"}`,
              color: "inherit", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "5px"
            }}
          >
            <Copy size={14} /> 복사
          </button>

          <button
            type="button"
            onClick={handleCopyAndOpenStudio}
            style={{
              padding: "11px 20px", borderRadius: "10px", border: "none",
              backgroundColor: theme?.accent || "#f43f5e", color: "#ffffff",
              fontSize: "0.88rem", fontWeight: "800", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px",
              boxShadow: isDarkMode ? `0 4px 14px rgba(244, 63, 94, 0.35)` : `0 4px 14px rgba(190, 24, 93, 0.25)`
            }}
          >
            {isCopied ? <Check size={16} /> : <ExternalLink size={16} />}
            <span>{isCopied ? "복사 완료! 이동 중" : "🚀 AI 스튜디오 ↗"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
