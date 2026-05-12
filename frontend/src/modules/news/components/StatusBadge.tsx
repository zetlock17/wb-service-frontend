import { Clock } from "lucide-react";
import type { NewsStatus } from "../../../api/newsApi";
import { getStatusLabel } from "../utils";

interface StatusBadgeProps {
  status?: NewsStatus;
  withIcon?: boolean;
  className?: string;
}

const StatusBadge = ({ status, withIcon = false, className = '' }: StatusBadgeProps) => {
  const { label, className: colorClass } = getStatusLabel(status);
  const showIcon = withIcon && status === 'SCHEDULED';

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium text-xs ${colorClass} ${className}`}>
      {showIcon && <Clock className="w-3 h-3" />}
      {label}
    </span>
  );
};

export default StatusBadge;
