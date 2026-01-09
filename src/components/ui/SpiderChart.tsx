interface CompetencyData {
  name: string;
  score: number;
  fullMark: number;
}

interface SpiderChartProps {
  data: CompetencyData[];
  size?: number;
}

export const SpiderChart = ({ data, size = 300 }: SpiderChartProps) => {
  if (data.length === 0) return null;

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) * 0.7; // 70% of half size for padding
  const levels = 5; // 0-5 score levels
  const angleSlice = (Math.PI * 2) / data.length;

  // Calculate point position
  const getPoint = (value: number, index: number) => {
    const angle = angleSlice * index - Math.PI / 2; // Start from top
    const r = (value / 5) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  // Generate grid circles
  const gridCircles = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * radius;
    return (
      <circle
        key={i}
        cx={centerX}
        cy={centerY}
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={1}
      />
    );
  });

  // Generate axis lines
  const axisLines = data.map((_, index) => {
    const angle = angleSlice * index - Math.PI / 2;
    const x2 = centerX + radius * Math.cos(angle);
    const y2 = centerY + radius * Math.sin(angle);
    return (
      <line
        key={index}
        x1={centerX}
        y1={centerY}
        x2={x2}
        y2={y2}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
    );
  });

  // Generate data polygon points
  const polygonPoints = data
    .map((item, index) => {
      const point = getPoint(item.score, index);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  // Generate labels
  const labels = data.map((item, index) => {
    const angle = angleSlice * index - Math.PI / 2;
    const labelRadius = radius + 25;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);

    // Adjust text anchor based on position
    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    if (Math.cos(angle) > 0.1) textAnchor = 'start';
    else if (Math.cos(angle) < -0.1) textAnchor = 'end';

    // Adjust vertical alignment
    let dy = '0.35em';
    if (Math.sin(angle) < -0.5) dy = '0em';
    else if (Math.sin(angle) > 0.5) dy = '0.7em';

    return (
      <text
        key={index}
        x={x}
        y={y}
        textAnchor={textAnchor}
        dy={dy}
        fontSize={11}
        fill="#374151"
        fontWeight={500}
        fontFamily="Prompt, sans-serif"
      >
        {item.name}
      </text>
    );
  });

  // Generate score dots
  const scoreDots = data.map((item, index) => {
    const point = getPoint(item.score, index);
    return (
      <circle
        key={index}
        cx={point.x}
        cy={point.y}
        r={4}
        fill="#f59e0b"
        stroke="#fff"
        strokeWidth={2}
      />
    );
  });

  // Level labels (0-5)
  const levelLabels = Array.from({ length: levels }, (_, i) => {
    const value = i + 1;
    const r = (value / levels) * radius;
    return (
      <text
        key={i}
        x={centerX + 5}
        y={centerY - r}
        fontSize={9}
        fill="#9ca3af"
        fontFamily="Prompt, sans-serif"
      >
        {value}
      </text>
    );
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* Grid circles */}
      {gridCircles}

      {/* Axis lines */}
      {axisLines}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="#f59e0b"
        fillOpacity={0.3}
        stroke="#f59e0b"
        strokeWidth={2}
      />

      {/* Score dots */}
      {scoreDots}

      {/* Labels */}
      {labels}

      {/* Level labels */}
      {levelLabels}
    </svg>
  );
};
