"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Icon from "@/components/glow/Icon";
import PrivacyChip from "@/components/glow/PrivacyChip";

const FEATURES = [
  {
    id: "color",
    href: "/color-me",
    en: "Color Me",
    ko: "퍼스널 컬러 인포그래픽",
    desc: "내 피부톤·눈동자·머리카락을 분석해서 어울리는 컬러 팔레트를 알려줘요",
    accent: "var(--lavender)",
    accentDeep: "var(--lavender-deep)",
    accentSoft: "var(--lavender-soft)",
    accentTint: "var(--lavender-tint)",
    api: "ChatGPT",
    icon: "palette" as const,
    swatches: ["#FF9AB5", "#FFB48F", "#FFD66B", "#9DE3C9", "#A8C5FF", "#B79CFF"],
    preview: "color",
  },
  {
    id: "star",
    href: "/star-me",
    en: "Star Me",
    ko: "여자 연예인과 인생사진",
    desc: "인기 여자 연예인과 함께 찍은 듯한 사진을 만들어드려요",
    accent: "var(--sun)",
    accentDeep: "var(--sun-deep)",
    accentSoft: "var(--sun-soft)",
    accentTint: "var(--sun-tint)",
    api: "Grok",
    icon: "star" as const,
    swatches: null,
    preview: "star",
  },
  {
    id: "toon",
    href: "/toon-me",
    en: "Toon Me",
    ko: "픽사스타일 캐릭터",
    desc: "내 얼굴이 픽사 캐릭터가 된다면? 9가지 표정 콜라주로 만나봐요",
    accent: "var(--mint)",
    accentDeep: "var(--mint-deep)",
    accentSoft: "var(--mint-soft)",
    accentTint: "var(--mint-tint)",
    api: "Gemini",
    icon: "smile" as const,
    swatches: null,
    preview: "toon",
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="kiosk-stage">
      {/* Top bar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 40px", gap: 24, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexShrink: 0, whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 600, fontSize: 28, color: "var(--rose-deep)" }}>
            Glow
          </span>
          <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.01em" }}>AI Studio</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
          <span className="pill" style={{ background: "var(--rose-soft)", color: "var(--rose-deep)", whiteSpace: "nowrap" }}>
            서대전여자고등학교 · 정보 교과 설명회
          </span>
          <PrivacyChip />
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: "32px 40px 24px", textAlign: "center", position: "relative" }}>
        <ParticleCanvas />
        <div style={{ position: "relative", zIndex: 1 }}>
        <div className="t-eyebrow" style={{ marginBottom: 12 }}>Pick one. Make it yours.</div>
        <h1 style={{ margin: 0 }}>
          <span style={{
            fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500,
            fontSize: 96, lineHeight: 1.05, letterSpacing: "-0.03em",
            background: "linear-gradient(95deg, #FF6B8B 0%, #B79CFF 50%, #6FE3CD 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            display: "block", paddingBottom: 8,
          }}>
            오늘의 너,
          </span>
          <span style={{ fontWeight: 800, fontSize: 56, letterSpacing: "-0.02em", display: "block", marginTop: 8, lineHeight: 1.15 }}>
            세 가지 AI로 빛나게
          </span>
        </h1>
        <p style={{ marginTop: 20, color: "var(--ink-2)", fontSize: 19, fontWeight: 500 }}>
          웹캠으로 셀카 한 장이면 끝. 결과는 바로 프린트해서 가져갈 수 있어요.
        </p>
        </div>
      </section>

      {/* Cards */}
      <section style={{
        padding: "24px 40px 48px",
        display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 24, maxWidth: 1440, margin: "0 auto", width: "100%",
      }}>
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.id} feature={f} onClick={() => router.push(f.href)} idx={i} />
        ))}
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: "auto", padding: "24px 40px",
        borderTop: "1px solid var(--hairline)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        color: "var(--ink-3)", fontSize: 13,
        background: "var(--canvas-tint)",
      }}>
        <span>서대전여자고등학교 · 정보 교과 · 2026 교육과정 박람회</span>
        <img
          src="/lifeprofessor-logo.png"
          alt="인생교수의 AI 연구소"
          style={{ height: 28, width: "auto", opacity: 0.85 }}
        />
      </footer>
    </div>
  );
}

