import type { ReactNode } from "react";

interface CardProps {
  title: string;
  icon: ReactNode;
  status?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

const Card = ({ title, status, icon, children, action }: CardProps) => (
  <div className="bg-white rounded-4xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-base font-semibold flex items-center gap-2.5">
        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-wb-pink-light shrink-0">
          {icon}
        </span>
        {title}
        {status}
      </h3>
      {action}
    </div>
    {children}
  </div>
);

export default Card;
