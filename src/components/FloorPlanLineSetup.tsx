/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  LayoutGrid,
  Building2,
  Sliders,
  Layers,
  Users,
  Play,
  Wrench,
  Pause,
  Sparkles,
  MapPin,
  ChevronRight,
  Columns,
  FileSpreadsheet,
  Factory,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  Mail,
  Hash,
  Building,
  Check,
  RotateCcw
} from 'lucide-react';
import { LineEntry, UserProfile, FactoryIndustryProfile } from '../types';
import { VisualFloorPlan } from './VisualFloorPlan';
import { LineConfigurationTeams } from './LineConfigurationTeams';
import {
  DEFAULT_FACTORY_PROFILE,
  PRESET_FACTORIES,
  INDUSTRY_SECTORS,
  setStoredActiveFactory,
  setStoredSavedFactories
} from '../data/factoryProfiles';

export type FloorSetupSubView = 'floor-plan' | 'line-setup' | 'factory' | 'split-view';

export interface FloorPlanLineSetupProps {
  lines: LineEntry[];
  onSaveLine: (updatedLine: LineEntry) => void;
  onAddNewLine: (newLine: LineEntry) => void;
  onDeleteLine?: (lineNo: string) => void;
  onDeleteFloor?: (floorName: string, mode: 'delete_all_lines' | 'reassign', targetFloor?: string) => void;
  onReorderLines?: (reorderedFloorLines: LineEntry[]) => void;
  onNavigate: (tab: string, lineNo?: string) => void;
  activeDate?: string;
  profile?: UserProfile;
  initialSubView?: FloorSetupSubView;
  initialLineNo?: string;
  onOpenDatabase?: (tab?: 'backup' | 'csv-import') => void;
  factoryProfile?: FactoryIndustryProfile;
  onUpdateFactoryProfile?: (updated: FactoryIndustryProfile) => void;
  savedFactories?: FactoryIndustryProfile[];
  onSaveFactoryList?: (list: FactoryIndustryProfile[]) => void;
}

