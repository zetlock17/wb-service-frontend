import { Edit2, Lock } from "lucide-react";

interface ProfileRowProps {
  label: string;
  value: string;
  secure?: boolean;
  helper?: string;
  isSmall?: boolean;
  link?: string;
  editable?: boolean;
  onEdit?: () => void;
}

const ProfileRow = ({
  label,
  value,
  secure,
  helper,
  isSmall,
  link,
  editable,
  onEdit,
}: ProfileRowProps) => {
  const Tag: React.ElementType = link ? "a" : "p";
  const isExternal = link && !link.startsWith("mailto:");
  return (
    <div className="space-y-0.5">
      <p className="text-sm text-gray-500">{label}</p>
      <Tag
        className={`font-medium flex items-center gap-2 ${isSmall ? "text-sm" : ""} ${link ? "text-wb-green hover:underline" : ""}`}
        href={link}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        {value}
        {editable ? (
          <button onClick={onEdit} className="p-1 hover:bg-gray-100 rounded">
            <Edit2 className="w-3 h-3 text-gray-500" />
          </button>
        ) : (
          secure && <Lock className="w-3 h-3 text-gray-400" />
        )}
      </Tag>
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  );
};

export default ProfileRow;
