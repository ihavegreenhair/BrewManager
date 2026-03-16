import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBrewStore } from '../store/useBrewStore';
import type { Recipe, Fermentable, Hop, FermenterEntity, Equipment, MashStep, WaterProfile, BrewMethod } from '../types/brewing';
import { 
  calculateSharedTargets, 
  calculateFermenterTargets, 
  calculateWaterVolumes, 
  calculateTargetOGFromABV, 
  calculateWeightsFromPercentages 
} from '../utils/brewingMath';
import { predefinedEquipment } from '../data/equipment';
import { bjcpStyles } from '../data/bjcp';
import { baStyles } from '../data/ba';
import { fermentables as fermentableLibrary } from '../data/fermentables';
import { targetWaterProfiles, calculateWaterAdditions, predictMashPH, recommendWaterProfile, calculateProfileFromSalts } from '../utils/waterChemistry';
import { exportRecipeToBeerJSON, importRecipeFromBeerJSON } from '../utils/beerjson';

import {
  RecipeHeader,
  CoreProfileSection,
  WaterQuantitiesSection,
  WaterChemistrySection,
  FermentablesSection,
  MashScheduleSection,
  KettleHopsSection,
  YeastPitchSection,
  FermentationSection,
  StyleMatchSidebar
} from '../components/recipe-builder';

const allStyles = [...bjcpStyles, ...baStyles];

