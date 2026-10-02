// components/ScenarioStudioModal.js
"use client";

import React, { useState } from "react";
import { 
  X, Sparkles, Copy, Check, ExternalLink, 
  UserRound, Tag, Users, Ghost, Search, Heart, PenTool
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
  const [selectedRule, setSelectedRule] = useState("연애");

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

  const [selectedTags, setSelectedTags] = useState(["#쌍방구원"]);
  const [customTagInput, setCustomTagInput] = useState("");

  // 3. 도파미너(주인공)
  const [pcGenderAge, setPcGenderAge] = useState("");
  const [pcJob, setPcJob] = useState("");
  const [pcPersonality, setPcPersonality] = useState("");
  const [pcSecret, setPcSecret] = useState("");

  // 4. 룰별 인물 설정
  // [연애]
  const [datingTargetCount, setDatingTargetCount] = useState("1명");
  const [datingTargetJob, setDatingTargetJob] = useState("");
  const [datingTargetCharm, setDatingTargetCharm] = useState("");

  // [추리]
  const [mysteryVictim, setMysteryVictim] = useState("");
  const [mysterySuspects, setMysterySuspects] = useState("");

  // [괴담]
  const [ghostPartner, setGhostPartner] = useState("");
  const [ghostExtraNpc, setGhostExtraNpc] = useState("");
  const [ghostEntityIdea, setGhostEntityIdea] = useState("");

  // 5. 추가 아이디어
  const [additionalIdea, setAdditionalIdea] = useState("");

  const [isCopied, setIsCopied] = useState(false);

  // 텍스트에어리어 자동 높이 조절 헬퍼
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

  // 프롬프트 빌더
  const buildPromptText = () => {
    const finalTags = getMergedTags().join(" ") || "#자유 서사";
    let modeSpecificInstructions = "";
    let modeSpecificSchema = "";

    if (selectedRule === "연애") {
      modeSpecificInstructions = `
[💖 DOPA 연애 모드 집필 원칙]
1. 행동 자유도 100%: 억지 호감도 잠금 없이 도파미너의 돌발 행동(초면 고백, 스킨십 등)에 인물이 성격대로 반응.
2. 안티-예스맨: 인물별 역린, 감정 침식(서운->피로->체념->단절), 처절한 후회 서사.
3. 다각관계 지원: 양다리 알리바이 줄타기 복선, 3자 대면 서스펜스, 폴리아모리 선언 시 3대 반응 설계.
4. 영구 호흡권: AI 임의 시간 점프/암전 절대 금지, 슬로우 모션 공감각 서술 유지.
5. 공략 대상: [인원: ${datingTargetCount || "1명"}], [직업/신분: ${datingTargetJob || "자유"}], [특징: ${datingTargetCharm || "매력적인 성격"}] 반영.`;

      modeSpecificSchema = `
[시나리오 제목]
(작품 제목)

[공개 시놉시스]
(라운지와 서재용 소개글 3~4문장)

[초기 배경/서막]
(첫 대면 오프닝 지문 4~5문장)

[AI 디렉터 전용 비공개 진상 (진실)]
(상대방 속마음, 관계의 비밀, 결말 조건)

[주요 공략 대상 / 서사 목표]
(메인 공략 대상 이름)

[등장인물 목록]
- 인물1 이름: (이름)
  나이/성별: (예: 28세 남성)
  직업/신분: (직업)
  외모 및 성격: (외모 및 성격 특징)
  상태메시지: "(메신저 프로필 한 줄 문구)"
  취향: (좋아하는 것) 좋아함 / (싫어하는 것) 싫어함
  남모르는 비밀: (결핍, 약점, 숨겨진 사연)

[이벤트 CG 갤러리]
- CG1 제목: (CG 명칭)
  해금 조건: (해금 조건)
  상황 및 대사: (대사 및 상황 묘사)

[공략 분기점 및 루트]
- 분기1: (선택지 설명) / 대상: (인물명) / 조건: (+10 호감도)
- 분기2: (선택지 설명) / 대상: (인물명) / 조건: (-15 호감도 또는 결별)

[소지품 및 선물]
- (가방에 지니고 시작할 선물/소지품 목록)`;

    } else if (selectedRule === "추리") {
      modeSpecificInstructions = `
[🕵️️ DOPA 추리 모드 집필 원칙]
1. 페어 플레이: 진범, 트릭, 스모킹 건 불변 유지.
2. 동조 차단: 엉뚱한 반증 시 용의자가 반박하며 신뢰도(HP) 데미지 부여.
3. 거짓말 복선: 용의자 진술 중 최소 1개는 미세 신체 반응(Tells)과 모순 포함.
4. 완전범죄 분기: 도파미너('${pcJob || "주인공"}')가 진범일 때 위장 공작이 가능하도록 알리바이 공백 설계.
5. 인물 구성: [피해자: ${mysteryVictim || "핵심 피해자"}], [용의자: ${mysterySuspects || "용의자 구성"}] 반영.`;

      modeSpecificSchema = `
[시나리오 제목]
(사건명)

[공개 시놉시스]
(사건 개요 3~4문장)

[초기 배경/서막]
(현장 도착 오프닝 지문 4~5문장)

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
  인물 특징 및 사건 행적: (행적 및 성격)
  상태메시지: "(메신저 프로필 문구)"
  숨겨진 비밀: (알리바이 모순 또는 사생활)

[사건 단서 및 물증 (Handouts)]
- 단서1 명칭: (물증 이름)
  발견 위치 및 겉모습: (상세 묘사)
  감식 진상 / 모순: (스모킹 건 및 반증 포인트)`;

    } else {
      modeSpecificInstructions = `
[🕯️ DOPA 괴담 모드 집필 원칙]
1. 1D10 행동 굴림: 6대 스탯 기반 판정 체계 준수.
2. 3중 감각 침식: 침식도 상승 및 30/60/90% 이상 충동 발현 지문 작성.
3. 결착 의식 3단계: 파훼 의식(진상 직면 ➔ 합동 저지 ➔ 최후 돌파) 설계.
4. 무공해 서사: 소설 지문에 주사위나 시스템 메타 텍스트 배제.
5. 파트너/인물 분리:
   - [동행 파트너]: 생사를 함께할 핵심 동료 1명 [${ghostPartner || "파트너 설정"}].
   - [추가 인물]: 함께 갇힌 생존자나 목격자 [${ghostExtraNpc || "없음 또는 소수"}].
   - [괴이/원흉]: [${ghostEntityIdea || "괴이의 실체"}].`;

      modeSpecificSchema = `
[시나리오 제목]
(괴담 제목)

[공개 시놉시스]
(괴담 소문 및 고립 공간 개요 3~4문장)

[초기 배경/서막]
(진입 서막 오프닝 지문 4~5문장)

[AI 디렉터 전용 비공개 진상 (진실)]
(괴이의 원흉, 저주의 규칙, 결착 의식 3단계 조건)

[원흉 / 괴이의 진짜 정체]
${ghostEntityIdea || "(괴이의 실체)"}

[사건 목표 / 봉인 대상]
(생환 목표 또는 탈출/봉인 조건)

[동행 파트너 (메인 파트너)]
- 파트너 이름: (이름)
  나이/성별: (나이/성별)
  직업/신분: (직업)
  외모 및 성격: (외모 및 관계성)
  숨겨진 이면 / 진심: (비밀이나 트라우마)

[추가 등장인물 (선택 사항)]
- 인물1 이름: (이름)
  특징 및 행적: (생존자/목격자)
  숨겨진 비밀: (비밀)

[도파미너 이상 충동 발현 지문]
- 이상충동30: (침식도 30% 발현 증상)
- 이상충동60: (침식도 60% 발현 증상)
- 이상충동90: (침식도 90% 발현 증상)

[시작 소지품 세팅]
- 멘탈 회복 아이템: (명칭)
- 특수 기믹 패스 아이템: (명칭)
- 재굴림 아이템: (명칭)`;
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
${additionalIdea ? `6. 추가 아이디어: ${additionalIdea}` : ""}

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

  // 공통 시원한 텍스트에어리어 스타일
  const textareaStyle = {
    width: "100%",
    minHeight: "44px",
    maxHeight: "160px",
    padding: "10px 12px",
    borderRadius: "10px",
    backgroundColor: isDarkMode ? "#1f1b19" : "#f4f1ea",
    border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e2dcd2"}`,
    color: isDarkMode ? "#f5f5f4" : "#292524",
    fontSize: "0.85rem",
    lineHeight: "1.5",
    outline: "none",
    resize: "none",
    overflowY: "auto",
    boxSizing: "border-box",
    fontFamily: "inherit"
  };

  const labelStyle = {
    fontSize: "0.76rem",
    fontWeight: "700",
    color: isDarkMode ? "#a8a29e" : "#78716c",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        backgroundColor: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "8px" : "16px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "660px", height: isMobile ? "94vh" : "90vh",
          backgroundColor: isDarkMode ? "#141211" : "#faf8f5",
          border: `1.5px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e6e0d6"}`,
          borderRadius: "20px", display: "flex", flexDirection: "column",
          boxShadow: isDarkMode ? "0 25px 60px rgba(0,0,0,0.8)" : "0 20px 40px rgba(0,0,0,0.12)",
          overflow: "hidden", color: isDarkMode ? "#f5f5f4" : "#292524"
        }}
      >
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
                설정을 조합하여 AI 스튜디오용 프롬프트를 생성합니다.
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
            <span style={{ fontSize: "0.82rem", fontWeight: "800" }}>1. 룰 선택</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {[
                { id: "연애", name: "💖 연애", desc: "샌드박스 로맨스" },
                { id: "추리", name: "🕵️ 추리", desc: "수사 · 완전범죄" },
                { id: "괴담", name: "🕯️ 괴담", desc: "오컬트 서스펜스" }
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
              {[...RELATION_TAGS, ...BACKGROUND_TAGS].map(t => {
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
                placeholder="예: #가상역사 #재벌가 #디자이너"
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
              <UserRound size={14} color={theme?.accent || "#f43f5e"} /> 3. 도파미너(주인공)
            </span>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={labelStyle}>나이 / 성별</span>
                <input 
                  type="text" 
                  value={pcGenderAge} 
                  onChange={e => setPcGenderAge(e.target.value)} 
                  placeholder="예: 20대 여성" 
                  style={{ ...textareaStyle, minHeight: "40px", height: "40px" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={labelStyle}>직업 / 신분</span>
                <input 
                  type="text" 
                  value={pcJob} 
                  onChange={e => setPcJob(e.target.value)} 
                  placeholder="예: 형사, 프리랜서" 
                  style={{ ...textareaStyle, minHeight: "40px", height: "40px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={labelStyle}>성격 및 외모</span>
              <textarea 
                rows={1}
                value={pcPersonality} 
                onChange={e => handleAutoResize(e, setPcPersonality)} 
                placeholder="성격, 외모, 행동 특징을 자유롭게 작성하세요" 
                style={textareaStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={labelStyle}>숨겨진 비밀 / 약점 (선택)</span>
              <textarea 
                rows={1}
                value={pcSecret} 
                onChange={e => handleAutoResize(e, setPcSecret)} 
                placeholder="도파미너의 비밀이나 과거 사연 (선택)" 
                style={textareaStyle}
              />
            </div>
          </div>

          {/* 4. 룰별 인물 설정 */}
          
          {/* 4-A. [괴담 모드] */}
          {selectedRule === "괴담" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: isDarkMode ? "#1a1716" : "#ffffff", padding: "14px", borderRadius: "14px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#e6e0d6"}` }}>
              <span style={{ fontSize: "0.82rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "5px" }}>
                <Ghost size={14} color={theme?.accent || "#f43f5e"} /> 4. 괴담 인물 및 파트너
              </span>

              {/* 동행 파트너 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={labelStyle}>동행 파트너 (1명)</span>
                <textarea 
                  rows={2}
                  value={ghostPartner} 
                  onChange={e => handleAutoResize(e, setGhostPartner)} 
                  placeholder="파트너의 이름, 성격, 외모, 숨겨진 비밀을 적으세요 (없으면 비워두기)" 
                  style={textareaStyle}
                />
              </div>

              {/* 추가 인물 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={labelStyle}>추가 등장인물 (생존자 / 목격자)</span>
                <textarea 
                  rows={1}
                  value={ghostExtraNpc} 
                  onChange={e => handleAutoResize(e, setGhostExtraNpc)} 
                  placeholder="함께 갇힌 사람들의 직업이나 특징 (선택)" 
                  style={textareaStyle}
                />
              </div>

              {/* 괴이 / 원흉 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={labelStyle}>괴이 / 저주의 정체 (원흉)</span>
                <textarea 
                  rows={1}
                  value={ghostEntityIdea} 
                  onChange={e => handleAutoResize(e, setGhostEntityIdea)} 
                  placeholder="공포의 원인이나 괴담의 정체 (선택)" 
                  style={textareaStyle}
                />
              </div>
            </div>
          )}

          {/* 4-B. [추리 모드] */}
          {selectedRule === "추리" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: isDarkMode ? "#1a1716" : "#ffffff", padding: "14px", borderRadius: "14px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#e6e0d6"}` }}>
              <span style={{ fontSize: "0.82rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "5px" }}>
                <Search size={14} color={theme?.accent || "#f43f5e"} /> 4. 피해자 및 용의자
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={labelStyle}>피해자 / 의뢰인</span>
                <textarea 
                  rows={1}
                  value={mysteryVictim} 
                  onChange={e => handleAutoResize(e, setMysteryVictim)} 
                  placeholder="피해자 이름, 신분, 사망/피해 정황" 
                  style={textareaStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={labelStyle}>용의자 수사망</span>
                <textarea 
                  rows={2}
                  value={mysterySuspects} 
                  onChange={e => handleAutoResize(e, setMysterySuspects)} 
                  placeholder="용의자들의 이름, 직업, 알리바이 특징 (예: 3명 - 비서, 의사, 조카)" 
                  style={textareaStyle}
                />
              </div>
            </div>
          )}

          {/* 4-C. [연애 모드] */}
          {selectedRule === "연애" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: isDarkMode ? "#1a1716" : "#ffffff", padding: "14px", borderRadius: "14px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#e6e0d6"}` }}>
              <span style={{ fontSize: "0.82rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "5px" }}>
                <Heart size={14} color={theme?.accent || "#f43f5e"} /> 4. 공략 대상(상대방)
              </span>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span style={labelStyle}>공략 인원</span>
                  <input 
                    type="text" 
                    value={datingTargetCount} 
                    onChange={e => setDatingTargetCount(e.target.value)} 
                    placeholder="예: 1명 (단독) / 2명 (삼각관계)" 
                    style={{ ...textareaStyle, minHeight: "40px", height: "40px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span style={labelStyle}>신분 / 직업</span>
                  <input 
                    type="text" 
                    value={datingTargetJob} 
                    onChange={e => setDatingTargetJob(e.target.value)} 
                    placeholder="예: 직속 팀장, 황실 기사단장" 
                    style={{ ...textareaStyle, minHeight: "40px", height: "40px" }}
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

          {/* 5. 추가 아이디어 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={labelStyle}>5. 추가 줄거리 / 특별한 설정 (선택)</span>
            <textarea 
              rows={2} 
              value={additionalIdea} 
              onChange={e => handleAutoResize(e, setAdditionalIdea)} 
              placeholder="꼭 들어갔으면 하는 전개나 장소, 첫 만남 상황 등" 
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
