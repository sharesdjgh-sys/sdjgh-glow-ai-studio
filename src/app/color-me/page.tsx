"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import Icon from "@/components/glow/Icon";
import FauxPortrait from "@/components/glow/FauxPortrait";
import KioskHeader from "@/components/glow/KioskHeader";
import PrivacyChip from "@/components/glow/PrivacyChip";
import WebcamCapture from "@/components/glow/WebcamCapture";
import EmailSender from "@/components/glow/EmailSender";

const resizeBase64Image = (base64Str: string, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

interface ColorResult {
  imageUrl: string;
}

const FEATURE = {
  id: "color",
  en: "Color Me",
  ko: "퍼스널 컬러 인포그래픽",
  desc: "내 피부톤·눈동자·머리카락을 분석해서 어울리는 컬러 팔레트를 알려줘요",
  api: "ChatGPT",
  tag: "AI 퍼스널 컬러 분석",
  accent: "var(--lavender)",
  accentDeep: "var(--lavender-deep)",
  accentSoft: "var(--lavender-soft)",
  accentTint: "var(--lavender-tint)",
};

const LOADING_PHASES = ["피부톤 분석 중…", "퍼스널 컬러 매칭 중…", "팔레트 그리는 중…"];

type Step = "intro" | "capture" | "confirm" | "loading" | "result";
const STEPS: Step[] = ["intro", "capture", "confirm", "loading", "result"];
type ModelOption = "nanobanana2" | "Duct Tape";

function GeminiLogo({ size = 24 }: { size?: number }) {
  return (
    <img src="/logo-gemini.png" alt="Gemini" width={size} height={size}
      style={{ objectFit: "contain", display: "block" }} />
  );
}

function OpenAILogo({ size = 24 }: { size?: number }) {
  return (
    <img src="/logo-openai.png" alt="OpenAI" width={size} height={size}
      style={{ objectFit: "contain", display: "block" }} />
  );
}

export default function ColorMePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [result, setResult] = useState<ColorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ModelOption>("Duct Tape");

  const handleCapture = async (snap: string | null) => {
    if (!snap) {
      setSnapshot(null);
      setStep("confirm");
      return;
    }
    setStep("loading");
    try {
      const resized = await resizeBase64Image(snap, 1024, 1024);
      setSnapshot(resized);
      setStep("confirm");
    } catch (err) {
      console.error("Failed to resize snapshot:", err);
      setSnapshot(snap);
      setStep("confirm");
    }
  };

  const handleConfirm = async () => {
    setStep("loading");
    setError(null);
    try {
      const res = await fetch("/api/color-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: snapshot, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "분석 실패");
      setResult(data);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요");
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "result") setStep("intro");
    else if (step === "confirm") setStep("capture");
    else if (step === "capture") setStep("intro");
  };

  return (
    <div className="kiosk-stage">
      <KioskHeader
        onBack={step === "intro" || step === "loading" ? undefined : handleBack}
        onHome={() => router.push("/")}
        step={STEPS.indexOf(step)}
        total={5}
        label={FEATURE.ko}
      />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {step === "intro"   && <Intro onStart={() => setStep("capture")} />}
        {step === "capture" && <Capture onCapture={handleCapture} />}
        {step === "confirm" && (
          <Confirm snapshot={snapshot} error={error}
            model={model} setModel={setModel}
            onRetake={() => setStep("capture")} onConfirm={handleConfirm} />
        )}
        {step === "loading" && <Loading />}
        {step === "result" && result && (
          <Result result={result}
            onRestart={() => setStep("intro")} onHome={() => router.push("/")} />
        )}
      </main>
    </div>
  );
}

// ─── INTRO ──────────────────────────────────────────────────────────────────

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="fade-up" style={{
      flex: 1, display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 64,
      alignItems: "center", padding: "48px 80px", maxWidth: 1440, margin: "0 auto", width: "100%",
    }}>
      <div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px",
          background: FEATURE.accentSoft, color: FEATURE.accentDeep,
          borderRadius: "var(--r-pill)", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: FEATURE.accent, display: "inline-block" }} />
          {FEATURE.tag}
        </div>

        <div className="t-en" style={{ marginTop: 28, fontSize: 32, color: FEATURE.accentDeep, lineHeight: 1.2 }}>
          {FEATURE.en}
        </div>
        <h1 style={{ margin: "12px 0 0", fontSize: 56, fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.18, paddingBottom: 4 }}>
          {FEATURE.ko}
        </h1>
        <p style={{ marginTop: 20, fontSize: 19, color: "var(--ink-2)", maxWidth: 520, lineHeight: 1.55, wordBreak: "keep-all" }}>
          {FEATURE.desc}
        </p>

        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { n: "01", t: "준비", d: "조명이 잘 비치는 곳에 자리 잡기" },
            { n: "02", t: "촬영", d: "카운트다운 3초 후 자동 촬영" },
            { n: "03", t: "결과", d: "AI가 만들어주는 팔레트를 프린트" },
          ].map(s => (
            <div key={s.n} style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "14px 18px",
              background: FEATURE.accentTint,
              borderLeft: `4px solid ${FEATURE.accentDeep}`,
              borderRadius: "var(--r-md)", wordBreak: "keep-all",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 26, color: FEATURE.accentDeep, width: 36, flexShrink: 0 }}>
                {s.n}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{s.t}</div>
                <div style={{ fontSize: 14, color: "var(--ink-2)" }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 36, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btn-rose btn-xl" onClick={onStart}
            style={{ paddingLeft: 44, paddingRight: 56, gap: 20 }}>
            <span style={{ whiteSpace: "nowrap" }}>웹캠 켜고 시작하기</span>
            <Icon name="camera" size={22} stroke={2.2} />
          </button>
          <PrivacyChip />
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{
          width: "min(100%, 460px)",
          borderRadius: "var(--r-md)", overflow: "hidden",
          background: FEATURE.accentTint, boxShadow: "var(--shadow-3)",
        }}>
          <img
            src="/color-me-sample.png"
            alt="퍼스널 컬러 분석 샘플"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── CAPTURE ────────────────────────────────────────────────────────────────

