import Avatar from "../../../components/common/Avatar";
import type { OrgUnitManager } from "../../../api/orgStructureApi";

interface EmployeeCardProps {
  manager: OrgUnitManager;
  level: number;
  onOpenProfile?: (eid: string) => void;
}

const EmployeeCard = ({ manager, level, onOpenProfile }: EmployeeCardProps) => (
  <div className="mt-2 flex gap-0">
    <div className="flex flex-col items-center">
      {level > 0 && (
        <div className="p-1 font-black text-purple-300">—</div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-2.5">
        <div className="flex flex-row items-center gap-2">
          <Avatar fullName={manager.full_name} size={6} />
          <button
            type="button"
            onClick={() => onOpenProfile?.(manager.eid)}
            className="truncate text-base font-medium text-purple-600 hover:underline"
          >
            {manager.full_name}
          </button>
        </div>
        <p className="truncate pl-8 text-sm text-gray-600">{manager.position}</p>
      </div>
    </div>
  </div>
);

export default EmployeeCard;
