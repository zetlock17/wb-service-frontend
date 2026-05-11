interface StructureLinkProps {
  label: string;
  value: string;
}

const StructureLink = ({ label, value }: StructureLinkProps) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <button className="font-medium text-purple-600 hover:underline">{value}</button>
  </div>
);

export default StructureLink;
