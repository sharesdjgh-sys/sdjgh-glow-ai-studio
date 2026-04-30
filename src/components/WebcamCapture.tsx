"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onRetake?: () => void;
  captured?: string | null;
}

export default function WebcamCapture({
  onCapture,
  onRetake,
  captured,
}: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) onCapture(imageSrc);
  }, [onCapture]);

  if (captured) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={captured} alt="촬영된 사진" className="w-72 h-72 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <button
          onClick={onRetake}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-medium transition-all border border-white/30 backdrop-blur-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          다시 찍기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 bg-black">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.95}
          videoConstraints={{
            width: 720,
            height: 720,
            facingMode,
          }}
          onUserMedia={() => setHasPermission(true)}
          onUserMediaError={() => setHasPermission(false)}
          className="w-72 h-72 object-cover"
          mirrored={facingMode === "user"}
        />
        {hasPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white text-center p-4">
            <svg className="w-12 h-12 mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">카메라 권한이 필요해요</p>
            <p className="text-xs text-white/60 mt-1">브라우저에서 카메라 허용을 눌러주세요</p>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setFacingMode(m => m === "user" ? "environment" : "user")}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all backdrop-blur-sm"
            title="카메라 전환"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <button
        onClick={capture}
        disabled={hasPermission === false}
        className="relative w-20 h-20 rounded-full bg-white shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <span className="absolute inset-2 rounded-full border-4 border-gray-300 group-hover:border-gray-400 transition-colors" />
        <span className="sr-only">촬영하기</span>
      </button>
      <p className="text-white/60 text-sm">버튼을 눌러 촬영하세요</p>
    </div>
  );
}
