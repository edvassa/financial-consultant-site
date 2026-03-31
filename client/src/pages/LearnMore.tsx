import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function LearnMore() {
  const [, setLocation] = useLocation();

  // Load content from database
  const { data: dbContent } = trpc.content.get.useQuery(
    { pageKey: "home" },
    { retry: 1 }
  );

  const fileUrl = dbContent?.learn_more?.file_url;

  if (!fileUrl) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Файл не загружен</p>
          <Button onClick={() => setLocation("/")} variant="outline">
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Floating back button */}
      <Button
        variant="ghost"
        onClick={() => setLocation("/")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-white/80 hover:bg-white/100 backdrop-blur-sm"
      >
        <ChevronLeft className="h-5 w-5" />
        Назад
      </Button>

      {/* PDF Viewer fullscreen */}
      <embed
        src={fileUrl}
        type="application/pdf"
        width="100%"
        height="100%"
        style={{
          display: "block",
          border: "none",
        }}
      />
    </div>
  );
}
