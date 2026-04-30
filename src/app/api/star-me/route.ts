import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, celebrity } = await request.json();
    if (!imageBase64 || !celebrity) {
      return NextResponse.json({ error: "이미지 또는 연예인 이름이 없습니다." }, { status: 400 });
    }

    // Strip data URL prefix
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: {
        // @ts-expect-error - responseModalities is valid for image generation models
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    const prompt = `Create a photorealistic image of two people posing together for a photo:
1. The person from the reference photo (preserve their face, skin tone, and distinctive features accurately)
2. ${celebrity} (the famous Korean celebrity)

Style requirements:
- Natural candid photo together, like real friends taking a selfie or photo booth picture
- Warm indoor studio lighting, slightly blurred background
- Both people smiling naturally and looking at the camera
- High quality, photorealistic, 4:5 portrait ratio
- The reference person's face must be clearly recognizable`;

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
