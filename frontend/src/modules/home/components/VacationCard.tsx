import { ArrowRight, Calendar } from "lucide-react";
import type { ProfileVacation } from "../../../types/portal";
import { formatDate, getVacationStatus } from "../utils/dateUtils";
import Card from "./Card";
import StructureLink from "./StructureLink";
import VacationInfo from "./VacationInfo";

interface VacationCardProps {
  vacation: ProfileVacation;
  canEditPersonalFields: boolean;
  startEditing: (section: string, field?: string, currentValue?: unknown) => void;
}

const VacationCard = ({ vacation, canEditPersonalFields, startEditing }: VacationCardProps) => {
  const status = getVacationStatus(vacation);

  return (
    <Card
      title="Отпуск"
      icon={<Calendar className="w-4 h-4 text-wb-green" />}
      status={
        <span
          className={`ml-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${
            status === "active"
              ? "bg-wb-green-light text-wb-green-dark"
              : "bg-wb-pink-light text-wb-pink"
          }`}
        >
          {status === "active" ? "В отпуске" : "Планируется"}
        </span>
      }
      action={
        canEditPersonalFields ? (
          <button
            onClick={() => startEditing("vacations", undefined, vacation)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-wb-green text-white text-sm rounded-full hover:bg-wb-green-dark transition-colors"
          >
            <ArrowRight strokeWidth={1.5} className="w-4 h-4" /> Отправить заявку
          </button>
        ) : null
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between px-5 py-4 bg-wb-pink-light rounded-xl">
          <VacationInfo label="Дата начала" value={formatDate(vacation.start_date)} />
          {vacation.substitute && <StructureLink label="Замещение" value={vacation.substitute} />}
        </div>
        <div className="flex items-center justify-between px-5 py-4 bg-wb-pink-light rounded-xl">
          <VacationInfo label="Дата окончания" value={formatDate(vacation.end_date)} />
          {vacation.comment && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Комментарий</p>
              <p className="text-gray-700">{vacation.comment}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VacationCard;
