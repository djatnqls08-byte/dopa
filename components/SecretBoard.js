// 파일 위치: components/SecretBoard.js
"use client";

export default function SecretBoard({ activeSession, theme, isMobile, onClose, onDeclareMystery }) {
  // 세션 정보가 없으면 아무것도 안 그림 (에러 방어)
  if (!activeSession) return null;

  const npcs = activeSession.sheet?.npcs || [];
  const clues = activeSession.sheet?.clues || [];
  const items = activeSession.sheet?.items || [];
  const currentObjective = activeSession.sheet?.currentObjective;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "10px" : "20px",
        animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "760px",
          maxHeight: "88vh",
          backgroundColor: "#1c1917",
          backgroundImage: "radial-gradient(#292524 1.5px, transparent 1.5px)",
          backgroundSize: "16px 16px",
          border: "2px solid #78350f",
          borderRadius: "18px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), inset 0 0 50px rgba(0,0,0,0.6)",
          color: "#f5f5f4"
        }}
      >
        {/* 상단 헤더 바 */}
        <div style={{
          padding: "14px 20px",
          backgroundColor: "rgba(28, 25, 23, 0.96)",
          borderBottom: "1.5px solid #78350f",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.3rem" }}>📌</span>
            <div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "900", color: "#fef08a", letterSpacing: "-0.3px" }}>
                수사 본부 증거보드 (EVIDENCE BOARD)
              </h3>
              <div style={{ fontSize: "0.7rem", color: "#a8a29e", marginTop: "2px" }}>
                사건: 《{activeSession.title}》 · 확보 단서 {clues.length}건 · 관련자 {npcs.length}명
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#d6d3d1",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>

        {/* 보드 본문 스크롤 영역 */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: isMobile ? "14px" : "20px",
          display: "flex",
          flexDirection: "column",
          gap: "18px"
        }}>
          {/* 1. 당면 수사 목표 */}
          {currentObjective && (
            <div style={{
              backgroundColor: "#fef08a",
              color: "#451a03",
              padding: "12px 16px",
              borderRadius: "4px",
              boxShadow: "2px 4px 12px rgba(0,0,0,0.35)",
              transform: "rotate(-0.5deg)",
              position: "relative",
              borderLeft: "6px solid #eab308"
            }}>
              <span style={{ position: "absolute", top: "-8px", left: "50%", transform: "translateX(-50%)", fontSize: "1rem" }}>📍</span>
              <div style={{ fontSize: "0.7rem", fontWeight: "900", letterSpacing: "1px", color: "#854d0e" }}>CURRENT OBJECTIVE</div>
              <div style={{ fontSize: "0.92rem", fontWeight: "800", marginTop: "2px" }}>{currentObjective.main}</div>
              {currentObjective.step && (
                <div style={{ fontSize: "0.78rem", marginTop: "4px", color: "#713f12" }}>👉 {currentObjective.step}</div>
              )}
            </div>
          )}

          {/* 2. 용의자 & 관계자 카드 */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
              <span style={{ color: "#ef4444", fontSize: "0.9rem" }}>🔴</span>
              <span style={{ fontSize: "0.84rem", fontWeight: "800", color: "#e7e5e4" }}>용의자 및 인물 수사망 ({npcs.length}명)</span>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
              gap: "10px"
            }}>
              {npcs.map((npc, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#f5f5f4",
                    color: "#1c1917",
                    padding: "10px",
                    borderRadius: "4px",
                    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
                    position: "relative",
                    transform: idx % 2 === 0 ? "rotate(0.8deg)" : "rotate(-0.8deg)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                >
                  <div style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", fontSize: "0.9rem" }}>📍</div>
                  // SecretBoard.js 코드 내부입니다!
                <div style={{
                  width: "100%", aspectRatio: "1/1",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden"
                }}>
                  {/* 🌟 [수정] npc.portraitUrl 이 있으면 사진을 띄워줍니다! */}
                  {suspect.portraitUrl || suspect.portrait ? (
                    <img src={suspect.portraitUrl || suspect.portrait} alt="용의자" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <UserRound size={32} color="#4c1d95" />
                  )}
                </div>
                  <div style={{ textAlign: "center", marginTop: "2px" }}>
                    <div style={{ fontWeight: "900", fontSize: "0.85rem", color: "#1c1917" }}>{npc.name}</div>
                    <div style={{ fontSize: "0.68rem", color: "#78716c" }}>{npc.title || npc.job || "관계자"}</div>
                  </div>
                  {npc.statusMessage && (
                    <div style={{ fontSize: "0.68rem", color: "#44403c", backgroundColor: "#e7e5e4", padding: "4px 6px", borderRadius: "3px", lineHeight: "1.35", fontStyle: "italic" }}>
                      "{npc.statusMessage}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. 수집된 사건 파일 */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
              <span style={{ color: "#38bdf8", fontSize: "0.9rem" }}>📑</span>
              <span style={{ fontSize: "0.84rem", fontWeight: "800", color: "#e7e5e4" }}>확보된 증거 및 사건 파일 ({clues.length}건)</span>
            </div>

            {clues.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", backgroundColor: "rgba(255,255,255,0.03)", border: "1.5px dashed rgba(255,255,255,0.15)", borderRadius: "10px", color: "#78716c", fontSize: "0.78rem" }}>
                아직 수집된 결정적 증거가 없습니다. 현장 조사와 심문을 통해 물증을 확보하세요.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
                {clues.map((clue, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#e0f2fe" : "#fef3c7",
                      color: "#0f172a",
                      padding: "12px 14px",
                      borderRadius: "6px",
                      boxShadow: "2px 4px 10px rgba(0,0,0,0.3)",
                      position: "relative",
                      transform: idx % 2 === 0 ? "rotate(-0.6deg)" : "rotate(0.6deg)",
                      borderLeft: `5px solid ${idx % 2 === 0 ? "#0284c7" : "#d97706"}`
                    }}
                  >
                    <span style={{ position: "absolute", top: "-7px", right: "12px", fontSize: "0.85rem" }}>📌</span>
                    <div style={{ fontWeight: "900", fontSize: "0.84rem", color: idx % 2 === 0 ? "#0369a1" : "#b45309", marginBottom: "4px" }}>
                      {clue.name}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#334155", lineHeight: "1.55", wordBreak: "keep-all", whiteSpace: "pre-wrap" }}>
                      {clue.desc || "상세 내용 없음"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. 물증 보관함 */}
          {items.filter(it => it.name && it.name !== "소지품").length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                <span style={{ color: "#f87171", fontSize: "0.9rem" }}>💼</span>
                <span style={{ fontSize: "0.84rem", fontWeight: "800", color: "#e7e5e4" }}>
                  확보된 결정적 물증 ({items.filter(it => it.name && it.name !== "소지품").length}개)
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
                {items.filter(it => it.name && it.name !== "소지품").map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#fef2f2" : "#f5f3ff",
                      color: "#0f172a",
                      padding: "12px 14px",
                      borderRadius: "6px",
                      boxShadow: "2px 4px 10px rgba(0,0,0,0.3)",
                      position: "relative",
                      transform: idx % 2 === 0 ? "rotate(0.5deg)" : "rotate(-0.5deg)",
                      borderLeft: `5px solid ${idx % 2 === 0 ? "#ef4444" : "#8b5cf6"}`
                    }}
                  >
                    <span style={{ position: "absolute", top: "-7px", right: "12px", fontSize: "0.85rem" }}>📌</span>
                    <div style={{ fontWeight: "900", fontSize: "0.84rem", color: idx % 2 === 0 ? "#b91c1c" : "#6d28d9", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span>📦</span>
                      <span>{it.name}</span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#334155", lineHeight: "1.55", wordBreak: "keep-all", whiteSpace: "pre-wrap" }}>
                      {it.desc || "현장에서 입수한 주요 물증입니다."}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 하단 푸터: 3대 체크리스트 가이드 바 */}
        <div style={{
          padding: "14px 18px",
          backgroundColor: "rgba(28, 25, 23, 0.98)",
          borderTop: "1.5px solid #78350f",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: "10px",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "#fde047", display: "flex", alignItems: "center", gap: "5px" }}>
              <span>💡</span> <span>진상 추리 체크리스트</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#d6d3d1", lineHeight: "1.4" }}>
              ① <strong>진범 지목</strong> ➔ ② <strong>알리바이 & 결정적 물증 제시</strong> ➔ ③ <strong>트릭 해명</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={onDeclareMystery}
            style={{
              padding: "8px 18px",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: "900",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(220, 38, 38, 0.45)",
              whiteSpace: "nowrap",
              alignSelf: isMobile ? "stretch" : "auto"
            }}
          >
            ✍️ 추리 선언 ➔
          </button>
        </div>
      </div>
    </div>
  );
}
