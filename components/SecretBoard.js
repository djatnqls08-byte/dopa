// components/SecretBoard.js
"use client";

import React, { useState } from "react";
import { 
  X, Pin, UserRound, FileText, Fingerprint, FileSearch, 
  Scale, Sparkles, RotateCcw, Crosshair, ChevronRight 
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

  // 4대 사건 전말 가설 슬롯 상태값
  const [culprit, setCulprit] = useState("");
  const [trick, setTrick] = useState("");
  const [smokingGun, setSmokingGun] = useState("");
  const [narrative, setNarrative] = useState("");

  // 상단 자료실 탭: "suspects"(용의자) | "clues"(단서/물증)
  const [activeTab, setActiveTab] = useState("suspects");
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
  const handleSelectClueAsTrick = (text) => {
    setTrick(prev => prev ? `${prev}, ${text}` : text);
    triggerSlotFeedback(2);
  };

  const triggerSlotFeedback = (slotNum) => {
    setLastInsertedSlot(slotNum);
    setTimeout(() => setLastInsertedSlot(null), 1200);
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

    // 완성된 고발문 생성
    const formattedAccusation = 
`[⚖️ 진상 결착 : 전말 격발]
• 지목 진범: ${culprit.trim()}
• 범행 수법: ${trick.trim() || "현장 알리바이 조작 및 계획적 범행"}
• 결정적 물증: ${smokingGun.trim()}
• 사건 전말: ${narrative.trim() || "수집된 단서와 알리바이 모순에 기반한 확정적 진상"}`;

    if (onDeclareMystery) {
      // payload 객체와 완성 텍스트를 함께 전달 (page.js 하위 호환 완벽 보장)
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
        backgroundColor: "rgba(5, 10, 20, 0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "12px" : "32px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "680px", height: "92vh", maxHeight: "860px",
          backgroundColor: "#0d131f",
          border: "1.5px solid rgba(56, 189, 248, 0.35)",
          borderRadius: "24px", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.85), 0 0 30px rgba(56, 189, 248, 0.12)",
          color: "#f1f5f9"
        }}
      >
        {/* 1. 상단 수사 본부 브리핑 헤더 */}
        <div style={{
          padding: isMobile ? "14px 16px" : "18px 22px",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              backgroundColor: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8"
            }}>
              <Pin size={18} style={{ transform: "rotate(45deg)" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: isMobile ? "0.95rem" : "1.05rem", fontWeight: "900", color: "#fff" }}>
                  사건 수사 전말 보드
                </span>
                <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: "4px", backgroundColor: "#0284c7", color: "#fff", fontWeight: "800" }}>
                  클라이맥스
                </span>
              </div>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                사건: 《{activeSession.title || "사건명 미상"}》 · 단서 {clues.length}건 · 관련자 {npcs.length}명
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button 
              type="button" 
              onClick={handleReset} 
              title="가설 초기화"
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "6px", display: "flex" }}
            >
              <RotateCcw size={17} />
            </button>
            <button 
              type="button" 
              onClick={onClose}
              style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. 본문 스크롤 영역 */}
        <div style={{
          flex: 1, minHeight: 0, overflowY: "auto", padding: isMobile ? "14px" : "20px",
          display: "flex", flexDirection: "column", gap: "16px",
          backgroundImage: "radial-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px)", backgroundSize: "22px 22px"
        }}>
          
          {/* 📂 [상단] 사건 자료실 (터치형 핀 덱) */}
          <div style={{
            backgroundColor: "rgba(15, 23, 42, 0.8)", borderRadius: "16px",
            border: "1px solid rgba(56, 189, 248, 0.25)", padding: "12px",
            display: "flex", flexDirection: "column", gap: "10px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "900", color: "#38bdf8", display: "flex", alignItems: "center", gap: "5px" }}>
                <Sparkles size={13} /> 사건 자료실 (터치 시 아래 슬롯에 자동 주입)
              </span>
              <div style={{ display: "flex", gap: "4px", backgroundColor: "rgba(0,0,0,0.3)", padding: "2px", borderRadius: "8px" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("suspects")}
                  style={{
                    padding: "4px 8px", borderRadius: "6px", border: "none", fontSize: "0.68rem", fontWeight: "800", cursor: "pointer",
                    backgroundColor: activeTab === "suspects" ? "#0284c7" : "transparent",
                    color: activeTab === "suspects" ? "#fff" : "#64748b"
                  }}
                >
                  용의자 ({npcs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("clues")}
                  style={{
                    padding: "4px 8px", borderRadius: "6px", border: "none", fontSize: "0.68rem", fontWeight: "800", cursor: "pointer",
                    backgroundColor: activeTab === "clues" ? "#0284c7" : "transparent",
                    color: activeTab === "clues" ? "#fff" : "#64748b"
                  }}
                >
                  물증·단서 ({clues.length})
                </button>
              </div>
            </div>

            {/* 용의자 타일 목록 */}
            {activeTab === "suspects" && (
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                {npcs.length === 0 ? (
                  <div style={{ padding: "16px", color: "#64748b", fontSize: "0.75rem" }}>등록된 용의자가 없습니다.</div>
                ) : (
                  npcs.map((npc, idx) => {
                    const isSelected = culprit === npc.name;
                    return (
                      <div 
                        key={npc.id || idx}
                        onClick={() => handleSelectSuspect(npc.name)}
                        style={{
                          minWidth: "105px", maxWidth: "115px", padding: "8px", borderRadius: "12px",
                          backgroundColor: isSelected ? "rgba(2, 132, 199, 0.28)" : "rgba(30, 41, 59, 0.7)",
                          border: `1.5px solid ${isSelected ? "#38bdf8" : "rgba(255,255,255,0.08)"}`,
                          cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                          transition: "all 0.15s ease", flexShrink: 0
                        }}
                      >
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", backgroundColor: "rgba(0,0,0,0.4)" }}>
                          {npc.portraitUrl || npc.portrait ? (
                            <img src={npc.portraitUrl || npc.portrait} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <UserRound size={22} color="#64748b" style={{ margin: "9px" }} />
                          )}
                        </div>
                        <div style={{ textAlign: "center", width: "100%" }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: "900", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {npc.name}
                          </div>
                          <div style={{ fontSize: "0.65rem", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {npc.job || "신분 미상"}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.62rem", color: isSelected ? "#38bdf8" : "#64748b", fontWeight: "800" }}>
                          {isSelected ? "✓ 진범 지정됨" : "+ 진범 꽂기"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 물증·단서 타일 목록 */}
            {activeTab === "clues" && (
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                {clues.length === 0 ? (
                  <div style={{ padding: "16px", color: "#64748b", fontSize: "0.75rem" }}>확보된 물증이나 단서가 없습니다.</div>
                ) : (
                  clues.map((item, idx) => {
                    const clueName = typeof item === "string" ? item : (item.name || item.title || "미확인 단서");
                    const clueDesc = typeof item === "object" ? (item.desc || item.overview || "") : "";
                    const isSelected = smokingGun === clueName;
                    return (
                      <div 
                        key={idx}
                        style={{
                          minWidth: "150px", maxWidth: "170px", padding: "9px", borderRadius: "12px",
                          backgroundColor: isSelected ? "rgba(245, 158, 11, 0.2)" : "rgba(30, 41, 59, 0.7)",
                          border: `1.5px solid ${isSelected ? "#f59e0b" : "rgba(255,255,255,0.08)"}`,
                          display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <Fingerprint size={13} color={isSelected ? "#f59e0b" : "#38bdf8"} />
                          <span style={{ fontSize: "0.8rem", fontWeight: "900", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {clueName}
                          </span>
                        </div>
                        {clueDesc && (
                          <span style={{ fontSize: "0.68rem", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.3" }}>
                            {clueDesc}
                          </span>
                        )}
                        <div style={{ display: "flex", gap: "4px", marginTop: "auto", paddingTop: "4px" }}>
                          <button
                            type="button"
                            onClick={() => handleSelectClueAsSmokingGun(clueName)}
                            style={{
                              flex: 1, padding: "3px 4px", borderRadius: "6px", border: "none", fontSize: "0.65rem", fontWeight: "800", cursor: "pointer",
                              backgroundColor: isSelected ? "#f59e0b" : "rgba(245, 158, 11, 0.25)",
                              color: isSelected ? "#000" : "#fbbf24"
                            }}
                          >
                            스모킹건
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectClueAsTrick(clueName)}
                            style={{
                              flex: 1, padding: "3px 4px", borderRadius: "6px", border: "none", fontSize: "0.65rem", fontWeight: "800", cursor: "pointer",
                              backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8"
                            }}
                          >
                            트릭 반영
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* 🎯 [하단] 사건 전말 재구성 4대 결착 슬롯 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "0.76rem", fontWeight: "900", color: "#94a3b8", marginLeft: "4px" }}>
              사건 전말 가설 수립 (상단 터치 또는 직접 타이핑 수정 가능)
            </span>

            {/* 슬롯 1: 지목할 진범 */}
            <div style={{
              padding: "10px 12px", borderRadius: "12px",
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              border: `1.5px solid ${lastInsertedSlot === 1 ? "#38bdf8" : "rgba(56, 189, 248, 0.3)"}`,
              transition: "border 0.3s ease", display: "flex", flexDirection: "column", gap: "4px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: "900", color: "#38bdf8", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Crosshair size={12} /> 1. 지목할 진범 (주모자)
                </span>
                <span style={{ fontSize: "0.62rem", color: "#64748b" }}>상단 용의자 터치 또는 직접 입력</span>
              </div>
              <input
                type="text"
                value={culprit}
                onChange={e => setCulprit(e.target.value)}
                placeholder="진범의 이름을 입력하거나 상단에서 선택하십시오."
                style={{
                  width: "100%", padding: "7px 10px", borderRadius: "8px",
                  backgroundColor: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: "0.82rem", fontWeight: "800", outline: "none"
                }}
              />
            </div>

            {/* 슬롯 2: 사용된 범행 수법 및 트릭 */}
            <div style={{
              padding: "10px 12px", borderRadius: "12px",
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              border: `1.5px solid ${lastInsertedSlot === 2 ? "#38bdf8" : "rgba(255,255,255,0.08)"}`,
              transition: "border 0.3s ease", display: "flex", flexDirection: "column", gap: "4px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: "900", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FileSearch size={12} color="#38bdf8" /> 2. 파훼할 범행 트릭 및 수법
                </span>
                <span style={{ fontSize: "0.62rem", color: "#64748b" }}>알리바이 조작 / 밀실 트릭 / 흉기 은닉</span>
              </div>
              <input
                type="text"
                value={trick}
                onChange={e => setTrick(e.target.value)}
                placeholder="예: 배전반을 차단해 시차를 조작하고 비상구로 도주함"
                style={{
                  width: "100%", padding: "7px 10px", borderRadius: "8px",
                  backgroundColor: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: "0.8rem", outline: "none"
                }}
              />
            </div>

            {/* 슬롯 3: 결정적 물증 (스모킹 건) */}
            <div style={{
              padding: "10px 12px", borderRadius: "12px",
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              border: `1.5px solid ${lastInsertedSlot === 3 ? "#f59e0b" : "rgba(245, 158, 11, 0.3)"}`,
              transition: "border 0.3s ease", display: "flex", flexDirection: "column", gap: "4px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: "900", color: "#fbbf24", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Fingerprint size={12} /> 3. 결정적 물증 (Smoking Gun)
                </span>
                <span style={{ fontSize: "0.62rem", color: "#64748b" }}>상단 단서 터치 또는 직접 입력</span>
              </div>
              <input
                type="text"
                value={smokingGun}
                onChange={e => setSmokingGun(e.target.value)}
                placeholder="범인이 절대 반박할 수 없는 단 하나의 결정적 물증"
                style={{
                  width: "100%", padding: "7px 10px", borderRadius: "8px",
                  backgroundColor: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: "0.82rem", fontWeight: "800", outline: "none"
                }}
              />
            </div>

            {/* 슬롯 4: 사건 전말 추리 해설 */}
            <div style={{
              padding: "10px 12px", borderRadius: "12px",
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              border: "1.5px solid rgba(255,255,255,0.08)",
              display: "flex", flexDirection: "column", gap: "4px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: "900", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Scale size={12} color="#38bdf8" /> 4. 탐정의 사건 전말 추리 해설
                </span>
                <span style={{ fontSize: "0.62rem", color: "#64748b" }}>범행 동기 및 종합 타임라인</span>
              </div>
              <textarea
                rows={2}
                value={narrative}
                onChange={e => setNarrative(e.target.value)}
                placeholder="이 사건은 처음부터 피해자의 유산을 노린 계획 살인이었습니다..."
                style={{
                  width: "100%", padding: "7px 10px", borderRadius: "8px",
                  backgroundColor: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: "0.8rem", lineHeight: "1.5", outline: "none", resize: "none"
                }}
              />
            </div>

          </div>

        </div>

        {/* 3. 하단 고발 격발 바 */}
        <div style={{
          padding: isMobile ? "12px 16px" : "14px 20px",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", gap: "10px", flexShrink: 0
        }}>
          <button
            type="button"
            onClick={handleLaunchAccusation}
            disabled={!isReady}
            style={{
              flex: 1, padding: "13px", borderRadius: "14px",
              backgroundColor: isReady ? "#0284c7" : "#1e293b",
              color: isReady ? "#fff" : "#64748b",
              border: `1px solid ${isReady ? "#38bdf8" : "transparent"}`,
              fontWeight: "900", fontSize: "0.92rem", cursor: isReady ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: isReady ? "0 4px 20px rgba(2, 132, 199, 0.45)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            <Scale size={18} />
            <span>⚖️ 진상 결착 : 전말 격발</span>
            <ChevronRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
