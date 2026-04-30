import Link from "next/link";

const features = [
  {
    href: "/color-me",
    emoji: "🎨",
    title: "Color Me",
    subtitle: "퍼스널 컬러 분석",
    description: "내 피부톤에 딱 맞는\n컬러 팔레트를 찾아줄게요",
    gradient: "from-orange-400 via-pink-400 to-rose-400",
    shadow: "shadow-orange-500/30",
    bg: "from-orange-900/60 to-rose-900/60",
    badge: "ChatGPT AI",
    badgeColor: "bg-orange-400/20 text-orange-200 border-orange-400/30",
  },
  {
    href: "/star-me",
    emoji: "⭐",
    title: "Star Me",
    subtitle: "연예인과 인생사진",
    description: "AI가 연예인과 함께하는\n나만의 인생사진을 만들어줘요",
    gradient: "from-violet-500 via-purple-500 to-indigo-500",
    shadow: "shadow-purple-500/30",
    bg: "from-violet-900/60 to-indigo-900/60",
    badge: "Gemini AI",
    badgeColor: "bg-purple-400/20 text-purple-200 border-purple-400/30",
  },
  {
    href: "/toon-me",
    emoji: "✨",
    title: "Toon Me",
    subtitle: "픽사 캐릭터 변환",
    description: "내 얼굴로 만든\n9가지 감정 픽사 캐릭터!",
    gradient: "from-cyan-400 via-teal-400 to-emerald-400",
    shadow: "shadow-cyan-500/30",
    bg: "from-cyan-900/60 to-emerald-900/60",
    badge: "Gemini AI",
    badgeColor: "bg-cyan-400/20 text-cyan-200 border-cyan-400/30",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0015] relative overflow-hidden flex flex-col items-center justify-center px-4 py-12">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-sm font-medium mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          AI 체험 부스에 오신 것을 환영합니다
        </div>

        <h1 className="text-5xl sm:text-6xl font-black text-white mb-3 tracking-tight">
          Glow
          <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            {" "}AI{" "}
          </span>
          Studio
        </h1>
        <p className="text-white/60 text-lg font-medium">
          AI와 함께 나만의 스타일을 찾아봐요 ✨
        </p>
      </div>

      {/* Feature Cards */}
      <div className="relative w-full max-w-sm flex flex-col gap-4">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} className="group block">
            <div
              className={`relative rounded-3xl overflow-hidden shadow-2xl ${feature.shadow} border border-white/10 transition-all duration-300 group-hover:scale-[1.02] group-active:scale-[0.98]`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bg} backdrop-blur-sm`} />
              <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${feature.gradient}`} />

              <div className="relative p-6 flex items-center gap-5">
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                  {feature.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-black text-white">{feature.title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${feature.badgeColor}`}>
                      {feature.badge}
                    </span>
                  </div>
                  <p className="text-white/80 font-semibold text-sm mb-1">{feature.subtitle}</p>
                  <p className="text-white/50 text-xs leading-relaxed whitespace-pre-line">{feature.description}</p>
                </div>

                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:translate-x-0.5 transition-transform`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="relative text-white/30 text-xs text-center mt-10">
        촬영된 이미지는 서버에 저장되지 않습니다 🔒
      </p>
    </main>
  );
}
