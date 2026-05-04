type IconName =
  | "camera" | "sparkles" | "download" | "upload" | "printer" | "qr" | "x" | "back"
  | "arrow-right" | "refresh" | "check" | "shield" | "heart" | "star"
  | "smile" | "palette" | "lock";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
}

const PATHS: Record<IconName, string> = {
  camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  sparkles: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5zM5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75zM19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  printer: "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z",
  qr: "M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM19 15h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z",
  x: "M18 6L6 18M6 6l12 12",
  back: "M19 12H5M12 19l-7-7 7-7",
  "arrow-right": "M5 12h14M12 5l7 7-7 7",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  check: "M20 6L9 17l-5-5",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z",
  smile: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
  palette: "M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2v-.5c0-.5.4-1 1-1h2.5C19.4 18.5 21 16.9 21 15c0-5.5-4-9-9-9zM6.5 13a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM9.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM14.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 13a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
};

export default function Icon({ name, size = 24, stroke = 2, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
