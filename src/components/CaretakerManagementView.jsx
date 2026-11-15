import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Activity, 
  Package, 
  Send, 
  Trash2, 
  Edit3, 
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { audio } from '../utils/speech';

export default function CaretakerManagementView({
  medications,
  onAddMedication,
  onDeleteMedication,
  activeProfile,
  onRefresh,
  onOpenAppointments
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [interactionData, setInteractionData] = useState(null);
  const [refillStatus, setRefillStatus] = useState({});
  const [vitalForm, setVitalForm] = useState({
    systolic: 124,
    diastolic: 78,
    pulse: 72,
    glucose: 110,
    notes: 'Resting BP measured after 10 min calm seated period'
  });
  const [vitalSuccess, setVitalSuccess] = useState('');

  // New medication form state
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    form: 'Tablet',
    color: '#0284c7',
    shape: 'round',
    purpose: '',
    instructions: 'Take once daily with water.',
    withFood: 'With breakfast',
    frequency: 'Daily',
    time: '08:00',
    remainingPills: 30,
    totalPills: 30,
    refillThreshold: 7,
    prescribedBy: 'Dr. Eleanor Vance',
    rxNumber: 'RX-' + Math.floor(100000 + Math.random() * 900000)
  });

  // Fetch drug interaction analysis
  useEffect(() => {
    fetch('/api/interaction-check')
      .then(res => res.json())
      .then(data => setInteractionData(data))
      .catch(err => console.warn('Interaction check err:', err));
  }, [medications]);

  // Handle adding new medication
  const handleSubmitMed = (e) => {
    e.preventDefault();
    if (!newMed.name || !newMed.dosage) return;

    onAddMedication({
      ...newMed,
      profileId: activeProfile.id,
      times: [newMed.time]
    });

    setShowAddModal(false);
    setNewMed({
      name: '',
      dosage: '',
      form: 'Tablet',
      color: '#0284c7',
      shape: 'round',
      purpose: '',
      instructions: 'Take once daily with water.',
      withFood: 'With breakfast',
      frequency: 'Daily',
      time: '08:00',
      remainingPills: 30,
      totalPills: 30,
      refillThreshold: 7,
      prescribedBy: 'Dr. Eleanor Vance',
      rxNumber: 'RX-' + Math.floor(100000 + Math.random() * 900000)
    });
    audio.playChime('success');
  };

  // 1-Click Pharmacy Refill Order simulation
  const handleOrderRefill = async (med) => {
    setRefillStatus(prev => ({ ...prev, [med.id]: 'Ordering...' }));
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: activeProfile.id,
          to: 'orders@walgreens-pharmacy-sample.com',
          toName: 'Walgreens Pharmacy #4410',
          subject: `Prescription Refill Request: ${med.name} ${med.dosage} (${med.rxNumber})`,
          type: 'refill_order',
          content: `Automated Refill Request via CarePulse System:\n\nPatient: ${activeProfile.name} (DOB: 1948)\nMedication: ${med.name} ${med.dosage}\nRx Number: ${med.rxNumber}\nPrescribing Physician: ${med.prescribedBy}\nCurrent Remaining Stock: ${med.remainingPills} pills\n\nPlease prepare 30-day supply for home delivery to ${activeProfile.address}.`
        })
      });
      if (res.ok) {
        setRefillStatus(prev => ({ ...prev, [med.id]: 'Refill Queued! Email Sent' }));
        audio.playChime('success');
      }
    } catch {
      setRefillStatus(prev => ({ ...prev, [med.id]: 'Error ordering' }));
    }
  };

  // Submit Vitals
  const handleLogVital = async (e) => {
    e.preventDefault();
    setVitalSuccess('');
    try {
      await fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: activeProfile.id,
          type: 'blood_pressure',
          systolic: Number(vitalForm.systolic),
          diastolic: Number(vitalForm.diastolic),
          pulse: Number(vitalForm.pulse),
          status: vitalForm.systolic > 140 ? 'elevated' : 'normal',
          loggedBy: 'David Martinez, RN (Visiting Nurse)',
          notes: vitalForm.notes
        })
      });
      setVitalSuccess('Clinical vitals recorded & saved to patient chart.');
      audio.playChime('success');
      if (onRefresh) onRefresh();
    } catch (e) {
      console.warn('Vital record err:', e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Caretaker Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-emerald-200 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Clinical Caregiver & Nurse Portal • David Martinez, RN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Medication Regimen & Care Management
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            Managing patient <strong>{activeProfile.name}</strong>. Add or adjust medications, monitor pill inventory, review drug interactions, and log clinical observations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-900 font-extrabold text-sm shadow-lg hover:bg-emerald-50 active:scale-95 transition shrink-0"
        >
          <Plus className="w-5 h-5 text-emerald-700 stroke-[3]" />
          <span>Add New Medication</span>
        </button>
      </div>

      {/* Drug Interaction & Safety Scorecard */}
      {interactionData && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                {interactionData.safetyScore}%
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-heading">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Clinical Drug Interaction & Safety Analysis
                </h2>
                <p className="text-xs text-slate-500">
                  Automated cross-analysis across all {interactionData.totalMedicationsChecked} active prescriptions.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {interactionData.overallSafetyRating}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {interactionData.activeInteractions.map((inter, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Interaction: {inter.drugs.join(' ↔ ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-800 text-[10px]">
                    {inter.severity} ({inter.status})
                  </span>
                </div>
                <p className="text-amber-800 mb-1.5">{inter.description}</p>
                <div className="text-amber-900 font-semibold bg-white/70 p-2 rounded-xl border border-amber-200/60">
                  💡 Clinical Recommendation: {inter.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pill Inventory & Refill Dashboard */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-600" />
              Medication Inventory & Refill Tracker
            </h2>
            <p className="text-xs text-slate-500">
              Automatic supply decrement upon dosage confirmation. Low supply threshold proactively alerts pharmacy & nurse.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map((med) => {
            const isLow = med.remainingPills <= med.refillThreshold;
            const percentRemaining = Math.round((med.remainingPills / med.totalPills) * 100);

            return (
              <div
                key={med.id}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  isLow 
                    ? 'border-amber-300 bg-amber-50/40 shadow-xs' 
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{med.name}</div>
                    <div className="text-xs text-slate-500">{med.dosage} • {med.purpose}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                      isLow ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {med.remainingPills} left
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isLow ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentRemaining}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                  <span>Rx: {med.rxNumber}</span>
                  <span>Refill trigger: &lt;{med.refillThreshold}</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => handleOrderRefill(med)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{refillStatus[med.id] || 'Order Pharmacy Refill'}</span>
                  </button>

                  <button
                    onClick={() => onDeleteMedication(med.id)}
                    title="Remove medication"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Observations & Vitals Entry */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 font-heading mb-1 flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-500" />
          Clinical Vitals & In-Person Observation Log
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Recorded by visiting caregivers. High blood pressure automatically triggers alert emails to Dr. Vance.
        </p>

        {vitalSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{vitalSuccess}</span>
          </div>
        )}

        <form onSubmit={handleLogVital} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Systolic BP (mmHg)</label>
            <input
              type="number"
              value={vitalForm.systolic}
              onChange={(e) => setVitalForm({ ...vitalForm, systolic: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Diastolic BP (mmHg)</label>
            <input
              type="number"
              value={vitalForm.diastolic}
              onChange={(e) => setVitalForm({ ...vitalForm, diastolic: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pulse (BPM)</label>
            <input
              type="number"
              value={vitalForm.pulse}
              onChange={(e) => setVitalForm({ ...vitalForm, pulse: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Record Vitals Now</span>
            </button>
          </div>
        </form>
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                Add Medication to Regimen
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMed} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Drug Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amlodipine"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosage *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 mg"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Form</label>
                  <select
                    value={newMed.form}
                    onChange={(e) => setNewMed({ ...newMed, form: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Oval Tablet">Oval Tablet</option>
                    <option value="Liquid Syrup">Liquid Syrup</option>
                    <option value="Inhaler">Inhaler</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shape</label>
                  <select
                    value={newMed.shape}
                    onChange={(e) => setNewMed({ ...newMed, shape: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium"
                  >
                    <option value="round">Round</option>
                    <option value="oval">Oval</option>
                    <option value="capsule">Capsule</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pill Color</label>
                  <input
                    type="color"
                    value={newMed.color}
                    onChange={(e) => setNewMed({ ...newMed, color: e.target.value })}
                    className="w-full h-9 p-1 border border-slate-300 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Medical Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. For Blood Pressure & Arterial Health"
                  value={newMed.purpose}
                  onChange={(e) => setNewMed({ ...newMed, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Time</label>
                  <input
                    type="time"
                    value={newMed.time}
                    onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Meal Instruction</label>
                  <input
                    type="text"
                    value={newMed.withFood}
                    onChange={(e) => setNewMed({ ...newMed, withFood: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Senior-Friendly Instructions</label>
                <textarea
                  rows={2}
                  value={newMed.instructions}
                  onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Pill Count</label>
                  <input
                    type="number"
                    value={newMed.remainingPills}
                    onChange={(e) => setNewMed({ ...newMed, remainingPills: Number(e.target.value), totalPills: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Refill Alert Threshold</label>
                  <input
                    type="number"
                    value={newMed.refillThreshold}
                    onChange={(e) => setNewMed({ ...newMed, refillThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
