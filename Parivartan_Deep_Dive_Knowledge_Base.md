# Parivartan – Complete Technical Deep Dive & Interview Knowledge Base

This is the exhaustive, code-grounded engineering documentation for Parivartan. It is designed to prepare you for the most rigorous technical cross-examinations by Senior and Staff Engineers.

---

## PART 1 — PROJECT FUNDAMENTALS

### What is happening?
Parivartan is a tri-platform civic grievance management system. It allows citizens to report municipal issues (e.g., potholes, water leaks) via a mobile app, tracks those issues in a centralized database, processes them for severity and category using an AI microservice, and allows government staff/admins to resolve them via dedicated portals.

### Where is it implemented?
- **Citizen App:** `parivartan-citizen-app/` (React Native/Expo)
- **Staff App:** `Staffapp/` (React Native/Expo)
- **Admin Portal:** `portal/` (React.js Web)
- **Upload Service:** `backend/` (Node.js/Express)
- **AI Service:** `pathway-service/` (Python)
- **Database:** Firebase Firestore (Cloud NoSQL)

### Why was it implemented this way?
The project uses a **BaaS (Backend-as-a-Service)** architecture, primarily relying on Firebase for business logic. This drastically reduces the time to market, as developers don't need to write CRUD APIs for every single data model. The frontend clients connect directly to the database. However, to prevent large files from clogging the Firebase database or passing AWS credentials to the client, a dedicated Node.js microservice was implemented solely for S3 file uploads.

### Alternative approaches
- **Traditional 3-Tier Architecture:** A central Node.js or Python backend that handles *all* requests (Auth, CRUD, Uploads).
- **GraphQL Federation:** A unified API gateway that routes requests to microservices.

### Trade-offs
- **Advantage:** Blazing fast real-time updates via Firebase WebSockets. Minimal backend boilerplate.
- **Disadvantage:** Business logic leaks into the frontend (`api.service.ts` and `grievanceService.jsx` handle data manipulation). Security is heavily reliant on Firestore Security Rules, which are currently missing from the repository.

---

## PART 2 — COMPLETE ARCHITECTURE

### The Hybrid Architecture Walkthrough

Parivartan does not follow a standard API-driven architecture. It uses a **Hybrid Serverless + Microservice Pattern**.

#### Flow 1: The Core Data Flow (Client ↔ Database)
When a user interacts with text data (e.g., viewing complaints, reading profiles):
1. **USER** opens the app.
2. **UI** renders the React Native component (`ReportIssueScreen.tsx`).
3. **Event Handler** captures the form data.
4. **Service Layer** (`issueService.ts`) is called.
5. **Firebase SDK** directly creates a WebSocket connection to Google Cloud.
6. **Database (Firestore)** receives a direct write command (`addDoc(collection(db, 'grievances'))`).
7. **Response** flows back through the active WebSocket.
8. **UI** updates with the new issue ID.

*Notice what is missing? There is no Express backend handling this request. The client talks directly to the database.*

#### Flow 2: The File Upload Flow (Client ↔ Express ↔ AWS)
When a user attaches an image:
1. **USER** selects an image.
2. **Service Layer** (`uploadService.ts`) intercepts this before the database write.
3. **API Request** is made to `POST /api/upload/multiple` via `fetch`.
4. **Backend Route** (`backend/server.js`) receives the `multipart/form-data`.
5. **Middleware** (`multer` and `multer-s3`) processes the stream.
6. **External Service** (AWS S3) receives the chunks and saves the file.
7. **Response** containing the S3 URL is sent back to the client.
8. **Client** attaches this URL to Flow 1 and writes it to Firebase.

#### Flow 3: The AI Processing Flow
1. **External Service** (Pathway Python service on port 8080) must be manually triggered via POST request (currently via `demo.py`).
2. **Business Logic** (`main.py`) processes the text, uses a UDF (User Defined Function) to match keywords ("pothole", "accident"), and calculates a severity score.
3. **Database** (Firestore) receives the processed data into the `processed_grievances` collection.
4. **Server-Sent Events (SSE)** broadcasts the update on port 8081.

---

## PART 3 — FRONTEND DEEP DIVE

### React & React Native Implementation
React is used across all three user interfaces. In the mobile apps (`parivartan-citizen-app` and `Staffapp`), React Native provides the native bridging.

