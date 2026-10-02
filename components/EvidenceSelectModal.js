// components/EvidenceSelectModal.js
"use client";

import React, { useState } from "react";
import { 
  X, Fingerprint, FileText, Search, Sparkles, 
  Check, AlertCircle, ChevronRight 
} from "lucide-react";

// 🌟 [스마트 톤 어댑터] 캐릭터 성격과 배경을 읽어 찰떡같은 대사를 추천하는 엔진
function generateRefuteDialogue(characterSheet = {}, evidenceName = "증거품", targetStatement = "") {
  // 캐릭터의 성격, 말투, 백스토리 텍스트 종합 분석
  const traits = (
    (characterSheet?.personality || "") + " " + 
    (characterSheet?.background || "") + " " + 
    (characterSheet?.job || "")
  ).toLowerCase();

  const target = targetStatement && targetStatement.trim() 
    ? `'${targetStatement.trim()}'라는 말` 
    : "당신의 알리바이";

  // 1. 거친 형사 / 반말 / 시니컬 / 하드보일드
  if (/거친|냉소|반말|형사|양아치|불량|시니컬|하드보일드|무뚝뚝/i.test(traits)) {
    return `"웃기지 마. ${target}, 이 [${evidenceName}] 까보니까 앞뒤가 하나도 안 맞잖아."`;
  }
  
  // 2. 능글 / 오만 / 귀족 / 장난기
  if (/능글|오만|귀족|도련님|장난|엘리트|여유/i.test(traits)) {
    return `"어머나, 거짓말도 성의 있게 하셔야죠. ${target}은 이 [${evidenceName}] 앞에서 전부 들통났답니다?"`;
  }

  // 3. 무협 / 동양풍 / 사극 / 시대극
  if (/동양|무협|사극|중세|무사|도사/i.test(traits)) {
    return `"그대의 요설은 이 [${evidenceName}] 앞에서 낱낱이 부서질 것이오."`;
  }

  // 4. 차분 / 분석적 / 교수 / 법조인
  if (/분석|교수|변호|냉철|지적|학자/i.test(traits)) {
    return `"논리적으로 성립할 수 없습니다. ${target}은 [${evidenceName}]의 명백한 팩트와 정면으로 대치됩니다."`;
  }

  // 5. 기본값: 깔끔하고 이지적인 수사관 (존댓말)
  return `"방금 하신 ${target}은 제가 확보한 [${evidenceName}]의 감식 결과와 정면으로 모순됩니다!"`;
}

