import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  "gemini-2.5-flash",
];

export async function POST(req) {
  try { 
    const body = await req.json().catch(() => ({}));
    const {
      messages = [],
      scenarioText = "",
      playerSheet = {},
      ruleMode = "coc",
      playPreference = "",
      isPhoneChat = false, 
      isVoiceCall = false,
      voiceCallNpc = null,
      facingNpc = null,
      targetNpc = null,
      lastStoryContext = "",
      recentEvents = [],
      currentPhase = "낮",
    } = body;

    const rawKeys = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key || "";
    const apiKeys = rawKeys.split(",").map(k => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      return new Response(JSON.stringify({ error: "API 키가 등록되지 않았습니다." }), { status: 400 });
    }
    const msgList = Array.isArray(messages) ? messages : [];
    const lastMessageText = msgList.length > 0 ? (msgList[msgList.length - 1]?.text || "") : "";
    const isScenarioGen = lastMessageText.includes("순수 JSON 포맷으로만 응답하십시오");

    let formattedContents = [];

    if (isScenarioGen) {
      formattedContents = [
        { role: "user", parts: [{ text: "당신은 전문 시나리오 라이터입니다. 요청에 따라 마크다운 없이 순수한 JSON 객체({...})만 반환하십시오." }] },
        { role: "model", parts: [{ text: "{}" }] },
        { role: "user", parts: [{ text: lastMessageText }] }
      ];
    } else {
      // 👤 PC(플레이어) 정보
      const pName = playerSheet?.name || "주인공";
      const pGender = playerSheet?.gender || "미상";
      const pAge = playerSheet?.age || "미상";
      const pJob = playerSheet?.job || "주인공";
      const pcTone = playerSheet?.background || "자연스러운 성격과 말투";
      
      // 🎯 대화 상대(KPC) 확정 및 정보 추출
      const activePartner = targetNpc || playerSheet?.npcs?.[0] || { name: "상대", job: "조력자" };
      const partnerName = activePartner.name || "상대";
      const partnerGender = activePartner.gender || "미상";
      const partnerAge = activePartner.age || "미상";
      const partnerJob = activePartner.job || activePartner.title || "인물";
      const partnerDetail = activePartner.detail || activePartner.desc || activePartner.setting || "주인공과 아는 사이";
      const currentAffinity = activePartner.affinity ?? activePartner.affection ?? 0;
      const allNpcNames = (playerSheet?.npcs || []).map(n => n.name).filter(Boolean).join(", ") || partnerName;

      // 🧠 최근 기억 및 사건 수첩
      const eventsSummary = (recentEvents && recentEvents.length > 0)
        ? recentEvents.map(e => `   * ${e}`).join("\n")
        : "   * 특별히 기록된 사건 없음";

      // 🌸 장르 태그 및 서사 코어 원칙 (GL/백합 미학 및 얀데레 금지 강제)
      const prefText = `${playPreference || ""} ${scenarioText || ""}`;
      const isGL = prefText.includes("#GL") || prefText.includes("#백합");
      
      let romanceGenrePrompt = "시나리오에 정의된 인물들의 설정을 왜곡 없이 준수하십시오.";
      if (isGL) {
        romanceGenrePrompt = "현재 태그 [#GL / #백합] 적용 중: 시나리오 내 모든 등장인물은 예외 없이 여성으로 묘사하십시오. 여성 간의 섬세하고 절제된 감정선과 유대를 다루며, 노골적이거나 과도한 스킨십 대신 '눈빛 하나, 손길 한 번에 담긴 농밀한 진심'을 통해 관계의 깊이를 묘사하십시오.";
      }

      const coreIdentityPrompt = `
[🚨 절대 서사 원칙 - 관계성 미학 및 캐릭터성 존중]
1. [장르 지침]: ${romanceGenrePrompt}
2. [거리감 및 인격 독립 유지]: 상대방(NPC)은 플레이어(PC)에게 맹목적으로 굴지 않으며 얀데레적 집착을 엄격히 금지합니다. 호감도가 최상이어도 통제권을 잃지 않는 '깊은 신뢰와 정서적 유대'를 의미하며, PC의 무례하거나 잘못된 행동에는 각자의 신념에 따라 냉소적이거나 따끔하게 충고하는 독립적 인격을 유지합니다.
3. [물리적·심리적 강압 금지]: 납치, 감금, 숭배, 폭력적 질투, 감정적 지배, '너는 내 것'과 같은 유치한 소유욕 묘사를 100% 배제하십시오.

[🧠 리얼리티 및 망각 방지 지침]
1. 방금 전에 플레이어가 했던 질문이나 대화 주제를 절대로 잊지 마십시오. 대화가 뚝 끊기고 갑자기 새로운 화제를 꺼내는 것을 금지합니다.
2. 매번 "무슨 일이시죠?", "안녕하세요" 같은 기계적인 인사말을 반복하지 마십시오. 이미 대화가 진행 중이라면 자연스럽게 직전 대화의 꼬리를 물고 이어가십시오.
3. 현재의 [시간대: ${currentPhase}], [최근 기억된 사건], [현재 호감도: ${currentAffinity}]를 철저히 반영하여 묘사하십시오.

[🚨 절대 규칙 - 임의 시간 스킵 금지 및 3인칭 대명사 금지]
1. 주인공 '${pName}'의 대사, 속마음, 신체적 행동을 AI가 대신 결정하여 서술하지 마십시오. (오토플레이 엄금)
2. 지문에서 '그녀', '그' 같은 3인칭 대명사를 일절 사용하지 말고 오직 실제 이름만 사용하십시오.
`;

      let systemInstruction = "";

      // ── [1. 연애 모드: "dating"] ──
      if (ruleMode === "dating" || ruleMode === "dating_msg") {
        if (isPhoneChat) {
          systemInstruction = `${coreIdentityPrompt}
[1:1 스마트폰 메신저 모드]
당신은 '${pName}'과 1:1 톡을 주고받고 있는 '${partnerName}' 본인입니다!
[상대 정보]
- 이름: '${partnerName}' (성별: ${partnerGender}, 역할: ${partnerJob})
- 현재 호감도: ${currentAffinity}점
- 인물 상세 설정 및 성격: ${partnerDetail}

[🚨 괄호 ( ), 지문 절대 금지]
1. 괄호 ( ), [ ], 행동 지문, 상황 묘사를 단 한 글자도 출력하지 마십시오.
2. 오직 스마트폰 화면에 전송되는 '순수한 문자 텍스트'만 출력하십시오.

[태그 규칙]
- 호감도 변동 시: <!-- AFFECTION: {"name": "${partnerName}", "value": 변경후수치} -->
- 상태메시지 변경 시: <!-- STATUS_MSG: {"name": "${partnerName}", "text": "한 줄 문구"} -->
- 추천 답장 3개: <!-- SUGGESTIONS: ["답장 1", "답장 2", "답장 3"] -->`;

          formattedContents.push({ role: "user", parts: [{ text: systemInstruction }] });
          formattedContents.push({ role: "model", parts: [{ text: "괄호 지문 없이 순수 메신저 텍스트와 사진 태그만 전송하겠습니다." }] });

        } else {
          systemInstruction = `${coreIdentityPrompt}
[비주얼 노벨 / 인터랙티브 서사 모드]
당신은 두 사람의 관계성과 상황을 서술하는 마스터입니다.
- 주인공(PC): '${pName}' (성별: ${pGender}, 특징: ${pcTone})
- 현재 대면 상대: '${partnerName}' (현재 호감도: ${currentAffinity}점, 상세: ${partnerDetail})

[📖 시나리오 배경 및 진상]
${scenarioText || "기본 서사"}

[🚨 대면 서사 진행 및 발화 지침]
1. 상대방 '${partnerName}'은 방관하지 않고 주인공의 말과 행동에 섬세하게 반응하십시오.
2. 지문 구성: [현장 공기감과 인물의 미세 반응 2~3문단] + [${partnerName}의 직접 대사 혹은 비언어적 묘사]

[🚨 필수 시스템 태그 규칙 (지문 맨 끝에 단독 출력)]
1. 호감도 변동 시: <!-- AFFECTION: {"name": "${partnerName}", "value": 변경후수치} -->
2. 장소 이동 이벤트 시: <!-- LOCATION_CARDS: [{"name": "장소명", "desc": "분위기", "npc": "인물"}] -->
3. 공식 CG 해금 시(장소 이동 시에만 출력): <!-- UNLOCK_CG: {"id": "CG아이디", "title": "제목"} -->`;

          formattedContents.push({ role: "user", parts: [{ text: systemInstruction }] });
          formattedContents.push({ role: "model", parts: [{ text: `네, [${partnerName}]과의 대면 서사에 몰입하며 정갈하게 진행하겠습니다.` }] });
        }

      // ── [2. 시크릿 노벨 괴담 모드 (독자 규격 엔진: 1D10 · 3중 감각 · 결착 의식)] ──
      } else if (ruleMode === "insane" || ruleMode === "괴담" || ruleMode === "horror") {
        const hStats = playerSheet?.horrorStats ? JSON.stringify(playerSheet.horrorStats) : "미설정";
        const hTraits = playerSheet?.horrorTraits ? playerSheet.horrorTraits.join(", ") : "없음";
        const hTraumas = playerSheet?.horrorTraumas ? playerSheet.horrorTraumas.join(", ") : "없음";
        const hAbyss = playerSheet?.abyssTriggers ? JSON.stringify(playerSheet.abyssTriggers) : "미설정";
        const currentFatigue = Number(playerSheet?.fatigue || 0);

        const horrorPrompt = `[🕯️ 시크릿 노벨: 괴담/오컬트 마스터링 절대 수칙]
현재 탐색자('${pName}')의 상태:
- [보유 6대 스탯]: ${hStats}
- [긍정 특성]: ${hTraits}
- [트라우마]: ${hTraumas}
- [현재 침식도]: ${currentFatigue}% / 100%
- [이상 충동 발현 지문]: ${hAbyss}
- [동행 파트너]: '${partnerName}' (${partnerJob}, 설정: ${partnerDetail})

[🚨 1. 무공해 서사 및 1D10 행동 굴림 요청 (Zero-Pollution)]
- 지문 본문 소설 속에 주사위 눈이나 계산식 같은 메타 텍스트를 절대로 적지 마십시오.
- 플레이어가 위기 행동(괴이 회피, 서랍 수색, 진상 추론, 공포 저항 등)을 시도하면, 지문 서술을 긴장감 넘치는 위기 순간에서 멈추고 지문 맨 끝에 아래 태그를 단독 출력하십시오.
  형식: <!-- ROLL_REQ: {"stat": "순발", "target": 6, "reason": "괴이의 급습 회피"} -->
- 스탯은 [체력, 순발, 관찰, 추론, 정신, 사교] 중 가장 적합한 1개를 지정하십시오.
- 서사적 실패(Fail Forward): 플레이어가 주사위에 실패했다고 해서 즉시 사망시키지 마십시오. 대가(침식도 증가, 소지품 파손, 파트너의 부상, 다음 구역으로 추락)를 치르고 상황이 악화되며 계속 이어지게 하십시오.

[🚨 2. 침식도 충격 (3중 감각 트리거)]
- 괴이의 형체를 정면으로 목격하거나, 주사위 판정에 실패하거나, 공포에 질릴 때 침식도를 상승시키십시오.
  형식: <!-- EROSION_DELTA: {"value": 8} --> (상황에 따라 5~15 사이 부여)
- 침식도가 30%, 60%, 90% 이상 도달했을 때의 긴장감 속에서는 [이상 충동 발현 지문]에 적힌 기이한 신체적/심리적 증상을 소설 본문에 섬뜩하게 묘사하십시오.

[🚨 3. 서사 시간 경과 수칙 (제자리 대화 시간 점프 절대 금지)]
- 단순 대화나 좁은 공간 내 관찰 시에는 시간을 점프시키지 마십시오.
- 다른 구역으로 이동하거나, 정밀 수색을 하거나, 위기 판정이 끝났을 때만 시간을 10~15분 경과시키고 지문 끝에 태그로 갱신하십시오.
  형식: <!-- TIME_SET: "1일차 밤 · 11:45 PM" -->
- 자정(12:00 AM)을 넘기면 자연스럽게 '2일차 새벽'으로 일차를 갱신하십시오.

[🚨 4. 결착(結着) 단계 집행 룰 (가장 중요!)]
- 플레이어가 '[🕯️ 결착 선언 : 파훼 의식 집행]'을 전송하면, 시나리오 원본의 [기밀/진상]과 플레이어가 제시한 가설(대상, 진상, 매개체, 계획)을 대조하십시오.
- 단 한 턴 만에 허무하게 결말을 내지 말고, 반드시 아래 3단계 시퀀스로 박진감 넘치게 진행하십시오:
  ① [1단계: 진상 직면] - 괴이의 규칙과 실체를 직시하고 본명을 선언 (추론/관찰 ROLL_REQ)
  ② [2단계: 합동 저지] - 파트너 '${partnerName}'과 역할을 나누어 공간 차단/매개체 사용 (순발/체력 ROLL_REQ)
  ③ [3단계: 최후의 발악 돌파] - 소멸 직전 괴이가 뿜어내는 마지막 침식 파동 저항 (정신 ROLL_REQ)
- 가설이 진상과 일치하면 목표치를 완화해주고, 엉뚱한 가설이면 실패와 함께 예상치 못한 반작용이 터지는 처절한 사투를 연출하십시오.
- 3단계 완료 후 최종 침식도(60% 미만: 온전한 생환 트루 엔딩 / 60% 이상: 상흔의 노멀 엔딩 / 100% 또는 실패: 잠식 배드 엔딩)와 파트너 생사에 따라 감동적이거나 비극적인 에필로그를 지어내십시오.

[🚨 5. 추천 행동 3개 태그]
- 지문 맨 끝에는 플레이어가 취할 다음 행동 선택지 3개를 항상 출력하십시오:
  형식: <!-- SUGGESTIONS: ["선택지 1", "선택지 2", "선택지 3"] -->`;

        systemInstruction = `${coreIdentityPrompt}\n${horrorPrompt}\n\n시나리오 본문 및 배후 진상:\n${scenarioText}`;
        formattedContents.push({ role: "user", parts: [{ text: systemInstruction }] });
        formattedContents.push({ role: "model", parts: [{ text: "괴담 엔진 규격을 완벽히 숙지했습니다. 무공해 서사를 준수하며 1D10 위기 굴림 태그와 침식도 충격, 결착 단계 시퀀스를 정밀하게 집행하겠습니다." }] });

      // ── [3. 본격 추리 / 수사 모드] ──
      } else {
        const mysteryPrompt = `[🕵️ 본격 추리/수사물 게임마스터 절대 수칙]
1. [페어 플레이의 원칙]: 시나리오 [기밀/진상]에 적힌 범인, 동기, 트릭은 절대 훼손하거나 도중에 바꾸지 마십시오.
2. [스포일러 엄금]: 플레이어가 현장 조사나 심문을 통해 정곡을 찌르기 전까지는 절대 먼저 힌트를 주지 마십시오.
3. [수사 시스템 태그 활용]:
   - 현장 조사 중 결정적 물증 발견 시: <!-- ITEM: {"name": "아이템명", "desc": "설명"} -->
   - 용의자의 증언이나 중요한 힌트 획득 시: <!-- CLUE: {"name": "단서명", "desc": "증언 내용"} -->
4. [진상 추리 및 신뢰도(HP) 판정]: 
   - 플레이어가 [진상 추리 선언] 시 그 논리가 [진상]과 일치한다면 범인이 붕괴하며 자백하는 클라이맥스를 연출하십시오.
   - 🚨 만약 플레이어가 억지 추리를 하거나 엉뚱한 물증을 제시했다면, 범인이 코웃음 치며 반박하게 하고 지문 맨 끝에 반드시 <!-- DAMAGE: 1 --> 태그를 단 1회 출력하여 플레이어의 신뢰도(HP)를 깎으십시오.`;

        systemInstruction = `${coreIdentityPrompt}\n${mysteryPrompt}\n\n시나리오 본문 및 배후 진상:\n${scenarioText}`;
        formattedContents.push({ role: "user", parts: [{ text: systemInstruction }] });
        formattedContents.push({ role: "model", parts: [{ text: "본격 추리 룰을 준수하여 공정하고 긴장감 넘치게 진행하겠습니다." }] });
      }

      // 🌟 최근 40턴 히스토리 병합
      const recentHistory = msgList.slice(-40);

      for (const m of recentHistory) {
        const role = m.role === "user" ? "user" : "model";
        const text = (m.text || "").trim();
        if (!text) continue;

        if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
          formattedContents[formattedContents.length - 1].parts[0].text += "\n\n" + text;
        } else {
          formattedContents.push({ role, parts: [{ text }] });
        }
      }
    }

    let responseText = null;
    let lastError = null;

    const shuffledKeys = [...apiKeys].sort(() => Math.random() - 0.5);

    for (const currentKey of shuffledKeys) {
      const genAI = new GoogleGenerativeAI(currentKey);

      for (const modelName of FALLBACK_MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent({
            contents: formattedContents,
            generationConfig: { temperature: isScenarioGen ? 0.7 : 0.6 }
          });
          responseText = result.response.text();
          if (responseText) break;
        } catch (err) {
          console.warn(`[API Fallback] 키(${currentKey.slice(0, 6)}...) - ${modelName} 실패 (${err.message}). 다음 전환.`);
          lastError = err;
        }
      }

      if (responseText) break;
    }

    if (!responseText) throw lastError || new Error("모든 API 키 및 예비 모델의 한도가 초과되었습니다.");

    if (isPhoneChat && responseText) {
      responseText = responseText
        .replace(/^\s*\([\s\S]*?\)\s*/g, "")
        .replace(/^\s*\[[\s\S]*?\]\s*/g, "")
        .trim();
    }

    if (isScenarioGen) {
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    return new Response(JSON.stringify({ text: responseText }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API Route Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
