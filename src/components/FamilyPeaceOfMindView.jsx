import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  MessageSquare, 
  Clock, 
  Smile, 
  Calendar, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Users,
  Flame,
  Award
} from 'lucide-react';
import { audio } from '../utils/speech';

export default function FamilyPeaceOfMindView({
  activeProfile,
  adherenceLogs,
  medications
}) {
  const [cheerNotes, setCheerNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [senderName, setSenderName] = useState('Sarah (Daughter)');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Fetch cheer notes
  const loadNotes = () => {
    fetch('/api/cheer-notes')
      .then(res => res.json())
      .then(data => setCheerNotes(data))
      .catch(err => console.warn('Cheer notes err:', err));
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleSendNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSending(true);
    try {
      const res = await fetch('/api/cheer-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: activeProfile.id,
          senderName,
          message: newNote
        })
      });
      if (res.ok) {
        setNewNote('');
        setSentSuccess(true);
        audio.playChime('success');
        loadNotes();
        setTimeout(() => setSentSuccess(false), 3000);
      }
    } catch {
      console.warn('Error sending cheer note');
    } finally {
      setSending(false);
    }
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

  return (
    <div className="space-y-6">
      
      {/* Peace of Mind Hero Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-purple-200 mb-2">
            <Users className="w-4 h-4 text-purple-300" />
            <span>Family Guardian Portal • Sarah Wilson</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Family "Peace of Mind" Dashboard
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-xl">
            Real-time status updates for <strong>{activeProfile.name}</strong>. Stay connected, verify medication adherence, view vitals telemetry, and send warm encouragement notes.
          </p>
        </div>

        {/* Live Reassurance Status Badge */}
        <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-emerald-400 text-emerald-950 flex items-center justify-center font-black text-xl shadow-md">
            <Heart className="w-7 h-7 fill-emerald-950" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-purple-200 font-extrabold">Live Senior Status</div>
            <div className="text-lg font-black text-white">Mom is Doing Great!</div>
            <div className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Morning Meds Taken on Time
            </div>
          </div>
        </div>
      </div>

      {/* 14-Day Streak & 7-Day Adherence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Streak Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Adherence Streak</span>
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            </span>
          </div>

          <div>
            <div className="text-4xl font-black font-heading text-slate-900 flex items-baseline gap-2">
              14 <span className="text-sm font-bold text-slate-500">Days Unbroken</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Margaret has not missed a single required morning or night dose in the last 2 weeks!
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>Monthly Compliance:</span>
            <span className="text-emerald-600 font-bold">98.4% On-Track</span>
          </div>
        </div>

        {/* 7-Day Visual Adherence Map */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Weekly Adherence Log (Past 7 Days)
              </h2>
              <p className="text-xs text-slate-500">
                Green indicates 100% scheduled medications taken on time.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
              Full Compliance
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {dayNames.map((day, idx) => (
              <div 
                key={day}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1.5"
              >
                <span className="text-xs font-bold text-slate-500">{day}</span>
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  ✓
                </div>
                <span className="text-[10px] text-slate-400 font-medium">100%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Two Column Layout: Real-Time Activity Feed & Send Love Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real-Time Live Activity Feed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Real-Time Care Activity Stream
            </h2>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Live Feed
            </span>
          </div>

          <div className="space-y-3">
            {[
              { time: '10:00 AM', text: 'Margaret completed 20 min morning garden walk & mobility routine', badge: 'Routine', color: 'bg-teal-50 border-teal-200 text-teal-800' },
              { time: '09:10 AM', text: 'Daily wellness check-in: "Feeling energized and happy 😊 (5/5)"', badge: 'Wellness', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
              { time: '08:32 AM', text: 'Nurse David logged Blood Pressure: 124/78 mmHg (Normal Range)', badge: 'Clinical', color: 'bg-sky-50 border-sky-200 text-sky-800' },
              { time: '08:07 AM', text: 'Margaret took Metformin HCl 500mg, Lisinopril 10mg, Aspirin 81mg', badge: 'Medication', color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
              { time: '08:00 AM', text: 'Automated morning dose audio chime played on tablet', badge: 'System', color: 'bg-slate-50 border-slate-200 text-slate-700' },
            ].map((item, idx) => (
              <div key={idx} className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${item.color}`}>
                <span className="font-mono font-bold text-[11px] text-slate-500 shrink-0 pt-0.5">{item.time}</span>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{item.text}</div>
                </div>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-white/80 shrink-0">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Send Love & Encouragement to Senior's Tablet */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                "Send Love & Cheer" to Mom's Tablet
              </h2>
              <span className="text-xs text-slate-400">Instant Notification</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Write a cheerful message or upload a family picture. Your note appears with warm audio chimes on Margaret's home screen!
            </p>

            {/* Existing Notes Feed */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
              {cheerNotes.map((note) => (
                <div key={note.id} className="p-3 bg-purple-50/60 rounded-2xl border border-purple-200/80 flex items-start gap-3">
                  <img src={note.avatar} alt={note.senderName} className="w-8 h-8 rounded-full object-cover shrink-0 border border-purple-300" />
                  <div className="text-xs">
                    <div className="font-bold text-purple-900">{note.senderName}</div>
                    <div className="text-slate-700 mt-0.5">{note.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Cheer Note Form */}
          <form onSubmit={handleSendNote} className="space-y-3 pt-3 border-t border-slate-100">
            {sentSuccess && (
              <div className="p-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl text-center">
                Cheer message sent to Mom's tablet! ❤️
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a sweet note: e.g. Love you Mom, remember your water! 💧"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={sending}
                className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Shared Care Circle Contact Cards */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 font-heading mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-600" />
          Active Care Circle for Margaret Wilson
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
              SW
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-800">Sarah Wilson</div>
              <div className="text-slate-500">Daughter (Primary Guardian)</div>
              <div className="text-purple-700 font-mono mt-0.5">{activeProfile.emergencyContact.phone}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              DM
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-800">David Martinez, RN</div>
              <div className="text-slate-500">Registered Visiting Nurse</div>
              <div className="text-emerald-700 font-mono mt-0.5">{activeProfile.secondaryContact.phone}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
              EV
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-800">Dr. Eleanor Vance</div>
              <div className="text-slate-500">Primary Cardiologist</div>
              <div className="text-sky-700 font-mono mt-0.5">{activeProfile.physicianContact}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
