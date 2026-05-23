import { useNavigate } from "react-router-dom";
import { openProfileByName } from "../utils/profileNavigation";

interface StructureLinkProps {
  label: string;
  value: string;
}

const StructureLink = ({ label, value }: StructureLinkProps) => {
  const navigate = useNavigate();
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <button
        type="button"
        onClick={() => openProfileByName(navigate, value)}
        className="font-medium text-wb-green hover:underline"
      >
        {value}
      </button>
    </div>
  );
};

export default StructureLink;
