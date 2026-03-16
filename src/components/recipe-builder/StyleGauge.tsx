interface StyleGaugeProps {
  label: string;
  value: number;
  min: number;
  max: number;
}

export const StyleGauge = ({ label, value, min, max }: StyleGaugeProps) => {
  const inRange = value >= min && value <= max;
  
  // Calculate position (0-100%)
  // If we're below min, we'll be < 0. If above max, > 100.
  const percent = ((value - min) / (max - min)) * 100;
  const clampedPercent = Math.min(Math.max(percent, -5), 105);

  // Dynamic colors
  const color = inRange 
    ? 'var(--status-success)' 
    : (value < min || value > max ? 'var(--status-warning)' : 'var(--status-danger)');
  
  // For extreme outliers, use danger
  const finalColor = (percent < -20 || percent > 120) ? 'var(--status-danger)' : color;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ color: finalColor, fontSize: '0.9rem' }}>
          {value.toFixed(label === 'OG' || label === 'FG' ? 3 : 1)}
        </span>
      </div>
      
      {/* The Track (Style Range) */}
      <div style={{ 
        height: '8px', 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        borderRadius: '4px', 
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* The Target Zone (The Style Range) */}
        <div style={{
          position: 'absolute',
          left: '0%',
          right: '0%',
          height: '100%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '3px',
        }} />

        {/* The Value Marker (Pill) */}
        <div style={{
          position: 'absolute',
          left: `${clampedPercent}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          height: '14px',
          width: '6px',
          backgroundColor: finalColor,
          borderRadius: '3px',
          boxShadow: `0 0 10px ${finalColor}44`,
          transition: 'left 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 2
        }} />

        {/* Range Labels */}
        <div style={{ position: 'absolute', left: 0, top: '12px', fontSize: '0.6rem', color: 'var(--text-muted)' }}>{min.toFixed(label === 'OG' || label === 'FG' ? 3 : 0)}</div>
        <div style={{ position: 'absolute', right: 0, top: '12px', fontSize: '0.6rem', color: 'var(--text-muted)' }}>{max.toFixed(label === 'OG' || label === 'FG' ? 3 : 0)}</div>
      </div>
    </div>
  );
};
