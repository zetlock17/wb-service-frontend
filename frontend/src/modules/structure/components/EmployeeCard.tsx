import { Crown } from "lucide-react";
import Avatar from "../../../components/common/Avatar";
import type { OrgUnitManager } from "../../../api/orgStructureApi";

interface EmployeeCardProps {
  manager: OrgUnitManager;
  level: number;
  onOpenProfile?: (eid: string) => void;
}

const EmployeeCard = ({ manager, onOpenProfile }: EmployeeCardProps) => (
  <button
    type="button"
    onClick={() => onOpenProfile?.(manager.eid)}
    className="group mt-3 flex w-full items-center gap-3 rounded-2xl bg-wb-green-light px-4 py-3 text-left ring-1 ring-inset ring-wb-green/20 transition hover:ring-wb-green/50"
  >
    <div className="relative shrink-0">
      <Avatar fullName={manager.full_name} size={11} />
      <span className="absolute -right-1 -bottom-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-wb-green text-white ring-2 ring-white">
        <Crown className="h-3 w-3" />
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-wb-green px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white">
          Руководитель
        </span>
      </div>
      <p className="mt-1 truncate text-[15px] font-extrabold text-wb-green group-hover:underline">
        {manager.full_name}
      </p>
      {manager.position && (
        <p className="truncate text-[13px] font-semibold text-gray-600">{manager.position}</p>
      )}
    </div>
  </button>
);

export default EmployeeCard;