export const RecipeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { recipes, addRecipe, updateRecipe, measurementSystem, setMeasurementSystem, defaultSourceWater, setDefaultSourceWater } = useBrewStore();

  const recipeToEdit = useMemo(() => recipes.find(r => r.id === id), [recipes, id]);

  // Recipe Metadata
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [version, setVersion] = useState('1.0');
  const [brewMethod, setBrewMethod] = useState<BrewMethod>('All Grain');
  
  // Style Selection
  const [selectedStyleId, setSelectedStyleId] = useState(allStyles[0]?.id || '');
  const activeStyle = allStyles.find(s => s.id === selectedStyleId) || allStyles[0];

  // Populate state when editing or reset when new
  useEffect(() => {
    if (recipeToEdit) {
      setName(recipeToEdit.name || '');
      setAuthor(recipeToEdit.author || '');
      setVersion(recipeToEdit.version || '1.0');
      setBrewMethod(recipeToEdit.type || 'All Grain');
      
      if (recipeToEdit.styleId) setSelectedStyleId(recipeToEdit.styleId);
      if (recipeToEdit.equipment) setEquipment(recipeToEdit.equipment);
      
      setBatchVolume(recipeToEdit.batchVolume);
      setBoilVolume(recipeToEdit.boilVolume);
      setBoilTime(recipeToEdit.boilTime);
      setEfficiency(recipeToEdit.efficiency);
      setGrainAbsorptionRate(recipeToEdit.grainAbsorptionRate || 0.8);
      setTrubLoss(recipeToEdit.trubLoss || 0);
      setMashTunDeadspace(recipeToEdit.mashTunDeadspace || 0);
      setBoilOffRate(recipeToEdit.boilOffRate || 3.0);

      if (recipeToEdit.fermentables) setFermentables(recipeToEdit.fermentables);
      if (recipeToEdit.kettleHops) setKettleHops(recipeToEdit.kettleHops);
      if (recipeToEdit.mashSteps) setMashSteps(recipeToEdit.mashSteps);
      
      if (recipeToEdit.fermenters && recipeToEdit.fermenters.length > 0) {
        setPrimaryFermenter(recipeToEdit.fermenters[0]);
      }

      if (recipeToEdit.waterProfile) setSourceWater(recipeToEdit.waterProfile);
      if (recipeToEdit.targetWaterProfile) setCustomTargetWater(recipeToEdit.targetWaterProfile);
      if (recipeToEdit.acidAddition) setAcidAddition(recipeToEdit.acidAddition);
    } else if (!id) {
      // Reset to defaults for a new recipe
      setName('');
      setAuthor('');
      setVersion('1.0');
      setBrewMethod('All Grain');
      setSelectedStyleId(allStyles[0]?.id || '');
      setEquipment(predefinedEquipment[0]);
      setBatchVolume(predefinedEquipment[0].batchVolume);
      setBoilVolume(predefinedEquipment[0].boilVolume);
      setBoilTime(predefinedEquipment[0].boilTime);
      setEfficiency(predefinedEquipment[0].efficiency);
      setGrainAbsorptionRate(0.8);
      setTrubLoss(0);
      setMashTunDeadspace(0);
      setBoilOffRate(3.0);
      setFermentables([]);
      setKettleHops([]);
      setMashSteps([]);
      setPrimaryFermenter({
        id: crypto.randomUUID(), name: 'Primary', volume: predefinedEquipment[0].batchVolume, yeast: [], dryHops: [], fermentationSteps: [],
        targetFG: 1.0, targetABV: 0
      });
      setSourceWater(defaultSourceWater);
      setTargetWaterId(targetWaterProfiles[0].id);
      setAcidAddition({ type: 'lactic', concentration: 88, volumeMl: 0 });
    }
  }, [recipeToEdit, id, defaultSourceWater]);

  // Unit Conversion Effect - REMOVED state-altering logic
  // Internal state is now strictly METRIC.

  // Fermentable Searching
  const [fermentableSearch, setFermentableSearch] = useState('');
  const filteredLibraryFermentables = fermentableLibrary.filter(f => 
    f.name.toLowerCase().includes(fermentableSearch.toLowerCase())
  );

  // Base Equipment Reference
  const [equipment, setEquipment] = useState<Equipment>(predefinedEquipment[0]);
  
  // Decoupled Recipe-Level Overrides
  const [batchVolume, setBatchVolume] = useState(equipment.batchVolume);
  const [boilVolume, setBoilVolume] = useState(equipment.boilVolume);
  const [boilTime, setBoilTime] = useState(equipment.boilTime);
  const [efficiency, setEfficiency] = useState(equipment.efficiency);
  const [grainAbsorptionRate, setGrainAbsorptionRate] = useState(equipment.grainAbsorptionRate || 0.8);
  const [trubLoss, setTrubLoss] = useState(equipment.trubLoss || 0);
  const [mashTunDeadspace, setMashTunDeadspace] = useState(equipment.mashTunDeadspace || 0);
  const [boilOffRate, setBoilOffRate] = useState(equipment.boilOffRate);

  // Checks if user modified volume/efficiency away from base equipment
  const isCustomOverride = 
    batchVolume !== equipment.batchVolume || 
    efficiency !== equipment.efficiency ||
    boilTime !== equipment.boilTime ||
    grainAbsorptionRate !== (equipment.grainAbsorptionRate || 0.8) ||
    trubLoss !== equipment.trubLoss ||
    mashTunDeadspace !== (equipment.mashTunDeadspace || 0) ||
    boilOffRate !== equipment.boilOffRate;
  
  const [fermentables, setFermentables] = useState<Fermentable[]>([]);
  const totalGrainWeight = fermentables.reduce((acc, f) => acc + f.weight, 0);

  const [kettleHops, setKettleHops] = useState<Hop[]>([]);
  const [mashSteps, setMashSteps] = useState<MashStep[]>([]);

  // Grain Bill Calculation Mode
  const [grainBillMode, setGrainBillMode] = useState<'weight' | 'percentage'>('weight');
  const [targetABV, setTargetABV] = useState(5.0);
  const [co2Volumes, setCo2Volumes] = useState(2.5);

  const [primaryFermenter, setPrimaryFermenter] = useState<FermenterEntity>({
    id: crypto.randomUUID(), name: 'Primary', volume: batchVolume, yeast: [], dryHops: [], fermentationSteps: [],
    targetFG: 1.0, targetABV: 0
  });

  // Keep targetABV synced when in weight mode so switching to percentage mode is seamless
  useEffect(() => {
    if (grainBillMode === 'weight') {
      setTargetABV(primaryFermenter.targetABV);
    }
  }, [primaryFermenter.targetABV, grainBillMode]);

  // Calculate Weights from Percentages if in percentage mode
  useEffect(() => {
    if (grainBillMode === 'percentage' && fermentables.length > 0) {
      const avgAttenuation = primaryFermenter.yeast.length > 0 
        ? primaryFermenter.yeast.reduce((acc, y) => acc + y.attenuation, 0) / primaryFermenter.yeast.length / 100
        : 0.75;
      
      const neededOG = calculateTargetOGFromABV(targetABV, avgAttenuation);
      const updatedFermentables = calculateWeightsFromPercentages(fermentables, neededOG, efficiency, batchVolume, brewMethod, trubLoss, mashTunDeadspace);
      
      // Only update if something actually changed to avoid infinite loops
      const weightsChanged = updatedFermentables.some((f, i) => Math.abs(f.weight - fermentables[i].weight) > 0.001);
      if (weightsChanged) {
        setFermentables(updatedFermentables);
      }
    }
  }, [grainBillMode, targetABV, primaryFermenter.yeast, efficiency, batchVolume, brewMethod, trubLoss, mashTunDeadspace, fermentables.length]);

  // UI Collapsible State
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ core: false, quantities: false, water: false, fermentables: false, mash: true, hops: false, yeast: true, fermentation: true });
  const toggleSection = (key: string) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  // Water State
  const [sourceWater, setSourceWater] = useState<WaterProfile>(defaultSourceWater);
  const [targetWaterId, setTargetWaterId] = useState(targetWaterProfiles[0].id);
  const [customTargetWater, setCustomTargetWater] = useState<WaterProfile>({ ...targetWaterProfiles[0], id: 'wp-custom', name: 'Custom Profile' });
  const [showWaterConfirm, setShowWaterConfirm] = useState(false);
  const [pendingTargetWaterId, setPendingTargetWaterId] = useState<string | null>(null);
  
  // Water UI / Calculation Settings
  const [manualStrikeVolume, setManualStrikeVolume] = useState<number | undefined>(undefined);
  const [manualSpargeVolume, setManualSpargeVolume] = useState<number | undefined>(undefined);
  const [saltAdditionPosition, setSaltAdditionPosition] = useState<'split' | 'mash_only' | 'kettle_only'>('split');
  const [saltCalculationMode, setSaltCalculationMode] = useState<'auto' | 'manual'>('auto');
  const [manualSaltAdditions, setManualSaltAdditions] = useState({ gypsum: 0, cacl2: 0, epsom: 0, bakingSoda: 0 });

  const handleSaltStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSaltAdditionPosition(e.target.value as 'split' | 'mash_only' | 'kettle_only');
  };
  
  const isCustomTarget = targetWaterId === 'wp-custom';
  const baseTargetWater = targetWaterProfiles.find(w => w.id === targetWaterId) || targetWaterProfiles[0];

  const handleTargetWaterIdChange = (id: string) => {
    setTargetWaterId(id);
    if (id !== 'wp-custom') {
      const template = targetWaterProfiles.find(w => w.id === id);
      if (template) {
        setCustomTargetWater({ ...template, id: 'wp-custom', name: 'Custom Profile' });
      }
    }
  };

  // Advanced Water Calculations
  const waterVolumes = useMemo(() => calculateWaterVolumes(
    { ...equipment, grainAbsorptionRate, trubLoss, mashTunDeadspace, boilOffRate }, 
    fermentables, 
    boilTime, 
    brewMethod,
    batchVolume, 
    manualStrikeVolume, 
    manualSpargeVolume,
    trubLoss
  ), [equipment, grainAbsorptionRate, trubLoss, mashTunDeadspace, boilOffRate, fermentables, boilTime, brewMethod, batchVolume, manualStrikeVolume, manualSpargeVolume]);

  // Calculate salt additions
  const totalWaterVolumeLiters = waterVolumes.mashWater + waterVolumes.spargeWater;
  
  const autoTotalSaltMath = useMemo(() => 
    calculateWaterAdditions(sourceWater, customTargetWater, totalWaterVolumeLiters),
    [sourceWater, customTargetWater, totalWaterVolumeLiters]
  );

  const totalSaltMath = useMemo(() => {
    if (saltCalculationMode === 'auto') return autoTotalSaltMath;
    return calculateProfileFromSalts(sourceWater, manualSaltAdditions, totalWaterVolumeLiters);
  }, [saltCalculationMode, autoTotalSaltMath, sourceWater, manualSaltAdditions, totalWaterVolumeLiters]);

  // activeTargetWater is driven by manual additions if in manual mode
  const activeTargetWater = useMemo(() => {
    if (saltCalculationMode === 'auto') {
      return customTargetWater;
    }
    return {
      ...customTargetWater,
      ...totalSaltMath.resultingProfile,
      id: 'wp-manual',
      name: 'Manual Additions (Override)'
    };
  }, [saltCalculationMode, customTargetWater, totalSaltMath.resultingProfile]);

  const handleProfileChange = (updates: Partial<WaterProfile>) => {
    setTargetWaterId('wp-custom');
    setCustomTargetWater(prev => ({ ...prev, ...updates }));
    setSaltCalculationMode('auto'); // Switching back to auto if they tweak the target
  };

  const handleIonChange = (key: keyof WaterProfile, value: number) => {
    handleProfileChange({ [key]: value });
  };

  // Acid State
  const [acidMode, setAcidMode] = useState<'manual' | 'auto'>('manual');
  const [targetPH, setTargetPH] = useState(5.4);
  const [acidAddition, setAcidAddition] = useState<{ type: 'lactic' | 'phosphoric'; concentration: number; volumeMl: number }>({ type: 'lactic', concentration: 88, volumeMl: 0 });

  const mashSaltMathSplit = useMemo(() => {
    if (saltCalculationMode === 'auto') {
      return calculateWaterAdditions(sourceWater, activeTargetWater, waterVolumes.mashWater);
    } else {
      const ratio = totalWaterVolumeLiters > 0 ? waterVolumes.mashWater / totalWaterVolumeLiters : 0;
      const mashAdditions = {
        gypsum: manualSaltAdditions.gypsum * ratio,
        cacl2: manualSaltAdditions.cacl2 * ratio,
        epsom: manualSaltAdditions.epsom * ratio,
        bakingSoda: manualSaltAdditions.bakingSoda * ratio
      };
      return calculateProfileFromSalts(sourceWater, mashAdditions, waterVolumes.mashWater);
    }
  }, [saltCalculationMode, sourceWater, activeTargetWater, waterVolumes.mashWater, manualSaltAdditions, totalWaterVolumeLiters] );
  
  const spargeSaltMathSplit = useMemo(() => {
    if (saltCalculationMode === 'auto') {
      return calculateWaterAdditions(sourceWater, activeTargetWater, waterVolumes.spargeWater);
    } else {
      const ratio = totalWaterVolumeLiters > 0 ? waterVolumes.spargeWater / totalWaterVolumeLiters : 0;
      const spargeAdditions = {
        gypsum: manualSaltAdditions.gypsum * ratio,
        cacl2: manualSaltAdditions.cacl2 * ratio,
        epsom: manualSaltAdditions.epsom * ratio,
        bakingSoda: manualSaltAdditions.bakingSoda * ratio
      };
      return calculateProfileFromSalts(sourceWater, spargeAdditions, waterVolumes.spargeWater);
    }
  }, [saltCalculationMode, sourceWater, activeTargetWater, waterVolumes.spargeWater, manualSaltAdditions, totalWaterVolumeLiters] );

  // Determine what actually goes into the mash for pH prediction
  const effectiveMashProfile = useMemo(() => {
    return saltAdditionPosition === 'split' 
      ? mashSaltMathSplit.resultingProfile 
      : (saltAdditionPosition === 'mash_only' ? totalSaltMath.resultingProfile : sourceWater);
  }, [saltAdditionPosition, mashSaltMathSplit.resultingProfile, totalSaltMath.resultingProfile, sourceWater]);

  // Predicted pH & Auto-Acid Logic
  const currentPHNoAcid = useMemo(() => predictMashPH(
    { id: 'wp-final', name: 'Final', ...effectiveMashProfile }, 
    fermentables, 
    waterVolumes.mashWater,
    { type: acidAddition.type, concentration: acidAddition.concentration, volumeMl: 0 }
  ), [effectiveMashProfile, fermentables, waterVolumes.mashWater, acidAddition.type, acidAddition.concentration]);

  // If in auto mode, we iterate to find the volume needed
  useEffect(() => {
    if (acidMode === 'auto') {
      let bestVol = 0;
      let closestPH = currentPHNoAcid;
      
      // Simple search for correct acid volume (0 to 30ml)
      for (let v = 0; v <= 30; v += 0.1) {
        const testPH = predictMashPH(
          { id: 'wp-final', name: 'Final', ...effectiveMashProfile }, 
          fermentables, 
          waterVolumes.mashWater,
          { type: acidAddition.type, concentration: acidAddition.concentration, volumeMl: v }
        );
        if (Math.abs(testPH - targetPH) < Math.abs(closestPH - targetPH)) {
          closestPH = testPH;
          bestVol = v;
        }
      }
      
      const roundedVol = Number(bestVol.toFixed(1));
      if (acidAddition.volumeMl !== roundedVol) {
        setAcidAddition(prev => ({ ...prev, volumeMl: roundedVol }));
      }
    }
  }, [acidMode, targetPH, currentPHNoAcid, effectiveMashProfile, fermentables, waterVolumes.mashWater, acidAddition.type, acidAddition.concentration]);

  const predictedPH = predictMashPH(
    { id: 'wp-final', name: 'Final', ...effectiveMashProfile }, 
    fermentables, 
    waterVolumes.mashWater,
    acidAddition
  );

  // Style Change Modal Logic
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyleId(styleId);
    const style = allStyles.find(s => s.id === styleId);
    if (style) {
      const recommendedId = recommendWaterProfile(style);
      if (recommendedId && recommendedId !== targetWaterId) {
        setPendingTargetWaterId(recommendedId);
        setShowWaterConfirm(true);
      }
    }
  };

  const confirmWaterChange = (apply: boolean) => {
    if (apply && pendingTargetWaterId) {
      setTargetWaterId(pendingTargetWaterId);
    }
    setShowWaterConfirm(false);
    setPendingTargetWaterId(null);
  };

  const so4ClRatio = activeTargetWater.chloride > 0 
    ? (activeTargetWater.sulfate / activeTargetWater.chloride).toFixed(1) 
    : 'N/A';

  const [sharedTargets, setSharedTargets] = useState({ targetOG: 1.0, targetSRM: 0, targetIBU: 0 });

  useEffect(() => {
    // Note we pass the overridden batchVolume and efficiency, NOT equipment.batchVolume
    const newShared = calculateSharedTargets(fermentables, kettleHops, efficiency, batchVolume, waterVolumes.boilVolume, brewMethod);
    setSharedTargets(newShared);
    
    const newFermenterTargets = calculateFermenterTargets(newShared.targetOG, primaryFermenter);
    setPrimaryFermenter(prev => ({ ...prev, ...newFermenterTargets }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fermentables, kettleHops, batchVolume, efficiency, brewMethod, primaryFermenter.yeast, waterVolumes.boilVolume]);

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = predefinedEquipment.find(eq => eq.id === e.target.value);
    if (selected) {
      setEquipment(selected);
      // Automatically update the decoupled overrides when a new template is picked
      setBatchVolume(selected.batchVolume);
      setBoilVolume(selected.boilVolume);
      setBoilTime(selected.boilTime);
      setEfficiency(selected.efficiency);
      setGrainAbsorptionRate(selected.grainAbsorptionRate || 0.8);
      setTrubLoss(selected.trubLoss);
      setPrimaryFermenter(prev => ({ ...prev, volume: selected.batchVolume }));
    }
  };

  const handleResetOverrides = () => {
    setBatchVolume(equipment.batchVolume);
    setBoilVolume(equipment.boilVolume);
    setBoilTime(equipment.boilTime);
    setEfficiency(equipment.efficiency);
    setGrainAbsorptionRate(equipment.grainAbsorptionRate || 0.8);
    setTrubLoss(equipment.trubLoss);
  };

  const handleSaveSourceWater = () => {
    setDefaultSourceWater(sourceWater);
    alert('Source water saved as global default.');
  };

  const handleExportJSON = () => {
    const fullRecipe: Recipe = {
      id: crypto.randomUUID(), name: name || 'Unnamed Recipe', author: author || 'BrewManager User', version, type: brewMethod, styleId: selectedStyleId,
      equipment, batchVolume, boilVolume, boilTime, efficiency, grainAbsorptionRate,
      fermentables, kettleHops, mashSteps, fermenters: [primaryFermenter],
      waterProfile: sourceWater, targetWaterProfile: activeTargetWater, acidAddition,
      ...sharedTargets
    };
    const jsonStr = exportRecipeToBeerJSON(fullRecipe);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_') || 'recipe'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      const imported = importRecipeFromBeerJSON(result);
      if (imported) {
        // Core Metadata
        setName(imported.name || '');
        setAuthor(imported.author || '');
        setVersion(imported.version || '1.0');
        setBrewMethod(imported.type || 'All Grain');
        
        // Style
        if (imported.styleId) {
          setSelectedStyleId(imported.styleId);
        }

        // Equipment & Overrides
        if (imported.equipment) setEquipment(imported.equipment);
        setBatchVolume(imported.batchVolume);
        setBoilVolume(imported.boilVolume);
        setBoilTime(imported.boilTime);
        setEfficiency(imported.efficiency);
        setGrainAbsorptionRate(imported.grainAbsorptionRate || 0.8);
        setTrubLoss(imported.trubLoss || 0);
        setMashTunDeadspace(imported.mashTunDeadspace || 0);
        setBoilOffRate(imported.boilOffRate || 3.0);

        // Ingredients & Process
        if (imported.fermentables) setFermentables(imported.fermentables);
        if (imported.kettleHops) setKettleHops(imported.kettleHops);
        if (imported.mashSteps) setMashSteps(imported.mashSteps);
        
        // Calculation Modes
        if (imported.grainBillMode) setGrainBillMode(imported.grainBillMode);
        if (imported.targetABV) setTargetABV(imported.targetABV);

        // Fermenters (take the first one)
        if (imported.fermenters && imported.fermenters.length > 0) {
          setPrimaryFermenter(imported.fermenters[0]);
        }

        // Water
        if (imported.waterProfile) setSourceWater(imported.waterProfile);
        if (imported.targetWaterProfile) setCustomTargetWater(imported.targetWaterProfile);
        if (imported.acidAddition) setAcidAddition(imported.acidAddition);
        if (imported.waterSettings) {
          setSaltAdditionPosition(imported.waterSettings.saltAdditionPosition);
          setManualStrikeVolume(imported.waterSettings.manualStrikeVolume);
          setManualSpargeVolume(imported.waterSettings.manualSpargeVolume);
        }

        alert('Recipe successfully imported!');
      } else {
        alert('Error parsing BeerJSON file.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    const recipeData: Recipe = {
      id: id || crypto.randomUUID(),
      name: name || 'Unnamed Recipe',
      author: author || 'BrewManager User',
      version,
      type: brewMethod,
      styleId: selectedStyleId,
      equipment,
      batchVolume, boilVolume, boilTime, efficiency, grainAbsorptionRate,
      fermentables,
      kettleHops,
      mashSteps, 
      fermenters: [primaryFermenter],
      waterProfile: sourceWater,
      targetWaterProfile: activeTargetWater,
      acidAddition,
      ...sharedTargets
    };

    if (id) {
      updateRecipe(id, recipeData);
    } else {
      addRecipe(recipeData);
    }
    navigate('/recipes');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* Water Profile Change Modal */}
      {showWaterConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--border-radius)', maxWidth: '400px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Update Water Profile?</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>You've selected a new style. Would you like to automatically switch to the recommended water profile for this style?</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button style={{ flex: 1, padding: '0.75rem' }} onClick={() => confirmWaterChange(false)}>Keep Current</button>
              <button className="primary" style={{ flex: 1, padding: '0.75rem' }} onClick={() => confirmWaterChange(true)}>Update Profile</button>
            </div>
          </div>
        </div>
      )}

      <RecipeHeader 
        measurementSystem={measurementSystem}
        setMeasurementSystem={setMeasurementSystem}
        onImport={() => fileInputRef.current?.click()}
        onExport={handleExportJSON}
        onSave={handleSave}
      />
      <input type="file" accept=".json" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImportJSON} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
          
          <CoreProfileSection 
            name={name} setName={setName}
            author={author} setAuthor={setAuthor}
            version={version} setVersion={setVersion}
            brewMethod={brewMethod} setBrewMethod={setBrewMethod}
            selectedStyleId={selectedStyleId} handleStyleSelect={handleStyleSelect}
            allStyles={allStyles}
            collapsed={collapsed.core}
            onToggle={toggleSection}
          />

          <FermentablesSection 
            fermentableSearch={fermentableSearch} setFermentableSearch={setFermentableSearch}
            filteredLibraryFermentables={filteredLibraryFermentables}
            fermentables={fermentables} setFermentables={setFermentables}
            totalGrainWeight={totalGrainWeight}
            targetOG={sharedTargets.targetOG}
            measurementSystem={measurementSystem}
            collapsed={collapsed.fermentables}
            onToggle={toggleSection}
            grainBillMode={grainBillMode}
            setGrainBillMode={setGrainBillMode}
            targetABV={targetABV}
            setTargetABV={setTargetABV}
          />

          <WaterQuantitiesSection
            brewMethod={brewMethod}
            equipment={equipment}
            handleEquipmentChange={handleEquipmentChange}
            batchVolume={batchVolume} setBatchVolume={setBatchVolume}
            boilTime={boilTime} setBoilTime={setBoilTime}
            efficiency={efficiency} setEfficiency={setEfficiency}
            grainAbsorptionRate={grainAbsorptionRate} setGrainAbsorptionRate={setGrainAbsorptionRate}
            trubLoss={trubLoss} setTrubLoss={setTrubLoss}
            mashTunDeadspace={mashTunDeadspace} setMashTunDeadspace={setMashTunDeadspace}
            boilOffRate={boilOffRate} setBoilOffRate={setBoilOffRate}
            isCustomOverride={isCustomOverride}
            handleResetOverrides={handleResetOverrides}
            measurementSystem={measurementSystem}
            manualStrikeVolume={manualStrikeVolume} setManualStrikeVolume={setManualStrikeVolume}
            manualSpargeVolume={manualSpargeVolume} setManualSpargeVolume={setManualSpargeVolume}
            waterVolumes={waterVolumes}
            collapsed={collapsed.quantities}
            onToggle={toggleSection}
          />

          <WaterChemistrySection 
            sourceWater={sourceWater} setSourceWater={setSourceWater}
            handleSaveSourceWater={handleSaveSourceWater}
            targetWaterId={targetWaterId} setTargetWaterId={handleTargetWaterIdChange}
            targetWaterProfiles={targetWaterProfiles}
            isCustomTarget={isCustomTarget}
            customTargetWater={customTargetWater} setCustomTargetWater={setCustomTargetWater}
            baseTargetWater={baseTargetWater}
            saltAdditionPosition={saltAdditionPosition} handleSaltStrategyChange={handleSaltStrategyChange}
            saltCalculationMode={saltCalculationMode} setSaltCalculationMode={setSaltCalculationMode}
            manualSaltAdditions={manualSaltAdditions} setManualSaltAdditions={setManualSaltAdditions}
            manualStrikeVolume={manualStrikeVolume} setManualStrikeVolume={setManualStrikeVolume}
            manualSpargeVolume={manualSpargeVolume} setManualSpargeVolume={setManualSpargeVolume}
            waterVolumes={waterVolumes}
            totalSaltMath={totalSaltMath}
            mashSaltMathSplit={mashSaltMathSplit}
            spargeSaltMathSplit={spargeSaltMathSplit}
            so4ClRatio={so4ClRatio}
            activeTargetWater={activeTargetWater}
            acidMode={acidMode} setAcidMode={setAcidMode}
            acidAddition={acidAddition} setAcidAddition={setAcidAddition}
            targetPH={targetPH} setTargetPH={setTargetPH}
            predictedPH={predictedPH}
            hasFermentables={fermentables.length > 0}
            onProfileChange={handleProfileChange}
            onIonChange={handleIonChange}
            collapsed={collapsed.water}
            onToggle={toggleSection}
          />

          <MashScheduleSection 
            mashSteps={mashSteps} setMashSteps={setMashSteps}
            measurementSystem={measurementSystem}
            collapsed={collapsed.mash}
            onToggle={toggleSection}
          />

          <KettleHopsSection 
            kettleHops={kettleHops} setKettleHops={setKettleHops}
            targetIBU={sharedTargets.targetIBU}
            targetOG={sharedTargets.targetOG}
            batchVolume={batchVolume}
            boilVolume={waterVolumes.boilVolume}
            measurementSystem={measurementSystem}
            collapsed={collapsed.hops}
            onToggle={toggleSection}
          />
          
          <YeastPitchSection 
            primaryFermenter={primaryFermenter} setPrimaryFermenter={setPrimaryFermenter}
            collapsed={collapsed.yeast}
            onToggle={toggleSection}
          />

          <FermentationSection 
            primaryFermenter={primaryFermenter} setPrimaryFermenter={setPrimaryFermenter}
            measurementSystem={measurementSystem}
            co2Volumes={co2Volumes}
            setCo2Volumes={setCo2Volumes}
            collapsed={collapsed.fermentation}
            onToggle={toggleSection}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <StyleMatchSidebar 
            activeStyle={activeStyle}
            sharedTargets={sharedTargets}
            primaryFermenter={primaryFermenter}
            fermentables={fermentables}
            kettleHops={kettleHops}
            mashSteps={mashSteps}
            activeTargetWater={activeTargetWater}
            measurementSystem={measurementSystem}
            co2Volumes={co2Volumes}
            predictedPH={predictedPH}
          />
        </div>
      </div>
    </div>
  );
};
