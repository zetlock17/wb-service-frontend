interface VacationInfoProps {
  label: string;
  value: string;
}

const VacationInfo = ({ label, value }: VacationInfoProps) => (
  <div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default VacationInfo;
