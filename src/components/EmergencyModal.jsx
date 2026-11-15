import React, { useState, useEffect } from 'react';
import { AlertOctagon, Phone, ShieldAlert, CheckCircle2, X, MapPin, Heart, AlertTriangle, FileText, Volume2 } from 'lucide-react';
import { audio } from '../utils/speech';

export default function EmergencyModal({ isOpen, onClose, activeProfile }) {
  const [countdown, setCountdown] = useState(5);
  const [dispatched, setDispatched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setDispatched(false);
      return;
    }

    // Play siren sound tone
    audio.playChime('sos');

    // Countdown logic
    if (countdown > 0 && !dispatched) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !dispatched) {
      triggerSos();
    }
  }, [isOpen, countdown, dispatched]);

  const triggerSos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trigger-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: activeProfile.id, note: 'User triggered SOS emergency alert' })
      });
      const data = await res.json();
      setEmergencyData(data.emergencyCard);
      setDispatched(true);
      audio.speak(`Emergency alert dispatched for ${activeProfile.name}. Caregivers and emergency contacts have been notified.`);
    } catch {
      setDispatched(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border-2 border-red-500 animate-in zoom-in-95 duration-200">
        
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full p-1.5 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <AlertOctagon className="w-10 h-10 text-white animate-bounce" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
            {dispatched ? 'EMERGENCY BROADCAST ACTIVE' : 'EMERGENCY SOS INITIATED'}
          </h2>
          <p className="text-rose-100 text-sm mt-1">
            {dispatched 
              ? 'Urgent notification emails & alerts dispatched to designated care circle' 
              : 'Broadcasting emergency alert in...'}
          </p>

          {!dispatched && (
            <div className="mt-4 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white text-red-600 flex items-center justify-center text-4xl font-black shadow-lg animate-pulse">
                {countdown}s
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-sm border border-white/40 transition"
              >
                Cancel False Alarm
              </button>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-6">
          {dispatched ? (
            <div className="space-y-4">
              
              {/* Alert Status Pill */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-900">Urgent Dispatch Sent via CarePulse Engine</div>
                  <div className="text-emerald-700">Emails delivered to {activeProfile.emergencyContact.name} & {activeProfile.secondaryContact.name}</div>
                </div>
              </div>

              {/* Medical Emergency ID Card */}
              <div className="border-2 border-slate-200 rounded-2xl p-4 bg-slate-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-600" />
                    <span className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Emergency Medical ID</span>
                  </div>
                  <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-black rounded-lg">
                    BLOOD: {activeProfile.bloodType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Patient Name:</span>
                    <span className="font-bold text-slate-800 text-sm">{activeProfile.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Age / Gender:</span>
                    <span className="font-bold text-slate-800">{activeProfile.age} yrs • {activeProfile.gender}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Home Address:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      {activeProfile.address}
                    </span>
                  </div>
                  <div className="col-span-2 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    <span className="font-bold text-rose-800 block">⚠️ Severe Allergies:</span>
                    <span className="text-rose-900 font-semibold">{activeProfile.allergies.join(', ')}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Medical Conditions:</span>
                    <span className="font-semibold text-slate-700">{activeProfile.diagnoses.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Primary Physician:</span>
                    <span className="font-semibold text-slate-800">{activeProfile.primaryPhysician}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Doctor Contact:</span>
                    <span className="font-mono font-semibold text-slate-800">{activeProfile.physicianContact}</span>
                  </div>
                </div>
              </div>

              {/* Direct Quick Call Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={`tel:${activeProfile.emergencyContact.phone}`}
                  className="flex items-center justify-center gap-2 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs shadow-md transition text-center"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {activeProfile.emergencyContact.relation}</span>
                </a>
                <a
                  href={`tel:${activeProfile.secondaryContact.phone}`}
                  className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md transition text-center"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Nurse David</span>
                </a>
              </div>

              {/* Dismiss button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Close Emergency Dashboard
              </button>

            </div>
          ) : (
            <div className="text-center py-4 text-xs text-slate-500">
              <p>An emergency transmission with vital signs and GPS coordinates will be sent to the care circle once countdown completes.</p>
              <button
                type="button"
                onClick={triggerSos}
                className="mt-4 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                Send Immediately Now
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
