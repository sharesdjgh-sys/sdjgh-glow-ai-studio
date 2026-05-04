"use client";

import { useState } from "react";
import Icon from "./Icon";

const DOMAINS = [
  "@gmail.com",
  "@naver.com",
  "직접입력",
];

interface EmailSenderProps {
  imageBase64: string;
  featureName: string;
  featureKo: string;
}

export default function EmailSender({ imageBase64, featureName, featureKo }: EmailSenderProps) {
  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("@gmail.com");
  const [customDomain, setCustomDomain] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isCustom = domain === "직접입력";
  const fullEmail = username + (isCustom ? customDomain : domain);

  const handleSend = async () => {
    if (!username.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: fullEmail, imageBase64, featureName, featureKo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "전송 실패");
      setStatus("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "전송 중 오류가 발생했어요");
      setStatus("error");
    }
  };

  return (
    <div style={{
      padding: "20px 24px", background: "var(--paper)",
      borderRadius: "var(--r-xl)", border: "1px solid var(--hairline)", boxShadow: "var(--shadow-1)",
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)", marginBottom: 12 }}>
        📧 이메일로 받기
      </div>

      {status === "sent" ? (
        <div style={{
          padding: "14px 18px", background: "var(--mint-soft)",
          borderRadius: "var(--r-md)", color: "var(--mint-deep)",
          fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 10,
        }}>
          <Icon name="check" size={18} stroke={2.5} /> {fullEmail} 으로 전송 완료!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            {/* 아이디 입력 */}
            <input
              type="text"
              placeholder="이메일 아이디"
              value={username}
              onChange={e => { setUsername(e.target.value.trim()); setStatus("idle"); }}
              style={{
                flex: "1 1 0", minWidth: 0, padding: "14px 14px", fontSize: 15,
                border: `1.5px solid ${status === "error" ? "#E53E3E" : "var(--hairline-2)"}`,
                borderRadius: "var(--r-md)", outline: "none",
                background: "var(--canvas)", color: "var(--ink)", fontFamily: "inherit",
              }}
            />

            {/* 도메인 선택 */}
            <select
              value={domain}
              onChange={e => { setDomain(e.target.value); setStatus("idle"); }}
              style={{
                flexShrink: 0, padding: "14px 12px", fontSize: 15,
                border: "1.5px solid var(--hairline-2)", borderRadius: "var(--r-md)",
                background: "var(--canvas)", color: "var(--ink)", fontFamily: "inherit",
                cursor: "pointer", outline: "none",
              }}
            >
              {DOMAINS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* 전송 버튼 */}
            <button
              className="btn btn-rose"
              onClick={handleSend}
              disabled={status === "sending" || !username.trim() || (isCustom && !customDomain.trim())}
              style={{ flexShrink: 0, whiteSpace: "nowrap", opacity: status === "sending" || !username.trim() || (isCustom && !customDomain.trim()) ? 0.6 : 1 }}
            >
              {status === "sending" ? "전송 중…" : "전송"}
            </button>
          </div>

          {/* 직접입력 도메인 필드 */}
          {isCustom && (
            <input
              type="text"
              placeholder="@도메인 직접 입력 (예: @school.kr)"
              value={customDomain}
              onChange={e => { setCustomDomain(e.target.value.trim()); setStatus("idle"); }}
              style={{
                width: "100%", padding: "14px 14px", fontSize: 15,
                border: `1.5px solid ${status === "error" ? "#E53E3E" : "var(--hairline-2)"}`,
                borderRadius: "var(--r-md)", outline: "none",
                background: "var(--canvas)", color: "var(--ink)", fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          )}
        </div>
      )}

      {status === "error" && (
        <div style={{ marginTop: 8, fontSize: 13, color: "#E53E3E", fontWeight: 600 }}>{errorMsg}</div>
      )}
    </div>
  );
}
