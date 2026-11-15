import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PasscodeModal from './components/PasscodeModal';
import EmergencyModal from './components/EmergencyModal';
import ElderlyPillboxView from './components/ElderlyPillboxView';
import CaretakerManagementView from './components/CaretakerManagementView';
import FamilyPeaceOfMindView from './components/FamilyPeaceOfMindView';
import AppointmentsAndRoutinesView from './components/AppointmentsAndRoutinesView';
import EmailNotificationHub from './components/EmailNotificationHub';
import AuraAiCompanion from './components/AuraAiCompanion';
import AdherenceAndVitalsView from './components/AdherenceAndVitalsView';
import { audio } from './utils/speech';

export default function App() {
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [currentRole, setCurrentRole] = useState('elder'); // 'elder' | 'caretaker' | 'family'
  const [activeTab, setActiveTab] = useState('medications');
  
  // Data states
  const [medications, setMedications] = useState([]);
  const [adherenceLogs, setAdherenceLogs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Accessibility
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [fontSize, setFontSize] = useState('large'); // 'normal' | 'large' | 'extra-large'
  const [highContrast, setHighContrast] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Load profiles
  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => {
        setProfiles(data.profiles || []);
        if (data.profiles && data.profiles.length > 0) {
          setActiveProfile(data.profiles[0]);
        }
      })
      .catch(err => console.warn('Profile fetch err:', err));
  }, []);

  // Load profile specific data
  const loadData = () => {
    if (!activeProfile) return;
    const pid = activeProfile.id;

    Promise.all([
      fetch(`/api/medications?profileId=${pid}`).then(r => r.json()),
      fetch(`/api/adherence-logs?profileId=${pid}`).then(r => r.json()),
      fetch(`/api/appointments?profileId=${pid}`).then(r => r.json()),
      fetch(`/api/routines?profileId=${pid}`).then(r => r.json())
    ])
      .then(([meds, logs, apts, rts]) => {
        setMedications(meds || []);
        setAdherenceLogs(logs.logs || []);
        setAppointments(apts || []);
        setRoutines(rts || []);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Data load err:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (activeProfile) {
      loadData();
    }
  }, [activeProfile]);

  // Handle Taking Medication
  const handleTakeMedication = async (medId, timeSlot = 'morning', notes = '') => {
    try {
      const res = await fetch(`/api/medications/${medId}/take`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loggedBy: `${activeProfile.name} (Elder)`,
          timeSlot,
          notes
        })
      });
      const data = await res.json();
      if (res.ok) {
        audio.playChime('success');
        if (voiceEnabled) {
          const med = medications.find(m => m.id === medId);
          audio.speak(`Great job ${activeProfile.name.split(' ')[0]}! ${med ? med.name : 'Medication'} marked as taken.`);
        }
        loadData();
      }
    } catch (e) {
      console.warn('Take med error:', e);
    }
  };

  // Snooze Medication
  const handleSnoozeMedication = async (medId, minutes = 15) => {
    try {
      const res = await fetch(`/api/medications/${medId}/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes })
      });
      if (res.ok) {
        audio.playChime('reminder');
        if (voiceEnabled) audio.speak(`Snoozed for ${minutes} minutes. We will remind you shortly.`);
        loadData();
      }
    } catch (e) {
      console.warn('Snooze med error:', e);
    }
  };

  // Skip Medication
  const handleSkipMedication = async (medId, reason) => {
    try {
      const res = await fetch(`/api/medications/${medId}/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.warn('Skip med error:', e);
    }
  };

  // Add Medication
  const handleAddMedication = async (medData) => {
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medData)
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.warn('Add med error:', e);
    }
  };

  // Delete Medication
  const handleDeleteMedication = async (medId) => {
    try {
      const res = await fetch(`/api/medications/${medId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.warn('Delete med error:', e);
    }
  };

  // Add Appointment
  const handleAddAppointment = async (aptData) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aptData)
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.warn('Add appointment error:', e);
    }
  };

  // Passcode verification handler
  const handleVerifyPasscode = (result) => {
    setCurrentRole(result.role);
    if (result.role === 'caretaker') {
      audio.speak('Welcome Nurse David. Caregiver clinical management mode active.');
    } else if (result.role === 'family') {
      audio.speak('Welcome Sarah. Family peace of mind mode active.');
    } else {
      audio.speak(`Welcome back ${activeProfile.name.split(' ')[0]}. Elderly assistance mode active.`);
    }
  };

  if (!activeProfile || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-sky-500 flex items-center justify-center animate-pulse">
          <span className="text-2xl font-bold">CP</span>
        </div>
        <div className="text-lg font-bold font-heading">Initializing CarePulse Ecosystem...</div>
        <div className="text-xs text-slate-400">Loading healthcare profiles & automated notification engine</div>
      </div>
    );
  }

  // Dynamic root font size style class
  const fontSizeClass = fontSize === 'extra-large' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm';

  return (
    <div className={`min-h-screen ${highContrast ? 'high-contrast bg-black text-white' : 'bg-slate-50 text-slate-800'} ${fontSizeClass}`}>
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        activeProfile={activeProfile}
        onOpenPasscode={() => setIsPasscodeOpen(true)}
        onTriggerSos={() => setIsSosOpen(true)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
      />

      {/* Main App Content View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Render Tab Views */}
        {activeTab === 'medications' && (
          currentRole === 'caretaker' ? (
            <CaretakerManagementView
              medications={medications}
              onAddMedication={handleAddMedication}
              onDeleteMedication={handleDeleteMedication}
              activeProfile={activeProfile}
              onRefresh={loadData}
              onOpenAppointments={() => setActiveTab('appointments')}
            />
          ) : (
            <ElderlyPillboxView
              medications={medications}
              adherenceLogs={adherenceLogs}
              activeProfile={activeProfile}
              onTakeMedication={handleTakeMedication}
              onSnoozeMedication={handleSnoozeMedication}
              onSkipMedication={handleSkipMedication}
              onRefresh={loadData}
              fontSize={fontSize}
              highContrast={highContrast}
              voiceEnabled={voiceEnabled}
            />
          )
        )}

        {activeTab === 'appointments' && (
          <AppointmentsAndRoutinesView
            appointments={appointments}
            routines={routines}
            activeProfile={activeProfile}
            onAddAppointment={handleAddAppointment}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'adherence' && (
          <AdherenceAndVitalsView
            adherenceLogs={adherenceLogs}
            activeProfile={activeProfile}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'emails' && (
          <EmailNotificationHub
            activeProfile={activeProfile}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'ai' && (
          <AuraAiCompanion
            activeProfile={activeProfile}
            medications={medications}
            onAddMedication={handleAddMedication}
          />
        )}

        {activeTab === 'family' && (
          <FamilyPeaceOfMindView
            activeProfile={activeProfile}
            adherenceLogs={adherenceLogs}
            medications={medications}
          />
        )}

      </main>

      {/* Passcode Role Switcher Modal */}
      <PasscodeModal
        isOpen={isPasscodeOpen}
        onClose={() => setIsPasscodeOpen(false)}
        onVerify={handleVerifyPasscode}
        activeProfile={activeProfile}
        profiles={profiles}
        onSelectProfile={(p) => setActiveProfile(p)}
      />

      {/* Emergency SOS Modal */}
      <EmergencyModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        activeProfile={activeProfile}
      />

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200/60 bg-white/50 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">CarePulse Health Platform</span>
            <span>•</span>
            <span>PromptWars x Catalyst Challenge</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Passcode Protected Shared Ecosystem</span>
            <span>•</span>
            <span>Automated Email Guardian</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
