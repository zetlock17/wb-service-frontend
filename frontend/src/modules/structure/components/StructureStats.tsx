import { Building2, Crown, Users, Network } from "lucide-react";

interface StructureStatsProps {
  units: number;
  withManagers: number;
  withoutManagers: number;
  maxDepth: number;
}

const STATS = [
  { key: "units", icon: Building2, label: "Подразделений", tone: "bg-wb-pink-dark text-white" },
  { key: "withManagers", icon: Crown, label: "С руководителем", tone: "bg-wb-green-light text-wb-green" },
  { key: "withoutManagers", icon: Users, label: "Без руководителя", tone: "bg-wb-pink-light text-wb-pink-dark" },
  { key: "maxDepth", icon: Network, label: "Уровней иерархии", tone: "bg-gray-900 text-white" },
] as const;

const StructureStats = ({ units, withManagers, withoutManagers, maxDepth }: StructureStatsProps) => {
  const values: Record<string, number> = { units, withManagers, withoutManagers, maxDepth };
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((s) => {
        const Icon = s.icon;
        return (
          <article key={s.key} className="rounded-[28px] bg-white p-6">
            <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${s.tone}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-[40px] font-black leading-none tracking-tight text-gray-900">
              {values[s.key]}
            </div>
            <div className="mt-2 text-[15px] font-extrabold text-gray-700">{s.label}</div>
          </article>
        );
      })}
    </div>
  );
};

export default StructureStats;
