import { Check, CheckCircle2, Lock } from "lucide-react";

interface AcknowledgeBlockProps {
  isAcknowledged: boolean;
  mustAcknowledge: boolean;
  acknowledging: boolean;
  onAcknowledge: () => void;
}

const AcknowledgeBlock = ({
  isAcknowledged,
  mustAcknowledge,
  acknowledging,
  onAcknowledge,
}: AcknowledgeBlockProps) => (
  <div
    className={`rounded-lg border p-4 ${
      isAcknowledged ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
    }`}
  >
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-start gap-3">
        {isAcknowledged ? (
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        ) : (
          <Lock className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        )}
        <div>
          <p className={`font-semibold text-sm ${isAcknowledged ? "text-green-800" : "text-orange-800"}`}>
            {isAcknowledged
              ? "Вы подтвердили прочтение этой новости"
              : mustAcknowledge
              ? "Необходимо подтвердить прочтение"
              : "Обязательная новость"}
          </p>
          {!isAcknowledged && mustAcknowledge && (
            <p className="text-xs text-orange-700 mt-1">
              Эта новость требует вашего подтверждения прочтения
            </p>
          )}
        </div>
      </div>
      {mustAcknowledge && !isAcknowledged && (
        <button
          onClick={onAcknowledge}
          disabled={acknowledging}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium shrink-0"
        >
          <Check className="w-4 h-4" />
          {acknowledging ? "Подтверждение..." : "Подтвердить прочтение"}
        </button>
      )}
    </div>
  </div>
);

export default AcknowledgeBlock;
