import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

export const maxDuration = 120;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const OUTFIT_OVERRIDE =
  "IMPORTANT: If any person in the reference photo is wearing a school uniform (blazer with school emblem, uniform shirt, uniform skirt or trousers), replace it with stylish casual street clothes — e.g. a trendy jacket, jeans, or a fashionable outfit — while keeping their face, hairstyle, and overall appearance identical.";

function buildPrompt(hasCelebImage: boolean, celebrity?: string): string {
  if (hasCelebImage) {
    return `A fun candid snapshot of two people who just ran into each other on the street. The person from the FIRST reference photo is standing side by side with the person from the SECOND reference photo on a casual urban sidewalk, both smiling at the camera — one looking genuinely excited and delighted, the other being friendly and warm. No posing, no physical contact, just a natural gap between them. The background is a softly blurred city street with warm ambient light — storefronts, gentle bokeh, everyday urban atmosphere. Shot on a smartphone, candid and authentic feel, high quality. ${OUTFIT_OVERRIDE}`;
  }

  const celebDesc = celebrity
    ? `the Korean celebrity ${celebrity}`
    : "a friendly celebrity idol";
  return `A fun candid snapshot of a person from the reference photo who just ran into ${celebDesc} on a busy city sidewalk and asked a passerby to take a quick photo. The fan stands beaming with excitement next to ${celebDesc} who is smiling warmly. Accurately depict ${celebDesc}'s real appearance — face, hair, and outfit. Both standing side by side, no physical contact, natural gap, completely unplanned vibe. Background is a softly blurred urban street with warm bokeh light — storefronts, gentle city atmosphere. Shot on a smartphone, candid feel, high quality. ${OUTFIT_OVERRIDE}`;
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, celebrity, celebrityImageBase64 } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });
    }

    const selfieData = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const selfieBuffer = Buffer.from(selfieData, "base64");
    const selfieFile = await toFile(selfieBuffer, "selfie.jpg", { type: "image/jpeg" });

    const hasCelebImage = !!celebrityImageBase64;
    const prompt = buildPrompt(hasCelebImage, celebrity);

    const images: Awaited<ReturnType<typeof toFile>>[] = [selfieFile];

    if (hasCelebImage) {
      const celebData = (celebrityImageBase64 as string).replace(/^data:image\/\w+;base64,/, "");
      const celebBuffer = Buffer.from(celebData, "base64");
      const celebFile = await toFile(celebBuffer, "celebrity.jpg", { type: "image/jpeg" });
      images.push(celebFile);
    }

    const result = await client.images.edit({
      model: "gpt-image-2",
      image: images.length === 1 ? images[0] : images,
      prompt,
      n: 1,
      size: "1024x1536",
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "이미지 생성에 실패했습니다." }, { status: 500 });
    }
    return NextResponse.json({ imageUrl: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "이미지 생성에 실패했습니다. 다시 시도해주세요." }, { status: 500 });
  }
}
