"use client";

import Icon from "./Icon";

interface KioskHeaderProps {
  onBack?: () => void;
  onHome: () => void;
  step?: number;
  total?: number;
  label?: string;
}

export default function KioskHeader({ onBack, onHome, step, total, label }: KioskHeaderProps) {
  return (
    <header style={{
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
      gap: 24,
      padding: "20px 32px",
      borderBottom: "1px solid var(--hairline)",
      background: "rgba(255,252,250,0.92)",
      backdropFilter: "blur(8px)",
      position: "sticky",
      top: 0,
      zIndex: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
        {onBack ? (
          <button className="icon-btn" onClick={onBack} aria-label="뒤로" style={{ flexShrink: 0 }}>
            <Icon name="back" size={22} />
          </button>
        ) : (
          <div style={{ width: 56, flexShrink: 0 }} />
        )}
        <button
          onClick={onHome}
          aria-label="홈으로"
          style={{
            display: "flex", alignItems: "baseline", gap: 8,
            flexShrink: 0, whiteSpace: "nowrap",
            background: "none", border: "none", padding: 0,
            cursor: "pointer",
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 600, fontSize: 22, color: "var(--rose-deep)" }}>
            Glow
          </span>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.01em" }}>AI Studio</span>
        </button>
      </div>

      {label ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", minWidth: 0 }}>
          <span className="t-caption" style={{ color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {label}
          </span>
          {total != null && (
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: total }, (_, i) => (
                <span key={i} style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  borderRadius: 99,
                  background: i === step ? "var(--rose)" : "var(--hairline-2)",
                  transition: "width 220ms var(--ease)",
                  display: "inline-block",
                }} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, justifyContent: "flex-end" }}>
        <span className="pill" style={{ background: "var(--mint-soft)", color: "var(--mint-deep)", whiteSpace: "nowrap" }}>
          <Icon name="lock" size={12} stroke={2.4} />
          브라우저 처리
        </span>
        <button className="icon-btn" onClick={onHome} aria-label="홈으로">
          <Icon name="x" size={22} />
        </button>
      </div>
    </header>
  );
}
