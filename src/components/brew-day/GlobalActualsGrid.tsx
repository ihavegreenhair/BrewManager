import React from 'react';
import { FlaskConical } from 'lucide-react';
import type { Session } from '../../types/brewing';
import styles from '../../pages/BrewDay.module.css';

interface Props {
  actuals: Session['actuals'];
  computed?: Partial<Session['actuals']> | null;
  onActualChange: (key: keyof Session['actuals'], value: number) => void;
}

export const GlobalActualsGrid: React.FC<Props> = React.memo(({ actuals, computed, onActualChange }) => {
  const fields = [
    { key: 'mashPh', label: 'Mash pH' },
    { key: 'strikeTemp', label: 'Strike Temp °C' },
    { key: 'preBoilVolume', label: 'Pre-Boil Vol' },
    { key: 'preBoilGravity', label: 'Pre-Boil Gravity' },
    { key: 'postBoilVolume', label: 'Post-Boil Vol' },
    { key: 'og', label: 'Original Gravity' },
    { key: 'pitchTemp', label: 'Pitch Temp °C' },
    { key: 'fg', label: 'Final Gravity' }
  ] as const;

  return (
    <div>
      <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FlaskConical size={18} /> Global Measured Actuals
      </h3>
      <div className={styles.detailedActualsGrid}>
        {fields.map(field => {
          const actual = actuals[field.key as keyof Session['actuals']];
          const ghost = computed?.[field.key as keyof Session['actuals']];
          return (
            <div key={field.key} className={styles.actualInputGroup}>
              <label>{field.label}</label>
              <input 
                type="number" 
                step="any" 
                value={actual || ''} 
                onChange={e => onActualChange(field.key as keyof Session['actuals'], Number(e.target.value))} 
                placeholder={ghost ? `Auto: ${Number(ghost).toFixed(4)}` : '...'} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
