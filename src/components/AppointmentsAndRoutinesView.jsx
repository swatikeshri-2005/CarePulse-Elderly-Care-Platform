import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  FileText, 
  CheckCircle, 
  Plus, 
  Droplet, 
  Footprints, 
  Activity, 
  Send, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { audio } from '../utils/speech';

export default function AppointmentsAndRoutinesView({
  appointments,
  routines,
  activeProfile,
  onAddAppointment,
  onToggleRoutine,
  onRefresh
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [emailStatus, setEmailStatus] = useState({});
  const [waterGlasses, setWaterGlasses] = useState(5);
  const [walkDone, setWalkDone] = useState(true);

  // New appointment form state
  const [newApt, setNewApt] = useState({
    doctorName: 'Dr. Eleanor Vance, MD',
    specialty: 'Cardiology & Vascular Health',
    clinic: 'St. Jude Heart Center, Suite 402',
    address: '450 Medical Way, Springfield',
    dateTime: '2026-11-28T10:00',
    purpose: 'Routine Follow-up & Medication Review',
    prepNotes: 'Bring medication logbook and fast for 2 hours prior.',
    companionAssigned: 'Sarah Wilson (Daughter)'
  });

  const handleSendReminder = async (apt) => {
    setEmailStatus(prev => ({ ...prev, [apt.id]: 'Sending...' }));
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: activeProfile.id,
          to: activeProfile.emergencyContact.email,
          toName: activeProfile.emergencyContact.name,
          subject: `📅 Appointment Reminder: ${apt.doctorName} on ${new Date(apt.dateTime).toLocaleDateString()}`,
          type: 'appointment_reminder',
          content: `CarePulse Doctor Appointment Reminder:\n\nPatient: ${activeProfile.name}\nDoctor: ${apt.doctorName} (${apt.specialty})\nClinic: ${apt.clinic}\nAddress: ${apt.address}\nDate & Time: ${new Date(apt.dateTime).toLocaleString()}\nPurpose: ${apt.purpose}\n\nPre-Visit Preparation:\n${apt.prepNotes}\n\nCompanion Assigned: ${apt.companionAssigned}`
        })
      });
      if (res.ok) {
        setEmailStatus(prev => ({ ...prev, [apt.id]: 'Email Dispatched!' }));
        audio.playChime('success');
      }
    } catch {
      setEmailStatus(prev => ({ ...prev, [apt.id]: 'Error sending' }));
    }
  };

  const handleSubmitApt = (e) => {
    e.preventDefault();
    onAddAppointment({
      ...newApt,
      profileId: activeProfile.id
    });
    setShowAddModal(false);
    audio.playChime('success');
  };

  const handleAddWater = () => {
    if (waterGlasses < 8) {
      const next = waterGlasses + 1;
      setWaterGlasses(next);
      audio.playChime('success');
      if (next === 8) {
        audio.speak('Congratulations Margaret! You reached your daily hydration goal of 8 glasses of water.');
      } else {
        audio.speak(`Great job drinking water! That is glass number ${next} of 8.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-sky-200 mb-2">
            <Calendar className="w-4 h-4 text-sky-300" />
            <span>Healthcare Appointments & Daily Habits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Doctor Appointments & Daily Routines
          </h1>
          <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-xl">
            Keep healthcare visits organized with pre-visit prep instructions, companion assignments, and proactive email notifications.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-900 font-extrabold text-sm shadow-lg hover:bg-sky-50 active:scale-95 transition shrink-0"
        >
          <Plus className="w-5 h-5 text-indigo-700 stroke-[3]" />
          <span>Schedule New Appointment</span>
        </button>
      </div>

      {/* Daily Healthcare Routines & Habits Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Daily Healthcare Habits & Vitals Routine
            </h2>
            <p className="text-xs text-slate-500">
              Essential non-medication routines that maintain cognitive and physical health.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Hydration Tracker */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sky-900 text-sm flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-sky-600 fill-sky-500" />
                  Hydration Goal
                </span>
                <span className="text-xs font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                  {waterGlasses} / 8 Glasses
                </span>
              </div>
              <p className="text-xs text-sky-700 mb-4">
                Crucial for seniors taking Metformin and Lisinopril to safeguard kidney filtration.
              </p>
            </div>

            {/* Glasses Visual */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                  <div
                    key={g}
                    className={`h-8 flex-1 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      g <= waterGlasses
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-sky-200/60 text-sky-400'
                    }`}
                  >
                    🥛
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddWater}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                + Drink 1 Glass (Record)
              </button>
            </div>
          </div>

          {/* Morning Walk */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-emerald-600" />
                  Gentle Morning Walk
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-md ${walkDone ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                  {walkDone ? 'Completed' : 'Pending'}
                </span>
              </div>
              <p className="text-xs text-emerald-700 mb-4">
                20-minute gentle garden walk recommended by Dr. Brody for knee joint lubrication.
              </p>
            </div>

            <button
              onClick={() => {
                setWalkDone(!walkDone);
                audio.playChime('success');
                if (!walkDone) audio.speak('Great work completing your morning walk! Exercise keeps your heart strong.');
              }}
              className={`w-full py-2 font-bold text-xs rounded-xl shadow-xs transition ${
                walkDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-emerald-100'
              }`}
            >
              {walkDone ? '✓ Walk Completed Today' : 'Mark Walk as Done'}
            </button>
          </div>

          {/* Morning Vitals Check */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-purple-900 text-sm flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-600" />
                  Morning BP & Pulse Check
                </span>
                <span className="text-xs font-black bg-purple-200 text-purple-800 px-2 py-0.5 rounded-md">
                  124/78 mmHg
                </span>
              </div>
              <p className="text-xs text-purple-700 mb-4">
                Recorded at 8:32 AM by visiting Nurse David Martinez. Within optimal target range.
              </p>
            </div>

            <div className="p-2 bg-white/80 rounded-xl border border-purple-200 text-center text-xs font-bold text-purple-900">
              ✓ Optimal Heart Health
            </div>
          </div>

        </div>
      </div>

      {/* Upcoming Appointments Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 font-heading">
          Upcoming Medical Appointments ({appointments.filter(a => a.status === 'confirmed').length})
        </h2>

        {appointments
          .filter(a => a.status === 'confirmed')
          .map((apt) => {
            const dateObj = new Date(apt.dateTime);
            const isNear = (dateObj - new Date()) / (1000 * 60 * 60 * 24) <= 3;

            return (
              <div
                key={apt.id}
                className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Left Column: Date Callout & Details */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-indigo-700 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold uppercase">{dateObj.toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-2xl font-black">{dateObj.getDate()}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xl font-bold font-heading text-slate-900">
                          {apt.doctorName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200">
                          {apt.specialty}
                        </span>
                        {isNear && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300 animate-pulse">
                            In 3 Days
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({apt.duration})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {apt.clinic} ({apt.address})
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-700 pt-1">
                        Purpose: <span className="font-normal">{apt.purpose}</span>
                      </p>

                      {/* Preparation Notes Box */}
                      {apt.prepNotes && (
                        <div className="mt-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Pre-Visit Preparation: </span>
                            {apt.prepNotes}
                          </div>
                        </div>
                      )}

                      {/* Companion Badge */}
                      <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Companion Assigned: <strong>{apt.companionAssigned}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleSendReminder(apt)}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{emailStatus[apt.id] || 'Send Email Reminder'}</span>
                    </button>

                    <button
                      onClick={() => {
                        audio.speak(`Appointment with ${apt.doctorName} is on ${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString()}. ${apt.prepNotes}`);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                    >
                      Read Aloud
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
      </div>

      {/* Past Appointment History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 font-heading mb-3">
          Past Consultation History & Summaries
        </h2>
        <div className="space-y-3">
          {appointments
            .filter(a => a.status === 'completed')
            .map((past) => (
              <div key={past.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                  <span>{past.doctorName} ({past.specialty})</span>
                  <span className="text-slate-500 font-normal">{new Date(past.dateTime).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-600 mb-2">Purpose: {past.purpose}</p>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700">
                  <span className="font-bold text-emerald-700">Doctor Summary: </span>
                  {past.summary}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Schedule New Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Schedule Doctor Appointment
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitApt} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    value={newApt.doctorName}
                    onChange={(e) => setNewApt({ ...newApt, doctorName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    value={newApt.specialty}
                    onChange={(e) => setNewApt({ ...newApt, specialty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinic / Hospital & Address</label>
                <input
                  type="text"
                  value={newApt.clinic}
                  onChange={(e) => setNewApt({ ...newApt, clinic: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newApt.dateTime}
                    onChange={(e) => setNewApt({ ...newApt, dateTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Companion Assigned</label>
                  <input
                    type="text"
                    value={newApt.companionAssigned}
                    onChange={(e) => setNewApt({ ...newApt, companionAssigned: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  value={newApt.purpose}
                  onChange={(e) => setNewApt({ ...newApt, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pre-Appointment Preparation (Checklist / Fasting)</label>
                <textarea
                  rows={2}
                  value={newApt.prepNotes}
                  onChange={(e) => setNewApt({ ...newApt, prepNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
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
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md"
                >
                  Confirm Appointment & Notify Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