function Capture({ onCapture }: { onCapture: (snap: string | null) => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 64px", gap: 20 }}>
      <div style={{ textAlign: "center" }}>
        <div className="t-eyebrow">Step 02</div>
        <h2 className="t-h1" style={{ margin: "6px 0 0", lineHeight: 1.15 }}>카메라를 보고 활짝!</h2>
      </div>
      <WebcamCapture accentColor={FEATURE.accent} onCapture={onCapture} />
    </div>
  );
}

// ─── CONFIRM ────────────────────────────────────────────────────────────────

function Confirm({ snapshot, error, model, setModel, onRetake, onConfirm }: {
  snapshot: string | null; error: string | null;
  model: ModelOption; setModel: (v: ModelOption) => void;
  onRetake: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fade-up" style={{
      flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64,
      alignItems: "center", padding: "48px 80px", maxWidth: 1280, margin: "0 auto", width: "100%",
    }}>
      <div style={{
        position: "relative", borderRadius: "var(--r-2xl)", overflow: "hidden",
        aspectRatio: "4/5", boxShadow: "var(--shadow-3)", border: `3px solid ${FEATURE.accent}`,
      }}>
        {snapshot
          ? <img src={snapshot} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <FauxPortrait palette={["#FDE3E8", "#FFB3CC", "#FF6B8B"]} hair="#2A1F25" />
        }
        <div style={{
          position: "absolute", top: 16, left: 16, padding: "6px 12px",
          background: "rgba(255,255,255,0.92)", color: "var(--ink)",
          borderRadius: "var(--r-pill)", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          촬영 완료
        </div>
      </div>

      <div>
        <div className="t-eyebrow">Step 03</div>
        <h2 className="t-h1" style={{ marginTop: 8 }}>이 사진으로 진행할까요?</h2>
        <p className="t-body" style={{ marginTop: 12 }}>
          마음에 들면 <strong>이대로 진행</strong>을, 다시 찍고 싶으면 <strong>다시 촬영</strong>을 눌러주세요.
          결과 생성은 보통 20~40초 정도 걸려요.
        </p>

        {error && (
          <div style={{
            marginTop: 16, padding: "14px 18px",
            background: "#FFF0F0", borderRadius: "var(--r-lg)",
            color: "#C0392B", fontSize: 14, fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            ✨ AI 모델 선택
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setModel("Duct Tape")}
              style={{
                flex: 1, padding: "14px 12px",
                borderRadius: "var(--r-lg)", cursor: "pointer",
                background: model === "Duct Tape"
                  ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                  : "var(--paper)",
                border: model === "Duct Tape" ? "2px solid #10a37f" : "2px solid var(--hairline)",
                transition: "all 200ms var(--ease)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                boxShadow: model === "Duct Tape" ? "0 0 0 3px rgba(16,163,127,0.15)" : "none",
              }}
            >
              <OpenAILogo size={28} />
              <span style={{ fontSize: 13, fontWeight: 800, color: model === "Duct Tape" ? "#0d8f6e" : "var(--ink-2)", letterSpacing: "-0.01em" }}>
                Duct Tape
              </span>
              <span style={{ fontSize: 11, color: model === "Duct Tape" ? "#10a37f" : "var(--ink-3)", fontWeight: 500 }}>
                OpenAI GPT
              </span>
            </button>

            <button
              onClick={() => setModel("nanobanana2")}
              style={{
                flex: 1, padding: "14px 12px",
                borderRadius: "var(--r-lg)", cursor: "pointer",
                background: model === "nanobanana2"
                  ? "linear-gradient(135deg, #e8f0fe 0%, #d2e3fc 100%)"
                  : "var(--paper)",
                border: model === "nanobanana2" ? "2px solid #4285F4" : "2px solid var(--hairline)",
                transition: "all 200ms var(--ease)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                boxShadow: model === "nanobanana2" ? "0 0 0 3px rgba(66,133,244,0.15)" : "none",
              }}
            >
              <GeminiLogo size={28} />
              <span style={{ fontSize: 13, fontWeight: 800, color: model === "nanobanana2" ? "#1a73e8" : "var(--ink-2)", letterSpacing: "-0.01em" }}>
                nanobanana2
              </span>
              <span style={{ fontSize: 11, color: model === "nanobanana2" ? "#4285F4" : "var(--ink-3)", fontWeight: 500 }}>
                Google Gemini
              </span>
            </button>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <button className="btn btn-ghost btn-xl" onClick={onRetake}>
            <Icon name="refresh" size={20} stroke={2.2} /> 다시 촬영
          </button>
          <button className="btn btn-rose btn-xl" onClick={onConfirm}>
            이대로 진행하기 <Icon name="arrow-right" size={20} stroke={2.2} />
          </button>
        </div>

        <div style={{
          marginTop: 24, padding: "14px 18px",
          background: "var(--mint-soft)", borderRadius: "var(--r-lg)",
          color: "var(--mint-deep)", fontSize: 14,
          display: "flex", alignItems: "center", gap: 10, fontWeight: 600,
        }}>
          <Icon name="lock" size={16} stroke={2.2} />
          사진은 결과 생성에만 사용되고, 서버에 저장되지 않아요.
        </div>
      </div>
    </div>
  );
}

// ─── LOADING ────────────────────────────────────────────────────────────────

function Loading() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % LOADING_PHASES.length), 1100);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 32, padding: 40, position: "relative",
    }}>
      <div style={{ position: "relative", width: 220, height: 220 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `conic-gradient(from 0deg, var(--lavender), var(--lavender-deep), var(--rose), var(--lavender))`,
          animation: "spin 2.4s linear infinite",
          filter: "blur(2px)",
        }} />
        <div style={{
          position: "absolute", inset: 16, borderRadius: "50%", background: "var(--canvas)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span className="t-en" style={{ fontSize: 48, color: "var(--lavender-deep)" }}>AI</span>
        </div>
        <div style={{ position: "absolute", inset: -12, borderRadius: "50%", boxShadow: "var(--shadow-glow-lavender)" }} />
      </div>

      <div style={{ textAlign: "center" }}>
        <div className="t-eyebrow" style={{ color: "var(--lavender-deep)" }}>{FEATURE.en}</div>
        <h2 className="t-h1" style={{ marginTop: 8 }}>당신만의 결과를 만드는 중…</h2>
        <p className="t-body" key={phase} style={{ marginTop: 12, animation: "fadeUp 360ms var(--ease) both" }}>
          {LOADING_PHASES[phase]}
        </p>
      </div>

      <div style={{ width: 360, height: 6, borderRadius: 99, background: "var(--hairline)", overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute", height: "100%", width: "45%", borderRadius: 99,
          background: `linear-gradient(90deg, transparent, var(--lavender-deep), var(--lavender))`,
          animation: "indeterminate 1.6s cubic-bezier(0.65,0.815,0.735,0.395) infinite",
        }} />
        <div style={{
          position: "absolute", height: "100%", width: "25%", borderRadius: 99,
          background: `linear-gradient(90deg, transparent, var(--lavender))`,
          animation: "indeterminate2 1.6s cubic-bezier(0.165,0.84,0.44,1) 0.8s infinite",
        }} />
      </div>
    </div>
  );
}

