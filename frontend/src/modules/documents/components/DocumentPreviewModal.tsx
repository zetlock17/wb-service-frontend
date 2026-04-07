import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy, type RenderTask } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { getDocumentDownloadUrl, type Document } from "../../../api/documentsApi";
import Modal from "../../../components/common/Modal";

type PreviewType = "pdf" | "image";
type PdfMode = "pdfjs" | "native";

const imageMimeTypes = new Set(["image/jpeg", "image/png"]);

const extractDownloadUrl = (value: unknown): string | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const data = value as Record<string, unknown>;
  const candidates = ["url", "download_url", "downloadUrl", "link", "signed_url"];

  for (const key of candidates) {
    const candidate = data[key];
    if (typeof candidate === "string" && candidate) {
      return candidate;
    }
  }

  return null;
};

const getPreviewType = (doc: Document): PreviewType => {
  const mimeType = doc.mime_type.toLowerCase();
  const normalizedFilename = doc.original_filename.toLowerCase();

  if (
    imageMimeTypes.has(mimeType) ||
    normalizedFilename.endsWith(".jpg") ||
    normalizedFilename.endsWith(".jpeg") ||
    normalizedFilename.endsWith(".png")
  ) {
    return "image";
  }

  return "pdf";
};

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface DocumentPreviewModalProps {
  document: Document | null;
  onClose: () => void;
}