### State and Data Flow
- **State Management:** The app heavily relies on local component state (`useState`) and React Context (`AuthContext.tsx`). There is no global state manager like Redux or Zustand.
- **Routing:** Handled by React Navigation (`@react-navigation/native` and `stack`).

### Code-Level Example: Reporting an Issue
**File:** `parivartan-citizen-app/src/screens/ReportIssueScreen.tsx`
1. **State:** Stores `formData`, `mediaFiles`, and `location`.
2. **Location Hook:** Uses `expo-location` to get GPS coordinates on mount.
3. **Submit Function:** `handleSubmit` executes.
4. **Upload Phase:** If `mediaFiles` exist, it calls `uploadService.uploadPhotos()`.
5. **DB Phase:** Calls `issueService.createIssue()` with the form data and the returned S3 URLs.

### Why this approach?
React Context is sufficient for simple auth state. Skipping Redux prevents over-engineering for a prototype.

### Scalability & Performance Issues
Because there is no caching layer (like React Query or Apollo), every time a user navigates between screens, data might be re-fetched. In the `AdminDashboard.jsx`, the app fetches the entire `grievances` collection into memory to calculate stats, which is a catastrophic performance bottleneck at scale.

---

## PART 4 — BACKEND DEEP DIVE

### What is happening?
The "Backend" (`backend/server.js`) is highly specialized. It is a single-file Express application whose sole responsibility is proxying image uploads to AWS S3.

### What code is responsible?
**File:** `backend/server.js`
- **Framework:** Express.js
- **Middleware:** `cors`, `multer`, `multer-s3`, `@aws-sdk/client-s3`
- **Routes:** 
  - `POST /api/upload/single`
  - `POST /api/upload/multiple`
  - `DELETE /api/upload/:filename`

### Step-by-step execution (Upload Multiple)
1. Request hits `POST /api/upload/multiple`.
2. The `upload.array('photos', 5)` middleware intercepts the request.
3. `multer-s3` streams the incoming binary data directly to the AWS S3 bucket defined in `process.env.AWS_BUCKET_NAME`.
4. AWS returns the file locations.
5. The controller maps these locations and sends `{ success: true, files: [{url: '...'}] }` back to the client.

### Trade-offs
- **Pros:** Prevents AWS credentials from being shipped in the mobile app bundle. Allows streaming without saving files to the local disk of the server (highly memory efficient).
- **Cons:** It's another service to maintain and deploy just for file uploads.

### Failure Scenarios
If AWS goes down or the S3 bucket policies are misconfigured, `multer-s3` will throw an error, which the backend catches and returns as a 500 status. The mobile app (`ReportIssueScreen.tsx`) catches this and explicitly asks the user: "Could not upload photos to cloud storage. Do you want to submit without photos?". This is excellent graceful degradation.

---

## PART 5 — DATABASE DEEP DIVE

### The Firestore Schema
Firestore is a NoSQL document database. Data is stored in collections of JSON-like documents.

**Collection 1: `grievances`**
- **Purpose:** Stores the raw issues reported by citizens.
- **Important Fields:**
  - `title`, `description`, `department` (Strings)
  - `location` (Map containing lat, lng, address)
  - `photoUrls` (Array of Strings pointing to S3)
  - `status` (String: 'pending', 'in-progress', etc.)
  - `createdAt` (Timestamp)
- **Who writes:** Citizen App.
- **Who reads:** Admin Portal, Staff App.

**Collection 2: `users`**
- **Purpose:** Stores staff and admin metadata.
- **Important Fields:**
  - `uid` (Matches Firebase Auth UID)
  - `userType` (String: 'admin', 'staff', 'department')
  - `department` (String, nullable)

### Code-Level DB Operation
**File:** `portal/src/services/authService.jsx`
```javascript
const userDocRef = doc(db, 'users', user.uid);
const userDoc = await getDoc(userDocRef);
// Reads the document directly from Firestore
```

### Why Firestore?
Real-time listeners (`onSnapshot`) allow the UI to update instantly when a grievance status changes without the need for manual WebSocket implementation.

### Missing Features & Scaling Problems
- **No SQL Joins:** You cannot easily fetch a grievance and the user's profile in one query.
- **No Aggregation Queries in UI:** `AdminDashboard.jsx` pulls ALL documents to count them (`filteredGrievances.length`). At 100,000 grievances, this pulls 100,000 JSON objects over the network to the browser, instantly crashing the tab and costing a massive amount in Firestore read operations.
- **Solution:** Use Firestore `count()` aggregation queries, implement pagination (`limit()`, `startAfter()`), and index fields like `department` and `status`.

