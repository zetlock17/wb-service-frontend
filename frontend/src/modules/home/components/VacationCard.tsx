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
      icon={<Calendar className="w-5 h-5 text-purple-600" />}
      status={
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full ${
            status === "active" ? "bg-orange-100 text-orange-700" : "bg-purple-600 text-white"
          }`}
        >
          {status === "active" ? "В отпуске" : "Планируется"}{" "}
        </span>
      }
      action={
        canEditPersonalFields ? (
          <button
            onClick={() => startEditing("vacations", undefined, vacation)}
            className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1"
          >
            <ArrowRight strokeWidth={1.5} className="w-4 h-4" /> Отправить заявку
          </button>
        ) : null
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between px-5 py-4 bg-purple-50 rounded-lg">
          <VacationInfo label="Дата начала" value={formatDate(vacation.start_date)} />
          {vacation.substitute && <StructureLink label="Замещение" value={vacation.substitute} />}
        </div>

        <div className="flex items-center justify-between px-5 py-4 bg-purple-50 rounded-lg">
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
