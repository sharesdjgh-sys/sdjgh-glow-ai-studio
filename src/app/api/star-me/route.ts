import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

export const maxDuration = 60;

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const QUALITY_SUFFIX =
  "Photorealistic, ultra-detailed, sharp focus, professional photography, natural skin texture, vivid colors, cinematic lighting, 2K quality.";

const OUTFIT_OVERRIDE =
  "IMPORTANT: If any person in the reference photo is wearing a school uniform (blazer with school emblem, uniform shirt, uniform skirt or trousers), replace it with stylish casual street clothes — e.g. a trendy jacket, jeans, or a fashionable outfit — while keeping their face, hairstyle, and overall appearance identical.";

function buildPrompt(hasCelebImage: boolean, celebrity?: string): string {
  if (hasCelebImage) {
    return `A fun candid snapshot of two people who just ran into each other on the street. The person from the FIRST reference photo is standing side by side with the person from the SECOND reference photo on a casual urban sidewalk, both smiling at the camera — one looking genuinely excited and delighted, the other being friendly and warm. No posing, no physical contact, just a natural gap between them. The background is a softly blurred city street with warm ambient light — storefronts, gentle bokeh, everyday urban atmosphere. Shot on a smartphone, candid and authentic feel. ${QUALITY_SUFFIX} ${OUTFIT_OVERRIDE}`;
  }

  const celebDesc = celebrity
    ? `the Korean celebrity ${celebrity}`
    : "a friendly celebrity idol";
  return `A fun candid snapshot of a person from the reference photo who just ran into ${celebDesc} on a busy city sidewalk and asked a passerby to take a quick photo. The fan stands beaming with excitement next to ${celebDesc} who is smiling warmly. Accurately depict ${celebDesc}'s real appearance — face, hair, and outfit. Both standing side by side, no physical contact, natural gap, completely unplanned vibe. Background is a softly blurred urban street with warm bokeh light — storefronts, gentle city atmosphere. Shot on a smartphone, candid feel. ${QUALITY_SUFFIX} ${OUTFIT_OVERRIDE}`;
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, celebrity, celebrityImageBase64 } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });
    }

    const selfieData = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const hasCelebImage = !!celebrityImageBase64;
    const prompt = buildPrompt(hasCelebImage, celebrity);

    const parts: Part[] = [
      { text: prompt },
      { inlineData: { mimeType: "image/jpeg", data: selfieData } },
    ];

    if (hasCelebImage) {
      const celebData = (celebrityImageBase64 as string).replace(/^data:image\/\w+;base64,/, "");
      parts.push({ inlineData: { mimeType: "image/jpeg", data: celebData } });
    }

    const model = client.getGenerativeModel({
      model: "gemini-3.1-flash-image-preview",
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: { responseModalities: ["IMAGE"] } as never,
    });

    const imgPart = result.response.candidates?.[0]?.content?.parts?.find(
      (p) => (p as { inlineData?: { data: string; mimeType: string } }).inlineData?.data
    ) as { inlineData: { data: string; mimeType: string } } | undefined;

    if (!imgPart) {
      return NextResponse.json({ error: "이미지 생성에 실패했습니다." }, { status: 500 });
    }

    const { data, mimeType } = imgPart.inlineData;
    return NextResponse.json({ imageUrl: `data:${mimeType};base64,${data}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "이미지 생성에 실패했습니다. 다시 시도해주세요." }, { status: 500 });
  }
}
