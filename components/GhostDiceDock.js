"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dices, Sparkles, Skull, AlertTriangle, ShieldAlert } from "lucide-react";

// ── [1. Web Audio API 초저음 심장 박동 합성 엔진 (외부 음원 0바이트)] ──
let audioCtx = null;

export const playHeartbeatSound = () => {
  try {
    if (typeof window === "undefined") return;
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    const playSingleBeat = (time, freq, gainVal, duration) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(25, time + duration);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(gainVal, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(time);
      osc.stop(time + duration);
    };

    // 쿵... 쾅... (2연타 심장 수축)
    playSingleBeat(now, 48, 0.12, 0.22);
    playSingleBeat(now + 0.13, 40, 0.14, 0.28);
  } catch (e) {
    console.warn("오디오 재생 불가:", e);
  }
};

// ── [2. 스마트폰 햅틱 진동 트리거] ──
export const triggerHapticPulse = () => {
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([50, 70, 110]);
    } catch (e) {
      // 일부 브라우저 진동 제한 무시
    }
  }
};

// ── [3. 메인 GhostDiceDock 컴포넌트] ──
export default function GhostDiceDock({
  rollRequest,       // AI가 요청한 판정 데이터 { stat: "순발", target: 5, reason: "..." }
  characterSheet,    // 플레이어 시트 정보 (스탯, 특성, 트라우마)
  onRollComplete,    // 주사위 판정 완료 콜백 (resultData를 넘김)
  onCancelRoll,      // 판정 취소 또는 닫기
  theme,             // 메인 테마 객체
  isDarkMode = true
}) {
  const [selectedStat, setSelectedStat] = useState("순발");
  const [useTrait, setUseTrait] = useState(false);
  const [useTrauma, setUseTrauma] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  // 시트에서 스탯 값 안전 추출
  const stats = characterSheet?.stats || {
    "관찰": characterSheet?.stat_observation || 7,
    "추론": characterSheet?.stat_reasoning || 6,
    "순발": characterSheet?.stat_agility || 6,
    "체력": characterSheet?.stat_strength || 6,
    "정신": characterSheet?.stat_mental || 5,
    "사교": characterSheet?.stat_social || 5,
  };

  // AI의 굴림 요청이 변경될 때 기본 스탯 동기화
  useEffect(() => {
    if (rollRequest?.stat && stats[rollRequest.stat] !== undefined) {
      setSelectedStat(rollRequest.stat);
    }
  }, [rollRequest]);

  // 기준치 계산 공식: 11 - 스탯 (-1 긍정특성, +1 트라우마)
  const statVal = Number(stats[selectedStat] || 5);
  const baseTarget = Math.max(2, 11 - statVal);
  let finalTarget = baseTarget;
  if (useTrait) finalTarget -= 1;
  if (useTrauma) finalTarget += 1;
  finalTarget = Math.max(2, Math.min(9, finalTarget));

  // 주사위 굴림 실행
  const executeRoll = () => {
    if (isRolling) return;
    setIsRolling(true);

    // 0.4초간 가벼운 햅틱 & 회전 대기
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }

    setTimeout(() => {
      const diceRoll = Math.floor(Math.random() * 10) + 1;
      const isCritSuccess = diceRoll === 10;
      const isCritFail = diceRoll === 1;
      const isSuccess = isCritSuccess || (!isCritFail && diceRoll >= finalTarget);

      // 실패 시 3중 감각 발동!
      if (!isSuccess) {
        playHeartbeatSound();
        triggerHapticPulse();
      }

      const rollPayload = {
        stat: selectedStat,
        statVal: statVal,
        roll: diceRoll,
        target: finalTarget,
        isSuccess,
        isCritSuccess,
        isCritFail,
        useTrait,
        useTrauma,
        reason: rollRequest?.reason || "행동 판정"
      };

      setIsRolling(false);
      if (onRollComplete) {
        onRollComplete(rollPayload);
      }
    }, 450);
  };

  if (!rollRequest) return null;

  return (
    <div style={{
      margin: "0 12px 10px",
      padding: "12px 16px",
      backgroundColor: isDarkMode ? "rgba(24, 21, 18, 0.95)" : "rgba(255, 255, 255, 0.98)",
      border: "1.5px solid rgba(234, 88, 12, 0.5)",
      borderRadius: "16px",
      boxShadow: "0 8px 24px rgba(234, 88, 12, 0.2)",
      backdropFilter: "blur(12px)",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      animation: "slideUp 0.25s ease-out"
    }}>
      {/* 상단: 위기 판정 타이틀 & 이유 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <AlertTriangle size={15} color="#ea580c" />
          <span style={{ fontSize: "0.82rem", fontWeight: "900", color: "#ea580c", letterSpacing: "-0.2px" }}>
            위기 행동 판정
          </span>
          {rollRequest.reason && (
            <span style={{ fontSize: "0.78rem", color: theme?.textMuted || "#a8a29e" }}>
              · {rollRequest.reason}
            </span>
          )}
        </div>
        <div style={{ fontSize: "0.82rem", fontWeight: "900", color: "#fb923c" }}>
          필요 눈: <span style={{ fontSize: "1rem", color: "#ea580c" }}>{finalTarget}</span> 이상
        </div>
      </div>

      {/* 중단: 스탯 선택 & 특성/트라우마 토글 버튼 */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
        {/* 스탯 변경 드롭다운/버튼 */}
        <select
          value={selectedStat}
          onChange={(e) => setSelectedStat(e.target.value)}
          style={{
            padding: "5px 10px",
            borderRadius: "10px",
            fontSize: "0.75rem",
            fontWeight: "800",
            backgroundColor: isDarkMode ? "#292524" : "#f5f5f4",
            color: theme?.text || "#fff",
            border: "1px solid rgba(255,255,255,0.15)",
            outline: "none",
            cursor: "pointer"
          }}
        >
          {Object.entries(stats).map(([k, v]) => (
            <option key={k} value={k}>
              {k} {v} (기본 {Math.max(2, 11 - Number(v))}+)
            </option>
          ))}
        </select>

        {/* 긍정 특성 토글 */}
        <button
          type="button"
          onClick={() => setUseTrait(!useTrait)}
          style={{
            padding: "5px 10px",
            borderRadius: "10px",
            fontSize: "0.74rem",
            fontWeight: "800",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            backgroundColor: useTrait ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.05)",
            color: useTrait ? "#10b981" : (theme?.textMuted || "#78716c"),
            border: useTrait ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <Sparkles size={12} /> 특성 보정 (-1)
        </button>

        {/* 트라우마 토글 */}
        <button
          type="button"
          onClick={() => setUseTrauma(!useTrauma)}
          style={{
            padding: "5px 10px",
            borderRadius: "10px",
            fontSize: "0.74rem",
            fontWeight: "800",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            backgroundColor: useTrauma ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.05)",
            color: useTrauma ? "#ef4444" : (theme?.textMuted || "#78716c"),
            border: useTrauma ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <Skull size={12} /> 트라우마 (+1)
        </button>
      </div>

      {/* 하단: 주사위 굴리기 메인 버튼 */}
      <button
        type="button"
        disabled={isRolling}
        onClick={executeRoll}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "12px",
          backgroundColor: isRolling ? "#78716c" : "#ea580c",
          color: "#fff",
          fontSize: "0.9rem",
          fontWeight: "900",
          border: "none",
          cursor: isRolling ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "background-color 0.2s"
        }}
      >
        <Dices size={18} className={isRolling ? "animate-spin" : ""} />
        {isRolling ? "운명을 결정하는 중..." : `1D10 행동 굴림 (${finalTarget} 이상 성공)`}
      </button>
    </div>
  );
}
