# Zamanni Community — System Flow & Page-to-Endpoint Map

**Reference:** `doc-guides/NEW_API_INTEGRATION_GUIDE.md`
**API Base URL:** `http://16.171.32.5:8080/api`
**Updated:** 2026-02-22

---

## Table of Contents

1. [End-to-End System Flow](#1-end-to-end-system-flow)
2. [User Roles & What They See](#2-user-roles--what-they-see)
3. [Page-by-Page Endpoint Map](#3-page-by-page-endpoint-map)
4. [Cross-Page Flows (Multi-Step Journeys)](#4-cross-page-flows-multi-step-journeys)
5. [Current Integration Status per Page](#5-current-integration-status-per-page)

---

## 1. End-to-End System Flow

This is how the entire Zamanni platform works from start to finish, broken into phases.

### Phase 1 — Platform Setup (Super Admin)

```
Super Admin logs in
        │
        ▼
POST /login ─────────────────────► Gets JWT token + profile (profileType: "System")
        │
        ▼
Creates a Community
POST /community/new-community ───► Uploads logo, sets address, creates a Community Admin user
        │
        ▼
Configures the community:
├── POST /community/new-collection ──► Creates resident categories (e.g. "Flat Owner", "Tenant")
├── POST /streets ───────────────────► Creates streets within the community
├── POST /access/community-rules ────► Defines access code rules (expiry, usage limits per category)
├── POST /community/new-due ─────────► Creates dues (e.g. "Monthly Service Charge", "Security Levy")
└── POST /config/utilities (×N) ─────► Creates services/utilities (Electricity, Water, Internet, etc.)
        │
        ▼
Configures service pricing:
├── POST /config/utility-products ────► Creates products under each service (plans, packages)
├── POST /config/utility-communities ─► Maps which services are available to which communities
├── POST /config/service-charges ─────► Sets fees per community per service
├── POST /config/product-charges ─────► Sets fees per product
└── POST /config/create-due-profile ──► Defines how due payments are split across wallets
        │
        ▼
Creates admin staff for the community:
POST /users/new-user ────────────────► Creates Community Security, Community Manager, etc.
        │                                (roleName from GET /users/admin-roles)
        ▼
Creates Partners (optional):
POST /partners/create-partner ───────► External service providers or business partners
        │
        ▼
Configures Integrations (optional):
POST /config/integrations ───────────► Payment processor links (Flutterwave, Paystack, etc.)
```

### Phase 2 — Resident Onboarding

```
Resident scans QR code or gets community code
        │
        ▼
GET /community/:id/qrcode ──────────► Shows community name, logo, address, QR code
        │
        ▼
Resident fills registration form
POST /register ──────────────────────► Sends name, email, phone, community ID, street, gender, etc.
        │
        ▼
Resident appears in pending list
GET /residents/pending ──────────────► Community Admin sees them in the Users page
        │
        ▼
Community Admin approves with a category
POST /users/approve ─────────────────► Assigns resident to a category (e.g. "Flat Owner")
        │                                Body: { residentID, categoryID }
        │                                categoryID comes from GET /community/categories
        ▼
System creates wallet for resident (automatic)
        │
        ▼
Resident logs in for the first time
POST /login ─────────────────────────► May return { error, mustChangePassword }
        │
        ▼
Resident sets password
POST /users/set-password ────────────► Changes from default to personal password
```

### Phase 3 — Daily Resident Operations

```
Resident logs in
POST /login ────────────────────────► Gets token + profile with wallet balance
        │
        ├──── Views Dashboard ──────► GET /report/resident/dashboard
        │     Shows: wallet balance, occupant stats, recent transactions, recent access codes
        │
        ├──── Manages Occupants ────► POST /resident/occupant
        │     Add/edit family members, flatmates, employees
        │
        ├──── Generates Access Code ► POST /resident/access/generate-code
        │     For: Visitor, Service Provider, Delivery, Guest
        │     Gets back: { code, message }
        │
        ├──── Views Active Codes ───► GET /resident/access-codes/active
        │     Can cancel: GET /resident/access-codes/:code/cancel
        │
        ├──── Views Dues ───────────► GET /resident/dues
        │     Pays due: POST /resident/pay_due
        │     Body: { product_id, pay_amount, period, request_ref, remarks }
        │
        └──── Uses Services ────────► GET /resident/services
              Pays for utility: POST /resident/vas/pay
              Body: { service_id, service_product_id, amount, password, request_ref, lookup_param }
```

### Phase 4 — Security Gate Operations

```
Security guard logs in (Community Security role)
POST /login ────────────────────────► Gets token with limited permissions
        │
        ▼
Visitor arrives with access code
        │
        ▼
Security validates code
GET /access/:code/validate ─────────► Returns validity, resident info, usage status
        │
        ├── Valid ──► Allow entry
        └── Invalid ► Deny entry
```

### Phase 5 — Community Admin Daily Operations

```
Community Admin logs in
POST /login ────────────────────────► Gets token (profileType: "Community")
        │
        ├──── Dashboard ────────────► (needs: GET /report/admin/dashboard — not yet in API)
        │
        ├──── Manage Users
        │     ├── GET /residents/pending ────────► View pending registrations
        │     ├── POST /users/approve ───────────► Approve with category
        │     ├── GET /community/categories ─────► Get categories for approval dropdown
        │     └── POST /users/new-user ──────────► Create staff (security, manager)
        │         └── GET /users/admin-roles ────► Get available roles
        │
        ├──── Manage Collections/Dues
        │     ├── GET /community/dues ───────────► List all dues
        │     ├── GET /community/due-categories ─► Get due categories
        │     └── POST /community/new-due ───────► Create new due
        │
        ├──── Manage Wallets
        │     ├── GET /wallets ──────────────────► List all wallets
        │     └── PUT /wallets/:name/wallet-by-profile ► Create wallet
        │
        ├──── Access Codes Overview
        │     ├── GET /resident/access-codes/active ─► View active codes
        │     ├── POST /access/generate-codes ───────► Generate bulk codes
        │     └── GET /access/:code/validate ────────► Validate a code
        │
        └──── Community Settings
              ├── POST /community/new-collection ────► Create resident category
              ├── POST /streets ─────────────────────► Create street
              ├── PUT /streets/:id/status/:action ───► Enable/disable street
              └── POST /access/community-rules ──────► Set access code rules
```

### Phase 6 — Super Admin Oversight

```
Super Admin logs in
POST /login ────────────────────────► Gets token (profileType: "System")
        │
        ├──── Dashboard ────────────► Overview of all communities (currently mock data)
        │
        ├──── Communities
        │     ├── GET /community/communities ────► List all communities
        │     ├── POST /community/new-community ► Create community
        │     └── GET /community/:id/qrcode ─────► View QR code
        │
        ├──── Admins ───────────────► (currently mock data, needs admin CRUD endpoints)
        │
        ├──── Users ────────────────► GET /residents/pending + POST /users/approve
        │
        ├──── Utilities/Services Config
        │     ├── GET /config/utilities ──────────► List services
        │     ├── POST /config/utilities ─────────► Create/edit service
        │     ├── GET /config/utility-products ───► List products
        │     ├── POST /config/utility-products ──► Create/edit product
        │     └── ...charges, mappings, profiles
        │
        ├──── Partners
        │     ├── GET /partners ─────────────────► List partners
        │     └── POST /partners/create-partner ─► Create partner
        │
        ├──── Wallets ──────────────► GET /wallets
        │
        └──── Integrations ─────────► GET/POST /config/integrations
```

---

## 2. User Roles & What They See

Based on `src/lib/permissions.ts`, each role sees different sidebar links:

| Sidebar Item | Super Admin | Community Admin | Resident | Developer |
|---|:---:|:---:|:---:|:---:|
| Dashboard | Yes | Yes | Yes | Yes |
| Admins | Yes | — | — | — |
| Communities | Yes | — | — | — |
| Users | Yes | Yes | — | — |
| Collections | — | Yes | — | — |
| Utilities | Yes | — | — | — |
| Wallet | Yes | Yes | — | — |
| Access Codes | Yes | Yes | — | — |
| Audit Logs | Yes | Yes | — | — |

> **Note:** Residents and Developers currently only see the Dashboard. As the resident self-service features are built (dues, services, access codes, occupants), their permissions should be expanded.

---

## 3. Page-by-Page Endpoint Map

### `/` — Login Page

| What it does | Endpoint | Hook | Status |
|---|---|---|---|
| Authenticate user | `POST /login` | `useLogin()` | **LIVE** |
| Redirect on `mustChangePassword` | `POST /users/set-password` | `useSetPassword()` | Hook ready, **no set-password page** |

---

### `/dashboard` — Dashboard

**Current state:** All data is hardcoded (480 users, 16 communities, etc.)

| What it should show | Endpoint needed | Hook | Status |
|---|---|---|---|
| Total users, communities, admins, revenue | **No admin dashboard endpoint exists yet** | — | **BLOCKED — needs backend** |
| Recent communities table | `GET /community/communities` | `useCommunities()` | Hook ready, **not wired** |
| Collections summary grid | `GET /config/utilities` | `useServices()` | Hook ready, **not wired** |

**To make this page live with what we have:**
- Replace the communities table mock data with `useCommunities()` — this works today
- Replace the collections grid with `useServices()` — this works today
- For the 4 stat cards, until the backend builds a dashboard stats endpoint, you could derive counts from existing list endpoints (communities count, pending residents count, wallets count)

---

### `/users` — Users Page

| What it does | Endpoint | Hook | Status |
|---|---|---|---|
| List pending residents | `GET /residents/pending` | `usePendingResidents()` | **LIVE** |
| Get categories (for approve dropdown) | `GET /community/categories` | `useCommunityCategories()` | Hook ready, **not wired here** |
| Approve a resident | `POST /users/approve` | `useApproveResident()` | Hook ready, **not wired** |
| Get available roles | `GET /users/admin-roles` | `useAdminRoles()` | **LIVE** |
| Create user with role | `POST /users/new-user` | `useCreateUserWithRole()` | **LIVE** |
| Check if username exists | `GET /users/:username` | `useCheckUsername()` | Hook ready, **not wired** |

**What's missing to complete this page:**
1. Wire `useApproveResident()` to an "Approve" action button on each pending user row
2. Wire `useCommunityCategories()` to populate the category dropdown in the approve dialog
3. Add `useCheckUsername()` validation to the create-user form's username field
4. The "Active" and "Inactive" tabs have no endpoint — the API only serves pending residents. Need a `GET /residents` or `GET /users` list endpoint from backend (or filter pending list client-side).

---

### `/users/[id]` — User Details

**Current state:** Entirely mock data

| What it should show | Endpoint needed | Hook | Status |
|---|---|---|---|
| User profile info | **No `GET /users/:id` endpoint in new API** | — | **BLOCKED — needs backend** |
| Payment history tab | **No user payment history endpoint** | — | **BLOCKED — needs backend** |
| Access codes tab | `GET /resident/access-codes/active` | `useActiveAccessCodes()` | Hook ready, but scoped to logged-in resident — needs a per-user variant |
| Household / occupants | `POST /resident/occupant` (create only) | `useCreateOrUpdateOccupant()` | No list endpoint for occupants |

**What's needed from backend:**
- `GET /users/:id` — user details
- `GET /users/:id/payments` — payment history
- `GET /users/:id/access-codes` — access codes for a specific user
- `GET /users/:id/occupants` — list occupants for a user

---

### `/communities` — Communities Page

| What it does | Endpoint | Hook | Status |
|---|---|---|---|
| List all communities | `GET /community/communities` | `useCommunities()` | **LIVE** |
| Create community (with logo) | `POST /community/new-community` | `useCreateCommunity()` | **LIVE** |

**Fully working.** Both list and create are wired up.

---

### `/communities/[id]` — Community Details

**Current state:** Mock data for everything except the sidebar info

| What it should show | Endpoint | Hook | Status |
|---|---|---|---|
| Community info (sidebar) | `GET /community/:id/qrcode` | `useCommunityQR(id)` | Hook ready, **not wired** |
| Collections/Dues tab | `GET /community/dues` | `useCommunityDues()` | Hook ready, **not wired** |
| Create Due (dialog) | `POST /community/new-due` | `useCreateDue()` | Hook ready, **not wired** |
| Due categories (for due form) | `GET /community/due-categories` | `useDueCategories()` | Hook ready, **not wired** |
| Access Codes tab | `POST /access/community-rules` | `useCreateAccessRule()` | Hook ready, **not wired** |
| Resident Categories tab | `GET /community/categories` | `useCommunityCategories()` | Hook ready, **not wired** |
| Create Category (dialog) | `POST /community/new-collection` | `useCreateCommunityCategory()` | Hook ready, **not wired** |
| Streets (not shown yet) | `GET /streets/community/:code` | `useCommunityStreets()` | Hook ready, **no tab exists** |
| Create Street | `POST /streets` | `useCreateStreet()` | Hook ready, **no UI** |
| Toggle Street status | `PUT /streets/:id/status/:action` | `useToggleStreetStatus()` | Hook ready, **no UI** |
| Wallets (for due form wallet dropdown) | `GET /wallets` | `useWallets()` | Hook ready, **not wired** |

**What's needed to complete this page (all hooks exist):**
1. Wire `useCommunityQR(id)` to populate the sidebar (name, address, estate ID, QR image)
2. Wire `useCommunityDues()` to the Collections tab table
3. Wire `useCreateDue()` to the Add Dues dialog — also needs `useDueCategories()` for the type dropdown and `useWallets()` for the wallet dropdown
4. Wire `useCommunityCategories()` to the Resident Categories tab
5. Wire `useCreateCommunityCategory()` to the Add Category dialog
6. Add a **Streets tab** using `useCommunityStreets()`, `useCreateStreet()`, `useToggleStreetStatus()`

---

### `/admins` — Admins Page

**Current state:** Entirely mock data (hardcoded array)

| What it should show | Endpoint needed | Hook | Status |
|---|---|---|---|
| List admins | **No `GET /admins` endpoint** | — | **BLOCKED — needs backend** |
| Create admin | `POST /users/new-user` | `useCreateUserWithRole()` | **Hook exists** |
| Get roles for dropdown | `GET /users/admin-roles` | `useAdminRoles()` | **Hook exists** |
| Edit admin | **No `PUT /admins/:id` endpoint** | — | **BLOCKED** |
| Delete admin | **No `DELETE /admins/:id` endpoint** | — | **BLOCKED** |
| Toggle admin status | **No `PATCH /admins/:id/status` endpoint** | — | **BLOCKED** |

**What we CAN do now:**
- Wire the **Create Admin** dialog to use `useCreateUserWithRole()` + `useAdminRoles()` — this already works for creating users with a role
- The admin list itself still needs a backend endpoint to fetch admins

**What's needed from backend:**
- `GET /admins` — list admins (filtered by type/status)
- `PUT /admins/:id` — update admin
- `DELETE /admins/:id` — remove admin

---

### `/wallet` — Wallet Page

**Current state:** Mock data (5 hardcoded wallets)

| What it should show | Endpoint | Hook | Status |
|---|---|---|---|
| List all wallets | `GET /wallets` | `useWallets()` | Hook ready, **not wired** |
| Create wallet | `PUT /wallets/:name/wallet-by-profile` | `useCreateWalletByProfile()` | Hook ready, **not wired** |

**To make this page live:**
1. Replace the mock wallets array with `useWallets()`
2. Wire the Create Wallet dialog to `useCreateWalletByProfile()`
3. Calculate total balance by summing `wallet.availableBalance` across all wallets

---

### `/wallet/[id]` — Wallet Details

**Current state:** Mock data (hardcoded transactions)

| What it should show | Endpoint needed | Hook | Status |
|---|---|---|---|
| Wallet info + balance | `GET /wallets` (filter by ID client-side) | `useWallets()` | Hook ready, **not wired** |
| Transaction history | **No `GET /wallets/:id/transactions` endpoint** | — | **BLOCKED — needs backend** |
| Send to Bank | **No withdrawal endpoint** | — | **BLOCKED** |

**What's needed from backend:**
- `GET /wallets/:id/transactions` — transaction list with pagination + filters
- `POST /wallets/withdraw` — bank transfer out

---

### `/access-codes` — Access Codes Page

| What it does | Endpoint | Hook | Status |
|---|---|---|---|
| List active codes | `GET /resident/access-codes/active` | `useActiveAccessCodes()` | **LIVE** |
| Generate single code | `POST /resident/access/generate-code` | `useGenerateAccessCode()` | **LIVE** |
| Generate bulk codes | `POST /access/generate-codes` | `useGenerateBulkCodes()` | **LIVE** |
| Cancel a code | `GET /resident/access-codes/:code/cancel` | `useCancelAccessCode()` | **LIVE** |
| Validate a code | `GET /access/:code/validate` | `useValidateAccessCode()` | **LIVE** |

**Fully working.** All 5 operations are wired up. The stat cards (total codes, 4/5/6-digit counts) are derived from the active codes list client-side.

---

### `/utilities` — Utilities Page

**Current state:** Hardcoded grid of 6 utility cards

| What it should show | Endpoint | Hook | Status |
|---|---|---|---|
| List services/utilities | `GET /config/utilities` | `useServices()` | Hook ready, **not wired** |
| Service products (per service) | `GET /config/utility-products` | `useServiceProducts()` | Hook ready, **not wired** |
| Community-service mappings | `GET /config/service-communities` | `useServiceCommunities()` | Hook ready, **not wired** |
| Create/edit service | `POST /config/utilities` | `useCreateOrUpdateService()` | Hook ready, **not wired** |
| Create/edit product | `POST /config/utility-products` | `useCreateOrUpdateServiceProduct()` | Hook ready, **not wired** |

**To make this page live:**
1. Replace hardcoded collections with `useServices()` — each service has `name`, `description`, `logoUrl`
2. On click, show service detail with `useServiceProducts()` filtered by service ID
3. Add Create Service dialog using `useCreateOrUpdateService()` (supports logo upload)

---

### Pages That Don't Exist Yet (But Have Backend Support)

| Page | Endpoints Ready | Hooks Ready |
|---|---|---|
| `/partners` | `GET /partners`, `POST /partners/create-partner` | `usePartners()`, `useCreatePartner()` |
| `/resident/dashboard` | `GET /report/resident/dashboard` | `useResidentDashboard()` |
| `/settings/integrations` | `GET /config/integrations`, `POST /config/integrations` | `useIntegrations()`, `useCreateOrUpdateIntegration()` |
| Set Password page | `POST /users/set-password` | `useSetPassword()` |
| Registration page | `POST /register` | `useRegister()` |

---

## 4. Cross-Page Flows (Multi-Step Journeys)

These are operations that span multiple pages and need multiple endpoints working together.

### Flow A: Onboard a New Community (Super Admin)

```
Page: /communities
  └── Click "Create Community"
      └── Dialog needs:
          └── POST /community/new-community (with FormData)
              ▼
Page: /communities/[id]  (navigate here after creation)
  ├── Collections Tab:
  │   └── Click "Add Dues" → needs:
  │       ├── GET /community/due-categories  → populate "Due Type" dropdown
  │       ├── GET /wallets                   → populate "Wallet" dropdown
  │       └── POST /community/new-due        → submit
  │
  ├── Resident Categories Tab:
  │   └── Click "Add Category" → needs:
  │       └── POST /community/new-collection → submit
  │
  └── Streets Tab (needs to be added):
      ├── GET /streets/community/:code       → list
      ├── POST /streets                      → add street
      └── PUT /streets/:id/status/:action    → toggle
```

### Flow B: Approve a New Resident (Community Admin)

```
Page: /users
  └── See pending residents table
      └── GET /residents/pending
          ▼
      Click "Approve" on a row → needs:
      ├── GET /community/categories   → show category picker (Flat Owner, Tenant, etc.)
      └── POST /users/approve         → { residentID, categoryID }
```

### Flow C: Resident Pays a Due

```
Page: /resident/dashboard (future)
  └── GET /report/resident/dashboard → shows dues summary
      ▼
  Click "View Dues"
      └── GET /resident/dues → list of dues with amounts and last payment
          ▼
      Click "Pay" on a due → needs:
      └── POST /resident/pay_due → { product_id, pay_amount, period, request_ref }
```

### Flow D: Resident Generates Access Code for Visitor

```
Page: /access-codes
  └── Click "Generate Code"
      └── Dialog needs:
          ├── Category dropdown: Visitor / Service Provider / Delivery / Guest
          ├── Details (optional JSON)
          └── POST /resident/access/generate-code → { residentID, codeCategory, details }
              ▼
          Returns: { code: "123456", message: "Code generated" }
          ▼
      Code appears in active codes table:
      └── GET /resident/access-codes/active

      Later, at the gate:
      └── Security guard scans/enters code
          └── GET /access/:code/validate → { success, data }
```

### Flow E: Set Up a Utility Service (Super Admin)

```
Page: /utilities
  └── Create a Service:
      └── POST /config/utilities → { name, description, logo }
          ▼
      Create Products under it:
      └── POST /config/utility-products → { service_id, name, amount, label, ... }
          ▼
      Map it to a community:
      └── POST /config/utility-communities → { service_id, community_id, is_active }
          ▼
      Set pricing:
      ├── POST /config/service-charges → { service_id, community_id, fee, fee_type, ... }
      └── POST /config/product-charges → { product_id, fee, fee_type, ... }
          ▼
      Configure payment distribution:
      └── POST /config/create-due-profile → { name, community, category, distributions }
```

### Flow F: Partner Onboarding (Super Admin)

```
Page: /partners (needs to be created)
  └── Click "Add Partner"
      └── POST /partners/create-partner → { name, username, email, phone, address }
          ▼
      Partner appears in list:
      └── GET /partners → includes wallet and user info for each partner
```

---

## 5. Current Integration Status per Page

| Page | Route | API Status | What's Missing |
|---|---|---|---|
| Login | `/` | **LIVE** | Nothing — fully working |
| Dashboard | `/dashboard` | **MOCK** | Wire `useCommunities()` + `useServices()`. Stats need backend endpoint. |
| Users | `/users` | **PARTIAL** | Pending list works. Need approve flow wired + active/inactive user list from backend. |
| User Details | `/users/[id]` | **MOCK** | Needs `GET /users/:id`, payment history, per-user access codes from backend. |
| Communities | `/communities` | **LIVE** | Nothing — fully working |
| Community Details | `/communities/[id]` | **MOCK** | All hooks exist. Wire: QR, dues, categories, streets. No backend gaps. |
| Admins | `/admins` | **MOCK** | Create works via `useCreateUserWithRole()`. List/edit/delete need backend endpoints. |
| Wallet | `/wallet` | **MOCK** | Wire `useWallets()`. Works today. |
| Wallet Details | `/wallet/[id]` | **MOCK** | Needs `GET /wallets/:id/transactions` from backend. |
| Access Codes | `/access-codes` | **LIVE** | Nothing — fully working |
| Utilities | `/utilities` | **MOCK** | Wire `useServices()`. All hooks exist. Works today. |
| Partners | *(no page)* | — | Create page. Hooks exist. |
| Resident Dashboard | *(no page)* | — | Create page. Hook exists. |
| Set Password | *(no page)* | — | Create page. Hook exists. |
| Registration | *(no page)* | — | Create page. Hook exists. |
| Integrations | *(no page)* | — | Create page. Hooks exist. |

### Summary

| Status | Count | Pages |
|---|---|---|
| **LIVE** (fully working) | 3 | Login, Communities list, Access Codes |
| **PARTIAL** (some hooks wired) | 1 | Users |
| **MOCK** (hooks exist, not wired) | 5 | Dashboard, Community Details, Wallet, Utilities, Admins (create only) |
| **BLOCKED** (needs backend endpoints) | 2 | User Details, Wallet Details |
| **NO PAGE** (hooks ready, page needed) | 5 | Partners, Resident Dashboard, Set Password, Registration, Integrations |

### Quick Wins — Pages That Can Go Live Today

These pages have **all hooks ready** and just need the mock data replaced with hook calls:

1. **Dashboard** — Replace communities table with `useCommunities()`, collections grid with `useServices()`
2. **Wallet** — Replace mock wallets with `useWallets()`
3. **Utilities** — Replace hardcoded grid with `useServices()`
4. **Community Details** — Wire `useCommunityQR()`, `useCommunityDues()`, `useCommunityCategories()`, add streets tab
5. **Admins (create only)** — Wire `useCreateUserWithRole()` + `useAdminRoles()` to the create dialog
