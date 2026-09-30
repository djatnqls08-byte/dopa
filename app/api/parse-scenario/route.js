import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60; 
export const dynamic = "force-dynamic";

const FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
];

export async function POST(req) {
  try {
    const body = await req.json();
    const { rawText, imageData, pcName, kpcName, kpcDetail, ruleMode } = body;

    const rawKeys = process.env.GEMINI_API_KEY || "";
    const apiKeys = rawKeys.split(",").map(k => k.trim()).filter(Boolean);
    
    if (apiKeys.length === 0) throw new Error("서버에 등록된 API 키가 없습니다.");

    const modeSpecificRules = (ruleMode === "dating" || ruleMode === "dating_msg")
      ? `1. 원본 대사 및 지문 100% 보존: 과도한 윤색 없이 제공된 이름(${pcName \vert{}\vert{} '주인공'}, ${kpcName || '파트너'})으로만 치환하십시오.`
      : `1. 범용 엔진화 및 호흡 조절: 특정 TRPG 상표권(CoC, 인세인 등)을 연상시키는 시스템 용어(예: SAN치, 판정 주사위 등)를 서막과 시놉시스에서 완벽히 삭제하십시오. 여유로운 호흡을 위해 줄바꿈(\\n\\n)을 2~3회 이상 사용하십시오.`;

    const systemPrompt = `당신은 텍스트 인터랙티브 스토리 데이터 파싱 전문가입니다.
제공된 문서를 완벽히 분석하여 당사의 독자 규격 JSON 포맷으로 추출하십시오.

[현재 캐릭터 및 룰 설정]
- 주인공 이름: ${pcName || '주인공'}
- 파트너 이름: ${kpcName || '파트너'}
- 룰 모드: ${ruleMode || '미지정'}

[🚨 서사 개변 및 추출 절대 규칙]
${modeSpecificRules}
2. 강제 빈칸 규칙: 원문에 해당 내용이 없다면 억지로 지어내지 말고 "" (빈 문자열)로 처리하십시오.
3. 마크다운(\`\`\`json 등) 없이 오직 순수 JSON 문자열만 출력해야 합니다.

[필수 반환 JSON 구조]
{
  "scenarioTitle": "사건/에피소드 명",
  "publicSynopsis": "시스템 용어가 배제된 순수 세계관 및 배경 설명",
  "openingScene": "줄바꿈(\\n\\n)을 활용해 플레이어의 시각에서 묘사된 서막 지문",
  "hiddenTruth": "진범, 트릭, 엔딩 분기 등 마스터 전용 기밀 요약",
  "pcName": "${pcName || ''}",
  "pcJob": "",
  "pcAge": "",
  "pcGender": "",
  "pcBackground": "",
  "pcMission": "",
  "pcSecret": "",
  "npcs": [
    { "name": "인물 이름", "job": "역할", "detail": "외모/성격", "secret": "숨겨진 진심이나 약점" }
  ],
  "handouts": [
    { "title": "단서명/구역명", "overview": "발견 위치 및 겉모습", "secret": "조사 성공 시 밝혀질 이면" }
  ]
}`;

    const promptParts = [{ text: systemPrompt }];
    if (rawText) promptParts.push({ text: `[문서 원문]\n${rawText.slice(0, 40000)}` });
    if (imageData && imageData.base64) {
      promptParts.push({ inlineData: { data: imageData.base64, mimeType: imageData.mimeType || "image/jpeg" } });
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
            contents: [{ role: "user", parts: promptParts }],
            generationConfig: { temperature: 0.2 }
          });
          responseText = result.response.text();
          if (responseText) break; 
        } catch (err) {
          lastError = err;
        }
      }
      if (responseText) break;
    }

    if (!responseText) throw lastError || new Error("API 한도 초과");

    let cleanText = responseText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    try {
      JSON.parse(cleanText);
    } catch (e) {
      throw new Error("파싱된 데이터 형식이 올바르지 않습니다. 다시 시도해주세요.");
    }

    return new Response(cleanText, { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Parse Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
