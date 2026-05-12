import { Download, FileText } from "lucide-react";

interface NewsAttachmentsProps {
  fileIds: number[];
  downloadingFileId: number | null;
  onDownload: (fileId: number) => void;
}

const NewsAttachments = ({ fileIds, downloadingFileId, onDownload }: NewsAttachmentsProps) => {
  if (fileIds.length === 0) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Прикреплённые файлы ({fileIds.length})
      </h4>
      <div className="space-y-2">
        {fileIds.map((fileId) => (
          <button
            key={fileId}
            onClick={() => onDownload(fileId)}
            disabled={downloadingFileId === fileId}
            className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="w-5 h-5 text-purple-600 shrink-0" />
              <span className="text-sm text-gray-700 text-left truncate">Файл #{fileId}</span>
            </div>
            <Download
              className={`w-4 h-4 ml-2 shrink-0 ${
                downloadingFileId === fileId ? "animate-bounce text-gray-400" : "text-purple-600"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default NewsAttachments;
