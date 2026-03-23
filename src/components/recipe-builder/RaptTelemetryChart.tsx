import React, { useMemo, useState, useEffect } from 'react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceArea,
  ReferenceLine,
  Brush,
  Label,
  Area,
  ComposedChart
} from 'recharts';
import { Filter, Eye, EyeOff, Activity, Droplets, Thermometer, FlaskConical, TrendingUp } from 'lucide-react';
import type { FermentationStep } from '../../types/brewing';
import { calculateABV, correctGravityForTemperature } from '../../utils/brewingMath';

interface DataPoint {
  gravity: number;
  temperature: number;
  timestamp: string;
  gravityVelocity?: number;
}

interface ProjectedPoint {
  unix: number;
  gravity: number;
  abv: number;
}

interface Props {
  data: DataPoint[];
  projectedData?: ProjectedPoint[] | null;
  timelineMilestones?: any[];
  fermentationSteps?: FermentationStep[];
  logStart?: string;
  targetOG?: number;
  targetFG?: number;
  onLagDetected?: (endTimestamp: number | null) => void;
  activePhaseId?: string | null;
  height?: number | string;
  hideCard?: boolean;
}

export const RaptTelemetryChart: React.FC<Props> = ({ 
  data, 
  projectedData,
  timelineMilestones,
  fermentationSteps, 
  logStart, 
  targetOG, 
  targetFG, 
  onLagDetected,
  activePhaseId,
  height = '100%',
  hideCard = false
}) => {
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set(['abv', 'attenuation', 'velocity']));
  const [showProjection, setShowProjection] = useState(true);

  const toggleLine = (dataKey: string) => {
    setHiddenLines(prev => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  };

  const { chartData, lagEnd, minUnix, maxUnix } = useMemo(() => {
    const hasActualData = data && data.length > 0;
    
    let actualPoints: any[] = [];
    let lagEndTimestamp: number | null = null;
    let maxVelocity = 0;
    let og = Number(targetOG) || 1.050;

    if (hasActualData) {
      const sorted = [...data]
        .map((p, idx) => {
          const date = new Date(p.timestamp);
          const unix = date.getTime();
          return {
            ...p,
            gravity: p.gravity > 10 ? p.gravity / 1000 : p.gravity,
            unix: isNaN(unix) ? new Date().getTime() + idx : unix + idx
          };
        })
        .filter(p => p.gravity > 0.5 && p.gravity < 1.5) 
        .sort((a, b) => a.unix - b.unix);
      
      if (sorted.length > 0) {
        og = Number(targetOG) || sorted[0].gravity;
        
        const sampleRate = Math.max(1, Math.floor(sorted.length / 500));
        const sampled = sorted.filter((_, i) => i % sampleRate === 0);
        const windowSize = Math.max(3, Math.min(10, Math.floor(sampled.length / 15)));

        const smoothed = sampled.map((point, idx) => {
          const startIdx = Math.max(0, idx - Math.floor(windowSize / 2));
          const endIdx = Math.min(sampled.length, startIdx + windowSize);
          const subset = sampled.slice(startIdx, endIdx);
          const avgGravity = subset.reduce((acc, p) => acc + p.gravity, 0) / subset.length;
          const avgTemp = subset.reduce((acc, p) => acc + p.temperature, 0) / subset.length;
          return { ...point, avgGravity, avgTemp };
        });

        actualPoints = smoothed.map((point) => {
          const velocity = Math.abs(point.gravityVelocity || 0);
          if (!lagEndTimestamp && velocity > 0.5) lagEndTimestamp = point.unix;
          if (velocity > maxVelocity) maxVelocity = velocity;

          const correctedGravity = correctGravityForTemperature(point.avgGravity, point.avgTemp);

          return {
            ...point,
            gravity: correctedGravity,
            temperature: point.avgTemp,
            abv: Number(calculateABV(og, correctedGravity).toFixed(3)),
            attenuation: Number((og > 1 ? ((og - correctedGravity) / (og - 1)) * 100 : 0).toFixed(1)),
            velocity: Number(velocity.toFixed(1)), 
            originalGravity: point.gravity,
            originalTemp: point.temperature
          };
        });
      }
    }

    const startTime = logStart ? new Date(logStart).getTime() : (actualPoints[0]?.unix || new Date().getTime());
    let scheduleEnd = startTime + (7 * 24 * 60 * 60 * 1000);
    if (fermentationSteps && fermentationSteps.length > 0) {
      const totalStepDays = fermentationSteps.reduce((acc, s) => acc + s.stepTime, 0);
      const lagDuration = lagEndTimestamp ? (lagEndTimestamp - startTime) : (1.0 * 24 * 60 * 60 * 1000);
      scheduleEnd = startTime + lagDuration + (totalStepDays * 24 * 60 * 60 * 1000);
    }

    let mergedData = [...actualPoints];
    if (showProjection && projectedData && projectedData.length > 0) {
      projectedData.forEach(p => {
        const existing = mergedData.find(m => Math.abs(m.unix - p.unix) < 2 * 60 * 60 * 1000);
        if (existing) {
          existing.targetGravity = p.gravity;
          existing.targetABV = p.abv;
        } else {
          mergedData.push({
            unix: p.unix,
            targetGravity: p.gravity,
            targetABV: p.abv
          });
        }
      });
    }

    if (!mergedData.find(m => m.unix === startTime)) mergedData.push({ unix: startTime } as any);
    if (!mergedData.find(m => m.unix === scheduleEnd)) mergedData.push({ unix: scheduleEnd } as any);

    if (mergedData.length === 0) return { chartData: [], stallRange: null, activeRange: null, lagEnd: null, minUnix: 0, maxUnix: 0 };

    mergedData.sort((a, b) => a.unix - b.unix);

    const minUnix = startTime;
    const maxUnix = Math.max(mergedData[mergedData.length - 1].unix, scheduleEnd);
    const actualMaxUnix = actualPoints.length > 0 ? actualPoints[actualPoints.length - 1].unix : 0;

    let stallRange = null;
    if (actualPoints.length > 50) {
      const fortyEightHours = 48 * 60 * 60 * 1000;
      const checkPoint = [...actualPoints].reverse().find(p => actualMaxUnix - p.unix >= fortyEightHours);
      if (checkPoint && Math.abs(actualPoints[actualPoints.length - 1].gravity - checkPoint.gravity) < 0.0008 && actualPoints[actualPoints.length - 1].gravity < og - 0.005 && actualPoints[actualPoints.length - 1].gravity > (Number(targetFG) || 1.010) + 0.002) {
        stallRange = { start: checkPoint.unix, end: actualMaxUnix };
      }
    }

    return { chartData: mergedData, stallRange, lagEnd: lagEndTimestamp, minUnix, maxUnix };
  }, [data, projectedData, targetOG, showProjection, fermentationSteps, logStart]);

  useEffect(() => {
    onLagDetected?.(lagEnd);
  }, [lagEnd]);

  const chartPhases = useMemo(() => {
    const phases = [];
    const startTime = logStart ? new Date(logStart).getTime() : minUnix;
    const lagEndVal = lagEnd || (startTime + 24 * 60 * 60 * 1000);
    phases.push({ id: 'lag-phase', name: 'Lag Phase', start: startTime, end: lagEndVal, color: 'rgba(255, 255, 255, 0.02)' });

    let currentTime = lagEndVal;
    if (fermentationSteps) {
      fermentationSteps.forEach(step => {
        const start = currentTime;
        const end = start + (step.stepTime * 24 * 60 * 60 * 1000);
        currentTime = end;
        phases.push({ id: step.id, name: step.name, start, end, color: 'transparent' });
      });
    }
    return phases;
  }, [logStart, fermentationSteps, minUnix, lagEnd]);

  const hasNoData = (!data || data.length === 0) && (!projectedData || projectedData.length === 0);
  if (hasNoData) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(17, 20, 24, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid #374151', borderRadius: '12px', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', minWidth: '220px' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #374151', fontWeight: 600 }}>
            {new Date(label).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {payload.map((entry: any, index: number) => {
              const color = entry.color;
              const name = entry.name;
              let val = entry.value;
              let unit = '';
              
              if (name.includes('Gravity')) { val = val.toFixed(4); unit = ' SG'; }
              else if (name.includes('Temp')) { val = val.toFixed(1); unit = ' °C'; }
              else if (name.includes('ABV')) { val = val.toFixed(2); unit = ' %'; }
              else if (name.includes('Atten')) { val = val.toFixed(1); unit = ' %'; }
              else if (name.includes('Velocity')) { val = val; unit = ' pts/d'; }

              return (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                  <span style={{ color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: color }} />
                    {name}
                  </span>
                  <span style={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                    {val}<span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400 }}>{unit}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const metrics = [
    { key: 'gravity', label: 'Gravity', color: '#60a5fa', icon: <Droplets size={14} /> },
    { key: 'temperature', label: 'Temperature', color: '#f87171', icon: <Thermometer size={14} /> },
    { key: 'abv', label: 'ABV', color: '#34d399', icon: <FlaskConical size={14} /> },
    { key: 'attenuation', label: 'Attenuation', color: '#a78bfa', icon: <Activity size={14} /> },
    { key: 'velocity', label: 'Velocity', color: '#fbbf24', icon: <TrendingUp size={14} /> },
    { key: 'phases', label: 'Phases', color: '#9ca3af', icon: <Filter size={14} /> }
  ];

  const innerChart = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>
      
      {/* Sleek overlay controls */}
      <div style={{ position: 'absolute', top: 10, right: 20, zIndex: 10, display: 'flex', gap: '8px', background: 'rgba(17, 20, 24, 0.8)', backdropFilter: 'blur(8px)', padding: '6px', borderRadius: '12px', border: '1px solid #2a2d35' }}>
        <button 
          onClick={() => setShowProjection(!showProjection)}
          style={{ background: showProjection ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: showProjection ? '#fff' : '#9ca3af', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
        >
          {showProjection ? <Eye size={14} /> : <EyeOff size={14} />} Projection
        </button>
        <div style={{ width: '1px', background: '#374151', margin: '4px 2px' }} />
        {metrics.map(m => {
          const isActive = !hiddenLines.has(m.key);
          return (
            <button
              key={m.key}
              onClick={() => toggleLine(m.key)}
              style={{
                background: isActive ? `${m.color}20` : 'transparent',
                border: 'none',
                color: isActive ? m.color : '#6b7280',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              {m.icon} {m.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 0, marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 40, right: 20, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorGravity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" stroke="#2a2d35" vertical={false} />
            
            <XAxis 
              dataKey="unix" 
              type="number" 
              domain={['dataMin', 'dataMax']} 
              stroke="#6b7280" 
              fontSize={10} 
              tickFormatter={(unix) => new Date(unix).toLocaleDateString([], { month: 'short', day: 'numeric' })} 
              minTickGap={80} 
              axisLine={false} 
              tickLine={false}
              dy={10}
            />
            
            {/* Y Axes */}
            <YAxis yAxisId="gravity" domain={['auto', 'auto']} stroke="#60a5fa" fontSize={11} tick={{ fill: '#60a5fa', fontWeight: 600 }} tickFormatter={(val) => val.toFixed(3)} axisLine={false} tickLine={false} width={50} />
            <YAxis yAxisId="temp" orientation="right" domain={['auto', 'auto']} stroke="#f87171" fontSize={11} tick={{ fill: '#f87171' }} tickFormatter={(val) => `${val.toFixed(0)}°`} axisLine={false} tickLine={false} width={35} />
            <YAxis yAxisId="percent" orientation="right" domain={[0, 'auto']} hide={hiddenLines.has('abv') && hiddenLines.has('attenuation')} width={0} />
            <YAxis yAxisId="vel" orientation="right" domain={[0, 'auto']} hide={hiddenLines.has('velocity')} width={0} />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4b5563', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            {/* Background Phases */}
            {!hiddenLines.has('phases') && chartPhases.map((p, i) => {
              const isActive = activePhaseId && p.id === activePhaseId;
              const fill = isActive ? 'rgba(96, 165, 250, 0.08)' : p.color;
              return (
                <ReferenceArea key={`area-${i}`} yAxisId="gravity" x1={p.start} x2={p.end} fill={fill} stroke="none">
                  <Label value={p.name} position="insideTop" fill={isActive ? "#60a5fa" : "#6b7280"} fontSize={11} fontWeight={isActive ? 700 : 500} offset={15} />
                </ReferenceArea>
              );
            })}

            {/* Phase Dividers */}
            {!hiddenLines.has('phases') && chartPhases.map((p, i) => {
              const isActive = activePhaseId && p.id === activePhaseId;
              return <ReferenceLine key={`line-${i}`} yAxisId="gravity" x={p.start} stroke={isActive ? "#60a5fa" : "#374151"} strokeWidth={1} strokeDasharray="4 4" />;
            })}

            {/* Hop Additions */}
            {!hiddenLines.has('phases') && timelineMilestones?.filter(m => m.type === 'hop').map((m, i) => {
              const unixTime = m.date.getTime();
              if (unixTime >= minUnix && unixTime <= maxUnix) {
                return (
                  <ReferenceLine key={`hop-${i}`} yAxisId="gravity" x={unixTime} stroke="#10b981" strokeWidth={1} strokeDasharray="3 3">
                    <Label value={`🌱 ${m.name}`} position="insideTopLeft" fill="#10b981" fontSize={10} fontWeight={600} offset={8} />
                  </ReferenceLine>
                );
              }
              return null;
            })}

            {/* Target FG */}
            {targetFG && <ReferenceLine yAxisId="gravity" y={targetFG} stroke="#34d399" strokeDasharray="4 4" opacity={0.6}><Label value={`Target FG ${targetFG.toFixed(3)}`} position="insideBottomRight" fill="#34d399" fontSize={10} offset={10} /></ReferenceLine>}

            {/* Projections */}
            <Line yAxisId="gravity" type="monotone" dataKey="targetGravity" name="Projected Gravity" stroke="#60a5fa" strokeWidth={2} strokeDasharray="4 4" opacity={0.5} dot={false} isAnimationActive={false} hide={hiddenLines.has('gravity') || !showProjection} />
            <Line yAxisId="percent" type="monotone" dataKey="targetABV" name="Projected ABV" stroke="#34d399" strokeWidth={2} strokeDasharray="4 4" opacity={0.5} dot={false} isAnimationActive={false} hide={hiddenLines.has('abv') || !showProjection} />

            {/* Actual Areas & Lines */}
            <Area yAxisId="gravity" type="monotone" dataKey="gravity" fillOpacity={1} fill="url(#colorGravity)" stroke="none" hide={hiddenLines.has('gravity')} isAnimationActive={false} />
            <Area yAxisId="temp" type="monotone" dataKey="temperature" fillOpacity={1} fill="url(#colorTemp)" stroke="none" hide={hiddenLines.has('temperature')} isAnimationActive={false} />

            <Line yAxisId="gravity" type="monotone" dataKey="gravity" name="Actual Gravity" stroke="#60a5fa" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} hide={hiddenLines.has('gravity')} isAnimationActive={false} />
            <Line yAxisId="temp" type="monotone" dataKey="temperature" name="Actual Temp" stroke="#f87171" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} hide={hiddenLines.has('temperature')} isAnimationActive={false} />
            <Line yAxisId="percent" type="monotone" dataKey="abv" name="Actual ABV" stroke="#34d399" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} hide={hiddenLines.has('abv')} isAnimationActive={false} />
            <Line yAxisId="percent" type="monotone" dataKey="attenuation" name="Attenuation" stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} hide={hiddenLines.has('attenuation')} isAnimationActive={false} />
            <Line yAxisId="vel" type="monotone" dataKey="velocity" name="Velocity" stroke="#fbbf24" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} hide={hiddenLines.has('velocity')} isAnimationActive={false} />

            <Brush dataKey="unix" height={24} stroke="#4b5563" fill="rgba(255,255,255,0.02)" tickFormatter={() => ''} travellerWidth={8} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (hideCard) return innerChart;

  return (
    <div style={{ width: '100%', height, background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', marginTop: '1rem', boxSizing: 'border-box' }}>
      {innerChart}
    </div>
  );
};
