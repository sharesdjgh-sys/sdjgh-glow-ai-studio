"use client";

import { forwardRef } from "react";

export interface ColorItem {
  name: string;
  hex: string;
  description: string;
}

export interface PersonalColorResult {
  toneCategory: "웜톤" | "쿨톤" | "뉴트럴";
  warmStars: number;
  coolStars: number;
  seasonType: string;
  seasonDesc: string;
  skin: { brightness: string; saturation: string; undertone: string; description: string };
  eyes: { color: string; brightness: string; characteristics: string; description: string };
  hair: { color: string; brightness: string; characteristics: string; description: string };
  overall: { contrast: string; imageStyle: string; atmosphere: string; description: string };
  bestColors: ColorItem[];
  worstColors: ColorItem[];
  stylingColors: string;
  stylingAccessories: string;
  stylingMakeup: string;
  stylingHair: string;
  bestColorsBullets: string[];
  worstColorsBullets: string[];
  summary: string;
  comparisonImageUrl?: string;
}

interface Props {
  data: PersonalColorResult;
  photoUrl: string;
}

const NAV = "#1E3A5F";

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#1F2937" : "#FFFFFF";
}

function Stars({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <div style={{ display: "flex", gap: 2, marginTop: 5 }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} style={{ fontSize: 15, color: i < filled ? "#F59E0B" : "#E5E7EB", lineHeight: 1 }}>★</span>
      ))}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${NAV} 0%, #2D5A8F 100%)`,
      color: "white", padding: "10px 16px",
      fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
      borderRadius: "12px 12px 0 0",
    }}>
      {children}
    </div>
  );
}

function ToneBox({ label, stars, active, activeBg, activeBorder, labelColor, gradFrom, gradTo }: {
  label: string; stars: number; active: boolean;
  activeBg: string; activeBorder: string; labelColor: string;
  gradFrom: string; gradTo: string;
}) {
  return (
    <div style={{
      background: active ? activeBg : "#F9FAFB",
      border: `2px solid ${active ? activeBorder : "#E5E7EB"}`,
      borderRadius: 14, padding: "14px 16px", position: "relative",
      boxShadow: active ? `0 4px 14px ${activeBorder}30` : "none",
    }}>
      {active && (
        <div style={{
          position: "absolute", top: -1, right: -1,
          background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
          borderRadius: "0 12px 0 12px",
          padding: "4px 10px", fontSize: 10, fontWeight: 800, color: "white",
          letterSpacing: "0.05em",
        }}>추천 ✓</div>
      )}
      <div style={{ fontSize: 17, fontWeight: 800, color: active ? labelColor : "#9CA3AF" }}>{label}</div>
      <Stars filled={stars} />
      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>추천도</div>
    </div>
  );
}

// ─── AI 이미지 비교 그리드 (텍스트 오버레이) ──────────────────────────────

