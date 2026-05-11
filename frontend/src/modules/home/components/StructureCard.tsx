import { ChevronRight, Users } from "lucide-react";
import Avatar from "../../../components/common/Avatar";
import type { ModuleId, UserProfile } from "../../../types/portal";
import { getCasualName } from "../../../utils/nameUtils";
import InfoCard from "./InfoCard";

interface StructurePerson {
  id: string;
  full_name: string;
  position: string;
  department: string | undefined;
}

interface StructureCardProps {
  user: UserProfile;
  onNavigate: (moduleId: ModuleId) => void;
  onOpenProfileByName: (name: string) => void;
}

const buildStructurePeople = (user: UserProfile): StructurePerson[] => {
  const candidates: Array<{ id: string; full_name: string | null; position: string; department: string | undefined }> = [
    { id: "manager", full_name: user.manager_name, position: "Руководитель", department: user.org_unit },
    { id: "hrbp", full_name: user.hr_name, position: "HR-бизнес-партнер", department: "HR" },
  ];
  return candidates.filter((person): person is StructurePerson => Boolean(person.full_name));
};

const StructureCard = ({ user, onNavigate, onOpenProfileByName }: StructureCardProps) => {
  const structurePeople = buildStructurePeople(user);

  return (
    <InfoCard title="Структура" icon={<Users className="w-5 h-5 text-purple-600" />}>
      <div className="space-y-3">
        {structurePeople.map((employee) => (
          <button
            key={employee.id}
            type="button"
            onClick={() => onOpenProfileByName(employee.full_name)}
            className="p-2 w-full text-left hover:bg-purple-50 rounded-lg transition-colors"
          >
            <div className="flex justify-between items-center gap-3">
              <Avatar fullName={employee.full_name} size={16} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">{employee.position}</p>
                <h3 className="font-semibold text-purple-600 hover:underline">
                  {getCasualName(employee.full_name)}
                </h3>
                <p className="text-sm text-gray-500">Департамент</p>
                <p className="text-sm text-black">{employee.department || "Не указан"}</p>
              </div>
            </div>
          </button>
        ))}

        <button
          onClick={() => onNavigate("structure")}
          className="mt-4 text-sm text-purple-600 hover:underline flex items-center gap-1"
        >
          Вся структура / Коллеги по отделу <ChevronRight strokeWidth={2} className="w-4 h-4" />
        </button>
      </div>
    </InfoCard>
  );
};

export default StructureCard;
