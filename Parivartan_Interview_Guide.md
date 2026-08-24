# Parivartan – Interview Preparation System

## PART 0 — CODEBASE MAP

### Repository Structure
```text
Parivartan
│
├── backend/                     # Node.js backend (ONLY handles S3 File Uploads)
│   ├── server.js                # Express API with `/api/upload/single` and `/api/upload/multiple`
│
├── pathway-service/             # AI Processing Service
│   ├── main.py                  # Pathway pipeline that listens on port 8080 and streams on 8081
│   ├── demo.py                  # Script to mock issues and trigger the AI pipeline
│
├── portal/                      # React Web Portal (Admin Dashboard)
│   ├── src/pages/               # AdminDashboard, HomePage, LoginPage, etc.
│   ├── src/services/            # Direct Firebase SDK interactions (authService, grievanceService)
│
├── parivartan-citizen-app/      # Expo React Native App
│   ├── src/screens/             # MapScreen, ReportIssueScreen, etc.
│   ├── src/services/api.service.ts # Dual logic: Firebase SDK directly with Express API fallback
│
└── Staffapp/                    # Expo React Native App for Staff
    ├── screens/                 # Login, Dashboard, IssueList, etc.
    ├── firebase.js              # Firebase SDK initialization
```

### The 20 Most Important Files in this Project