export const FloorPlanLineSetup: React.FC<FloorPlanLineSetupProps> = ({
  lines,
  onSaveLine,
  onAddNewLine,
  onDeleteLine,
  onDeleteFloor,
  onReorderLines,
  onNavigate,
  activeDate,
  profile,
  initialSubView = 'floor-plan',
  initialLineNo,
  onOpenDatabase,
  factoryProfile,
  onUpdateFactoryProfile,
  savedFactories,
  onSaveFactoryList
}) => {
  const [activeSubView, setActiveSubView] = useState<FloorSetupSubView>(initialSubView);
  const [syncedFloor, setSyncedFloor] = useState<string | undefined>(undefined);
  const [selectedTargetLineNo, setSelectedTargetLineNo] = useState<string | undefined>(initialLineNo);

  // Sync initialSubView when requested from outside (e.g. Header Factory Pill)
  useEffect(() => {
    if (initialSubView) {
      setActiveSubView(initialSubView);
    }
  }, [initialSubView]);

  // Factory & Industry Profile state
  const activeProfile = factoryProfile || DEFAULT_FACTORY_PROFILE;
  const factoryList = savedFactories && savedFactories.length > 0 ? savedFactories : PRESET_FACTORIES;

  const [isEditingFactory, setIsEditingFactory] = useState(false);
  const [editingFactoryId, setEditingFactoryId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formUnitName, setFormUnitName] = useState('Unit-02');
  const [formSector, setFormSector] = useState<string>(INDUSTRY_SECTORS[0]);
  const [formCustomSector, setFormCustomSector] = useState('');
  const [formDepartment, setFormDepartment] = useState('Industrial Engineering (IE) Dept.');
  const [formCode, setFormCode] = useState('DBN-U02');
  const [formAddress, setFormAddress] = useState('Gorai, Mirzapur, Tangail / Gazipur');
  const [formLinesCount, setFormLinesCount] = useState<number>(34);
  const [formEmail, setFormEmail] = useState('ie.unit02@debonairgroupbd.com');
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Filter lines to reflect the actual physical production lines configured in the plant layout (deduplicated by lineNo or filtered by activeDate)
  const layoutPhysicalLines = useMemo(() => {
    if (activeDate) {
      const onDate = lines.filter(l => l.date === activeDate);
      if (onDate.length > 0) return onDate;
    }
    const map = new Map<string, LineEntry>();
    for (const l of lines) {
      const key = String(l.lineNo);
      if (!map.has(key)) {
        map.set(key, l);
      }
    }
    const unique = Array.from(map.values());
    return unique.length > 0 ? unique : lines;
  }, [lines, activeDate]);

  // Compute key summary statistics across the active physical plant layout lines
  const stats = useMemo(() => {
    const totalLines = layoutPhysicalLines.length;
    const activeLines = layoutPhysicalLines.filter(l => l.isActive !== false && l.status !== 'Stopped' && l.status !== 'Maintenance').length;
    const maintLines = layoutPhysicalLines.filter(l => l.status === 'Maintenance').length;
    const stoppedLines = layoutPhysicalLines.filter(l => l.isActive === false || l.status === 'Stopped').length;

    const floors = Array.from(new Set(layoutPhysicalLines.map(l => l.floor || 'Floor 01'))).filter(Boolean);
    const totalStaff = layoutPhysicalLines.reduce((acc, l) => acc + (l.teamMembers?.length || 0), 0);

    return {
      totalLines,
      activeLines,
      maintLines,
      stoppedLines,
      totalFloors: floors.length,
      totalStaff,
      floors
    };
  }, [layoutPhysicalLines]);

  // Seamless switch handlers between Floor Plan and Line Setup
  const handleSwitchToSetup = (lineNo?: string) => {
    if (lineNo) {
      setSelectedTargetLineNo(lineNo);
    }
    setActiveSubView('line-setup');
  };

  const handleSwitchToFloorPlan = (floorName?: string, lineNo?: string) => {
    if (floorName) {
      setSyncedFloor(floorName);
    }
    if (lineNo) {
      setSelectedTargetLineNo(lineNo);
    }
    setActiveSubView('floor-plan');
  };

  // Factory form management handlers
  const startCreateNewFactory = () => {
    setEditingFactoryId(null);
    setFormName('');
    setFormUnitName('Unit-01');
    setFormSector(INDUSTRY_SECTORS[0]);
    setFormCustomSector('');
    setFormDepartment('Industrial Engineering (IE) Dept.');
    setFormCode('FAC-01');
    setFormAddress('');
    setFormLinesCount(layoutPhysicalLines.length || 34);
    setFormEmail('');
    setIsEditingFactory(true);
    setFormSuccessMessage(null);
  };

  const startEditFactory = (item: FactoryIndustryProfile) => {
    setEditingFactoryId(item.id);
    setFormName(item.name);
    setFormUnitName(item.unitName);
    if (INDUSTRY_SECTORS.includes(item.industrySector)) {
      setFormSector(item.industrySector);
      setFormCustomSector('');
    } else {
      setFormSector('Custom Industrial Manufacturing');
      setFormCustomSector(item.industrySector);
    }
    setFormDepartment(item.department || 'Industrial Engineering (IE) Dept.');
    setFormCode(item.factoryCode || '');
    setFormAddress(item.addressLocation || '');
    setFormLinesCount(item.totalLinesCount || layoutPhysicalLines.length || 34);
    setFormEmail(item.contactEmail || '');
    setIsEditingFactory(true);
    setFormSuccessMessage(null);
  };

  const handleSaveFactoryForm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSector =
      formSector === 'Custom Industrial Manufacturing' && formCustomSector.trim()
        ? formCustomSector.trim()
        : formSector;

    if (!formName.trim()) {
      alert('Please provide a valid Factory / Enterprise Name.');
      return;
    }

    const newProfile: FactoryIndustryProfile = {
      id: editingFactoryId || `custom_factory_${Date.now()}`,
      name: formName.trim(),
      unitName: formUnitName.trim() || 'Unit-01',
      industrySector: finalSector,
      department: formDepartment.trim() || 'Industrial Engineering (IE) Dept.',
      factoryCode: formCode.trim().toUpperCase() || 'PLANT-01',
      addressLocation: formAddress.trim(),
      shortTag: formCode.trim() ? formCode.trim().toUpperCase() : formName.trim().slice(0, 4).toUpperCase(),
      totalLinesCount: Number(formLinesCount) || layoutPhysicalLines.length || 34,
      contactEmail: formEmail.trim(),
      isCustom: true
    };

    if (onUpdateFactoryProfile) {
      onUpdateFactoryProfile(newProfile);
    }
    setStoredActiveFactory(newProfile);

    let updatedList: FactoryIndustryProfile[];
    const existingIdx = factoryList.findIndex(f => f.id === newProfile.id);
    if (existingIdx >= 0) {
      updatedList = [...factoryList];
      updatedList[existingIdx] = newProfile;
    } else {
      updatedList = [newProfile, ...factoryList];
    }

    if (onSaveFactoryList) {
      onSaveFactoryList(updatedList);
    }
    setStoredSavedFactories(updatedList);

    setFormSuccessMessage(`Factory identity successfully updated to: ${newProfile.name} (${newProfile.unitName})`);
    setIsEditingFactory(false);
    setTimeout(() => {
      setFormSuccessMessage(null);
    }, 3500);
  };

  const handleSelectActiveFactory = (selected: FactoryIndustryProfile) => {
    if (onUpdateFactoryProfile) {
      onUpdateFactoryProfile(selected);
    }
    setStoredActiveFactory(selected);
    setFormSuccessMessage(`Active enterprise plant set to: ${selected.name} (${selected.unitName})`);
    setTimeout(() => {
      setFormSuccessMessage(null);
    }, 3000);
  };

  const handleDeleteFactory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === activeProfile.id) {
      alert('Cannot delete the currently active plant. Switch to another factory first.');
      return;
    }
    if (!confirm('Are you sure you want to remove this factory from saved profiles?')) {
      return;
    }
    const updated = factoryList.filter(f => f.id !== id);
    if (onSaveFactoryList) {
      onSaveFactoryList(updated);
    }
    setStoredSavedFactories(updated);
  };

  return (
    <div id="floor-plan-line-setup-merged-cockpit" className="space-y-6">
      {/* ────────────────────────────────────────────────────────── */}
      {/* UNIFIED MASTER CONTROL HEADER & SUBVIEW SWITCHER           */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#d9d2c2] rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e7e1d5] pb-5">
          <div className="space-y-1.5">
            <button
              id="btn-merged-back-to-dashboard"
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#176f78] hover:text-[#125860] transition-colors cursor-pointer mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Factory Dashboard</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#176f78]/10 text-[#176f78] border border-[#176f78]/30">
                MERGED OPERATIONS MODULE
              </span>
              <span className="text-xs text-[#527078] font-mono-numbers">
                {activeDate || 'Live Factory Production'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f1eee6] text-[#17343a] border border-[#d9d2c2] flex items-center gap-1">
                <Factory className="w-3 h-3 text-[#176f78]" />
                <span>{activeProfile.name} ({activeProfile.unitName})</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17343a] tracking-tight uppercase font-display flex items-center gap-2.5">
              <LayoutGrid className="w-7 h-7 text-[#176f78]" />
              <span>Floor Plan &amp; Line Setup</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#527078] max-w-3xl">
              Unified plant operations center: Visual shop floor layout mapping, line configuration &amp; team staffing,
              and enterprise factory &amp; industry sector classification for <strong>{activeProfile.name} ({activeProfile.unitName})</strong>.
            </p>
          </div>

          {/* Sub-View Switcher Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <div
              id="floor-setup-subview-toggle-bar"
              className="flex items-center bg-[#f1eee6] p-1.5 rounded-2xl border border-[#d9d2c2] shadow-sm ring-1 ring-black/5 overflow-x-auto"
            >
              <button
                type="button"
                id="btn-subview-floor-plan"
                onClick={() => setActiveSubView('floor-plan')}
                className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer touch-manipulation select-none active:scale-[0.98] whitespace-nowrap ${
                  activeSubView === 'floor-plan'
                    ? 'bg-[#176f78] text-white shadow-md ring-2 ring-[#176f78]/40 font-black'
                    : 'text-[#527078] hover:text-[#17343a] hover:bg-[#e7e1d5]/80'
                }`}
                title="View spatial floor plan map, bay layouts, and status toggles"
              >
                <div className={`p-1 rounded-lg transition-colors ${activeSubView === 'floor-plan' ? 'bg-white/15 text-white' : 'bg-white/60 text-[#176f78] group-hover:bg-white'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <span className="tracking-tight font-display uppercase">Floor Plan Map</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono-numbers font-black transition-colors ${
                    activeSubView === 'floor-plan'
                      ? 'bg-white/20 text-white border border-white/25'
                      : 'bg-white border border-[#d9d2c2] text-[#176f78]'
                  }`}
                >
                  {stats.activeLines}/{stats.totalLines} Live
                </span>
              </button>

              <button
                type="button"
                id="btn-subview-line-setup"
                onClick={() => setActiveSubView('line-setup')}
                className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer touch-manipulation select-none active:scale-[0.98] whitespace-nowrap ${
                  activeSubView === 'line-setup'
                    ? 'bg-[#176f78] text-white shadow-md ring-2 ring-[#176f78]/40 font-black'
                    : 'text-[#527078] hover:text-[#17343a] hover:bg-[#e7e1d5]/80'
                }`}
                title="Configure production lines, teams, apartments, and machinery"
              >
                <div className={`p-1 rounded-lg transition-colors ${activeSubView === 'line-setup' ? 'bg-white/15 text-white' : 'bg-white/60 text-[#176f78] group-hover:bg-white'}`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="tracking-tight font-display uppercase">Line &amp; Teams Setup</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono-numbers font-black transition-colors ${
                    activeSubView === 'line-setup'
                      ? 'bg-white/20 text-white border border-white/25'
                      : 'bg-white border border-[#d9d2c2] text-[#176f78]'
                  }`}
                >
                  {stats.totalLines} Lines
                </span>
              </button>

              {/* FACTORY & INDUSTRY NAME TAB */}
              <button
                type="button"
                id="btn-subview-factory-setup"
                onClick={() => setActiveSubView('factory')}
                className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer touch-manipulation select-none active:scale-[0.98] whitespace-nowrap ${
                  activeSubView === 'factory'
                    ? 'bg-[#176f78] text-white shadow-md ring-2 ring-[#176f78]/40 font-black'
                    : 'text-[#527078] hover:text-[#17343a] hover:bg-[#e7e1d5]/80'
                }`}
                title="Configure Factory & Industry profile, plant code, and facilities"
              >
                <div className={`p-1 rounded-lg transition-colors ${activeSubView === 'factory' ? 'bg-white/15 text-white' : 'bg-white/60 text-[#176f78] group-hover:bg-white'}`}>
                  <Factory className="w-4 h-4" />
                </div>
                <span className="tracking-tight font-display uppercase">Factory &amp; Industry</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black transition-colors ${
                    activeSubView === 'factory'
                      ? 'bg-white/20 text-white border border-white/25'
                      : 'bg-white border border-[#d9d2c2] text-[#176f78]'
                  }`}
                >
                  {activeProfile.unitName || 'Unit-02'}
                </span>
              </button>

              <button
                type="button"
                id="btn-subview-split-view"
                onClick={() => setActiveSubView('split-view')}
                className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer touch-manipulation select-none active:scale-[0.98] whitespace-nowrap ${
                  activeSubView === 'split-view'
                    ? 'bg-[#176f78] text-white shadow-md ring-2 ring-[#176f78]/40 font-black'
                    : 'text-[#527078] hover:text-[#17343a] hover:bg-[#e7e1d5]/80'
                }`}
                title="View both Floor Plan and Line Setup simultaneously in split mode"
              >
                <div className={`p-1 rounded-lg transition-colors ${activeSubView === 'split-view' ? 'bg-white/15 text-white' : 'bg-white/60 text-[#176f78] group-hover:bg-white'}`}>
                  <Columns className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline tracking-tight font-display uppercase">Split</span>
              </button>
            </div>

            {onOpenDatabase && (
              <button
                type="button"
                id="btn-import-csv-lines-floor-setup"
                onClick={() => onOpenDatabase('csv-import')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap"
                title="Import and validate new sewing line configurations via CSV spreadsheet"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Import Lines</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Feedback Banner */}
        {formSuccessMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{formSuccessMessage}</span>
          </div>
        )}

        {/* Quick Operational Telemetry Summary Strip with Factory Identity Card */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Active Factory Card in Summary Strip */}
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-gradient-to-br from-[#f1eee6] to-white border border-[#176f78]/30 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#176f78] flex items-center gap-1">
                <Factory className="w-3 h-3" /> Enterprise Plant
              </span>
              <button
                type="button"
                onClick={() => setActiveSubView('factory')}
                className="text-[10px] font-bold text-[#176f78] hover:underline cursor-pointer"
              >
                Change ⚙️
              </button>
            </div>
            <div className="mt-1">
              <div className="text-sm font-extrabold text-[#17343a] truncate" title={activeProfile.name}>
                {activeProfile.name}
              </div>
              <div className="text-[10px] text-[#527078] truncate">
                {activeProfile.unitName} • {activeProfile.industrySector.split('&')[0].trim()}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fbfaf6] border border-[#e7e1d5] flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#527078]">Configured Lines</div>
              <div className="text-xl font-extrabold text-[#17343a] font-mono-numbers">
                {stats.totalLines} <span className="text-xs font-normal text-[#527078]">Lines</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              <Play className="w-4 h-4 fill-current" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fbfaf6] border border-[#e7e1d5] flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#527078]">Active Operations</div>
              <div className="text-xl font-extrabold text-emerald-700 font-mono-numbers">
                {stats.activeLines} <span className="text-xs font-normal text-[#527078]">Running</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {stats.totalLines > 0 ? Math.round((stats.activeLines / stats.totalLines) * 100) : 0}% Up
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fbfaf6] border border-[#e7e1d5] flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#527078]">Factory Floors</div>
              <div className="text-xl font-extrabold text-[#17343a] font-mono-numbers">
                {stats.totalFloors} <span className="text-xs font-normal text-[#527078]">Floors</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fbfaf6] border border-[#e7e1d5] flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#527078]">Staff Assigned</div>
              <div className="text-xl font-extrabold text-[#176f78] font-mono-numbers">
                {stats.totalStaff} <span className="text-xs font-normal text-[#527078]">Personnel</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Floor Line Distribution Bar */}
        <div className="pt-3 border-t border-[#e7e1d5] flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="font-bold text-[#527078] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#176f78]" /> Production Floor Layout Distribution:
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-[#f1eee6] border border-[#d9d2c2] text-[#17343a] font-semibold text-[11px]">
              <strong className="text-[#176f78]">Padma Floor:</strong> 06 Lines
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#f1eee6] border border-[#d9d2c2] text-[#17343a] font-semibold text-[11px]">
              <strong className="text-[#176f78]">Meghna Floor:</strong> 06 Lines
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#f1eee6] border border-[#d9d2c2] text-[#17343a] font-semibold text-[11px]">
              <strong className="text-[#176f78]">Karnophuli Floor:</strong> 05 Lines
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#f1eee6] border border-[#d9d2c2] text-[#17343a] font-semibold text-[11px]">
              <strong className="text-[#176f78]">Korotoya Floor:</strong> 06 Lines
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#f1eee6] border border-[#d9d2c2] text-[#17343a] font-semibold text-[11px]">
              <strong className="text-[#176f78]">Shitalokshya Floor:</strong> 06 Lines
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#f1eee6] border border-[#d9d2c2] text-[#17343a] font-semibold text-[11px]">
              <strong className="text-[#176f78]">Turag Floor:</strong> 05 Lines
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#176f78]/10 border border-[#176f78]/30 text-[#176f78] font-bold text-[11px]">
              Total: 34 Lines in Layout
            </span>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* RENDER ACTIVE SUBVIEW                                      */}
      {/* ────────────────────────────────────────────────────────── */}

      {/* Mode 1: Fullscreen Visual Floor Plan */}
      {activeSubView === 'floor-plan' && (
        <section id="unified-view-floor-plan" className="animate-fadeIn">
          <VisualFloorPlan
            lines={lines}
            onSaveLine={onSaveLine}
            onReorderLines={onReorderLines}
            onNavigate={onNavigate}
            activeDate={activeDate}
            profile={profile}
            initialFloor={syncedFloor}
            onSwitchToSetup={handleSwitchToSetup}
            hideTopHeader={false}
          />
        </section>
      )}

      {/* Mode 2: Fullscreen Line & Teams Setup */}
      {activeSubView === 'line-setup' && (
        <section id="unified-view-line-setup" className="animate-fadeIn">
          <LineConfigurationTeams
            lines={lines}
            onSaveLine={onSaveLine}
            onAddNewLine={onAddNewLine}
            onDeleteLine={onDeleteLine}
            onDeleteFloor={onDeleteFloor}
            onNavigate={onNavigate}
            profile={profile}
            initialFloorFilter={syncedFloor}
            onSwitchToFloorPlan={handleSwitchToFloorPlan}
            hideTopHeader={false}
          />
        </section>
      )}

      {/* Mode 3: Dedicated Factory & Industry Profile Setup */}
      {activeSubView === 'factory' && (
        <section id="unified-view-factory-setup" className="space-y-6 animate-fadeIn">
          {/* Active Enterprise Factory Showcase Card */}
          <div className="rounded-3xl border-2 border-[#176f78] bg-gradient-to-br from-[#176f78]/5 via-[#fbfaf6] to-white p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#176f78]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#176f78] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Factory className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
                      CURRENTLY ACTIVE ENTERPRISE PLANT
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white border border-[#d9d2c2] text-[#176f78] font-bold">
                      Code: {activeProfile.factoryCode || 'DBN-U02'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#17343a] tracking-tight font-display">
                    {activeProfile.name}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-[#527078] flex-wrap">
                    <span className="font-bold text-[#176f78]">{activeProfile.unitName}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#e7e1d5]/70 font-semibold text-[#17343a]">
                      {activeProfile.industrySector}
                    </span>
                    <span>•</span>
                    <span>{activeProfile.department || 'Industrial Engineering (IE) Dept.'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  id="btn-edit-active-factory-profile"
                  onClick={() => startEditFactory(activeProfile)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#176f78] hover:bg-[#125860] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Plant Profile</span>
                </button>
                <button
                  type="button"
                  id="btn-create-new-factory-profile"
                  onClick={startCreateNewFactory}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#f1eee6] border border-[#d9d2c2] text-[#17343a] text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#176f78]" />
                  <span>New Factory Profile</span>
                </button>
              </div>
            </div>

            {/* Plant Details Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 mt-5 border-t border-[#e7e1d5] text-xs relative z-10">
              <div className="p-3 rounded-2xl bg-white border border-[#e7e1d5]">
                <div className="text-[10px] uppercase font-bold text-[#527078] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#176f78]" /> Plant Location
                </div>
                <div className="font-semibold text-[#17343a] mt-0.5">
                  {activeProfile.addressLocation || 'Gorai, Mirzapur, Tangail / Gazipur'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#e7e1d5]">
                <div className="text-[10px] uppercase font-bold text-[#527078] flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#176f78]" /> Contact Email
                </div>
                <div className="font-semibold text-[#17343a] mt-0.5 truncate">
                  {activeProfile.contactEmail || 'ie.unit02@debonairgroupbd.com'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#e7e1d5]">
                <div className="text-[10px] uppercase font-bold text-[#527078] flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#176f78]" /> Operations Capacity
                </div>
                <div className="font-semibold text-[#17343a] mt-0.5">
                  {stats.totalLines} Lines in Layout • {stats.totalFloors} Floors
                </div>
                <div className="text-[10px] text-[#527078] font-medium mt-1">
                  Padma: 06 • Meghna: 06 • Karnophuli: 05 • Korotoya: 06 • Shitalokshya: 06 • Turag: 05
                </div>
              </div>
            </div>
          </div>

          {/* Inline Create / Edit Factory Form Modal / Section */}
          {isEditingFactory && (
            <div className="rounded-3xl border border-[#176f78] bg-white p-6 shadow-md space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#e7e1d5] pb-3">
                <div className="flex items-center gap-2">
                  <Factory className="w-5 h-5 text-[#176f78]" />
                  <h3 className="text-base font-bold text-[#17343a]">
                    {editingFactoryId ? 'Edit Factory & Industry Profile' : 'Create New Factory & Industry Profile'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingFactory(false)}
                  className="text-xs font-bold text-[#527078] hover:text-[#17343a] cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveFactoryForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17343a] mb-1">
                      Factory / Enterprise Name *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="e.g. Debonair LTD or Apex Footwear"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d9d2c2] text-xs font-semibold focus:outline-none focus:border-[#176f78]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17343a] mb-1">
                      Production Unit / Facility Name *
                    </label>
                    <input
                      type="text"
                      value={formUnitName}
                      onChange={e => setFormUnitName(e.target.value)}
                      placeholder="e.g. Unit-02 or Plant-01"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d9d2c2] text-xs font-semibold focus:outline-none focus:border-[#176f78]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17343a] mb-1">
                      Industry Sector / Product Classification
                    </label>
                    <select
                      value={formSector}
                      onChange={e => setFormSector(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d9d2c2] text-xs font-semibold focus:outline-none focus:border-[#176f78] bg-white"
                    >
                      {INDUSTRY_SECTORS.map(sec => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formSector === 'Custom Industrial Manufacturing' ? (
                    <div>
                      <label className="block text-xs font-bold text-[#17343a] mb-1">
                        Specify Custom Industry Sector *
                      </label>
                      <input
                        type="text"
                        value={formCustomSector}
                        onChange={e => setFormCustomSector(e.target.value)}
                        placeholder="e.g. Precision Robotics, Solar Cells"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d9d2c2] text-xs font-semibold focus:outline-none focus:border-[#176f78]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-[#17343a] mb-1">
                        Factory / Plant Code
                      </label>
                      <input
                        type="text"
                        value={formCode}
                        onChange={e => setFormCode(e.target.value)}
                        placeholder="e.g. DBN-U02"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d9d2c2] text-xs font-semibold uppercase focus:outline-none focus:border-[#176f78]"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17343a] mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formDepartment}
                      onChange={e => setFormDepartment(e.target.value)}
                      placeholder="Industrial Engineering (IE) Dept."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d9d2c2] text-xs font-semibold focus:outline-none focus:border-[#176f78]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17343a] mb-1">
                      Plant Address &amp; Location
                    </label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={e => setFormAddress(e.target.value)}
                      placeholder="City, District, Industrial Zone"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d9d2c2] text-xs font-semibold focus:outline-none focus:border-[#176f78]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17343a] mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      placeholder="ie.plant@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d9d2c2] text-xs font-semibold focus:outline-none focus:border-[#176f78]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingFactory(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#d9d2c2] text-xs font-bold text-[#527078] hover:bg-[#f1eee6] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#176f78] hover:bg-[#125860] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Factory &amp; Industry Profile</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Saved Factories & Enterprise Facilities Switcher Grid */}
          <div className="border border-[#d9d2c2] rounded-3xl p-6 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#e7e1d5] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#17343a] flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#176f78]" />
                  <span>Saved Enterprise Facilities &amp; Plants</span>
                </h3>
                <p className="text-xs text-[#527078]">
                  Switch between manufacturing units or configure custom industrial plant setups
                </p>
              </div>
              <button
                type="button"
                onClick={startCreateNewFactory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f1eee6] hover:bg-[#dceceb] text-[#176f78] border border-[#d9d2c2] text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Plant</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {factoryList.map(item => {
                const isActive = item.id === activeProfile.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectActiveFactory(item)}
                    className={`p-4 rounded-2xl border transition-all text-left relative cursor-pointer group ${
                      isActive
                        ? 'border-[#176f78] bg-[#dceceb]/30 shadow-xs ring-1 ring-[#176f78]'
                        : 'border-[#d9d2c2] bg-[#fbfaf6] hover:bg-white hover:border-[#176f78]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-[#17343a] group-hover:text-[#176f78] transition-colors truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white border border-[#d9d2c2] text-[#527078] font-bold shrink-0">
                            {item.unitName}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#527078] truncate">
                          {item.industrySector}
                        </div>
                        {item.addressLocation && (
                          <div className="text-[10px] text-[#527078]/80 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#176f78] shrink-0" />
                            <span>{item.addressLocation}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectActiveFactory(item);
                            }}
                            className="px-2 py-1 rounded-lg bg-white hover:bg-[#176f78] hover:text-white border border-[#d9d2c2] text-[10px] font-bold text-[#176f78] transition-colors"
                          >
                            Select
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditFactory(item);
                          }}
                          className="p-1 rounded-lg text-[#527078] hover:text-[#176f78] hover:bg-white transition-colors"
                          title="Edit plant profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {item.isCustom && !isActive && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteFactory(item.id, e)}
                            className="p-1 rounded-lg text-[#527078] hover:text-rose-600 hover:bg-white transition-colors"
                            title="Delete custom plant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Mode 4: Split Workstation View (Side-by-Side or Stacked) */}
      {activeSubView === 'split-view' && (
        <section id="unified-view-split" className="space-y-8 animate-fadeIn">
          {/* Top Half: Floor Plan */}
          <div className="border border-[#d9d2c2] rounded-3xl p-4 sm:p-6 bg-[#fbfaf6] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#e7e1d5] pb-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#176f78]" />
                <h2 className="text-lg font-bold text-[#17343a]">Visual Floor Plan Map</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubView('floor-plan')}
                className="text-xs font-bold text-[#176f78] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Expand Fullscreen Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <VisualFloorPlan
              lines={lines}
              onSaveLine={onSaveLine}
              onReorderLines={onReorderLines}
              onNavigate={onNavigate}
              activeDate={activeDate}
              profile={profile}
              initialFloor={syncedFloor}
              onSwitchToSetup={handleSwitchToSetup}
              hideTopHeader={false}
            />
          </div>

          {/* Bottom Half: Line & Team Configuration */}
          <div className="border border-[#d9d2c2] rounded-3xl p-4 sm:p-6 bg-[#fbfaf6] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#e7e1d5] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#176f78]" />
                <h2 className="text-lg font-bold text-[#17343a]">Line Configuration &amp; Teams</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubView('line-setup')}
                className="text-xs font-bold text-[#176f78] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Expand Fullscreen Setup</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <LineConfigurationTeams
              lines={lines}
              onSaveLine={onSaveLine}
              onAddNewLine={onAddNewLine}
              onDeleteLine={onDeleteLine}
              onDeleteFloor={onDeleteFloor}
              onNavigate={onNavigate}
              profile={profile}
              initialFloorFilter={syncedFloor}
              onSwitchToFloorPlan={handleSwitchToFloorPlan}
              hideTopHeader={false}
            />
          </div>
        </section>
      )}
    </div>
  );
};
