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
      model: "gemini-3.1-flash-image-preview",
      generationConfig: {
        // @ts-expect-error - responseModalities is valid for image generation models
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    const prompt = `Create a 3x3 grid collage image in A4 portrait orientation (ratio 1:1.414) rendered in Unreal Engine 5 / Octane Render style.

FACE PRESERVATION — CRITICAL: Meticulously replicate the exact face from the reference photo. Copy the precise eye shape, nose bridge, lip shape, jawline, cheekbones, skin tone, hair color, and hair style. The character must be immediately recognizable as the same person. Do not alter or idealize facial features.

CHARACTER: Head-to-body ratio 1:3 (chibi-influenced Pixar scale). Exaggerated large eyes for readability while preserving the person's unique eye shape. Clothing consistent with the reference image. Subsurface scattering skin shader, polished finish.

GRID — 9 equal panels arranged in 3 columns × 3 rows, same character, 9 different emotions:
Row 1:
  Cell 1 — Surprised: hands touching cheeks, wide eyes, O-shaped mouth
  Cell 2 — Annoyed: arms crossed, sharp side-eye, furrowed brow
  Cell 3 — Confused: head tilted 45 degrees, one hand scratching head
Row 2:
  Cell 4 — Frustrated: facepalming with one hand, clenched jaw
  Cell 5 — Thoughtful: finger on chin, looking up, dreaming expression
  Cell 6 — Sarcastic: raised eyebrow, smirk, one eye slightly squinted
Row 3:
  Cell 7 — Worried: biting nails, hunched shoulders, dilated pupils
  Cell 8 — Bored: chin resting in palm, heavy eyelids, neutral mouth
  Cell 9 — Curious: leaning toward camera, magnifying glass gesture

LAYOUT: Portrait A4 format. Each panel has a solid pure white background, zero shadows, isolated figure. Thin light gray border between panels. Three-point studio lighting per panel.

NEGATIVE CONSTRAINTS: No text, no labels, no logos, no speech bubbles, no UI overlays.`;

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
