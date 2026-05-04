type Mood = "neutral" | "surprised" | "annoyed" | "confused" | "frustrated"
           | "thoughtful" | "sarcastic" | "worried" | "bored" | "curious";

interface FauxPortraitProps {
  palette?: string[];
  hair?: string;
  mood?: Mood;
  style?: React.CSSProperties;
}

export default function FauxPortrait({
  palette = ["#FFE3EA", "#FF9F8A", "#E8456E"],
  hair = "#3A2A2A",
  mood = "neutral",
  style,
}: FauxPortraitProps) {
  const eyes = mood === "surprised" ? { ry: 3.4 } : mood === "bored" ? { ry: 0.9 } : { ry: 2.2 };
  const gradId = `bg-${palette[0].replace("#", "")}`;

  const mouth = (() => {
    switch (mood) {
      case "surprised":  return <ellipse cx="50" cy="74" rx="3" ry="4" fill="#3A2A2A"/>;
      case "annoyed":    return <path d="M44 76 Q50 73 56 76" stroke="#3A2A2A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>;
      case "confused":   return <path d="M44 75 Q47 78 50 75 Q53 72 56 75" stroke="#3A2A2A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>;
      case "frustrated": return <path d="M43 78 Q50 74 57 78" stroke="#3A2A2A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>;
      case "thoughtful": return <path d="M45 76 Q50 74 55 76" stroke="#3A2A2A" strokeWidth="1.4" fill="none" strokeLinecap="round"/>;
      case "sarcastic":  return <path d="M44 75 Q50 78 56 73" stroke="#3A2A2A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>;
      case "worried":    return <path d="M45 77 Q50 73 55 77" stroke="#3A2A2A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>;
      case "bored":      return <path d="M44 76 L56 76" stroke="#3A2A2A" strokeWidth="1.6" strokeLinecap="round"/>;
      case "curious":    return <ellipse cx="50" cy="75" rx="2.5" ry="1.5" fill="#3A2A2A"/>;
      default:           return <path d="M44 74 Q50 78 56 74" stroke="#3A2A2A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>;
    }
  })();

  const brows = (() => {
    switch (mood) {
      case "annoyed":
        return [
          <path key="l" d="M40 56 L48 58" stroke="#3A2A2A" strokeWidth="1.8" strokeLinecap="round"/>,
          <path key="r" d="M52 58 L60 56" stroke="#3A2A2A" strokeWidth="1.8" strokeLinecap="round"/>,
        ];
      case "surprised":
        return [
          <path key="l" d="M40 54 Q44 51 48 54" stroke="#3A2A2A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>,
          <path key="r" d="M52 54 Q56 51 60 54" stroke="#3A2A2A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>,
        ];
      case "worried":
        return [
          <path key="l" d="M40 55 Q44 53 48 56" stroke="#3A2A2A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>,
          <path key="r" d="M52 56 Q56 53 60 55" stroke="#3A2A2A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>,
        ];
      default:
        return [
          <path key="l" d="M40 55 Q44 53 48 55" stroke="#3A2A2A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>,
          <path key="r" d="M52 55 Q56 53 60 55" stroke="#3A2A2A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>,
        ];
    }
  })();

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: "100%", height: "100%", display: "block", ...style }}
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="40%" r="80%">
          <stop offset="0%" stopColor={palette[0]} />
          <stop offset="60%" stopColor={palette[1]} />
          <stop offset="100%" stopColor={palette[2]} />
        </radialGradient>
        <radialGradient id="skin">
          <stop offset="0%" stopColor="#FFE2D5" />
          <stop offset="100%" stopColor="#F8C4A8" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gradId})`} />
      <path d="M22 50 Q22 26 50 24 Q78 26 78 50 L78 84 L22 84 Z" fill={hair} />
      <ellipse cx="50" cy="58" rx="18" ry="22" fill="url(#skin)" />
      <path d="M30 44 Q40 36 50 40 Q60 36 70 44 Q66 38 50 36 Q34 38 30 44 Z" fill={hair} />
      <ellipse cx="44" cy="62" rx="1.6" ry={eyes.ry} fill="#1B1419" />
      <ellipse cx="56" cy="62" rx="1.6" ry={eyes.ry} fill="#1B1419" />
      {brows}
      <circle cx="40" cy="68" r="3" fill={palette[2]} opacity="0.18" />
      <circle cx="60" cy="68" r="3" fill={palette[2]} opacity="0.18" />
      {mouth}
      <path d="M42 78 Q50 84 58 78 L62 92 L38 92 Z" fill="url(#skin)" />
    </svg>
  );
}
