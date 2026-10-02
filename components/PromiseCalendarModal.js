// components/PromiseCalendarModal.js
"use client";

import React, { useState } from "react";
import { 
  X, Calendar as CalendarIcon, Heart, Clock, MapPin, 
  UserRound, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Sparkles 
} from "lucide-react";

export default function PromiseCalendarModal({
  isOpen,
  onClose,
  activeSession,
  theme,
  isDarkMode = true,
  isMobile = false,
  onSelectPromise // 약속 터치 시 대화창에 동선 입력/이동 연동 콜백
}) {
  if (!isOpen || !activeSession) return null;

  const sheet = activeSession.sheet || {};
  const currentDay = Number(sheet.currentDay || sheet.day || 1);
  const currentPhase = sheet.currentPhase || sheet.phase || "낮";
  const npcs = sheet.npcs || [];

  // 약속 데이터 추출 (시트 또는 세션 직속)
  const rawPromises = sheet.promises || activeSession.promises || [];

  // 선택된 캘린더 날짜 (기본값: 오늘 Day)
  const [selectedDay, setSelectedDay] = useState(currentDay);

  // 미니 달력 날짜 목록 (기본 7일 기준)
  const totalDays = Math.max(7, currentDay + 3);
  const dayPills = Array.from({ length: totalDays }, (_, i) => i + 1);

  // 날짜별 약속 분류 및 상대 시간(D-Day) 동적 연산
  const calculatePromiseMeta = (p) => {
    const targetDay = Number(p.targetDay || p.day || currentDay);
    const diff = targetDay - currentDay;

    let badgeText = "D-DAY";
    let badgeType = "today"; // today, upcoming, past, done

    if (p.status === "done" || p.fulfilled) {
      badgeText = "DONE ✓";
      badgeType = "done";
    } else if (p.status === "broken" || diff < 0) {
      badgeText = diff < 0 ? `D+${Math.abs(diff)} 💔` : "기약 파기";
      badgeType = "broken";
    } else if (diff === 0) {
      badgeText = "D-DAY";
      badgeType = "today";
    } else {
      badgeText = `D-${diff}`;
      badgeType = "upcoming";
    }

    // NPC 초상화 탐색
    const matchedNpc = npcs.find(n => n.name === (p.targetNpc || p.npcName));
    const portraitUrl = p.portraitUrl || matchedNpc?.portraitUrl || matchedNpc?.portrait;

    return {
      ...p,
      targetDay,
      diff,
      badgeText,
      badgeType,
      portraitUrl,
      isToday: diff === 0
    };
  };

  const processedPromises = rawPromises.map(calculatePromiseMeta);

  // 현재 선택된 날짜의 약속들 (선택 날짜에 약속이 없으면 전체 예정 목록 노출 옵션 제공)
  const filteredPromises = processedPromises.filter(p => p.targetDay === selectedDay);

  // 동글이 D-Day 젤리 뱃지 스타일 헬퍼
  const getBadgeStyle = (type) => {
    switch (type) {
      case "today":
        return {
          backgroundColor: "#f43f5e",
          color: "#ffffff",
          boxShadow: "0 0 14px rgba(244, 63, 94, 0.45)",
          border: "1px solid #fda4af",
          animation: "pulse 2s infinite"
        };
      case "upcoming":
        return {
          backgroundColor: "rgba(245, 158, 11, 0.2)",
          color: "#fbbf24",
          border: "1px solid rgba(245, 158, 11, 0.45)"
        };
      case "broken":
        return {
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          color: "#f87171",
          border: "1px dashed rgba(239, 68, 68, 0.4)"
        };
      case "done":
        return {
          backgroundColor: "rgba(16, 185, 129, 0.18)",
          color: "#34d399",
          border: "1px solid rgba(16, 185, 129, 0.4)"
        };
      default:
        return {
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          color: "#d6d3d1",
          border: "1px solid rgba(255, 255, 255, 0.15)"
        };
    }
  };

  const handleCardClick = (p) => {
    if (onSelectPromise) {
      onSelectPromise(p);
      onClose();
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99998,
        backgroundColor: "rgba(10, 8, 8, 0.82)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "12px" : "20px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "680px", maxHeight: "90vh",
          backgroundColor: isDarkMode ? "#141110" : "#fff",
          border: "1.5px solid rgba(244, 63, 94, 0.35)",
          borderRadius: "24px", display: "flex", flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(244, 63, 94, 0.12)",
          overflow: "hidden", color: theme?.text || "#fff"
        }}
      >
        {/* 1. 상단 모달 헤더 */}
        <div style={{
          padding: isMobile ? "16px 18px" : "18px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px dashed rgba(255, 255, 255, 0.1)",
          backgroundColor: isDarkMode ? "rgba(24, 20, 18, 0.7)" : "#fdf8f6",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "12px",
              backgroundColor: "rgba(244, 63, 94, 0.15)", border: "1.5px solid rgba(244, 63, 94, 0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#f43f5e"
            }}>
              <CalendarIcon size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f43f5e", fontWeight: "900", fontSize: isMobile ? "1.02rem" : "1.18rem" }}>
                기약 수첩 (PROMISE CALENDAR)
              </div>
              <div style={{ fontSize: "0.76rem", color: theme?.textMuted || "#a8a29e", marginTop: "2px", fontWeight: "600" }}>
                현재 시점: [Day {currentDay} · {currentPhase}] · 예정된 기약 {processedPromises.filter(p => p.badgeType !== "done").length}건
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            style={{
              width: "34px", height: "34px", borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.06)", border: "none",
              color: theme?.textMuted || "#a8a29e", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. 주간 미니 타임라인 캘린더 바 */}
        <div style={{
          padding: isMobile ? "12px 14px" : "14px 20px",
          backgroundColor: isDarkMode ? "#1a1614" : "#fbf2ee",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "#f43f5e", display: "flex", alignItems: "center", gap: "5px" }}>
              <Heart size={14} fill="#f43f5e" /> 타임라인 날짜 선택
            </span>
            <span style={{ fontSize: "0.72rem", color: "#a8a29e" }}>
              날짜를 터치하면 해당 일자의 약속이 필터링됩니다.
            </span>
          </div>

          {/* 일자별 원형/알약 버튼 덱 */}
          <div style={{
            display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px",
            WebkitOverflowScrolling: "touch"
          }}>
            {dayPills.map(dayNum => {
              const isToday = dayNum === currentDay;
              const isSelected = dayNum === selectedDay;
              const hasPromise = processedPromises.some(p => p.targetDay === dayNum);

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => setSelectedDay(dayNum)}
                  style={{
                    flex: isMobile ? "0 0 54px" : "0 0 62px",
                    padding: "8px 4px", borderRadius: "14px",
                    backgroundColor: isSelected 
                      ? "#f43f5e" 
                      : (isToday ? "rgba(244, 63, 94, 0.15)" : "rgba(255,255,255,0.04)"),
                    border: isSelected 
                      ? "1.5px solid #f43f5e" 
                      : (isToday ? "1.5px solid rgba(244, 63, 94, 0.5)" : "1px solid rgba(255,255,255,0.08)"),
                    color: isSelected ? "#fff" : (isToday ? "#f43f5e" : "#d6d3d1"),
                    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                    boxShadow: isSelected ? "0 4px 14px rgba(244, 63, 94, 0.4)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span style={{ fontSize: "0.66rem", fontWeight: "700", opacity: 0.85 }}>
                    {isToday ? "오늘" : `Day`}
                  </span>
                  <span style={{ fontSize: "1.05rem", fontWeight: "900" }}>
                    {dayNum}
                  </span>
                  {hasPromise && (
                    <span style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      backgroundColor: isSelected ? "#fff" : "#f43f5e",
                      marginTop: "1px"
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 본문: 선택된 일자 약속 카드 리스트 */}
        <div style={{
          flex: 1, minHeight: 0, overflowY: "auto", padding: isMobile ? "14px" : "20px",
          display: "flex", flexDirection: "column", gap: "14px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#f5f5f4" }}>
              📌 Day {selectedDay} 약속 리스트 ({filteredPromises.length}건)
            </span>
            {selectedDay !== currentDay && (
              <button
                type="button"
                onClick={() => setSelectedDay(currentDay)}
                style={{
                  background: "none", border: "none", color: "#f43f5e",
                  fontSize: "0.75rem", fontWeight: "700", cursor: "pointer"
                }}
              >
                오늘(Day {currentDay})로 돌아가기
              </button>
            )}
          </div>

          {filteredPromises.length === 0 ? (
            <div style={{
              padding: "40px 20px", textAlign: "center",
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1.5px dashed rgba(255,255,255,0.1)", borderRadius: "18px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"
            }}>
              <CalendarIcon size={32} color="#78716c" />
              <div style={{ color: "#a8a29e", fontSize: "0.88rem", fontWeight: "600" }}>
                Day {selectedDay}에는 예정된 약속이 없습니다.
              </div>
              <span style={{ color: "#78716c", fontSize: "0.76rem" }}>
                상대방과의 대면 대화나 메신저 서신을 통해 둘만의 시간과 장소를 약속해 보세요.
              </span>
            </div>
          ) : (
            filteredPromises.map((p, idx) => (
              <div
                key={p.id || idx}
                style={{
                  backgroundColor: isDarkMode ? "#1c1816" : "#fdfbf9",
                  border: `1.5px solid ${p.badgeType === "today" ? "rgba(244, 63, 94, 0.45)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "18px", padding: isMobile ? "14px" : "18px",
                  display: "flex", flexDirection: "column", gap: "10px",
                  boxShadow: p.badgeType === "today" ? "0 8px 24px rgba(244, 63, 94, 0.15)" : "0 4px 14px rgba(0,0,0,0.25)"
                }}
              >
                {/* 카드 상단: 뱃지 및 인물 정보 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "42px", height: "42px", borderRadius: "12px",
                      overflow: "hidden", backgroundColor: "#292524",
                      border: "1px solid rgba(255,255,255,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      {p.portraitUrl ? (
                        <img src={p.portraitUrl} alt={p.targetNpc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <UserRound size={22} color="#a8a29e" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: "900", fontSize: "0.98rem", color: "#f5f5f4" }}>
                        {p.targetNpc || "인연 대상"}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#a8a29e", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <Clock size={12} /> {p.targetPhase || "시간대 미상"} · <MapPin size={12} /> {p.location || "장소 미정"}
                      </div>
                    </div>
                  </div>

                  {/* 젤리 D-Day 뱃지 */}
                  <span style={{
                    padding: "4px 12px", borderRadius: "20px",
                    fontSize: "0.76rem", fontWeight: "900", letterSpacing: "0.3px",
                    ...getBadgeStyle(p.badgeType)
                  }}>
                    {p.badgeText}
                  </span>
                </div>

                {/* 약속 타이틀 및 대화 메모 */}
                <div style={{
                  padding: "10px 12px", borderRadius: "10px",
                  backgroundColor: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.04)",
                  display: "flex", flexDirection: "column", gap: "4px"
                }}>
                  <div style={{ fontWeight: "800", fontSize: "0.88rem", color: "#fda4af" }}>
                    {p.title || "둘만의 기약"}
                  </div>
                  {p.memo && (
                    <div style={{ fontSize: "0.8rem", color: "#d6d3d1", lineHeight: "1.45" }}>
                      "{p.memo}"
                    </div>
                  )}
                </div>

                {/* 💔 파기/바람맞힘 시 상대방의 서운한 심리 상태 힌트 */}
                {p.reflection && (
                  <div style={{
                    fontSize: "0.74rem", color: "#f87171", backgroundColor: "rgba(239, 68, 68, 0.08)",
                    padding: "6px 10px", borderRadius: "8px", border: "1px dashed rgba(239, 68, 68, 0.25)"
                  }}>
                    ⚠️️ {p.reflection}
                  </div>
                )}

                {/* 오늘 약속일 경우 하단 행동 바로가기 버튼 */}
                {p.badgeType === "today" && (
                  <button
                    type="button"
                    onClick={() => handleCardClick(p)}
                    style={{
                      marginTop: "2px", padding: "9px 12px", borderRadius: "10px",
                      backgroundColor: "rgba(244, 63, 94, 0.18)", border: "1px solid rgba(244, 63, 94, 0.4)",
                      color: "#fda4af", fontSize: "0.8rem", fontWeight: "800", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Sparkles size={14} />
                    <span>약속 장소({p.location || "약속 장소"})로 발걸음 옮기기</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* 4. 하단 닫기 푸터 */}
        <div style={{
          padding: isMobile ? "12px 16px" : "14px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: isDarkMode ? "rgba(16, 14, 13, 0.9)" : "#fff",
          display: "flex", justifyContent: "flex-end", flexShrink: 0
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 20px", borderRadius: "10px",
              backgroundColor: "rgba(255,255,255,0.08)", border: "none",
              color: "#d6d3d1", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer"
            }}
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
}
