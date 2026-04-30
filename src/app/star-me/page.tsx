"use client";

import { useState } from "react";
import Link from "next/link";
import WebcamCapture from "@/components/WebcamCapture";
import DownloadButton from "@/components/DownloadButton";

const CELEBRITIES = [
  "아이유 (IU)",
  "BTS 뷔",
  "블랙핑크 지수",
  "차은우",
  "김태리",
  "뉴진스 민지",
  "에스파 카리나",
  "정해인",
  "손예진",
  "공유",
];

export default function StarMePage() {
  const [step, setStep] = useState<"capture" | "select" | "loading" | "result">("capture");
  const [captured, setCaptured] = useState<string | null>(null);
  const [celebrity, setCelebrity] = useState<string>("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (imageSrc: string) => {
    setCaptured(imageSrc);
  };

  const handleProceedToSelect = () => {
    if (captured) setStep("select");
  };

  const handleGenerate = async () => {
    if (!captured || !celebrity) return;
    setStep("loading");
    setError(null);
    try {
      const res = await fetch("/api/star-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: captured, celebrity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "생성 실패");
      setResultImage(data.imageUrl);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setStep("select");
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0015] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl" />
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
            <h1 className="text-2xl font-black text-white">Star Me ⭐</h1>
            <p className="text-white/50 text-sm">연예인과 인생사진</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {["capture", "select", "result"].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white scale-110"
                  : (["capture", "select", "result"].indexOf(step) > i)
                    ? "bg-green-500 text-white"
                    : "bg-white/20 text-white/50"
              }`}>
                {["capture", "select", "result"].indexOf(step) > i ? "✓" : i + 1}
              </div>
              {i < 2 && <div className="flex-1 h-0.5 bg-white/20 rounded" />}
            </div>
          ))}
        </div>

        {/* Capture Step */}
        {step === "capture" && (
          <div className="flex flex-col items-center gap-6">
            <p className="text-white/70 text-sm text-center">먼저 셀카를 찍어주세요!</p>
            <WebcamCapture
              onCapture={handleCapture}
              onRetake={() => setCaptured(null)}
              captured={captured}
            />
            {captured && (
              <button
                onClick={handleProceedToSelect}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                다음 단계 →
              </button>
            )}
          </div>
        )}

        {/* Select Celebrity Step */}
        {step === "select" && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <p className="text-white font-bold text-lg mb-1">함께할 연예인을 선택하세요</p>
              <p className="text-white/50 text-sm">AI가 함께 사진을 찍은 것처럼 만들어줄게요</p>
            </div>

            {/* Preview of captured photo */}
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={captured!} alt="내 사진" className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-400/50" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {CELEBRITIES.map((celeb) => (
                <button
                  key={celeb}
                  onClick={() => setCelebrity(celeb)}
                  className={`py-3 px-4 rounded-2xl text-sm font-semibold transition-all border ${
                    celebrity === celeb
                      ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white border-purple-400 scale-[1.02]"
                      : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                  }`}
                >
                  {celeb}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div>
              <p className="text-white/50 text-xs mb-2 text-center">또는 직접 입력</p>
              <input
                type="text"
                value={CELEBRITIES.includes(celebrity) ? "" : celebrity}
                onChange={(e) => setCelebrity(e.target.value)}
                placeholder="연예인 이름을 입력하세요"
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!celebrity.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
            >
              인생사진 만들기 ✨
            </button>

            <button
              onClick={() => setStep("capture")}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/20"
            >
              ← 다시 찍기
            </button>
          </div>
        )}

        {/* Loading Step */}
        {step === "loading" && (
          <div className="flex flex-col items-center gap-6 py-16">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-purple-400/30" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-spin" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-3xl animate-pulse">
                ⭐
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">인생사진 생성 중...</p>
              <p className="text-white/50 text-sm mt-1">{celebrity}와(과) 함께하는 사진을 만들고 있어요</p>
              <p className="text-white/30 text-xs mt-2">약 15~30초 소요될 수 있어요</p>
            </div>
          </div>
        )}

        {/* Result Step */}
        {step === "result" && resultImage && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-white/70 text-sm text-center">
              <span className="font-bold text-white">{celebrity}</span>와(과) 함께하는 인생사진 완성!
            </p>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-400/30 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultImage} alt="인생사진 결과" className="w-full" />
              <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs text-center">Glow AI Studio • 정보 교과 체험 부스</p>
              </div>
            </div>

            <DownloadButton
              imageUrl={resultImage}
              filename={`star-me-${celebrity.replace(/\s/g, "-")}.jpg`}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              저장하고 프린트하기
            </DownloadButton>

            <button
              onClick={() => { setStep("capture"); setCaptured(null); setResultImage(null); setCelebrity(""); }}
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
