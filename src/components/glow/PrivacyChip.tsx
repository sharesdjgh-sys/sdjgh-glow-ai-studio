import Icon from "./Icon";

export default function PrivacyChip() {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 14px",
      borderRadius: "var(--r-pill)",
      background: "var(--mint-soft)",
      color: "var(--mint-deep)",
      fontSize: 13,
      fontWeight: 700,
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      <Icon name="shield" size={14} stroke={2.4} />
      사진은 서버에 저장되지 않아요
    </div>
  );
}
