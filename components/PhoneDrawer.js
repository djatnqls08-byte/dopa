// components/PhoneDrawer.js
"use client";

import React, { useState } from "react";
import { 
  X, ChevronLeft, Send, BatteryCharging, WifiOff, MessageSquare, 
  UserRound, Heart, Phone, ShieldAlert, Flame, Droplet, Activity, Radio, Wifi
} from "lucide-react";

// 🌟 상태메시지 정밀 추출기 (빈 따옴표 및 객체 필드 안전 처리)
function extractStatusMsg(npcOrText) {
  if (!npcOrText) return "상태 메시지 없음";
  
  if (typeof npcOrText === "object") {
    if (npcOrText.statusMessage?.trim()) return npcOrText.statusMessage.trim();
    if (npcOrText.statusMsg?.trim()) return npcOrText.statusMsg.trim();
    npcOrText = npcOrText.behavior || npcOrText.background || "";
  }

  const str = String(npcOrText);
  const match = str.match(/상태\s*메시지\s*[:：]\s*["'“]?([^"'\n]+)/i) || str.match(/상태메시지\s*[:：]\s*["'“]?([^"'\n]+)/i);
  
  if (match) {
    const cleaned = match[1].replace(/["'”]/g, '').trim();
    if (cleaned.length > 0) return cleaned;
  }
  
  return "상태 메시지 없음";
}

// 🌐 시나리오 배경/태그 자동 변환 엔진
function detectGenreConfig(genreInput = "") {
  const g = String(genreInput).toLowerCase();
  
  // 1. 현대 / 도시 / 오피스 / 괴담 ➔ 스마트폰
  if (/현대|도시|오피스|직장|학교|스타트업|모던|modern|괴담/i.test(g) && !/정통판타지|중세|무협/i.test(g)) {
    return {
      type: "modern",
      deviceLabel: "스마트폰",
      defaultSignalIcon: WifiOff,
      restoredSignalIcon: Wifi,
      defaultSignal: "신호 끊김",
      defaultResourceIcon: BatteryCharging,
      defaultResource: "배터리 14%",
      themeBorder: "rgba(234, 88, 12, 0.45)",
      glowColor: "rgba(234, 88, 12, 0.2)",
      accentColor: "#ea580c",
      alertDefaultTitle: "긴급 재난 문자",
      sendLabel: "문자 전송",
      callLabel: "무전 / 통화 연결"
    };
  }

  // 2. 우주 / SF / 사이버펑크 호러
  if (/sf|사이버|우주|스페이스|안드로이드|cyberpunk/i.test(g)) {
    return {
      type: "scifi",
      deviceLabel: "양자 통신 단말 (COM-LINK)",
      defaultSignalIcon: WifiOff,
      restoredSignalIcon: Wifi,
      defaultSignal: "양자 링크 두절",
      defaultResourceIcon: Activity,
      defaultResource: "산소 14%",
      themeBorder: "rgba(56, 189, 248, 0.45)",
      glowColor: "rgba(56, 189, 248, 0.2)",
      accentColor: "#38bdf8",
      alertDefaultTitle: "바이오하자드 경보",
      sendLabel: "패킷 전송",
      callLabel: "통신 채널 연결"
    };
  }
  
  // 3. 아포칼립스 / 재난 / 폐허 생존
  if (/아포칼립스|재난|방사능|좀비|쉘터|폐허/i.test(g)) {
    return {
      type: "apocalypse",
      deviceLabel: "휴대용 군용 트랜시버",
      defaultSignalIcon: Radio,
      restoredSignalIcon: Radio,
      defaultSignal: "주파수 재밍",
      defaultResourceIcon: BatteryCharging,
      defaultResource: "필터 16%",
      themeBorder: "rgba(234, 179, 8, 0.45)",
      glowColor: "rgba(234, 179, 8, 0.2)",
      accentColor: "#facc15",
      alertDefaultTitle: "오염 구역 확산 경보",
      sendLabel: "무전 송신",
      callLabel: "비상 주파수 호출"
    };
  }

  // 4. 순수 다크 판타지 / 동양풍 / 무협
  if (/판타지|무협|동양|마법|중세|시대극/i.test(g)) {
    return {
      type: "fantasy",
      deviceLabel: "전음 수정구 (마법 서신)",
      defaultSignalIcon: Flame,
      restoredSignalIcon: Flame,
      defaultSignal: "마력 공명 불안",
      defaultResourceIcon: Droplet,
      defaultResource: "마나 18%",
      themeBorder: "rgba(192, 132, 252, 0.45)",
      glowColor: "rgba(192, 132, 252, 0.2)",
      accentColor: "#c084fc",
      alertDefaultTitle: "결계 붕괴 / 침식 경보",
      sendLabel: "전음 송신",
      callLabel: "정신 감응 연결"
    };
  }

  // 기본값: 현대 스마트폰
  return {
    type: "modern",
    deviceLabel: "스마트폰",
    defaultSignalIcon: WifiOff,
    restoredSignalIcon: Wifi,
    defaultSignal: "신호 끊김",
    defaultResourceIcon: BatteryCharging,
    defaultResource: "배터리 14%",
    themeBorder: "rgba(234, 88, 12, 0.45)",
    glowColor: "rgba(234, 88, 12, 0.2)",
    accentColor: "#ea580c",
    alertDefaultTitle: "긴급 재난 문자",
    sendLabel: "문자 전송",
    callLabel: "무전 / 통화 연결"
  };
}

export default function PhoneDrawer({
  isOpen,
  onClose,
  theme,
  inGameTime = "1일차 새벽 · 03:44 AM",
  genre = "modern",
  characterSheet = {},
  contacts = [],
  activeContactId = null,
  onSelectContact = null,
  messages = [],
  emergencyAlert = null,
  dynamicSignal = null,     // 🌟 서사 중 변동된 통신 상태
  dynamicResource = null,   // 🌟 서사 중 변동된 자원(배터리/산소/마나)
  onSendMessage,
  onStartVoiceCall = null,
  isMobile = false
}) {
  const [viewMode, setViewMode] = useState("list"); // "list" | "profile" | "chat" | "myProfile"
  const [selectedId, setSelectedId] = useState(activeContactId || contacts[0]?.id || 1);
  const [inputText, setInputText] = useState("");
  const [zoomedPhoto, setZoomedPhoto] = useState(null);

  if (!isOpen) return null;

  // 🌟 모바일 / PC 반응형 화면 폭 자동 감지
  const isMobileView = isMobile || (typeof window !== "undefined" && window.innerWidth < 768);

  const cfg = detectGenreConfig(genre);

  // 동적 상태값 계산
  const currentSignal = dynamicSignal || cfg.defaultSignal;
  const currentResource = dynamicResource || cfg.defaultResource;
  const isSignalRestored = dynamicSignal && !/끊김|두절|불안|재밍|차단|오류/i.test(dynamicSignal);
  const SignalIcon = isSignalRestored ? cfg.restoredSignalIcon : cfg.defaultSignalIcon;
  const ResourceIcon = cfg.defaultResourceIcon;

  const currentContact = contacts.find(c => c.id === selectedId) || contacts[0] || {
    id: 1, name: "미확인 발신자", job: "발신번호표시제한", affection: 0, behavior: ""
  };

  const myName = characterSheet?.name || "도파미너";
  const myJob = characterSheet?.job || "조난자";
  const myStatusMsg = extractStatusMsg(characterSheet);

  const handleSend = () => {
    if (!inputText.trim()) return;
    if (onSendMessage) {
      onSendMessage(inputText.trim(), currentContact);
    }
    setInputText("");
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99990,
        backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobileView ? "10px" : "20px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      {/* 🌟 PC 가로폭을 420px ➔ 480px로 시원하게 확장 */}
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: isMobileView ? "100%" : "480px", 
          height: isMobileView ? "85vh" : "750px", maxHeight: "88vh",
          backgroundColor: "#0d0b0a",
          border: `1.5px solid ${cfg.themeBorder}`,
          borderRadius: "32px", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: `0 25px 60px rgba(0,0,0,0.85), 0 0 30px ${cfg.glowColor}`,
          color: "#fff", position: "relative"
        }}
      >
        {/* 🚨 긴급 재난 / 결계 경보 팝업 */}
        {emergencyAlert && (
          <div style={{
            position: "absolute", top: "50px", left: "16px", right: "16px", zIndex: 20,
            backgroundColor: "rgba(220, 38, 38, 0.95)", backdropFilter: "blur(8px)",
            borderRadius: "16px", padding: "16px", border: "1px solid #f87171",
            boxShadow: "0 10px 25px rgba(220, 38, 38, 0.5)", animation: "shake 0.5s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "900", fontSize: isMobileView ? "0.88rem" : "0.98rem", color: "#fff", marginBottom: "6px" }}>
              <ShieldAlert size={18} /> [{cfg.alertDefaultTitle}] {emergencyAlert.title}
            </div>
            <div style={{ fontSize: isMobileView ? "0.82rem" : "0.88rem", color: "#fee2e2", lineHeight: "1.5" }}>
              {emergencyAlert.text}
            </div>
          </div>
        )}

        {/* 1. 상단 인디케이터 바 (시간, 신호, 배터리 폰트 확대) */}
        <div style={{
          padding: isMobileView ? "12px 18px 8px" : "14px 22px 10px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: isMobileView ? "0.8rem" : "0.88rem", fontWeight: "800", color: cfg.accentColor,
          borderBottom: "1px dashed rgba(255,255,255,0.08)",
          backgroundColor: "rgba(0,0,0,0.4)", flexShrink: 0
        }}>
          <span>⏱️ {inGameTime}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: isSignalRestored ? "#10b981" : "#ef4444" }}>
              <SignalIcon size={15} /> {currentSignal}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#fb923c" }}>
              <ResourceIcon size={15} /> {currentResource}
            </span>
          </div>
        </div>

        {/* 2. 상단 헤더 바 */}
        <div style={{
          height: isMobileView ? "54px" : "58px", padding: "0 20px",
          backgroundColor: "rgba(25, 20, 17, 0.95)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0
        }}>
          <div style={{ width: "60px" }}>
            {viewMode !== "list" && (
              <button 
                type="button" 
                onClick={() => {
                  if (viewMode === "chat") setViewMode("profile");
                  else setViewMode("list");
                }} 
                style={{ background: "none", border: "none", color: cfg.accentColor, fontSize: isMobileView ? "0.85rem" : "0.92rem", cursor: "pointer", fontWeight: "800", display: "flex", alignItems: "center", gap: "2px" }}
              >
                <ChevronLeft size={22} /> 뒤로
              </button>
            )}
          </div>
          <span style={{ fontSize: isMobileView ? "1.05rem" : "1.18rem", fontWeight: "900", color: "#fff" }}>
            {viewMode === "myProfile" ? "내 프로필" : viewMode === "profile" ? "생존자 정보" : viewMode === "chat" ? currentContact.name : cfg.deviceLabel}
          </span>
          <div style={{ width: "60px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#a8a29e", cursor: "pointer", padding: "4px" }}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* 3. 본문 스위칭 뷰 */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          
          {/* 👥 [화면 1: 인연 목록 - 글씨 및 아바타 스케일업] */}
          {viewMode === "list" && (
            <div style={{ display: "flex", flexDirection: "column", padding: isMobileView ? "16px" : "20px" }}>
              <span style={{ fontSize: isMobileView ? "0.8rem" : "0.88rem", fontWeight: "800", color: "#a8a29e", marginLeft: "4px", marginBottom: "8px" }}>
                내 프로필
              </span>
              <div 
                onClick={() => setViewMode("myProfile")}
                style={{
                  display: "flex", alignItems: "center", gap: "14px", padding: isMobileView ? "14px" : "16px",
                  borderRadius: "16px", backgroundColor: "rgba(35, 28, 24, 0.75)",
                  border: "1.5px solid rgba(255,255,255,0.08)", cursor: "pointer", marginBottom: "20px",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ width: isMobileView ? "52px" : "58px", height: isMobileView ? "52px" : "58px", borderRadius: "18px", overflow: "hidden", backgroundColor: "rgba(0,0,0,0.3)", flexShrink: 0 }}>
                  {characterSheet?.portrait ? <img src={characterSheet.portrait} alt="나" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={30} color="#78716c" style={{ margin: "13px" }} />}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span style={{ fontSize: isMobileView ? "1.05rem" : "1.18rem", fontWeight: "900", color: "#fff" }}>{myName}</span>
                  <span style={{ fontSize: isMobileView ? "0.8rem" : "0.88rem", color: cfg.accentColor, fontWeight: "800" }}>"{myStatusMsg}"</span>
                </div>
              </div>

              <span style={{ fontSize: isMobileView ? "0.8rem" : "0.88rem", fontWeight: "800", color: "#a8a29e", marginLeft: "4px", marginBottom: "8px" }}>
                동행자 및 생존자 ({contacts.length}명)
              </span>
              
              {contacts.length === 0 ? (
                <div style={{ padding: "36px", textAlign: "center", color: "#78716c", fontSize: "0.9rem" }}>
                  연락 가능한 생존자가 없습니다.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {contacts.map((npc) => (
                    <div 
                      key={npc.id}
                      onClick={() => {
                        setSelectedId(npc.id);
                        if (onSelectContact) onSelectContact(npc.id);
                        setViewMode("profile");
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: "14px", padding: isMobileView ? "14px" : "16px",
                        borderRadius: "16px", backgroundColor: npc.isPartner ? "rgba(234, 88, 12, 0.15)" : "rgba(25, 20, 17, 0.65)",
                        border: `1.5px solid ${npc.isPartner ? cfg.themeBorder : "rgba(255,255,255,0.06)"}`,
                        cursor: "pointer", transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ width: isMobileView ? "50px" : "56px", height: isMobileView ? "50px" : "56px", borderRadius: "18px", overflow: "hidden", backgroundColor: "rgba(0,0,0,0.3)", flexShrink: 0 }}>
                        {npc.portraitUrl ? <img src={npc.portraitUrl} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={28} color="#78716c" style={{ margin: "13px" }} />}
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: isMobileView ? "1.05rem" : "1.16rem", fontWeight: "900", color: "#fff" }}>{npc.name}</span>
                          {npc.isPartner && (
                            <span style={{ fontSize: "0.72rem", padding: "2px 7px", borderRadius: "6px", backgroundColor: cfg.accentColor, color: "#fff", fontWeight: "900" }}>
                              파트너
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: isMobileView ? "0.8rem" : "0.88rem", color: "#d6d3d1", lineHeight: "1.4" }}>
                          "{extractStatusMsg(npc)}"
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", color: cfg.accentColor, fontSize: isMobileView ? "0.9rem" : "1rem", fontWeight: "900" }}>
                        <Heart size={16} fill={cfg.accentColor} /> {npc.affection || 0}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 👤 [화면 2: 상대방 프로필 상세] */}
          {viewMode === "profile" && (
            <div style={{ padding: isMobileView ? "24px 20px" : "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
              <span style={{ fontSize: isMobileView ? "0.82rem" : "0.9rem", color: cfg.accentColor, fontWeight: "800" }}>{currentContact.job || "정보 없음"}</span>
              <div 
                onClick={() => { if (currentContact.portraitUrl) setZoomedPhoto(currentContact.portraitUrl); }}
                style={{ width: isMobileView ? "100px" : "120px", height: isMobileView ? "100px" : "120px", borderRadius: "50%", overflow: "hidden", border: `2.5px solid ${cfg.accentColor}`, boxShadow: "0 8px 25px rgba(0,0,0,0.6)", cursor: currentContact.portraitUrl ? "pointer" : "default" }}
              >
                {currentContact.portraitUrl ? <img src={currentContact.portraitUrl} alt="상대" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={56} color="#78716c" style={{ margin: "26px" }} />}
              </div>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ margin: 0, fontSize: isMobileView ? "1.45rem" : "1.65rem", fontWeight: "900", color: "#fff" }}>{currentContact.name}</h2>
                <span style={{ fontSize: isMobileView ? "0.86rem" : "0.95rem", color: cfg.accentColor, fontWeight: "800", marginTop: "6px", display: "block" }}>
                  "{extractStatusMsg(currentContact)}"
                </span>
              </div>

              {/* 액션 버튼: [1:1 메시지] + [무전/통화] */}
              <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "6px" }}>
                <button 
                  type="button" 
                  onClick={() => setViewMode("chat")}
                  style={{
                    flex: 2, padding: isMobileView ? "14px" : "16px", borderRadius: "16px",
                    backgroundColor: cfg.accentColor, color: "#fff", border: "none",
                    fontWeight: "900", fontSize: isMobileView ? "0.92rem" : "1rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    boxShadow: `0 4px 16px ${cfg.glowColor}`
                  }}
                >
                  <MessageSquare size={18} /> 1:1 {cfg.type === "scifi" ? "채널" : cfg.type === "fantasy" ? "전음" : "대화"}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (onStartVoiceCall) onStartVoiceCall(currentContact);
                  }}
                  style={{
                    flex: 1.2, padding: isMobileView ? "14px" : "16px", borderRadius: "16px",
                    backgroundColor: "rgba(255,255,255,0.08)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.4)",
                    fontWeight: "900", fontSize: isMobileView ? "0.85rem" : "0.92rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", whiteSpace: "nowrap"
                  }}
                >
                  <Phone size={16} /> {cfg.callLabel}
                </button>
              </div>

              {/* 유대감 및 상세 메모 */}
              <div style={{ width: "100%", backgroundColor: "rgba(25, 20, 17, 0.8)", borderRadius: "18px", padding: "18px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: isMobileView ? "0.88rem" : "0.96rem", fontWeight: "800", color: cfg.accentColor, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Heart size={16} fill={cfg.accentColor} /> 정서적 유대감
                  </span>
                  <span style={{ fontSize: isMobileView ? "1rem" : "1.15rem", fontWeight: "900", color: cfg.accentColor }}>{currentContact.affection || 0} / 100</span>
                </div>
                <div style={{ borderTop: "1px dashed rgba(255,255,255,0.12)", paddingTop: "10px" }}>
                  <span style={{ fontSize: isMobileView ? "0.78rem" : "0.86rem", color: "#a8a29e", fontWeight: "800", display: "block", marginBottom: "4px" }}>특징 및 인물 기록</span>
                  <div style={{ fontSize: isMobileView ? "0.85rem" : "0.92rem", color: "#e2e8f0", lineHeight: "1.65", whiteSpace: "pre-wrap" }}>
                    {currentContact.behavior || "기록된 메모가 없습니다."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 💬 [화면 3: 1:1 대화방] */}
          <div style={{ flex: 1, minHeight: 0, display: viewMode === "chat" ? "flex" : "none", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: isMobileView ? "16px" : "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.length === 0 ? (
                <div style={{ margin: "auto", textAlign: "center", color: "#78716c", fontSize: "0.88rem" }}>
                  주고받은 내역이 없습니다.
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isUser = m.sender === "user" || m.role === "user";
                  return (
                    <div key={idx} style={{ alignSelf: isUser ? "flex-end" : "flex-start", maxWidth: "82%", display: "flex", flexDirection: "column", gap: "4px", alignItems: isUser ? "flex-end" : "flex-start" }}>
                      {m.photo && (
                        <img 
                          src={m.photo} 
                          alt="첨부" 
                          onClick={() => setZoomedPhoto(m.photo)}
                          style={{ width: "220px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", marginBottom: "4px" }}
                        />
                      )}
                      <div style={{
                        padding: isMobileView ? "11px 15px" : "13px 18px", borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                        backgroundColor: isUser ? cfg.accentColor : "#241e1a",
                        color: "#fff", fontSize: isMobileView ? "0.9rem" : "0.98rem", lineHeight: "1.6",
                        border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)"
                      }}>
                        {m.text}
                      </div>
                      <span style={{ fontSize: isMobileView ? "0.7rem" : "0.76rem", color: "#78716c", padding: "0 4px" }}>{m.time || ""}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* 하단 전송 바 */}
            <div style={{ padding: isMobileView ? "12px 16px" : "14px 20px", backgroundColor: "rgba(20, 16, 14, 0.95)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "10px", alignItems: "center", flexShrink: 0 }}>
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`${currentContact.name}에게 ${cfg.sendLabel}...`}
                style={{
                  flex: 1, padding: isMobileView ? "11px 16px" : "13px 18px", borderRadius: "24px",
                  backgroundColor: "#181412", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", fontSize: isMobileView ? "0.88rem" : "0.95rem", outline: "none"
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim()}
                style={{
                  padding: isMobileView ? "11px 18px" : "13px 22px", borderRadius: "24px",
                  backgroundColor: inputText.trim() ? cfg.accentColor : "#382e27",
                  color: "#fff", border: "none", fontWeight: "900", fontSize: isMobileView ? "0.85rem" : "0.92rem",
                  cursor: inputText.trim() ? "pointer" : "default",
                  display: "flex", alignItems: "center", gap: "6px"
                }}
              >
                <Send size={15} /> 전송
              </button>
            </div>
          </div>

          {/* 👤 [화면 4: 내 프로필 상세] */}
          {viewMode === "myProfile" && (
            <div style={{ padding: isMobileView ? "24px 20px" : "28px 24px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div 
                  onClick={() => { if (characterSheet?.portrait) setZoomedPhoto(characterSheet.portrait); }}
                  style={{ width: isMobileView ? "70px" : "80px", height: isMobileView ? "70px" : "80px", borderRadius: "50%", overflow: "hidden", border: `2.5px solid ${cfg.accentColor}`, flexShrink: 0, cursor: characterSheet?.portrait ? "pointer" : "default" }}
                >
                  {characterSheet?.portrait ? <img src={characterSheet.portrait} alt="나" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={36} color="#78716c" style={{ margin: "18px" }} />}
                </div>
                <div>
                  <div style={{ fontSize: isMobileView ? "1.25rem" : "1.45rem", fontWeight: "900", color: "#fff" }}>{myName}</div>
                  <div style={{ fontSize: isMobileView ? "0.85rem" : "0.92rem", color: "#a8a29e", marginTop: "2px" }}>{myJob}</div>
                </div>
              </div>
              <div style={{ padding: "16px", borderRadius: "16px", backgroundColor: "rgba(25, 20, 17, 0.8)", border: "1px solid rgba(255,255,255,0.08)", fontSize: isMobileView ? "0.85rem" : "0.94rem", lineHeight: "1.65", color: "#e2e8f0", whiteSpace: "pre-wrap" }}>
                <span style={{ fontWeight: "800", color: cfg.accentColor, display: "block", marginBottom: "6px" }}>■ 백스토리 및 상태</span>
                {characterSheet?.background || "설정 없음"}
              </div>
            </div>
          )}

        </div>

        {/* 🖼️ 사진 확대 오버레이 모달 */}
        {zoomedPhoto && (
          <div 
            onClick={() => setZoomedPhoto(null)}
            style={{ position: "absolute", inset: 0, zIndex: 99999, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          >
            <img src={zoomedPhoto} alt="확대" style={{ maxWidth: "100%", maxHeight: "80%", borderRadius: "16px", objectFit: "contain", border: "1px solid rgba(255,255,255,0.2)" }} />
          </div>
        )}
      </div>
    </div>
  );
}
