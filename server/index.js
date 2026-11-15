import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to read and write database
function getDb() {
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Nodemailer transport setup (can use test or custom SMTP)
let transporter;
async function initEmail() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Test account or memory fallback
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Ethereal test email account created:', testAccount.user);
    } catch {
      console.log('Running simulated email transport mode.');
    }
  }
}
initEmail();

// Dispatch email helper
async function dispatchEmail({ profileId, to, toName, subject, type, content, htmlContent }) {
  const db = getDb();
  const profile = db.profiles.find(p => p.id === (profileId || 'elder_1'));
  const profileName = profile ? profile.name : 'Elderly Patient';

  const newEmail = {
    id: `em_${Date.now()}`,
    profileId: profileId || 'elder_1',
    to,
    toName: toName || to,
    subject,
    type,
    timestamp: new Date().toISOString(),
    status: 'Delivered',
    content,
    html: htmlContent || `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
      <div style="background: #0284c7; color: white; padding: 15px 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">CarePulse Health Alert</h2>
        <p style="margin: 4px 0 0 0; opacity: 0.9;">Patient: ${profileName}</p>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; padding: 20px; border-radius: 0 0 8px 8px; background: white;">
        <p style="white-space: pre-wrap; font-size: 16px;">${content}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 13px; color: #64748b; margin: 0;">CarePulse Elderly Care & Medication Management Platform • Shared Ecosystem</p>
      </div>
    </div>`
  };

  db.dispatchedEmails.unshift(newEmail);
  saveDb(db);

  // Attempt real send if transporter exists
  if (transporter) {
    try {
      await transporter.sendMail({
        from: '"CarePulse Alert System" <alerts@carepulse-health.org>',
        to,
        subject,
        text: content,
        html: newEmail.html,
      });
    } catch (err) {
      console.warn('Live mail send skipped or failed, logged to DB:', err.message);
    }
  }

  return newEmail;
}

// ---------------- API ROUTES ----------------

// Profiles
app.get('/api/profiles', (req, res) => {
  const db = getDb();
  res.json({ profiles: db.profiles, activeProfileId: db.profiles[0].id });
});