// ─── RESULT ─────────────────────────────────────────────────────────────────

function Result({ result, onRestart, onHome }: {
  result: ColorResult;
  onRestart: () => void; onHome: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const [framedImage, setFramedImage] = useState<string | null>(null);

  useEffect(() => {
    const generateFramed = async () => {
      if (!printRef.current) return;
      try {
        // Wait 300ms for images to render fully before taking snapshot
        await new Promise((resolve) => setTimeout(resolve, 300));
        const canvas = await html2canvas(printRef.current, { scale: 3, backgroundColor: "#ffffff", useCORS: true });
        const dataUrl = canvas.toDataURL("image/png");
        setFramedImage(dataUrl);
      } catch (err) {
        console.error("Failed to pre-generate framed image:", err);
      }
    };
    generateFramed();
  }, [result.imageUrl]);

  const handleDownload = async () => {
    let activeImage = framedImage;
    if (!activeImage && printRef.current) {
      try {
        const canvas = await html2canvas(printRef.current, { scale: 3, backgroundColor: "#ffffff", useCORS: true });
        activeImage = canvas.toDataURL("image/png");
        setFramedImage(activeImage);
      } catch (err) {
        console.error("Failed to capture framed image on-demand:", err);
      }
    }
    const finalImage = activeImage ?? result.imageUrl;
    const link = document.createElement("a");
    link.download = `color-me-result-A4.png`;
    link.href = finalImage;
    link.click();
  };

  const handlePrint = async () => {
    let activeImage = framedImage;
    if (!activeImage && printRef.current) {
      try {
        const canvas = await html2canvas(printRef.current, { scale: 3, backgroundColor: "#ffffff", useCORS: true });
        activeImage = canvas.toDataURL("image/png");
        setFramedImage(activeImage);
      } catch (err) {
        console.error("Failed to capture framed image on-demand:", err);
      }
    }
    const finalImage = activeImage ?? result.imageUrl;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>Color Me 인생사진 결과</title>
    <style>
      @page { size: A4 portrait; margin: 0; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%;
        height: 100%;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      img {
        display: block;
        width: 210mm;
        height: 297mm;
        object-fit: contain;
      }
    </style>
  </head>
  <body>
    <img src="${finalImage}" />
    <script>
      window.onload = () => {
        window.print();
        setTimeout(() => { window.close(); }, 500);
      }
    <\/script>
  </body>
</html>`);
    win.document.close();
  };

  return (
    <div className="fade-up" style={{ padding: "0 24px 64px" }}>
      <div style={{ textAlign: "center", padding: "32px 40px 16px" }}>
        <div className="t-eyebrow" style={{ color: "var(--lavender-deep)", fontSize: 22 }}>{FEATURE.en}</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 44, fontWeight: 800, letterSpacing: "-0.02em" }}>완성됐어요! ✨</h1>
        <p className="t-body" style={{ marginTop: 6 }}>다운로드하거나 바로 프린트해서 가져가세요.</p>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        <div ref={printRef} className="print-frame" style={{
          width: "100%",
          aspectRatio: "1 / 1.414",
          padding: "28px",
          background: "#FFFFFF",
          display: "block",
          position: "relative",
          boxSizing: "border-box",
        }}>
          {/* Header — outside the image */}
          <div style={{ position: "relative", width: "100%", height: 50, marginBottom: 16, boxSizing: "border-box" }}>
            {/* School Logo */}
            <div style={{
              position: "absolute",
              top: 5,
              left: 0,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1.5px solid #FFCCD9",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxSizing: "border-box"
            }}>
              <img 
                src="/school-logo.png" 
                alt="School Logo" 
                style={{ 
                  width: "90%", 
                  height: "90%", 
                  objectFit: "contain", 
                  display: "block" 
                }} 
              />
            </div>
            
            {/* Event Info */}
            <div style={{ position: "absolute", top: 5, left: 52, height: 40, boxSizing: "border-box" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#FF1E76", lineHeight: "18px", margin: 0, padding: 0 }}>
                서대전여자고등학교 정보교과
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", lineHeight: "22px", margin: 0, padding: 0 }}>
                2026 교육과정 박람회
              </div>
            </div>

            {/* Date Column */}
            <div style={{ position: "absolute", top: 5, right: 0, height: 40, textAlign: "right", boxSizing: "border-box" }}>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 800, fontSize: "15px", color: "var(--lavender-deep)", lineHeight: "18px", margin: 0, padding: 0 }}>
                Color Me
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "monospace", fontWeight: 600, lineHeight: "22px", margin: 0, padding: 0 }}>
                {new Date().toLocaleDateString("ko-KR")}
              </div>
            </div>
          </div>

          {/* Generated image — fill remaining space */}
          <div style={{
            width: "100%",
            height: "calc(100% - 66px)",
            borderRadius: "var(--r-md)",
            overflow: "hidden",
            border: "1.5px solid var(--lavender-soft)",
            position: "relative",
            boxSizing: "border-box",
            background: "#F5F5F7",
          }}>
            <img 
              src={result.imageUrl} 
              alt="퍼스널 컬러 분석 결과" 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "contain", 
                display: "block" 
              }} 
            />
          </div>
        </div>

        {/* 이메일 전송 */}
        <EmailSender
          imageBase64={framedImage ?? result.imageUrl}
          featureName={FEATURE.en}
          featureKo={FEATURE.ko}
        />

        {/* Actions */}
        <div style={{
          display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
          padding: "20px 24px", background: "var(--paper)",
          borderRadius: "var(--r-2xl)", border: "1px solid var(--hairline)", boxShadow: "var(--shadow-2)",
        }}>
          <button className="btn btn-rose btn-lg" onClick={handleDownload}>
            <Icon name="download" size={20} stroke={2.2} /> 다운로드
          </button>
          <button className="btn btn-primary btn-lg" onClick={handlePrint}>
            <Icon name="printer" size={20} stroke={2.2} /> 프린트
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-lg" onClick={onRestart}>
            <Icon name="refresh" size={18} /> 다시하기
          </button>
          <button className="btn btn-ghost btn-lg" onClick={onHome}>
            처음으로
          </button>
        </div>
      </div>
    </div>
  );
}

