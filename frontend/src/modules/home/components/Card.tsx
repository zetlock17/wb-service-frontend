import type { ReactNode } from "react";

interface CardProps {
  title: string;
  icon: ReactNode;
  status?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

const Card = ({ title, status, icon, children, action }: CardProps) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 pb-12">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        {icon}
        {title}
        {status}
      </h3>
      {action}
    </div>
    {children}
  </div>
);

export default Card;
