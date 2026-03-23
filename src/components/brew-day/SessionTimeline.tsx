import React, { useState } from 'react';
import { GripVertical, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { BrewEvent } from '../../types/brewing';
import styles from '../../pages/BrewDay.module.css';

interface Props {
  events: BrewEvent[];
  activeEventIndex: number;
  onSelectEvent: (index: number) => void;
  onUpdateEvents: (events: BrewEvent[]) => void;
}

const getGroup = (e: BrewEvent) => {
  if (['water', 'mash'].includes(e.type) || (e.type === 'checkpoint' && e.label.includes('pH'))) {
    return { id: 'prep', name: 'Preparation & Mashing', color: '#ff9800' };
  }
  if (['boil'].includes(e.type) || (e.type === 'hop' && e.hopUse !== 'dry_hop') || (e.type === 'cooling' && e.targetTemp && e.targetTemp > 30) || (e.type === 'checkpoint' && !e.label.includes('pH') && !e.label.includes('OG'))) {
    return { id: 'boil', name: 'Boil & Whirlpool', color: '#f44336' };
  }
  return { id: 'ferment', name: 'Fermentation & Packaging', color: '#2196f3' };
};

export const SessionTimeline: React.FC<Props> = ({
  events,
  activeEventIndex,
  onSelectEvent,
  onUpdateEvents
}) => {
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const newEvents = [...events];
    const draggedItem = newEvents[draggedItemIndex];
    newEvents.splice(draggedItemIndex, 1);
    newEvents.splice(index, 0, draggedItem);
    
    setDraggedItemIndex(index);
    onUpdateEvents(newEvents);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  let currentGroupId = '';

  return (
    <div>
      <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Timeline & Steps
      </h3>
      <div className={styles.eventList}>
        {events.map((event, idx) => {
          const group = getGroup(event);
          const showHeader = group.id !== currentGroupId;
          currentGroupId = group.id;

          return (
            <React.Fragment key={event.id}>
              {showHeader && (
                <div style={{ 
                  marginTop: idx === 0 ? '0' : '1rem', 
                  marginBottom: '0.25rem', 
                  fontSize: '0.75rem', 
                  color: group.color, 
                  textTransform: 'uppercase', 
                  fontWeight: 'bold', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  letterSpacing: '0.05em'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: group.color }}></div>
                  {group.name}
                </div>
              )}
              <div 
                draggable 
                onDragStart={(e) => handleDragStart(e, idx)} 
                onDragOver={(e) => handleDragOver(e, idx)} 
                onDragEnd={handleDragEnd} 
                className={`${styles.eventItem} ${event.completed ? styles.completed : ''} ${idx === activeEventIndex ? styles.active : ''}`} 
                onClick={() => onSelectEvent(idx)}
                style={{ borderLeft: `4px solid ${event.completed ? 'transparent' : group.color}` }}
              >
                <div style={{ cursor: 'grab', color: 'var(--text-muted)' }}>
                  <GripVertical size={20} />
                </div>
                {event.completed ? (
                  <CheckCircle2 color="#4CAF50" size={24} />
                ) : (
                  <Circle size={24} color="var(--border-color)" />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: event.completed ? 'var(--text-muted)' : 'white' }}>
                    {event.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {event.subLabel}
                  </div>
                </div>
                {event.duration && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} /> {event.duration}m
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
