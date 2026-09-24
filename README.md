# SPOTFIX — Smart Local Issue Reporting & Resolution Platform
> **"Spot it. Track it. Fix it."**

SPOTFIX is a modern full-stack student engineering project demonstrating production-grade software architecture for municipal, campus, and civic problem resolution.

---

## 🌟 Key Capabilities
- 🔐 **Strict Role-Based Access Control (RBAC):** `user` (Citizen), `staff` (Field Technician), and `admin` (Municipal Supervisor).
- 🔄 **Enforced 9-Stage Issue State Machine:**
  $$\text{REPORTED} \to \text{UNDER\_REVIEW} \to \text{APPROVED} \to \text{ASSIGNED} \to \text{ACCEPTED} \to \text{IN\_PROGRESS} \to \text{COMPLETED} \to \text{VERIFICATION\_PENDING} \to \text{RESOLVED}$$
  *(With support for $\text{REOPENED}$, $\text{REJECTED}$, and $\text{CANCELLED}$)*.
- 🧠 **Explainable AI Intelligence:**
  - Automatic category classification based on NLP keyword patterns.
  - Priority suggestion (LOW / MEDIUM / HIGH / CRITICAL) with reasoning.
  - Geospatial Haversine duplicate detection within proximity radiuses.
  - AI natural-language lifecycle history summary generator.
- 📍 **Geospatial Pinning:** Interactive OpenStreetMap & Leaflet integration with single-click GPS locating.
- 📷 **Visual Resolution Proof:** Staff completion photo uploads & citizen verification gate.
- 📊 **Executive Analytics:** Recharts category breakdown, SLA compliance, and staff workload distribution.
- 🔔 **In-App Notification Center:** Real-time state transition alerts and task dispatch warnings.

---

## 🏗️ Technology Stack
- **Frontend:** React.js (Vite), Tailwind CSS, React Router DOM, Axios, Lucide Icons, Leaflet & React-Leaflet, Recharts.
- **Backend:** Node.js, Express.js, MongoDB Atlas (Mongoose ODM), JWT, bcryptjs, Multer, Express Rate Limiter, Morgan.

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| 👑 **ADMIN** | `admin@spotfix.local` | `Admin@1234` | Full review, dispatch, user management & analytics |
| 🛠️ **STAFF (Electrical)** | `staff.electrical@spotfix.local` | `Staff@1234` | Accept jobs, log progress & submit photo proof |
| 🛠️ **STAFF (Roads)** | `staff.roads@spotfix.local` | `Staff@1234` | Repair potholes, asphalt resurfacing |
| 🛠️ **STAFF (Sanitation)** | `staff.sanitation@spotfix.local` | `Staff@1234` | Waste management & drainage clearing |
| 👤 **USER (Rahul)** | `citizen.rahul@spotfix.local` | `User@1234` | Report issues, pin location, verify/reopen |
| 👤 **USER (Priya)** | `citizen.priya@spotfix.local` | `User@1234` | Report issues, track timeline |

*(Note: Fast 1-click demo login buttons are also available on the Login and Landing pages!)*

---

## 🚀 Step-by-Step Manual Running Instructions

### 1. Backend Server Setup
Open a terminal in the `server` folder:
```bash
cd server
npm install
```

#### Seed Demo Database (Categories, Users, Issues, Timeline Histories):
```bash
npm run seed
```

#### Start Backend API Server:
```bash
npm start
```
*The server will run on `http://localhost:5000` (API endpoint: `http://localhost:5000/api`).*

---

### 2. Frontend Client Setup
Open a **second terminal** in the `client` folder:
```bash
cd client
npm install
```

#### Start Frontend Dev Server:
```bash
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `role`, `phone`).
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Retrieve current authenticated user profile (`Bearer <JWT>`).
- `PUT /api/auth/profile` — Update name, phone, or department.
- `POST /api/auth/logout` — Invalidate session.

### Issues & Workflow (`/api/issues`)
- `POST /api/issues` — Submit a new issue report with images and coordinates.
- `GET /api/issues` — Query issues with search, filters (category, status, priority), and pagination.
- `GET /api/issues/:id` — Get full issue details with audit history and comments.
- `PUT /api/issues/:id/status` — Advance issue status through state machine transitions.
- `PUT /api/issues/:id/assign` — *(Admin only)* Assign staff member and set priority.
- `POST /api/issues/:id/verify` — *(User/Admin)* Verify resolution and mark as `RESOLVED`.
- `POST /api/issues/:id/reopen` — *(User/Admin)* Reopen unresolved issue with reason and proof photo.
- `POST /api/issues/:id/comments` — Post discussion or internal staff note.

### Admin Operations (`/api/admin`)
- `GET /api/admin/dashboard` — Metric counters, category/priority distributions, and staff load.
- `GET /api/admin/users` — Paginated user and staff directory.
- `PUT /api/admin/users/:id` — Update user role or department.
- `GET /api/admin/staff` — List active field staff for assignment picker.
- `PUT /api/admin/issues/:id/review` — Approve or reject newly reported issues.

### Staff Operations (`/api/staff`)
- `GET /api/staff/issues` — View assigned task list.
- `PUT /api/staff/issues/:id/accept` — Accept assigned task.
- `PUT /api/staff/issues/:id/start` — Mark active work `IN_PROGRESS`.
- `PUT /api/staff/issues/:id/complete` — Upload resolution proof photo & move to `VERIFICATION_PENDING`.

### AI Assistant (`/api/ai`)
- `POST /api/ai/suggest` — Instant category and priority suggestions from description text.
- `POST /api/ai/check-duplicates` — Proximity and semantic text duplicate detection.
- `GET /api/ai/summary/:issueId` — Generate plain-English lifecycle narrative.

---

## ⚡ Thunder Client / Postman Testing Guide

### 1. Authenticate
- **POST** `http://localhost:5000/api/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "admin@spotfix.local",
    "password": "Admin@1234"
  }
  ```
- **Copy** the returned `data.token`.

### 2. Make Authenticated Requests
- Set Header: `Authorization: Bearer <YOUR_TOKEN>`
- **GET** `http://localhost:5000/api/admin/dashboard`
- **GET** `http://localhost:5000/api/issues?limit=10`