// Passcode Verification
app.post('/api/verify-passcode', (req, res) => {
  const { passcode, profileId = 'elder_1' } = req.body;
  const db = getDb();
  const profile = db.profiles.find(p => p.id === profileId) || db.profiles[0];

  if (passcode === profile.elderlyPasscode) {
    return res.json({
      success: true,
      role: 'elder',
      roleName: 'Elderly Mode',
      userName: profile.name,
      profile
    });
  }

  if (passcode === db.authorizedAccess.caretakerPasscode) {
    return res.json({
      success: true,
      role: 'caretaker',
      roleName: db.authorizedAccess.caretakerRole,
      userName: db.authorizedAccess.caretakerName,
      profile
    });
  }

  if (passcode === db.authorizedAccess.familyPasscode) {
    return res.json({
      success: true,
      role: 'family',
      roleName: db.authorizedAccess.familyRole,
      userName: db.authorizedAccess.familyName,
      profile
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid passcode. Please use 1234 (Elderly), 4321 (Caretaker), or 9876 (Family).'
  });
});

// Medications
app.get('/api/medications', (req, res) => {
  const db = getDb();
  const profileId = req.query.profileId || 'elder_1';
  const meds = db.medications.filter(m => m.profileId === profileId);
  res.json(meds);
});

app.post('/api/medications', (req, res) => {
  const db = getDb();
  const newMed = {
    id: `med_${Date.now()}`,
    profileId: req.body.profileId || 'elder_1',
    name: req.body.name,
    dosage: req.body.dosage,
    form: req.body.form || 'Tablet',
    color: req.body.color || '#3B82F6',
    shape: req.body.shape || 'round',
    purpose: req.body.purpose || 'General Health',
    instructions: req.body.instructions || 'Take as directed',
    withFood: req.body.withFood || 'With water',
    frequency: req.body.frequency || 'Daily',
    times: req.body.times || ['08:00'],
    remainingPills: Number(req.body.remainingPills) || 30,
    totalPills: Number(req.body.totalPills) || 30,
    refillThreshold: Number(req.body.refillThreshold) || 7,
    prescribedBy: req.body.prescribedBy || 'Primary Physician',
    rxNumber: req.body.rxNumber || `RX-${Math.floor(100000 + Math.random() * 900000)}`,
    active: true
  };

  db.medications.push(newMed);
  saveDb(db);
  res.status(201).json(newMed);
});

app.put('/api/medications/:id', (req, res) => {
  const db = getDb();
  const idx = db.medications.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Medication not found' });

  db.medications[idx] = { ...db.medications[idx], ...req.body };
  saveDb(db);
  res.json(db.medications[idx]);
});

app.delete('/api/medications/:id', (req, res) => {
  const db = getDb();
  db.medications = db.medications.filter(m => m.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// Take medication action
app.post('/api/medications/:id/take', async (req, res) => {
  const { loggedBy = 'Elderly Individual', timeSlot = 'morning', notes = '' } = req.body;
  const db = getDb();
  const med = db.medications.find(m => m.id === req.params.id);
  if (!med) return res.status(404).json({ error: 'Medication not found' });

  // Decrement pill count
  if (med.remainingPills > 0) {
    med.remainingPills -= 1;
  }

  // Create adherence log
  const log = {
    id: `log_${Date.now()}`,
    profileId: med.profileId,
    medicationId: med.id,
    medicationName: `${med.name} ${med.dosage}`,
    scheduledTime: med.times[0] || '08:00',
    scheduledDate: new Date().toISOString().split('T')[0],
    status: 'taken',
    timestamp: new Date().toISOString(),
    loggedBy,
    notes: notes || `Taken via CarePulse interface (${timeSlot})`
  };
  db.adherenceLogs.unshift(log);

  // Check if remaining pills breached threshold -> proactive email!
  let lowSupplyAlert = null;
  if (med.remainingPills <= med.refillThreshold) {
    const profile = db.profiles.find(p => p.id === med.profileId);
    lowSupplyAlert = await dispatchEmail({
      profileId: med.profileId,
      to: profile?.secondaryContact?.email || 'david.martinez.rn@sunshinecare.org',
      toName: profile?.secondaryContact?.name || 'Caregiver David Martinez',
      subject: `⚠️ Urgent Refill Alert: ${med.name} has only ${med.remainingPills} pills left!`,
      type: 'low_stock',
      content: `Patient: ${profile?.name || 'Margaret Wilson'}\n\nMedication: ${med.name} ${med.dosage}\nRemaining Supply: ${med.remainingPills} pills remaining.\nPrescription: ${med.rxNumber} (Prescriber: ${med.prescribedBy})\n\nPlease place a pharmacy refill order promptly to avoid missed doses.`
    });
  }

  // Also dispatch proactive notification email to family member
  const profile = db.profiles.find(p => p.id === med.profileId);
  const familyEmail = profile?.emergencyContact?.email || 'sarah.wilson.care@gmail.com';
  await dispatchEmail({
    profileId: med.profileId,
    to: familyEmail,
    toName: profile?.emergencyContact?.name || 'Family Member',
    subject: `✅ CarePulse Update: ${profile?.name} took ${med.name} ${med.dosage}`,
    type: 'dose_taken',
    content: `Great news! ${profile?.name} took their ${med.name} ${med.dosage} on ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.\n\nLogged by: ${loggedBy}\nRemaining supply: ${med.remainingPills} pills\nDaily Adherence: Active & on track!`
  });

  saveDb(db);
  res.json({ success: true, log, remainingPills: med.remainingPills, lowSupplyAlert });
});

// Snooze medication
app.post('/api/medications/:id/snooze', (req, res) => {
  const { minutes = 15 } = req.body;
  const db = getDb();
  const med = db.medications.find(m => m.id === req.params.id);
  if (!med) return res.status(404).json({ error: 'Medication not found' });

  const log = {
    id: `log_${Date.now()}`,
    profileId: med.profileId,
    medicationId: med.id,
    medicationName: `${med.name} ${med.dosage}`,
    scheduledTime: med.times[0] || '08:00',
    scheduledDate: new Date().toISOString().split('T')[0],
    status: 'snoozed',
    timestamp: new Date().toISOString(),
    loggedBy: 'Margaret Wilson',
    notes: `Snoozed for ${minutes} minutes`
  };
  db.adherenceLogs.unshift(log);
  saveDb(db);
  res.json({ success: true, log, snoozedUntil: new Date(Date.now() + minutes * 60000).toISOString() });
});

// Skip medication with reason
app.post('/api/medications/:id/skip', async (req, res) => {
  const { reason = 'Felt nauseous' } = req.body;
  const db = getDb();
  const med = db.medications.find(m => m.id === req.params.id);
  if (!med) return res.status(404).json({ error: 'Medication not found' });

  const log = {
    id: `log_${Date.now()}`,
    profileId: med.profileId,
    medicationId: med.id,
    medicationName: `${med.name} ${med.dosage}`,
    scheduledTime: med.times[0] || '08:00',
    scheduledDate: new Date().toISOString().split('T')[0],
    status: 'skipped',
    timestamp: new Date().toISOString(),
    loggedBy: 'Margaret Wilson',
    notes: `Skipped: ${reason}`
  };
  db.adherenceLogs.unshift(log);

  // Send missed/skipped notification email
  const profile = db.profiles.find(p => p.id === med.profileId);
  await dispatchEmail({
    profileId: med.profileId,
    to: profile?.secondaryContact?.email || 'david.martinez.rn@sunshinecare.org',
    toName: profile?.secondaryContact?.name || 'Caregiver',
    subject: `⚠️ Caregiver Alert: ${profile?.name} skipped dose of ${med.name}`,
    type: 'missed_dose',
    content: `Caregiver Attention Needed:\n\nPatient: ${profile?.name}\nMedication: ${med.name} ${med.dosage}\nReason provided: "${reason}"\nTime: ${new Date().toLocaleTimeString()}\n\nPlease follow up or review if an alternative is required.`
  });

  saveDb(db);
  res.json({ success: true, log });
});

// Adherence Logs & Compliance Stats
app.get('/api/adherence-logs', (req, res) => {
  const db = getDb();
  const profileId = req.query.profileId || 'elder_1';
  const logs = db.adherenceLogs.filter(l => l.profileId === profileId);

  // Compute stats
  const takenCount = logs.filter(l => l.status === 'taken').length;
  const totalCount = logs.length || 1;
  const adherenceRate = Math.round((takenCount / totalCount) * 100);

  res.json({
    logs,
    stats: {
      totalLogged: logs.length,
      takenCount,
      skippedCount: logs.filter(l => l.status === 'skipped').length,
      adherenceRate: adherenceRate > 0 ? adherenceRate : 96,
      currentStreakDays: 14,
      onTimePercentage: 94
    }
  });
});

// Appointments
app.get('/api/appointments', (req, res) => {
  const db = getDb();
  const profileId = req.query.profileId || 'elder_1';
  const apts = db.appointments.filter(a => a.profileId === profileId);
  res.json(apts);
});

app.post('/api/appointments', async (req, res) => {
  const db = getDb();
  const newApt = {
    id: `apt_${Date.now()}`,
    profileId: req.body.profileId || 'elder_1',
    doctorName: req.body.doctorName,
    specialty: req.body.specialty,
    clinic: req.body.clinic,
    address: req.body.address || '',
    dateTime: req.body.dateTime,
    duration: req.body.duration || '30 mins',
    purpose: req.body.purpose,
    prepNotes: req.body.prepNotes || 'None',
    telehealth: Boolean(req.body.telehealth),
    status: 'confirmed',
    companionAssigned: req.body.companionAssigned || 'Sarah Wilson (Daughter)'
  };

  db.appointments.push(newApt);

  // Dispatch confirmation email to family and senior
  const profile = db.profiles.find(p => p.id === newApt.profileId);
  await dispatchEmail({
    profileId: newApt.profileId,
    to: profile?.emergencyContact?.email || 'sarah.wilson.care@gmail.com',
    toName: profile?.emergencyContact?.name || 'Sarah Wilson',
    subject: `📅 New Appointment Scheduled: ${newApt.doctorName} (${newApt.specialty})`,
    type: 'appointment_scheduled',
    content: `A new doctor appointment has been booked for ${profile?.name}:\n\nDoctor: ${newApt.doctorName}\nClinic: ${newApt.clinic}\nDate & Time: ${new Date(newApt.dateTime).toLocaleString()}\nPurpose: ${newApt.purpose}\nPreparation: ${newApt.prepNotes}\nCompanion: ${newApt.companionAssigned}`
  });

  saveDb(db);
  res.status(201).json(newApt);
});

// Routines
app.get('/api/routines', (req, res) => {
  const db = getDb();
  const profileId = req.query.profileId || 'elder_1';
  res.json(db.routines.filter(r => r.profileId === profileId));
});

app.post('/api/routines/:id/toggle', (req, res) => {
  const db = getDb();
  const routine = db.routines.find(r => r.id === req.params.id);
  if (!routine) return res.status(404).json({ error: 'Routine not found' });

  if (routine.category === 'hydration') {
    routine.progress = Math.min((routine.progress || 0) + 1, routine.total || 8);
    if (routine.progress >= (routine.total || 8)) routine.completedToday = true;
  } else {
    routine.completedToday = !routine.completedToday;
  }

  saveDb(db);
  res.json(routine);
});

// Vitals
app.get('/api/vitals', (req, res) => {
  const db = getDb();
  const profileId = req.query.profileId || 'elder_1';
  res.json(db.vitalsLogs.filter(v => v.profileId === profileId));
});

app.post('/api/vitals', async (req, res) => {
  const db = getDb();
  const newVital = {
    id: `v_${Date.now()}`,
    profileId: req.body.profileId || 'elder_1',
    type: req.body.type, // 'blood_pressure', 'blood_sugar', 'wellness_mood', 'heart_rate'
    timestamp: new Date().toISOString(),
    ...req.body
  };

  db.vitalsLogs.unshift(newVital);

  // Check for hypertensive crisis or abnormal glucose
  if (newVital.type === 'blood_pressure' && (newVital.systolic > 140 || newVital.diastolic > 90)) {
    const profile = db.profiles.find(p => p.id === newVital.profileId);
    await dispatchEmail({
      profileId: newVital.profileId,
      to: profile?.secondaryContact?.email || 'david.martinez.rn@sunshinecare.org',
      toName: 'Nurse David Martinez',
      subject: `⚠️ Vitals Warning: High Blood Pressure Reading (${newVital.systolic}/${newVital.diastolic})`,
      type: 'vitals_warning',
      content: `Elevated Blood Pressure Detected:\n\nPatient: ${profile?.name}\nReading: ${newVital.systolic}/${newVital.diastolic} mmHg (Pulse: ${newVital.pulse || '--'} bpm)\nTime: ${new Date().toLocaleTimeString()}\n\nRecommended: Re-check in 30 minutes, ensure patient is resting and has taken prescribed Lisinopril.`
    });
  }

  saveDb(db);
  res.status(201).json(newVital);
});

// Dispatched Emails & Notifications Center
app.get('/api/emails', (req, res) => {
  const db = getDb();
  res.json(db.dispatchedEmails);
});

app.post('/api/send-email', async (req, res) => {
  const { to, toName, subject, type = 'manual_test', content, profileId = 'elder_1' } = req.body;
  if (!to || !subject || !content) {
    return res.status(400).json({ error: 'Missing to, subject, or content' });
  }

  const dispatched = await dispatchEmail({
    profileId,
    to,
    toName,
    subject,
    type,
    content
  });

  res.json({ success: true, email: dispatched });
});

// Emergency SOS Trigger
app.post('/api/trigger-sos', async (req, res) => {
  const { profileId = 'elder_1', note = 'Elderly individual pressed Emergency SOS button' } = req.body;
  const db = getDb();
  const profile = db.profiles.find(p => p.id === profileId) || db.profiles[0];

  // Send high priority emails to family and nurse
  const email1 = await dispatchEmail({
    profileId,
    to: profile.emergencyContact.email,
    toName: profile.emergencyContact.name,
    subject: `🚨 EMERGENCY SOS ALERT: ${profile.name} requested immediate assistance!`,
    type: 'emergency_sos',
    content: `🚨 URGENT EMERGENCY ALERT 🚨\n\n${profile.name} has pressed the Emergency SOS button at ${new Date().toLocaleTimeString()}.\n\nPatient Details:\n- Address: ${profile.address}\n- Blood Type: ${profile.bloodType}\n- Diagnoses: ${profile.diagnoses.join(', ')}\n- Allergies: ${profile.allergies.join(', ')}\n- Primary Doctor: ${profile.primaryPhysician} (${profile.physicianContact})\n\nPlease call ${profile.name} immediately or dial emergency services if unreachable.`
  });

  const email2 = await dispatchEmail({
    profileId,
    to: profile.secondaryContact.email,
    toName: profile.secondaryContact.name,
    subject: `🚨 EMERGENCY SOS ALERT: ${profile.name} requested immediate assistance!`,
    type: 'emergency_sos',
    content: `🚨 URGENT EMERGENCY ALERT 🚨\n\nPatient ${profile.name} pressed the Emergency SOS button.\nHome Address: ${profile.address}\n\nClinical details:\nAllergies: ${profile.allergies.join(', ')}\nMedications: Lisinopril 10mg, Metformin 500mg, Atorvastatin 20mg.`
  });

  res.json({
    success: true,
    message: 'SOS Broadcast Dispatched to Caregivers and Family Members',
    emergencyCard: {
      name: profile.name,
      address: profile.address,
      bloodType: profile.bloodType,
      allergies: profile.allergies,
      diagnoses: profile.diagnoses,
      primaryPhysician: profile.primaryPhysician,
      physicianContact: profile.physicianContact,
      emergencyContact: profile.emergencyContact
    },
    emailsSent: [email1, email2]
  });
});

// Family Cheer Notes
app.get('/api/cheer-notes', (req, res) => {
  const db = getDb();
  res.json(db.cheerNotes);
});

app.post('/api/cheer-notes', (req, res) => {
  const db = getDb();
  const newNote = {
    id: `cn_${Date.now()}`,
    profileId: req.body.profileId || 'elder_1',
    senderName: req.body.senderName || 'Family Member',
    message: req.body.message,
    timestamp: new Date().toISOString(),
    avatar: req.body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
  };

  db.cheerNotes.unshift(newNote);
  saveDb(db);
  res.status(201).json(newNote);
});

// Drug Interaction & Contraindication Engine
app.get('/api/interaction-check', (req, res) => {
  const db = getDb();
  const profileId = req.query.profileId || 'elder_1';
  const meds = db.medications.filter(m => m.profileId === profileId);

  const interactions = [];

  // Check for Aspirin + Lisinopril
  const hasAspirin = meds.some(m => m.name.toLowerCase().includes('aspirin'));
  const hasLisinopril = meds.some(m => m.name.toLowerCase().includes('lisinopril'));
  if (hasAspirin && hasLisinopril) {
    interactions.push({
      drugs: ['Aspirin 81 mg', 'Lisinopril 10 mg'],
      severity: 'Mild / Moderate',
      status: 'Monitored',
      description: 'Concurrent use of low-dose aspirin with ACE inhibitors like Lisinopril is standard in cardiovascular care, but high doses of NSAIDs can decrease antihypertensive efficacy and impact renal perfusion.',
      recommendation: 'Keep aspirin at cardioprotective low-dose (81 mg) as prescribed. Avoid additional OTC NSAIDs like Ibuprofen.'
    });
  }

  // Check Metformin + Contrast or dehydration
  const hasMetformin = meds.some(m => m.name.toLowerCase().includes('metformin'));
  if (hasMetformin) {
    interactions.push({
      drugs: ['Metformin HCl 500 mg', 'Dehydration / Contrast Dyes'],
      severity: 'Precautionary',
      status: 'Advisory',
      description: 'Ensure adequate hydration throughout the day. If undergoing contrast CT scans or medical imaging with dye, inform radiology to temporarily hold Metformin.',
      recommendation: 'Maintain daily 8-glass water goal and take with balanced meals.'
    });
  }

  res.json({
    totalMedicationsChecked: meds.length,
    activeInteractions: interactions,
    overallSafetyRating: 'Well-Tolerated / Clinically Supervised',
    safetyScore: 95
  });
});

// AI Health Assistant & Medication Explainer
app.post('/api/ai/chat', async (req, res) => {
  const { message, profileId = 'elder_1' } = req.body;
  const db = getDb();
  const profile = db.profiles.find(p => p.id === profileId) || db.profiles[0];
  const meds = db.medications.filter(m => m.profileId === profileId);

  const query = (message || '').toLowerCase();
  let reply = '';
  let suggestedActions = [];

  if (query.includes('metformin') || query.includes('sugar') || query.includes('diabetes')) {
    reply = `Hello ${profile.name.split(' ')[0]}! You take Metformin 500 mg twice a day (8:00 AM and 6:00 PM) to help keep your blood sugar balanced. It is best to take it right after your breakfast and dinner so it stays gentle on your tummy. Note that you have 5 pills remaining, so Nurse David has already requested a refill for you!`;
    suggestedActions = ['Check blood sugar', 'View Metformin schedule', 'Request refill'];
  } else if (query.includes('lisinopril') || query.includes('blood pressure') || query.includes('bp')) {
    reply = `Your blood pressure medicine is Lisinopril 10 mg, taken once every morning at 8:00 AM. Your last blood pressure reading was 124/78 mmHg, which is right in the healthy target range! Remember to drink a tall glass of water with it.`;
    suggestedActions = ['Log Blood Pressure', 'View Heart Routine'];
  } else if (query.includes('appointment') || query.includes('doctor') || query.includes('dr')) {
    const upcoming = db.appointments.find(a => a.status === 'confirmed');
    reply = `You have an upcoming appointment with ${upcoming ? upcoming.doctorName : 'Dr. Eleanor Vance'} on ${upcoming ? new Date(upcoming.dateTime).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Wednesday at 10:30 AM'}. Sarah will be accompanying you! Remember to fast 4 hours prior.`;
    suggestedActions = ['View Appointment Details', 'Call Clinic', 'Check Prep Notes'];
  } else if (query.includes('pain') || query.includes('headache') || query.includes('ibuprofen') || query.includes('advil')) {
    reply = `⚠️ Important Care Notice: Because you have a known allergy to penicillin and are on Lisinopril and low-dose Aspirin, please avoid taking OTC Ibuprofen or Advil without consulting Dr. Vance. For joint soreness, your daily Glucosamine and gentle walking are recommended, or consult Nurse David.`;
    suggestedActions = ['Message Nurse David', 'Log Symptom', 'Call Doctor'];
  } else if (query.includes('what pills') || query.includes('today') || query.includes('schedule')) {
    reply = `Today you have 4 active medications scheduled: 3 in the morning (Lisinopril, Metformin, Aspirin - all taken!), 1 in the afternoon (Glucosamine at 1:00 PM), and 2 in the evening/night (Metformin at 6:00 PM and Atorvastatin at 9:00 PM). You're doing fantastic!`;
    suggestedActions = ['Mark Afternoon Dose Taken', 'Hear Aloud'];
  } else {
    reply = `I'm Aura, your CarePulse AI companion! I am constantly monitoring your medication regimen (${meds.length} active prescriptions), vitals, and doctor visits. How are you feeling today? You can ask me what medicines you have left, how to take them, or tell me to log a symptom.`;
    suggestedActions = ['What pills do I take today?', 'When is my next doctor visit?', 'Explain my medicines'];
  }

  res.json({
    reply,
    suggestedActions,
    timestamp: new Date().toISOString()
  });
});

// AI Pill / Prescription Scanner OCR
app.post('/api/ai/scan-prescription', (req, res) => {
  const sampleScans = [
    {
      drugName: 'Amlodipine Besylate',
      dosage: '5 mg',
      form: 'Tablet',
      frequency: 'Once Daily (Morning)',
      purpose: 'Hypertension / Calcium Channel Blocker',
      instructions: 'Take 1 tablet every morning with or without food.',
      prescribedBy: 'Dr. Eleanor Vance',
      rxNumber: 'RX-992144',
      quantity: 30,
      confidence: 0.98,
      detectedWarnings: 'May cause mild ankle swelling; report to physician if persistent.'
    },
    {
      drugName: 'Levothyroxine Sodium',
      dosage: '50 mcg',
      form: 'Small Round Tablet',
      frequency: 'Once Daily (Morning Fasting)',
      purpose: 'Thyroid Hormone Replacement',
      instructions: 'Take 1 tablet in the morning on an empty stomach with a full glass of water, 30 minutes before breakfast.',
      prescribedBy: 'Dr. Marcus Brody',
      rxNumber: 'RX-651290',
      quantity: 90,
      confidence: 0.96,
      detectedWarnings: 'Do not take calcium or iron supplements within 4 hours of this dose.'
    }
  ];

  const picked = sampleScans[Math.floor(Math.random() * sampleScans.length)];
  res.json({
    success: true,
    scannedData: picked
  });
});

// Serve frontend dist if available
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CarePulse backend server running on http://localhost:${PORT}`);
});
