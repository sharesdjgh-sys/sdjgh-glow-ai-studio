"use client";

import { useState, useEffect } from "react";

interface Dot {
  x: number; y: number; s: number; c: string; r: number; d: number;
}

interface ConfettiProps {
  count?: number;
  colors?: string[];
}

const DEFAULT_COLORS = ["#FF6B8B", "#B79CFF", "#6FE3CD", "#FFD66B", "#FFB48F"];

export default function Confetti({ count = 18, colors = DEFAULT_COLORS }: ConfettiProps) {
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    setDots(
      Array.from({ length: count }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 4 + Math.random() * 8,
        c: colors[i % colors.length],
        r: Math.random() * 360,
        d: Math.random() * 1.2,
      }))
    );
  }, [count, colors]);

  if (dots.length === 0) return null;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {dots.map((d, i) => (
        <rect
          key={i}
          x={d.x}
          y={d.y}
          width={d.s}
          height={d.s / 2.5}
          rx={d.s / 4}
          fill={d.c}
          transform={`rotate(${d.r} ${d.x + d.s / 2} ${d.y + d.s / 4})`}
          style={{ animation: "float-y 3.6s ease-in-out infinite", animationDelay: `${d.d}s` }}
        />
      ))}
    </svg>
  );
}
