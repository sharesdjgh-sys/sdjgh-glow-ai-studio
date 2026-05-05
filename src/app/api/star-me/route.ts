import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

export const maxDuration = 120;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildPrompt(celebrity: string, hasCelebImage: boolean): string {
  if (hasCelebImage) {
    return `A spontaneous street encounter photo. The person from the FIRST reference photo just ran into the person from the SECOND reference photo${celebrity ? ` (${celebrity})` : ""} on the street and asked a passerby to take a quick photo together. Both are standing side by side on a casual urban sidewalk, smiling naturally at the camera — the fan looking genuinely excited and starstruck, the celebrity being friendly and easy-going. No posing, no physical contact, just a natural gap between them. The background is a softly blurred city street with warm ambient light — storefronts, gentle bokeh, everyday urban atmosphere. Shot on a smartphone, candid and authentic feel, photorealistic, high resolution.`;
  }

  if (celebrity) {
    return `A spontaneous street encounter photo. The person from the reference photo just bumped into ${celebrity} on the street and asked a passerby to take a quick photo together. Both are standing side by side on a casual urban sidewalk — the fan beaming with excitement, ${celebrity} smiling warmly and naturally. No physical contact, natural gap between them, completely unplanned vibe. The background is a softly blurred city street with warm ambient light — storefronts, gentle bokeh, everyday urban atmosphere. Shot on a smartphone, candid and authentic feel, photorealistic, high resolution.`;
  }

  return `A spontaneous street encounter photo. The person from the reference photo just ran into Nick Wilde and Judy Hopps from Zootopia on a busy city sidewalk and asked a passerby to take a quick photo. The fan stands in the center beaming with excitement. Nick Wilde (the sly red fox in his green shirt and striped tie) stands casually on the left with a confident smirk. Judy Hopps (the cheerful gray rabbit police officer in her blue uniform) stands energetically on the right. No physical contact between them, natural gaps, completely unplanned vibe. Background is a softly blurred urban street with warm bokeh light. Shot on a smartphone, candid feel, photorealistic human blended seamlessly with high-quality animated characters, high resolution.`;
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
    const prompt = buildPrompt(celebrity ?? "", hasCelebImage);

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
