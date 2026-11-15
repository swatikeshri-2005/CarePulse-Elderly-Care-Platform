import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Volume2, 
  Mic, 
  MicOff, 
  AlertCircle, 
  Sparkles, 
  Sun, 
  Coffee, 
  Moon, 
  Package, 
  RefreshCw,
  Heart,
  Smile,
  Meh,
  Frown,
  Check,
  ChevronRight
} from 'lucide-react';
import { audio } from '../utils/speech';

export default function ElderlyPillboxView({
  medications,
  adherenceLogs,
  activeProfile,
  onTakeMedication,
  onSnoozeMedication,
  onSkipMedication,
  onRefresh,
  fontSize,
  highContrast,
  voiceEnabled
}) {
  const [selectedSlot, setSelectedSlot] = useState('all');
  const [skipModalMed, setSkipModalMed] = useState(null);
  const [skipReason, setSkipReason] = useState('Felt slightly dizzy');
  const [listening, setListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [dailyMood, setDailyMood] = useState(null);
  const [moodMessage, setMoodMessage] = useState('');

  // Calculate today's status
  const todayDate = new Date().toISOString().split('T')[0];
  const todayTakenIds = new Set(
    adherenceLogs
      .filter(l => l.status === 'taken' && l.scheduledDate === todayDate)
      .map(l => l.medicationId)
  );

  const totalMeds = medications.length;
  const takenMedsCount = medications.filter(m => todayTakenIds.has(m.id)).length;
  const progressPercent = totalMeds > 0 ? Math.round((takenMedsCount / totalMeds) * 100) : 0;

  // Filter medications by slot
  const filterMedsBySlot = (med) => {
    if (selectedSlot === 'all') return true;
    const time = med.times[0] || '08:00';
    const hour = parseInt(time.split(':')[0], 10);
    if (selectedSlot === 'morning') return hour >= 5 && hour < 12;
    if (selectedSlot === 'afternoon') return hour >= 12 && hour < 17;
    if (selectedSlot === 'evening') return hour >= 17 && hour < 21;
    if (selectedSlot === 'night') return hour >= 21 || hour < 5;
    return true;
  };

  const filteredMeds = medications.filter(filterMedsBySlot);

  // Read aloud pill instructions
  const handleReadAloud = (med) => {
    const isTaken = todayTakenIds.has(med.id);
    const text = `${med.name}, ${med.dosage}. Purpose: ${med.purpose}. Instructions: ${med.instructions}. ${
      isTaken ? 'You have already taken this medication today.' : 'This medication is due for you to take.'
    }`;
    audio.speak(text);
  };

  // Voice command handler
  const toggleListening = () => {
    if (listening) {
      setListening(false);
      return;
    }

    setListening(true);
    setVoiceNotice('Listening... speak now (e.g., "Take Lisinopril")');
    audio.startListening(
      (transcript) => {
        setListening(false);
        setVoiceNotice(`Heard: "${transcript}"`);
        const lower = transcript.toLowerCase();

        // Match medication
        const matched = medications.find(m => lower.includes(m.name.toLowerCase()));
        if (matched) {
          if (lower.includes('take') || lower.includes('took') || lower.includes('done')) {
            onTakeMedication(matched.id, 'morning', `Voice command: "${transcript}"`);
            audio.speak(`Marking ${matched.name} as taken! Great job.`);
          } else {
            handleReadAloud(matched);
          }
        } else if (lower.includes('schedule') || lower.includes('pills') || lower.includes('what')) {
          audio.speak(`You have taken ${takenMedsCount} of ${totalMeds} medications today.`);
        } else {
          audio.speak(`I heard: ${transcript}. You can say: Take Lisinopril, or Ask for instructions.`);
        }
      },
      (err) => {
        setListening(false);
        setVoiceNotice('Could not hear clearly. Please tap the button.');
      }
    );
  };

  // Submit daily wellness check-in
  const handleLogMood = async (rating, label) => {
    setDailyMood(rating);
    setMoodMessage(`Recorded: ${label}. Family has been updated!`);
    try {
      await fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: activeProfile.id,
          type: 'wellness_mood',
          rating,
          mood: label,
          notes: `Senior checked in: ${label}`
        })
      });
      audio.playChime('success');
      if (voiceEnabled) audio.speak(`Thank you for checking in, ${activeProfile.name.split(' ')[0]}. Your family can see you are doing well!`);
    } catch (e) {
      console.warn('Mood checkin error:', e);
    }
  };

  return (
    <div className={`space-y-6 ${highContrast ? 'high-contrast' : ''}`}>
      
      {/* Friendly Senior Greeting Banner */}
      <div className="bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-sky-100 mb-2">
              <Sun className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight">
              Good Morning, {activeProfile.name.split(' ')[0]}! 🌸
            </h1>
            <p className="text-sky-100 text-sm sm:text-base mt-1 max-w-xl">
              Here is your daily medication organizer. Big touch buttons and audio guidance keep you on schedule and your family informed.
            </p>
          </div>

          {/* Adherence Progress Widget */}
          <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-300 transition-all duration-700 ease-out"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-black">{progressPercent}%</span>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-sky-200 font-bold">Today's Progress</div>
              <div className="text-xl font-black text-white">
                {takenMedsCount} of {totalMeds} Taken
              </div>
              <div className="text-[11px] text-amber-200 font-medium flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3" />
                14-Day Streak Active!
              </div>
            </div>
          </div>
        </div>

        {/* Voice Command Bar for Elderly Accessibility */}
        <div className="mt-6 pt-5 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-sky-50">
            <button
              onClick={toggleListening}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition shadow-md ${
                listening 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-white text-slate-800 hover:bg-sky-50'
              }`}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-sky-600" />}
              <span>{listening ? 'Listening... Tap to Stop' : 'Tap to Speak Commands'}</span>
            </button>
            <span className="opacity-90">
              {voiceNotice || 'Or say: "Take Metformin", "Read my afternoon pills"'}
            </span>
          </div>

          <button
            onClick={() => {
              const pendingMeds = medications.filter(m => !todayTakenIds.has(m.id));
              if (pendingMeds.length === 0) {
                audio.speak(`Wonderful news ${activeProfile.name.split(' ')[0]}! You have completed all your medications for today.`);
              } else {
                audio.speak(`You have ${pendingMeds.length} medications remaining today. The next one is ${pendingMeds[0].name} at ${pendingMeds[0].times[0]}.`);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition"
          >
            <Volume2 className="w-4 h-4" />
            <span>Read Summary Aloud</span>
          </button>
        </div>
      </div>

      {/* Daily Wellness Check-In Quiz */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm card-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-heading flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              Daily Wellness Check-In
            </h2>
            <p className="text-xs text-slate-500">
              How are you feeling right now, {activeProfile.name.split(' ')[0]}? Tapping updates your family & nurse.
            </p>
          </div>
          {moodMessage && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-fade-in">
              {moodMessage}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { rating: 5, label: 'Feeling Great 😊', color: 'hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700' },
            { rating: 4, label: 'Good & Calm 🙂', color: 'hover:border-sky-500 hover:bg-sky-50 text-sky-700' },
            { rating: 3, label: 'Just Okay 😐', color: 'hover:border-amber-500 hover:bg-amber-50 text-amber-700' },
            { rating: 2, label: 'A Bit Tired 🥱', color: 'hover:border-purple-500 hover:bg-purple-50 text-purple-700' },
            { rating: 1, label: 'In Pain / Discomfort 🤕', color: 'hover:border-rose-500 hover:bg-rose-50 text-rose-700' },
          ].map((item) => (
            <button
              key={item.rating}
              type="button"
              onClick={() => handleLogMood(item.rating, item.label)}
              className={`p-3 sm:p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center font-bold text-xs sm:text-sm ${
                dailyMood === item.rating
                  ? 'border-sky-600 bg-sky-50 shadow-md scale-102 ring-2 ring-sky-200'
                  : `border-slate-200 bg-slate-50/70 ${item.color}`
              }`}
            >
              <span className="text-2xl sm:text-3xl mb-1">{item.label.split(' ')[1]}</span>
              <span className="text-slate-800">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slot Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Today', icon: Clock },
          { id: 'morning', label: 'Morning (8:00 AM)', icon: Coffee },
          { id: 'afternoon', label: 'Afternoon (1:00 PM)', icon: Sun },
          { id: 'evening', label: 'Evening (6:00 PM)', icon: Moon },
          { id: 'night', label: 'Bedtime (9:00 PM)', icon: Moon },
        ].map((slot) => {
          const Icon = slot.icon;
          const isSelected = selectedSlot === slot.id;
          return (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{slot.label}</span>
            </button>
          );
        })}
      </div>

      {/* Medication Cards List */}
      <div className="space-y-4">
        {filteredMeds.map((med) => {
          const isTaken = todayTakenIds.has(med.id);
          const isLowStock = med.remainingPills <= med.refillThreshold;

          return (
            <div
              key={med.id}
              className={`rounded-3xl p-5 sm:p-6 transition-all duration-200 border-2 card-surface ${
                isTaken
                  ? 'bg-emerald-50/50 border-emerald-200/80 shadow-xs'
                  : isLowStock
                  ? 'bg-amber-50/40 border-amber-300 shadow-sm'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Left: Pill Visual, Name, Dosage & Instructions */}
                <div className="flex items-start gap-4 sm:gap-5">
                  
                  {/* Visual Pill Badge */}
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-xs transition transform hover:scale-105"
                    style={{ backgroundColor: `${med.color}20`, borderColor: med.color }}
                  >
                    {med.shape === 'capsule' ? (
                      <div className="w-10 h-5 rounded-full border-2 border-slate-800 rotate-45 flex overflow-hidden shadow-xs">
                        <div className="w-1/2 h-full" style={{ backgroundColor: med.color }}></div>
                        <div className="w-1/2 h-full bg-white"></div>
                      </div>
                    ) : med.shape === 'oval' ? (
                      <div 
                        className="w-11 h-6 rounded-full border-2 border-slate-800 shadow-xs flex items-center justify-center text-[9px] font-bold text-slate-700"
                        style={{ backgroundColor: med.color }}
                      >
                        {med.dosage.split(' ')[0]}
                      </div>
                    ) : (
                      <div 
                        className="w-9 h-9 rounded-full border-2 border-slate-800 shadow-xs flex items-center justify-center text-[10px] font-black text-slate-800"
                        style={{ backgroundColor: med.color }}
                      >
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Medication Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight ${
                        fontSize === 'extra-large' ? 'text-3xl' : ''
                      }`}>
                        {med.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-800 font-extrabold text-xs sm:text-sm border border-sky-200">
                        {med.dosage}
                      </span>
                      
                      {isTaken && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          Taken Today
                        </span>
                      )}

                      {isLowStock && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300 animate-pulse">
                          <Package className="w-3 h-3" />
                          Low Supply ({med.remainingPills} left)
                        </span>
                      )}
                    </div>

                    <div className="text-xs sm:text-sm font-semibold text-slate-500 flex items-center gap-2">
                      <span className="text-sky-700 font-bold">{med.purpose}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5" />
                        {med.times.join(', ')} ({med.withFood})
                      </span>
                    </div>

                    <p className={`text-slate-700 font-medium pt-1 ${
                      fontSize === 'extra-large' ? 'text-base font-semibold' : 'text-xs sm:text-sm'
                    }`}>
                      {med.instructions}
                    </p>

                    {/* Stock tracker snippet */}
                    <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-3">
                      <span>Prescription: <strong>{med.rxNumber}</strong></span>
                      <span>•</span>
                      <span>Remaining in Bottle: <strong>{med.remainingPills} / {med.totalPills}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 self-end lg:self-center">
                  
                  {/* Audio Read Aloud Button */}
                  <button
                    onClick={() => handleReadAloud(med)}
                    title="Read instructions aloud"
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>

                  {/* Primary "Take Medication" Action Button */}
                  {!isTaken ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => onTakeMedication(med.id, 'morning')}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-95 transition"
                      >
                        <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                        <span>I TOOK THIS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSnoozeMedication(med.id, 15)}
                        title="Snooze reminder by 15 minutes"
                        className="px-3.5 py-3.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-2xl transition"
                      >
                        Snooze 15m
                      </button>

                      <button
                        type="button"
                        onClick={() => setSkipModalMed(med)}
                        title="Skip dose with reason"
                        className="px-3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs rounded-2xl transition"
                      >
                        Skip
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="px-5 py-3 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center gap-2 border border-emerald-200">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Dose Completed</span>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Skip Reason Modal */}
      {skipModalMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold font-heading text-slate-900 mb-1">
              Skip Dose: {skipModalMed.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Please indicate why this dose is being skipped. An automated alert will be sent to Nurse David and Sarah for clinical supervision.
            </p>

            <div className="space-y-2 mb-4">
              {[
                'Felt slightly nauseous / stomach upset',
                'Doctor advised to pause temporarily',
                'Already took medication outside the home',
                'Fasting for upcoming blood test'
              ].map((reason) => (
                <label 
                  key={reason} 
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700"
                >
                  <input
                    type="radio"
                    name="skipReason"
                    value={reason}
                    checked={skipReason === reason}
                    onChange={(e) => setSkipReason(e.target.value)}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSkipModalMed(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSkipMedication(skipModalMed.id, skipReason);
                  setSkipModalMed(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Confirm Skip & Notify
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
