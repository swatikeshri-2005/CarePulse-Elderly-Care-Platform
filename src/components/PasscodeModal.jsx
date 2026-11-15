import React, { useState } from 'react';
import { Lock, Shield, User, HeartHandshake, Users, CheckCircle, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export default function PasscodeModal({
  isOpen,
  onClose,
  onVerify,
  activeProfile,
  profiles,
  onSelectProfile
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        verify(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const verify = async (codeToVerify) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/verify-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: codeToVerify, profileId: activeProfile.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onVerify(data);
        setPin('');
        onClose();
      } else {
        setError(data.message || 'Incorrect passcode. Try 1234, 4321, or 9876.');
        setPin('');
      }
    } catch {
      setError('Connection error verifying passcode.');
    } finally {
      setLoading(false);
    }
  };

  const quickSwitch = (code) => {
    setPin(code);
    verify(code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 p-6 text-white text-center relative">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-heading">Secure Profile Access</h2>
          <p className="text-sky-100 text-sm mt-1">
            Passcode-based access for Elderly, Caretakers & Family
          </p>

          {/* Active Profile Badge */}
          <div className="mt-4 bg-white/15 backdrop-blur-md rounded-full px-4 py-1.5 inline-flex items-center gap-2 text-xs font-medium">
            <img 
              src={activeProfile.avatar} 
              alt={activeProfile.name} 
              className="w-5 h-5 rounded-full object-cover border border-white/40"
            />
            <span>Managing: <strong>{activeProfile.name}</strong> ({activeProfile.age} yrs)</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* Quick Demo Role Switcher Chips for Judges / Users */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Persona Switch (Demo)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickSwitch('1234')}
                className="flex flex-col items-center p-2.5 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100 hover:border-sky-300 transition text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-sky-900">Elderly</span>
                <span className="text-[10px] text-sky-600 font-mono">PIN: 1234</span>
              </button>

              <button
                type="button"
                onClick={() => quickSwitch('4321')}
                className="flex flex-col items-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 hover:border-emerald-300 transition text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-emerald-900">Caretaker</span>
                <span className="text-[10px] text-emerald-600 font-mono">PIN: 4321</span>
              </button>

              <button
                type="button"
                onClick={() => quickSwitch('9876')}
                className="flex flex-col items-center p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 hover:border-purple-300 transition text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-purple-900">Family</span>
                <span className="text-[10px] text-purple-600 font-mono">PIN: 9876</span>
              </button>
            </div>
          </div>

          {/* PIN Input Display */}
          <div className="mb-4 text-center">
            <label className="block text-xs font-medium text-slate-500 mb-2">
              Enter 4-Digit Passcode
            </label>
            <div className="flex justify-center items-center gap-3">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all duration-150 border-2 ${
                      filled
                        ? 'bg-sky-500 text-white border-sky-500 scale-105 shadow-md shadow-sky-100'
                        : 'bg-slate-50 text-slate-300 border-slate-200'
                    }`}
                  >
                    {filled ? '•' : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(String(digit))}
                disabled={loading}
                className="h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-sky-100 text-slate-800 font-bold text-xl py-2.5 transition shadow-sm hover:shadow"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || pin.length === 0}
              className="h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-medium text-xs py-2.5 transition"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              disabled={loading}
              className="h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-sky-100 text-slate-800 font-bold text-xl py-2.5 transition shadow-sm hover:shadow"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              disabled={loading || pin.length === 0}
              className="h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs py-2.5 transition"
            >
              ⌫ Back
            </button>
          </div>

          {/* Profile Switcher dropdown */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Switch Patient Profile:</span>
            <select
              value={activeProfile.id}
              onChange={(e) => {
                const found = profiles.find(p => p.id === e.target.value);
                if (found) onSelectProfile(found);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-1 focus:ring-sky-500 outline-none"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}y)
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>
    </div>
  );
}
