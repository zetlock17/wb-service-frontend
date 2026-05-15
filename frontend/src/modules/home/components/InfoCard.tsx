import type { ReactNode } from "react";

interface InfoCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

const InfoCard = ({ title, icon, children }: InfoCardProps) => (
  <div className="bg-white rounded-4xl shadow-sm border border-gray-100 p-6">
    <h3 className="text-base font-semibold flex items-center gap-2.5 mb-5">
      <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-wb-pink-light shrink-0">
        {icon}
      </span>
      {title}
    </h3>
    {children}
  </div>
);

export default InfoCard;
