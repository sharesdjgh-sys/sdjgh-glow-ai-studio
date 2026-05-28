import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import OpenAI, { toFile } from "openai";

export const maxDuration = 60;

const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const QUALITY_SUFFIX =
  "Photorealistic, ultra-detailed, sharp focus, professional photography, natural skin texture, vivid colors, cinematic lighting, 2K quality.";

const OUTFIT_OVERRIDE =
  "IMPORTANT: Meticulously preserve the exact facial features, natural age, hairstyle, and unique appearance of the person in the reference photo. Do not make them look older or younger; keep their authentic natural age exactly as shown. Depict them wearing stylish, trendy everyday casual street clothes — such as a fashionable jacket, modern sweater, neat hoodie, or stylish casual attire — keeping their face, age, and identity perfectly identical.";

function buildPrompt(hasCelebImage: boolean, celebrity?: string): string {
  if (hasCelebImage) {
    return `A fun candid snapshot of two people who just ran into each other on the street. The person from the FIRST reference photo is standing side by side with the person from the SECOND reference photo on a casual urban sidewalk, both smiling at the camera — one looking genuinely excited and delighted, the other being friendly and warm. No posing, no physical contact, just a natural gap between them. The background is a softly blurred city street with warm ambient light — storefronts, gentle bokeh, everyday urban atmosphere. Shot on a smartphone, candid and authentic feel. ${QUALITY_SUFFIX} ${OUTFIT_OVERRIDE}`;
  }

  const celebDesc = celebrity
    ? `the Korean celebrity ${celebrity}`
    : "a friendly celebrity idol";
  return `A fun candid snapshot of a person from the reference photo who just ran into ${celebDesc} on a busy city sidewalk and asked a passerby to take a quick photo. The fan stands beaming with excitement next to ${celebDesc} who is smiling warmly. Accurately depict ${celebDesc}'s real appearance — face, hair, and outfit. Both standing side by side, no physical contact, natural gap, completely unplanned vibe. Background is a softly blurred urban street with warm bokeh light — storefronts, gentle city atmosphere. Shot on a smartphone, candid feel. ${QUALITY_SUFFIX} ${OUTFIT_OVERRIDE}`;
}

async function generateWithGemini(
  selfieData: string,
  prompt: string,
  celebData?: string
) {
  const parts: Part[] = [
    { text: prompt },
    { inlineData: { mimeType: "image/jpeg", data: selfieData } },
  ];
  if (celebData) {
    parts.push({ inlineData: { mimeType: "image/jpeg", data: celebData } });
  }

  const model = geminiClient.getGenerativeModel({
    model: "gemini-3.1-flash-image-preview",
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig: { responseModalities: ["IMAGE"] } as never,
  });

  const imgPart = result.response.candidates?.[0]?.content?.parts?.find(
    (p) => (p as { inlineData?: { data: string; mimeType: string } }).inlineData?.data
  ) as { inlineData: { data: string; mimeType: string } } | undefined;

  if (!imgPart) throw new Error("이미지 생성에 실패했습니다.");

  const { data, mimeType } = imgPart.inlineData;
  return `data:${mimeType};base64,${data}`;
}

async function generateWithOpenAI(
  selfieData: string,
  prompt: string,
  celebData?: string
) {
  const selfieBuffer = Buffer.from(selfieData, "base64");
  const selfieFile = await toFile(selfieBuffer, "selfie.png", { type: "image/png" });

  type EditImage = Parameters<typeof openaiClient.images.edit>[0]["image"];
  let images: EditImage;

  if (celebData) {
    const celebBuffer = Buffer.from(celebData, "base64");
    const celebFile = await toFile(celebBuffer, "celeb.png", { type: "image/png" });
    images = [selfieFile, celebFile];
  } else {
    images = selfieFile;
  }

  const result = await openaiClient.images.edit({
    model: "gpt-image-2",
    image: images,
    prompt,
    n: 1,
    size: "1024x1024",
  });

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("이미지 생성에 실패했습니다.");
  return `data:image/png;base64,${b64}`;
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, celebrity, celebrityImageBase64, model } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });
    }

    const selfieData = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const hasCelebImage = !!celebrityImageBase64;
    const prompt = buildPrompt(hasCelebImage, celebrity);
    const celebData = hasCelebImage
      ? (celebrityImageBase64 as string).replace(/^data:image\/\w+;base64,/, "")
      : undefined;

    const imageUrl =
      model === "Duct Tape"
        ? await generateWithOpenAI(selfieData, prompt, celebData)
        : await generateWithGemini(selfieData, prompt, celebData);

    return NextResponse.json({ imageUrl });
  } catch (err: unknown) {
    console.error("Star Me generation error:", err);

    let isSafetyBlock = false;
    if (err instanceof Error) {
      const errMsg = err.message.toLowerCase();
      if (
        errMsg.includes("safety") ||
        errMsg.includes("blocked") ||
        errMsg.includes("moderation") ||
        errMsg.includes("policy") ||
        errMsg.includes("candidate")
      ) {
        isSafetyBlock = true;
      }
    }

    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "moderation_blocked"
    ) {
      isSafetyBlock = true;
    }

    if (isSafetyBlock) {
      return NextResponse.json(
        {
          error: "safety_blocked",
          message: "AI 안전 정책(미성년자 보호 또는 교복 감지)에 의해 생성이 제한되었습니다. 얼굴이 선명하게 나오고 교복이 아닌 일반 일상복을 입은 사진으로 다시 시도해 주세요.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ error: "이미지 생성에 실패했습니다. 다시 시도해주세요." }, { status: 500 });
  }
}
