import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";


// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function LearnMore() {
  const [, setLocation] = useLocation();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);

  // Load content from database
  const { data: dbContent } = trpc.content.get.useQuery(
    { pageKey: "home" },
    { retry: 1 }
  );

  const fileUrl = dbContent?.learn_more?.file_url;
  const fileName = dbContent?.learn_more?.file_name;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (numPages ? Math.min(prev + 1, numPages) : prev));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.75));
  };

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
          <div className="flex justify-between items-center mb-4">
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
            <div className="flex gap-2">
              {fileUrl && (
                <a
                  href={fileUrl}
                  download={fileName}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Скачать
                </a>
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleZoomOut}
                disabled={scale <= 0.75}
              >
                Уменьшить
              </Button>
              <span className="px-4 py-2 text-slate-600">{Math.round(scale * 100)}%</span>
              <Button
                variant="outline"
                onClick={handleZoomIn}
                disabled={scale >= 2}
              >
                Увеличить
              </Button>
            </div>

            {numPages && (
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Предыдущая
                </Button>
                <span className="px-4 py-2 text-slate-600">
                  Страница {currentPage} из {numPages}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === numPages}
                >
                  Следующая
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-slate-50 flex justify-center p-4">
        <div className="bg-white shadow-lg">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="p-8 text-center text-slate-600">
                Загрузка документа...
              </div>
            }
            error={
              <div className="p-8 text-center text-red-600">
                Ошибка при загрузке документа
              </div>
            }
          >
            <Page pageNumber={currentPage} scale={scale} />
          </Document>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600">
          <p>
            {fileName && <span>Файл: {fileName}</span>}
            {numPages && (
              <span className="ml-4">
                Всего страниц: {numPages}
              </span>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
