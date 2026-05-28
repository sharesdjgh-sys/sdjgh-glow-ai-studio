import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

export const maxDuration = 120;

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const COLOR_PROMPT = `업로드된 인물 사진을 기반으로 최고급 퍼스널 컬러 진단 드레이핑 분석 리포트 대시보드를 생성해 줘.
모든 텍스트는 한국어로 작성하고, 결과는 9:16 비율의 하나의 선명하고 완성도 높은 인포그래픽 이미지로 만들어 줘.
원본 인물의 이목구비, 얼굴 형태, 헤어스타일, 나이를 완벽하게 유지하면서 다음 구성요소를 정교하게 그려 줘.

[레이아웃 및 구성]
1. 상단 (Header)
- 제목: "퍼스널 컬러 분석 리포트" (크고 세련된 타이틀)
- 진단 판정: 웜톤(Warm), 쿨톤(Cool), 뉴트럴(Neutral)에 관한 직관적인 요약 및 선택 표시
- 판정 결과 세부 타입 기재 (예: 여름 쿨 라이트 - "밝고 부드러운 쿨톤 / 가볍고 청초한 인상")

2. 중앙 (Core Visual - A타입 드레이핑 대시보드)
- [대형 중앙 포트레이트]: 원본 인물의 얼굴 및 상반신이 포함된 대형 인물 사진을 정중앙에 고배율로 선명하게 배치.
- [양옆의 소형 드레이핑 비교 프레임]: 중앙 인물 사진의 양옆에, 동일한 인물의 얼굴이 포함된 8개의 작은 세로형 인물 비교 프레임(좌측 4개, 우측 4개)을 깔끔하게 배치.
  • 중요: 양옆의 8개 소형 프레임 각각에는 반드시 **중앙 인물과 동일한 얼굴**이 묘사되어야 함 (색상 칩만 덜렁 있는 것이 절대 아님).
  • 각 소형 프레임 내부에는 동일한 인물이 턱/목 밑에 서로 다른 색상의 드레이핑 천(패브릭)을 두르고 어울림 정도를 비교하는 모습으로 표현.
  • 좌측 열 (BEST 4개 프레임): 쿨톤 계열의 베스트 컬러 천(라이트 핑크, 라벤더, 라이트 블루, 민트)을 턱밑에 정교하게 드레이핑하고 있으며, 각 프레임 상단에 빨간색 'BEST' 배지 및 하단에 한글 색상명 표기.
  • 우측 열 (BAD 4개 프레임): 웜톤 계열의 워스트 컬러 천(크림 옐로우, 피치 코랄, 카멜 브라운, 올리브 카키)을 턱밑에 정교하게 드레이핑하고 있으며, 얼굴이 다소 칙칙하거나 그림자 져 보이고, 각 프레임 상단에 회색 'BAD' 배지 및 하단에 한글 색상명 표기.

3. 분석 (Analysis Block - 4개 카테고리 가로 정렬)
- [피부 톤 분석]: 밝기, 채도, 언더톤 수치 도표 및 "맑고 투명한 핑크빛 피부" 설명 기재
- [눈동자 분석]: 홍채 사진 일러스트와 함께 "다크 브라운 - 흰자와의 대비가 자연스러움" 기재
- [헤어 분석]: 헤어 컬러 견본 및 "다크 브라운 - 쿨톤과 조화가 좋음" 기재
- [전체 인상 분석]: 여성 실루엣 아이콘 및 "맑고 청초한 인상" 기재

4. 하단 (Footer Recommendation)
- [추천 컬러 (BEST)]: 어울리는 8개의 색상 원형 칩 나열 (라이트 핑크, 라벤더, 라이트 블루, 민트, 쿨 핑크, 로즈 핑크 등)
- [피해야 할 컬러 (WHY?)]: 안 어울리는 4개의 색상 원형 칩 나열 (크림 옐로우, 피치 코랄, 카멜 브라운, 올리브 카키) 및 "노란 기가 강하면 피부가 칙칙해 보인다"는 구체적 이유 기재
- [스타일링 제안]: 화장품 아이콘(베스트 메이크업), 목걸이 아이콘(주얼리), 헤어 아이콘(헤어 컬러), 옷걸이 아이콘(의상 톤)의 4개 카드 형태로 메이크업과 스타일링 팁을 레이아웃 정돈하여 깔끔하게 기재.

[디자인 스타일]
- 실제 강남 등의 유명 오프라인 퍼스널 컬러 진단소에서 제공받는 고급스러운 디지털 진단 리포트 대시보드 형태.
- 대칭적이고 정돈된 그리드 구조.
- 과도한 발광 효과, 네온, 유치한 특수효과나 판타지 느낌을 배제하고 오직 사실적인 피부 표현과 정교한 드레이핑 천의 질감, 깔끔하고 베이지와 그레이 톤의 샌드/화이트 프리미엄 스튜디오 배경으로 차분하고 신뢰성 있게 디자인.

[절대 준수 사항 - 오작동 및 감점 요인 차단]
1. 원본 인물의 얼굴 유지: 중앙의 대형 인물 사진뿐만 아니라 양옆의 8개 소형 비교 프레임 내부에 들어가는 얼굴도 모두 업로드된 원본 인물의 이목구비, 헤어스타일, 나이를 동일하게 매칭해야 합니다.
2. 빈 색상 칩 생성 금지: 양옆 of 8개 프레임 내부에 인물 없이 단순한 색상 천이나 빈 텍스처, 혹은 컬러 박스만 덩그러니 채워 넣는 방식을 절대 금지합니다. 모든 프레임은 반드시 동일한 인물이 그 천을 턱밑에 정교하게 두르고 비교하는 "인물 포트레이트" 형식이어야 합니다.
3. 좌우 배지 및 명칭 일치: 좌측 4개 프레임에는 맑고 어울리는 BEST 쿨톤 천과 빨간색 'BEST' 배지를 표시하고, 우측 4개 프레임에는 칙칙하고 어두워 보이는 BAD 웜톤 천과 회색 'BAD' 배지를 명확하게 달아야 합니다. (여름 쿨 라이트 진단 시 웜톤을 베스트로 표기하는 등의 논리 오류를 절대 배제하십시오.)`;

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, model } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    let imageUrl: string;

    if (model === "nanobanana2") {
      const geminiModel = geminiClient.getGenerativeModel({
        model: "gemini-3.1-flash-image-preview",
      });
      const parts: Part[] = [
        { text: COLOR_PROMPT },
        { inlineData: { mimeType: "image/jpeg", data: base64Data } },
      ];
      const geminiResult = await geminiModel.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: { responseModalities: ["IMAGE"] } as never,
      });
      const imgPart = geminiResult.response.candidates?.[0]?.content?.parts?.find(
        (p) => (p as { inlineData?: { data: string; mimeType: string } }).inlineData?.data
      ) as { inlineData: { data: string; mimeType: string } } | undefined;
      if (!imgPart) {
        return NextResponse.json({ error: "이미지 생성에 실패했습니다." }, { status: 500 });
      }
      const { data, mimeType } = imgPart.inlineData;
      imageUrl = `data:${mimeType};base64,${data}`;
    } else {
      const imageBuffer = Buffer.from(base64Data, "base64");
      const imageFile = await toFile(imageBuffer, "portrait.png", { type: "image/png" });
      const openaiResult = await openaiClient.images.edit({
        model: "gpt-image-2",
        image: imageFile,
        prompt: COLOR_PROMPT,
        quality: "high",
        n: 1,
        size: "1024x1536",
      });
      const b64 = openaiResult.data?.[0]?.b64_json;
      if (!b64) {
        return NextResponse.json({ error: "이미지 생성에 실패했습니다." }, { status: 500 });
      }
      imageUrl = `data:image/png;base64,${b64}`;
    }

    return NextResponse.json({ imageUrl });
  } catch (err: unknown) {
    console.error(err);

    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code: string }).code === "moderation_blocked"
    ) {
      return NextResponse.json(
        {
          error:
            "업로드한 사진이 안전 정책에 의해 처리되지 못했습니다. 얼굴이 선명하게 나온 정면 사진으로 다시 시도해 주세요. 선글라스·마스크 착용 사진이나 과도하게 편집된 이미지는 분석이 어려울 수 있습니다.",
          code: "moderation_blocked",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ error: "분석에 실패했습니다. 다시 시도해주세요." }, { status: 500 });
  }
}
