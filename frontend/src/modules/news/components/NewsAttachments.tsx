import { Download, FileText } from "lucide-react";

interface NewsAttachmentsProps {
  fileIds: number[];
  downloadingFileId: number | null;
  onDownload: (fileId: number) => void;
}

const NewsAttachments = ({ fileIds, downloadingFileId, onDownload }: NewsAttachmentsProps) => {
  if (fileIds.length === 0) return null;

  return (
    <div className="mt-7 rounded-2xl bg-wb-pink-light p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-gray-900">
        <FileText className="h-5 w-5 text-wb-pink-dark" />
        Прикреплённые файлы ({fileIds.length})
      </div>
      <ul className="flex flex-col gap-2">
        {fileIds.map((fileId) => (
          <li key={fileId}>
            <button
              type="button"
              onClick={() => onDownload(fileId)}
              disabled={downloadingFileId === fileId}
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-inset ring-gray-100 transition hover:ring-wb-green disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="inline-flex min-w-0 flex-1 items-center gap-2">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-wb-pink-light text-wb-pink-dark">
                  <FileText className="h-5 w-5" />
                </span>
                <span className="truncate text-left text-[14.5px] font-bold text-gray-700">
                  Файл #{fileId}
                </span>
              </span>
              <Download
                className={`h-[18px] w-[18px] shrink-0 transition ${
                  downloadingFileId === fileId ? "animate-bounce text-gray-400" : "text-wb-green"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsAttachments;
