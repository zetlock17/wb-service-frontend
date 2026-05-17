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
    <InfoCard title="Структура" icon={<Users className="w-4 h-4 text-wb-green" />}>
      <div className="space-y-2">
        {structurePeople.map((employee) => (
          <button
            key={employee.id}
            type="button"
            onClick={() => onOpenProfileByName(employee.full_name)}
            className="p-3 w-full text-left bg-wb-pink-light hover:bg-pink-100 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar fullName={employee.full_name} size={16} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{employee.position}</p>
                <h3 className="font-semibold text-wb-green hover:underline text-sm">
                  {getCasualName(employee.full_name)}
                </h3>
                <p className="text-xs text-gray-400">{employee.department || "Не указан"}</p>
              </div>
            </div>
          </button>
        ))}

        <button
          onClick={() => onNavigate("structure")}
          className="mt-2 text-sm bg-wb-green hover:bg-wb-green-dark text-white flex items-center gap-1 transition-colors px-3 py-2 rounded-xl"
        >
          Вся структура / Коллеги по отделу <ChevronRight strokeWidth={2} className="w-4 h-4" />
        </button>
      </div>
    </InfoCard>
  );
};

export default StructureCard;
