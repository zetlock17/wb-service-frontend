import { Building2, Crown, Users, Network } from "lucide-react";

interface StructureStatsProps {
  units: number;
  withManagers: number;
  withoutManagers: number;
  maxDepth: number;
}

const StructureStats = ({ units, withManagers, withoutManagers, maxDepth }: StructureStatsProps) => (
  <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
    <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
      <div className="mb-2 inline-flex rounded-lg bg-purple-50 p-2 text-purple-700">
        <Building2 className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{units}</p>
      <p className="text-sm font-medium text-gray-700">Подразделений</p>
    </div>
    <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
      <div className="mb-2 inline-flex rounded-lg bg-purple-50 p-2 text-purple-700">
        <Crown className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{withManagers}</p>
      <p className="text-sm font-medium text-gray-700">С руководителем</p>
    </div>
    <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
      <div className="mb-2 inline-flex rounded-lg bg-purple-50 p-2 text-purple-700">
        <Users className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{withoutManagers}</p>
      <p className="text-sm font-medium text-gray-700">Без руководителя</p>
    </div>
    <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
      <div className="mb-2 inline-flex rounded-lg bg-purple-50 p-2 text-purple-700">
        <Network className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{maxDepth}</p>
      <p className="text-sm font-medium text-gray-700">Уровней иерархии</p>
    </div>
  </div>
);

export default StructureStats;
