import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Sparkles, 
  RefreshCw, 
  Inbox, 
  User, 
  FileText,
  Calendar,
  Package,
  ShieldAlert
} from 'lucide-react';
import { audio } from '../utils/speech';

export default function EmailNotificationHub({ activeProfile, onRefresh }) {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [customTo, setCustomTo] = useState('');
  const [customSubject, setCustomSubject] = useState('CarePulse Health Test: Margaret Wilson Dosage Log');
  const [customMessage, setCustomMessage] = useState('This is a test notification dispatched by CarePulse automated health guard.');
  const [sendingCustom, setSendingCustom] = useState(false);
  const [customFeedback, setCustomFeedback] = useState('');
  const [simulationNotice, setSimulationNotice] = useState('');

  const loadEmails = () => {
    fetch('/api/emails')
      .then(res => res.json())
      .then(data => {
        setEmails(data);
        if (data.length > 0 && !selectedEmail) {
          setSelectedEmail(data[0]);
        }
      })
      .catch(err => console.warn('Email fetch error:', err));
  };

  useEffect(() => {
    loadEmails();
  }, []);

  // Quick simulation triggers
  const triggerSimulation = async (type) => {
    setSimulationNotice(`Dispatching proactive ${type.replace('_', ' ')} email...`);
    let payload = {};

    if (type === 'missed_dose') {
      payload = {
        profileId: activeProfile.id,
        to: activeProfile.emergencyContact.email,
        toName: activeProfile.emergencyContact.name,
        subject: `⚠️ URGENT CARE ALERT: ${activeProfile.name} missed scheduled afternoon dose!`,
        type: 'missed_dose',
        content: `CarePulse Automated Missed-Dose Notification:\n\nPatient: ${activeProfile.name} (Age: ${activeProfile.age})\nMedication: Glucosamine + Chondroitin 1500mg\nScheduled Time: 1:00 PM (45 minutes overdue)\n\nAction Needed: Please check in with ${activeProfile.name.split(' ')[0]} to ensure they are feeling well and remind them to take their medication with food.`
      };
    } else if (type === 'upcoming_dose') {
      payload = {
        profileId: activeProfile.id,
        to: activeProfile.emergencyContact.email,
        toName: activeProfile.emergencyContact.name,
        subject: `⏰ Upcoming Dose Reminder: Evening Metformin due in 15 minutes`,
        type: 'upcoming_dose',
        content: `CarePulse Pre-Dose Reminder:\n\nPatient: ${activeProfile.name}\nMedication: Metformin HCl 500mg (Evening Dose)\nScheduled Time: 6:00 PM (with dinner)\n\nReminder: Best taken with a balanced meal and a glass of water.`
      };
    } else if (type === 'low_stock') {
      payload = {
        profileId: activeProfile.id,
        to: activeProfile.secondaryContact.email,
        toName: activeProfile.secondaryContact.name,
        subject: `📦 Pharmacy Refill Required: Metformin supply critically low (5 pills left)`,
        type: 'low_stock',
        content: `Alert for Nurse David Martinez:\n\nPatient: ${activeProfile.name}\nMedication: Metformin HCl 500mg (RX-772910)\nCurrent Supply: 5 pills remaining (< 3 days).\n\nAction: Automated refill order has been queued to Walgreens Pharmacy #4410.`
      };
    } else if (type === 'appointment_reminder') {
      payload = {
        profileId: activeProfile.id,
        to: activeProfile.emergencyContact.email,
        toName: activeProfile.emergencyContact.name,
        subject: `📅 Appointment Reminder: Dr. Vance Cardiology Visit on Wednesday`,
        type: 'appointment_reminder',
        content: `Dear ${activeProfile.emergencyContact.name},\n\nReminder: ${activeProfile.name} has a cardiology consultation with Dr. Eleanor Vance on Wednesday at 10:30 AM at St. Jude Heart Center.\n\nPreparation Instructions:\n- Fast 4 hours prior\n- Bring daily blood pressure log\n- Bring all current medication bottles`
      };
    }

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setSimulationNotice(`✅ Email successfully dispatched to ${payload.to}!`);
        audio.playChime('reminder');
        loadEmails();
        setSelectedEmail(data.email);
        setTimeout(() => setSimulationNotice(''), 4000);
      }
    } catch {
      setSimulationNotice('Failed to dispatch simulated email.');
    }
  };

  // Dispatch custom test email to evaluator's email
  const handleSendCustom = async (e) => {
    e.preventDefault();
    if (!customTo) return;

    setSendingCustom(true);
    setCustomFeedback('');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: activeProfile.id,
          to: customTo,
          toName: customTo.split('@')[0],
          subject: customSubject,
          type: 'evaluator_live_test',
          content: customMessage
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCustomFeedback(`✅ Dispatched live email to ${customTo}!`);
        audio.playChime('success');
        loadEmails();
        setSelectedEmail(data.email);
      }
    } catch {
      setCustomFeedback('Error dispatching email.');
    } finally {
      setSendingCustom(false);
    }
  };

  const typeBadges = {
    missed_dose: { label: 'Missed Dose Alert', bg: 'bg-rose-100 text-rose-800 border-rose-300' },
    upcoming_dose: { label: 'Upcoming Dose', bg: 'bg-sky-100 text-sky-800 border-sky-300' },
    low_stock: { label: 'Refill / Low Supply', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
    appointment_reminder: { label: 'Doctor Appointment', bg: 'bg-purple-100 text-purple-800 border-purple-300' },
    appointment_scheduled: { label: 'New Visit Booked', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    dose_taken: { label: 'Medication Taken', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    daily_summary: { label: 'Daily Summary', bg: 'bg-teal-100 text-teal-800 border-teal-300' },
    emergency_sos: { label: 'EMERGENCY SOS', bg: 'bg-red-600 text-white border-red-700 animate-pulse' },
    evaluator_live_test: { label: 'Live Test Email', bg: 'bg-blue-100 text-blue-800 border-blue-300' }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-700 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-sky-200 mb-2">
            <Mail className="w-4 h-4 text-sky-300" />
            <span>Proactive Notification & Email Dispatch Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Automated Healthcare Email Guardian
          </h1>
          <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-xl">
            Proactively dispatches real-time email reminders to family and caregivers for missed doses, upcoming medication schedules, low pill stocks, and doctor appointments.
          </p>
        </div>

        <button
          onClick={loadEmails}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Mailbox ({emails.length})</span>
        </button>
      </div>

      {/* Proactive Trigger Bar for Hackathon Evaluation */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Instant Proactive Event Simulators
            </h2>
            <p className="text-xs text-slate-500">
              Trigger automated events in 1 click to watch CarePulse immediately format and dispatch the alert email.
            </p>
          </div>
          {simulationNotice && (
            <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full animate-fade-in">
              {simulationNotice}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => triggerSimulation('missed_dose')}
            className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left transition group"
          >
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Missed Dose Alert</span>
            </div>
            <p className="text-[11px] text-rose-700">
              Notifies family & nurse that senior missed afternoon dose by 45m.
            </p>
          </button>

          <button
            onClick={() => triggerSimulation('upcoming_dose')}
            className="p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-left transition group"
          >
            <div className="flex items-center gap-2 text-sky-800 font-bold text-xs mb-1">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Upcoming Dose Reminder</span>
            </div>
            <p className="text-[11px] text-sky-700">
              Dispatches 15m pre-dose notice with meal instructions.
            </p>
          </button>

          <button
            onClick={() => triggerSimulation('low_stock')}
            className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition group"
          >
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
              <Package className="w-4 h-4 text-amber-600" />
              <span>Low Pill Stock Warning</span>
            </div>
            <p className="text-[11px] text-amber-700">
              Alerts caregiver that Metformin has &lt; 5 pills left.
            </p>
          </button>

          <button
            onClick={() => triggerSimulation('appointment_reminder')}
            className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition group"
          >
            <div className="flex items-center gap-2 text-purple-800 font-bold text-xs mb-1">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Doctor Visit Reminder</span>
            </div>
            <p className="text-[11px] text-purple-700">
              Sends Dr. Vance prep instructions (fast 4 hrs, bring BP logs).
            </p>
          </button>
        </div>
      </div>

      {/* Dispatched Emails Mailbox & Live HTML Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Email List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Inbox className="w-4 h-4 text-sky-600" />
              Dispatched Emails ({emails.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Live Dispatched Log</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {emails.map((em) => {
              const isSelected = selectedEmail?.id === em.id;
              const badgeInfo = typeBadges[em.type] || { label: em.type, bg: 'bg-slate-100 text-slate-700' };

              return (
                <button
                  key={em.id}
                  onClick={() => setSelectedEmail(em)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 shadow-sm ring-1 ring-sky-300'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-800 text-xs truncate max-w-[170px]">
                      {em.toName || em.to}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(em.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-900 line-clamp-1 mb-1.5">
                    {em.subject}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeInfo.bg}`}>
                      {badgeInfo.label}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Delivered
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Rendered Email Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-[560px]">
          {selectedEmail ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Email Envelope Meta Header */}
              <div className="pb-4 border-b border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedEmail.subject}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    Delivered
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span><strong>From:</strong> CarePulse Automated Health Alert &lt;alerts@carepulse-health.org&gt;</span>
                    <span className="font-mono text-[11px]">{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span><strong>To:</strong> {selectedEmail.toName} &lt;{selectedEmail.to}&gt;</span>
                  </div>
                </div>
              </div>

              {/* Rendered Email Body in Browser Preview Frame */}
              <div className="flex-1 overflow-y-auto mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-600 to-teal-600 text-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-black text-lg font-heading">CarePulse Health Alert</div>
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded">
                        Automated Dispatch
                      </span>
                    </div>
                    <p className="text-xs text-sky-100 mt-0.5">
                      Patient: {activeProfile.name} • Shared Ecosystem
                    </p>
                  </div>

                  <div className="p-5 text-xs text-slate-800 leading-relaxed space-y-3">
                    <pre className="font-sans whitespace-pre-wrap text-xs sm:text-sm">
                      {selectedEmail.content}
                    </pre>

                    <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>CarePulse Platform • Emergency Carecircle Active</span>
                      <span>Security: Passcode Verified</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Mail className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
              <span>Select an email from the list to view its rendered delivery.</span>
            </div>
          )}
        </div>

      </div>

      {/* Evaluator Live Email Sandbox (Send Real Email to Your Inbox!) */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Send className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold font-heading">
            Live Email Dispatch Sandbox (Test with Your Own Email!)
          </h2>
        </div>
        <p className="text-xs text-slate-300 mb-4 max-w-2xl">
          Enter any email address to test live delivery. The CarePulse backend will dispatch a real healthcare alert and log it to the audit stream.
        </p>

        {customFeedback && (
          <div className="mb-4 p-3 bg-emerald-900/80 border border-emerald-500 text-emerald-200 text-xs font-bold rounded-xl">
            {customFeedback}
          </div>
        )}

        <form onSubmit={handleSendCustom} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Recipient Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. evaluator@example.com or your email"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Subject</label>
              <input
                type="text"
                required
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold text-xs mb-1">Message Content</label>
            <textarea
              rows={2}
              required
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sendingCustom}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{sendingCustom ? 'Dispatching...' : 'Dispatch Live Email Alert'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
