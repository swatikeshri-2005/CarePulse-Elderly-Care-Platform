import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame, 
  Heart, 
  Plus, 
  Calendar, 
  Filter, 
  Sparkles,
  TrendingUp,
  Droplet
} from 'lucide-react';
import { audio } from '../utils/speech';

export default function AdherenceAndVitalsView({
  adherenceLogs,
  activeProfile,
  onRefresh
}) {
  const [vitals, setVitals] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [vitalType, setVitalType] = useState('blood_pressure');
  const [bpForm, setBpForm] = useState({ systolic: 122, diastolic: 78, pulse: 70, notes: 'Resting BP seated' });
  const [sugarForm, setSugarForm] = useState({ value: 110, context: 'Fasting Morning', notes: 'Before breakfast' });

  // Fetch vitals
  const loadVitals = () => {
    fetch('/api/vitals')
      .then(res => res.json())
      .then(data => setVitals(data))
      .catch(err => console.warn('Vitals fetch err:', err));
  };

  useEffect(() => {
    loadVitals();
  }, []);

  const handleSaveVital = async (e) => {
    e.preventDefault();
    const payload = vitalType === 'blood_pressure' 
      ? {
          profileId: activeProfile.id,
          type: 'blood_pressure',
          systolic: Number(bpForm.systolic),
          diastolic: Number(bpForm.diastolic),
          pulse: Number(bpForm.pulse),
          status: bpForm.systolic > 140 ? 'elevated' : 'normal',
          loggedBy: 'Self / Family Caregiver',
          notes: bpForm.notes
        }
      : {
          profileId: activeProfile.id,
          type: 'blood_sugar',
          value: Number(sugarForm.value),
          unit: 'mg/dL',
          context: sugarForm.context,
          status: sugarForm.value > 140 ? 'elevated' : 'optimal',
          loggedBy: 'Self / Family Caregiver',
          notes: sugarForm.notes
        };

    try {
      await fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setShowVitalModal(false);
      audio.playChime('success');
      loadVitals();
    } catch {
      console.warn('Error saving vital');
    }
  };

  // Filter logs
  const filteredLogs = adherenceLogs.filter(log => {
    if (filterStatus === 'all') return true;
    return log.status === filterStatus;
  });

  const takenCount = adherenceLogs.filter(l => l.status === 'taken').length;
  const totalCount = adherenceLogs.length || 1;
  const complianceRate = Math.round((takenCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-pink-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-rose-200 mb-2">
            <Activity className="w-4 h-4 text-rose-300" />
            <span>Adherence Telemetry & Vital Signs Monitor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Medication Adherence & Health Metrics
          </h1>
          <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-xl">
            Audit logs and biometric readings for <strong>{activeProfile.name}</strong>. Transparent tracking ensures healthcare routines are never overlooked.
          </p>
        </div>

        <button
          onClick={() => setShowVitalModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-rose-900 font-extrabold text-sm shadow-lg hover:bg-rose-50 active:scale-95 transition shrink-0"
        >
          <Plus className="w-5 h-5 text-rose-700 stroke-[3]" />
          <span>Record New Vitals</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Adherence Rate</span>
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black font-heading text-slate-900">
            {complianceRate}%
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            Excellent • Exceeds AHA Target (80%)
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Consecutive Streak</span>
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </span>
          </div>
          <div className="text-3xl font-black font-heading text-slate-900">
            14 Days
          </div>
          <p className="text-xs text-amber-700 font-semibold mt-1">
            Zero missed doses in 2 weeks!
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Last Blood Pressure</span>
            <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <Heart className="w-4 h-4 text-rose-600" />
            </span>
          </div>
          <div className="text-3xl font-black font-heading text-slate-900">
            124/78
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            mmHg (Pulse: 71 bpm) • Normal
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Fasting Blood Glucose</span>
            <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <Droplet className="w-4 h-4 text-sky-600" />
            </span>
          </div>
          <div className="text-3xl font-black font-heading text-slate-900">
            112
          </div>
          <p className="text-xs text-sky-700 font-semibold mt-1">
            mg/dL • Well controlled on Metformin
          </p>
        </div>

      </div>

      {/* Recent Vitals Logs Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 font-heading mb-3">
          Biometric Telemetry Stream
        </h2>
        <div className="space-y-3">
          {vitals.map((v) => (
            <div key={v.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  v.type === 'blood_pressure' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                }`}>
                  {v.type === 'blood_pressure' ? 'BP' : 'GLU'}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {v.type === 'blood_pressure' ? `${v.systolic}/${v.diastolic} mmHg` : `${v.value} ${v.unit}`}
                  </div>
                  <div className="text-slate-500">
                    {v.notes || (v.type === 'blood_pressure' ? `Pulse: ${v.pulse} bpm` : v.context)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-400">
                <span>{v.loggedBy || 'Logged'}</span>
                <span className="font-mono text-[11px] text-slate-500">{new Date(v.timestamp).toLocaleString()}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {v.status || 'Normal'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medication Adherence Audit Log */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Adherence Audit Trail
            </h2>
            <p className="text-xs text-slate-500">
              Verified record of every dose taken, snoozed, or skipped.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs">
            {['all', 'taken', 'pending', 'skipped'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[11px] transition ${
                  filterStatus === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isTaken = log.status === 'taken';
            const isSkipped = log.status === 'skipped';

            return (
              <div
                key={log.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  isTaken ? 'bg-emerald-50/50 border-emerald-200' : isSkipped ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isTaken ? 'bg-emerald-500 text-white' : isSkipped ? 'bg-rose-500 text-white' : 'bg-amber-400 text-slate-900'
                  }`}>
                    {isTaken ? '✓' : isSkipped ? '✕' : '⏳'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{log.medicationName}</div>
                    <div className="text-slate-500">{log.notes || `Scheduled for ${log.scheduledTime}`}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono text-[11px]">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : log.scheduledTime}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    isTaken ? 'bg-emerald-100 text-emerald-800' : isSkipped ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Vitals Modal */}
      {showVitalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold font-heading text-slate-900">
                Log New Health Reading
              </h3>
              <button
                type="button"
                onClick={() => setShowVitalModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Metric Type Picker */}
            <div className="flex gap-2 my-4">
              <button
                type="button"
                onClick={() => setVitalType('blood_pressure')}
                className={`flex-1 py-2 rounded-xl font-bold text-xs transition ${
                  vitalType === 'blood_pressure' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Blood Pressure
              </button>
              <button
                type="button"
                onClick={() => setVitalType('blood_sugar')}
                className={`flex-1 py-2 rounded-xl font-bold text-xs transition ${
                  vitalType === 'blood_sugar' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Blood Glucose
              </button>
            </div>

            <form onSubmit={handleSaveVital} className="space-y-4 text-xs">
              {vitalType === 'blood_pressure' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Systolic (mmHg)</label>
                      <input
                        type="number"
                        required
                        value={bpForm.systolic}
                        onChange={(e) => setBpForm({ ...bpForm, systolic: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Diastolic (mmHg)</label>
                      <input
                        type="number"
                        required
                        value={bpForm.diastolic}
                        onChange={(e) => setBpForm({ ...bpForm, diastolic: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pulse (BPM)</label>
                    <input
                      type="number"
                      value={bpForm.pulse}
                      onChange={(e) => setBpForm({ ...bpForm, pulse: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Observation Notes</label>
                    <input
                      type="text"
                      value={bpForm.notes}
                      onChange={(e) => setBpForm({ ...bpForm, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Glucose Level (mg/dL)</label>
                    <input
                      type="number"
                      required
                      value={sugarForm.value}
                      onChange={(e) => setSugarForm({ ...sugarForm, value: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Timing Context</label>
                    <select
                      value={sugarForm.context}
                      onChange={(e) => setSugarForm({ ...sugarForm, context: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    >
                      <option value="Fasting Morning">Fasting Morning (Pre-meal)</option>
                      <option value="Post-Prandial (2h after meal)">Post-Prandial (2h after meal)</option>
                      <option value="Bedtime">Bedtime</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVitalModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold shadow-md"
                >
                  Save Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
