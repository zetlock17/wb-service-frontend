import { useMemo } from "react";
import type { OrgUnitHierarchy } from "../../../api/orgStructureApi";

const useStructureStats = (hierarchy: OrgUnitHierarchy[]) => {
  return useMemo(() => {
    let units = 0;
    let withManagers = 0;
    let maxDepth = 0;

    const walk = (nodes: OrgUnitHierarchy[], depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      for (const node of nodes) {
        units += 1;
        if (node.manager) withManagers += 1;
        if (node.children.length > 0) walk(node.children, depth + 1);
      }
    };

    walk(hierarchy, 1);

    return {
      units,
      withManagers,
      withoutManagers: Math.max(units - withManagers, 0),
      maxDepth,
    };
  }, [hierarchy]);
};

export default useStructureStats;
