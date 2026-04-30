"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import WebcamCapture from "@/components/WebcamCapture";
import html2canvas from "html2canvas";

interface ColorResult {
  colorType: string;
  colorTypeEn: string;
  description: string;
  bestColors: { name: string; hex: string }[];
  avoidColors: { name: string; hex: string }[];
  fashionKeywords: string[];
  lipColor: string;
  eyeshadowColor: string;
  celebrities: string[];
}

const seasonConfig: Record<string, { emoji: string; gradient: string; bg: string }> = {
  "봄 웜톤": { emoji: "🌸", gradient: "from-yellow-300 to-orange-300", bg: "from-yellow-50 to-orange-50" },
  "여름 쿨톤": { emoji: "❄️", gradient: "from-blue-300 to-purple-300", bg: "from-blue-50 to-purple-50" },
  "가을 웜톤": { emoji: "🍂", gradient: "from-orange-400 to-red-400", bg: "from-orange-50 to-red-50" },
  "겨울 쿨톤": { emoji: "🌊", gradient: "from-indigo-400 to-blue-600", bg: "from-indigo-50 to-blue-50" },
};

export default function ColorMePage() {
  const [step, setStep] = useState<"capture" | "loading" | "result">("capture");
  const [captured, setCaptured] = useState<string | null>(null);
  const [result, setResult] = useState<ColorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const infographicRef = useRef<HTMLDivElement>(null);

  const handleCapture = (imageSrc: string) => {
    setCaptured(imageSrc);
  };

  const handleAnalyze = async () => {
    if (!captured) return;
    setStep("loading");
    setError(null);
    try {
      const res = await fetch("/api/color-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: captured }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "분석 실패");
      setResult(data);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setStep("capture");
    }
  };

  const handleDownload = async () => {
    if (!infographicRef.current) return;
    const canvas = await html2canvas(infographicRef.current, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = "color-me-result.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const config = result ? (seasonConfig[result.colorType] ?? seasonConfig["봄 웜톤"]) : null;

  return (
    <main className="min-h-screen bg-[#0a0015] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-orange-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-sm mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Color Me 🎨</h1>
            <p className="text-white/50 text-sm">퍼스널 컬러 분석</p>
          </div>
        </div>

        {/* Capture Step */}
        {step === "capture" && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-white/70 text-sm">셀카를 찍으면 AI가 퍼스널 컬러를 분석해줄게요</p>
            </div>
            <WebcamCapture
              onCapture={handleCapture}
              onRetake={() => setCaptured(null)}
              captured={captured}
            />
            {error && (
              <div className="w-full px-4 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center">
                {error}
              </div>
            )}
            {captured && (
              <button
                onClick={handleAnalyze}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-400 via-pink-400 to-rose-400 text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                퍼스널 컬러 분석하기 ✨
              </button>
            )}
          </div>
        )}

        {/* Loading Step */}
        {step === "loading" && (
          <div className="flex flex-col items-center gap-6 py-16">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-orange-400/30" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-400 animate-spin" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-3xl animate-pulse">
                🎨
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">퍼스널 컬러 분석 중...</p>
              <p className="text-white/50 text-sm mt-1">AI가 열심히 분석하고 있어요</p>
            </div>
          </div>
        )}

        {/* Result Step */}
        {step === "result" && result && config && (
          <div className="flex flex-col gap-4">
            {/* Infographic (for download) */}
            <div
              ref={infographicRef}
              className={`rounded-3xl overflow-hidden bg-gradient-to-br ${config.bg} p-6 border border-white/20`}
              style={{ background: "linear-gradient(135deg, #fff8f0, #fff0f5)" }}
            >
              {/* Header section */}
              <div className="text-center mb-5">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.gradient} mb-3`}>
                  <span className="text-lg">{config.emoji}</span>
                  <span className="text-white font-black text-lg">{result.colorType}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{result.description}</p>
              </div>

              {/* Best colors */}
              <div className="mb-5">
                <h3 className="text-gray-800 font-bold text-sm mb-2 flex items-center gap-1">
                  <span>✅</span> 어울리는 색상
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {result.bestColors.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-full shadow-md border-2 border-white"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-gray-600 text-[9px] text-center leading-tight">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Avoid colors */}
              <div className="mb-5">
                <h3 className="text-gray-800 font-bold text-sm mb-2 flex items-center gap-1">
                  <span>❌</span> 피해야 할 색상
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {result.avoidColors.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/60 rounded-xl px-2 py-1.5">
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0 border border-gray-200"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-gray-600 text-[10px]">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Makeup */}
              <div className="mb-5 flex gap-3">
                <div className="flex-1 bg-white/60 rounded-2xl p-3 text-center">
                  <p className="text-gray-500 text-[10px] mb-1">💄 립 컬러</p>
                  <div
                    className="w-8 h-8 rounded-full mx-auto border-2 border-white shadow"
                    style={{ backgroundColor: result.lipColor }}
                  />
                </div>
                <div className="flex-1 bg-white/60 rounded-2xl p-3 text-center">
                  <p className="text-gray-500 text-[10px] mb-1">👁️ 아이섀도우</p>
                  <div
                    className="w-8 h-8 rounded-full mx-auto border-2 border-white shadow"
                    style={{ backgroundColor: result.eyeshadowColor }}
                  />
                </div>
                <div className="flex-1 bg-white/60 rounded-2xl p-3 text-center">
                  <p className="text-gray-500 text-[10px] mb-2">👗 스타일</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {result.fashionKeywords.map((kw, i) => (
                      <span key={i} className="text-[8px] bg-white rounded-full px-1.5 py-0.5 text-gray-600">{kw}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Celebrities */}
              <div className="bg-white/60 rounded-2xl p-3">
                <p className="text-gray-500 text-[10px] mb-1">🌟 같은 톤 셀럽</p>
                <div className="flex flex-wrap gap-1">
                  {result.celebrities.map((c, i) => (
                    <span key={i} className="text-xs font-semibold text-gray-700 bg-white rounded-full px-2 py-0.5 border border-gray-200">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-center text-gray-400 text-[9px] mt-4">Glow AI Studio • 정보 교과 체험 부스</p>
            </div>

            {/* Action buttons */}
            <button
              onClick={handleDownload}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-400 via-pink-400 to-rose-400 text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              저장하고 프린트하기
            </button>

            <button
              onClick={() => { setStep("capture"); setCaptured(null); setResult(null); }}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/20"
            >
              다시 분석하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