type Feature = typeof FEATURES[number];

function FeatureCard({ feature, onClick, idx }: { feature: Feature; onClick: () => void; idx: number }) {
  const { en, ko, desc, accent, accentDeep, accentSoft, accentTint, api, swatches, preview } = feature;

  const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow = "var(--shadow-3)";
    e.currentTarget.style.borderColor = "transparent";
  };
  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.borderColor = "var(--hairline)";
  };

  return (
    <button
      onClick={onClick}
      className="fade-up"
      style={{
        display: "flex", flexDirection: "column", textAlign: "left",
        background: "var(--paper)", border: "1px solid var(--hairline)",
        borderRadius: "var(--r-md)", padding: 0, overflow: "hidden",
        transition: "transform 220ms var(--ease), box-shadow 220ms var(--ease), border-color 220ms",
        animationDelay: `${idx * 90}ms`,
        cursor: "pointer",
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Preview area */}
      <div style={{ position: "relative", aspectRatio: "4/5", background: accentTint, overflow: "hidden" }}>
        <FeaturePreview id={preview} accent={accent} accentSoft={accentSoft} swatches={swatches} />
      </div>

      {/* Body */}
      <div style={{ padding: "28px 28px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
        <span className="t-en" style={{ color: accentDeep, fontSize: 18 }}>{en}</span>
        <h3 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>{ko}</h3>
        <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 15, lineHeight: 1.5 }}>{desc}</p>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, color: "var(--ink-3)", fontWeight: 600 }}>3분이면 충분</span>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "12px 18px", borderRadius: "var(--r-pill)",
            background: "var(--ink)", color: "#FFF4F7", fontSize: 14, fontWeight: 700,
          }}>
            시작하기 <Icon name="arrow-right" size={16} />
          </span>
        </div>
      </div>
    </button>
  );
}

function FeaturePreview({ id, accent, accentSoft, swatches }: {
  id: string; accent: string; accentSoft: string; swatches: string[] | null;
}) {
  if (id === "color") {
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <img
          src="/color-me-home-preview.png"
          alt="퍼스널 컬러 분석 샘플"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    );
  }

  if (id === "star") {
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <img
          src="/star-me-home-preview.png"
          alt="인생샷 미리보기 샘플"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    );
  }

  if (id === "toon") {
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src="/toon-me-home-preview.png"
          alt="픽사스타일 9가지 감정 캐릭터 샘플"
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      </div>
    );
  }

  return null;
}

const PARTICLE_COLORS = [
  "rgba(255,107,139,",   // rose
  "rgba(183,156,255,",   // lavender
  "rgba(111,227,205,",   // mint
  "rgba(255,214,107,",   // sun
  "rgba(255,180,143,",   // peach
];

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  alpha: number; alphaDir: number;
  color: string;
  shape: "circle" | "star";
  rot: number; rotV: number;
};

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.5 - 0.2,
      r: Math.random() * 4 + 2,
      alpha: Math.random() * 0.45 + 0.35,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      shape: Math.random() > 0.4 ? "star" : "circle",
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.04,
    });

    for (let i = 0; i < 55; i++) particles.push(spawn());

    const drawStar = (cx: number, cy: number, r: number, rot: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerA = rot + (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const innerA = outerA + Math.PI / 5;
        if (i === 0) ctx.moveTo(cx + r * Math.cos(outerA), cy + r * Math.sin(outerA));
        else ctx.lineTo(cx + r * Math.cos(outerA), cy + r * Math.sin(outerA));
        ctx.lineTo(cx + (r * 0.42) * Math.cos(innerA), cy + (r * 0.42) * Math.sin(innerA));
      }
      ctx.closePath();
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotV;
        p.alpha += p.alphaDir * 0.005;
        if (p.alpha >= 0.82) p.alphaDir = -1;
        if (p.alpha <= 0.18) p.alphaDir = 1;

        if (p.y < -20) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -20) p.x = canvas.width + 10;
        if (p.x > canvas.width + 20) p.x = -10;

        ctx.fillStyle = `${p.color}${p.alpha.toFixed(2)})`;
        if (p.shape === "star") {
          drawStar(p.x, p.y, p.r, p.rot);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
