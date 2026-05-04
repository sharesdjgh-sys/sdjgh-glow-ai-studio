import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

function buildPrompt(celebrity: string, hasCelebImage: boolean): string {
  if (hasCelebImage) {
    return `A spontaneous street encounter photo. The person from the FIRST reference photo just ran into the person from the SECOND reference photo${celebrity ? ` (${celebrity})` : ""} on the street and asked a passerby to take a quick photo together. Both are standing side by side on a casual urban sidewalk, smiling naturally at the camera — the fan looking genuinely excited and starstruck, the celebrity being friendly and easy-going. No posing, no physical contact, just a natural gap between them. The background is a softly blurred city street with warm ambient light — storefronts, gentle bokeh, everyday urban atmosphere. Shot on a smartphone, candid and authentic feel, photorealistic, high resolution.`;
  }

  if (celebrity) {
    return `A spontaneous street encounter photo. The person from the reference photo just bumped into ${celebrity} on the street and asked a passerby to take a quick photo together. Both are standing side by side on a casual urban sidewalk — the fan beaming with excitement, ${celebrity} smiling warmly and naturally. No physical contact, natural gap between them, completely unplanned vibe. The background is a softly blurred city street with warm ambient light — storefronts, gentle bokeh, everyday urban atmosphere. Shot on a smartphone, candid and authentic feel, photorealistic, high resolution.`;
  }

  // Default: Nick Wilde & Judy Hopps scene
  return `A spontaneous street encounter photo. The person from the reference photo just ran into Nick Wilde and Judy Hopps from Zootopia on a busy city sidewalk and asked a passerby to take a quick photo. The fan stands in the center beaming with excitement. Nick Wilde (the sly red fox in his green shirt and striped tie) stands casually on the left with a confident smirk. Judy Hopps (the cheerful gray rabbit police officer in her blue uniform) stands energetically on the right. No physical contact between them, natural gaps, completely unplanned vibe. Background is a softly blurred urban street with warm bokeh light. Shot on a smartphone, candid feel, photorealistic human blended seamlessly with high-quality animated characters, high resolution.`;
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, celebrity, celebrityImageBase64 } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });
    }

    const selfieBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const hasCelebImage = !!celebrityImageBase64;

    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-image-preview",
      generationConfig: {
        // @ts-expect-error - responseModalities is valid for image generation models
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    const prompt = buildPrompt(celebrity ?? "", hasCelebImage);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentParts: any[] = [
      prompt,
      { inlineData: { mimeType: "image/jpeg", data: selfieBase64 } },
    ];

    if (hasCelebImage) {
      const celebBase64 = (celebrityImageBase64 as string).replace(/^data:image\/\w+;base64,/, "");
      contentParts.push({ inlineData: { mimeType: "image/jpeg", data: celebBase64 } });
    }

    const result = await model.generateContent(contentParts);
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
