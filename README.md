# 🌟 CarePulse Nexus | Smart Elderly Care & Medication Management Platform

> **PromptWars × Catalyst | Build with AI Challenge Entry**
> An interconnected, accessible healthcare ecosystem designed to empower elderly individuals, streamline clinical caregiving, and bring true peace of mind to families.

---

## 🚀 Live Application URL
- **Local Web App:** https://carepulse-elderly-care-platform-2.onrender.com/

---

## 📖 Overview & Problem Statement
Elderly individuals managing multiple chronic conditions (hypertension, type 2 diabetes, osteoarthritis) face complex medication schedules, dietary restrictions, and frequent doctor visits. Family members worry about missed doses, while caregivers lack a consolidated, real-time audit trail.

**CarePulse Nexus** solves this with a **shared multi-persona ecosystem** protected by secure passcode-based access. It combines **accessible elderly-centric design**, **clinical medication & inventory management**, **transparent family peace-of-mind telemetry**, **proactive email notification engine**, and **next-generation AI capabilities**.

---

## 🔑 Passcode-Based Access (Multi-Persona Shared Ecosystem)

The platform provides role-appropriate views tailored to each stakeholder:

| Persona | Passcode | Access Capabilities |
| :--- | :--- | :--- |
| **👵 Elderly Individual** *(Margaret Wilson, 78)* | `1234` | Large typography, tactile pillbox buttons, audio read-aloud guidance, speech recognition commands, one-tap "I Took This", daily mood check-in, 1-touch Emergency SOS. |
| **🩺 Caretaker / Nurse** *(David Martinez, RN)* | `4321` | Full medication CRUD, dosage scheduling, inventory tracking & refill requests, clinical drug-drug interaction analyzer, blood pressure/glucose logging, doctor appointments. |
| **👨‍👩‍👧 Family Guardian** *(Sarah Wilson, Daughter)* | `9876` | Real-time "Peace of Mind" activity stream, 14-day adherence streak tracker, 7-day compliance visual grid, "Send Love & Cheer" message board with photo stickers. |

> *A quick-switch demo bar is built directly into the Passcode Modal for seamless evaluation.*

---

## ✨ Key Features & Capabilities

### 1. 💊 Smart Medication Management & Visual Pillbox
- **Visual Pill Representation**: Distinctive pill shapes (round, oval, capsule) and colors for senior recognition.
- **Time Slot Grouping**: Categorized by Morning (08:00 AM), Afternoon (01:00 PM), Evening (06:00 PM), and Bedtime (09:00 PM).
- **Tactile Actions**:
  - `I TOOK THIS`: One-tap confirmation with synthesized audio chime, spoken voice feedback, inventory decrement, and instant family notification.
  - `Snooze 15m`: Gentle deferral with automatic reminder follow-up.
  - `Skip with Reason`: Prompts for clinical reason (e.g., nausea, fasting) and notifies caregiver.
- **Automatic Refill Tracker**: Counts remaining pills and automatically generates low-supply warnings when stock drops below threshold.

### 2. 📧 Proactive Email Notification & Reminder Engine
- **Automated Triggers**:
  - **Missed Medication Alert**: Dispatches urgent alert to family and caregiver if a dose is overdue by 45 minutes.
  - **Upcoming Dose Notice**: Pre-dose reminder with dietary instructions (with food / full glass of water).
  - **Low Supply Notice**: Alerts pharmacy and nurse when fewer than 7 pills remain.
  - **Doctor Appointment Reminder**: 24-hour advance reminder with pre-visit checklist and fasting prep instructions.
  - **Emergency SOS Broadcast**: Urgent multi-channel alert with patient address, allergies, and emergency medical card.
- **Interactive Email Hub**: In-app rendered HTML email client allowing reviewers to inspect every dispatched email in real-time.
- **Live Email Sandbox**: Reviewers can enter their own personal email to test live delivery via Nodemailer / API.

### 3. 📅 Doctor Appointments & Daily Healthcare Routines
- **Doctor Appointments**:
  - Details specialist, clinic address, companion assigned, and duration.
  - **Pre-Visit Preparation**: Mandatory fasting rules, logbook reminders, transportation planning.
  - **1-Click Actions**: Send instant email reminder, view doctor summaries from past consultations.
- **Daily Healthcare Routines**:
  - **Hydration Tracker**: Interactive 8-glasses water goal to support kidney filtration on Metformin.
  - **Gentle Morning Walk**: 20-minute mobility routine for joint lubrication.
  - **Routine Vitals Check**: Daily blood pressure and blood glucose checks.

### 4. 🤖 Beyond Basic Reminders: Aura AI Companion & Vision Scanner
- **Conversational Health Assistant**: Seniors and caregivers can ask plain-English questions:
  - *"Why do I take Metformin?"*
  - *"Can I take aspirin with my blood pressure medicine?"* (AI checks contraindications!)
  - *"What pills do I have left today?"*
  - Built-in **Text-to-Speech** (reads replies aloud) and **Speech Recognition** (voice dictation).
- **AI Prescription Bottle & Pill Scanner (Vision OCR)**:
  - Points camera or simulates scanning a medication box.
  - Extracts drug name, dosage, schedule, prescribing physician, and safety cautions.
  - **1-Click Regimen Integration**: Adds scanned prescription directly to the senior's schedule.
- **Clinical Drug-Drug Interaction Analyzer**: Cross-analyzes active medications and provides safety scores and clinical cautions.

### 5. 🚨 Emergency 1-Touch SOS System
- 5-second countdown with siren chime to cancel accidental presses.
- Dispatches emergency broadcast emails to all caregivers.
- Displays emergency **Medical ID Card**: Blood type (O+), severe allergies (Penicillin, Sulfa), current medications, home address, and one-tap emergency call buttons.

### 6. ♿ Deep Accessibility Features
- **Adjustable Typography**: Normal (`A`), Large (`A+`), and Extra-Large (`A++`) font sizes.
- **High Contrast Mode**: High-visibility yellow-on-black theme tailored for visual impairments.
- **Web Speech Synthesis**: Audio read-aloud for any medication instruction or appointment summary.
- **Web Audio Oscillators**: Clear harmonic chimes (success, reminder, alert) that work in any browser without external assets.

---

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Web Speech API, Web Audio API
- **Backend**: Node.js, Express, Nodemailer, RESTful JSON Persistence API
- **Design System**: Google Material 3 / Modern Warm Healthcare Palette

---

## 🏃 Running the Application

```bash
# Navigate to the project directory
cd C:\Users\user\.gemini\antigravity\scratch\elderly-care-platform

# Install dependencies (if not already installed)
npm install

# Start the fullstack application
node server/index.js
```

Open https://carepulse-elderly-care-platform-2.onrender.com/
