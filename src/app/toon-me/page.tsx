"use client";

import { useState } from "react";
import Link from "next/link";
import WebcamCapture from "@/components/WebcamCapture";
import DownloadButton from "@/components/DownloadButton";

export default function ToonMePage() {
  const [step, setStep] = useState<"capture" | "loading" | "result">("capture");
  const [captured, setCaptured] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (imageSrc: string) => {
    setCaptured(imageSrc);
  };

  const handleGenerate = async () => {
    if (!captured) return;
    setStep("loading");
    setError(null);
    try {
      const res = await fetch("/api/toon-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: captured }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "생성 실패");
      setResultImage(data.imageUrl);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setStep("capture");
    }
  };

  const emotions = ["놀람", "짜증", "혼란", "좌절", "사려깊음", "빈정거림", "걱정", "지루함", "호기심"];

  return (
    <main className="min-h-screen bg-[#0a0015] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl" />
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
            <h1 className="text-2xl font-black text-white">Toon Me ✨</h1>
            <p className="text-white/50 text-sm">픽사 캐릭터 변환</p>
          </div>
        </div>

        {/* Capture Step */}
        {step === "capture" && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-white/70 text-sm mb-2">셀카를 찍으면 나만의 픽사 캐릭터로 변신!</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {emotions.map((e, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full border text-white/60 border-white/20 bg-white/5"
                  >
                    {e}
                  </span>
                ))}
              </div>
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
                onClick={handleGenerate}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                픽사 캐릭터로 변신하기 ✨
              </button>
            )}
          </div>
        )}

        {/* Loading Step */}
        {step === "loading" && (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400/30" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-3xl animate-pulse">
                ✨
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">픽사 캐릭터 생성 중...</p>
              <p className="text-white/50 text-sm mt-1">9가지 감정을 표현하는 중이에요</p>
              <p className="text-white/30 text-xs mt-2">약 20~40초 소요될 수 있어요</p>
            </div>

            {/* Emotion pills animating */}
            <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
              {emotions.map((e, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 border border-cyan-400/30 text-cyan-200"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Result Step */}
        {step === "result" && resultImage && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-white/70 text-sm text-center">나만의 픽사 캐릭터 완성!</p>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-cyan-400/30 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultImage} alt="픽사 캐릭터 결과" className="w-full" />
              <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs text-center">Glow AI Studio • 정보 교과 체험 부스</p>
              </div>
            </div>

            <DownloadButton
              imageUrl={resultImage}
              filename="toon-me-result.jpg"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              저장하고 프린트하기
            </DownloadButton>

            <button
              onClick={() => { setStep("capture"); setCaptured(null); setResultImage(null); }}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/20"
            >
              처음부터 다시하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
