// components/SecretBoard.js
"use client";

import React, { useState } from "react";
import { 
  X, Pin, UserRound, FileText, Fingerprint, FileSearch, 
  Scale, RotateCcw, Crosshair, ChevronRight, AlertCircle, Check
} from "lucide-react";

export default function SecretBoard({ 
  activeSession, 
  theme, 
  isMobile, 
  onClose, 
  onDeclareMystery 
}) {
  if (!activeSession) return null;

  const sheet = activeSession.sheet || {};
  const npcs = sheet.npcs || [];
  const clues = [...(sheet.clues || []), ...(sheet.items || [])];

  // 4대 사건 전말 가설 슬롯
  const [culprit, setCulprit] = useState("");
  const [trick, setTrick] = useState("");
  const [smokingGun, setSmokingGun] = useState("");
  const [narrative, setNarrative] = useState("");

  const [lastInsertedSlot, setLastInsertedSlot] = useState(null);

  // 용의자 터치 ➔ 1번 [지목할 진범] 슬롯 자동 주입
  const handleSelectSuspect = (name) => {
    setCulprit(name);
    triggerSlotFeedback(1);
  };

  // 단서 터치 ➔ 3번 [결정적 물증] 슬롯 자동 주입
  const handleSelectClueAsSmokingGun = (clueName) => {
    setSmokingGun(clueName);
    triggerSlotFeedback(3);
  };

  // 단서 터치 ➔ 2번 [범행 수법/트릭] 슬롯 보조 주입
  const handleSelectClueAsTrick = (clueName) => {
    setTrick(prev => prev ? `${prev}, ${clueName}` : clueName);
    triggerSlotFeedback(2);
  };

  const triggerSlotFeedback = (slotNum) => {
    setLastInsertedSlot(slotNum);
    setTimeout(() => setLastInsertedSlot(null), 1000);
  };

  // 가설 초기화
  const handleReset = () => {
    if (confirm("작성 중인 수사 가설을 모두 초기화하시겠습니까?")) {
      setCulprit("");
      setTrick("");
      setSmokingGun("");
      setNarrative("");
    }
  };

  // 최종 [ ⚖️ 진상 결착 : 전말 격발 ]
  const handleLaunchAccusation = () => {
    if (!culprit.trim()) {
      alert("지목할 진범(1번 슬롯)을 지정해야 전말을 격발할 수 있습니다.");
      return;
    }
    if (!smokingGun.trim()) {
      alert("범행을 입증할 결정적 물증(3번 슬롯)을 제시해야 합니다.");
      return;
    }

    const formattedAccusation = 
`[⚖️ 진상 결착 : 전말 격발]
• 지목 진범: ${culprit.trim()}
• 범행 수법: ${trick.trim() || "현장 알리바이 조작 및 계획적 범행"}
• 결정적 물증: ${smokingGun.trim()}
• 사건 전말: ${narrative.trim() || "수집된 단서와 알리바이 모순에 기반한 확정적 진상"}`;

    if (onDeclareMystery) {
      onDeclareMystery(formattedAccusation, {
        culprit: culprit.trim(),
        trick: trick.trim() || "현장 알리바이 조작 및 계획적 범행",
        smokingGun: smokingGun.trim(),
        narrative: narrative.trim() || "수집된 단서와 알리바이 모순에 기반한 확정적 진상"
      });
    }
    onClose();
  };

  const isReady = culprit.trim().length > 0 && smokingGun.trim().length > 0;

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100000,
        backgroundColor: "rgba(5, 5, 5, 0.88)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "10px" : "24px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "820px", height: "92vh", maxHeight: "880px",
          backgroundColor: "#13110f",
          border: "1.5px solid #3d322a",
          borderRadius: "20px", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(245, 158, 11, 0.08)",
          color: "#f8fafc"
        }}
      >
        {/* 1. 상단 수사본부 헤더 (괴담 스타일 바인딩) */}
        <div style={{
          padding: isMobile ? "14px 16px" : "18px 24px",
          backgroundColor: "#181512",
          borderBottom: "1px solid #2e2620",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              backgroundColor: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b"
            }}>
              <Pin size={18} style={{ transform: "rotate(45deg)" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: isMobile ? "1rem" : "1.12rem", fontWeight: "900", color: "#f59e0b", letterSpacing: "-0.3px" }}>
                  수사 본부 증거보드 (EVIDENCE DOSSIER)
                </span>
              </div>
              <span style={{ fontSize: "0.74rem", color: "#a8a29e", fontWeight: "600" }}>
                사건: 《{activeSession.title || "사건명 미상"}》 · 확보 단서 {clues.length}건 · 용의자 {npcs.length}명
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button 
              type="button" 
              onClick={handleReset} 
              title="가설 초기화"
              style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer", padding: "6px", display: "flex" }}
            >
              <RotateCcw size={17} />
            </button>
            <button 
              type="button" 
              onClick={onClose}
              style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.06)", border: "none", color: "#d6d3d1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. 본문 스크롤 영역 (코르크 도트 텍스처 복원) */}
        <div style={{
          flex: 1, minHeight: 0, overflowY: "auto", padding: isMobile ? "14px" : "22px",
          display: "flex", flexDirection: "column", gap: "22px",
          backgroundImage: "radial-gradient(#2b241e 1.2px, transparent 1.2px)", backgroundSize: "20px 20px"
        }}>
          
          {/* 👥 1섹션: 용의자 및 사건 관계자 (괴담 모드 대형 폴라로이드 스타일) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: "900", color: "#f59e0b", display: "flex", alignItems: "center", gap: "6px" }}>
                <UserRound size={15} /> 용의자 및 사건 관계자 ({npcs.length}명)
              </span>
              <span style={{ fontSize: "0.68rem", color: "#78716c" }}>
                터치하여 1번 진범 슬롯에 즉시 지정
              </span>
            </div>

            <div style={{
              display: "flex", gap: "12px", overflowX: "auto", padding: "10px 4px 6px",
              WebkitOverflowScrolling: "touch"
            }}>
              {npcs.length === 0 ? (
                <div style={{ padding: "20px", color: "#78716c", fontSize: "0.78rem" }}>등록된 용의자가 없습니다.</div>
              ) : (
                npcs.map((npc, idx) => {
                  const isSelected = culprit === npc.name;
                  return (
                    <div 
                      key={npc.id || idx}
                      onClick={() => handleSelectSuspect(npc.name)}
                      style={{
                        minWidth: "120px", maxWidth: "135px",
                        backgroundColor: isSelected ? "rgba(245, 158, 11, 0.15)" : "#1c1917",
                        border: `1.5px solid ${isSelected ? "#f59e0b" : "#38312b"}`,
                        borderRadius: "14px", padding: "12px 10px 10px",
                        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center",
                        position: "relative", flexShrink: 0, transition: "all 0.15s ease",
                        boxShadow: isSelected ? "0 8px 24px rgba(245, 158, 11, 0.25)" : "0 4px 14px rgba(0,0,0,0.35)",
                        transform: isSelected ? "scale(1.02)" : "scale(1)"
                      }}
                    >
                      {/* 📌 상단 붉은 핀 (괴담 시그니처 연출) */}
                      <div style={{ position: "absolute", top: "-9px", color: isSelected ? "#f59e0b" : "#ef4444", zIndex: 2 }}>
                        <Pin size={20} fill={isSelected ? "#f59e0b" : "#ef4444"} style={{ transform: "rotate(45deg)" }} />
                      </div>

                      {/* 대형 초상화 뷰 (괴담 카드 비율 계승) */}
                      <div style={{
                        width: "100%", aspectRatio: "1/1",
                        backgroundColor: "#292524", borderRadius: "10px",
                        overflow: "hidden", border: `1px solid ${isSelected ? "rgba(245, 158, 11, 0.5)" : "#44403c"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px"
                      }}>
                        {npc.portraitUrl || npc.portrait ? (
                          <img src={npc.portraitUrl || npc.portrait} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <UserRound size={36} color="#78716c" />
                        )}
                      </div>

                      <div style={{ fontWeight: "900", color: "#f5f5f4", fontSize: "0.88rem", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {npc.name}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "#a8a29e", marginTop: "2px", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {npc.job || "신분 미상"}
                      </div>

                      <div style={{ marginTop: "6px", fontSize: "0.65rem", fontWeight: "800", color: isSelected ? "#f59e0b" : "#78716c" }}>
                        {isSelected ? "✓ 진범 지정됨" : "+ 진범 꽂기"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 📂 2섹션: 확보된 사건 단서 및 물증 (괴담 스타일 2열 그리드 복원) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: "900", color: "#f59e0b", display: "flex", alignItems: "center", gap: "6px" }}>
                <FileText size={15} /> 확보된 사건 단서 및 물증 ({clues.length}건)
              </span>
              <span style={{ fontSize: "0.68rem", color: "#78716c" }}>
                터치하여 스모킹 건(물증)에 꽂기
              </span>
            </div>

            {clues.length === 0 ? (
              <div style={{ padding: "26px", border: "1px dashed #3d322a", borderRadius: "14px", textAlign: "center", color: "#78716c", fontSize: "0.8rem", backgroundColor: "rgba(0,0,0,0.3)" }}>
                아직 수집된 결정적 증거가 없습니다. 현장 조사와 심문을 통해 물증을 확보하십시오.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "10px" }}>
                {clues.map((item, idx) => {
                  const clueName = typeof item === "string" ? item : (item.name || item.title || "미확인 단서");
                  const clueDesc = typeof item === "object" ? (item.desc || item.overview || item.detail || "") : "";
                  const isSelectedGun = smokingGun === clueName;

                  return (
                    <div 
                      key={idx}
                      style={{
                        padding: "12px 14px", backgroundColor: isSelectedGun ? "rgba(245, 158, 11, 0.12)" : "rgba(28, 25, 23, 0.8)",
                        border: `1.5px solid ${isSelectedGun ? "#f59e0b" : "#38312b"}`,
                        borderRadius: "14px", display: "flex", flexDirection: "column", gap: "6px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: "900", fontSize: "0.88rem", color: isSelectedGun ? "#f59e0b" : "#fbbf24" }}>
                          • {clueName}
                        </span>
                        {isSelectedGun && (
                          <span style={{ fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", backgroundColor: "#f59e0b", color: "#000", fontWeight: "900" }}>
                            스모킹건 지정
                          </span>
                        )}
                      </div>

                      {clueDesc && (
                        <div style={{ fontSize: "0.75rem", color: "#a8a29e", lineHeight: "1.45" }}>
                          {clueDesc}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "6px", marginTop: "auto", paddingTop: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleSelectClueAsSmokingGun(clueName)}
                          style={{
                            flex: 1, padding: "5px 8px", borderRadius: "8px", border: "none",
                            backgroundColor: isSelectedGun ? "#f59e0b" : "rgba(245, 158, 11, 0.2)",
                            color: isSelectedGun ? "#000" : "#fbbf24",
                            fontSize: "0.7rem", fontWeight: "800", cursor: "pointer"
                          }}
                        >
                          스모킹건 지정
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectClueAsTrick(clueName)}
                          style={{
                            padding: "5px 8px", borderRadius: "8px",
                            backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid #44403c",
                            color: "#d6d3d1", fontSize: "0.7rem", fontWeight: "700", cursor: "pointer"
                          }}
                        >
                          트릭에 반영
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 🎯 3섹션: 사건 전말 가설 수립 (괴담 모드 2x2 형태 완벽 계승) */}
          <div style={{
            backgroundColor: "rgba(24, 21, 18, 0.95)", borderRadius: "16px",
            border: "1.5px solid #3d322a", padding: isMobile ? "14px" : "18px",
            display: "flex", flexDirection: "column", gap: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Scale size={16} color="#f59e0b" />
              <span style={{ fontSize: "0.85rem", fontWeight: "900", color: "#f59e0b" }}>
                사건 전말 가설 수립 (상단 터치 자동 주입 or 직접 작성)
              </span>
            </div>

            {/* 1열: 진범 지목 + 트릭 파훼 (PC 환경 2분할, 모바일 1열) */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
              
              {/* 슬롯 1: 지목할 진범 */}
              <div style={{
                padding: "10px 12px", borderRadius: "10px", backgroundColor: "#171412",
                border: `1px solid ${lastInsertedSlot === 1 ? "#f59e0b" : "#38312b"}`,
                display: "flex", flexDirection: "column", gap: "4px"
              }}>
                <label style={{ fontSize: "0.72rem", fontWeight: "800", color: "#f59e0b" }}>
                  1. 지목할 진범 (주모자/실체)
                </label>
                <input
                  type="text"
                  value={culprit}
                  onChange={e => setCulprit(e.target.value)}
                  placeholder="예: 백수진, 지하 4층 관리자"
                  style={{
                    width: "100%", padding: "7px 10px", borderRadius: "6px",
                    backgroundColor: "#0d0b0a", border: "1px solid #2e2620",
                    color: "#fff", fontSize: "0.82rem", fontWeight: "800", outline: "none"
                  }}
                />
              </div>

              {/* 슬롯 2: 파훼할 범행 트릭 */}
              <div style={{
                padding: "10px 12px", borderRadius: "10px", backgroundColor: "#171412",
                border: `1px solid ${lastInsertedSlot === 2 ? "#f59e0b" : "#38312b"}`,
                display: "flex", flexDirection: "column", gap: "4px"
              }}>
                <label style={{ fontSize: "0.72rem", fontWeight: "800", color: "#f59e0b" }}>
                  2. 파훼할 범행 트릭 및 수법
                </label>
                <input
                  type="text"
                  value={trick}
                  onChange={e => setTrick(e.target.value)}
                  placeholder="예: 배전반을 차단해 시차를 조작하고 비상구로 도주함"
                  style={{
                    width: "100%", padding: "7px 10px", borderRadius: "6px",
                    backgroundColor: "#0d0b0a", border: "1px solid #2e2620",
                    color: "#fff", fontSize: "0.82rem", outline: "none"
                  }}
                />
              </div>

            </div>

            {/* 슬롯 3: 결정적 물증 (풀 너비) */}
            <div style={{
              padding: "10px 12px", borderRadius: "10px", backgroundColor: "#171412",
              border: `1px solid ${lastInsertedSlot === 3 ? "#f59e0b" : "#38312b"}`,
              display: "flex", flexDirection: "column", gap: "4px"
            }}>
              <label style={{ fontSize: "0.72rem", fontWeight: "800", color: "#f59e0b" }}>
                3. 결정적 물증 (스모킹 건 / 핵심 증거물)
              </label>
              <input
                type="text"
                value={smokingGun}
                onChange={e => setSmokingGun(e.target.value)}
                placeholder="범인이 절대 반박할 수 없는 단 하나의 결정적 물증 (상단 터치 선택)"
                style={{
                  width: "100%", padding: "7px 10px", borderRadius: "6px",
                  backgroundColor: "#0d0b0a", border: "1px solid #2e2620",
                  color: "#fff", fontSize: "0.82rem", fontWeight: "800", outline: "none"
                }}
              />
            </div>

            {/* 슬롯 4: 탐정의 사건 전말 추리 해설 (풀 너비 textarea) */}
            <div style={{
              padding: "10px 12px", borderRadius: "10px", backgroundColor: "#171412",
              border: "1px solid #38312b", display: "flex", flexDirection: "column", gap: "4px"
            }}>
              <label style={{ fontSize: "0.72rem", fontWeight: "800", color: "#f59e0b" }}>
                4. 탐정의 사건 전말 추리 해설 (동기 및 타임라인)
              </label>
              <textarea
                rows={2}
                value={narrative}
                onChange={e => setNarrative(e.target.value)}
                placeholder="이 사건은 처음부터 피해자의 유산을 노린 계획 범행이었습니다..."
                style={{
                  width: "100%", padding: "7px 10px", borderRadius: "6px",
                  backgroundColor: "#0d0b0a", border: "1px solid #2e2620",
                  color: "#fff", fontSize: "0.82rem", lineHeight: "1.5", outline: "none", resize: "none"
                }}
              />
            </div>

          </div>

        </div>

        {/* 4. 하단 고발 액션 푸터 (괴담 모드 오렌지/앰버 액션 바 완벽 일치) */}
        <div style={{
          padding: isMobile ? "12px 16px" : "16px 24px",
          backgroundColor: "#181512",
          borderTop: "1px solid #2e2620",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: "12px", flexShrink: 0
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", color: isReady ? "#f59e0b" : "#78716c", fontWeight: "800", fontSize: "0.82rem" }}>
              <AlertCircle size={14} /> 결착(結着) 단계 전말 격발 준비
            </div>
            <span style={{ fontSize: "0.7rem", color: "#a8a29e" }}>
              선언 시 작성한 가설을 바탕으로 최후의 3단계 논리 공방이 시작됩니다.
            </span>
          </div>

          <button
            type="button"
            onClick={handleLaunchAccusation}
            disabled={!isReady}
            style={{
              padding: isMobile ? "11px 18px" : "13px 26px", borderRadius: "12px",
              backgroundColor: isReady ? "#ea580c" : "#292524",
              color: isReady ? "#fff" : "#78716c",
              border: "none",
              fontWeight: "900", fontSize: isMobile ? "0.88rem" : "0.95rem",
              cursor: isReady ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: "6px",
              boxShadow: isReady ? "0 4px 20px rgba(234, 88, 12, 0.4)" : "none",
              transition: "transform 0.15s ease",
              flexShrink: 0
            }}
            onMouseEnter={e => { if (isReady) e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { if (isReady) e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Scale size={16} />
            <span>⚖️ 결착 선언 : 전말 격발 ➔</span>
          </button>
        </div>

      </div>
    </div>
  );
}
