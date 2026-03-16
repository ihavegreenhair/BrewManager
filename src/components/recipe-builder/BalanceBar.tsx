import React from 'react';

interface BalanceBarProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number; // 0 to 1
  color?: string;
}

export const BalanceBar: React.FC<BalanceBarProps> = ({ 
  label, leftLabel, rightLabel, value, color = 'var(--accent-primary)' 
}) => {
  // Ensure value is between 0 and 1
  const pos = Math.max(0, Math.min(1, value)) * 100;

  return (
    <div style={{ marginBottom: '1.25rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>{label}</span>
      </div>
      
      <div style={{ position: 'relative', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', margin: '0.5rem 0' }}>
        {/* Track center line */}
        <div style={{ position: 'absolute', left: '50%', top: '-2px', bottom: '-2px', width: '1px', backgroundColor: 'rgba(255,255,255,0.1)', zIndex: 1 }} />
        
        {/* Indicator Dot */}
        <div style={{ 
          position: 'absolute', 
          left: `${pos}%`, 
          top: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: '12px', 
          height: '12px', 
          borderRadius: '50%', 
          backgroundColor: color, 
          boxShadow: `0 0 8px ${color}66`,
          zIndex: 2,
          transition: 'left 0.3s ease-in-out'
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
        <span style={{ fontSize: '0.65rem', color: pos < 40 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: pos < 40 ? 'bold' : 'normal' }}>{leftLabel}</span>
        <span style={{ fontSize: '0.65rem', color: pos > 60 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: pos > 60 ? 'bold' : 'normal' }}>{rightLabel}</span>
      </div>
    </div>
  );
};