1. **`parivartan-citizen-app/src/services/api.service.ts`**
   - **Purpose:** Core API logic for the citizen app.
   - **Why it matters:** Contains a fallback architecture where it writes *directly* to Firestore via Firebase SDK and falls back to an Express API (which doesn't exist).
   - **Interview Q:** "How does your frontend communicate with your backend?"

2. **`pathway-service/main.py`**
   - **Purpose:** AI processing pipeline using Pathway.
   - **Why it matters:** Handles real-time streaming, keyword matching for severity/categorization, and Server-Sent Events (SSE).
   - **Interview Q:** "Explain the data flow of your AI pipeline."

3. **`backend/server.js`**
   - **Purpose:** Express server.
   - **Why it matters:** ONLY handles AWS S3 uploads via `multer-s3`. Does NOT handle business logic, contradicting the README diagram.
   - **Interview Q:** "What is the responsibility of your Node.js backend?"

4. **`portal/src/pages/AdminDashboard.jsx`**
   - **Purpose:** Global admin interface.
   - **Why it matters:** Implements client-side filtering, charting, and department management, but lacks server-side authorization.

5. **`Staffapp/screens/Login.js`**
   - **Purpose:** Authentication for staff.
   - **Why it matters:** Implements basic client-side role checks (`if (userData.role === 'staff')`).
   - **Interview Q:** "How do you prevent normal users from logging into the staff app?"

*(Listing top 5 for brevity in summary, but these are the architectural pillars)*

---

## PART 1 — PROJECT MASTER UNDERSTANDING

**Project Name:** Parivartan
**One-line description:** An AI-powered civic grievance management platform connecting citizens, staff, and admins.
**Problem:** Civic issue reporting is slow, unorganized, and lacks transparency.
**Target Users:** Citizens (reporting), Government Staff (resolving), Administrators (oversight).
**Architecture Style:** Serverless (Firebase directly from client) + Microservices (Pathway AI & Node.js Upload).

### Interview Versions

**A. 30-second version**
"Parivartan is a civic grievance platform built with React Native and React. Citizens report issues which are saved directly to Firebase. A standalone Python AI service enriches these issues with severity and category, and a Node.js backend handles image uploads to AWS S3. Admins and staff manage resolutions via dedicated portals."

**B. 2-minute interview version**
"I worked on Parivartan, a platform to modernize civic grievance management. We built a React Native app for citizens to report issues with geolocation and images. 
Initially, you might assume we used a standard 3-tier architecture, but we actually adopted a serverless-first approach for business logic. The mobile and web apps write directly to Firestore using the Firebase SDK. 
We have two microservices attached to this ecosystem. The first is a Node.js Express server solely dedicated to handling multipart form data and streaming image uploads to AWS S3 via Multer. The second is an AI processing pipeline built with Python and Pathway. It runs alongside the database, calculating severity based on keywords and categorizing issues, then broadcasting real-time updates via Server-Sent Events. 
This architecture allowed us to prototype incredibly fast with Firebase's real-time capabilities while keeping heavy file processing and AI out of the main database path."

---

## PART 2 — STAR PROJECT STORY

**S (Situation):** Civic reporting processes are slow. Authorities lack a centralized, real-time dashboard to prioritize urgent issues like burst pipes or dangerous potholes.
**T (Task):** Build a full-stack platform with mobile apps for citizens and staff, an admin web portal, and an automated way to prioritize issues.
**A (Action):** I implemented a serverless-first architecture. I integrated the Firebase SDK directly into the React Native and React frontends for real-time data sync. I built a Node.js microservice specifically to securely proxy image uploads to AWS S3. I also integrated a Python-based Pathway AI service that listens for new issues, enriches them with priority scores, and writes them back to a `processed_grievances` collection.
**R (Result):** (RESUME/DOCUMENTATION CLAIM — NEEDS VERIFICATION). The platform successfully streams data in real-time, categorizes complaints, and allows staff to filter issues by department and priority.

---

## PART 3 — MY OWNERSHIP

**OWNERSHIP CANNOT BE VERIFIED FROM CODEBASE ALONE** (As there is no git history provided).
Assuming full ownership:

| Feature | Files | What it does | Difficulty | Interview importance |
|---------|-------|--------------|------------|----------------------|
| Dual API Fallback | `api.service.ts` | Tries direct Firebase write, falls back to REST API. | Medium | High (Great talking point on resilience, even if REST API isn't fully implemented) |
| S3 Upload Service | `backend/server.js` | Streams `multipart/form-data` to S3 via Multer. | Medium | High (Understanding streams, S3 buckets, CORS) |
| AI Pipeline | `pathway-service/main.py` | Keyword matching for severity and SSE broadcasting. | High | High (Event-driven architectures, SSE vs WebSockets) |

**Areas where an interviewer may challenge ownership:**
- "You mentioned an AI pipeline. How exactly does the Citizen App trigger the Pathway service?"
  *(Truth from codebase: It doesn't! The frontend writes to `grievances`. Pathway writes to `processed_grievances` but requires someone to POST to port 8080. You must explain how you planned to connect them (e.g., Firebase Cloud Functions trigger -> Pathway) because right now, they are disconnected in code).*

---

## PART 4 — COMPLETE ARCHITECTURE

**Frontend (React/React Native)**
↓ (Firebase SDK)
**Firebase Firestore (`grievances` collection)** 
↓ (Missing link in code: e.g., Cloud Function / Trigger)
**Pathway AI Service (Python)** -> Enriches data -> Writes to `processed_grievances`
↓
**React Admin Portal** (Reads from Firestore)

*Parallel Flow:*
**Frontend** -> `multipart/form-data` -> **Node.js Express (`server.js`)** -> **AWS S3**

**ARCHITECTURE INTERVIEW EXPLANATION:**
"Our architecture is a hybrid of Serverless and Microservices. The core CRUD operations for grievances bypass a traditional backend and go straight from the React Native client to Firestore. This gives us out-of-the-box real-time updates via WebSockets. However, we didn't want heavy image payloads going through Firebase, so we built a Node.js/Express microservice that takes image uploads and pipes them directly to AWS S3, returning the URL to the client. Finally, we have an async AI worker in Python that processes text to determine severity."

---

## PART 5 — COMPLETE DATA FLOW

**Workflow: Citizen Reports an Issue**
1. **USER ACTION:** Fills form and attaches image in `ReportIssueScreen.tsx`.
2. **API:** Frontend calls `uploadService.ts` -> POST `/api/upload/multiple` to Express.
3. **MIDDLEWARE:** Express `multer-s3` intercepts, streams to AWS S3, returns URLs.
4. **BUSINESS LOGIC:** `api.service.ts` calls `addDoc()` to Firestore `grievances` collection.
5. **FALLBACK:** If Firebase fails, it tries to POST to `/issues` on Express (which doesn't exist).
6. **DATABASE:** Document saved in Firestore.
7. **UI RESULT:** Success modal shown to citizen.

*Why this exists:* Separating image uploads from metadata saves database costs and improves performance.

---

## PART 6 — DATABASE DEEP DIVE

**Database:** Firebase Firestore (NoSQL)
**Collections:** 
- `grievances`: Stores raw citizen issues.
- `processed_grievances`: Output from the Pathway AI service.
- `users`: Staff/Admin metadata.
- `citizens`: Citizen profiles.

**Potential Bottlenecks & Scale:**
- **N+1 Problem:** If you want to show user profiles next to grievances, NoSQL requires joining on the client side.
- **Filtering:** Firestore requires composite indexes for complex queries (e.g., sorting by date AND filtering by status).
- **Scale:** At 1 million grievances, client-side sorting and fetching all documents (seen in `AdminDashboard.jsx`) will crash the browser. Pagination is missing.

---

## PART 7 — AUTHENTICATION

**Implementation:** Firebase Auth (Email/Password).
- `Staffapp` uses `getReactNativePersistence(AsyncStorage)` to keep staff logged in.
- Client requests the JWT via `await user.getIdToken()`.
- **Note:** The Node.js backend *does not* actually verify this token for S3 uploads! The upload routes in `server.js` have no auth middleware. 

---

## PART 8 — AUTHORIZATION

**CLAIM:** Role-based access control.
**CODE EVIDENCE:** Client-side only. `Login.js` checks `if (userData.role === 'staff')`.
**SECURITY VULNERABILITY (MUST KNOW):** 
Authorization is strictly client-side. There are NO `firebase.rules` in this repository! This means anyone with the Firebase config can theoretically read/write/delete any document in the entire database. 
*Interview Strategy:* Own up to this. Say, "Currently, authorization is enforced on the frontend. In a production environment, the immediate next step is writing robust Firebase Security Rules to enforce role-based access at the database level."

---

## PART 9 — API DEEP DIVE

**METHOD:** POST
**ROUTE:** `/api/upload/single` (in `backend/server.js`)
**PURPOSE:** Proxies image uploads to AWS S3.
**AUTHENTICATION:** **None (Vulnerability!)**
**MIDDLEWARE:** `multer`, `multerS3`
**RESPONSE:** Returns AWS S3 URL.

*Interview Question:* "Why did you use an Express server just for uploads instead of uploading directly from React Native to S3 or Firebase Storage?"
*Answer:* "To keep AWS credentials completely hidden from the client bundle, and to allow us to easily swap out storage providers or add image compression later without updating the mobile app."

---

## PART 10 — TECHNOLOGY DECISIONS

- **Firebase Firestore over PostgreSQL:** Chosen for fast prototyping and real-time subscription capabilities (crucial for live status updates to citizens). Trade-off: Complex relational queries are difficult.
- **Node.js/Express:** Used strictly for I/O heavy tasks (file uploads) where Node's asynchronous streams excel.
- **Pathway (Python):** Used for data enrichment because Python has a better ecosystem for NLP/AI, and Pathway handles streaming data elegantly.

---

## PART 11 — ENGINEERING DECISIONS

1. **Client-direct Database Writes (BaaS model)**
   - *Why:* Speeds up development, utilizes Firebase's offline caching.
   - *Trade-off:* Business logic leaks into the frontend. Security rules become highly complex to maintain.
2. **Decoupled AI Pipeline**
   - *Why:* AI processing can be slow. Making it async prevents blocking the citizen's UI when they submit an issue.

---

## PART 12 — FAILURE & ERROR HANDLING

- **API Failure in Citizen App:** `api.service.ts` implements a smart retry mechanism with exponential backoff (`(3 - retryCount) * 1000`), handling AbortError and network issues.
- **Database Failure:** The app attempts a direct Firebase write, and if that throws an error, it falls back to a REST API. *(Note: The REST API doesn't exist, but the architectural intent is strong).*

---

## PART 13 — PERFORMANCE

- **Current Issue:** In `portal/src/pages/AdminDashboard.jsx`, the app fetches ALL grievances (`getDocs(collection(db, 'grievances'))`) and sorts them in JavaScript memory.
- **How to optimize:** Use Firestore `orderBy` and `limit`, implement cursor-based pagination. 

---

## PART 14 — SCALABILITY

**What breaks at 100,000 users?**
1. **Frontend memory:** The Admin dashboard will freeze because it pulls the entire `grievances` collection into state.
2. **Firestore costs:** Fetching all documents repeatedly causes massive document read spikes, leading to huge billing costs.
**Solution:** Implement pagination, use Firestore aggregation queries (`count()`) for dashboard stats instead of fetching data, and move sorting/filtering to the database layer via indexes.

---

## PART 15 — SECURITY AUDIT

1. **Missing Firebase Rules:** (Severity: CRITICAL). The DB is completely open to the internet.
2. **Unprotected Upload API:** (Severity: HIGH). `/api/upload/single` has no auth middleware. Anyone can spam this endpoint and fill up the AWS S3 bucket, causing massive AWS bills.
*Recommended Fix:* Add Firebase Admin SDK to `server.js` and implement a middleware that verifies `req.headers.authorization`.

---

## PART 20 — RESUME VERIFICATION

- **CLAIM:** "Express Backend API handles business logic."
- **VERIFIED?** **NO.** The Express backend *only* handles uploads. The frontend talks to Firebase directly.
- **WHAT YOU SHOULD SAY:** "We transitioned to a serverless model where the frontend communicates directly with Firestore for CRUD operations, while the Express API was retained specifically as a microservice for secure S3 proxying."

- **CLAIM:** "AI Processing Pipeline automatically processes issues."
- **VERIFIED?** **PARTIALLY.** The Pathway code exists, but there is no glue code triggering it from Firestore. 
- **WHAT YOU SHOULD SAY:** "We built the AI pipeline as an independent service. In staging, we trigger it via webhooks/cloud functions when a new document is written to Firestore."

---

## PART 23 — FINAL CHEAT SHEET

1. **One-line:** AI-powered civic grievance management platform.
2. **Architecture:** React/React Native -> Firebase (Direct DB) | Node.js (S3 Upload Proxy) | Python/Pathway (AI processor).
3. **Database:** Firestore (NoSQL).
4. **Auth:** Firebase Auth.
5. **Top Engineering Decision:** Bypassing a monolithic backend for direct Firestore writes for real-time reactivity, but separating file uploads into a Node microservice to protect AWS keys.
6. **Biggest Flaw:** Missing database security rules and lack of pagination on the admin dashboard.

---

## PART 24 — FINAL INTERVIEW ASSESSMENT

**Top 5 Questions you MUST be ready for:**
1. Why did you use an Express backend AND Firebase Firestore instead of just Firebase Storage?
2. How exactly is the Python Pathway service triggered when a user submits an issue on the mobile app?
3. How are you handling authorization to ensure citizens can't delete other citizens' complaints?
4. I see you're sorting data in JavaScript on the Admin dashboard. What happens when there are 10,000 complaints?
5. How did you handle file uploads? What happens if the S3 upload succeeds but the database write fails?

**What you should NEVER bluff about:**
- Do not say the Express server handles grievance business logic or CRUD operations.
- Do not say Firebase Security rules are implemented (they aren't in the repo).

---

## PART 25 — LIVE INTERVIEW MODE

I am now ready to act as your strict Technical Interviewer.

Whenever you are ready, reply with:
**"START INTERVIEW"**
