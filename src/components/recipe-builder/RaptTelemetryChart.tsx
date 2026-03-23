import React, { useMemo, useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ReferenceArea,
  ReferenceLine,
  Brush,
  Label
} from 'recharts';
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
  height = 450,
  hideCard = false
}) => {
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set(['abv', 'attenuation', 'velocity', 'targetGravity', 'targetABV']));
  const [showProjection, setShowProjection] = useState(true);

  const toggleLine = (e: any) => {
    const { dataKey } = e;
    setHiddenLines(prev => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  };

  const { chartData, stallRange, lagEnd, minUnix, maxUnix } = useMemo(() => {
    const hasActualData = data && data.length > 0;
    
    // 1. Initial Normalization & Chronological Sort for Actual Data
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
          if (velocity > maxVelocity) {
            maxVelocity = velocity;
          }

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

    if (!mergedData.find(m => m.unix === startTime)) {
      mergedData.push({ unix: startTime } as any);
    }
    if (!mergedData.find(m => m.unix === scheduleEnd)) {
      mergedData.push({ unix: scheduleEnd } as any);
    }

    if (mergedData.length === 0) {
      return { chartData: [], stallRange: null, activeRange: null, lagEnd: null, minUnix: 0, maxUnix: 0 };
    }

    mergedData.sort((a, b) => a.unix - b.unix);

    const minUnix = startTime;
    const maxUnix = Math.max(mergedData[mergedData.length - 1].unix, scheduleEnd);
    const actualMaxUnix = actualPoints.length > 0 ? actualPoints[actualPoints.length - 1].unix : 0;

    let stallRange = null;
    if (actualPoints.length > 50) {
      const fortyEightHours = 48 * 60 * 60 * 1000;
      const checkPoint = [...actualPoints].reverse().find(p => actualMaxUnix - p.unix >= fortyEightHours);
      if (checkPoint && Math.abs(actualPoints[actualPoints.length - 1].gravity - checkPoint.gravity) < 0.0015 && actualPoints[actualPoints.length - 1].gravity < og - 0.005) {
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
    phases.push({ id: 'lag-phase', name: 'LAG', start: startTime, end: lagEndVal, color: 'rgba(255, 255, 255, 0.03)' });

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

  const renderLegendText = (value: string, entry: any) => {
    const isHidden = hiddenLines.has(entry.dataKey);
    return <span style={{ color: isHidden ? 'var(--text-muted)' : 'var(--text-primary)', opacity: isHidden ? 0.5 : 1, transition: 'all 0.2s' }}>{value}</span>;
  };

  const hasNoData = (!data || data.length === 0) && (!projectedData || projectedData.length === 0);
  if (hasNoData) return null;

  const innerChart = (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={showProjection} 
            onChange={(e) => setShowProjection(e.target.checked)} 
            style={{ accentColor: 'var(--accent-primary)', width: '12px', height: '12px' }}
          />
          Show Projected Profile
        </label>
      </div>
      <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 40, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
            <XAxis 
              dataKey="unix" 
              type="number" 
              domain={['dataMin', 'dataMax']} 
              stroke="var(--text-muted)" 
              fontSize={9} 
              tickFormatter={(unix) => new Date(unix).toLocaleDateString([], { month: 'short', day: 'numeric' })} 
              minTickGap={80} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis yAxisId="gravity" domain={['auto', 'auto']} stroke="var(--accent-primary)" fontSize={10} tick={{ fill: 'var(--accent-primary)' }} tickFormatter={(val) => val.toFixed(4)} axisLine={false} tickLine={false} width={55} />
            <YAxis yAxisId="temp" orientation="right" domain={['auto', 'auto']} stroke="#ff7300" fontSize={10} tick={{ fill: '#ff7300' }} tickFormatter={(val) => `${val.toFixed(0)}°`} axisLine={false} tickLine={false} width={30} />
            <YAxis yAxisId="percent" orientation="right" domain={[0, 'auto']} stroke="#4CAF50" fontSize={10} tick={{ fill: '#4CAF50' }} tickFormatter={(val) => `${val}%`} axisLine={false} tickLine={false} width={30} hide={hiddenLines.has('abv')} />
            <YAxis yAxisId="atten" orientation="right" domain={[0, 100]} stroke="#2196F3" fontSize={10} tick={{ fill: '#2196F3' }} tickFormatter={(val) => `${val}%`} axisLine={false} tickLine={false} width={35} hide={hiddenLines.has('attenuation')} />
            <YAxis yAxisId="vel" orientation="right" domain={[0, 'auto']} stroke="#E91E63" fontSize={10} tick={{ fill: '#E91E63' }} tickFormatter={(val) => val} axisLine={false} tickLine={false} width={25} hide={hiddenLines.has('velocity')} />

            {chartPhases.map((p, i) => {
              const isActive = activePhaseId && p.id === activePhaseId;
              const fill = isActive ? 'rgba(76, 175, 80, 0.15)' : (p.color || (i % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)"));
              return (
                <ReferenceArea key={`area-${i}`} yAxisId="gravity" x1={p.start} x2={p.end} fill={fill} stroke="none">
                  <Label value={p.name} position="top" fill={isActive ? "#4CAF50" : "rgba(255,255,255,0.3)"} fontSize={isActive ? 10 : 8} fontWeight="bold" offset={10} />
                </ReferenceArea>
              );
            })}

            {chartPhases.map((p, i) => {
              const isActive = activePhaseId && p.id === activePhaseId;
              return <ReferenceLine key={`line-${i}`} yAxisId="gravity" x={p.start} stroke={isActive ? "#4CAF50" : "rgba(255,255,255,0.15)"} strokeWidth={isActive ? 2 : 1} strokeDasharray="4 4" />;
            })}

            {timelineMilestones?.filter(m => m.type === 'hop').map((m, i) => {
              const unixTime = m.date.getTime();
              const isActive = activePhaseId && m.id === activePhaseId;
              if (unixTime >= minUnix && unixTime <= maxUnix) {
                return (
                  <ReferenceLine key={`hop-${i}`} yAxisId="gravity" x={unixTime} stroke={isActive ? "#4CAF50" : "#E91E63"} strokeWidth={isActive ? 2 : 1} strokeDasharray="3 3">
                    <Label value={m.name} position="insideTopRight" fill={isActive ? "#4CAF50" : "#E91E63"} fontSize={isActive ? 12 : 10} fontWeight="bold" offset={10} />
                  </ReferenceLine>
                );
              }
              return null;
            })}

            {stallRange && (
              <ReferenceArea yAxisId="gravity" x1={stallRange.start} x2={stallRange.end} fill="rgba(244, 67, 54, 0.05)" stroke="#f44336" strokeDasharray="3 3">
                <Label value="STALL DETECTED" position="center" fill="#f44336" fontSize={10} fontWeight="bold" />
              </ReferenceArea>
            )}

            {targetFG && <ReferenceLine yAxisId="gravity" y={targetFG} stroke="rgba(76, 175, 80, 0.3)" strokeDasharray="3 3" />}

            <Tooltip isAnimationActive={false} labelFormatter={(unix) => `${new Date(unix).toLocaleDateString()} ${new Date(unix).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} contentStyle={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '0.8rem', padding: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }} formatter={((val: any, name: any, props: any) => {
              if (name === 'ABV' || name === 'Atten %' || name === 'Target ABV') return [`${val}%`, name];
              if (name === 'Velocity') return [`${val} pts/day`, name];
              const isG = name === 'Gravity' || name === 'Target Gravity';
              const original = isG ? props.payload.originalGravity : props.payload.originalTemp;
              return [<span><strong>{isG ? val.toFixed(4) : `${val.toFixed(1)}°C`}</strong>{original !== undefined && name === 'Gravity' && (<span style={{ opacity: 0.4, fontSize: '0.7rem', marginLeft: '6px' }}>({original.toFixed(4)})</span>)}</span>, name];
            }) as any} />
            
            <Legend formatter={renderLegendText} onClick={toggleLine} iconType="circle" wrapperStyle={{ fontSize: '0.7rem', paddingTop: '25px', cursor: 'pointer' }} />
            
            <Line yAxisId="gravity" type="monotone" dataKey="gravity" name="Gravity" stroke="var(--accent-primary)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} hide={hiddenLines.has('gravity')} isAnimationActive={false} />
            <Line yAxisId="gravity" type="monotone" dataKey="targetGravity" name="Target Gravity" stroke="var(--accent-primary)" strokeWidth={2} strokeDasharray="5 5" opacity={0.4} dot={false} hide={hiddenLines.has('targetGravity')} isAnimationActive={false} />
            <Line yAxisId="temp" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ff7300" strokeWidth={2} strokeDasharray="4 4" dot={false} activeDot={{ r: 4 }} hide={hiddenLines.has('temperature')} isAnimationActive={false} />
            <Line yAxisId="percent" type="monotone" dataKey="abv" name="ABV" stroke="#4CAF50" strokeWidth={2} dot={false} hide={hiddenLines.has('abv')} isAnimationActive={false} />
            <Line yAxisId="percent" type="monotone" dataKey="targetABV" name="Target ABV" stroke="#4CAF50" strokeWidth={2} strokeDasharray="5 5" opacity={0.4} dot={false} hide={hiddenLines.has('targetABV')} isAnimationActive={false} />
            <Line yAxisId="atten" type="monotone" dataKey="attenuation" name="Atten %" stroke="#2196F3" strokeWidth={2} dot={false} hide={hiddenLines.has('attenuation')} isAnimationActive={false} />
            <Line yAxisId="vel" type="monotone" dataKey="velocity" name="Velocity" stroke="#E91E63" strokeWidth={2} dot={false} hide={hiddenLines.has('velocity')} isAnimationActive={false} />

            <Brush dataKey="unix" height={30} stroke="var(--border-color)" fill="var(--bg-main)" tickFormatter={() => ''} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );

  if (hideCard) return innerChart;

  return (
    <div style={{ width: '100%', background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', marginTop: '1rem' }}>
      {innerChart}
    </div>
  );
};
