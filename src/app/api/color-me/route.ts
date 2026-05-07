import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

export const maxDuration = 120;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");
    const imageFile = await toFile(imageBuffer, "portrait.jpg", { type: "image/jpeg" });

    const result = await client.images.edit({
      model: "gpt-image-2",
      image: imageFile,
      prompt: `업로드된 인물 사진을 기반으로 퍼스널 컬러 드레이핑 분석 대시보드를 생성해 줘.
모든 텍스트는 한국어로 작성하고, 결과는 9:16 비율의 하나의 이미지로 만들어 줘.
얼굴 중심으로 피부 톤(밝기, 채도, 언더톤), 눈동자, 머리색, 대비감 분석.
조명 영향을 고려해 실제 컬러 기준으로 판단. 얼굴 및 원본 이미지는 절대 변경하지 않기.

[구성]
1. 상단
- "퍼스널 컬러 분석 리포트"
- 웜톤 / 쿨톤 / 뉴트럴 요약
- 세부 타입 (예: 봄 웜 라이트, 겨울 쿨 딥)

2. 중앙 (핵심)
- 얼굴을 중심에 배치
- 4x2 컬러(총 8개)를 얼굴과 직접 비교되도록 구성
  • 각 색상을 배경 또는 천처럼 얼굴 뒤에 적용
  • 또는 얼굴 + 색상 미니 비교 프레임으로 구성
- 색상에 따라 얼굴이 밝아 보이거나 칙칙해 보이는 차이를 명확히 표현

3. 분석
- 피부 톤 / 눈동자 / 헤어 / 전체 인상
- 컬러 비교 기반으로 어울림 vs 안어울림 설명

4. 하단
- [추천 컬러]
- [피해야 할 컬러] (이유 포함)
- [스타일링 제안]

[스타일]
- 실제 퍼스널컬러 진단 느낌
- 깔끔하고 프리미엄한 대시보드 디자인
- 자연스러운 피부 표현, 과한 효과 금지`,
      quality: "high",
      n: 1,
      size: "1024x1536",
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "이미지 생성에 실패했습니다." }, { status: 500 });
    }
    return NextResponse.json({ imageUrl: `data:image/png;base64,${b64}` });
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
