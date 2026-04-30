import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: {
        // @ts-expect-error - responseModalities is valid for image generation models
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    const prompt = `Create a single 3x3 grid collage image (portrait 4:5 ratio) of a Pixar/Disney 3D animated character based on this person's facial features.

The 3x3 grid must show exactly 9 panels, each with the SAME character showing a DIFFERENT emotion:
Row 1: 놀람(Surprise) | 짜증(Annoyance) | 혼란(Confusion)
Row 2: 좌절(Frustration) | 사려깊음(Thoughtful) | 빈정거림(Sarcasm)
Row 3: 걱정(Worry) | 지루함(Boredom) | 호기심(Curiosity)

Style requirements:
- Pixar/Disney 3D animation style, high-quality render
- Pure white background for each panel
- 3-point studio lighting
- Each panel: character centered, bust shot (head and upper body)
- Each panel has the emotion label in Korean at the bottom in a clean sans-serif font
- Thin light gray border between panels
- Character maintains consistent appearance across all 9 panels
- Expressive, exaggerated emotions characteristic of Pixar animation
- Suitable for printing at high quality`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      },
    ]);

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts ?? [];

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        const imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        return NextResponse.json({ imageUrl: imageData });
      }
    }

    return NextResponse.json({ error: "이미지 생성에 실패했습니다." }, { status: 500 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "이미지 생성에 실패했습니다. 다시 시도해주세요." }, { status: 500 });
  }
}