export default function EvidenceSelectModal({
  isOpen,
  onClose,
  clues = [],                // 수집된 증거/단서 목록 (sheet.items + sheet.clues)
  characterSheet = {},       // 🌟 캐릭터 시트 (성격/직업/말투 감지용)
  targetStatement = "",      // 반박 대상이 되는 용의자의 특정 진술
  onPresentEvidence,         // 반증 제시 콜백: (formattedText, selectedEvidence) => void
  isMobile = false
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  // 검색 필터링
  const filteredClues = clues.filter(item => {
    const name = typeof item === "string" ? item : (item.name || item.title || "");
    const desc = typeof item === "object" ? (item.desc || item.overview || "") : "";
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           desc.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedClue = filteredClues[selectedIdx] || filteredClues[0] || null;

  // [ 💥 모순 포착 : 반증 제시 ] 원터치 실행
  const handleConfirmPresent = () => {
    if (!selectedClue) return;

    const evidenceName = typeof selectedClue === "string" 
      ? selectedClue 
      : (selectedClue.name || selectedClue.title || "증거품");

    // 🌟 스마트 톤 어댑터로 캐릭터 맞춤형 대사 자동 생성
    const dialogue = generateRefuteDialogue(characterSheet, evidenceName, targetStatement);

    // AI 엔진 인식용 헤더 태그 + 자연스러운 대사 결합
    const formattedText = `[💥 모순 포착 : 반증 제시 | 증거: ${evidenceName}]\n${dialogue}`;

    if (onPresentEvidence) {
      onPresentEvidence(formattedText, selectedClue);
    }
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100005,
        backgroundColor: "rgba(5, 10, 20, 0.85)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center",
        padding: isMobile ? "0" : "20px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: isMobile ? "100%" : "520px",
          height: isMobile ? "82vh" : "700px", maxHeight: "85vh",
          backgroundColor: "#0d131f",
          border: "1.5px solid rgba(56, 189, 248, 0.4)",
          borderRadius: isMobile ? "24px 24px 0 0" : "24px",
          overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.8), 0 0 25px rgba(56, 189, 248, 0.15)",
          color: "#f1f5f9", animation: isMobile ? "slideUp 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none"
        }}
      >
        {/* 1. 상단 타이틀 바 */}
        <div style={{
          padding: "16px 20px 12px",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              backgroundColor: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8"
            }}>
              <Fingerprint size={18} />
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: "900", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                증거품 서랍
                <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: "4px", backgroundColor: "#0284c7", color: "#fff", fontWeight: "800" }}>
                  반증 선택
                </span>
              </div>
              <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>상대방의 모순을 격파할 물증이나 단서를 선택하십시오.</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. 반박 대상 진술 요약 박스 (있을 경우 표시) */}
        {targetStatement && (
          <div style={{
            padding: "10px 16px",
            backgroundColor: "rgba(2, 132, 199, 0.12)",
            borderBottom: "1px dashed rgba(56, 189, 248, 0.3)",
            display: "flex", alignItems: "flex-start", gap: "8px", flexShrink: 0
          }}>
            <AlertCircle size={15} color="#38bdf8" style={{ marginTop: "2px", flexShrink: 0 }} />
            <div style={{ fontSize: "0.75rem", color: "#cbd5e1", lineHeight: "1.4" }}>
              <span style={{ fontWeight: "800", color: "#38bdf8" }}>반박할 의혹 진술: </span>
              "{targetStatement}"
            </div>
          </div>
        )}

        {/* 3. 검색 바 */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "10px",
            padding: "6px 12px", border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <Search size={14} color="#64748b" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSelectedIdx(0); }}
              placeholder="증거품 또는 감식 메모 검색..."
              style={{
                flex: 1, background: "none", border: "none", color: "#fff",
                fontSize: "0.78rem", outline: "none"
              }}
            />
          </div>
        </div>

        {/* 4. 증거 목록 & 상세 내용 듀얼 분할 영역 */}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          
          {/* A. 상단 가로 롤링 목록 */}
          <div style={{
            padding: "12px 16px",
            overflowX: "auto", display: "flex", gap: "8px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "rgba(0,0,0,0.2)", flexShrink: 0
          }}>
            {filteredClues.length === 0 ? (
              <div style={{ padding: "16px 0", color: "#64748b", fontSize: "0.78rem" }}>
                {clues.length === 0 ? "아직 현장에서 수집된 물증이나 단서가 없습니다." : "검색 조건에 맞는 증거가 없습니다."}
              </div>
            ) : (
              filteredClues.map((item, idx) => {
                const name = typeof item === "string" ? item : (item.name || item.title || "미확인 단서");
                const isSelected = selectedIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedIdx(idx)}
                    style={{
                      minWidth: "130px", maxWidth: "150px", padding: "10px", borderRadius: "12px",
                      backgroundColor: isSelected ? "rgba(2, 132, 199, 0.3)" : "rgba(30, 41, 59, 0.6)",
                      border: `1.5px solid ${isSelected ? "#38bdf8" : "rgba(255,255,255,0.08)"}`,
                      cursor: "pointer", display: "flex", flexDirection: "column", gap: "6px",
                      transition: "all 0.15s ease", flexShrink: 0
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Fingerprint size={14} color={isSelected ? "#38bdf8" : "#64748b"} />
                      {isSelected && <Check size={14} color="#38bdf8" />}
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: "900", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {name}
                    </span>
                    <span style={{ fontSize: "0.65rem", color: isSelected ? "#38bdf8" : "#94a3b8" }}>
                      {isSelected ? "선택됨" : "터치하여 확인"}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* B. 하단 선택된 증거 상세 감식록 */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {selectedClue ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "6px",
                    backgroundColor: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b"
                  }}>
                    <FileText size={15} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "900", color: "#fff" }}>
                      {typeof selectedClue === "string" ? selectedClue : (selectedClue.name || selectedClue.title)}
                    </h3>
                    <span style={{ fontSize: "0.68rem", color: "#38bdf8", fontWeight: "700" }}>정식 감식 완료 물증</span>
                  </div>
                </div>

                <div style={{
                  padding: "12px", borderRadius: "12px",
                  backgroundColor: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: "0.8rem", color: "#cbd5e1", lineHeight: "1.6"
                }}>
                  <span style={{ display: "block", fontSize: "0.7rem", color: "#94a3b8", fontWeight: "800", marginBottom: "4px" }}>
                    ■ 감식 및 현장 발견 기록
                  </span>
                  {typeof selectedClue === "object" 
                    ? (selectedClue.desc || selectedClue.overview || selectedClue.detail || "상세한 감식 기록이 없습니다.")
                    : "현장에서 공식 수색을 통해 확보된 중요 참고 물증입니다."}
                </div>

                {/* 모순 간파 힌트 (데이터에 있을 경우) */}
                {selectedClue?.contradiction && (
                  <div style={{
                    padding: "10px 12px", borderRadius: "10px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)",
                    fontSize: "0.75rem", color: "#fca5a5", lineHeight: "1.5"
                  }}>
                    <span style={{ fontWeight: "800", color: "#ef4444" }}>⚠ 모순점 힌트: </span>
                    {selectedClue.contradiction}
                  </div>
                )}
              </>
            ) : (
              <div style={{ margin: "auto", textAlign: "center", color: "#64748b", fontSize: "0.8rem" }}>
                상단에서 증거품을 선택하면 감식 결과가 표시됩니다.
              </div>
            )}
          </div>

        </div>

        {/* 5. 하단 액션 버튼: [ 💥 모순 포착 : 반증 제시 ] */}
        <div style={{
          padding: "12px 18px",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex", gap: "10px", flexShrink: 0
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "13px 18px", borderRadius: "14px",
              backgroundColor: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)",
              fontWeight: "800", fontSize: "0.85rem", cursor: "pointer"
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirmPresent}
            disabled={!selectedClue}
            style={{
              flex: 1, padding: "13px", borderRadius: "14px",
              backgroundColor: selectedClue ? "#0284c7" : "#1e293b",
              color: selectedClue ? "#fff" : "#64748b",
              border: `1px solid ${selectedClue ? "#38bdf8" : "transparent"}`,
              fontWeight: "900", fontSize: "0.92rem", cursor: selectedClue ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              boxShadow: selectedClue ? "0 4px 18px rgba(2, 132, 199, 0.4)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            <Sparkles size={16} />
            <span>💥 모순 포착 : 반증 제시</span>
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
