import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are a professional personal color consultant. Analyze the person's photo and return a JSON object with their personal color type. Always respond in JSON only, no markdown.`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageBase64, detail: "low" },
            },
            {
              type: "text",
              text: `Analyze this person's personal color type based on their skin tone, eye color, and hair color. Return a JSON object with this exact structure:
{
  "colorType": "봄 웜톤" | "여름 쿨톤" | "가을 웜톤" | "겨울 쿨톤",
  "colorTypeEn": "Spring Warm" | "Summer Cool" | "Autumn Warm" | "Winter Cool",
  "description": "2-3 sentences in Korean describing their characteristics",
  "bestColors": [
    { "name": "Korean color name", "hex": "#XXXXXX" }
  ],
  "avoidColors": [
    { "name": "Korean color name", "hex": "#XXXXXX" }
  ],
  "fashionKeywords": ["keyword1", "keyword2", "keyword3"],
  "lipColor": "#XXXXXX",
  "eyeshadowColor": "#XXXXXX",
  "celebrities": ["celebrity name in Korean"]
}
bestColors must have 6 items. avoidColors must have 3 items. fashionKeywords must have 3 items. celebrities must have 2-3 Korean celebrity names.`,
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(cleaned);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "분석에 실패했습니다. 다시 시도해주세요." }, { status: 500 });
  }
}
