# Hostel Management System

Fullstack hostel management system built with Next.js to manage students living in blocks HA to HH. The app features authentication, a dashboard overview, and full CRUD operations for residents.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000 to access the app.

### Demo Credentials

- Hostel Warden (view only): `warden` / `hostel123`
- Admin (full access): `admin` / `admin123`

## Features

- Login page that gates access to the dashboard
- Dashboard overview highlighting total residents, block distribution, gender, and residency mix
- Dedicated students workspace with full CRUD + rich filtering (block, gender, residency, search) and sorting controls
- Student CRUD with validation for all required fields (ID, name, programme, block, room, gender, residency)
- API routes backed by a JSON file (`data/students.json`) generated from the official occupancy workbook

## Project Structure

- `app/` – Next.js App Router pages and API routes
- `components/` – Reusable UI components
- `data/studentdata.xlsx` – Source workbook delivered by the accommodation team
- `data/students.json` – Simple JSON datastore for demo purposes (auto-generated)
- `lib/studentStore.ts` – File-based persistence helpers used by the API routes
- `scripts/convert_studentdata.py` – Helper that converts the workbook into the JSON datastore used by the app

## Updating the data

1. Replace `data/studentdata.xlsx` with the latest file from the accommodation team.
2. Run `python scripts/convert_studentdata.py`.
3. The script extracts every "CHECKED IN" resident, keeps the official Student ID in `studentId`, generates a stable unique `id` (based on Student ID + room) for app-side CRUD, normalises room numbers, infers residency (local/international) from nationality, and rewrites `data/students.json`.
4. Restart the dev server so the API re-reads the refreshed JSON.