function ComparisonWithAIImage({ comparisonImageUrl, bestColors, worstColors }: {
  comparisonImageUrl: string;
  bestColors: ColorItem[];
  worstColors: ColorItem[];
}) {
  const allColors = [...bestColors, ...worstColors];

  return (
    <div style={{ position: "relative", display: "block", lineHeight: 0 }}>
      <img
        src={comparisonImageUrl}
        alt="퍼스널 컬러 비교"
        style={{ width: "100%", display: "block" }}
      />
      {allColors.map((color, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const isBest = i < 4;

        return (
          <div key={i}>
            {/* 상단 헤더 라벨 */}
            <div style={{
              position: "absolute",
              left: `${col * 25}%`,
              top: `${row * 50}%`,
              width: "25%",
              background: isBest ? "rgba(30,58,95,0.82)" : "rgba(120,20,20,0.82)",
              color: "white",
              padding: "3px 8px 4px",
              fontSize: "1.15%",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "0.3%",
              boxSizing: "border-box",
              lineHeight: 1.4,
            }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "1.4%", height: "1.4%",
                minWidth: 14, minHeight: 14,
                borderRadius: "50%",
                background: isBest ? "#22C55E" : "#EF4444",
                fontSize: "0.9%", fontWeight: 900, flexShrink: 0,
                color: "white",
              }}>{isBest ? "✓" : "✗"}</span>
              <span style={{ fontSize: 11 }}>{i + 1}. {color.name}</span>
            </div>

            {/* 하단 설명 라벨 */}
            <div style={{
              position: "absolute",
              left: `${col * 25}%`,
              top: `${row * 50 + 41.5}%`,
              width: "25%",
              background: "rgba(255,255,255,0.88)",
              color: "#1F2937",
              padding: "3px 8px 4px",
              fontSize: 10,
              lineHeight: 1.4,
              boxSizing: "border-box",
            }}>
              {color.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Fallback: React 카드 그리드 (AI 이미지 없을 때) ─────────────────────

function ColorCardFallback({ color, index, photoUrl, isBest }: {
  color: ColorItem; index: number; photoUrl: string; isBest: boolean;
}) {
  const swatchText = getContrastColor(color.hex);
  return (
    <div style={{ background: "white", display: "flex", flexDirection: "column" }}>
      <div style={{
        background: isBest ? `linear-gradient(90deg, #1E3A5F, #2D5A8F)` : `linear-gradient(90deg, #7F1D1D, #991B1B)`,
        color: "white", padding: "6px 10px", fontSize: 11, fontWeight: 700,
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <span style={{
          width: 15, height: 15, borderRadius: "50%", flexShrink: 0,
          background: isBest ? "#22C55E" : "#EF4444",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 8, fontWeight: 900,
        }}>{isBest ? "✓" : "✗"}</span>
        {index}. {color.name}
      </div>
      <div style={{ overflow: "hidden", flexShrink: 0 }}>
        <img src={photoUrl} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "50% 10%", display: "block" }} />
      </div>
      <div style={{ background: color.hex, padding: "7px 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: swatchText }}>{color.name}</span>
      </div>
      <div style={{ padding: "7px 10px 9px", fontSize: 11, color: "#374151", lineHeight: 1.5, background: "#F8FAFC", flex: 1 }}>
        {color.description}
      </div>
    </div>
  );
}

// ─── Analysis Box ─────────────────────────────────────────────────────────

const ANALYSIS_ACCENTS = ["#8B5CF6", "#0891B2", "#D97706", "#059669"];
const ANALYSIS_LIGHT = ["#F5F3FF", "#ECFEFF", "#FFFBEB", "#F0FDF4"];

function AnalysisBox({ icon, label, rows, description, accent, lightBg }: {
  icon: string; label: string;
  rows: [string, string][];
  description: string;
  accent: string;
  lightBg: string;
}) {
  return (
    <div style={{ background: "white", borderTop: `4px solid ${accent}` }}>
      <div style={{ padding: "11px 12px 8px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: lightBg,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>{icon}</span>
        <span style={{ fontWeight: 800, fontSize: 13, color: "#111827" }}>{label}</span>
      </div>
      <div style={{ padding: "0 12px 8px" }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ fontSize: 11, marginBottom: 4, display: "flex", gap: 4 }}>
            <span style={{ color: "#9CA3AF", flexShrink: 0, minWidth: 38 }}>{k}:</span>
            <span style={{ fontWeight: 600, color: "#374151", lineHeight: 1.4 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{
        margin: "0 10px 10px", padding: "8px 10px",
        background: lightBg, borderRadius: 8,
        fontSize: 11, color: "#4B5563", lineHeight: 1.6,
        borderLeft: `3px solid ${accent}`,
      }}>
        {description}
      </div>
    </div>
  );
}

// ─── Recommend Box ────────────────────────────────────────────────────────

function RecommendBox({ title, titleGrad, titleColor, colors, bullets, bulletIcon, bulletColor }: {
  title: string; titleGrad: string; titleColor: string;
  colors: ColorItem[]; bullets: string[];
  bulletIcon: string; bulletColor: string;
}) {
  return (
    <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #F1F5F9" }}>
      <div style={{ background: titleGrad, color: titleColor, padding: "10px 14px", fontWeight: 700, fontSize: 12 }}>
        {title}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginBottom: 10 }}>
          {colors.map((c) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, background: c.hex, border: "2px solid rgba(0,0,0,0.08)", display: "inline-block", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }} />
              <span style={{ color: "#374151", fontWeight: 500 }}>{c.name}</span>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: "#F1F5F9", marginBottom: 8 }} />
        {bullets.map((b, i) => (
          <div key={i} style={{ display: "flex", gap: 5, marginBottom: 5, fontSize: 11, alignItems: "flex-start" }}>
            <span style={{ color: bulletColor, fontWeight: 800, flexShrink: 0 }}>{bulletIcon}</span>
            <span style={{ color: "#4B5563", lineHeight: 1.5 }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Styling Box ──────────────────────────────────────────────────────────

function StylingBox({ colors, accessories, makeup, hair }: {
  colors: string; accessories: string; makeup: string; hair: string;
}) {
  const items = [
    { icon: "👗", label: "의상 톤", value: colors, accent: "#8B5CF6" },
    { icon: "💎", label: "액세서리", value: accessories, accent: "#0891B2" },
    { icon: "💄", label: "메이크업", value: makeup, accent: "#EC4899" },
    { icon: "✂️", label: "헤어 컬러", value: hair, accent: "#D97706" },
  ];
  return (
    <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #F1F5F9" }}>
      <div style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)", color: "white", padding: "10px 14px", fontWeight: 700, fontSize: 12 }}>
        스타일링 제안
      </div>
      <div style={{ padding: "10px 14px" }}>
        {items.map(({ icon, label, value, accent }) => (
          <div key={label} style={{ marginBottom: 9, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, marginTop: 1 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, letterSpacing: "0.04em" }}>{label}</div>
              <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.45, marginTop: 1 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

const ColorAnalysisReport = forwardRef<HTMLDivElement, Props>(({ data, photoUrl }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        background: "linear-gradient(160deg, #EEF2FF 0%, #F5F0FF 50%, #EFF6FF 100%)",
        fontFamily: "Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
        padding: "32px 28px 36px",
        boxSizing: "border-box",
        color: "#1B1419",
      }}
    >
      {/* ─── Header ──────────────────────────────────────────────── */}
      <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 900, letterSpacing: "-0.025em", margin: "0 0 22px", color: NAV }}>
        퍼스널 컬러 분석 리포트
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: 12, marginBottom: 22 }}>
        <ToneBox label="웜톤" stars={data.warmStars} active={data.toneCategory === "웜톤"}
          activeBg="#FFFBEB" activeBorder="#F59E0B" labelColor="#B45309" gradFrom="#F59E0B" gradTo="#D97706" />
        <ToneBox label="쿨톤" stars={data.coolStars} active={data.toneCategory === "쿨톤"}
          activeBg="#EFF6FF" activeBorder="#3B82F6" labelColor="#1D4ED8" gradFrom="#3B82F6" gradTo="#2563EB" />
        <div style={{ background: `linear-gradient(135deg, ${NAV} 0%, #2D5A8F 100%)`, color: "white", borderRadius: 14, padding: "16px 18px", boxShadow: "0 4px 16px rgba(30,58,95,0.3)" }}>
          <div style={{ fontSize: 10, opacity: 0.65, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>세부 타입</div>
          <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.2 }}>{data.seasonType}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6, wordBreak: "keep-all", lineHeight: 1.5 }}>{data.seasonDesc}</div>
        </div>
      </div>

      {/* ─── Color Comparison ────────────────────────────────────── */}
      <SectionHeader>컬러 비교 (Best 4 vs Worst 4)</SectionHeader>
      <div style={{ borderRadius: "0 0 12px 12px", overflow: "hidden", marginBottom: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
        {data.comparisonImageUrl ? (
          <ComparisonWithAIImage
            comparisonImageUrl={data.comparisonImageUrl}
            bestColors={data.bestColors}
            worstColors={data.worstColors}
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, background: "#CBD5E1" }}>
            {data.bestColors.map((c, i) => <ColorCardFallback key={`b${i}`} color={c} index={i + 1} photoUrl={photoUrl} isBest={true} />)}
            {data.worstColors.map((c, i) => <ColorCardFallback key={`w${i}`} color={c} index={i + 5} photoUrl={photoUrl} isBest={false} />)}
          </div>
        )}
      </div>

      {/* ─── Analysis ────────────────────────────────────────────── */}
      <SectionHeader>퍼스널 컬러 분석</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, background: "#CBD5E1", marginBottom: 20, borderRadius: "0 0 12px 12px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        <AnalysisBox icon="🧴" label="피부 톤" accent={ANALYSIS_ACCENTS[0]} lightBg={ANALYSIS_LIGHT[0]}
          rows={[["밝기", data.skin.brightness], ["채도", data.skin.saturation], ["언더톤", data.skin.undertone]]}
          description={data.skin.description} />
        <AnalysisBox icon="👁" label="눈동자" accent={ANALYSIS_ACCENTS[1]} lightBg={ANALYSIS_LIGHT[1]}
          rows={[["색상", data.eyes.color], ["명도", data.eyes.brightness], ["특징", data.eyes.characteristics]]}
          description={data.eyes.description} />
        <AnalysisBox icon="💇" label="헤어" accent={ANALYSIS_ACCENTS[2]} lightBg={ANALYSIS_LIGHT[2]}
          rows={[["색상", data.hair.color], ["명도", data.hair.brightness], ["특징", data.hair.characteristics]]}
          description={data.hair.description} />
        <AnalysisBox icon="✨" label="전체 인상" accent={ANALYSIS_ACCENTS[3]} lightBg={ANALYSIS_LIGHT[3]}
          rows={[["대비감", data.overall.contrast], ["이미지", data.overall.imageStyle], ["분위기", data.overall.atmosphere]]}
          description={data.overall.description} />
      </div>

      {/* ─── Recommendations ─────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        <RecommendBox title="추천 컬러 (Best)" titleGrad="linear-gradient(135deg, #1E40AF, #3B82F6)" titleColor="white"
          colors={data.bestColors} bullets={data.bestColorsBullets} bulletColor="#16A34A" bulletIcon="✓" />
        <RecommendBox title="피해야 할 컬러 (Worst)" titleGrad="linear-gradient(135deg, #991B1B, #EF4444)" titleColor="white"
          colors={data.worstColors} bullets={data.worstColorsBullets} bulletColor="#DC2626" bulletIcon="✗" />
        <StylingBox colors={data.stylingColors} accessories={data.stylingAccessories} makeup={data.stylingMakeup} hair={data.stylingHair} />
      </div>

      {/* ─── Summary ─────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${NAV} 0%, #2D5A8F 100%)`, color: "white", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 16px rgba(30,58,95,0.3)" }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>💡</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 800, marginRight: 8, fontSize: 13 }}>핵심 요약</span>
          <span style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>{data.summary}</span>
        </div>
        <div style={{ fontSize: 10, opacity: 0.45, flexShrink: 0, textAlign: "right", lineHeight: 1.5 }}>
          분석 기준: 업로드된 사진 (조명 조건 가정)<br />
          ※ 환경에 따라 차이가 있을 수 있습니다
        </div>
      </div>
    </div>
  );
});

ColorAnalysisReport.displayName = "ColorAnalysisReport";
export default ColorAnalysisReport;
