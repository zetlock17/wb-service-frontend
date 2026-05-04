const TAILWIND_COLORS: Record<string, string> = {
  "purple-300": "#d8b4fe",
  "purple-400": "#c084fc",
  "purple-500": "#a855f7",
  "purple-600": "#9333ea",
};

interface VerticalDashedProps {
  width?: number;
  lineWidth?: number;
  dashLen?: number;
  gap?: number;
  className?: string;
}

const VerticalDashed = ({
  width = 12,
  lineWidth = 4,
  dashLen = 12,
  gap = 4,
  className = "",
}: VerticalDashedProps) => {
  const total = dashLen + gap;
  const rectX = (width - lineWidth) / 2;

  const colorMatch = className.match(/text-(\w+-?\d+)/);
  const colorClass = colorMatch ? colorMatch[1] : "purple-300";
  const color = TAILWIND_COLORS[colorClass];

  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${total}' viewBox='0 0 ${width} ${total}'>
      <rect x='${rectX}' y='0' width='${lineWidth}' height='${dashLen}' rx='${lineWidth / 2}' fill='${color}' />
    </svg>
  `;
  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        minHeight: "100%",
        backgroundImage: `url("${uri}")`,
        backgroundRepeat: "repeat-y",
        backgroundPosition: "center top",
        backgroundSize: `${width}px ${total}px`,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    />
  );
};

export default VerticalDashed;
