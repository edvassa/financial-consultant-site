import { useState } from "react";
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
  const fileName = dbContent?.learn_more?.file_name;

  if (!fileUrl) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              Назад
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Узнайте больше</h1>
            <div className="w-20"></div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">Файл не загружен</p>
            <Button onClick={() => setLocation("/")} variant="outline">
              Вернуться на главную
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              Назад
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">
              {dbContent?.learn_more?.title || "Узнайте больше"}
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* PDF Viewer using HTML5 embed */}
      <div className="flex-1 bg-slate-50 overflow-hidden">
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600 text-sm">
          <p>
            {fileName && <span>Файл: {fileName}</span>}
          </p>
        </div>
      </footer>
    </div>
  );
}
