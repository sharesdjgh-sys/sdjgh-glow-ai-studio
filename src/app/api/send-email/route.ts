import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { to, imageBase64, featureName, featureKo } = await req.json();

    if (!to || !imageBase64) {
      return NextResponse.json({ error: "이메일 주소와 이미지가 필요해요" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: "올바른 이메일 주소를 입력해주세요" }, { status: 400 });
    }

    // base64 data URL → Buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    await transporter.sendMail({
      from: `"Glow AI Studio" <${process.env.GMAIL_USER}>`,
      to,
      subject: `✨ Glow AI Studio — ${featureKo} 결과가 도착했어요!`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1B1419;">
          <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800;">✨ ${featureKo}</h2>
          <p style="color: #4A3D44; margin: 0 0 24px; line-height: 1.6;">
            서대전여자고등학교 2026 교육과정 박람회 <strong>Glow AI Studio</strong>에서 만든 결과예요.<br>
            아래 이미지를 저장하거나 프린트해서 간직하세요!
          </p>
          <img src="cid:result-image" alt="${featureKo} 결과" style="width: 100%; border-radius: 12px; display: block;" />
          <p style="margin: 24px 0 0; font-size: 13px; color: #837381;">
            Powered by ${featureName} · Glow AI Studio<br>
            서대전여자고등학교 정보 교과
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `glow-${featureName.toLowerCase().replace(/\s/g, "-")}-result.png`,
          content: imageBuffer,
          cid: "result-image",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-email]", err);
    return NextResponse.json({ error: "이메일 전송에 실패했어요. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}
