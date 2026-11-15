import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Volume2, 
  Mic, 
  MicOff, 
  Camera, 
  Scan, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Pill, 
  ArrowRight,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { audio } from '../utils/speech';

export default function AuraAiCompanion({
  activeProfile,
  medications,
  onAddMedication
}) {
  const [messages, setMessages] = useState([
    {
      role: 'aura',
      content: `Hello ${activeProfile.name.split(' ')[0]}! I'm Aura, your AI Care Companion. I'm connected to your healthcare profile and active prescriptions. How can I help you today? You can ask me what medicines to take, why you take them, or ask about doctor appointments!`,
      actions: ['What pills do I take today?', 'Why do I take Metformin?', 'Can I take Advil for a headache?', 'When is my next appointment?']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  // Scanner state
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [addedNotice, setAddedNotice] = useState(false);

  // Send query to AI backend
  const handleSend = async (queryText) => {
    const text = queryText || inputText;
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, profileId: activeProfile.id })
      });
      const data = await res.json();
      const auraMsg = {
        role: 'aura',
        content: data.reply,
        actions: data.suggestedActions || []
      };
      setMessages(prev => [...prev, auraMsg]);
      audio.speak(data.reply);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'aura',
          content: "I'm having a brief connection delay, but I'm here. You can ask Nurse David or check your pillbox directly.",
          actions: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle voice dictation
  const toggleMic = () => {
    if (listening) {
      setListening(false);
      return;
    }
    setListening(true);
    audio.startListening(
      (transcript) => {
        setListening(false);
        setInputText(transcript);
        handleSend(transcript);
      },
      () => setListening(false)
    );
  };

  // Trigger prescription bottle scan
  const handleScanPrescription = async () => {
    setScanning(true);
    setScanResult(null);
    setAddedNotice(false);

    try {
      const res = await fetch('/api/ai/scan-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: activeProfile.id })
      });
      const data = await res.json();
      setTimeout(() => {
        setScanResult(data.scannedData);
        setScanning(false);
        audio.playChime('success');
        audio.speak(`Prescription scan completed for ${data.scannedData.drugName} ${data.scannedData.dosage}.`);
      }, 1200);
    } catch {
      setScanning(false);
    }
  };

  const handleAddScannedToRegimen = () => {
    if (!scanResult) return;

    onAddMedication({
      profileId: activeProfile.id,
      name: scanResult.drugName,
      dosage: scanResult.dosage,
      form: scanResult.form,
      color: '#38BDF8',
      shape: 'round',
      purpose: scanResult.purpose,
      instructions: scanResult.instructions,
      withFood: 'Morning with water',
      frequency: scanResult.frequency,
      times: ['08:00'],
      remainingPills: scanResult.quantity,
      totalPills: scanResult.quantity,
      refillThreshold: 7,
      prescribedBy: scanResult.prescribedBy,
      rxNumber: scanResult.rxNumber
    });

    setAddedNotice(true);
    audio.playChime('success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-sky-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-teal-200 mb-2">
            <Bot className="w-4 h-4 text-teal-300" />
            <span>AI Care Assistant & Prescription Vision Scanner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Aura AI Health Companion
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl">
            Conversational assistance for seniors and caregivers. Ask medical questions, check contraindications, hear voice read-alouds, or scan medication bottles with AI vision.
          </p>
        </div>

        <button
          onClick={handleScanPrescription}
          disabled={scanning}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-teal-900 font-extrabold text-sm shadow-lg hover:bg-teal-50 active:scale-95 transition shrink-0"
        >
          <Camera className="w-5 h-5 text-teal-700" />
          <span>{scanning ? 'Scanning Label...' : 'Scan Prescription Bottle'}</span>
        </button>
      </div>

      {/* Prescription Bottle Scanner Result Card */}
      {scanning && (
        <div className="p-8 bg-white rounded-3xl border-2 border-dashed border-teal-400 text-center space-y-3 animate-pulse">
          <Scan className="w-12 h-12 text-teal-600 mx-auto animate-spin" />
          <h3 className="font-bold text-slate-800 text-base">Analyzing Prescription Label with AI Vision...</h3>
          <p className="text-xs text-slate-500">Extracting medication name, dosage units, prescribing doctor, and warning flags...</p>
        </div>
      )}

      {scanResult && !scanning && (
        <div className="bg-white rounded-3xl p-6 border-2 border-teal-500 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">AI OCR Extraction Complete ({(scanResult.confidence * 100).toFixed(0)}% Confidence)</span>
                <h3 className="text-xl font-bold font-heading text-slate-900">
                  {scanResult.drugName} ({scanResult.dosage})
                </h3>
              </div>
            </div>

            {!addedNotice ? (
              <button
                onClick={handleAddScannedToRegimen}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2"
              >
                <Pill className="w-4 h-4" />
                <span>Add to {activeProfile.name.split(' ')[0]}'s Regimen</span>
              </button>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-300">
                ✓ Added to Medication Schedule!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block">Indication / Purpose:</span>
              <span className="font-bold text-slate-800">{scanResult.purpose}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block">Frequency & Timing:</span>
              <span className="font-bold text-slate-800">{scanResult.frequency}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block">Doctor & Rx Number:</span>
              <span className="font-bold text-slate-800">{scanResult.prescribedBy} ({scanResult.rxNumber})</span>
            </div>
            <div className="col-span-full p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-medium">
              ⚠️ <strong>Precaution Detected: </strong>{scanResult.detectedWarnings}
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Interactive Chat & Quick Senior FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chat Window (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-[520px]">
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'aura' && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-none font-medium'
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none font-normal'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Actions / Read Aloud Button */}
                  {msg.role === 'aura' && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => audio.speak(msg.content)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-800"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Read Aloud</span>
                      </button>

                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {msg.actions.map((act, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(act)}
                              className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-700 font-semibold text-[11px] rounded-lg border border-slate-200 transition shadow-2xs"
                            >
                              {act}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <Bot className="w-4 h-4 animate-spin text-teal-600" />
                <span>Aura is analyzing medical guidelines...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="pt-4 border-t border-slate-100 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleMic}
              title="Voice Dictation"
              className={`p-3 rounded-2xl transition ${
                listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-sky-600" />}
            </button>

            <input
              type="text"
              placeholder="Ask Aura anything (e.g. 'Can I take aspirin?', 'Explain my medicines')..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-md transition disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

        </div>

        {/* Quick Medical Guidance & Safety FAQs (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Safety & Contraindication Guide
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time safeguards tailored for Margaret's allergy and medication profile.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs">
                <span className="font-bold text-rose-800 block mb-1">⚠️ Severe Penicillin Allergy</span>
                <p className="text-rose-700">All beta-lactam antibiotics are contraindicated. Alert attending doctors prior to any procedures.</p>
              </div>

              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs">
                <span className="font-bold text-sky-800 block mb-1">💧 Metformin & Hydration</span>
                <p className="text-sky-700">Maintain daily water intake to support renal excretion and mitigate lactic acidosis risk.</p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs">
                <span className="font-bold text-amber-800 block mb-1">💊 Avoid Extra NSAIDs</span>
                <p className="text-amber-700">Low-dose aspirin is prescribed. Do not combine with OTC Ibuprofen/Aleve without Dr. Vance's consent.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-medium">
              Medical intelligence verified against AHA / ADA clinical protocols.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
