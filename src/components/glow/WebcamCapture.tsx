"use client";

import { useState, useEffect, useRef } from "react";
import Icon from "./Icon";

interface WebcamCaptureProps {
  accentColor?: string;
  countdownSec?: number;
  onCapture: (snapshot: string | null) => void;
  tips?: { icon: string; text: string }[];
}

const DEFAULT_TIPS = [
  { icon: "sun", text: "조명이 밝은 곳에 서주세요" },
  { icon: "user", text: "얼굴이 화면 중앙 타원 안에 오도록 맞춰주세요" },
  { icon: "eye", text: "카메라를 정면으로 바라봐 주세요" },
  { icon: "smile", text: "자연스러운 표정이 가장 잘 나와요" },
];

export default function WebcamCapture({
  accentColor = "var(--rose)",
  countdownSec = 3,
  onCapture,
  tips = DEFAULT_TIPS,
}: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "live" | "counting" | "flash" | "error">("idle");
  const [count, setCount] = useState(countdownSec);

  useEffect(() => {
    let stream: MediaStream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus("live");
        }
      } catch {
        setStatus("error");
      }
    })();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    if (status !== "counting") return;
    if (count <= 0) {
      setStatus("flash");
      const v = videoRef.current;
      if (v) {
        const canvas = document.createElement("canvas");
        canvas.width = 720; canvas.height = 900;
        const ctx = canvas.getContext("2d")!;
        const vw = v.videoWidth, vh = v.videoHeight;
        const targetAR = 720 / 900;
        let sw = vw, sh = vw / targetAR;
        if (sh > vh) { sh = vh; sw = vh * targetAR; }
        const sx = (vw - sw) / 2, sy = (vh - sh) / 2;
        ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
        ctx.drawImage(v, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        setTimeout(() => onCapture(canvas.toDataURL("image/jpeg", 0.9)), 350);
      } else {
        setTimeout(() => onCapture(null), 350);
      }
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, count, onCapture]);

  const startCountdown = () => {
    if (status !== "live") return;
    setStatus("counting");
    setCount(countdownSec);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 720; canvas.height = 900;
        const ctx = canvas.getContext("2d")!;
        const targetAR = 720 / 900;
        let sw = img.width, sh = img.width / targetAR;
        if (sh > img.height) { sh = img.height; sw = img.height * targetAR; }
        const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 720, 900);
        onCapture(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const overlayStyle: React.CSSProperties = {
    position: "absolute", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(27,20,25,0.55)",
  };

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: 48, alignItems: "center",
      width: "100%", maxWidth: 1100,
    }}>
      {/* ── 왼쪽: 웹캠 ── */}
      <div style={{
        position: "relative", aspectRatio: "4/5",
        borderRadius: "var(--r-2xl)", overflow: "hidden",
        background: "var(--canvas-tint)", border: `3px solid ${accentColor}`,
        boxShadow: "var(--shadow-3)",
      }}>
        <video ref={videoRef} autoPlay playsInline muted
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
        <svg viewBox="0 0 100 125" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} preserveAspectRatio="none">
          <ellipse cx="50" cy="55" rx="22" ry="28" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" strokeDasharray="1.6 1.4" fill="none" />
        </svg>

        {status === "idle" && (
          <div style={overlayStyle}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "white" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", border: "3px solid white", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
              <div style={{ fontSize: 16, fontWeight: 600 }}>웹캠 연결 중…</div>
            </div>
          </div>
        )}
        {status === "error" && (
          <div style={{ ...overlayStyle, background: "rgba(27,20,25,0.85)" }}>
            <div style={{ color: "white", textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎥</div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>웹캠을 사용할 수 없어요</div>
              <div style={{ fontSize: 14, opacity: 0.8, marginTop: 6 }}>브라우저에서 카메라 권한을 허용해 주세요</div>
            </div>
          </div>
        )}
        {status === "counting" && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            paddingBottom: 24, background: "rgba(27,20,25,0.12)",
          }}>
            <div key={count} style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontStyle: "italic",
              fontSize: 88, color: "white", lineHeight: 1,
              animation: "pop 360ms var(--ease) both",
              textShadow: "0 4px 16px rgba(0,0,0,0.6)",
            }}>
              {count > 0 ? count : "✨"}
            </div>
          </div>
        )}
        {status === "flash" && <div style={{ position: "absolute", inset: 0, background: "white" }} />}
      </div>

      {/* ── 오른쪽: 버튼 + 업로드 + 팁 ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* 웹캠 촬영 버튼 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="t-eyebrow">웹캠으로 촬영</div>
          <button
            className="btn btn-rose btn-xl"
            onClick={startCountdown}
            disabled={status !== "live"}
            style={{
              opacity: status === "live" ? 1 : 0.55,
              padding: "20px 40px", fontSize: 20, width: "100%",
              animation: status === "live" ? "pulse-ring 1.6s ease-out infinite" : "none",
              borderRadius: "var(--r-pill)",
              justifyContent: "center",
            }}>
            <Icon name="camera" size={22} stroke={2.2} />
            {countdownSec}초 후 촬영
          </button>
          {status === "counting" && (
            <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0, textAlign: "center" }}>
              자세를 잡고 카메라를 바라봐 주세요 👀
            </p>
          )}
        </div>

        {/* 구분선 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>또는</span>
          <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
        </div>

        {/* 사진 업로드 버튼 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="t-eyebrow">사진 업로드</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <button
            className="btn btn-ghost btn-xl"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "20px 40px", fontSize: 20, width: "100%",
              borderRadius: "var(--r-pill)",
              justifyContent: "center",
              border: `2px dashed ${accentColor}`,
            }}>
            <Icon name="upload" size={22} stroke={2.2} />
            갤러리에서 선택
          </button>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0, textAlign: "center", wordBreak: "keep-all" }}>
            셀카가 잘 안 찍혔을 때 원하는 사진을 직접 올려보세요
          </p>
        </div>

        {/* 촬영 팁 */}
        <div style={{
          padding: "16px 20px",
          background: "var(--canvas-tint)",
          borderRadius: "var(--r-xl)",
          border: "1px solid var(--hairline)",
          marginTop: 4,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
            촬영 전 체크
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: accentColor,
                  color: "white",
                  fontSize: 13, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 16, color: "var(--ink-2)", lineHeight: 1.45, wordBreak: "keep-all" }}>
                  {tip.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
