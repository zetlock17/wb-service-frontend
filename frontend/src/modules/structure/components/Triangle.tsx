interface TriangleProps {
  isExpanded: boolean;
  className?: string;
}

const Triangle = ({ isExpanded, className = "" }: TriangleProps) => (
  <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
    <path d={isExpanded ? "M2 2 L6 8 L10 2 Z" : "M4 2 L10 6 L4 10 Z"} />
  </svg>
);

export default Triangle;
