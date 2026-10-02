import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60; 
export const dynamic = "force-dynamic";
  
// 🌟 사용자님의 모델 세팅 완벽하게 유지!
const FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
];

export async function POST(req) {
  try {
    const { rawText, imageData, pcName, kpcName, kpcDetail, playPreference, ruleMode } = await req.json();

    // 🌟 사용자님의 API 키 로직 완벽하게 유지!
    const rawKeys = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key || "";
    const apiKeys = rawKeys.split(",").map(k => k.trim()).filter(Boolean);
    
    if (apiKeys.length === 0) {
      throw new Error("서버에 등록된 API 키가 없습니다.");
    }

    const isDatingSim = ruleMode === "dating" || ruleMode === "dating_msg";
    const isHorror = ruleMode === "괴담" || ruleMode === "insane";
    
    let modeSpecificRules = "";
    if (isDatingSim) {
      modeSpecificRules = `1. 미연시 원본 스크립트 보존 (개변 금지): 이 문서는 대사와 지문이 정해져 있는 미연시 스크립트입니다. '도입부(openingScene)'를 추출할 때, 소설처럼 과도하게 윤색하거나 문장을 새로 지어내지 마십시오. 오직 'KPC', 'PC' 등의 단어만 제공된 실제 이름(${pcName || '주인공'}, ${kpcName || '파트너'})으로 치환하고, 원래 정해진 대사와 지문의 형태를 100% 그대로 추출하십시오.`;
    } else if (isHorror) {
      modeSpecificRules = `1. 서스펜스 및 호러 톤 앤 매너 조절: 시놉시스와 서막 추출 시, 미지의 존재에 대한 압박감과 기괴한 분위기를 점진적으로 조성하십시오.
2. 시스템 용어 제거: TRPG 룰북의 기계적인 시스템 용어(광기, 이성치, 주사위 판정 등)는 이야기의 몰입을 깨므로 완전히 삭제하고 문학적인 지문으로 대체하십시오.`;
    } else {
      modeSpecificRules = `1. TRPG 맞춤 개변 및 호흡 조절 (급전개 방지): 제공된 캐릭터 관계성을 반영하되, 여러 사건을 하나의 문단에 성급하게 압축하지 마십시오. 평온한 순간과 위기가 닥치는 순간 사이의 간극을 살려 섬세하고 절제된 문장으로 묘사하십시오. 장면이 전환되거나 새로운 인물이 등장할 때는 반드시 줄바꿈(\\n\\n)을 적극적으로 사용하여 플레이어가 읽는 호흡을 늦춰주십시오.
2. 시스템 룰 완벽 필터링: 특정 TRPG 상표권(CoC, 인세인 등)을 연상시키는 시스템 용어(예: 이성치, 광기, 판정 주사위 등)를 서막과 시놉시스에서 완벽하게 삭제하십시오.`;
    }
    
    const systemPrompt = `
당신은 TRPG 및 비주얼 노벨 데이터 파싱의 최고 전문가입니다.
제공된 문서(텍스트/이미지)를 완벽하게 분석하여 아래의 JSON 포맷으로 추출하십시오.

[현재 로비에 설정된 캐릭터 및 룰 데이터]
- 주인공(PC) 이름: ${pcName || '주인공'}
- 파트너(KPC) 이름: ${kpcName || '파트너'}
- 파트너 설정 및 관계: ${kpcDetail || '알 수 없음'}
- 룰 모드: ${ruleMode || '미지정'}

[🚨 서사 개변 및 데이터 추출 절대 규칙]
${modeSpecificRules}
3. 요약 금지: 원문에 있는 감각적인 묘사나 대사 등은 절대 요약하거나 생략하지 말고 풍성하게 살려 길게 추출하십시오.
4. 강제 빈칸 규칙: 문서가 캐릭터 시트라서 시나리오 서막이나 진상 내용이 없다면 억지로 지어내지 말고 해당 필드는 강제로 "" (빈 문자열)로 둡니다.
5. 🚨 JSON 문법 엄수: 배열(Array) 내부의 객체(Object)들 사이에는 반드시 쉼표(,)를 넣으십시오. 따옴표나 괄호가 누락되어 파싱 에러가 발생하지 않도록 출력 전 완벽하게 검증하십시오.
6. 마크다운(\`\`\`json 등) 없이 오직 순수 JSON 문자열만 출력해야 합니다.

[필수 반환 JSON 구조]
{
  "scenarioTitle": "",
  "publicSynopsis": "",
  "openingScene": "줄바꿈(\\n\\n)을 2~3회 이상 활용하여 섬세하고 절제된 호흡으로 개변된 도입부 지문 (급전개 절대 방지)",
  "hiddenTruth": "단순한 흑막의 정체뿐만 아니라, [시나리오 전체의 진행 흐름(각 장소별 조사 기믹), 이벤트 발생 조건, 모든 엔딩 분기 조건]을 AI 디렉터가 완벽하게 게임을 진행할 수 있도록 빠짐없이 아주 상세한 가이드 형태로 요약하십시오.",
  "pcName": "",
  "pcJob": "",
  "pcAge": "",
  "pcGender": "",
  "pcBackground": "",
  "pcMission": "",
  "pcSecret": "",
  "npcs": [
    {
      "name": "문서에서 추출한 인물 이름",
      "job": "",
      "detail": "",
      "secret": ""
    }
  ],
  "handouts": [
    { "title": "단서명/구역명", "overview": "발견 위치 및 겉모습", "secret": "조사 성공 시 밝혀질 이면" }
  ],
  "cgList": [
    { "title": "이벤트 CG 명칭", "condition": "CG가 해금되는 구체적인 상황이나 조건" }
  ],
  "routeList": [
    { "routeName": "분기점이나 선택지의 묘사", "targetName": "호감도가 변하는 대상의 이름 (정확히 일치해야 함)", "affectionChange": "호감도 변화량 (예: +10, -5)" }
  ]
}`;

    const promptParts = [{ text: systemPrompt }];
    if (rawText) promptParts.push({ text: `[문서 원문]\n${rawText}` });
    if (imageData) {
      promptParts.push({
        inlineData: { data: imageData.base64, mimeType: imageData.mimeType }
      });
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
            generationConfig: { 
              temperature: isDatingSim ? 0.1 : 0.35, 
              responseMimeType: "application/json" 
            } 
          });

          responseText = result.response.text();
          if (responseText) break; 
        } catch (err) {
          console.warn(`[Parse Fallback] ${modelName} 실패: ${err.message}`);
          lastError = err;
          continue; 
        }
      }
      if (responseText) break;
    }

    if (!responseText) throw lastError || new Error("API 한도 초과");

    let cleanText = responseText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    try {
      JSON.parse(cleanText); 
    } catch (parseError) {
      console.error("AI JSON 파싱 오류 발생. 원본 텍스트:", cleanText);
      throw new Error("AI가 시나리오를 분석하는 도중 데이터 양식이 살짝 어긋났습니다. 파일 첨부나 붙여넣기를 다시 한 번 시도해주세요!");
    }

    return new Response(cleanText, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Scenario Parse Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
