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
      prompt: `You are a Korean personal color analyst. Analyze the person's skin undertone, eye color, and hair color from the photo, then create a stylish K-beauty personal color analysis card in portrait format (tall infographic). Follow this exact layout top to bottom:

SECTION 1 — HEADER (top strip, light pastel background):
- Large bold text: the diagnosed season in English (e.g. "SUMMER COOL") with the Korean sub-label below (e.g. "여름 쿨 라이트")
- Small tag badge top-left: "PERSONAL COLOR"
- Top-right: a fan-shaped color drape swatch showing 6–8 best fabric colors for this season, labeled "BEST COLOR DRAPE"

SECTION 2 — TONE CHARACTERISTICS (icon row, 4 icons):
Four labeled icons in a single row: 톤(COOL/WARM), 명도(LIGHT/DARK), 채도(SOFT/VIVID), 대비(LOW/HIGH). Use simple line icons.

SECTION 3 — SIDE-BY-SIDE COLOR COMPARISON (the most important section):
Show the SAME person's face and upper body repeated in a row wearing different solid-color outfits.
- Left half labeled "✓ BEST": 4–5 photos of the person wearing their best colors (soft rose, lavender, sky blue, dusty pink, soft grey — adjusted to their actual season)
- Right half labeled "✗ NOT BEST": 4–5 photos wearing unflattering colors (yellow, coral, mustard, khaki, black — adjusted to their actual season)
- Each photo has a short Korean color name below (e.g. 라벤더, 옐로우)
- The person's face must look identical in every photo; only the clothing color changes.

SECTION 4 — BEST COLOR PALETTE:
Two rows of 5 filled circles each showing the full best-color palette for this season. Label: "BEST COLOR PALETTE"

SECTION 5 — MAKEUP GUIDE (3 columns):
Three swatches side by side labeled LIP / CHEEK / EYE showing recommended makeup shades as smeared brush strokes.

SECTION 6 — FOOTER CHIPS (small icon+text pairs in a row):
KEYWORD · BEST FIT · JEWELRY · HAIR — each with a tiny icon and 1–2 Korean words.

Style rules: clean white/light pastel background, sans-serif Korean+English mixed labels, no paragraphs, no sentences — short labels only. Magazine-quality K-beauty infographic aesthetic.`,
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