---

## PART 6 — AUTHENTICATION & AUTHORIZATION

### Authentication (Who are you?)
- **Mechanism:** Firebase Authentication (Email/Password & Google OAuth).
- **Initialization:** `parivartan-citizen-app/src/firebase.ts` and `portal/src/services/firebase.js`.
- **Flow (`LoginScreen.tsx`):**
  1. User enters email/password.
  2. `signInWithEmailAndPassword(auth, email, password)` is called.
  3. Firebase validates and returns a JWT (JSON Web Token).
  4. The `AuthContext` listener (`onAuthStateChanged`) detects the token and updates the global `user` state.

### Authorization (What are you allowed to do?)
- **Current Implementation:** Purely Client-Side.
- **Code Evidence:** In `authService.jsx`, it checks `if (userData.userType !== userType) throw new Error(...)`. In `Staffapp/screens/Login.js`, it checks if the logged-in user belongs to the staff.
- **CRITICAL SECURITY FLAW:** Because there are NO Firebase Security Rules (`.rules`) defined in the repository, anyone with the Firebase configuration keys (which are public in the client bundle) can write a script to bypass the UI and read, modify, or delete the entire `grievances` collection.
- **Interview Answer:** "Currently, authorization is enforced via client-side routing and UI checks based on the `userType` field in the `users` collection. However, for production, this is a massive vulnerability. My immediate next step would be writing Firestore Security Rules. For example: `allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'admin';` to enforce role-based access control at the database layer."

---

## PART 7 — API DEEP DIVE

