// components/ScenarioStudioModal.js
"use client";

import React, { useState } from "react";
import { 
  X, Sparkles, Copy, Check, ExternalLink, 
  UserRound, Tag, Users, PenTool, Skull, Ghost, Heart, Search
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

  // 1. 룰 선택 (연애 / 추리 / 괴담)
  const [selectedRule, setSelectedRule] = useState("연애");

  // 2. 40대 서사 & 기믹 프리셋 태그
  const RELATION_TAGS = [
    "#쌍방구원", "#혐관", "#애증", "#신분차", "#비밀계약", 
    "#착각계", "#짝사랑", "#달달일상", "#후회/피폐", "#배틀로맨스", 
    "#운명적유대", "#스폰서", "#사제지간", "#소꿉친구", "#다각관계",
    "#계약결혼", "#순정헌신", "#오해와갈등", "#집착/통제", "#재회물"
  ];

  const BACKGROUND_TAGS = [
    "#오컬트", "#폐쇄병동", "#고립된저택", "#도시괴담", "#코스믹호러", 
    "#밀실살인", "#시간루프", "#기억상실", "#시한부", "#가면무도회", 
    "#아포칼립스", "#동양풍/사극", "#사이버펑크", "#황실/로판", "#학원물",
    "#오피스/사내", "#가상현실", "#초능력/이능", "#잠입수사", "#재벌가/상류층"
  ];

  const [selectedTags, setSelectedTags] = useState(["#쌍방구원"]);
  const [customTagInput, setCustomTagInput] = useState("");

  // 3. 도파미너(주인공) 정보
  const [pcGenderAge, setPcGenderAge] = useState("");
  const [pcJob, setPcJob] = useState("");
  const [pcPersonality, setPcPersonality] = useState("");
  const [pcSecret, setPcSecret] = useState("");

  // 4. [연애 모드 전용] 상대방 정보
  const [datingTargetCount, setDatingTargetCount] = useState("1명 (단독 상대)");
  const [datingTargetJob, setDatingTargetJob] = useState("");
  const [datingTargetCharm, setDatingTargetCharm] = useState("");

  // 4. [추리 모드 전용] 피해자 및 용의자 정보
  const [mysteryVictim, setMysteryVictim] = useState("");
  const [mysterySuspectCount, setMysterySuspectCount] = useState("3~4명");
  const [mysterySuspects, setMysterySuspects] = useState("");

  // 4. [괴담 모드 전용] 파트너 vs 추가 등장인물 분리 정보 🌟
  const [ghostPartnerRole, setGhostPartnerRole] = useState("");
  const [ghostPartnerPersonality, setGhostPartnerPersonality] = useState("");
  const [ghostExtraNpc, setGhostExtraNpc] = useState("");
  const [ghostEntityIdea, setGhostEntityIdea] = useState("");

  // 5. 공통 한 줄 추가 아이디어
  const [additionalIdea, setAdditionalIdea] = useState("");

  const [isCopied, setIsCopied] = useState(false);

  // 칩 토글 핸들러
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 직접 입력 태그 반영 합산
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

    // 💖 A. 연애 모드
    if (selectedRule === "연애") {
      modeSpecificInstructions = `
[💖 DOPA 연애 모드 집필 원칙]
1. 행동 자유도 100%: 억지 호감도 잠금 없이 도파미너의 돌발 행동(초면 고백, 스킨십, 도발 등)에 인물이 성격대로 즉각 반응해야 합니다.
2. 안티-예스맨: 맹목적 동조 금지. 인물별 자존심/역린 및 감정 침식(서운->피로->체념->단절)과 처절한 후회 서사를 포함하십시오.
3. 다각관계 지원: 양다리 알리바이 줄타기 복선, 3자 대면 서스펜스, 폴리아모리 선언 시 3대 반응을 설계하십시오.
4. 영구 호흡권: "뜨거운 밤을 보냈다", "다음 날 아침" 식의 AI 자의적 시간 스킵 및 암전을 절대 금지하고 공감각 슬로우 모션 서술을 유지하십시오.
5. 등장인물 지침: 공략 대상 구성 [${datingTargetCount || "1명"}], 직업/신분 [${datingTargetJob || "자유"}], 매력 및 성향 [${datingTargetCharm || "매력적인 성격"}]을 반영하십시오.`;

      modeSpecificSchema = `
[시나리오 제목]
(감각적인 로맨스 작품 제목)

[공개 시놉시스]
(도파미너들이 서재와 라운지에서 읽게 될 매혹적인 소개글 3~4문장)

[초기 배경/서막]
(도파미너가 게임을 시작하자마자 마주할 첫 대면 상황 4~5문장)

[AI 디렉터 전용 비공개 진상 (진실)]
(상대방이 숨기고 있는 진짜 속마음, 관계의 숨겨진 비밀, 최종 해피/새드 엔딩 조건)

[주요 공략 대상 / 서사 목표]
(메인 공략 대상 이름)

[등장인물 목록]
- 인물1 이름: (이름)
  나이/성별: (예: 28세 남성)
  직업/신분: (직업)
  외모 및 성격: (외모 묘사 및 행동 특징)
  상태메시지: "(메신저에 걸어둘 짧은 한 줄 문구)"
  취향: (좋아하는 선물·음료 등) 좋아함 / (싫어하는 행동·물건 등) 싫어함
  남모르는 비밀: (인물의 결핍, 약점, 숨겨진 사연)

(필요 시 인물2, 인물3 추가)

[이벤트 CG 갤러리]
- CG1 제목: (CG 명칭)
  해금 조건: (예: 옥상에서 단둘이 대화 성공 시)
  상황 및 대사: (결정적 대사와 비주얼 상황 묘사)

[공략 분기점 및 루트]
- 분기1: (선택지 설명) / 대상: (인물명) / 조건: (+10 호감도)
- 분기2: (선택지 설명) / 대상: (인물명) / 조건: (-15 호감도 또는 결별)

[소지품 및 선물]
- (도파미너가 가방에 지니고 시작할 수 있는 선물/소지품 1~2개)`;

    // 🕵️ B. 추리 모드
    } else if (selectedRule === "추리") {
      modeSpecificInstructions = `
[🕵️ DOPA 추리 모드 집필 원칙]
1. 페어 플레이: 진범, 트릭, 스모킹 건을 도중에 바꾸지 마십시오.
2. 동조 차단: 엉뚱한 반증이나 억지 추궁 시 용의자가 비웃으며 신뢰도(HP) 데미지를 입히게 하십시오.
3. 거짓말 복선: 용의자의 진술 중 최소 1개는 미세 신체 반응(Tells)과 함께 모순을 품게 하십시오.
4. 완전범죄 분기: 만약 도파미너('${pcJob || "주인공"}')가 진범인 경우, 타인에게 누명을 씌우는 [위장 공작]이 가능하도록 희생양의 알리바이 공백을 치밀하게 설계하십시오.
5. 인물 구성: 사건 피해자/의뢰인 [${mysteryVictim || "사건의 핵심 피해자"}], 용의자 수 [${mysterySuspectCount}], 용의자 특징 [${mysterySuspects || "개성 있는 알리바이 보유자들"}]을 반영하십시오.`;

      modeSpecificSchema = `
[시나리오 제목]
(긴장감 넘치는 사건명)

[공개 시놉시스]
(사건 현장과 발생 개요 3~4문장)

[초기 배경/서막]
(폭풍전야, 사건 현장에 도착한 첫 오프닝 지문 4~5문장)

[AI 디렉터 전용 비공개 진상 (진실)]
(사건의 배후 내막, 살해 동기, 완전범죄 트릭의 파훼법)

[진범 / 흑막 이름]
(진범 이름)

[사용된 트릭]
(밀실, 시차 조작, 흉기 은닉 등 핵심 트릭 수법)

[사건 목표 / 피해자]
${mysteryVictim || "(피해자 또는 의뢰인 이름)"}

[용의자 수사망]
- 인물1 이름: (이름)
  나이/성별: (나이/성별)
  직업/역할: (직업)
  인물 특징 및 사건 행적: (성격, 피해자와의 관계, 사건 당일 주장하는 행적)
  상태메시지: "(휴대폰 메신저 프로필 문구)"
  숨겨진 비밀: (알리바이의 허점 또는 숨기고 있는 사생활)

(필요 시 용의자2, 용의자3 추가)

[사건 단서 및 물증 (Handouts)]
- 단서1 명칭: (물증 이름)
  발견 위치 및 겉모습: (상세 묘사)
  감식 진상 / 모순: (결정적 스모킹 건이 되는 내막 또는 반증 포인트)`;

    // 🕯️ C. 괴담 모드 (파트너 vs 추가 인물 완벽 분리 반영!)
    } else {
      modeSpecificInstructions = `
[🕯️ DOPA 괴담 모드 집필 원칙]
1. 1D10 행동 굴림: 체력, 순발, 관찰, 추론, 정신, 사교 6대 스탯 기반 판정 체계.
2. 3중 감각 침식: 공포나 충격 시 침식도(0~100%) 상승 및 30/60/90% 이상 충동 발현.
3. 결착 의식 3단계: 마지막 파훼 의식(진상 직면 ➔ 합동 저지 ➔ 최후 돌파)을 집행할 수 있는 규칙과 기믹을 설계하십시오.
4. 무공해 서사: 소설 지문 본문에 주사위나 룰 메타 텍스트를 일절 오염시키지 마십시오.
5. 🚨 [중요: 파트너와 등장인물 엄격 분리]:
   - [동행 파트너]: 도파미너와 생사를 함께하는 단 1명의 핵심 파트너! 역할/관계 [${ghostPartnerRole || "동료"}], 성격/외모 [${ghostPartnerPersonality || "매력적인 파트너"}]를 반영하여 반드시 작성하십시오.
   - [추가 등장인물]: 현장에 함께 말려든 생존자나 목격자 [${ghostExtraNpc || "없음 또는 1~2명"}]는 파트너와 완전히 구분된 별도 항목으로 작성하십시오.
   - [원흉/괴이]: ${ghostEntityIdea || "공포의 근원인 괴담 속 존재"}`;

      modeSpecificSchema = `
[시나리오 제목]
(섬뜩하고 기이한 괴담 제목)

[공개 시놉시스]
(금기, 괴담 소문, 고립된 공간에 대한 개요 3~4문장)

[초기 배경/서막]
(이세계나 폐쇄 공간에 발을 들이는 서막 오프닝 지문 4~5문장)

[AI 디렉터 전용 비공개 진상 (진실)]
(괴이의 원흉과 정체, 저주의 규칙, 파훼 의식의 3단계 조건)

[원흉 / 괴이의 진짜 정체]
${ghostEntityIdea || "(괴이의 실체 및 원흉)"}

[사건 목표 / 봉인 대상]
(생환 목표 또는 탈출/의식 조건)

[동행 파트너 (메인 파트너)]
- 파트너 이름: (이름)
  나이/성별: (나이/성별)
  직업/신분: (직업)
  외모 및 성격: (외모 및 도파미너와의 관계성)
  숨겨진 이면 / 진심: (파트너가 숨기고 있는 충격적인 비밀이나 트라우마)

[추가 등장인물 (선택 사항)]
- 인물1 이름: (이름)
  특징 및 행적: (현장에 함께 갇힌 생존자나 목격자)
  숨겨진 비밀: (비밀)

[도파미너 이상 충동 발현 지문]
- 이상충동30: (침식도 30% 도달 시 발현될 기이한 신체/감각 증상)
- 이상충동60: (침식도 60% 도달 시 발현될 착란/환각 증상)
- 이상충동90: (침식도 90% 도달 시 자제력을 잃고 폭주하는 충동 증상)

[시작 소지품 세팅]
- 멘탈 회복 아이템: (명칭)
- 특수 기믹 패스 아이템: (명칭)
- 재굴림 아이템: (명칭)`;
    }

    return `[DOPA 공식 시나리오 생성 요청서]
당신은 AI 텍스트 RPG 플랫폼 'DOPA'의 전속 시나리오 작가입니다.
아래 기획 요구사항을 바탕으로, DOPA 파서 엔진이 100% 인식할 수 있는 공식 마크다운 서식에 맞춰 시나리오 1편을 집필하십시오.

──────────────────────────────────────────────────────────
[기획 설정 요구사항]
1. 룰 시스템: [${selectedRule === "연애" ? "연애 (오픈 샌드박스 로맨스)" : selectedRule === "추리" ? "추리 (본격 수사 & 피카레스크)" : "괴담 (서스펜스 오컬트)"}]
2. 서사 및 관계성 키워드: ${finalTags}
3. 주인공(도파미너) 설정:
   - 나이/성별: ${pcGenderAge || "미상"}
   - 직업/신분: ${pcJob || "자유 설정"}
   - 성격 및 특징: ${pcPersonality || "시나리오에 가장 어울리는 성격"}
   - 숨겨진 비밀/이면: ${pcSecret || "극적 반전을 위한 비밀 설정 부여"}
${modeSpecificInstructions}
${additionalIdea ? `6. 추가 스토리 아이디어 / 로그라인: ${additionalIdea}` : ""}

──────────────────────────────────────────────────────────
[🚨 필수 출력 서식 - 아래 양식을 글자 하나 바꾸지 말고 그대로 유지하며 작성하십시오]
${modeSpecificSchema}`;
  };

  // 🚀 프롬프트 복사 & AI 스튜디오 열기
  const handleCopyAndOpenStudio = () => {
    const text = buildPromptText();
    navigator.clipboard.writeText(text);
    setIsCopied(true);

    if (triggerToast) {
      triggerToast("프롬프트 복사 완료!", "DOPA AI 스튜디오로 이동합니다. 붙여넣기(Ctrl+V)하세요!", "🚀");
    }

    window.open(DOPA_AI_STUDIO_URL, "_blank");
    setTimeout(() => setIsCopied(false), 2500);
  };

  // 📋 프롬프트만 단순 복사
  const handleCopyOnly = () => {
    const text = buildPromptText();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    if (triggerToast) {
      triggerToast("클립보드 복사", "프롬프트가 복사되었습니다.", "📋");
    }
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 🎨 눈이 편안한 라이트/다크 밸런스 컬러
  const colors = {
    bg: isDarkMode ? "#141211" : "#faf8f5",
    headerBg: isDarkMode ? "rgba(24, 20, 18, 0.7)" : "#ffffff",
    cardBg: isDarkMode ? "#1b1816" : "#ffffff",
    inputBg: isDarkMode ? "#221e1c" : "#f4f1ea",
    border: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e6e0d6",
    borderActive: theme?.accent || (isDarkMode ? "#f43f5e" : "#be185d"),
    text: isDarkMode ? "#f5f5f4" : "#292524",
    textMuted: isDarkMode ? "#a8a29e" : "#78716c",
    accent: theme?.accent || (isDarkMode ? "#f43f5e" : "#be185d"),
    accentLight: isDarkMode ? "rgba(244, 63, 94, 0.15)" : "#fdf2f4"
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        backgroundColor: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "10px" : "20px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "680px", maxHeight: "90vh",
          backgroundColor: colors.bg,
          border: `1.5px solid ${colors.border}`,
          borderRadius: "22px", display: "flex", flexDirection: "column",
          boxShadow: isDarkMode ? "0 25px 60px rgba(0,0,0,0.8)" : "0 20px 40px rgba(0,0,0,0.12)",
          overflow: "hidden", color: colors.text
        }}
      >
        {/* 1. 상단 헤더 */}
        <div style={{
          padding: isMobile ? "14px 18px" : "18px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.headerBg,
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              backgroundColor: colors.accentLight, border: `1px solid ${colors.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center", color: colors.accent
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontWeight: "800", fontSize: isMobile ? "1rem" : "1.15rem", color: colors.text }}>
                나만의 시나리오 만들기 (프롬프트 스튜디오)
              </div>
              <div style={{ fontSize: "0.75rem", color: colors.textMuted, marginTop: "2px", fontWeight: "500" }}>
                설정을 조합하여 DOPA AI 스튜디오로 전달할 기획 지시문을 생성합니다.
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "#f0ece4", border: "none", color: colors.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. 본문 폼 스크롤 */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: isMobile ? "16px" : "22px", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* 1단계: 룰 선택 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "0.84rem", fontWeight: "700", color: colors.text }}>
              1. 시나리오 룰 시스템 선택
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {[
                { id: "연애", name: "💖 연애", desc: "오픈 샌드박스 로맨스" },
                { id: "추리", name: "🕵️ 추리", desc: "수사 및 완전범죄" },
                { id: "괴담", name: "🕯️ 괴담", desc: "오컬트 서스펜스" }
              ].map(r => {
                const isSel = selectedRule === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRule(r.id)}
                    style={{
                      padding: "12px 6px", borderRadius: "12px",
                      border: `1.5px solid ${isSel ? colors.borderActive : colors.border}`,
                      backgroundColor: isSel ? colors.accentLight : colors.cardBg,
                      color: isSel ? colors.accent : colors.text,
                      cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <span style={{ fontWeight: isSel ? "700" : "600", fontSize: "0.9rem" }}>{r.name}</span>
                    <span style={{ fontSize: "0.68rem", color: isSel ? colors.accent : colors.textMuted, fontWeight: "500" }}>{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2단계: 키워드 칩 + 직접 입력 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", backgroundColor: colors.cardBg, padding: "16px", borderRadius: "16px", border: `1px solid ${colors.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.84rem", fontWeight: "700", color: colors.text, display: "flex", alignItems: "center", gap: "6px" }}>
                <Tag size={15} color={colors.accent} /> 2. 서사 & 분위기 키워드 (칩 선택 및 직접 입력)
              </span>
              <span style={{ fontSize: "0.72rem", color: colors.accent, fontWeight: "600" }}>
                {getMergedTags().length}개 적용됨
              </span>
            </div>

            <div>
              <div style={{ fontSize: "0.72rem", color: colors.textMuted, marginBottom: "6px", fontWeight: "600" }}>[관계성 & 감정선]</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {RELATION_TAGS.map(t => {
                  const isSel = selectedTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      style={{
                        padding: "5px 10px", borderRadius: "14px", fontSize: "0.74rem",
                        fontWeight: isSel ? "700" : "500",
                        backgroundColor: isSel ? colors.accent : colors.inputBg,
                        color: isSel ? "#ffffff" : colors.text,
                        border: `1px solid ${isSel ? colors.accent : colors.border}`,
                        cursor: "pointer", transition: "all 0.12s ease"
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.72rem", color: colors.textMuted, marginBottom: "6px", fontWeight: "600" }}>[배경 & 사건 기믹]</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {BACKGROUND_TAGS.map(t => {
                  const isSel = selectedTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      style={{
                        padding: "5px 10px", borderRadius: "14px", fontSize: "0.74rem",
                        fontWeight: isSel ? "700" : "500",
                        backgroundColor: isSel ? colors.accent : colors.inputBg,
                        color: isSel ? "#ffffff" : colors.text,
                        border: `1px solid ${isSel ? colors.accent : colors.border}`,
                        cursor: "pointer", transition: "all 0.12s ease"
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: `1px dashed ${colors.border}`, paddingTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.72rem", color: colors.textMuted, fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                <PenTool size={12} /> 추가 키워드 직접 입력 (공백 또는 쉼표로 구분)
              </label>
              <input
                type="text"
                value={customTagInput}
                onChange={e => setCustomTagInput(e.target.value)}
                placeholder="예: #가상역사 #재벌가 #디자이너 #비밀연애"
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: "8px",
                  border: `1px solid ${colors.border}`, backgroundColor: colors.inputBg,
                  color: colors.text, fontSize: "0.82rem", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          {/* 3단계: 도파미너(주인공) 정보 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "0.84rem", fontWeight: "700", color: colors.text, display: "flex", alignItems: "center", gap: "6px" }}>
              <UserRound size={15} color={colors.accent} /> 3. 도파미너(주인공) 설정
            </span>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px" }}>
              <input 
                type="text" 
                value={pcGenderAge} 
                onChange={e => setPcGenderAge(e.target.value)} 
                placeholder="나이/성별 (예: 20대 여성)" 
                style={{ padding: "9px 12px", borderRadius: "8px", backgroundColor: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.82rem", outline: "none" }}
              />
              <input 
                type="text" 
                value={pcJob} 
                onChange={e => setPcJob(e.target.value)} 
                placeholder="직업/신분 (예: 신임 형사, 프리랜서 디자이너)" 
                style={{ padding: "9px 12px", borderRadius: "8px", backgroundColor: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.82rem", outline: "none" }}
              />
            </div>
            <input 
              type="text" 
              value={pcPersonality} 
              onChange={e => setPcPersonality(e.target.value)} 
              placeholder="성격/특징 (예: 냉정하지만 속정이 깊음, 능글맞은 장난꾸러기)" 
              style={{ padding: "9px 12px", borderRadius: "8px", backgroundColor: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.82rem", outline: "none" }}
            />
            <input 
              type="text" 
              value={pcSecret} 
              onChange={e => setPcSecret(e.target.value)} 
              placeholder="(선택) 숨겨진 비밀 (예: 과거 피해자와 모종의 계약이 있었다)" 
              style={{ padding: "9px 12px", borderRadius: "8px", backgroundColor: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.82rem", outline: "none" }}
            />
          </div>

          {/* 🌟 4단계: 룰별 맞춤형 인물/파트너 분기 영역 🌟 */}
          
          {/* 4-A. [괴담 모드]: 파트너 vs 추가 등장인물 완벽 분리 */}
          {selectedRule === "괴담" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: colors.cardBg, padding: "16px", borderRadius: "16px", border: `1px solid ${colors.border}` }}>
              <span style={{ fontSize: "0.84rem", fontWeight: "700", color: colors.text, display: "flex", alignItems: "center", gap: "6px" }}>
                <Ghost size={16} color={colors.accent} /> 4. 괴담 인물 및 파트너 설정 (분리 입력)
              </span>

              {/* 1. 동행 파트너 */}
              <div style={{ padding: "12px", backgroundColor: colors.inputBg, borderRadius: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: colors.accent, display: "flex", alignItems: "center", gap: "4px" }}>
                    <UserRound size={14} /> 동행 파트너 (생사를 함께할 핵심 파트너 1명)
                  </span>
                  <span style={{ fontSize: "0.68rem", color: colors.accent, fontWeight: "600" }}>필수</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px" }}>
                  <input
                    type="text"
                    value={ghostPartnerRole}
                    onChange={e => setGhostPartnerRole(e.target.value)}
                    placeholder="파트너 직업/역할 및 관계 (예: 오컬트 동아리 선배, 형사 콤비)"
                    style={{ padding: "8px 10px", borderRadius: "6px", backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.8rem", outline: "none" }}
                  />
                  <input
                    type="text"
                    value={ghostPartnerPersonality}
                    onChange={e => setGhostPartnerPersonality(e.target.value)}
                    placeholder="파트너 성격/외모 (예: 과묵한 흑발, 트라우마를 숨긴 츤데레)"
                    style={{ padding: "8px 10px", borderRadius: "6px", backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.8rem", outline: "none" }}
                  />
                </div>
              </div>

              {/* 2. 추가 등장인물 (선택) */}
              <div style={{ padding: "12px", backgroundColor: colors.inputBg, borderRadius: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: colors.textMuted, display: "flex", alignItems: "center", gap: "4px" }}>
                    <Users size={14} /> 추가 등장인물 (생존자 / 목격자 / 희생자)
                  </span>
                  <span style={{ fontSize: "0.68rem", color: colors.textMuted }}>선택 사항</span>
                </div>
                <input
                  type="text"
                  value={ghostExtraNpc}
                  onChange={e => setGhostExtraNpc(e.target.value)}
                  placeholder="예: 함께 갇힌 2명의 손님(겁 많은 대학생, 의문의 관리인)"
                  style={{ padding: "8px 10px", borderRadius: "6px", backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.8rem", outline: "none" }}
                />
              </div>

              {/* 3. 괴이 / 원흉 */}
              <div style={{ padding: "12px", backgroundColor: colors.inputBg, borderRadius: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: colors.textMuted, display: "flex", alignItems: "center", gap: "4px" }}>
                    <Skull size={14} /> 괴이 / 저주의 정체 (원흉)
                  </span>
                  <span style={{ fontSize: "0.68rem", color: colors.textMuted }}>선택 사항</span>
                </div>
                <input
                  type="text"
                  value={ghostEntityIdea}
                  onChange={e => setGhostEntityIdea(e.target.value)}
                  placeholder="예: 4시 44분에 엘리베이터를 탄 사람을 데려가는 붉은 옷의 망령"
                  style={{ padding: "8px 10px", borderRadius: "6px", backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.8rem", outline: "none" }}
                />
              </div>
            </div>
          )}

          {/* 4-B. [추리 모드]: 피해자 vs 용의자 수사망 분리 */}
          {selectedRule === "추리" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: colors.cardBg, padding: "16px", borderRadius: "16px", border: `1px solid ${colors.border}` }}>
              <span style={{ fontSize: "0.84rem", fontWeight: "700", color: colors.text, display: "flex", alignItems: "center", gap: "6px" }}>
                <Search size={16} color={colors.accent} /> 4. 사건 관계자 및 용의자 설정
              </span>

              {/* 피해자/의뢰인 */}
              <div style={{ padding: "12px", backgroundColor: colors.inputBg, borderRadius: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: "700", color: colors.accent }}>
                  사건 목표 / 피해자 (또는 의뢰인)
                </span>
                <input
                  type="text"
                  value={mysteryVictim}
                  onChange={e => setMysteryVictim(e.target.value)}
                  placeholder="예: 유산을 둘러싸고 살해당한 대저택의 당주 '차태석 회장'"
                  style={{ padding: "8px 10px", borderRadius: "6px", backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.8rem", outline: "none" }}
                />
              </div>

              {/* 용의자 수사망 */}
              <div style={{ padding: "12px", backgroundColor: colors.inputBg, borderRadius: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: colors.text }}>
                    용의자 수사망 구성
                  </span>
                  <input
                    type="text"
                    value={mysterySuspectCount}
                    onChange={e => setMysterySuspectCount(e.target.value)}
                    placeholder="인원 (예: 3~4명)"
                    style={{ width: "90px", padding: "4px 8px", borderRadius: "6px", backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.75rem", outline: "none", textAlign: "center" }}
                  />
                </div>
                <input
                  type="text"
                  value={mysterySuspects}
                  onChange={e => setMysterySuspects(e.target.value)}
                  placeholder="용의자들의 직업/성향 (예: 전담 주치의, 야심 많은 첫째 아들, 수상한 비서)"
                  style={{ padding: "8px 10px", borderRadius: "6px", backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.8rem", outline: "none" }}
                />
              </div>
            </div>
          )}

          {/* 4-C. [연애 모드]: 공략 대상 및 매력 포인트 */}
          {selectedRule === "연애" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: colors.cardBg, padding: "16px", borderRadius: "16px", border: `1px solid ${colors.border}` }}>
              <span style={{ fontSize: "0.84rem", fontWeight: "700", color: colors.text, display: "flex", alignItems: "center", gap: "6px" }}>
                <Heart size={16} color={colors.accent} /> 4. 공략 대상(상대방) 설정
              </span>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr", gap: "8px" }}>
                <input 
                  type="text" 
                  value={datingTargetCount} 
                  onChange={e => setDatingTargetCount(e.target.value)} 
                  placeholder="인원수 (예: 1:1 집중 / 삼각관계 2명)" 
                  style={{ padding: "9px 12px", borderRadius: "8px", backgroundColor: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.82rem", outline: "none" }}
                />
                <input 
                  type="text" 
                  value={datingTargetJob} 
                  onChange={e => setDatingTargetJob(e.target.value)} 
                  placeholder="상대방 신분/직업 (예: 직속 팀장, 황실 기사단장)" 
                  style={{ padding: "9px 12px", borderRadius: "8px", backgroundColor: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.82rem", outline: "none" }}
                />
              </div>
              <input 
                type="text" 
                value={datingTargetCharm} 
                onChange={e => setDatingTargetCharm(e.target.value)} 
                placeholder="외모 및 매력 포인트 (예: 흑발 쉼표머리 차도남, 겉차속따 츤데레, 퇴폐미)" 
                style={{ padding: "9px 12px", borderRadius: "8px", backgroundColor: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.82rem", outline: "none" }}
              />
            </div>
          )}

          {/* 5단계: 추가 아이디어 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "0.84rem", fontWeight: "700", color: colors.text }}>
              5. (선택) 한 줄 줄거리 / 추가 아이디어
            </span>
            <textarea 
              rows={2} 
              value={additionalIdea} 
              onChange={e => setAdditionalIdea(e.target.value)} 
              placeholder="예: 비 오는 밤, 직속 팀장과 엘리베이터에 갇히면서 시작되는 이야기..." 
              style={{ padding: "9px 12px", borderRadius: "8px", backgroundColor: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "0.82rem", outline: "none", resize: "none", lineHeight: "1.5" }}
            />
          </div>

        </div>

        {/* 3. 하단 액션 바 */}
        <div style={{
          padding: isMobile ? "12px 16px" : "16px 22px",
          borderTop: `1px solid ${colors.border}`,
          backgroundColor: colors.headerBg,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: "10px", flexShrink: 0
        }}>
          <button
            type="button"
            onClick={handleCopyOnly}
            style={{
              padding: "11px 16px", borderRadius: "10px",
              backgroundColor: colors.inputBg, border: `1px solid ${colors.border}`,
              color: colors.text, fontSize: "0.82rem", fontWeight: "600", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <Copy size={15} /> 프롬프트 복사
          </button>

          <button
            type="button"
            onClick={handleCopyAndOpenStudio}
            style={{
              padding: "11px 22px", borderRadius: "10px", border: "none",
              backgroundColor: colors.accent, color: "#ffffff",
              fontSize: "0.88rem", fontWeight: "700", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: isDarkMode ? `0 4px 16px rgba(244, 63, 94, 0.35)` : `0 4px 14px rgba(190, 24, 93, 0.25)`
            }}
          >
            {isCopied ? <Check size={16} /> : <ExternalLink size={16} />}
            <span>{isCopied ? "복사 완료! 스튜디오로 이동 중" : "🚀 AI 스튜디오에서 집필 시작 ↗"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