const DocumentPreviewModal = ({ document, onClose }: DocumentPreviewModalProps) => {
  const previewType = useMemo(() => (document ? getPreviewType(document) : null), [document]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [pdfMode, setPdfMode] = useState<PdfMode>("pdfjs");
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfScale, setPdfScale] = useState(1);
  const [isPdfRendering, setIsPdfRendering] = useState(false);

  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfRenderTaskRef = useRef<RenderTask | null>(null);

  useEffect(() => {
    setPreviewUrl(null);
    setPreviewError(null);
    setIsUrlLoading(false);
    setPdfMode("pdfjs");
    setPdfPage(1);
    setPdfScale(1);
    setPdfDocument((prev) => {
      if (prev) {
        void prev.destroy();
      }
      return null;
    });

    if (!document) {
      return;
    }

    let isCanceled = false;
    setIsUrlLoading(true);

    const loadUrl = async () => {
      const response = await getDocumentDownloadUrl(document.id);

      if (isCanceled) {
        return;
      }

      setIsUrlLoading(false);

      if (response.status < 200 || response.status >= 300) {
        setPreviewError(response.message || "Не удалось получить ссылку на документ");
        return;
      }

      const url = extractDownloadUrl(response.data);
      if (!url) {
        setPreviewError("Ссылка на документ не найдена");
        return;
      }

      setPreviewUrl(url);
    };

    void loadUrl();

    return () => {
      isCanceled = true;
    };
  }, [document, previewType]);

  useEffect(() => {
    if (!document || previewType !== "pdf" || !previewUrl || pdfMode !== "pdfjs") {
      return;
    }

    let isCanceled = false;
    const loadingTask = getDocument(previewUrl);

    loadingTask.promise
      .then((loadedPdf) => {
        if (isCanceled) {
          void loadedPdf.destroy();
          return;
        }

        setPdfDocument((prev) => {
          if (prev) {
            void prev.destroy();
          }
          return loadedPdf;
        });
        setPdfPage(1);
      })
      .catch(() => {
        if (!isCanceled) {
          setPreviewError(null);
          setPdfMode("native");
        }
      });

    return () => {
      isCanceled = true;
      loadingTask.destroy();
    };
  }, [document, pdfMode, previewType, previewUrl]);

  useEffect(() => {
    if (previewType !== "pdf" || pdfMode !== "pdfjs" || !pdfDocument || !pdfCanvasRef.current) {
      return;
    }

    let isCanceled = false;

    const render = async () => {
      setIsPdfRendering(true);

      try {
        const page = await pdfDocument.getPage(pdfPage);
        if (isCanceled) {
          return;
        }

        const viewport = page.getViewport({ scale: pdfScale });
        const canvas = pdfCanvasRef.current;
        if (!canvas) {
          return;
        }

        const context = canvas.getContext("2d");
        if (!context) {
          setPreviewError("Не удалось подготовить область просмотра PDF");
          return;
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (pdfRenderTaskRef.current) {
          pdfRenderTaskRef.current.cancel();
          pdfRenderTaskRef.current = null;
        }

        const renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
        });

        pdfRenderTaskRef.current = renderTask;
        await renderTask.promise;

        if (!isCanceled) {
          setPreviewError(null);
        }
      } catch (error) {
        if (isCanceled || (error instanceof Error && error.name === "RenderingCancelledException")) {
          return;
        }

        setPreviewError(null);
        setPdfMode("native");
      } finally {
        if (!isCanceled) {
          setIsPdfRendering(false);
        }
      }
    };

    void render();

    return () => {
      isCanceled = true;
      if (pdfRenderTaskRef.current) {
        pdfRenderTaskRef.current.cancel();
        pdfRenderTaskRef.current = null;
      }
    };
  }, [pdfDocument, pdfMode, pdfPage, pdfScale, previewType]);

  return (
    <Modal
      isOpen={Boolean(document)}
      title={document ? `Предпросмотр: ${document.title}` : "Предпросмотр"}
      onClose={onClose}
      widthClass="max-w-6xl"
    >
      <div className="space-y-4">
        {document && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span className="rounded-full bg-gray-100 px-2 py-1">{document.original_filename}</span>
          </div>
        )}

        {previewError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {previewError}
          </div>
        )}

        {document && previewType === "pdf" && pdfMode === "pdfjs" && (
          <>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-purple-100 bg-purple-50 p-3">
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setPdfPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!pdfDocument || pdfPage <= 1}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Назад
                </button>
                
                <span className="rounded-lg bg-white px-3 py-1.5 text-center text-sm text-gray-700">
                  Страница {pdfPage} из {pdfDocument?.numPages || 0}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (!pdfDocument) {
                      return;
                    }

                    setPdfPage((prev) => Math.min(prev + 1, pdfDocument.numPages));
                  }}
                  disabled={!pdfDocument || pdfPage >= (pdfDocument?.numPages || 1)}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Вперед
                  <ChevronRight className="h-4 w-4" />
                </button>

              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPdfScale((prev) => Math.max(0.5, Number((prev - 0.1).toFixed(2))))}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="min-w-16 text-center text-sm font-medium text-gray-700">{Math.round(pdfScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setPdfScale((prev) => Math.min(3, Number((prev + 0.1).toFixed(2))))}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
              {!pdfDocument && !previewError && (
                <p className="py-8 text-center text-sm text-gray-500">Загрузка...</p>
              )}
              {!previewError && <canvas ref={pdfCanvasRef} className="mx-auto max-w-full rounded-lg bg-white shadow-sm" />}
              {isPdfRendering && <p className="pt-3 text-center text-xs text-gray-500">Обновление страницы...</p>}
            </div>
          </>
        )}

        {document && previewType === "pdf" && pdfMode === "native" && (
          <div className="space-y-3">
            {previewUrl ? (
              <iframe
                src={previewUrl}
                title="PDF preview"
                className="h-[65vh] w-full rounded-lg border border-gray-200 bg-white"
                onError={() => setPreviewError("Не удалось открыть PDF в нативном просмотре")}
              />
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">Загрузка...</p>
            )}
            {previewUrl && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Открыть оригинал
                </button>
              </div>
            )}
          </div>
        )}

        {document && previewType === "image" && (
          <div className="max-h-[75vh] overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={document.title}
                loading="lazy"
                onError={() => setPreviewError("Не удалось открыть изображение")}
                className="mx-auto h-auto max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
              />
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">Загрузка...</p>
            )}
          </div>
        )}

        {isUrlLoading && !previewUrl && !previewError && (
          <p className="py-8 text-center text-sm text-gray-500">Загрузка...</p>
        )}
      </div>
    </Modal>
  );
};

export default DocumentPreviewModal;
