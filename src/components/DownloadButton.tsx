"use client";

interface DownloadButtonProps {
  imageUrl: string;
  filename?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function DownloadButton({
  imageUrl,
  filename = "glow-ai-result.png",
  className,
  children,
}: DownloadButtonProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className={
        className ??
        "flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
      }
    >
      {children ?? (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          저장하기
        </>
      )}
    </button>
  );
}
