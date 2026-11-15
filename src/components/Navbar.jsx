import React from 'react';
import { 
  Heart, 
  Pill, 
  Calendar, 
  Activity, 
  Mail, 
  Bot, 
  Users, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Type, 
  Sun, 
  Moon, 
  KeyRound,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentRole,
  activeProfile,
  onOpenPasscode,
  onTriggerSos,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  voiceEnabled,
  setVoiceEnabled
}) {
  const tabs = [
    { id: 'medications', label: 'Medications', icon: Pill, badge: '5 Today' },
    { id: 'appointments', label: 'Appointments & Routines', icon: Calendar, badge: 'Nov 18' },
    { id: 'adherence', label: 'Adherence & Vitals', icon: Activity, badge: '98%' },
    { id: 'emails', label: 'Proactive Email Hub', icon: Mail, badge: 'Live' },
    { id: 'ai', label: 'Aura AI & Scanner', icon: Bot, badge: 'Smart' },
    { id: 'family', label: 'Family Peace of Mind', icon: Users, badge: 'Active' },
  ];

  const roleColors = {
    elder: 'bg-sky-100 text-sky-800 border-sky-300',
    caretaker: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    family: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  const roleLabels = {
    elder: 'Elderly Persona',
    caretaker: 'Caregiver / Nurse',
    family: 'Family Guardian'
  };

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('extra-large');
    else setFontSize('normal');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      
      {/* Top Banner / Utility Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            CarePulse Platform Active
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline">
            Shared Healthcare Ecosystem for Seniors, Caretakers & Family
          </span>
        </div>

        {/* Accessibility & Voice Controls */}
        <div className="flex items-center gap-3">
          {/* Font Size Toggle */}
          <button
            onClick={cycleFontSize}
            title="Adjust Font Size (Normal / Large / Extra Large)"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px]"
          >
            <Type className="w-3.5 h-3.5 text-sky-400" />
            <span>Size: {fontSize === 'extra-large' ? 'A++' : fontSize === 'large' ? 'A+' : 'A'}</span>
          </button>

          {/* High Contrast Mode */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            title="Toggle High-Contrast Accessibility Mode"
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition text-[11px] ${
              highContrast ? 'bg-amber-400 text-slate-900 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {highContrast ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-amber-400" />}
            <span>{highContrast ? 'High Contrast ON' : 'Contrast'}</span>
          </button>

          {/* Voice Guidance Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title="Toggle Spoken Voice Guidance"
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition text-[11px] ${
              voiceEnabled ? 'bg-sky-600 text-white font-medium' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice {voiceEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Heart className="w-6 h-6 fill-white stroke-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-heading tracking-tight text-slate-900">
                  Care<span className="text-sky-600">Pulse</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 rounded-full border border-sky-200">
                  Nexus
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Elderly Care & Smart Medication Management</p>
            </div>
          </div>

          {/* Middle: Patient Profile & Current Role Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Patient Badge */}
            <div className="hidden md:flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5">
              <img 
                src={activeProfile.avatar} 
                alt={activeProfile.name}
                className="w-8 h-8 rounded-full object-cover border border-sky-200 shadow-xs" 
              />
              <div className="text-left text-xs leading-tight">
                <div className="font-bold text-slate-800">{activeProfile.name}</div>
                <div className="text-slate-500 text-[11px]">Age {activeProfile.age} • Blood {activeProfile.bloodType}</div>
              </div>
            </div>

            {/* Current Role Indicator & Passcode Button */}
            <button
              onClick={onOpenPasscode}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-semibold shadow-xs transition hover:shadow ${
                roleColors[currentRole] || 'bg-slate-100 text-slate-700'
              }`}
              title="Click to switch persona with Passcode"
            >
              <KeyRound className="w-4 h-4" />
              <div className="text-left">
                <div className="text-[10px] opacity-75 uppercase leading-none">Access Mode</div>
                <div className="font-bold">{roleLabels[currentRole] || 'Select Role'}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>

            {/* Pulsing Emergency SOS Button */}
            <button
              onClick={onTriggerSos}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-extrabold text-sm shadow-lg shadow-rose-500/30 hover:from-rose-700 hover:to-red-700 active:scale-95 transition animate-sos-pulse"
              title="Press in case of medical emergency - dispatches alerts to family & caregivers"
            >
              <AlertTriangle className="w-4 h-4 fill-white" />
              <span>SOS ALERT</span>
            </button>

          </div>

        </div>

        {/* Navigation Tabs */}
        <nav className="mt-4 flex space-x-1 sm:space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
