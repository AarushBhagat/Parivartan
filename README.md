# 🌍 Parivartan – AI-Powered Civic Grievance Management Platform

<div align="center">

![Platform](https://img.shields.io/badge/Platform-Full%20Stack-blue?style=for-the-badge)
![React Native](https://img.shields.io/badge/React%20Native-Mobile-61DAFB?style=for-the-badge\&logo=react)
![React](https://img.shields.io/badge/React-Web-61DAFB?style=for-the-badge\&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge\&logo=node.js)
![Firebase](https://img.shields.io/badge/Firebase-Cloud-FFCA28?style=for-the-badge\&logo=firebase)
![AWS S3](https://img.shields.io/badge/AWS-S3-FF9900?style=for-the-badge\&logo=amazonaws)
![Python](https://img.shields.io/badge/Python-AI_Service-3776AB?style=for-the-badge\&logo=python)

### Empowering citizens to report civic issues while enabling authorities to resolve them efficiently through AI-assisted workflows and real-time updates.

</div>

---

# 📖 Overview

**Parivartan** is a scalable, AI-powered civic grievance management platform that connects **citizens**, **government staff**, and **administrators** through a unified ecosystem.

The platform allows citizens to report civic problems with images and location data, while authorities can efficiently assign, monitor, and resolve issues using dedicated dashboards.

An AI-powered processing service enriches reported issues with severity levels and intelligent categorization to accelerate resolution.

---

# ✨ Key Features

### 📱 Citizen Application

* Secure Authentication
* AI-assisted Issue Reporting
* Image Upload Support
* GPS-based Location Tracking
* Interactive Map View
* Complaint History
* Live Complaint Status Tracking
* User Profile Management

### 👨‍💼 Staff Dashboard

* Secure Staff Login
* Department-wise Issue Management
* Complaint Assignment
* Status Updates
* Work History
* Real-time Notifications
* Dashboard Analytics

### 🌐 Web Portal

* Public Grievance Portal
* Complaint Search & Tracking
* Administrative Dashboard
* Filtering & Sorting
* Department Management

### 🤖 AI Processing Service

* Real-time Streaming Pipeline
* Intelligent Categorization
* Severity Prediction
* Automated Data Enrichment
* Live Event Streaming

---

# 🏗️ System Architecture

```text
                         Citizens
                             │
                             ▼
                  📱 Mobile Application
                             │
                             ▼
                    Express REST API
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
 Firebase Auth         Firestore DB         AWS S3 Storage
         │                   │                   │
         └──────────────┬────┴───────────────────┘
                        │
                        ▼
              🤖 Pathway AI Processing
          ┌──────────────────────────────┐
          │ • Severity Detection          │
          │ • Issue Categorization        │
          │ • Real-time Processing        │
          └──────────────────────────────┘
                        │
                        ▼
              👨‍💼 Staff Dashboard
                        │
                        ▼
                 🌐 Admin Web Portal
```

---

# 📂 Repository Structure

```text
Parivartan
│
├── backend/                     # Express.js Backend APIs
├── Staffapp/                    # Staff Dashboard
├── portal/                      # React Web Portal
├── parivartan-citizen-app/      # Expo React Native App
├── pathway-service/             # AI Processing Service
│
├── README.md
└── package.json
```

---

# 🛠️ Tech Stack

| Category        | Technologies                                      |
| --------------- | ------------------------------------------------- |
| Frontend        | React, React Native, Expo, TypeScript, JavaScript |
| Backend         | Node.js, Express.js                               |
| Database        | Firebase Firestore                                |
| Authentication  | Firebase Authentication                           |
| Cloud Storage   | AWS S3                                            |
| AI              | Python, Pathway                                   |
| Build Tools     | Vite, Babel                                       |
| Version Control | Git & GitHub                                      |

---

# 🚀 Quick Start

## Clone Repository

```bash
git clone https://github.com/AarushBhagat/Parivartan.git
cd Parivartan
```

---

# ⚙️ Backend Setup

Install dependencies

```bash
npm install --prefix backend
```

Run the backend

```bash
npm start
```

Server starts on

```text
http://localhost:5000
```

---

# 📱 Mobile App Setup

```bash
cd parivartan-citizen-app
npm install
npx expo start
```

---

# 👨‍💼 Staff Dashboard

```bash
cd Staffapp
npm install
npm run dev
```

---

# 🌐 Web Portal

```bash
cd portal
npm install
npm start
```

---

# 🤖 AI Processing Service

Create a virtual environment

```bash
cd pathway-service

python -m venv .venv
```

Activate environment

### Windows

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run service

```bash
python main.py
```

---

# 🔄 Data Flow

```text
Citizen Reports Issue
          │
          ▼
Express Backend API
          │
          ▼
Store Raw Complaint
     (Firestore)
          │
          ▼
Forward to AI Service
          │
          ▼
AI Processing Pipeline
   • Category Detection
   • Severity Analysis
   • Data Enrichment
          │
          ▼
Processed Complaint
          │
          ▼
Firestore + Live Stream
          │
          ▼
Staff Dashboard & Web Portal
```

---

# ⚡ Real-Time Processing

The Pathway streaming service automatically:

* Receives newly reported issues
* Performs AI-based enrichment
* Calculates severity
* Categorizes complaints
* Streams processed results
* Updates Firestore instantly

No service restart is required.

---

# 🔐 Environment Variables

## Backend

```env
PORT=5000
PATHWAY_SERVICE_URL=http://localhost:8080
```

---

## Pathway Service

```env
PATHWAY_PORT=8080
PATHWAY_SSE_PORT=8081
FIREBASE_CREDENTIALS=../backend/config/serviceAccountKey.json
```

---

# 📸 Screenshots

> Add screenshots of:
>
> * Citizen Mobile App
> * Staff Dashboard
> * Admin Portal
> * AI Processing Dashboard
> * Complaint Workflow

---

# 🚀 Future Improvements

* AI-based Image Analysis
* Push Notifications
* Multi-language Support
* Predictive Analytics
* Smart Complaint Routing
* Offline Complaint Submission
* Government API Integration
* Advanced Analytics Dashboard

---

# 👨‍💻 Developer

**Aarush Bhagat**

* GitHub: https://github.com/AarushBhagat
* LinkedIn: https://www.linkedin.com/in/aarushbhagat03/

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a Star!

**Building technology for smarter and more responsive cities. 🌍**

</div>
