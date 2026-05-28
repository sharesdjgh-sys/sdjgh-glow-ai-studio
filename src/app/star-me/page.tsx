"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import Icon from "@/components/glow/Icon";
import FauxPortrait from "@/components/glow/FauxPortrait";
import KioskHeader from "@/components/glow/KioskHeader";
import EmailSender from "@/components/glow/EmailSender";
import PrivacyChip from "@/components/glow/PrivacyChip";
import WebcamCapture from "@/components/glow/WebcamCapture";

const FEATURE = {
  en: "Star Me",
  ko: "여자 연예인과 인생사진",
  desc: "인기 여자 연예인과 함께 찍은 듯한 사진을 만들어드려요",
  api: "Grok",
  tag: "AI 인생샷 합성",
  accent: "var(--sun)",
  accentDeep: "var(--sun-deep)",
  accentSoft: "var(--sun-soft)",
  accentTint: "var(--sun-tint)",
};

function GeminiLogo({ size = 24 }: { size?: number }) {
  return (
    <img
      src="/logo-gemini.png"
      alt="Gemini"
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}

function OpenAILogo({ size = 24 }: { size?: number }) {
  return (
    <img
      src="/logo-openai.png"
      alt="OpenAI"
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}

const CELEBRITIES = [
  "아이브 장원영", "블랙핑크 제니",
  "에스파 카리나", "뉴진스 민지",
  "트와이스 나연", "르세라핌 카즈하",
  "배우 김태리", "배우 한소희",
  "배우 수지", "배우 아이유",
];

const LOADING_PHASES = ["얼굴 특징 분석 중…", "딱 맞는 연예인 찾는 중…", "인생샷 합성 중…"];

type Step = "intro" | "capture" | "confirm" | "loading" | "result";
const STEPS: Step[] = ["intro", "capture", "confirm", "loading", "result"];

type ModelOption = "nanobanana2" | "Duct Tape";

export default function StarMePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [celebrity, setCelebrity] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [celebrityImage, setCelebrityImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ModelOption>("Duct Tape");

  const chosen = CELEBRITIES.includes(celebrity) ? celebrity : customInput.trim();
  const chosenLabel = chosen || (celebrityImage ? "업로드한 연예인" : "");
  const isReady = !!chosen || !!celebrityImage;

  const handleCapture = (snap: string | null) => { setSnapshot(snap); setStep("confirm"); };

  const handleGenerate = async () => {
    if (!isReady) return;
    setStep("loading");
    setError(null);
    try {
      const res = await fetch("/api/star-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: snapshot, celebrity: chosen, celebrityImageBase64: celebrityImage, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? "생성 실패");
      setResultImage(data.imageUrl);
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
          <ConfirmWithSelect
            snapshot={snapshot} error={error}
            celebrity={celebrity} setCelebrity={setCelebrity}
            customInput={customInput} setCustomInput={setCustomInput}
            celebrityImage={celebrityImage} setCelebrityImage={setCelebrityImage}
            model={model} setModel={setModel}
            onRetake={() => setStep("capture")} onGenerate={handleGenerate}
          />
        )}
        {step === "loading" && <Loading celebrity={chosenLabel} />}
        {step === "result" && resultImage && (
          <Result resultImage={resultImage} snapshot={snapshot} celebrity={chosenLabel}
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
            { n: "03", t: "선택 & 결과", d: "연예인 선택 후 AI가 합성" },
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

      <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <div style={{
          width: "min(100%, 460px)", aspectRatio: "819 / 1024",
          borderRadius: "var(--r-md)", overflow: "hidden",
          boxShadow: "var(--shadow-3)",
        }}>
          <img
            src="/star-me-sample.png"
            alt="인생샷 샘플"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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
        <div className="t-eyebrow">Step 03</div>
        <h2 className="t-h1" style={{ margin: "6px 0 0", lineHeight: 1.15 }}>카메라를 보고 활짝!</h2>
      </div>
      <WebcamCapture accentColor={FEATURE.accent} onCapture={onCapture} />
    </div>
  );
}

// ─── CONFIRM + SELECT ────────────────────────────────────────────────────────

function ConfirmWithSelect({ snapshot, error, celebrity, setCelebrity, customInput, setCustomInput, celebrityImage, setCelebrityImage, model, setModel, onRetake, onGenerate }: {
  snapshot: string | null; error: string | null;
  celebrity: string; setCelebrity: (v: string) => void;
  customInput: string; setCustomInput: (v: string) => void;
  celebrityImage: string | null; setCelebrityImage: (v: string | null) => void;
  model: ModelOption; setModel: (v: ModelOption) => void;
  onRetake: () => void; onGenerate: () => void;
}) {
  const chosen = CELEBRITIES.includes(celebrity) ? celebrity : customInput.trim();
  const isReady = !!chosen || (!!celebrityImage && !!customInput.trim());

  const handleCelebUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCelebrityImage(ev.target?.result as string);
      setCelebrity("");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="fade-up" style={{
      flex: 1, display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 48,
      alignItems: "start", padding: "48px 80px", maxWidth: 1280, margin: "0 auto", width: "100%",
    }}>
      {/* Left: snapshot */}
      <div style={{
        position: "sticky", top: 100,
        borderRadius: "var(--r-2xl)", overflow: "hidden",
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

      {/* Right: celebrity selection */}
      <div>
        <div className="t-eyebrow">Step 03</div>
        <h2 className="t-h1" style={{ marginTop: 8 }}>함께할 연예인을 골라주세요</h2>
        <p className="t-body" style={{ marginTop: 12 }}>
          AI가 함께 사진을 찍은 것처럼 만들어줄게요.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 24 }}>
          {CELEBRITIES.map(c => (
            <button key={c} onClick={() => { setCelebrity(c); setCustomInput(""); setCelebrityImage(null); }}
              style={{
                padding: "12px 14px", textAlign: "left",
                borderRadius: "var(--r-md)", cursor: "pointer",
                background: celebrity === c ? "var(--ink)" : "var(--paper)",
                color: celebrity === c ? "white" : "var(--ink)",
                border: celebrity === c ? "1px solid var(--ink)" : "1px solid var(--hairline)",
                fontSize: 15, fontWeight: 700,
                transition: "all 180ms var(--ease)",
              }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            또는 직접 입력
          </div>
          <input
            type="text"
            value={customInput}
            onChange={e => { setCustomInput(e.target.value); setCelebrity(""); setCelebrityImage(null); }}
            placeholder="연예인 이름을 입력하세요"
            style={{
              width: "100%", padding: "14px 18px",
              borderRadius: "var(--r-lg)", border: "1.5px solid var(--hairline-2)",
              fontSize: 16, fontFamily: "var(--font-sans)", outline: "none",
              background: "var(--paper)", color: "var(--ink)",
            }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            또는 연예인 사진 업로드
          </div>
          <label style={{ cursor: "pointer", display: "block" }}>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleCelebUpload} />
            {celebrityImage ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "var(--r-lg)", border: `1.5px solid ${FEATURE.accent}`, background: FEATURE.accentSoft }}>
                <img src={celebrityImage} alt="연예인 사진" style={{ width: 56, height: 56, borderRadius: "var(--r-md)", objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>사진 업로드됨</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>다른 사진을 선택하려면 클릭</div>
                </div>
                <button
                  onClick={e => { e.preventDefault(); setCelebrityImage(null); setCustomInput(""); }}
                  style={{ padding: "4px 8px", borderRadius: "var(--r-md)", border: "none", background: "rgba(0,0,0,0.08)", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  ✕
                </button>
              </div>
            ) : (
              <div style={{ padding: "16px 18px", borderRadius: "var(--r-lg)", border: "1.5px dashed var(--hairline-2)", display: "flex", alignItems: "center", gap: 12, background: "var(--canvas-tint)", color: "var(--ink-2)" }}>
                <Icon name="upload" size={20} stroke={2} />
                <span style={{ fontSize: 15, fontWeight: 600 }}>연예인 사진 업로드</span>
              </div>
            )}
          </label>
          {celebrityImage && (
            <input
              type="text"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="연예인 이름을 입력하세요 (필수)"
              autoFocus
              style={{
                marginTop: 10, width: "100%", padding: "14px 18px",
                borderRadius: "var(--r-lg)",
                border: `1.5px solid ${customInput.trim() ? FEATURE.accent : "#E57373"}`,
                fontSize: 16, fontFamily: "var(--font-sans)", outline: "none",
                background: "var(--paper)", color: "var(--ink)",
              }}
            />
          )}
        </div>

        {error && (
          <div style={{ marginTop: 16, padding: "18px 20px", background: "#FFF0F0", border: "1px solid #FADBD8", borderRadius: "var(--r-lg)", color: "#C0392B", fontSize: 14 }}>
            <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 15 }}>
              <Icon name="shield" size={18} stroke={2.5} />
              {error.includes("안전 정책") ? "AI 생성 일시 제한 안내" : "오류가 발생했습니다"}
            </div>
            <div style={{ fontWeight: 600, lineHeight: 1.5, marginBottom: error.includes("안전 정책") ? 12 : 0 }}>
              {error}
            </div>
            {error.includes("안전 정책") && (
              <div style={{
                marginTop: 10, paddingTop: 12, borderTop: "1px dashed rgba(192, 57, 43, 0.2)",
                display: "flex", flexDirection: "column", gap: 8, color: "#7B241C", fontSize: 13, fontWeight: 500
              }}>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0 }}>👚</span>
                  <span><strong>사복 사진 권장:</strong> 교복(학생복)은 AI 모델의 미성년자 보호 필터에 의해 차단될 확률이 매우 높습니다. 일반 일상 사복을 입은 상태로 다시 촬영/업로드해 보세요.</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0 }}>📸</span>
                  <span><strong>선명한 얼굴 정면 촬영:</strong> 선글라스, 마스크, 모자, 손가락 브이 등으로 얼굴 일부가 과도하게 가려지면 검열 시스템이 오작동하기 쉽습니다. 밝은 곳에서 선명한 얼굴로 다시 촬영해 보세요.</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0 }}>⚙️</span>
                  <span><strong>AI 엔진 변경:</strong> 바로 아래의 <strong>AI 모델 선택</strong> 항목에서 다른 엔진(<strong>Duct Tape</strong> <OpenAILogo size={14} /> 또는 <strong>nanobanana2</strong> <GeminiLogo size={14} />)으로 모델을 변경하여 다시 인생사진 만들기를 시도해 보세요. 모델에 따라 안전 필터의 허용 범위가 다릅니다.</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            ✨ AI 모델 선택
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {/* Duct Tape — OpenAI */}
            <button
              onClick={() => setModel("Duct Tape")}
              style={{
                flex: 1, padding: "14px 12px",
                borderRadius: "var(--r-lg)", cursor: "pointer",
                background: model === "Duct Tape"
                  ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                  : "var(--paper)",
                border: model === "Duct Tape"
                  ? "2px solid #10a37f"
                  : "2px solid var(--hairline)",
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

            {/* nanobanana2 — Gemini */}
            <button
              onClick={() => setModel("nanobanana2")}
              style={{
                flex: 1, padding: "14px 12px",
                borderRadius: "var(--r-lg)", cursor: "pointer",
                background: model === "nanobanana2"
                  ? "linear-gradient(135deg, #e8f0fe 0%, #d2e3fc 100%)"
                  : "var(--paper)",
                border: model === "nanobanana2"
                  ? "2px solid #4285F4"
                  : "2px solid var(--hairline)",
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
          <button className="btn btn-rose btn-xl" onClick={onGenerate} disabled={!isReady}
            style={{ opacity: isReady ? 1 : 0.5 }}>
            인생사진 만들기 <Icon name="sparkles" size={20} stroke={2.2} />
          </button>
        </div>

        <div style={{ marginTop: 20, padding: "14px 18px", background: "var(--mint-soft)", borderRadius: "var(--r-lg)", color: "var(--mint-deep)", fontSize: 14, display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
          <Icon name="lock" size={16} stroke={2.2} />
          사진은 결과 생성에만 사용되고, 서버에 저장되지 않아요.
        </div>
      </div>
    </div>
  );
}

// ─── LOADING ────────────────────────────────────────────────────────────────

function Loading({ celebrity }: { celebrity: string }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % LOADING_PHASES.length), 1100);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32, padding: 40 }}>
      <div style={{ position: "relative", width: 220, height: 220 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `conic-gradient(from 0deg, var(--sun), var(--sun-deep), var(--rose), var(--sun))`,
          animation: "spin 2.4s linear infinite", filter: "blur(2px)",
        }} />
        <div style={{ position: "absolute", inset: 16, borderRadius: "50%", background: "var(--canvas)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="t-en" style={{ fontSize: 48, color: "var(--sun-deep)" }}>AI</span>
        </div>
        <div style={{ position: "absolute", inset: -12, borderRadius: "50%", boxShadow: "var(--shadow-glow-sun)" }} />
      </div>

      <div style={{ textAlign: "center" }}>
        <div className="t-eyebrow" style={{ color: "var(--sun-deep)" }}>{FEATURE.en}</div>
        <h2 className="t-h1" style={{ marginTop: 8 }}>당신만의 결과를 만드는 중…</h2>
        <p className="t-body" key={phase} style={{ marginTop: 12, animation: "fadeUp 360ms var(--ease) both" }}>
          {celebrity}와(과)의 {LOADING_PHASES[phase]}
        </p>
      </div>

      <div style={{ width: 360, height: 6, borderRadius: 99, background: "var(--hairline)", overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute", height: "100%", width: "45%", borderRadius: 99,
          background: `linear-gradient(90deg, transparent, var(--sun-deep), var(--sun))`,
          animation: "indeterminate 1.6s cubic-bezier(0.65,0.815,0.735,0.395) infinite",
        }} />
        <div style={{
          position: "absolute", height: "100%", width: "25%", borderRadius: 99,
          background: `linear-gradient(90deg, transparent, var(--sun))`,
          animation: "indeterminate2 1.6s cubic-bezier(0.165,0.84,0.44,1) 0.8s infinite",
        }} />
      </div>
    </div>
  );
}

// ─── RESULT ─────────────────────────────────────────────────────────────────

function Result({ resultImage, snapshot, celebrity, onRestart, onHome }: {
  resultImage: string; snapshot: string | null; celebrity: string;
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
  }, [resultImage]);

  const handleDownload = () => {
    const activeImage = framedImage ?? resultImage;
    const link = document.createElement("a");
    link.download = `star-me-${celebrity.replace(/\s/g, "-")}-A4.png`;
    link.href = activeImage;
    link.click();
  };

  const handlePrint = () => {
    const activeImage = framedImage ?? resultImage;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>Star Me 인생사진 결과</title>
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
    <img src="${activeImage}" />
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
        <div className="t-eyebrow" style={{ color: "var(--sun-deep)", fontSize: 22 }}>{FEATURE.en}</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 44, fontWeight: 800, letterSpacing: "-0.02em" }}>완성됐어요! ✨</h1>
        <p className="t-body" style={{ marginTop: 6 }}>다운로드하거나 바로 프린트해서 가져가세요.</p>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        <div ref={printRef} className="print-frame" style={{
          width: "100%",
          aspectRatio: "1 / 1.414",
          padding: "28px",
          background: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}>
          {/* Header — outside the image */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexShrink: 0 }}>
            {/* School Logo */}
            <img
              src="/school-logo.png"
              alt="서대전여고 로고"
              style={{ width: 44, height: 44, objectFit: "contain", borderRadius: "50%", background: "#ffffff", padding: 2, border: "1.5px solid #FFCCD9" }}
            />
            
            {/* Event Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FF1E76" }}>
                서대전여자고등학교 정보교과
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 1 }}>
                2026 교육과정 박람회
              </div>
            </div>

            {/* Celebrity & Date */}
            <div style={{ textAlign: "right" }}>
              {celebrity && (
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>with {celebrity}</div>
              )}
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "monospace", marginTop: 2, fontWeight: 600 }}>
                {new Date().toLocaleDateString("ko-KR")}
              </div>
            </div>
          </div>

          {/* Generated image — fill remaining space */}
          <div style={{
            flex: 1,
            width: "100%",
            borderRadius: "var(--r-md)",
            overflow: "hidden",
            border: "1px solid var(--hairline)",
            position: "relative",
          }}>
            <img src={resultImage} alt="인생사진 결과" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>

        {/* 이메일 전송 */}
        <EmailSender
          imageBase64={framedImage ?? resultImage}
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
