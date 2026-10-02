// components/ScenarioStudioModal.js
"use client";

import React, { useState } from "react";
import { 
  X, Sparkles, Copy, Check, ExternalLink, 
  UserRound, Tag, Users
} from "lucide-react";

// DOPA 공식 시나리오 작가 Gem 주소
const DOPA_GEM_URL = "https://gemini.google.com/gem/1laNhRvl9HlbyfErFfxUIs05pOrxSh_Sx?usp=sharing";

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

  // 3. 도파미너(주인공) 정보
  const [pcGenderAge, setPcGenderAge] = useState("20대 여성");
  const [pcJob, setPcJob] = useState("");
  const [pcPersonality, setPcPersonality] = useState("");
  const [pcSecret, setPcSecret] = useState("");

  // 4. 등장인물(NPC / KPC) 정보
  const [npcCount, setNpcCount] = useState("1명 (단독 상대)");
  const [npcAppearance, setNpcAppearance] = useState("");
  const [additionalIdea, setAdditionalIdea] = useState("");

  const [isCopied, setIsCopied] = useState(false);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 룰별 100% 맞춤형 Gemini Gem 프롬프트 생성기
  const buildPromptText = () => {
    let modeSpecificInstructions = "";
    let modeSpecificSchema = "";

    // A. 💖 연애 2.0 모드
    if (selectedRule === "연애") {
      modeSpecificInstructions = `
[💖 룰 시스템: 연애 2.0 (오픈 샌드박스 로맨스)]
- 행동 자유도 100%: 억지 호감도 잠금 없이 도파미너의 돌발 행동(초면 고백, 키스, 멱살 등)에 상대가 성격대로 즉각 반응해야 합니다.
- 안티-예스맨: 맹목적 동조 금지. 인물별 자존심/역린 및 감정 침식(서운->피로->체념->단절)과 후회 서사를 포함하십시오.
- 다각관계 지원: 양다리 줄타기 복선, 3자 대면 서스펜스, 폴리아모리 선언 시 3대 반응을 수용하십시오.
- 영구 호흡권: "뜨거운 밤을 보냈다", "다음 날 아침" 식의 임의 시간 스킵/암전을 절대 금지하고 공감각 슬로우 모션 서술을 준수하십시오.`;

      modeSpecificSchema = `
[시나리오 제목]
(감각적인 로맨스 제목)

[공개 시놉시스]
(도파미너들이 서재와 라운지에서 읽게 될 설레는 소개글 3~4문장)

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

    // B. 🕵️️ 추리 2.0 모드
    } else if (selectedRule === "추리") {
      modeSpecificInstructions = `
[🕵️ 룰 시스템: 추리 2.0 (본격 수사 & 피카레스크 듀얼 스탠스)]
- 페어 플레이: 진범, 트릭, 스모킹 건을 도중에 바꾸지 마십시오.
- 동조 차단: 엉뚱한 반증이나 억지 추궁 시 용의자가 비웃으며 신뢰도(HP) 데미지를 입히게 하십시오.
- 거짓말 복선: 용의자의 진술 중 최소 1개는 미세 신체 반응(Tells)과 함께 모순을 품게 하십시오.
- 완전범죄 분기: 만약 도파미너('${pcJob}')가 진범인 경우, 타인에게 누명을 씌우는 [위장 공작]이 가능하도록 희생양의 알리바이 공백을 설계하십시오.`;

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
(피해자 또는 의뢰인 이름)

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

    // C. 🕯️ 괴담 모드
    } else {
      modeSpecificInstructions = `
[🕯️ 룰 시스템: DOPA 괴담 모드 (1D10 서스펜스 & 침식도)]
- 1D10 행동 굴림: 체력, 순발, 관찰, 추론, 정신, 사교 6대 스탯 기반 판정 체계.
- 3중 감각 침식: 공포나 충격 시 침식도(0~100%) 상승 및 30/60/90% 이상 충동 발현.
- 결착 의식 3단계: 마지막 파훼 의식(진상 직면 ➔ 합동 저지 ➔ 최후 돌파)을 집행할 수 있는 규칙과 기믹을 설계하십시오.
- 무공해 서사: 소설 지문 본문에 주사위나 룰 메타 텍스트를 오염시키지 마십시오.`;

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
(괴이의 실체)

[사건 목표 / 봉인 대상]
(생환 목표 또는 탈출 조건)

[동행 파트너 (메인 파트너)]
- 파트너 이름: (이름)
  나이/성별: (나이/성별)
  직업/신분: (직업)
  외모 및 성격: (외모 및 도파미너와의 관계성)
  숨겨진 이면 / 진심: (파트너가 숨기고 있는 충격적인 비밀이나 트라우마)

[추가 등장인물 (선택 사항)]
- 인물1 이름: (이름)
  특징 및 행적: (설명)
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
당신은 AI 텍스트 RPG 플랫폼 'DOPA'의 전속 시나리오 작가 Gem입니다.
아래 기획 요구사항을 바탕으로, DOPA 파서 엔진이 100% 인식할 수 있는 공식 마크다운 서식에 맞춰 시나리오 1편을 집필하십시오.

──────────────────────────────────────────────────────────
[기획 설정 요구사항]
1. 룰 시스템: [${selectedRule === "연애" ? "연애 2.0 (오픈 샌드박스 로맨스)" : selectedRule === "추리" ? "추리 2.0 (본격 수사 & 피카레스크)" : "괴담 (서스펜스 오컬트)"}]
2. 서사 및 관계성 키워드: ${selectedTags.join(" ") || "#자유 서사"}
3. 주인공(도파미너) 설정:
   - 나이/성별: ${pcGenderAge || "미상"}
   - 직업/신분: ${pcJob || "자유 설정"}
   - 성격 및 특징: ${pcPersonality || "시나리오에 가장 어울리는 성격"}
   - 숨겨진 비밀/이면: ${pcSecret || "극적 반전을 위한 비밀 설정 부여"}
4. 등장인물 구성:
   - 인원수: ${npcCount}
   - 외모 및 분위기 지침: ${npcAppearance || "매력적이고 개성적인 외모 묘사"}
${additionalIdea ? `5. 추가 스토리 아이디어 / 로그라인: ${additionalIdea}` : ""}
${modeSpecificInstructions}

──────────────────────────────────────────────────────────
[🚨 필수 출력 서식 - 아래 양식을 글자 하나 바꾸지 말고 그대로 유지하며 작성하십시오]
${modeSpecificSchema}`;
  };

  // 🚀 프롬프트 복사 & Gem 새 창 열기 (원클릭)
  const handleCopyAndOpenGem = () => {
    const text = buildPromptText();
    navigator.clipboard.writeText(text);
    setIsCopied(true);

    if (triggerToast) {
      triggerToast("프롬프트 복사 완료!", "Gemini Gem 창으로 이동합니다. 붙여넣기(Ctrl+V)하세요!", "🚀");
    }

    window.open(DOPA_GEM_URL, "_blank");
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

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        backgroundColor: "rgba(5, 5, 5, 0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "10px" : "20px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "680px", maxHeight: "90vh",
          backgroundColor: isDarkMode ? "#141211" : "#ffffff",
          border: `1.5px solid ${theme?.accent || "#ec4899"}`,
          borderRadius: "24px", display: "flex", flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(236, 72, 153, 0.15)",
          overflow: "hidden", color: theme?.text || "#fff"
        }}
      >
        {/* 헤더 */}
        <div style={{
          padding: isMobile ? "14px 18px" : "18px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px dashed rgba(255, 255, 255, 0.1)",
          backgroundColor: isDarkMode ? "rgba(24, 20, 18, 0.7)" : "#fdf8f6",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "12px",
              backgroundColor: "rgba(236, 72, 153, 0.15)", border: "1.5px solid rgba(236, 72, 153, 0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", color: theme?.accent || "#ec4899"
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontWeight: "900", fontSize: isMobile ? "1.05rem" : "1.2rem", color: theme?.text }}>
                나만의 시나리오 만들기 (프롬프트 스튜디오)
              </div>
              <div style={{ fontSize: "0.76rem", color: theme?.textMuted || "#a8a29e", marginTop: "2px", fontWeight: "600" }}>
                설정을 조합하여 DOPA 전속 Gemini Gem에 보낼 지시문을 생성합니다.
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.06)", border: "none", color: "#a8a29e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 본문 폼 스크롤 */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: isMobile ? "16px" : "24px", display: "flex", flexDirection: "column", gap: "22px" }}>
          
          {/* Gem 직접 방문 링크 배너 */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", borderRadius: "14px",
            backgroundColor: "rgba(236, 72, 153, 0.08)", border: "1px solid rgba(236, 72, 153, 0.25)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", fontWeight: "700", color: theme?.text }}>
              <span style={{ fontSize: "1rem" }}>🤖</span>
              <span>DOPA 전속 시나리오 작가 Gem 연동 완료</span>
            </div>
            <a 
              href={DOPA_GEM_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: "0.75rem", fontWeight: "800", color: theme?.accent || "#ec4899", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
            >
              Gem 바로가기 <ExternalLink size={13} />
            </a>
          </div>

          {/* 1. 룰 선택 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "0.86rem", fontWeight: "800", color: theme?.accent }}>
              1. 시나리오 룰 시스템 선택
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {[
                { id: "연애", name: "💖 연애 2.0", desc: "오픈 샌드박스 로맨스" },
                { id: "추리", name: "🕵️ 추리 2.0", desc: "수사 및 완전범죄" },
                { id: "괴담", name: "🕯️ 괴담 모드", desc: "오컬트 서스펜스" }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRule(r.id)}
                  style={{
                    padding: "12px 8px", borderRadius: "14px",
                    border: `1.5px solid ${selectedRule === r.id ? theme?.accent : "rgba(255,255,255,0.08)"}`,
                    backgroundColor: selectedRule === r.id ? "rgba(236, 72, 153, 0.15)" : "rgba(255,255,255,0.03)",
                    color: selectedRule === r.id ? theme?.accent : theme?.text,
                    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px"
                  }}
                >
                  <span style={{ fontWeight: "900", fontSize: "0.92rem" }}>{r.name}</span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.75 }}>{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. 관계성 및 기믹 태그 칩 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: isDarkMode ? "#1a1716" : "#fdfbf9", padding: "16px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.86rem", fontWeight: "800", color: theme?.text, display: "flex", alignItems: "center", gap: "6px" }}>
                <Tag size={16} color={theme?.accent} /> 서사 & 분위기 키워드 칩 (터치하여 선택)
              </span>
              <span style={{ fontSize: "0.72rem", color: theme?.accent, fontWeight: "700" }}>
                {selectedTags.length}개 선택됨
              </span>
            </div>

            <div>
              <div style={{ fontSize: "0.72rem", color: "#a8a29e", marginBottom: "6px", fontWeight: "700" }}>[관계성 & 감정선]</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {RELATION_TAGS.map(t => {
                  const isSel = selectedTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      style={{
                        padding: "5px 11px", borderRadius: "16px", fontSize: "0.76rem", fontWeight: isSel ? "800" : "500",
                        backgroundColor: isSel ? theme?.accent : "rgba(255,255,255,0.05)",
                        color: isSel ? "#fff" : theme?.textMuted,
                        border: `1px solid ${isSel ? theme?.accent : "rgba(255,255,255,0.1)"}`,
                        cursor: "pointer"
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: "4px" }}>
              <div style={{ fontSize: "0.72rem", color: "#a8a29e", marginBottom: "6px", fontWeight: "700" }}>[배경 & 사건 기믹]</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {BACKGROUND_TAGS.map(t => {
                  const isSel = selectedTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      style={{
                        padding: "5px 11px", borderRadius: "16px", fontSize: "0.76rem", fontWeight: isSel ? "800" : "500",
                        backgroundColor: isSel ? theme?.accent : "rgba(255,255,255,0.05)",
                        color: isSel ? "#fff" : theme?.textMuted,
                        border: `1px solid ${isSel ? theme?.accent : "rgba(255,255,255,0.1)"}`,
                        cursor: "pointer"
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. 도파미너(주인공) 정보 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "0.86rem", fontWeight: "800", color: theme?.text, display: "flex", alignItems: "center", gap: "6px" }}>
              <UserRound size={16} color={theme?.accent} /> 도파미너(주인공) 설정
            </span>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
              <input 
                type="text" 
                value={pcGenderAge} 
                onChange={e => setPcGenderAge(e.target.value)} 
                placeholder="나이/성별 (예: 20대 여성)" 
                style={{ padding: "10px 12px", borderRadius: "10px", backgroundColor: isDarkMode ? "#1c1917" : "#f5f5f4", border: "1px solid rgba(255,255,255,0.1)", color: theme?.text, fontSize: "0.84rem", outline: "none" }}
              />
              <input 
                type="text" 
                value={pcJob} 
                onChange={e => setPcJob(e.target.value)} 
                placeholder="직업/신분 (예: 신임 형사, 프리랜서 디자이너)" 
                style={{ padding: "10px 12px", borderRadius: "10px", backgroundColor: isDarkMode ? "#1c1917" : "#f5f5f4", border: "1px solid rgba(255,255,255,0.1)", color: theme?.text, fontSize: "0.84rem", outline: "none" }}
              />
            </div>
            <input 
              type="text" 
              value={pcPersonality} 
              onChange={e => setPcPersonality(e.target.value)} 
              placeholder="성격/특징 (예: 냉정하지만 속정이 깊음, 능글맞은 장난꾸러기)" 
              style={{ padding: "10px 12px", borderRadius: "10px", backgroundColor: isDarkMode ? "#1c1917" : "#f5f5f4", border: "1px solid rgba(255,255,255,0.1)", color: theme?.text, fontSize: "0.84rem", outline: "none" }}
            />
            <input 
              type="text" 
              value={pcSecret} 
              onChange={e => setPcSecret(e.target.value)} 
              placeholder="(선택) 숨겨진 비밀 (예: 과거 피해자와 모종의 계약이 있었다)" 
              style={{ padding: "10px 12px", borderRadius: "10px", backgroundColor: isDarkMode ? "#1c1917" : "#f5f5f4", border: "1px solid rgba(255,255,255,0.1)", color: theme?.text, fontSize: "0.84rem", outline: "none" }}
            />
          </div>

          {/* 4. 등장인물(상대방) 요구사항 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "0.86rem", fontWeight: "800", color: theme?.text, display: "flex", alignItems: "center", gap: "6px" }}>
              <Users size={16} color={theme?.accent} /> 등장인물(상대방) 요구사항
            </span>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr", gap: "10px" }}>
              <input 
                type="text" 
                value={npcCount} 
                onChange={e => setNpcCount(e.target.value)} 
                placeholder="인원수 (예: 1명 / 주요 2명 + 서브 1명)" 
                style={{ padding: "10px 12px", borderRadius: "10px", backgroundColor: isDarkMode ? "#1c1917" : "#f5f5f4", border: "1px solid rgba(255,255,255,0.1)", color: theme?.text, fontSize: "0.84rem", outline: "none" }}
              />
              <input 
                type="text" 
                value={npcAppearance} 
                onChange={e => setNpcAppearance(e.target.value)} 
                placeholder="원하는 외모/분위기 (예: 흑발 쉼표머리 차도남, 퇴폐미)" 
                style={{ padding: "10px 12px", borderRadius: "10px", backgroundColor: isDarkMode ? "#1c1917" : "#f5f5f4", border: "1px solid rgba(255,255,255,0.1)", color: theme?.text, fontSize: "0.84rem", outline: "none" }}
              />
            </div>
          </div>

          {/* 5. 추가 아이디어 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "0.86rem", fontWeight: "800", color: theme?.text }}>
              5. (선택) 한 줄 줄거리 / 추가 아이디어
            </span>
            <textarea 
              rows={2} 
              value={additionalIdea} 
              onChange={e => setAdditionalIdea(e.target.value)} 
              placeholder="예: 비 오는 밤, 직속 팀장과 엘리베이터에 갇히면서 시작되는 이야기..." 
              style={{ padding: "10px 12px", borderRadius: "10px", backgroundColor: isDarkMode ? "#1c1917" : "#f5f5f4", border: "1px solid rgba(255,255,255,0.1)", color: theme?.text, fontSize: "0.84rem", outline: "none", resize: "none" }}
            />
          </div>

        </div>

        {/* 3. 하단 액션 푸터 */}
        <div style={{
          padding: isMobile ? "14px 18px" : "18px 24px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: isDarkMode ? "rgba(16, 14, 13, 0.95)" : "#fff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: "10px", flexShrink: 0
        }}>
          <button
            type="button"
            onClick={handleCopyOnly}
            style={{
              padding: "12px 16px", borderRadius: "14px",
              backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#d6d3d1", fontSize: "0.84rem", fontWeight: "700", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <Copy size={16} /> 프롬프트만 복사
          </button>

          <button
            type="button"
            onClick={handleCopyAndOpenGem}
            style={{
              padding: "12px 22px", borderRadius: "14px", border: "none",
              backgroundColor: theme?.accent || "#ec4899", color: "#fff",
              fontSize: "0.92rem", fontWeight: "900", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: `0 4px 16px ${theme?.accentGlow || "rgba(236,72,153,0.3)"}`
            }}
          >
            {isCopied ? <Check size={18} /> : <ExternalLink size={18} />}
            <span>{isCopied ? "복사 완료! Gem으로 이동 중" : "🚀 복사 & Gem 열기 ↗"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
