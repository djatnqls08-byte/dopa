// components/PhoneDrawer.js
"use client";

import React, { useState } from "react";
import { 
  X, ChevronLeft, Send, BatteryCharging, WifiOff, MessageSquare, 
  UserRound, Heart, Phone, ShieldAlert, Flame, Droplet, Activity, Radio, Sparkles
} from "lucide-react";

// 🌟 상태메시지만 쏙 뽑아내는 정밀 추출 함수
function extractStatusMsg(text) {
  if (!text) return "상태 메시지 없음";
  const match = text.match(/상태\s*메시지\s*[:：]\s*["'“]?([^"'\n]+)/i) || text.match(/상태메시지\s*[:：]\s*["'“]?([^"'\n]+)/i);
  return match ? match[1].replace(/["'”]$/, '').trim() : "상태 메시지 없음";
}

// 🌐 시나리오 배경/태그에 따라 디바이스 형태와 3대 인디케이터를 자동 변환하는 엔진
function detectGenreConfig(genreInput = "") {
  const g = String(genreInput).toLowerCase();
  
  // 1. 우주 / SF / 사이버펑크 호러
  if (/sf|사이버|우주|스페이스|안드로이드|cyberpunk/i.test(g)) {
    return {
      type: "scifi",
      deviceLabel: "양자 통신 단말 (COM-LINK)",
      signalIcon: WifiOff,
      signalLabel: "양자 링크 두절",
      signalColor: "#38bdf8",
      resourceIcon: Activity,
      resourceLabel: "산소 14%",
      resourceColor: "#38bdf8",
      themeBorder: "rgba(56, 189, 248, 0.45)",
      glowColor: "rgba(56, 189, 248, 0.2)",
      accentColor: "#38bdf8",
      alertDefaultTitle: "바이오하자드 경보",
      sendLabel: "패킷 전송",
      callLabel: "통신 채널 연결"
    };
  }
  
  // 2. 다크 판타지 / 동양풍 / 오컬트 마법
  if (/판타지|무협|동양|마법|중세|시대극|환생|빙의/i.test(g)) {
    return {
      type: "fantasy",
      deviceLabel: "전음 수정구 (마법 서신)",
      signalIcon: Flame,
      signalLabel: "마력 공명 불안",
      signalColor: "#c084fc",
      resourceIcon: Droplet,
      resourceLabel: "마나 18%",
      resourceColor: "#c084fc",
      themeBorder: "rgba(192, 132, 252, 0.45)",
      glowColor: "rgba(192, 132, 252, 0.2)",
      accentColor: "#c084fc",
      alertDefaultTitle: "결계 붕괴 / 침식 경보",
      sendLabel: "전음 송신",
      callLabel: "정신 감응 연결"
    };
  }
  
  // 3. 아포칼립스 / 재난 / 폐허 생존
  if (/아포칼립스|재난|방사능|좀비|쉘터|폐허/i.test(g)) {
    return {
      type: "apocalypse",
      deviceLabel: "휴대용 군용 트랜시버",
      signalIcon: Radio,
      signalLabel: "주파수 재밍",
      signalColor: "#facc15",
      resourceIcon: BatteryCharging,
      resourceLabel: "필터 16%",
      resourceColor: "#facc15",
      themeBorder: "rgba(234, 179, 8, 0.45)",
      glowColor: "rgba(234, 179, 8, 0.2)",
      accentColor: "#facc15",
      alertDefaultTitle: "오염 구역 확산 경보",
      sendLabel: "무전 송신",
      callLabel: "비상 주파수 호출"
    };
  }

  // 4. 기본: 현대 도시괴담 (Modern Horror)
  return {
    type: "modern",
    deviceLabel: "스마트폰",
    signalIcon: WifiOff,
    signalLabel: "신호 끊김",
    signalColor: "#ef4444",
    resourceIcon: BatteryCharging,
    resourceLabel: "배터리 14%",
    resourceColor: "#fb923c",
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
  genre = "modern", // 🌟 시나리오 장르/태그가 주입됨
  characterSheet = {},
  contacts = [],
  activeContactId = null,
  onSelectContact = null,
  messages = [],
  emergencyAlert = null, // 긴급 재난 경보 데이터 { title, text }
  onSendMessage,
  onStartVoiceCall = null
}) {
  const [viewMode, setViewMode] = useState("list"); // "list" | "profile" | "chat" | "myProfile"
  const [selectedId, setSelectedId] = useState(activeContactId || contacts[0]?.id || 1);
  const [inputText, setInputText] = useState("");
  const [zoomedPhoto, setZoomedPhoto] = useState(null);

  if (!isOpen) return null;

  // 장르 어댑터 설정 도출
  const cfg = detectGenreConfig(genre);

  const currentContact = contacts.find(c => c.id === selectedId) || contacts[0] || {
    id: 1, name: "미확인 발신자", job: "발신번호표시제한", affection: 0, behavior: ""
  };

  const myName = characterSheet?.name || "도파미너";
  const myJob = characterSheet?.job || "조난자";
  const myStatusMsg = extractStatusMsg(characterSheet?.background);

  const handleSend = () => {
    if (!inputText.trim()) return;
    if (onSendMessage) {
      onSendMessage(inputText.trim(), currentContact);
    }
    setInputText("");
  };

  const SignalIcon = cfg.signalIcon;
  const ResourceIcon = cfg.resourceIcon;

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99990,
        backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "420px", height: "82vh", maxHeight: "720px",
          backgroundColor: "#0d0b0a",
          border: `1.5px solid ${cfg.themeBorder}`,
          borderRadius: "32px", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: `0 25px 50px rgba(0,0,0,0.8), 0 0 25px ${cfg.glowColor}`,
          color: "#fff", position: "relative"
        }}
      >
        {/* 🚨 긴급 재난 / 결계 경보 팝업 */}
        {emergencyAlert && (
          <div style={{
            position: "absolute", top: "45px", left: "16px", right: "16px", zIndex: 20,
            backgroundColor: "rgba(220, 38, 38, 0.95)", backdropFilter: "blur(8px)",
            borderRadius: "16px", padding: "14px", border: "1px solid #f87171",
            boxShadow: "0 10px 25px rgba(220, 38, 38, 0.5)", animation: "shake 0.5s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "900", fontSize: "0.85rem", color: "#fff", marginBottom: "4px" }}>
              <ShieldAlert size={16} /> [{cfg.alertDefaultTitle}] {emergencyAlert.title}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#fee2e2", lineHeight: "1.4" }}>
              {emergencyAlert.text}
            </div>
          </div>
        )}

        {/* 1. 상단 장르 맞춤형 3대 인디케이터 바 */}
        <div style={{
          padding: "12px 18px 8px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: "0.74rem", fontWeight: "800", color: cfg.accentColor,
          borderBottom: "1px dashed rgba(255,255,255,0.08)",
          backgroundColor: "rgba(0,0,0,0.4)", flexShrink: 0
        }}>
          <span>⏱️ {inGameTime}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "3px", color: cfg.signalColor }}>
              <SignalIcon size={13} /> {cfg.signalLabel}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px", color: cfg.resourceColor }}>
              <ResourceIcon size={13} /> {cfg.resourceLabel}
            </span>
          </div>
        </div>

        {/* 2. 상단 헤더 바 */}
        <div style={{
          height: "52px", padding: "0 16px",
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
                style={{ background: "none", border: "none", color: cfg.accentColor, fontSize: "0.85rem", cursor: "pointer", fontWeight: "800", display: "flex", alignItems: "center", gap: "2px" }}
              >
                <ChevronLeft size={20} /> 뒤로
              </button>
            )}
          </div>
          <span style={{ fontSize: "0.95rem", fontWeight: "900", color: "#fff" }}>
            {viewMode === "myProfile" ? "내 프로필" : viewMode === "profile" ? "생존자 정보" : viewMode === "chat" ? currentContact.name : cfg.deviceLabel}
          </span>
          <div style={{ width: "60px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#a8a29e", cursor: "pointer", padding: "4px" }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* 3. 본문 스위칭 뷰 */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          
          {/* 👥 [화면 1: 인연 목록] */}
          {viewMode === "list" && (
            <div style={{ display: "flex", flexDirection: "column", padding: "16px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#a8a29e", marginLeft: "4px", marginBottom: "6px" }}>내 프로필</span>
              <div 
                onClick={() => setViewMode("myProfile")}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "12px",
                  borderRadius: "14px", backgroundColor: "rgba(35, 28, 24, 0.7)",
                  border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", marginBottom: "16px"
                }}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", backgroundColor: "rgba(0,0,0,0.3)", flexShrink: 0 }}>
                  {characterSheet?.portrait ? <img src={characterSheet.portrait} alt="나" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={26} color="#78716c" style={{ margin: "11px" }} />}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "1rem", fontWeight: "900", color: "#fff" }}>{myName}</span>
                  <span style={{ fontSize: "0.75rem", color: cfg.accentColor, fontWeight: "700" }}>"{myStatusMsg}"</span>
                </div>
              </div>

              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#a8a29e", marginLeft: "4px", marginBottom: "6px" }}>
                동행자 및 생존자 ({contacts.length}명)
              </span>
              
              {contacts.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#78716c", fontSize: "0.82rem" }}>
                  연락 가능한 생존자가 없습니다.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {contacts.map((npc) => (
                    <div 
                      key={npc.id}
                      onClick={() => {
                        setSelectedId(npc.id);
                        if (onSelectContact) onSelectContact(npc.id);
                        setViewMode("profile");
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px", padding: "12px",
                        borderRadius: "14px", backgroundColor: npc.isPartner ? "rgba(234, 88, 12, 0.12)" : "rgba(25, 20, 17, 0.6)",
                        border: `1px solid ${npc.isPartner ? cfg.themeBorder : "rgba(255,255,255,0.06)"}`,
                        cursor: "pointer", transition: "background 0.15s"
                      }}
                    >
                      <div style={{ width: "46px", height: "46px", borderRadius: "50%", overflow: "hidden", backgroundColor: "rgba(0,0,0,0.3)", flexShrink: 0 }}>
                        {npc.portraitUrl ? <img src={npc.portraitUrl} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={24} color="#78716c" style={{ margin: "11px" }} />}
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: "900", color: "#fff" }}>{npc.name}</span>
                          {npc.isPartner && (
                            <span style={{ fontSize: "0.62rem", padding: "1px 5px", borderRadius: "4px", backgroundColor: cfg.accentColor, color: "#fff", fontWeight: "900" }}>
                              파트너
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "#a8a29e" }}>
                          "{extractStatusMsg(npc.behavior)}"
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: cfg.accentColor, fontSize: "0.82rem", fontWeight: "800" }}>
                        <Heart size={13} fill={cfg.accentColor} /> {npc.affection || 0}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 👤 [화면 2: 상대방 프로필 상세] */}
          {viewMode === "profile" && (
            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "0.8rem", color: cfg.accentColor, fontWeight: "800" }}>{currentContact.job || "정보 없음"}</span>
              <div 
                onClick={() => { if (currentContact.portraitUrl) setZoomedPhoto(currentContact.portraitUrl); }}
                style={{ width: "96px", height: "96px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${cfg.accentColor}`, boxShadow: "0 8px 20px rgba(0,0,0,0.5)", cursor: currentContact.portraitUrl ? "pointer" : "default" }}
              >
                {currentContact.portraitUrl ? <img src={currentContact.portraitUrl} alt="상대" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={50} color="#78716c" style={{ margin: "23px" }} />}
              </div>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "900", color: "#fff" }}>{currentContact.name}</h2>
                <span style={{ fontSize: "0.82rem", color: cfg.accentColor, fontWeight: "700", marginTop: "4px", display: "block" }}>
                  "{extractStatusMsg(currentContact.behavior)}"
                </span>
              </div>

              {/* 🌟 2대 액션 버튼: [1:1 메시지] + [무전/통화] */}
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <button 
                  type="button"
                  onClick={() => setViewMode("chat")}
                  style={{
                    flex: 2, padding: "13px", borderRadius: "14px",
                    backgroundColor: cfg.accentColor, color: "#fff", border: "none",
                    fontWeight: "900", fontSize: "0.9rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                  }}
                >
                  <MessageSquare size={17} /> 1:1 {cfg.type === "scifi" ? "채널" : cfg.type === "fantasy" ? "전음" : "대화"}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (onStartVoiceCall) onStartVoiceCall(currentContact);
                  }}
                  style={{
                    flex: 1.2, padding: "13px", borderRadius: "14px",
                    backgroundColor: "rgba(255,255,255,0.08)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.4)",
                    fontWeight: "900", fontSize: "0.82rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", whiteSpace: "nowrap"
                  }}
                >
                  <Phone size={15} /> {cfg.callLabel}
                </button>
              </div>

              {/* 유대감 및 상세 메모 */}
              <div style={{ width: "100%", backgroundColor: "rgba(25, 20, 17, 0.7)", borderRadius: "16px", padding: "16px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "800", color: cfg.accentColor, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Heart size={15} fill={cfg.accentColor} /> 정서적 유대감
                  </span>
                  <span style={{ fontSize: "0.95rem", fontWeight: "900", color: cfg.accentColor }}>{currentContact.affection || 0} / 100</span>
                </div>
                <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "8px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#a8a29e", fontWeight: "700", display: "block", marginBottom: "4px" }}>특징 및 인물 기록</span>
                  <div style={{ fontSize: "0.82rem", color: "#d6d3d1", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                    {currentContact.behavior || "기록된 메모가 없습니다."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 💬 [화면 3: 1:1 대화방] */}
          {viewMode === "chat" && (
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {messages.length === 0 ? (
                  <div style={{ margin: "auto", textAlign: "center", color: "#78716c", fontSize: "0.82rem" }}>
                    주고받은 내역이 없습니다.
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isUser = m.sender === "user" || m.role === "user";
                    return (
                      <div key={idx} style={{ alignSelf: isUser ? "flex-end" : "flex-start", maxWidth: "80%", display: "flex", flexDirection: "column", gap: "4px", alignItems: isUser ? "flex-end" : "flex-start" }}>
                        {m.photo && (
                          <img 
                            src={m.photo} 
                            alt="첨부" 
                            onClick={() => setZoomedPhoto(m.photo)}
                            style={{ width: "180px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", marginBottom: "2px" }}
                          />
                        )}
                        <div style={{
                          padding: "10px 14px", borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                          backgroundColor: isUser ? cfg.accentColor : "#241e1a",
                          color: "#fff", fontSize: "0.85rem", lineHeight: "1.5",
                          border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)"
                        }}>
                          {m.text}
                        </div>
                        <span style={{ fontSize: "0.65rem", color: "#78716c", padding: "0 2px" }}>{m.time || ""}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* 하단 전송 바 */}
              <div style={{ padding: "12px 14px", backgroundColor: "rgba(20, 16, 14, 0.95)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={`${currentContact.name}에게 ${cfg.sendLabel}...`}
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: "20px",
                    backgroundColor: "#181412", border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff", fontSize: "0.85rem", outline: "none"
                  }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  style={{
                    padding: "10px 16px", borderRadius: "20px",
                    backgroundColor: inputText.trim() ? cfg.accentColor : "#382e27",
                    color: "#fff", border: "none", fontWeight: "800", fontSize: "0.8rem",
                    cursor: inputText.trim() ? "pointer" : "default",
                    display: "flex", alignItems: "center", gap: "4px"
                  }}
                >
                  <Send size={14} /> 전송
                </button>
              </div>
            </div>
          )}

          {/* 👤 [화면 4: 내 프로필 상세] */}
          {viewMode === "myProfile" && (
            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div 
                  onClick={() => { if (characterSheet?.portrait) setZoomedPhoto(characterSheet.portrait); }}
                  style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${cfg.accentColor}`, flexShrink: 0, cursor: characterSheet?.portrait ? "pointer" : "default" }}
                >
                  {characterSheet?.portrait ? <img src={characterSheet.portrait} alt="나" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={32} color="#78716c" style={{ margin: "16px" }} />}
                </div>
                <div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#fff" }}>{myName}</div>
                  <div style={{ fontSize: "0.8rem", color: "#a8a29e" }}>{myJob}</div>
                </div>
              </div>
              <div style={{ padding: "14px", borderRadius: "14px", backgroundColor: "rgba(25, 20, 17, 0.8)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.82rem", lineHeight: "1.6", color: "#d6d3d1", whiteSpace: "pre-wrap" }}>
                <span style={{ fontWeight: "800", color: cfg.accentColor, display: "block", marginBottom: "4px" }}>■ 백스토리 및 상태</span>
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
