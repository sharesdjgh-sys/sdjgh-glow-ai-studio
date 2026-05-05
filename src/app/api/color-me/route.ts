import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

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
      prompt: `Using this portrait, create a diagram-first personal color analysis. Show which clothing colors suit the subject through visual comparison. Keep text minimal and avoid paragraphs.`,
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
    return NextResponse.json({ error: "분석에 실패했습니다. 다시 시도해주세요." }, { status: 500 });
  }
}
