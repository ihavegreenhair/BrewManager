import React from 'react';

interface RadarChartProps {
  scores: Record<string, number>;
  size?: number;
  maxValue?: number;
  color?: string;
  gridColor?: string;
  textColor?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({ 
  scores, 
  size = 200, 
  maxValue = 5,
  color = 'var(--accent-primary)',
  gridColor = 'rgba(255,255,255,0.1)',
  textColor = '#BBB'
}) => {
  const categories = Object.keys(scores);
  const center = size / 2;
  const radius = size * 0.32;

  const points = categories.map((cat, i) => {
    const angle = (i * 2 * Math.PI) / categories.length - Math.PI / 2;
    const value = Math.min(1, scores[cat] / maxValue);
    const x = center + radius * value * Math.cos(angle);
    const y = center + radius * value * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const gridPoints = [0.2, 0.4, 0.6, 0.8, 1.0].map(r => {
    return categories.map((_, i) => {
      const angle = (i * 2 * Math.PI) / categories.length - Math.PI / 2;
      const x = center + radius * r * Math.cos(angle);
      const y = center + radius * r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  });

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {/* Grid */}
      {gridPoints.map((gp, i) => (
        <polygon key={i} points={gp} fill="none" stroke={gridColor} strokeWidth="1" />
      ))}
      {/* Axis Lines */}
      {categories.map((_, i) => {
        const angle = (i * 2 * Math.PI) / categories.length - Math.PI / 2;
        const x2 = center + radius * Math.cos(angle);
        const y2 = center + radius * Math.sin(angle);
        return <line key={i} x1={center} y1={center} x2={x2} y2={y2} stroke={gridColor} strokeWidth="1" />;
      })}
      {/* Data Area */}
      <polygon 
        points={points} 
        fill={color.replace(')', ', 0.3)').replace('var(--accent-primary)', 'rgba(255, 179, 0')} 
        stroke={color} 
        strokeWidth="2" 
      />
      {/* Labels with improved positioning */}
      {categories.map((cat, i) => {
        const angle = (i * 2 * Math.PI) / categories.length - Math.PI / 2;
        const labelRadius = radius + 22;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        
        // Fine-tune text anchor based on angle
        let textAnchor = 'middle';
        if (Math.cos(angle) > 0.2) textAnchor = 'start';
        else if (Math.cos(angle) < -0.2) textAnchor = 'end';

        return (
          <text 
            key={cat} 
            x={x} 
            y={y} 
            fontSize="10" 
            fill={textColor} 
            textAnchor={textAnchor}
            dominantBaseline="middle" 
            style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {cat}
          </text>
        );
      })}
    </svg>
  );
};
