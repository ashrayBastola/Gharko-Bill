# GharkoBill — Family Bill & Expense Manager

A household finance app: track bills, payment proofs, budgets, warranties, and
important documents in one shared family ledger.

**Stack:** React 18 + Vite + Tailwind (frontend) · Django + Django REST
Framework + SimpleJWT (backend) · MongoDB-ready, with SQLite as the local fallback.

---

## What was wrong, and what was fixed

The project you uploaded was a partially-built skeleton: most of the pages
and the visual design were already done, but the backend and frontend
weren't actually wired together correctly, and most of the Django apps
(`bills`, `budgets`, `warranties`, `categories`, `notifications`, `expenses`)
were empty stubs with no models, serializers, or endpoints — auto-generated
boilerplate that had never been filled in. It could not run as a working app.

Fixed:

- **Broken auth contract.** The frontend expected `POST /auth/login/` to
  return `{ user, tokens }`, but the backend was using DRF SimpleJWT's raw
  `TokenObtainPairView`, which returns `{ access, refresh }` with no user
  object, and expects `username`/`password` while the custom `User` model
  only had an `email` field. There was also no `/auth/me/` endpoint, though
  the frontend called it on every page load. Rewrote the login/register/me
  views to match what the UI actually needs.
- **Nine missing REST resources.** `Bills`, `Budgets`, `Warranties`,
  `Documents`, `Categories`, `Notifications`, and the household
  members/dashboard/activity views all had frontend pages built against
  them, but zero backend implementation. Built real models, serializers,
  permissions, and views for all of them.
- **Role-based access control.** Only the household admin can verify
  payment proofs, set budgets, or remove members — this is enforced in the
  API (not just hidden in the UI).
- **Household join flow.** Added an `invite_code` on `Family` so the
  "join with a code" option on the registration screen actually works.
- **Default categories & starter data.** New households get a sensible set
  of bill categories (Electricity, Water, Rent, EMI, etc.) automatically.
- **Activity feed & notifications.** Actions (bill added, proof submitted,
  proof verified) now write to an activity log and notify other household
  members, which the Dashboard and Activity pages both depend on.
- **Removed repo bloat.** Stripped `.venv`, `.venv-1`, `node_modules`,
  `dist`, `__pycache__`, `.DS_Store`, and `__MACOSX` from the archive.
- **Verified end-to-end.** Ran real migrations, started the server, and
  exercised every endpoint (register, login, categories, bills, payment
  proof submit + verify, budgets, warranties, documents, notifications,
  activity, dashboard, invite-code join) with `curl` — all pass. The
  frontend builds cleanly with `npm run build`.

### Known scope limits (be aware of these)

The original prompt asked for a fully audited, OWASP-hardened, enterprise
rebuild with Celery-driven reminders, PDF/Excel export, dark mode, activity
archiving, rate limiting, and account lockout. That's a multi-week build,
not something achievable from a skeleton in one pass. What you have now is
a genuinely **working, coherent full-stack app** with the core flows
implemented and API-enforced permissions. Not yet built:

- Email verification, forgot-password flow, and login rate-limiting.
- PDF/Excel report export.
- Celery/Redis-driven reminders (dependencies are in `requirements.txt` but
  no tasks are wired up — nothing breaks without Redis running).
- Dark mode.
- A dedicated `Reports` page (routed to but not in the current navigation).

If you want any of these next, the cleanest path is one feature at a time
against this now-working base, rather than another full rebuild.

---

## Running it locally

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env              # set USE_MONGODB=True for MongoDB

python manage.py migrate
python manage.py createsuperuser  # optional, for /admin/
python manage.py runserver
```

Backend runs at `http://localhost:8000`. Uploaded files are stored in
`backend/media/`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

### First use

1. Open `http://localhost:5173`, click **Create household**, and sign up —
   this makes you the household admin.
2. Copy the invite code from the **Family** page and use it on the
   **Register → Join with code** tab (in another browser/incognito window)
   to add a second member and see the member-vs-admin permission
   differences in action.

### Using MongoDB

```bash
docker compose up -d mongo
```

Set these values in `backend/.env`:

```env
USE_MONGODB=True
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_NAME=gharkobill
```

Then run `python manage.py migrate` and start the backend. The official Django
MongoDB backend stores the existing Django models in MongoDB collections.

### Using PostgreSQL instead of MongoDB

```bash
docker-compose up -d          # starts Postgres + Redis
```

Then in `backend/.env`, set `USE_MONGODB=False`, uncomment the `DB_*` lines, `python manage.py
migrate` again, and restart the server.

---

## Project structure

```
GharkoBill/
├── backend/
│   ├── config/            settings, root urls
│   └── apps/
│       ├── authentication/  login, register, /me
│       ├── users/           custom User model
│       ├── family/          Family, FamilyMember, dashboard, invite codes
│       ├── categories/      bill categories (with sensible defaults)
│       ├── bills/            Bill + BillProof (payment verification flow)
│       ├── budgets/          monthly limits vs. actual spend
│       ├── warranties/       product warranty tracking
│       ├── expenses/         document vault (ID, insurance, contracts…)
│       ├── notifications/    per-user notification feed
│       ├── core/             shared base models, permissions, activity log
│       └── reports/          scaffolded, not yet wired to a route
└── frontend/
    └── src/
        ├── api/            axios client with JWT refresh
        ├── context/        auth context
        ├── components/     layout, shared UI, protected routes
        └── pages/           Dashboard, Bills, Budgets, Warranties, Documents,
                              Notifications, Activity, Family, Settings, Auth
```