### The Upload API (`/api/upload/single`)
- **HTTP Method:** POST
- **Why POST:** We are creating a new resource (a file) on the server.
- **Request Body:** `multipart/form-data` (required for binary file transmission).
- **Validation:** Missing. (It doesn't validate if the file is actually an image or a malicious script).
- **Authentication:** **Missing.** The endpoint in `server.js` has no middleware verifying a JWT.
- **Vulnerability:** Anyone can hit this endpoint via Postman and upload terabytes of data to your AWS S3 bucket, causing an enormous AWS bill.
- **How to fix:** Add a middleware that checks `req.headers.authorization`, verifies the Firebase JWT using `firebase-admin`, and only proceeds if valid.

---

## PART 8 — FEATURE-BY-FEATURE DEEP DIVE

### FEATURE: AI Issue Processing

#### Purpose
Automatically categorize and assign priority to citizen grievances based on the text they submit, removing the need for human triaging.

#### Architecture
The `pathway-service` is a standalone Python microservice using the Pathway framework.

#### Code Evidence (`pathway-service/main.py`)
It defines a schema `class InputSchema(pw.Schema)` and listens on a REST connector on port 8080.
It applies a User Defined Function (UDF) `determine_severity` which looks for keywords:
- "pothole", "accident", "fire", "emergency" -> High
- "garbage", "waste", "cleaning" -> Medium

It then writes the output to Firebase:
`pw.io.firebase.write(enriched_data, ...)`

#### Trade-offs & Failures
- **The Disconnect:** The citizen app writes to `grievances`. The AI service listens on port 8080. There is no automated trigger connecting them in the repository! 
- **The Fix:** You need a Firebase Cloud Function that triggers `onCreate` of a new grievance document, which then makes an HTTP POST to the Pathway service.
- **Interview Strategy:** If asked how it runs automatically, admit the current gap. "Right now, it's decoupled and triggered via a demo script. In production, I would deploy a Cloud Function triggered by Firestore document creation to push the payload to the Pathway ingestion endpoint."

---

## PART 9 — EXTERNAL SERVICES & INTEGRATIONS

1. **AWS S3:** Used for object storage (images). Accessed via the Node.js backend using `@aws-sdk/client-s3`.
2. **Google Maps / Expo Location:** The app uses `expo-location` to grab the device's latitude and longitude, and reverse geocodes it into a readable address before saving to Firestore.
3. **Google OAuth:** Integrated via `expo-auth-session/providers/google` in the Citizen app to allow fast onboarding.

---

## PART 10 — BACKGROUND JOBS & NOTIFICATIONS

There are currently no background jobs (Cron) or push notifications (FCM) implemented in the codebase.
- **Interview Question:** "How would you notify a citizen when their issue is resolved?"
- **Answer:** "I would implement Firebase Cloud Messaging (FCM). I would write a Firebase Cloud Function that listens for `onUpdate` events on the `grievances` collection. If the `status` field changes to 'resolved', the function grabs the citizen's FCM token from their user profile and dispatches a push notification to their device."

---

## PART 11 — ERROR HANDLING & FAILURE

- **Frontend Network Failure:** `api.service.ts` implements a custom retry loop with exponential backoff: `const delay = (3 - retryCount) * 1000`. If Firebase fails to write, it pauses and tries again.
- **Partial State Failure:** What happens if the S3 image upload succeeds, but the Firestore database write fails? 
  - **Result:** You have orphaned images in AWS S3 that cost money but are not linked to any grievance.
  - **Solution:** Implement a cleanup cron job, or use a distributed transaction pattern (Saga), though a simple Cloud Function that deletes S3 files if no associated DB record exists after 24 hours is most practical.

---

## PART 12 — SECURITY (SECURITY AUDIT)

1. **Client-Side Trust (Critical):** The frontend dictates its own roles and writes directly to the DB. A malicious user can intercept the JavaScript and change their `userData.role` to 'admin'.
2. **Open Database (Critical):** No Firestore Security Rules.
3. **Unprotected APIs (High):** S3 upload endpoints have no Auth middleware.
4. **Secrets in Code (High):** S3 buckets and Firebase keys are hardcoded or passed directly to the client.

*Do not hide these in an interview. A Senior Engineer owns their technical debt.*

---

## PART 13 — PERFORMANCE

**The Dashboard Bottleneck:**
`portal/src/pages/AdminDashboard.jsx`
```javascript
const querySnapshot = await getDocs(collection(db, 'grievances'));
const docs = querySnapshot.docs.map(doc => ({...}));
setGrievances(docs);
```
- **Why it's slow:** It downloads every single grievance ever reported. If there are 50,000 potholes reported over 5 years, it downloads 50,000 records.
- **How to measure it:** Check the Chrome Network Tab for payload size, and Firebase Console for read quotas.
- **How to improve it:** 
  1. Only fetch issues from the last 30 days (`where("createdAt", ">", lastMonth)`).
  2. Implement cursor-based pagination.
  3. Use Firestore `count()` for the summary statistics instead of array `.length`.

---

## PART 14 — SCALABILITY

**System Design at Scale (1 Million Users)**

1. **Database:** Firestore scales automatically horizontally, BUT we hit a hard limit of 1 write per second on a single document. If millions of users upvote the exact same grievance simultaneously, the document write will fail.
   - *Fix:* Implement Distributed Counters (sharding the upvote count across multiple sub-collections).
2. **Backend:** The Node.js upload server will run out of memory or connections if 10,000 users upload photos simultaneously.
   - *Fix:* Containerize the Express app using Docker, deploy it to a managed orchestrator like Kubernetes or AWS ECS, and put it behind an Application Load Balancer (ALB) to autoscale horizontally based on CPU usage. Alternatively, bypass the backend entirely and use AWS S3 Pre-signed URLs generated securely by a Cloud Function.

---

## PART 15 — CONCURRENCY

**Race Condition Scenario:**
Two staff members open the same `IssueDetail.js` screen simultaneously.
Staff A changes status to "In Progress".
Staff B changes status to "Resolved".
Because they are using standard `setDoc` or `updateDoc` without transaction locks, whoever clicks "Save" last overwrites the other person's work.

**How to fix:**
Use Firestore Transactions (`runTransaction`). The transaction reads the current status. If the status has changed since the user loaded the page, the transaction aborts and notifies the user: "This issue was already modified by another user."

---

## PART 18 — TECHNOLOGY DECISIONS

**Decision:** Firebase (BaaS) over PostgreSQL/Express.
- **Problem:** Building standard CRUD APIs takes weeks. We needed a fast MVP.
- **Chosen:** Firebase Firestore.
- **Benefits:** Instant real-time WebSocket updates out of the box, offline caching for the mobile app (so citizens can report issues without cell service and it syncs when they get connection).
- **Costs:** Poor querying capabilities. You cannot perform complex relational joins or full-text search easily.
- **What I would change today:** If this platform grows to state-wide deployment, I would migrate the core data to PostgreSQL (using Prisma or TypeORM) and use Elasticsearch for searching complaints by text, keeping Firebase only for real-time notifications.

---

## PART 19 — ENGINEERING TRADE-OFFS

1. **Trade-off: Direct Client-to-DB Writes vs. Backend API**
   - *Decision:* Mobile app writes straight to Firestore.
   - *Gained:* Development speed, real-time UI, zero backend infrastructure for data models.
   - *Sacrificed:* Security control, business logic isolation (it's scattered across frontend files), and ability to easily integrate third-party services in the write path.

2. **Trade-off: Streaming Uploads vs Local Storage**
   - *Decision:* Using `multer-s3` to stream bits directly to AWS.
   - *Gained:* Node.js server uses almost zero memory because it doesn't save the file to its local disk first.
   - *Sacrificed:* If AWS is slow, the HTTP connection to the client stays open longer.

---

## PART 22 — INTERVIEW QUESTION BANK

**Q1: How does your frontend communicate with the backend?**
*Strong Answer:* "Because we prioritized real-time updates and development speed, we adopted a serverless-first architecture. The React Native app communicates directly with Firebase Firestore using the Firebase SDK for all CRUD operations. However, for handling heavy binary payloads, we built a dedicated Node.js Express microservice. The frontend makes a standard REST POST request to this service with multipart form data, which then securely proxies the image to AWS S3 and returns the URL."

**Q2: What happens if a user submits a grievance, the photo uploads to S3, but the database write fails?**
*Strong Answer:* "Currently, that results in an orphaned file in S3, which is a waste of storage costs. To resolve this in production, I would implement a cleanup mechanism. The best approach is a scheduled Firebase Cloud Function that runs nightly. When the image is uploaded to S3, it could be tagged as 'unverified'. Once the database write succeeds, a trigger updates that tag. The nightly cron job simply deletes any 'unverified' images older than 24 hours."

**Q3: How do you secure the application? Can a citizen delete another citizen's grievance?**
*Strong Answer:* "In the current prototype, authorization relies heavily on client-side UI hiding, which is insecure. A tech-savvy user could intercept the API calls and modify data. To secure this, the absolute requirement is writing Firestore Security Rules. I would implement rules ensuring that `create` is allowed for authenticated users, but `update` and `delete` are strictly restricted to the user whose `uid` matches the document's `reporterId`, or a user whose `userType` claim is 'admin'."

**Q4: Walk me through the AI Pipeline. How exactly does it process the text?**
*Strong Answer:* "The AI service is built using the Python Pathway framework, which excels at processing data streams. It exposes an ingestion endpoint. When data arrives, it maps it against a User Defined Function (UDF). This function parses the description text for specific high-risk keywords like 'accident' or 'fire' to calculate a severity score. It then takes this enriched data payload and writes it to a specific `processed_grievances` collection in Firestore, which the admin dashboard listens to."

**Q5: The Admin Dashboard needs to show statistics on all grievances. How did you implement this, and what are the scaling concerns?**
*Strong Answer:* "Right now, the dashboard fetches the entire `grievances` collection and calculates the stats using JavaScript array functions like `.filter().length`. At a small scale, this is fine, but at 10,000+ records, this will crash the browser and cause massive database read costs. To scale this, we must shift the computation to the database. We should use Firestore's `count()` aggregation queries to get the numbers without downloading the documents, and implement strict cursor-based pagination for the list view."

---

## PART 27 — FINAL INTERVIEW CHEAT SHEET

- **What you built:** A tri-platform (Citizen Mobile, Staff Mobile, Admin Web) civic grievance management system.
- **The Tech Stack:** React, React Native (Expo), Node.js (Express), Python (Pathway), Firebase Firestore, AWS S3.
- **The Core Architecture:** Serverless data logic (Firebase) + File Upload Microservice (Node) + AI Data Processing Worker (Python).
- **Your Strongest Selling Point:** You understand that building the happy path is easy, but you have the architectural maturity to identify the security gaps (missing DB rules) and scaling bottlenecks (client-side data processing).
- **What to ADMIT:** If they ask to see the code connecting the frontend to the AI pipeline, admit that they are currently decoupled. Explain how you *will* connect them using Firebase Cloud Functions (Triggers).

---
*End of Knowledge Base*
