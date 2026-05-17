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
    className={`rounded-2xl border-2 p-5 ${
      isAcknowledged
        ? "border-wb-green/20 bg-wb-green-light"
        : "border-wb-pink-dark/20 bg-wb-pink-light"
    }`}
  >
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {isAcknowledged ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-wb-green" />
        ) : (
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-wb-pink-dark" />
        )}
        <div>
          <p className={`text-[14.5px] font-extrabold ${isAcknowledged ? "text-wb-green" : "text-wb-pink-dark"}`}>
            {isAcknowledged
              ? "Вы подтвердили прочтение этой новости"
              : mustAcknowledge
              ? "Необходимо подтвердить прочтение"
              : "Обязательная новость"}
          </p>
          {!isAcknowledged && mustAcknowledge && (
            <p className="mt-1 text-[13px] font-semibold text-wb-pink-dark/70">
              Эта новость требует вашего подтверждения прочтения
            </p>
          )}
        </div>
      </div>
      {mustAcknowledge && !isAcknowledged && (
        <button
          type="button"
          onClick={onAcknowledge}
          disabled={acknowledging}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-wb-green px-5 py-3 text-[14.5px] font-bold text-white transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
        >
          <Check className="h-4 w-4" />
          {acknowledging ? "Подтверждение..." : "Подтвердить прочтение"}
        </button>
      )}
    </div>
  </div>
);

export default AcknowledgeBlock;
