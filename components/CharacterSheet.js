// components/CharacterSheet.js
"use client";

import React, { useState } from "react";
import { 
  X, BookOpen, Heart, UserRound, Lock, 
  Shield, Sparkles, Skull, Activity, Compass, Brain, Flame, Users,
  ChevronDown, ChevronUp, Package, Fingerprint, FileCheck
} from "lucide-react";

export default function CharacterSheet({ 
  activeSession, 
  isDarkMode, 
  isMobile, 
  isSheetOpen, 
  setIsSheetOpen, 
  theme, 
  setActivePortraitTarget, 
  setShowPortraitEditModal,
  onUseItem
}) {
  const [expandedNpcId, setExpandedNpcId] = useState(null);
  const [showBackstory, setShowBackstory] = useState(false);

  if (!isSheetOpen || !activeSession) return null;

  const sheet = activeSession.sheet || {};
  const npcs = sheet.npcs || [];
  
  // 소지품과 단서 분리
  const items = sheet.items || [];
  const clues = [
    ...(sheet.clues || []), 
    ...(sheet.handouts?.filter(h => h.revealed) || [])
  ];
  
  const hp = sheet.hp !== undefined ? sheet.hp : 100;
  const maxHp = sheet.maxHp || 100;
  const fatigue = sheet.fatigue !== undefined ? sheet.fatigue : (sheet.erosion || 0);

  // 🌟 모드 판별
  const isDating = activeSession.ruleMode?.startsWith("dating");
  const isHorror = activeSession.ruleMode === "horror";
  const isMystery = activeSession.ruleMode === "mystery" || (!isDating && !isHorror);

  const hpLabel = isDating ? "멘탈" : isHorror ? "정신력" : "수사관 신뢰도";
  const fatigueLabel = isDating ? "스트레스 지수" : isHorror ? "침식도" : "수사 피로도";

  // 🩸 괴담 모드 침식 심도(Depth) 단계 산출
  const getDepthInfo = (val) => {
    if (val >= 90) return { stage: 3, label: "심도 3: 붕괴", color: "#ef4444", bg: "rgba(239, 68, 68, 0.2)" };
    if (val >= 60) return { stage: 2, label: "심도 2: 착란", color: "#f87171", bg: "rgba(220, 38, 38, 0.15)" };
    if (val >= 30) return { stage: 1, label: "심도 1: 위화", color: "#fb923c", bg: "rgba(234, 88, 12, 0.15)" };
    return { stage: 0, label: "심도 0: 평정", color: "#a8a29e", bg: "rgba(255, 255, 255, 0.06)" };
  };

  const depthInfo = getDepthInfo(fatigue);

  // 🎲 괴담 모드 전용 6대 스탯
  const horrorStats = sheet.stats || {
    "관찰": sheet.stat_observation || 7,
    "추론": sheet.stat_reasoning || 6,
    "순발": sheet.stat_agility || 6,
    "체력": sheet.stat_strength || 6,
    "정신": sheet.stat_mental || 5,
    "사교": sheet.stat_social || 5,
  };

  const horrorStatIcons = {
    "관찰": Compass,
    "추론": Brain,
    "순발": Activity,
    "체력": Flame,
    "정신": Shield,
    "사교": Users,
  };

  // 🏷️ 괴담 모드 특성 및 트라우마
  const traits = Array.isArray(sheet.traits) ? sheet.traits : (sheet.positiveTraits ? [sheet.positiveTraits] : (sheet.trait ? [sheet.trait] : []));
  const traumas = Array.isArray(sheet.traumas) ? sheet.traumas : (sheet.trauma ? [sheet.trauma] : []);

  return (
    <>
      {/* 딤 오버레이 */}
      <div 
        onClick={() => setIsSheetOpen(false)} 
        style={{ position: "fixed", inset: 0, zIndex: 99990, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} 
      />

      {/* 시트 본체 드로어 */}
      <div style={{ 
        position: "fixed", top: 0, bottom: 0, right: 0, zIndex: 99999, 
        width: isMobile ? "100%" : "420px", 
        backgroundColor: theme.bg, 
        borderLeft: `1px solid ${theme.border}`, 
        boxShadow: "-10px 0 40px rgba(0,0,0,0.2)", 
        display: "flex", flexDirection: "column", 
        animation: "slideLeft 0.3s ease-out" 
      }}>
        
        {/* 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", backgroundColor: theme.panel, borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "900", color: theme.text }}>캐릭터 시트</span>
            {isHorror && (
              <span style={{ fontSize: "0.72rem", fontWeight: "800", padding: "3px 8px", borderRadius: "12px", backgroundColor: "rgba(220, 38, 38, 0.15)", color: "#ef4444", border: "1px solid rgba(220, 38, 38, 0.3)" }}>
                괴담 생존
              </span>
            )}
            {isMystery && (
              <span style={{ fontSize: "0.72rem", fontWeight: "800", padding: "3px 8px", borderRadius: "12px", backgroundColor: "rgba(2, 132, 199, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                본격 수사
              </span>
            )}
          </div>
          <button onClick={() => setIsSheetOpen(false)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer", padding: "4px" }}>
            <X size={26} strokeWidth={2.5} />
          </button>
        </div>

        {/* 바디 스크롤 영역 */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 20px 80px 20px", display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* 1. 주인공 프로필 카드 */}
          <div style={{ backgroundColor: theme.panel, borderRadius: "16px", padding: "18px", border: `1px solid ${theme.border}`, boxShadow: "0 8px 20px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "16px" }}>
            <div 
              onClick={(e) => { 
                e.stopPropagation();
                if (setActivePortraitTarget && setShowPortraitEditModal) { 
                  setActivePortraitTarget("pc"); 
                  setShowPortraitEditModal(true); 
                  setIsSheetOpen(false); 
                } 
              }} 
              style={{ width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${isMystery ? "#38bdf8" : theme.borderHighlight}`, backgroundColor: theme.inputBg, flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {sheet.portraitUrl || sheet.portrait ? (
                <img src={sheet.portraitUrl || sheet.portrait} alt="주인공" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <UserRound size={32} color={theme.textMuted} />
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "1.3rem", fontWeight: "900", color: theme.text }}>{sheet.name || "이름 미상"}</span>
                {isMystery && (
                  <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: "4px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: "800" }}>
                    담당 수사관
                  </span>
                )}
              </div>
              <span style={{ fontSize: "0.85rem", color: theme.textMuted, fontWeight: "600" }}>{sheet.job || (isMystery ? "탐정 / 수사관" : "직업 미상")}</span>
            </div>
          </div>

          {/* 2. 백스토리 & 비밀 아코디언 */}
          <div style={{ backgroundColor: theme.panel, borderRadius: "14px", border: `1px solid ${theme.border}`, overflow: "hidden", flexShrink: 0 }}>
            <button 
              type="button"
              onClick={() => setShowBackstory(!showBackstory)} 
              style={{ width: "100%", padding: "14px 18px", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: theme.text }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <BookOpen size={18} strokeWidth={2.5} color={isMystery ? "#38bdf8" : theme.accent} />
                <span style={{ fontWeight: "800", fontSize: "0.9rem", color: theme.text }}>내 캐릭터 백스토리 & 비밀</span>
              </div>
              {showBackstory ? <ChevronUp size={18} color={theme.textMuted} /> : <ChevronDown size={18} color={theme.textMuted} />}
            </button>
            {showBackstory && (
              <div style={{ padding: "0 18px 18px 18px", fontSize: "0.85rem", color: theme.text, lineHeight: "1.6", whiteSpace: "pre-wrap", borderTop: `1px dashed ${theme.border}`, paddingTop: "14px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontWeight: "800", color: isMystery ? "#38bdf8" : theme.accent, display: "block", marginBottom: "4px" }}>■ 배경 및 성격</span>
                  {sheet.background || "기록된 배경 설정이 없습니다."}
                </div>
                {sheet.secret && (
                  <div style={{ backgroundColor: isDarkMode ? "rgba(220, 38, 38, 0.1)" : "#fef2f2", color: theme.danger, padding: "12px", borderRadius: "10px", border: `1px solid rgba(220, 38, 38, 0.3)` }}>
                    <strong style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}><Lock size={14} /> 나의 비밀 / 약점</strong>
                    {sheet.secret}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. 멘탈/정신력/신뢰도(HP) & 침식도/피로도 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* HP / 신뢰도 바 */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px",
              backgroundColor: isMystery 
                ? (hp <= 35 ? "rgba(239, 68, 68, 0.15)" : "rgba(2, 132, 199, 0.12)")
                : (isDarkMode ? "rgba(34, 197, 94, 0.15)" : "#dcfce7"),
              border: `1px solid ${isMystery ? (hp <= 35 ? "rgba(239, 68, 68, 0.4)" : "rgba(56, 189, 248, 0.35)") : "rgba(34, 197, 94, 0.4)"}`,
              borderRadius: "12px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: "800", fontSize: "0.95rem", color: isMystery ? (hp <= 35 ? "#ef4444" : "#38bdf8") : "#16a34a" }}>
                  {hpLabel}
                </span>
                {isMystery && hp <= 35 && (
                  <span style={{ fontSize: "0.68rem", fontWeight: "900", padding: "1px 5px", borderRadius: "4px", backgroundColor: "#ef4444", color: "#fff" }}>
                    신뢰 실추 위기
                  </span>
                )}
              </div>
              <span style={{ fontWeight: "900", fontSize: "1.1rem", color: isMystery ? (hp <= 35 ? "#ef4444" : "#38bdf8") : "#16a34a" }}>
                {hp} / {maxHp}
              </span>
            </div>

            {/* 피로도 / 침식도 바 */}
            <div style={{
              display: "flex", flexDirection: "column", gap: "8px", padding: "14px 18px",
              backgroundColor: isMystery 
                ? (fatigue >= 80 ? "rgba(239, 68, 68, 0.12)" : "rgba(30, 41, 59, 0.6)")
                : (isDarkMode ? "rgba(220, 38, 38, 0.12)" : "#fee2e2"),
              border: `1px solid ${isMystery ? (fatigue >= 80 ? "rgba(239, 68, 68, 0.35)" : "rgba(255, 255, 255, 0.08)") : "rgba(220, 38, 38, 0.35)"}`,
              borderRadius: "12px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: "800", fontSize: "0.95rem", color: isMystery ? (fatigue >= 80 ? "#ef4444" : "#94a3b8") : depthInfo.color }}>
                    {fatigueLabel}
                  </span>
                  {isHorror && (
                    <span style={{ fontSize: "0.72rem", fontWeight: "800", padding: "2px 8px", borderRadius: "6px", backgroundColor: depthInfo.bg, color: depthInfo.color, border: `1px solid ${depthInfo.color}40` }}>
                      {depthInfo.label}
                    </span>
                  )}
                  {isMystery && (
                    <span style={{
                      fontSize: "0.7rem", fontWeight: "800", padding: "2px 7px", borderRadius: "6px",
                      backgroundColor: fatigue >= 80 ? "rgba(239, 68, 68, 0.2)" : fatigue >= 50 ? "rgba(245, 158, 11, 0.15)" : "rgba(56, 189, 248, 0.15)",
                      color: fatigue >= 80 ? "#ef4444" : fatigue >= 50 ? "#f59e0b" : "#38bdf8"
                    }}>
                      {fatigue >= 80 ? "과열 상태" : fatigue >= 50 ? "주의 요망" : "안정"}
                    </span>
                  )}
                </div>
                <span style={{ fontWeight: "900", fontSize: "1.1rem", color: isMystery ? (fatigue >= 80 ? "#ef4444" : "#94a3b8") : depthInfo.color }}>
                  {fatigue}%
                </span>
              </div>
              <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(0, 0, 0, 0.3)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  width: `${Math.min(100, Math.max(0, fatigue))}%`, height: "100%",
                  backgroundColor: isMystery ? (fatigue >= 80 ? "#ef4444" : fatigue >= 50 ? "#f59e0b" : "#0284c7") : depthInfo.color,
                  transition: "width 0.4s ease"
                }} />
              </div>
            </div>
          </div>

          {/* 4. [괴담 모드 전용] 6대 스탯 그리드 (35pt 분배) */}
          {isHorror && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: "4px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.textMuted }}>행동 능력치 (총 35pt)</span>
                <span style={{ fontSize: "0.72rem", color: theme.textMuted }}>기준치 = 11 - 스탯</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {Object.entries(horrorStats).map(([name, val]) => {
                  const Icon = horrorStatIcons[name] || Activity;
                  const targetNum = Math.max(2, 11 - Number(val));
                  return (
                    <div key={name} style={{ backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: theme.textMuted }}>
                        <Icon size={14} />
                        <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>{name}</span>
                      </div>
                      <span style={{ fontSize: "1.2rem", fontWeight: "900", color: theme.text }}>{val}</span>
                      <span style={{ fontSize: "0.68rem", color: theme.accent, fontWeight: "700" }}>목표 {targetNum}+</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. [괴담 모드 전용] 긍정 특성 & 트라우마 태그 */}
          {isHorror && (traits.length > 0 || traumas.length > 0) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.textMuted, paddingLeft: "4px" }}>특성 및 트라우마</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {traits.map((t, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "800", backgroundColor: "rgba(16, 185, 129, 0.12)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                    <Sparkles size={12} /> {t} (-1 보정)
                  </span>
                ))}
                {traumas.map((tr, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "800", backgroundColor: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                    <Skull size={12} /> {tr} (+1 패널티)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 6. 소지품 및 수사 도구 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: theme.textMuted, paddingLeft: "4px" }}>
              <Package size={16} strokeWidth={2.5} color={isMystery ? "#38bdf8" : undefined} />
              <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>
                {isMystery ? `수사 도구 및 소지품 (${items.length}개)` : `소지품 및 생존 도구 (${items.length}개)`}
              </span>
            </div>
            {items.length === 0 ? (
              <div style={{ padding: "18px", textAlign: "center", backgroundColor: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px dashed ${theme.borderHighlight}`, borderRadius: "12px", color: theme.textMuted, fontSize: "0.82rem" }}>
                소지품이 비어 있습니다.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ padding: "12px 16px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, paddingRight: "10px" }}>
                      <span style={{ fontWeight: "800", fontSize: "0.9rem", color: isMystery ? "#38bdf8" : "#ea580c" }}>
                        • {item.name}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: theme.textMuted, lineHeight: "1.4" }}>
                        {item.desc || (item.type === "멘탈 회복" ? "신뢰도 회복 도구" : "상황 타개용 아이템")}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { if (onUseItem) onUseItem(item); }}
                      style={{
                        padding: "6px 14px", borderRadius: "8px",
                        backgroundColor: isMystery ? "#0284c7" : "#ea580c",
                        color: "#fff", border: "none", fontSize: "0.78rem", fontWeight: "800", cursor: "pointer", flexShrink: 0
                      }}
                    >
                      사용
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. 확보된 사건 단서 & 감식 물증 */}
          {clues.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: "4px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: isMystery ? "#38bdf8" : theme.textMuted }}>
                  {isMystery ? `사건 감식록 및 단서 (${clues.length}건)` : `확보된 단서 (${clues.length}건)`}
                </span>
                {isMystery && (
                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>
                    증거품 서랍에서 반증으로 제시 가능
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {clues.map((clue, idx) => (
                  <div key={idx} style={{
                    padding: "12px 14px", backgroundColor: theme.panel,
                    border: `1px solid ${isMystery ? "rgba(56, 189, 248, 0.25)" : theme.border}`,
                    borderRadius: "12px", display: "flex", flexDirection: "column", gap: "4px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: "900", fontSize: "0.88rem", color: isMystery ? "#f8fafc" : theme.text, display: "flex", alignItems: "center", gap: "5px" }}>
                        {isMystery && <FileCheck size={14} color="#38bdf8" />}
                        {clue.name || clue.title}
                      </div>
                      {isMystery && (
                        <span style={{ fontSize: "0.65rem", padding: "1px 5px", borderRadius: "4px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: "800" }}>
                          물증
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.76rem", color: theme.textMuted, lineHeight: "1.4" }}>
                      {clue.desc || clue.overview || clue.detail}
                    </div>
                    {/* 모순 힌트 */}
                    {clue.contradiction && (
                      <div style={{ marginTop: "4px", fontSize: "0.72rem", color: "#f87171", padding: "4px 8px", borderRadius: "6px", backgroundColor: "rgba(220, 38, 38, 0.1)" }}>
                        ⚠ 모순 실마리: {clue.contradiction}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. 용의자 및 사건 관계자 수사망 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: theme.textMuted, paddingLeft: "4px" }}>
              <UserRound size={16} strokeWidth={2.5} color={isMystery ? "#38bdf8" : undefined} />
              <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>
                {isMystery ? `용의자 및 사건 관계자 (${npcs.length}명)` : `동행자 및 주요 인물 (${npcs.length}명)`}
              </span>
            </div>
            {npcs.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", backgroundColor: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px dashed ${theme.borderHighlight}`, borderRadius: "12px", color: theme.textMuted, fontSize: "0.85rem" }}>
                등록된 인물이 없습니다.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {npcs.map((npc) => {
                  const isExpanded = expandedNpcId === npc.id;
                  const aff = npc.affection || 0;
                  const fillPercent = Math.max(0, Math.min(100, aff));
                  
                  return (
                    <div 
                      key={npc.id} 
                      style={{ 
                        backgroundColor: theme.panel, 
                        border: `1.5px solid ${npc.isPartner ? "#ea580c" : (isMystery ? "rgba(56, 189, 248, 0.2)" : theme.border)}`, 
                        borderRadius: "16px", overflow: "hidden", transition: "all 0.2s" 
                      }}
                    >
                      {/* 카드 바디 */}
                      <div onClick={() => setExpandedNpcId(isExpanded ? null : npc.id)} style={{ display: "flex", alignItems: "center", padding: "16px", cursor: "pointer" }}>
                        
                        <div 
                          onClick={(e) => { 
                            e.stopPropagation();
                            if (setActivePortraitTarget && setShowPortraitEditModal) { 
                              setActivePortraitTarget(npc.id); 
                              setShowPortraitEditModal(true); 
                              setIsSheetOpen(false); 
                            } 
                          }} 
                          style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: theme.inputBg, border: `1px solid ${theme.borderHighlight}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}
                        >
                          {npc.portraitUrl ? <img src={npc.portraitUrl} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={24} color={theme.textMuted} />}
                        </div>
                        
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: "14px", gap: "2px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "1.05rem", fontWeight: "900", color: theme.text }}>{npc.name || "이름 미상"}</span>
                            {npc.isPartner && (
                              <span style={{ fontSize: "0.65rem", fontWeight: "900", padding: "2px 6px", borderRadius: "6px", backgroundColor: "#ea580c", color: "#fff" }}>
                                메인 파트너
                              </span>
                            )}
                            {isHorror && npc.specialty && (
                              <span style={{ fontSize: "0.68rem", fontWeight: "800", padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
                                {npc.specialty}
                              </span>
                            )}
                            {isMystery && (
                              <span style={{ fontSize: "0.65rem", fontWeight: "800", padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
                                {npc.role || "수사 대상"}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "600" }}>{npc.job || "직업 미상"}</span>
                        </div>
                        
                        {/* 수사 협조도 / 호감도 하트 게이지 */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.1)" : "#fef2f2", padding: "6px 12px", borderRadius: "20px" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <defs>
                              <linearGradient id={`heartGrad-${npc.id}`} x1="0" y1="1" x2="0" y2="0">
                                <stop offset={`${fillPercent}%`} stopColor={isMystery ? "#38bdf8" : "#ef4444"} />
                                <stop offset={`${fillPercent}%`} stopColor={isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(148, 163, 184, 0.4)"} />
                              </linearGradient>
                            </defs>
                            <path fill={`url(#heartGrad-${npc.id})`} stroke={isMystery ? "#38bdf8" : "#ef4444"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          <span style={{ fontWeight: "900", color: isMystery ? "#38bdf8" : "#ef4444", fontSize: "0.95rem" }}>{aff}</span>
                        </div>
                      </div>
                      
                      {/* 아코디언 상세 정보 */}
                      {isExpanded && (
                        <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)", padding: "16px", borderTop: `1px solid ${theme.border}` }}>
                          <div style={{ fontSize: "0.85rem", color: theme.text, lineHeight: "1.6", whiteSpace: "pre-wrap", marginBottom: "12px", fontWeight: "500" }}>
                            {npc.behavior || "등록된 상세 설정이 없습니다."}
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", padding: "12px", borderRadius: "10px", border: `1px dashed ${theme.borderHighlight}` }}>
                            <Lock size={16} color={theme.textMuted} style={{ marginTop: "2px", flexShrink: 0 }} />
                            <div style={{ fontSize: "0.8rem", color: theme.textMuted, lineHeight: "1.5" }}>
                              {npc.secretRevealed ? (
                                <span style={{ color: theme.text }}><strong style={{ color: isMystery ? "#38bdf8" : theme.accent }}>[밝혀진 알리바이/비밀]</strong> {npc.secret}</span>
                              ) : (
                                <span><strong style={{ color: theme.danger }}>[숨겨진 알리바이/의혹]</strong> 아직 심문과 수사를 통해 밝혀지지 않은 비밀입니다.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
