<<<<<<< HEAD
# Parivartan – Civic Issue Reporting App

Parivartan is a full-stack civic grievance management platform consisting of:

- **Express.js backend** – REST API (Node.js)
- **React web dashboard** – Staff/department portal (`portal/`)
- **Expo React Native mobile app** – Citizen-facing app (`parivartan-citizen-app/`)
- **Pathway real-time processing service** – Streaming pipeline (`pathway-service/`)

Expo config files such as `app.json` and `eas.json` belong inside the mobile app folders, not in the repository root.

---

## Quick Start (Backend + Pathway)

### 1. Firebase credentials

Place your Firebase service-account JSON at `backend/config/serviceAccountKey.json`
(used by both the Express backend and the Pathway service).

### 2. Express backend

```bash
npm install --prefix backend
npm start           # http://localhost:5000
```

From the repo root, `npm start` launches the backend and `npm run portal:dev` launches the web portal.

### 3. Pathway real-time processing service

```bash
cd pathway-service
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Optional: copy env template and customise
cp .env.example .env

python main.py
```

The service prints:

```
[Pathway] Pipeline starting …
          REST input  → POST http://localhost:8080/
          SSE output  → http://localhost:8081/stream
          Firestore   → enabled
```

### 4. Connect Express → Pathway (optional forwarding)

Add to the Express backend's `.env`:

```
PATHWAY_SERVICE_URL=http://localhost:8080/
```

When set, every new issue submitted via `POST /api/issues` is automatically forwarded to the Pathway pipeline for enrichment and written to the `processed_grievances` Firestore collection.

---

## How the Pathway Pipeline Works

```
Citizen App  →  POST /api/issues (Express)
                       │
                       ├─ saves raw grievance to Firestore `grievances`
                       │
                       └─ forwards to Pathway REST connector (:8080)
                                    │
                           Pathway UDFs compute:
                             • severity  (high / medium / low)
                             • category  (from department code)
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
              Firestore `processed_            SSE /stream
              grievances` collection          (:8081)
```

1. **Input** – `pw.io.http.rest_connector` creates an HTTP endpoint that accepts `POST /` with issue JSON. Pathway automatically ingests each new message into a streaming table.

2. **Enrichment** – Two `@pw.udf` functions run over the streaming table:
   - `compute_severity` – keyword-based severity scoring
   - `compute_category` – maps department codes to readable category names

3. **Output** – `pw.io.subscribe` callback writes every enriched row to:
   - **Firestore** `processed_grievances` collection (real-time, auto-subscribed by frontend)
   - **SSE endpoint** `GET http://localhost:8081/stream` (for any non-Firebase consumer)

No restart is required; Pathway's streaming model propagates updates automatically.

---

## Demonstrating Real-Time Updates

With the Pathway service running, execute the demo script:

```bash
cd pathway-service
python demo.py
```

Expected output:

```
[POST] Submitted 'Dangerous pothole on highway' → HTTP 200
[POST] Submitted 'Street light not working'     → HTTP 200

[SSE] ✅ Enriched issue #1 received:
      title     : Dangerous pothole on highway
      severity  : high
      category  : Road Infrastructure
      processed : 2025-01-01T10:00:00+00:00

[SSE] ✅ Enriched issue #2 received:
      title     : Street light not working
      severity  : medium
      category  : Municipal Services
      processed : 2025-01-01T10:00:01+00:00

[Demo] All issues processed and streamed. ✅
```

Adding new issues (via the demo script, the mobile app, or `curl`) automatically triggers enrichment **without restarting** the service.

---

## Environment Variables

### Pathway service (`pathway-service/.env`)

| Variable               | Default                              | Description                              |
|------------------------|--------------------------------------|------------------------------------------|
| `PATHWAY_PORT`         | `8080`                               | Pathway REST input port                  |
| `PATHWAY_SSE_PORT`     | `8081`                               | SSE output port                          |
| `FIREBASE_CREDENTIALS` | `../backend/config/serviceAccountKey.json` | Path to Firebase service-account JSON    |

### Express backend (`.env`)

| Variable               | Default | Description                                         |
|------------------------|---------|-----------------------------------------------------|
| `PORT`                 | `5000`  | Express server port                                 |
| `PATHWAY_SERVICE_URL`  | *(none)*| If set, issues are forwarded to Pathway after save  |

---

## Mobile App Setup

See [`parivartan-citizen-app/README.md`](parivartan-citizen-app/README.md) for Google OAuth and Expo configuration.

The web portal now lives in [`portal/`](portal/) and its React source is under [`portal/src/`](portal/src/).
=======
# Parivartan.
>>>>>>> 45c5b37bc2a23f132b75a92313651f596b5429ab
